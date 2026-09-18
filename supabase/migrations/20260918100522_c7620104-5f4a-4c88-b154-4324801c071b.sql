-- ========== ENUMS ==========
CREATE TYPE public.app_role AS ENUM ('owner','manager','receptionist','housekeeping','guest');
CREATE TYPE public.room_status AS ENUM ('available','reserved','occupied','cleaning','maintenance','out_of_service');
CREATE TYPE public.booking_status AS ENUM ('pending','confirmed','checked_in','checked_out','cancelled','no_show');
CREATE TYPE public.payment_method AS ENUM ('mpesa','card','bank_transfer','cash');
CREATE TYPE public.payment_status AS ENUM ('pending','paid','failed','refunded');
CREATE TYPE public.service_request_status AS ENUM ('requested','in_progress','done','cancelled');
CREATE TYPE public.housekeeping_status AS ENUM ('dirty','assigned','in_progress','inspected','ready');
CREATE TYPE public.ticket_priority AS ENUM ('low','medium','high','urgent');
CREATE TYPE public.ticket_status AS ENUM ('open','in_progress','resolved','closed');
CREATE TYPE public.discount_type AS ENUM ('percent','fixed');

-- ========== HELPERS ==========
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ========== PROFILES ==========
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  full_name text NOT NULL DEFAULT '',
  email text,
  phone text,
  avatar_url text,
  loyalty_points integer NOT NULL DEFAULT 0,
  notification_prefs jsonb NOT NULL DEFAULT '{"email":true,"sms":true,"whatsapp":false,"in_app":true}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========== ROLES ==========
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('owner','manager','receptionist','housekeeping'))
$$;
CREATE OR REPLACE FUNCTION public.is_manager(_user_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('owner','manager'))
$$;
CREATE OR REPLACE FUNCTION public.my_roles() RETURNS SETOF public.app_role
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid()
$$;

-- first authenticated user to call this becomes owner (bootstrap only)
CREATE OR REPLACE FUNCTION public.claim_owner() RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'owner') THEN RETURN false; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'owner') ON CONFLICT DO NOTHING;
  RETURN true;
END; $$;

-- profile + guest role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)), NEW.email, NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'guest') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE POLICY "profiles_select_own_or_staff" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own_or_manager" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.is_manager(auth.uid()));

CREATE POLICY "roles_select_own_or_staff" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "roles_manage_by_manager" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.is_manager(auth.uid()) AND (role <> 'owner' OR public.has_role(auth.uid(),'owner')));
CREATE POLICY "roles_delete_by_manager" ON public.user_roles FOR DELETE TO authenticated USING (public.is_manager(auth.uid()) AND role <> 'owner');

-- ========== PROPERTIES / ROOM TYPES / ROOMS ==========
CREATE TABLE public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  tagline text,
  description text,
  address text,
  city text NOT NULL DEFAULT 'Nairobi',
  phone text,
  email text,
  check_in_time text NOT NULL DEFAULT '14:00',
  check_out_time text NOT NULL DEFAULT '10:00',
  latitude numeric,
  longitude numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.properties TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.properties TO authenticated;
GRANT ALL ON public.properties TO service_role;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "properties_public_read" ON public.properties FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "properties_manager_write" ON public.properties FOR ALL TO authenticated USING (public.is_manager(auth.uid())) WITH CHECK (public.is_manager(auth.uid()));

CREATE TABLE public.room_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  base_price numeric NOT NULL DEFAULT 0,
  max_guests integer NOT NULL DEFAULT 2,
  beds text NOT NULL DEFAULT '1 bed',
  view_label text,
  amenities text[] NOT NULL DEFAULT '{}',
  image_key text,
  gallery_keys text[] NOT NULL DEFAULT '{}',
  house_rules text[] NOT NULL DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.room_types TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.room_types TO authenticated;
