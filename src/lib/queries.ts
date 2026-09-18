import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type RoomType = Tables<"room_types">;
export type Room = Tables<"rooms">;
export type Booking = Tables<"bookings">;
export type Promotion = Tables<"promotions">;
export type Service = Tables<"services">;
export type Review = Tables<"reviews">;
export type Property = Tables<"properties">;

export const PROPERTY_ID = "11111111-1111-1111-1111-111111111111";

export const propertyQuery = queryOptions({
  queryKey: ["property"],
  queryFn: async () => {
    const { data, error } = await supabase.from("properties").select("*").eq("id", PROPERTY_ID).single();
    if (error) throw error;
    return data;
  },
});

export const roomTypesQuery = queryOptions({
  queryKey: ["room_types"],
  queryFn: async () => {
    const { data, error } = await supabase.from("room_types").select("*").eq("active", true).order("sort_order");
    if (error) throw error;
    return data;
  },
});

export const allRoomTypesQuery = queryOptions({
  queryKey: ["room_types", "all"],
  queryFn: async () => {
    const { data, error } = await supabase.from("room_types").select("*").order("sort_order");
    if (error) throw error;
    return data;
  },
});

export const roomTypeBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["room_type", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("room_types").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const roomsQuery = queryOptions({
  queryKey: ["rooms"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("rooms")
      .select("*, room_types(name, slug, base_price)")
      .order("number");
    if (error) throw error;
    return data;
  },
});

export const promotionsQuery = queryOptions({
  queryKey: ["promotions"],
  queryFn: async () => {
    const { data, error } = await supabase.from("promotions").select("*").order("created_at");
    if (error) throw error;
    return data;
  },
});

export const servicesQuery = queryOptions({
  queryKey: ["services"],
  queryFn: async () => {
    const { data, error } = await supabase.from("services").select("*").eq("active", true).order("sort_order");
    if (error) throw error;
    return data;
  },
});

export const reviewsQuery = (roomTypeId?: string) =>
  queryOptions({
    queryKey: ["reviews", roomTypeId ?? "all"],
    queryFn: async () => {
      let q = supabase.from("reviews").select("*").order("created_at", { ascending: false });
      if (roomTypeId) q = q.eq("room_type_id", roomTypeId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

export const cmsQuery = queryOptions({
  queryKey: ["cms"],
  queryFn: async () => {
    const { data, error } = await supabase.from("cms_content").select("*");
    if (error) throw error;
    const map: Record<string, unknown> = {};
    for (const row of data ?? []) map[row.key] = row.value;
    return map;
  },
});

export const myBookingsQuery = (userId?: string) =>
  queryOptions({
    queryKey: ["my_bookings", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, room_types(name, slug, image_key), rooms(number)")
        .eq("guest_id", userId!)
        .order("check_in", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const notificationsQuery = (userId?: string) =>
  queryOptions({
    queryKey: ["notifications", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

/** Price calculation shared by booking flow + staff */
export function calcPrice(opts: {
  basePrice: number;
  nights: number;
  checkIn: string;
  promo?: Promotion | null;
  servicesTotal?: number;
}) {
  const roomTotal = opts.basePrice * Math.max(opts.nights, 0);
  let discount = 0;
  const promo = opts.promo;
  if (promo && promo.active && opts.nights >= promo.min_nights) {
    const day = new Date(opts.checkIn).getDay(); // 0 Sun .. 6 Sat
    const weekendOk = !promo.weekend_only || day === 5 || day === 6 || day === 0;
    const now = new Date().toISOString().slice(0, 10);
    const dateOk = (!promo.valid_from || promo.valid_from <= now) && (!promo.valid_to || promo.valid_to >= now);
    if (weekendOk && dateOk) {
      discount = promo.discount_type === "percent" ? (roomTotal * Number(promo.discount_value)) / 100 : Number(promo.discount_value);
    }
  }
  discount = Math.min(discount, roomTotal);
  const services = opts.servicesTotal ?? 0;
  return { roomTotal, discount, services, total: roomTotal - discount + services };
}
