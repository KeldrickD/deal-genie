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
      deals: {
        Row: {
          address: string | null
          arv: number | null
          cap_rate: number | null
          created_at: string | null
          deal_name: string | null
          id: string
          interest_rate: number | null
          loan_amount: number | null
          loan_term_years: number | null
          noi: number | null
          note: string | null
          property_type: string | null
          purchase_price: number | null
          rehab_cost: number | null
          status: string | null
          updated_at: string | null
          user_id: string
          source: string | null
          imported: boolean
          analysis_data: Json | null
        }
        Insert: {
          address?: string | null
          arv?: number | null
          cap_rate?: number | null
          created_at?: string | null
          deal_name?: string | null
          id?: string
          interest_rate?: number | null
          loan_amount?: number | null
          loan_term_years?: number | null
          noi?: number | null
          note?: string | null
          property_type?: string | null
          purchase_price?: number | null
          rehab_cost?: number | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          source?: string | null
          imported?: boolean
          analysis_data?: Json | null
        }
        Update: {
          address?: string | null
          arv?: number | null
          cap_rate?: number | null
          created_at?: string | null
          deal_name?: string | null
          id?: string
          interest_rate?: number | null
          loan_amount?: number | null
          loan_term_years?: number | null
          noi?: number | null
          note?: string | null
          property_type?: string | null
          purchase_price?: number | null
          rehab_cost?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          source?: string | null
          imported?: boolean
          analysis_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          investment_data: Json | null
          xp_data: Json | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          investment_data?: Json | null
          xp_data?: Json | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          investment_data?: Json | null
          xp_data?: Json | null
        }
        Relationships: []
      }
      property_analyses: {
        Row: {
          id: string
          user_id: string
          property_address: string
          arv: number
          repair_cost_low: number
          repair_cost_high: number
          cash_on_cash_roi: number
          flip_potential: number
          rental_potential: number
          mao: number
          recommendation: string
          reasoning: string
          confidence_level: number
          offer_made: boolean
          created_at: string
          updated_at: string | null
          confidence: number | null
          deal_score: number | null
        }
        Insert: {
          id?: string
          user_id: string
          property_address: string
          arv: number
          repair_cost_low: number
          repair_cost_high: number
          cash_on_cash_roi: number
          flip_potential: number
          rental_potential: number
          mao: number
          recommendation: string
          reasoning: string
          confidence_level: number
          offer_made?: boolean
          created_at?: string
          updated_at?: string | null
          confidence?: number | null
          deal_score?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          property_address?: string
          arv?: number
          repair_cost_low?: number
          repair_cost_high?: number
          cash_on_cash_roi?: number
          flip_potential?: number
          rental_potential?: number
          mao?: number
          recommendation?: string
          reasoning?: string
          confidence_level?: number
          offer_made?: boolean
          created_at?: string
          updated_at?: string | null
          confidence?: number | null
          deal_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "property_analyses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      usage_tracking: {
        Row: {
          id: string
          user_id: string
          resource_type: string
          resource_id: string | null
          created_at: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          resource_type: string
          resource_id?: string | null
          created_at?: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          resource_type?: string
          resource_id?: string | null
          created_at?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
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