GRANT ALL ON public.room_types TO service_role;
ALTER TABLE public.room_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "room_types_public_read" ON public.room_types FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "room_types_manager_write" ON public.room_types FOR ALL TO authenticated USING (public.is_manager(auth.uid())) WITH CHECK (public.is_manager(auth.uid()));
CREATE TRIGGER room_types_updated_at BEFORE UPDATE ON public.room_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  room_type_id uuid NOT NULL REFERENCES public.room_types(id) ON DELETE CASCADE,
  number text NOT NULL,
  floor integer NOT NULL DEFAULT 1,
  status public.room_status NOT NULL DEFAULT 'available',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (property_id, number)
);
GRANT SELECT ON public.rooms TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rooms TO authenticated;
GRANT ALL ON public.rooms TO service_role;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rooms_public_read" ON public.rooms FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "rooms_staff_update" ON public.rooms FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "rooms_manager_insert" ON public.rooms FOR INSERT TO authenticated WITH CHECK (public.is_manager(auth.uid()));
CREATE POLICY "rooms_manager_delete" ON public.rooms FOR DELETE TO authenticated USING (public.is_manager(auth.uid()));
CREATE TRIGGER rooms_updated_at BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========== BOOKINGS ==========
CREATE SEQUENCE public.booking_ref_seq START 10492;
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE DEFAULT ('CM-' || nextval('public.booking_ref_seq')::text),
  guest_id uuid,
  property_id uuid NOT NULL REFERENCES public.properties(id),
  room_type_id uuid NOT NULL REFERENCES public.room_types(id),
  room_id uuid REFERENCES public.rooms(id) ON DELETE SET NULL,
  check_in date NOT NULL,
  check_out date NOT NULL,
  guests integer NOT NULL DEFAULT 1,
  status public.booking_status NOT NULL DEFAULT 'pending',
  nights integer GENERATED ALWAYS AS (GREATEST(check_out - check_in, 1)) STORED,
  room_total numeric NOT NULL DEFAULT 0,
  services_total numeric NOT NULL DEFAULT 0,
  discount_total numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  promo_code text,
  guest_name text,
  guest_email text,
  guest_phone text,
  special_requests text,
  cancellation_reason text,
  checked_in_at timestamptz,
  checked_out_at timestamptz,
  checked_in_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bookings_dates CHECK (check_out > check_in)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookings_select_own_or_staff" ON public.bookings FOR SELECT TO authenticated USING (guest_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "bookings_insert_own_or_staff" ON public.bookings FOR INSERT TO authenticated WITH CHECK (guest_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "bookings_update_own_or_staff" ON public.bookings FOR UPDATE TO authenticated USING (guest_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "bookings_delete_manager" ON public.bookings FOR DELETE TO authenticated USING (public.is_manager(auth.uid()));
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX bookings_dates_idx ON public.bookings (room_type_id, check_in, check_out);

-- ========== PAYMENTS ==========
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  guest_id uuid,
  amount numeric NOT NULL,
  method public.payment_method NOT NULL DEFAULT 'mpesa',
  status public.payment_status NOT NULL DEFAULT 'pending',
  reference text,
  phone text,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments_select_own_or_staff" ON public.payments FOR SELECT TO authenticated USING (guest_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "payments_insert_own_or_staff" ON public.payments FOR INSERT TO authenticated WITH CHECK (guest_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "payments_update_staff" ON public.payments FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));

-- ========== SERVICES ==========
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'stay',
  price numeric NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "services_public_read" ON public.services FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "services_manager_write" ON public.services FOR ALL TO authenticated USING (public.is_manager(auth.uid())) WITH CHECK (public.is_manager(auth.uid()));

CREATE TABLE public.service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  guest_id uuid,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  title text NOT NULL,
  notes text,
  price numeric NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 1,
  status public.service_request_status NOT NULL DEFAULT 'requested',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.service_requests TO authenticated;
GRANT ALL ON public.service_requests TO service_role;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sr_select_own_or_staff" ON public.service_requests FOR SELECT TO authenticated USING (guest_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "sr_insert_own_or_staff" ON public.service_requests FOR INSERT TO authenticated WITH CHECK (guest_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "sr_update_own_or_staff" ON public.service_requests FOR UPDATE TO authenticated USING (guest_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE TRIGGER sr_updated_at BEFORE UPDATE ON public.service_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========== HOUSEKEEPING ==========
CREATE TABLE public.housekeeping_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  assigned_to uuid,
  status public.housekeeping_status NOT NULL DEFAULT 'dirty',
  task_type text NOT NULL DEFAULT 'Full turnover',
  checklist jsonb NOT NULL DEFAULT '{"bed_changed":false,"bathroom_cleaned":false,"towels_replaced":false,"toiletries_replaced":false,"floor_cleaned":false,"windows_checked":false,"damages_checked":false}'::jsonb,
  notes text,
  damage_report text,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.housekeeping_tasks TO authenticated;
