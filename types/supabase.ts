export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          name: string
          subdomain: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          subdomain?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          subdomain?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          tenant_id: string
          email: string
          full_name: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          tenant_id: string
          email: string
          full_name?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          email?: string
          full_name?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      construction_cases: {
        Row: {
          id: string
          tenant_id: string
          user_id: string
          name: string
          description: string | null
          solution: string | null
          result: string | null
          category: string | null
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          user_id: string
          name: string
          description?: string | null
          solution?: string | null
          result?: string | null
          category?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          user_id?: string
          name?: string
          description?: string | null
          solution?: string | null
          result?: string | null
          category?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "construction_cases_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "construction_cases_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      case_images: {
        Row: {
          id: string
          case_id: string
          tenant_id: string
          image_url: string
          image_path: string
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          case_id: string
          tenant_id: string
          image_url: string
          image_path: string
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          case_id?: string
          tenant_id?: string
          image_url?: string
          image_path?: string
          display_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_images_case_id_fkey"
            columns: ["case_id"]
            referencedRelation: "construction_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_images_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      viewers: {
        Row: {
          id: string
          case_id: string
          tenant_id: string
          company_name: string
          position: string
          full_name: string
          email: string
          phone: string
          created_at: string
        }
        Insert: {
          id?: string
          case_id: string
          tenant_id: string
          company_name: string
          position: string
          full_name: string
          email: string
          phone: string
          created_at?: string
        }
        Update: {
          id?: string
          case_id?: string
          tenant_id?: string
          company_name?: string
          position?: string
          full_name?: string
          email?: string
          phone?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "viewers_case_id_fkey"
            columns: ["case_id"]
            referencedRelation: "construction_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viewers_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      access_logs: {
        Row: {
          id: string
          case_id: string
          viewer_id: string
          tenant_id: string
          user_agent: string | null
          ip_address: string | null
          accessed_at: string
        }
        Insert: {
          id?: string
          case_id: string
          viewer_id: string
          tenant_id: string
          user_agent?: string | null
          ip_address?: string | null
          accessed_at?: string
        }
        Update: {
          id?: string
          case_id?: string
          viewer_id?: string
          tenant_id?: string
          user_agent?: string | null
          ip_address?: string | null
          accessed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_logs_case_id_fkey"
            columns: ["case_id"]
            referencedRelation: "construction_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_logs_viewer_id_fkey"
            columns: ["viewer_id"]
            referencedRelation: "viewers"
            referencedColumns: ["id"]
          }
        ]
      }
      ai_questions: {
        Row: {
          id: string
          case_id: string
          viewer_id: string
          tenant_id: string
          question: string
          answer: string
          model_used: string
          created_at: string
        }
        Insert: {
          id?: string
          case_id: string
          viewer_id: string
          tenant_id: string
          question: string
          answer: string
          model_used?: string
          created_at?: string
        }
        Update: {
          id?: string
          case_id?: string
          viewer_id?: string
          tenant_id?: string
          question?: string
          answer?: string
          model_used?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_questions_case_id_fkey"
            columns: ["case_id"]
            referencedRelation: "construction_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_questions_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_questions_viewer_id_fkey"
            columns: ["viewer_id"]
            referencedRelation: "viewers"
            referencedColumns: ["id"]
          }
        ]
      }
      inquiries: {
        Row: {
          id: string
          case_id: string
          viewer_id: string
          tenant_id: string
          subject: string
          message: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          case_id: string
          viewer_id: string
          tenant_id: string
          subject: string
          message: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          case_id?: string
          viewer_id?: string
          tenant_id?: string
          subject?: string
          message?: string
          status?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_case_id_fkey"
            columns: ["case_id"]
            referencedRelation: "construction_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_viewer_id_fkey"
            columns: ["viewer_id"]
            referencedRelation: "viewers"
            referencedColumns: ["id"]
          }
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