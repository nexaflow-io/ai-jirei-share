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
      access_logs: {
        Row: {
          accessed_at: string
          case_id: string
          id: string
          ip_address: string | null
          tenant_id: string
          user_agent: string | null
          viewer_id: string
        }
        Insert: {
          accessed_at?: string
          case_id: string
          id?: string
          ip_address?: string | null
          tenant_id: string
          user_agent?: string | null
          viewer_id: string
        }
        Update: {
          accessed_at?: string
          case_id?: string
          id?: string
          ip_address?: string | null
          tenant_id?: string
          user_agent?: string | null
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_logs_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "construction_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_logs_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "viewers"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_questions: {
        Row: {
          answer: string
          case_id: string | null
          created_at: string
          id: string
          model_used: string
          question: string
          tenant_id: string
          viewer_id: string
        }
        Insert: {
          answer: string
          case_id?: string | null
          created_at?: string
          id?: string
          model_used?: string
          question: string
          tenant_id: string
          viewer_id: string
        }
        Update: {
          answer?: string
          case_id?: string | null
          created_at?: string
          id?: string
          model_used?: string
          question?: string
          tenant_id?: string
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_questions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "construction_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_questions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_questions_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "viewers"
            referencedColumns: ["id"]
          },
        ]
      }
      case_images: {
        Row: {
          case_id: string
          created_at: string
          display_order: number
          id: string
          image_path: string
          image_url: string
          tenant_id: string
        }
        Insert: {
          case_id: string
          created_at?: string
          display_order?: number
          id?: string
          image_path: string
          image_url: string
          tenant_id: string
        }
        Update: {
          case_id?: string
          created_at?: string
          display_order?: number
          id?: string
          image_path?: string
          image_url?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_images_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "construction_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_images_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      construction_cases: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_published: boolean
          name: string
          result: string | null
          solution: string | null
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          name: string
          result?: string | null
          solution?: string | null
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          name?: string
          result?: string | null
          solution?: string | null
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "construction_cases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "construction_cases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          case_id: string
          created_at: string
          id: string
          message: string
          status: string
          subject: string
          tenant_id: string
          viewer_id: string
        }
        Insert: {
          case_id: string
          created_at?: string
          id?: string
          message: string
          status?: string
          subject: string
          tenant_id: string
          viewer_id: string
        }
        Update: {
          case_id?: string
          created_at?: string
          id?: string
          message?: string
          status?: string
          subject?: string
          tenant_id?: string
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "construction_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "viewers"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          id: string
          name: string
          subdomain: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          subdomain?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          subdomain?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      viewers: {
        Row: {
          case_id: string
          company_name: string
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string
          position: string
          tenant_id: string
        }
        Insert: {
          case_id: string
          company_name: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone: string
          position: string
          tenant_id: string
        }
        Update: {
          case_id?: string
          company_name?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string
          position?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "viewers_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "construction_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viewers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_tenant_and_user: {
        Args: {
          user_id: string
          user_email: string
          user_full_name: string
          tenant_name: string
        }
        Returns: Json
      }
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