GRANT ALL ON public.housekeeping_tasks TO service_role;
ALTER TABLE public.housekeeping_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hk_staff_all" ON public.housekeeping_tasks FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER hk_updated_at BEFORE UPDATE ON public.housekeeping_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========== MAINTENANCE ==========
CREATE SEQUENCE public.ticket_no_seq START 1042;
CREATE TABLE public.maintenance_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_no integer NOT NULL UNIQUE DEFAULT nextval('public.ticket_no_seq'),
  room_id uuid REFERENCES public.rooms(id) ON DELETE SET NULL,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  reported_by uuid,
  title text NOT NULL,
  description text,
  priority public.ticket_priority NOT NULL DEFAULT 'medium',
  status public.ticket_status NOT NULL DEFAULT 'open',
  assigned_to text,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.maintenance_tickets TO authenticated;
GRANT ALL ON public.maintenance_tickets TO service_role;
ALTER TABLE public.maintenance_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mt_select_own_or_staff" ON public.maintenance_tickets FOR SELECT TO authenticated USING (reported_by = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "mt_insert_any_auth" ON public.maintenance_tickets FOR INSERT TO authenticated WITH CHECK (reported_by = auth.uid());
CREATE POLICY "mt_update_staff" ON public.maintenance_tickets FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));
CREATE TRIGGER mt_updated_at BEFORE UPDATE ON public.maintenance_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========== PROMOTIONS ==========
CREATE TABLE public.promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  discount_type public.discount_type NOT NULL DEFAULT 'percent',
  discount_value numeric NOT NULL,
  valid_from date,
  valid_to date,
  min_nights integer NOT NULL DEFAULT 1,
  weekend_only boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.promotions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promotions TO authenticated;
GRANT ALL ON public.promotions TO service_role;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "promotions_public_read_active" ON public.promotions FOR SELECT TO anon, authenticated USING (active = true OR public.is_manager(auth.uid()));
CREATE POLICY "promotions_manager_write" ON public.promotions FOR ALL TO authenticated USING (public.is_manager(auth.uid())) WITH CHECK (public.is_manager(auth.uid()));

-- ========== REVIEWS ==========
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  guest_id uuid NOT NULL,
  room_type_id uuid REFERENCES public.room_types(id) ON DELETE SET NULL,
  guest_name text NOT NULL DEFAULT 'Guest',
  overall integer NOT NULL CHECK (overall BETWEEN 1 AND 5),
  cleanliness integer NOT NULL DEFAULT 5 CHECK (cleanliness BETWEEN 1 AND 5),
  service integer NOT NULL DEFAULT 5 CHECK (service BETWEEN 1 AND 5),
  location integer NOT NULL DEFAULT 5 CHECK (location BETWEEN 1 AND 5),
  comfort integer NOT NULL DEFAULT 5 CHECK (comfort BETWEEN 1 AND 5),
  comment text,
  response text,
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_public_read" ON public.reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "reviews_insert_own" ON public.reviews FOR INSERT TO authenticated WITH CHECK (guest_id = auth.uid());
CREATE POLICY "reviews_update_own_or_manager" ON public.reviews FOR UPDATE TO authenticated USING (guest_id = auth.uid() OR public.is_manager(auth.uid()));

-- ========== NOTIFICATIONS / MESSAGES ==========
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text,
  kind text NOT NULL DEFAULT 'info',
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif_select_own" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notif_update_own" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notif_insert_staff_or_self" ON public.notifications FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR public.is_staff(auth.uid()));

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id uuid NOT NULL,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  sender_id uuid NOT NULL,
  from_staff boolean NOT NULL DEFAULT false,
  body text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "msg_select_own_or_staff" ON public.messages FOR SELECT TO authenticated USING (guest_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "msg_insert_own_or_staff" ON public.messages FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid() AND (guest_id = auth.uid() OR public.is_staff(auth.uid())));
CREATE POLICY "msg_update_own_or_staff" ON public.messages FOR UPDATE TO authenticated USING (guest_id = auth.uid() OR public.is_staff(auth.uid()));
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- ========== LOYALTY / CMS / AUDIT ==========
CREATE TABLE public.loyalty_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  points integer NOT NULL,
  reason text NOT NULL,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.loyalty_transactions TO authenticated;
GRANT ALL ON public.loyalty_transactions TO service_role;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "loyalty_select_own_or_staff" ON public.loyalty_transactions FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "loyalty_insert_own_or_staff" ON public.loyalty_transactions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR public.is_staff(auth.uid()));

