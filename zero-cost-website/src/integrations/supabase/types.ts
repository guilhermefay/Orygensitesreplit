export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      abandoned_forms: {
        Row: {
          abandoned_at: string | null
          business: string
          business_details: string
          color_palette: string | null
          content: string | null
          created_at: string | null
          email: string
          form_id: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string
          photo_urls: string | null
          plan_variant: string | null
          recovery_email_sent: boolean | null
          selected_plan: string | null
        }
        Insert: {
          abandoned_at?: string | null
          business: string
          business_details: string
          color_palette?: string | null
          content?: string | null
          created_at?: string | null
          email: string
          form_id?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone: string
          photo_urls?: string | null
          plan_variant?: string | null
          recovery_email_sent?: boolean | null
          selected_plan?: string | null
        }
        Update: {
          abandoned_at?: string | null
          business?: string
          business_details?: string
          color_palette?: string | null
          content?: string | null
          created_at?: string | null
          email?: string
          form_id?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string
          photo_urls?: string | null
          plan_variant?: string | null
          recovery_email_sent?: boolean | null
          selected_plan?: string | null
        }
        Relationships: []
      }
      form_submissions: {
        Row: {
          business: string
          business_details: string
          color_palette: string | null
          content: string | null
          created_at: string | null
          email: string
          id: string
          logo_url: string | null
          name: string
          original_form_id: string | null
          payment_date: string | null
          payment_id: string | null
          payment_status: string | null
          phone: string
          photo_urls: string | null
          plan_variant: string | null
          selected_plan: string | null
        }
        Insert: {
          business: string
          business_details: string
          color_palette?: string | null
          content?: string | null
          created_at?: string | null
          email: string
          id?: string
          logo_url?: string | null
          name: string
          original_form_id?: string | null
          payment_date?: string | null
          payment_id?: string | null
          payment_status?: string | null
          phone: string
          photo_urls?: string | null
          plan_variant?: string | null
          selected_plan?: string | null
        }
        Update: {
          business?: string
          business_details?: string
          color_palette?: string | null
          content?: string | null
          created_at?: string | null
          email?: string
          id?: string
          logo_url?: string | null
          name?: string
          original_form_id?: string | null
          payment_date?: string | null
          payment_id?: string | null
          payment_status?: string | null
          phone?: string
          photo_urls?: string | null
          plan_variant?: string | null
          selected_plan?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          form_submission_id: string | null
          id: string
          payer_id: string | null
          payment_id: string | null
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          form_submission_id?: string | null
          id?: string
          payer_id?: string | null
          payment_id?: string | null
          status: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          form_submission_id?: string | null
          id?: string
          payer_id?: string | null
          payment_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_form_submission_id_fkey"
            columns: ["form_submission_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      website_projects: {
        Row: {
          business_name: string | null
          completed_at: string | null
          created_at: string | null
          final_score: number | null
          form_submission_id: string | null
          id: string
          iterations: number | null
          review_history: Json | null
          started_at: string | null
          status: string | null
          website_url: string | null
        }
        Insert: {
          business_name?: string | null
          completed_at?: string | null
          created_at?: string | null
          final_score?: number | null
          form_submission_id?: string | null
          id?: string
          iterations?: number | null
          review_history?: Json | null
          started_at?: string | null
          status?: string | null
          website_url?: string | null
        }
        Update: {
          business_name?: string | null
          completed_at?: string | null
          created_at?: string | null
          final_score?: number | null
          form_submission_id?: string | null
          id?: string
          iterations?: number | null
          review_history?: Json | null
          started_at?: string | null
          status?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bytea_to_text: {
        Args: { data: string }
        Returns: string
      }
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] }
        Returns: unknown
      }
      http_delete: {
        Args:
          | { uri: string }
          | { uri: string; content: string; content_type: string }
        Returns: unknown
      }
      http_get: {
        Args: { uri: string } | { uri: string; data: Json }
        Returns: unknown
      }
      http_head: {
        Args: { uri: string }
        Returns: unknown
      }
      http_header: {
        Args: { field: string; value: string }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
      }
      http_list_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: { uri: string; content: string; content_type: string }
        Returns: unknown
      }
      http_post: {
        Args:
          | { uri: string; content: string; content_type: string }
          | { uri: string; data: Json }
        Returns: unknown
      }
      http_put: {
        Args: { uri: string; content: string; content_type: string }
        Returns: unknown
      }
      http_reset_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      http_set_curlopt: {
        Args: { curlopt: string; value: string }
        Returns: boolean
      }
      process_abandoned_forms: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      text_to_bytea: {
        Args: { data: string }
        Returns: string
      }
      urlencode: {
        Args: { data: Json } | { string: string } | { string: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown | null
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
      }
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
