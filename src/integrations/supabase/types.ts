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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          committee: string
          content: string
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          priority: string | null
          published_at: string | null
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
        }
        Insert: {
          committee: string
          content: string
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          priority?: string | null
          published_at?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
        }
        Update: {
          committee?: string
          content?: string
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          priority?: string | null
          published_at?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          attended: boolean | null
          event_id: string
          id: string
          registered_at: string
          user_id: string
        }
        Insert: {
          attended?: boolean | null
          event_id: string
          id?: string
          registered_at?: string
          user_id: string
        }
        Update: {
          attended?: boolean | null
          event_id?: string
          id?: string
          registered_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          banner_url: string | null
          committee: string
          created_at: string
          created_by: string
          description: string | null
          end_date: string | null
          event_type: string
          id: string
          location: string | null
          max_attendees: number | null
          online_link: string | null
          speakers: Json | null
          start_date: string
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          committee: string
          created_at?: string
          created_by: string
          description?: string | null
          end_date?: string | null
          event_type: string
          id?: string
          location?: string | null
          max_attendees?: number | null
          online_link?: string | null
          speakers?: Json | null
          start_date: string
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          committee?: string
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string | null
          event_type?: string
          id?: string
          location?: string | null
          max_attendees?: number | null
          online_link?: string | null
          speakers?: Json | null
          start_date?: string
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      forum_queries: {
        Row: {
          assigned_at: string | null
          assigned_expert_id: string | null
          category: Database["public"]["Enums"]["query_category"]
          created_at: string
          escalation_count: number | null
          id: string
          member_id: string
          question: string
          status: Database["public"]["Enums"]["query_status"]
          subject: string
          updated_at: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_expert_id?: string | null
          category: Database["public"]["Enums"]["query_category"]
          created_at?: string
          escalation_count?: number | null
          id?: string
          member_id: string
          question: string
          status?: Database["public"]["Enums"]["query_status"]
          subject: string
          updated_at?: string
        }
        Update: {
          assigned_at?: string | null
          assigned_expert_id?: string | null
          category?: Database["public"]["Enums"]["query_category"]
          created_at?: string
          escalation_count?: number | null
          id?: string
          member_id?: string
          question?: string
          status?: Database["public"]["Enums"]["query_status"]
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      forum_responses: {
        Row: {
          created_at: string
          expert_id: string
          id: string
          moderated_at: string | null
          moderated_by: string | null
          moderator_notes: string | null
          query_id: string
          response: string
          status: Database["public"]["Enums"]["query_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          expert_id: string
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          moderator_notes?: string | null
          query_id: string
          response: string
          status?: Database["public"]["Enums"]["query_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          expert_id?: string
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          moderator_notes?: string | null
          query_id?: string
          response?: string
          status?: Database["public"]["Enums"]["query_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_responses_query_id_fkey"
            columns: ["query_id"]
            isOneToOne: false
            referencedRelation: "forum_queries"
            referencedColumns: ["id"]
          },
        ]
      }
      helpdesk_tickets: {
        Row: {
          assigned_to: string | null
          category: string | null
          created_at: string
          description: string
          id: string
          priority: string | null
          resolved_at: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string
          description: string
          id?: string
          priority?: string | null
          resolved_at?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string
          description?: string
          id?: string
          priority?: string | null
          resolved_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          expertise_areas: string[] | null
          full_name: string
          id: string
          membership_number: string | null
          notification_preferences: Json | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          expertise_areas?: string[] | null
          full_name: string
          id?: string
          membership_number?: string | null
          notification_preferences?: Json | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          expertise_areas?: string[] | null
          full_name?: string
          id?: string
          membership_number?: string | null
          notification_preferences?: Json | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      publications: {
        Row: {
          category: string
          committee: string
          content: string | null
          created_at: string
          created_by: string
          description: string | null
          file_url: string | null
          id: string
          published_at: string | null
          status: Database["public"]["Enums"]["content_status"]
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          committee: string
          content?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          file_url?: string | null
          id?: string
          published_at?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          committee?: string
          content?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          file_url?: string | null
          id?: string
          published_at?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
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
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_or_moderator: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "cms_admin"
        | "cms_editor"
        | "cms_moderator"
        | "registered_member"
        | "expert_panellist"
        | "helpdesk_user"
      content_status:
        | "draft"
        | "pending_review"
        | "published"
        | "unpublished"
        | "archived"
      query_category:
        | "returns_forms"
        | "capital_gains"
        | "assessment_procedure"
        | "international_taxation"
        | "transfer_pricing"
        | "miscellaneous"
      query_status:
        | "submitted"
        | "assigned"
        | "responded"
        | "under_review"
        | "approved"
        | "rejected"
        | "escalated"
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
      app_role: [
        "super_admin",
        "cms_admin",
        "cms_editor",
        "cms_moderator",
        "registered_member",
        "expert_panellist",
        "helpdesk_user",
      ],
      content_status: [
        "draft",
        "pending_review",
        "published",
        "unpublished",
        "archived",
      ],
      query_category: [
        "returns_forms",
        "capital_gains",
        "assessment_procedure",
        "international_taxation",
        "transfer_pricing",
        "miscellaneous",
      ],
      query_status: [
        "submitted",
        "assigned",
        "responded",
        "under_review",
        "approved",
        "rejected",
        "escalated",
      ],
    },
  },
} as const