CREATE TABLE public.cms_content (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cms_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_content TO authenticated;
GRANT ALL ON public.cms_content TO service_role;
ALTER TABLE public.cms_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cms_public_read" ON public.cms_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "cms_manager_write" ON public.cms_content FOR ALL TO authenticated USING (public.is_manager(auth.uid())) WITH CHECK (public.is_manager(auth.uid()));

CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_select_manager" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_manager(auth.uid()));
CREATE POLICY "audit_insert_auth" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (actor_id = auth.uid());

-- ========== AUTOMATION TRIGGERS ==========
-- booking status side effects
CREATE OR REPLACE FUNCTION public.on_booking_status_change() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'checked_in' AND NEW.room_id IS NOT NULL THEN
      UPDATE public.rooms SET status = 'occupied' WHERE id = NEW.room_id;
      NEW.checked_in_at = COALESCE(NEW.checked_in_at, now());
      NEW.checked_in_by = COALESCE(NEW.checked_in_by, auth.uid());
      IF NEW.guest_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, title, body, kind) VALUES (NEW.guest_id, 'Welcome to Casa Mumo Airbnbs', 'You are checked in. Enjoy your stay!', 'checkin');
      END IF;
    ELSIF NEW.status = 'checked_out' AND NEW.room_id IS NOT NULL THEN
      UPDATE public.rooms SET status = 'cleaning' WHERE id = NEW.room_id;
      NEW.checked_out_at = COALESCE(NEW.checked_out_at, now());
      INSERT INTO public.housekeeping_tasks (room_id, booking_id, status) VALUES (NEW.room_id, NEW.id, 'dirty');
      IF NEW.guest_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, title, body, kind) VALUES (NEW.guest_id, 'Thank you for staying with us', 'We hope you enjoyed Casa Mumo. Please leave a review!', 'review');
      END IF;
    ELSIF NEW.status = 'confirmed' THEN
      IF NEW.room_id IS NOT NULL THEN UPDATE public.rooms SET status = 'reserved' WHERE id = NEW.room_id AND status = 'available'; END IF;
      IF NEW.guest_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, title, body, kind) VALUES (NEW.guest_id, 'Booking confirmed', 'Your booking ' || NEW.reference || ' is confirmed.', 'booking');
      END IF;
    ELSIF NEW.status IN ('cancelled','no_show') THEN
      IF NEW.room_id IS NOT NULL THEN UPDATE public.rooms SET status = 'available' WHERE id = NEW.room_id AND status = 'reserved'; END IF;
      IF NEW.guest_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, title, body, kind) VALUES (NEW.guest_id, 'Booking ' || NEW.status, 'Booking ' || NEW.reference || ' has been marked ' || NEW.status || '.', 'booking');
      END IF;
    END IF;
    INSERT INTO public.audit_logs (actor_id, action, entity, entity_id, details) VALUES (auth.uid(), 'booking.status', 'booking', NEW.reference, jsonb_build_object('from', OLD.status, 'to', NEW.status));
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER bookings_status_change BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.on_booking_status_change();

CREATE OR REPLACE FUNCTION public.on_booking_created() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.guest_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, body, kind) VALUES (NEW.guest_id, 'Booking received', 'We received booking ' || NEW.reference || '. We will confirm shortly.', 'booking');
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER bookings_created AFTER INSERT ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.on_booking_created();

-- housekeeping ready -> room available
CREATE OR REPLACE FUNCTION public.on_housekeeping_done() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'ready' AND OLD.status IS DISTINCT FROM 'ready' THEN
    NEW.completed_at = now();
    UPDATE public.rooms SET status = 'available' WHERE id = NEW.room_id AND status = 'cleaning';
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER hk_done BEFORE UPDATE ON public.housekeeping_tasks FOR EACH ROW EXECUTE FUNCTION public.on_housekeeping_done();

-- maintenance: open high/urgent -> room maintenance; resolved -> available
CREATE OR REPLACE FUNCTION public.on_ticket_change() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IN ('resolved','closed') AND (TG_OP = 'INSERT' OR OLD.status NOT IN ('resolved','closed')) THEN
    NEW.resolved_at = COALESCE(NEW.resolved_at, now());
    IF NEW.room_id IS NOT NULL THEN UPDATE public.rooms SET status = 'available' WHERE id = NEW.room_id AND status = 'maintenance'; END IF;
  ELSIF NEW.status IN ('open','in_progress') AND NEW.priority IN ('high','urgent') AND NEW.room_id IS NOT NULL THEN
    UPDATE public.rooms SET status = 'maintenance' WHERE id = NEW.room_id AND status IN ('available','cleaning');
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER ticket_change BEFORE INSERT OR UPDATE ON public.maintenance_tickets FOR EACH ROW EXECUTE FUNCTION public.on_ticket_change();

