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
      case_finishes: {
        Row: {
          display_order: number
          hex_code: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          price_modifier: number
        }
        Insert: {
          display_order?: number
          hex_code?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          price_modifier?: number
        }
        Update: {
          display_order?: number
          hex_code?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          price_modifier?: number
        }
        Relationships: []
      }
      dial_colors: {
        Row: {
          display_order: number
          hex_code: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          price_modifier: number
        }
        Insert: {
          display_order?: number
          hex_code?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          price_modifier?: number
        }
        Update: {
          display_order?: number
          hex_code?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          price_modifier?: number
        }
        Relationships: []
      }
      faq: {
        Row: {
          answer: string
          category: string
          display_order: number
          id: string
          is_published: boolean
          question: string
        }
        Insert: {
          answer: string
          category: string
          display_order?: number
          id?: string
          is_published?: boolean
          question: string
        }
        Update: {
          answer?: string
          category?: string
          display_order?: number
          id?: string
          is_published?: boolean
          question?: string
        }
        Relationships: []
      }
      order_configurations: {
        Row: {
          case_finish_id: string | null
          dial_color_id: string | null
          engraving_text: string | null
          gift_packaging: boolean
          id: string
          order_id: string
          product_id: string
          snapshot_base_price: number
          snapshot_total_modifiers: number
          strap_id: string | null
          warranty_id: string | null
          watch_size_id: string | null
        }
        Insert: {
          case_finish_id?: string | null
          dial_color_id?: string | null
          engraving_text?: string | null
          gift_packaging?: boolean
          id?: string
          order_id: string
          product_id: string
          snapshot_base_price: number
          snapshot_total_modifiers: number
          strap_id?: string | null
          warranty_id?: string | null
          watch_size_id?: string | null
        }
        Update: {
          case_finish_id?: string | null
          dial_color_id?: string | null
          engraving_text?: string | null
          gift_packaging?: boolean
          id?: string
          order_id?: string
          product_id?: string
          snapshot_base_price?: number
          snapshot_total_modifiers?: number
          strap_id?: string | null
          warranty_id?: string | null
          watch_size_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_configurations_case_finish_id_fkey"
            columns: ["case_finish_id"]
            isOneToOne: false
            referencedRelation: "case_finishes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_configurations_dial_color_id_fkey"
            columns: ["dial_color_id"]
            isOneToOne: false
            referencedRelation: "dial_colors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_configurations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_configurations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_configurations_strap_id_fkey"
            columns: ["strap_id"]
            isOneToOne: false
            referencedRelation: "straps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_configurations_warranty_id_fkey"
            columns: ["warranty_id"]
            isOneToOne: false
            referencedRelation: "warranty_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_configurations_watch_size_id_fkey"
            columns: ["watch_size_id"]
            isOneToOne: false
            referencedRelation: "watch_sizes"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_email: string
          customer_id: string | null
          customer_name: string
          id: string
          shipping_address: Json
          status: Database["public"]["Enums"]["order_status"]
          stripe_payment_id: string | null
          total_price: number
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_id?: string | null
          customer_name: string
          id?: string
          shipping_address: Json
          status?: Database["public"]["Enums"]["order_status"]
          stripe_payment_id?: string | null
          total_price: number
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_id?: string | null
          customer_name?: string
          id?: string
          shipping_address?: Json
          status?: Database["public"]["Enums"]["order_status"]
          stripe_payment_id?: string | null
          total_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_price: number
          description: string | null
          hero_image_url: string | null
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          base_price: number
          description?: string | null
          hero_image_url?: string | null
          id?: string
          is_active?: boolean
          name?: string
        }
        Update: {
          base_price?: number
          description?: string | null
          hero_image_url?: string | null
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      settings: {
        Row: {
          description: string | null
          key: string
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          value?: Json
        }
        Relationships: []
      }
      straps: {
        Row: {
          display_order: number
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          price_modifier: number
          swatch_color: string | null
        }
        Insert: {
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          price_modifier?: number
          swatch_color?: string | null
        }
        Update: {
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          price_modifier?: number
          swatch_color?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          content: string
          created_at: string
          customer_name: string
          id: string
          image_url: string | null
          is_published: boolean
          is_verified: boolean
          rating: number
        }
        Insert: {
          content: string
          created_at?: string
          customer_name: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          is_verified?: boolean
          rating: number
        }
        Update: {
          content?: string
          created_at?: string
          customer_name?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          is_verified?: boolean
          rating?: number
        }
        Relationships: []
      }
      warranty_options: {
        Row: {
          display_order: number
          id: string
          is_active: boolean
          name: string
          price_modifier: number
        }
        Insert: {
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          price_modifier?: number
        }
        Update: {
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          price_modifier?: number
        }
        Relationships: []
      }
      watch_sizes: {
        Row: {
          display_order: number
          id: string
          is_active: boolean
          price_modifier: number
          size: string
        }
        Insert: {
          display_order?: number
          id?: string
          is_active?: boolean
          price_modifier?: number
          size: string
        }
        Update: {
          display_order?: number
          id?: string
          is_active?: boolean
          price_modifier?: number
          size?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      order_status:
        | "pending"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
      user_role: "customer" | "admin"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      order_status: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      user_role: ["customer", "admin"],
    },
  },
} as const
