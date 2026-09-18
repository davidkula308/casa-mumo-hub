export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json
          entity: string
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity: string
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity?: string
          entity_id?: string | null
          id?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          cancellation_reason: string | null
          check_in: string
          check_out: string
          checked_in_at: string | null
          checked_in_by: string | null
          checked_out_at: string | null
          created_at: string
          discount_total: number
          guest_email: string | null
          guest_id: string | null
          guest_name: string | null
          guest_phone: string | null
          guests: number
          id: string
          nights: number | null
          promo_code: string | null
          property_id: string
          reference: string
          room_id: string | null
          room_total: number
          room_type_id: string
          services_total: number
          special_requests: string | null
          status: Database["public"]["Enums"]["booking_status"]
          total_amount: number
          updated_at: string
        }
        Insert: {
          cancellation_reason?: string | null
          check_in: string
          check_out: string
          checked_in_at?: string | null
          checked_in_by?: string | null
          checked_out_at?: string | null
          created_at?: string
          discount_total?: number
          guest_email?: string | null
          guest_id?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          guests?: number
          id?: string
          nights?: number | null
          promo_code?: string | null
          property_id: string
          reference?: string
          room_id?: string | null
          room_total?: number
          room_type_id: string
          services_total?: number
          special_requests?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          total_amount?: number
          updated_at?: string
        }
        Update: {
          cancellation_reason?: string | null
          check_in?: string
          check_out?: string
          checked_in_at?: string | null
          checked_in_by?: string | null
          checked_out_at?: string | null
          created_at?: string
          discount_total?: number
          guest_email?: string | null
          guest_id?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          guests?: number
          id?: string
          nights?: number | null
          promo_code?: string | null
          property_id?: string
          reference?: string
          room_id?: string | null
          room_total?: number
          room_type_id?: string
          services_total?: number
          special_requests?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_content: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      housekeeping_tasks: {
        Row: {
          assigned_to: string | null
          booking_id: string | null
          checklist: Json
          completed_at: string | null
          created_at: string
          damage_report: string | null
          id: string
          notes: string | null
          room_id: string
          status: Database["public"]["Enums"]["housekeeping_status"]
          task_type: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          booking_id?: string | null
          checklist?: Json
          completed_at?: string | null
          created_at?: string
          damage_report?: string | null
          id?: string
          notes?: string | null
          room_id: string
          status?: Database["public"]["Enums"]["housekeeping_status"]
          task_type?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          booking_id?: string | null
          checklist?: Json
          completed_at?: string | null
          created_at?: string
          damage_report?: string | null
          id?: string
          notes?: string | null
          room_id?: string
          status?: Database["public"]["Enums"]["housekeeping_status"]
          task_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "housekeeping_tasks_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "housekeeping_tasks_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_transactions: {
        Row: {
          booking_id: string | null
          created_at: string
          id: string
          points: number
          reason: string
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          id?: string
          points: number
          reason: string
          user_id: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          id?: string
          points?: number
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_transactions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_tickets: {
        Row: {
          assigned_to: string | null
          booking_id: string | null
          created_at: string
          description: string | null
          id: string
          priority: Database["public"]["Enums"]["ticket_priority"]
          reported_by: string | null
          resolved_at: string | null
          room_id: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          ticket_no: number
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          booking_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["ticket_priority"]
          reported_by?: string | null
          resolved_at?: string | null
          room_id?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          ticket_no?: number
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          booking_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["ticket_priority"]
          reported_by?: string | null
          resolved_at?: string | null
          room_id?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          ticket_no?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_tickets_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_tickets_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          booking_id: string | null
          created_at: string
          from_staff: boolean
          guest_id: string
          id: string
          read: boolean
          sender_id: string
        }
        Insert: {
          body: string
          booking_id?: string | null
          created_at?: string
          from_staff?: boolean
          guest_id: string
          id?: string
          read?: boolean
          sender_id: string
        }
        Update: {
          body?: string
          booking_id?: string | null
          created_at?: string
          from_staff?: boolean
          guest_id?: string
          id?: string
          read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          kind: string
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          guest_id: string | null
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          paid_at: string | null
          phone: string | null
          reference: string | null
          status: Database["public"]["Enums"]["payment_status"]
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          guest_id?: string | null
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          paid_at?: string | null
          phone?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          guest_id?: string | null
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          paid_at?: string | null
          phone?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          loyalty_points: number
          notification_prefs: Json
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          loyalty_points?: number
          notification_prefs?: Json
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          loyalty_points?: number
          notification_prefs?: Json
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      promotions: {
        Row: {
          active: boolean
          code: string
          created_at: string
          description: string | null
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          id: string
          min_nights: number
          name: string
          valid_from: string | null
          valid_to: string | null
          weekend_only: boolean
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          description?: string | null
          discount_type?: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          id?: string
          min_nights?: number
          name: string
          valid_from?: string | null
          valid_to?: string | null
          weekend_only?: boolean
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          description?: string | null
          discount_type?: Database["public"]["Enums"]["discount_type"]
          discount_value?: number
          id?: string
          min_nights?: number
          name?: string
          valid_from?: string | null
          valid_to?: string | null
          weekend_only?: boolean
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          check_in_time: string
          check_out_time: string
          city: string
          created_at: string
          description: string | null
          email: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          slug: string
          tagline: string | null
        }
        Insert: {
          address?: string | null
          check_in_time?: string
          check_out_time?: string
          city?: string
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          slug: string
          tagline?: string | null
        }
        Update: {
          address?: string | null
          check_in_time?: string
          check_out_time?: string
          city?: string
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          slug?: string
          tagline?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string | null
          cleanliness: number
          comfort: number
          comment: string | null
          created_at: string
          guest_id: string
          guest_name: string
          id: string
          location: number
          overall: number
          responded_at: string | null
          response: string | null
          room_type_id: string | null
          service: number
        }
        Insert: {
          booking_id?: string | null
          cleanliness?: number
          comfort?: number
          comment?: string | null
          created_at?: string
          guest_id: string
          guest_name?: string
          id?: string
          location?: number
          overall: number
          responded_at?: string | null
          response?: string | null
          room_type_id?: string | null
          service?: number
        }
        Update: {
          booking_id?: string | null
          cleanliness?: number
          comfort?: number
          comment?: string | null
          created_at?: string
          guest_id?: string
          guest_name?: string
          id?: string
          location?: number
          overall?: number
          responded_at?: string | null
          response?: string | null
          room_type_id?: string | null
          service?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
            referencedColumns: ["id"]
          },
        ]
      }
      room_types: {
        Row: {
          active: boolean
          amenities: string[]
          base_price: number
          beds: string
          created_at: string
          description: string | null
          gallery_keys: string[]
          house_rules: string[]
          id: string
          image_key: string | null
          max_guests: number
          name: string
          property_id: string
          slug: string
          sort_order: number
          updated_at: string
          view_label: string | null
        }
        Insert: {
          active?: boolean
          amenities?: string[]
          base_price?: number
          beds?: string
          created_at?: string
          description?: string | null
          gallery_keys?: string[]
          house_rules?: string[]
          id?: string
          image_key?: string | null
          max_guests?: number
          name: string
          property_id: string
          slug: string
          sort_order?: number
          updated_at?: string
          view_label?: string | null
        }
        Update: {
          active?: boolean
          amenities?: string[]
          base_price?: number
          beds?: string
          created_at?: string
          description?: string | null
          gallery_keys?: string[]
          house_rules?: string[]
          id?: string
          image_key?: string | null
          max_guests?: number
          name?: string
          property_id?: string
          slug?: string
          sort_order?: number
          updated_at?: string
          view_label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "room_types_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          created_at: string
          floor: number
          id: string
          notes: string | null
          number: string
          property_id: string
          room_type_id: string
          status: Database["public"]["Enums"]["room_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          floor?: number
          id?: string
          notes?: string | null
          number: string
          property_id: string
          room_type_id: string
          status?: Database["public"]["Enums"]["room_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          floor?: number
          id?: string
          notes?: string | null
          number?: string
          property_id?: string
          room_type_id?: string
          status?: Database["public"]["Enums"]["room_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rooms_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          booking_id: string
          created_at: string
          guest_id: string | null
          id: string
          notes: string | null
          price: number
          quantity: number
          service_id: string | null
          status: Database["public"]["Enums"]["service_request_status"]
          title: string
          updated_at: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          guest_id?: string | null
          id?: string
          notes?: string | null
          price?: number
          quantity?: number
          service_id?: string | null
          status?: Database["public"]["Enums"]["service_request_status"]
          title: string
          updated_at?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          guest_id?: string | null
          id?: string
          notes?: string | null
          price?: number
          quantity?: number
          service_id?: string | null
          status?: Database["public"]["Enums"]["service_request_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          active: boolean
          category: string
          description: string | null
          id: string
          name: string
          price: number
          property_id: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          category?: string
          description?: string | null
          id?: string
          name: string
          price?: number
          property_id: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          category?: string
          description?: string | null
          id?: string
          name?: string
          price?: number
          property_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "services_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      available_room_count: {
        Args: { _check_in: string; _check_out: string; _room_type_id: string }
        Returns: number
      }
      claim_owner: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_manager: { Args: { _user_id: string }; Returns: boolean }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      my_roles: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"][]
      }
    }
    Enums: {
      app_role: "owner" | "manager" | "receptionist" | "housekeeping" | "guest"
      booking_status:
        | "pending"
        | "confirmed"
        | "checked_in"
        | "checked_out"
        | "cancelled"
        | "no_show"
      discount_type: "percent" | "fixed"
      housekeeping_status:
        | "dirty"
        | "assigned"
        | "in_progress"
        | "inspected"
        | "ready"
      payment_method: "mpesa" | "card" | "bank_transfer" | "cash"
      payment_status: "pending" | "paid" | "failed" | "refunded"
      room_status:
        | "available"
        | "reserved"
        | "occupied"
        | "cleaning"
        | "maintenance"
        | "out_of_service"
      service_request_status: "requested" | "in_progress" | "done" | "cancelled"
      ticket_priority: "low" | "medium" | "high" | "urgent"
      ticket_status: "open" | "in_progress" | "resolved" | "closed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["owner", "manager", "receptionist", "housekeeping", "guest"],
      booking_status: [
        "pending",
        "confirmed",
        "checked_in",
        "checked_out",
        "cancelled",
        "no_show",
      ],
      discount_type: ["percent", "fixed"],
      housekeeping_status: [
        "dirty",
        "assigned",
        "in_progress",
        "inspected",
        "ready",
      ],
      payment_method: ["mpesa", "card", "bank_transfer", "cash"],
      payment_status: ["pending", "paid", "failed", "refunded"],
      room_status: [
        "available",
        "reserved",
        "occupied",
        "cleaning",
        "maintenance",
        "out_of_service",
      ],
      service_request_status: ["requested", "in_progress", "done", "cancelled"],
      ticket_priority: ["low", "medium", "high", "urgent"],
      ticket_status: ["open", "in_progress", "resolved", "closed"],
    },
  },
} as const