-- payments paid -> loyalty points
CREATE OR REPLACE FUNCTION public.on_payment_paid() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE pts integer;
BEGIN
  IF NEW.status = 'paid' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'paid') THEN
    NEW.paid_at = COALESCE(NEW.paid_at, now());
    IF NEW.guest_id IS NOT NULL THEN
      pts := floor(NEW.amount / 100);
      INSERT INTO public.loyalty_transactions (user_id, points, reason, booking_id) VALUES (NEW.guest_id, pts, 'Payment', NEW.booking_id);
      UPDATE public.profiles SET loyalty_points = loyalty_points + pts WHERE id = NEW.guest_id;
      INSERT INTO public.notifications (user_id, title, body, kind) VALUES (NEW.guest_id, 'Payment received', 'KSh ' || to_char(NEW.amount, 'FM999,999,999') || ' received. You earned ' || pts || ' points.', 'payment');
    END IF;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER payment_paid BEFORE INSERT OR UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.on_payment_paid();

-- audit price + role changes
CREATE OR REPLACE FUNCTION public.audit_price_change() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.base_price IS DISTINCT FROM OLD.base_price THEN
    INSERT INTO public.audit_logs (actor_id, action, entity, entity_id, details) VALUES (auth.uid(), 'room_type.price', 'room_type', NEW.name, jsonb_build_object('from', OLD.base_price, 'to', NEW.base_price));
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER room_types_audit AFTER UPDATE ON public.room_types FOR EACH ROW EXECUTE FUNCTION public.audit_price_change();

CREATE OR REPLACE FUNCTION public.audit_role_change() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.audit_logs (actor_id, action, entity, entity_id, details)
  VALUES (auth.uid(), 'role.' || lower(TG_OP), 'user', COALESCE(NEW.user_id, OLD.user_id)::text, jsonb_build_object('role', COALESCE(NEW.role, OLD.role)));
  RETURN COALESCE(NEW, OLD);
END; $$;
CREATE TRIGGER user_roles_audit AFTER INSERT OR DELETE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.audit_role_change();

-- availability helper (public)
CREATE OR REPLACE FUNCTION public.available_room_count(_room_type_id uuid, _check_in date, _check_out date) RETURNS integer
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT (SELECT count(*) FROM public.rooms r WHERE r.room_type_id = _room_type_id AND r.status <> 'out_of_service')::int
       - (SELECT count(*) FROM public.bookings b WHERE b.room_type_id = _room_type_id AND b.status IN ('pending','confirmed','checked_in') AND b.check_in < _check_out AND b.check_out > _check_in)::int
$$;
GRANT EXECUTE ON FUNCTION public.available_room_count(uuid, date, date) TO anon, authenticated;

-- ========== SEED ==========
INSERT INTO public.properties (id, name, slug, tagline, description, address, city, phone, email, check_in_time, check_out_time, latitude, longitude) VALUES
('11111111-1111-1111-1111-111111111111', 'Casa Mumo Airbnbs', 'casa-mumo', 'A slow morning, warm light, and a room that feels like yours.', 'Casa Mumo is a small guesthouse above the Nairobi ridge — hand-thrown ceramics, eucalyptus air, and breakfast that lingers. Book by the night, pay with M-Pesa or card.', 'Longi Valley Road, Karen', 'Nairobi', '+254 700 000 000', 'stay@casamumo.co.ke', '14:00', '10:00', -1.3197, 36.7073);

INSERT INTO public.room_types (id, property_id, name, slug, description, base_price, max_guests, beds, view_label, amenities, image_key, house_rules, sort_order) VALUES
('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111111', 'Garden Studio', 'garden-studio', 'A calm ground-floor studio opening onto the eucalyptus garden. King bed, terracotta throws and a private terrace for slow breakfasts.', 8500, 2, '1 king bed', 'garden view', ARRAY['Wi-Fi','Breakfast included','Private terrace','Rain shower','Workspace','Ceiling fan'], 'garden-studio', ARRAY['No smoking indoors','Quiet hours 22:00–07:00','No parties'], 1),
('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111111', 'Savannah Suite', 'savannah-suite', 'Our largest room with a reading nook, woven textures and a wide window over the valley. Ideal for small families or long stays.', 12000, 3, '1 queen + 1 single', 'valley view', ARRAY['Wi-Fi','Breakfast included','Reading nook','Bathtub','Smart TV','Mini fridge','Desk'], 'savannah-suite', ARRAY['No smoking indoors','Quiet hours 22:00–07:00','Children welcome'], 2),
('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111111', 'Clay Loft', 'clay-loft', 'Top-floor loft with textured clay walls, a low platform bed and a warm pendant glow. The most private room in the house.', 15500, 2, '1 king bed', 'top floor', ARRAY['Wi-Fi','Breakfast included','Rooftop access','Rain shower','Espresso machine','Smart TV','Bluetooth speaker'], 'clay-loft', ARRAY['No smoking indoors','Adults only','Quiet hours 22:00–07:00'], 3);

