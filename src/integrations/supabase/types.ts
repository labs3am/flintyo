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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      chats: {
        Row: {
          created_at: string
          expires_at: string | null
          extend_requested_by: string | null
          extensions_count: number
          id: string
          mood: string | null
          status: string
          topic: string
          user_a: string
          user_b: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          extend_requested_by?: string | null
          extensions_count?: number
          id?: string
          mood?: string | null
          status?: string
          topic: string
          user_a: string
          user_b?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          extend_requested_by?: string | null
          extensions_count?: number
          id?: string
          mood?: string | null
          status?: string
          topic?: string
          user_a?: string
          user_b?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chats_user_a_fkey"
            columns: ["user_a"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_user_a_fkey"
            columns: ["user_a"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_user_b_fkey"
            columns: ["user_b"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_user_b_fkey"
            columns: ["user_b"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          flint_id: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          flint_id: string
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          flint_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_flint_id_fkey"
            columns: ["flint_id"]
            isOneToOne: false
            referencedRelation: "flints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      debate_messages: {
        Row: {
          created_at: string
          debate_id: string
          id: string
          message: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          debate_id: string
          id?: string
          message: string
          sender_id: string
        }
        Update: {
          created_at?: string
          debate_id?: string
          id?: string
          message?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "debate_messages_debate_id_fkey"
            columns: ["debate_id"]
            isOneToOne: false
            referencedRelation: "debates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debate_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debate_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      debate_votes: {
        Row: {
          created_at: string
          debate_id: string
          id: string
          voted_for: string
          voter_id: string
        }
        Insert: {
          created_at?: string
          debate_id: string
          id?: string
          voted_for: string
          voter_id: string
        }
        Update: {
          created_at?: string
          debate_id?: string
          id?: string
          voted_for?: string
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "debate_votes_debate_id_fkey"
            columns: ["debate_id"]
            isOneToOne: false
            referencedRelation: "debates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debate_votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debate_votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      debates: {
        Row: {
          created_at: string
          expires_at: string | null
          flint_id: string
          id: string
          status: string
          user_a: string
          user_b: string
          votes_a: number
          votes_b: number
          votes_draw: number
          winner: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          flint_id: string
          id?: string
          status?: string
          user_a: string
          user_b: string
          votes_a?: number
          votes_b?: number
          votes_draw?: number
          winner?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          flint_id?: string
          id?: string
          status?: string
          user_a?: string
          user_b?: string
          votes_a?: number
          votes_b?: number
          votes_draw?: number
          winner?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "debates_flint_id_fkey"
            columns: ["flint_id"]
            isOneToOne: false
            referencedRelation: "flints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debates_user_a_fkey"
            columns: ["user_a"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debates_user_a_fkey"
            columns: ["user_a"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debates_user_b_fkey"
            columns: ["user_b"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debates_user_b_fkey"
            columns: ["user_b"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debates_winner_fkey"
            columns: ["winner"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debates_winner_fkey"
            columns: ["winner"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      flints: {
        Row: {
          agree_count: number
          audience: string
          audience_country: string | null
          author_id: string
          category: string
          content: string
          created_at: string
          disagree_count: number
          expires_at: string | null
          id: string
          is_saved: boolean
        }
        Insert: {
          agree_count?: number
          audience?: string
          audience_country?: string | null
          author_id: string
          category?: string
          content: string
          created_at?: string
          disagree_count?: number
          expires_at?: string | null
          id?: string
          is_saved?: boolean
        }
        Update: {
          agree_count?: number
          audience?: string
          audience_country?: string | null
          author_id?: string
          category?: string
          content?: string
          created_at?: string
          disagree_count?: number
          expires_at?: string | null
          id?: string
          is_saved?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "flints_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flints_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          chat_id: string
          created_at: string
          id: string
          message: string
          sender_id: string
        }
        Insert: {
          chat_id: string
          created_at?: string
          id?: string
          message: string
          sender_id: string
        }
        Update: {
          chat_id?: string
          created_at?: string
          id?: string
          message?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          country: string | null
          created_at: string
          debates_won: number
          email: string | null
          id: string
          labs_id: string
          name: string | null
          points: number
          posts_count: number
          rank: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          debates_won?: number
          email?: string | null
          id: string
          labs_id: string
          name?: string | null
          points?: number
          posts_count?: number
          rank?: string
        }
        Update: {
          country?: string | null
          created_at?: string
          debates_won?: number
          email?: string | null
          id?: string
          labs_id?: string
          name?: string | null
          points?: number
          posts_count?: number
          rank?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          flint_id: string | null
          id: string
          reason: string
          reported_by: string
        }
        Insert: {
          created_at?: string
          flint_id?: string | null
          id?: string
          reason: string
          reported_by: string
        }
        Update: {
          created_at?: string
          flint_id?: string | null
          id?: string
          reason?: string
          reported_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_flint_id_fkey"
            columns: ["flint_id"]
            isOneToOne: false
            referencedRelation: "flints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_votes: {
        Row: {
          created_at: string
          flint_id: string
          id: string
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string
          flint_id: string
          id?: string
          user_id: string
          vote_type: string
        }
        Update: {
          created_at?: string
          flint_id?: string
          id?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_votes_flint_id_fkey"
            columns: ["flint_id"]
            isOneToOne: false
            referencedRelation: "flints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "safe_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      safe_profiles: {
        Row: {
          country: string | null
          created_at: string | null
          debates_won: number | null
          id: string | null
          labs_id: string | null
          points: number | null
          posts_count: number | null
          rank: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          debates_won?: number | null
          id?: string | null
          labs_id?: string | null
          points?: number | null
          posts_count?: number | null
          rank?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          debates_won?: number | null
          id?: string | null
          labs_id?: string | null
          points?: number | null
          posts_count?: number | null
          rank?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_rank: { Args: { p: number }; Returns: string }
      generate_labs_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      request_chat_extension: { Args: { p_chat_id: string }; Returns: Json }
      vote_on_flint: {
        Args: { p_flint_id: string; p_vote_type: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