INSERT INTO public.rooms (property_id, room_type_id, number, floor, status) VALUES
('11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222201','101',1,'available'),
('11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222201','102',1,'available'),
('11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222201','103',1,'cleaning'),
('11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222201','104',1,'maintenance'),
('11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222202','201',2,'available'),
('11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222202','202',2,'available'),
('11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222202','204',2,'available'),
('11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222203','301',3,'available'),
('11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222203','302',3,'out_of_service');

INSERT INTO public.services (property_id, name, description, category, price, sort_order) VALUES
('11111111-1111-1111-1111-111111111111','Breakfast','Continental breakfast served 7–10 AM','food',1500,1),
('11111111-1111-1111-1111-111111111111','Lunch / Dinner','Chef''s set menu, per person','food',2500,2),
('11111111-1111-1111-1111-111111111111','Airport transfer','Private car to/from JKIA','transport',3500,3),
('11111111-1111-1111-1111-111111111111','Car hire','Per day with driver','transport',8000,4),
('11111111-1111-1111-1111-111111111111','Laundry','Per bag, returned within 24h','stay',1200,5),
('11111111-1111-1111-1111-111111111111','Late checkout','Until 2 PM','stay',2000,6),
('11111111-1111-1111-1111-111111111111','Extra bed','Per night','stay',2500,7),
('11111111-1111-1111-1111-111111111111','Romantic room setup','Flowers, candles & sparkling wine','experience',6000,8),
('11111111-1111-1111-1111-111111111111','Nairobi tour package','Half-day guided tour','experience',9500,9),
('11111111-1111-1111-1111-111111111111','Room service','Per order','food',500,10),
('11111111-1111-1111-1111-111111111111','Extra towels','Complimentary','stay',0,11),
('11111111-1111-1111-1111-111111111111','Room cleaning','Complimentary mid-stay clean','stay',0,12);

INSERT INTO public.promotions (code, name, description, discount_type, discount_value, weekend_only, min_nights, valid_to) VALUES
('WEEKEND20','Weekend escape','20% off Friday–Sunday bookings','percent',20,true,1,'2027-12-31'),
('EARLYBIRD15','Early bird','15% off when booked 30+ days ahead','percent',15,false,1,'2027-12-31'),
('LONGSTAY','Long stay','KSh 5,000 off stays of 5+ nights','fixed',5000,false,5,'2027-12-31'),
('WELCOMEBACK','Returning guest','10% off for returning guests','percent',10,false,1,'2027-12-31');

INSERT INTO public.cms_content (key, value) VALUES
('home', '{"eyebrow":"Weekend escape · Longi Valley","headline":"A slow morning, warm light, and a room that feels like yours.","intro":"Casa Mumo is a small guesthouse above the Nairobi ridge — hand-thrown ceramics, eucalyptus air, and breakfast that lingers. Book by the night, pay with M-Pesa or card."}'::jsonb),
('about', '{"title":"About Casa Mumo","body":"Casa Mumo began as a family home in Karen and grew into a nine-room guesthouse. We keep things small on purpose: real breakfast, real people, and rooms designed to slow you down."}'::jsonb),
('contact', '{"phone":"+254 700 000 000","email":"stay@casamumo.co.ke","whatsapp":"+254 700 000 000","address":"Longi Valley Road, Karen, Nairobi"}'::jsonb),
('faqs', '[{"q":"What time is check-in?","a":"Check-in is from 2:00 PM and check-out is by 10:00 AM. Late checkout can be requested."},{"q":"Do you accept M-Pesa?","a":"Yes — M-Pesa, cards and bank transfer are all accepted."},{"q":"Is breakfast included?","a":"Breakfast is included with every room."},{"q":"Can I cancel my booking?","a":"Free cancellation up to 48 hours before arrival."}]'::jsonb);