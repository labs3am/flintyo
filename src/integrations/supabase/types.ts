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
          expires_at: string
          id: string
          topic: string
          user_a: string
          user_b: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          topic: string
          user_a: string
          user_b: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          topic?: string
          user_a?: string
          user_b?: string
        }
        Relationships: [
          {
            foreignKeyName: "chats_user_a_fkey"
            columns: ["user_a"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_user_b_fkey"
            columns: ["user_b"]
            isOneToOne: false
            referencedRelation: "users"
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
            referencedRelation: "users"
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
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      debate_votes: {
        Row: {
          created_at: string
          debate_id: string
          id: string
          voted_for: string | null
          voter_id: string
        }
        Insert: {
          created_at?: string
          debate_id: string
          id?: string
          voted_for?: string | null
          voter_id: string
        }
        Update: {
          created_at?: string
          debate_id?: string
          id?: string
          voted_for?: string | null
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
            foreignKeyName: "debate_votes_voted_for_fkey"
            columns: ["voted_for"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debate_votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      debates: {
        Row: {
          created_at: string
          ends_at: string | null
          flint_id: string
          id: string
          status: string
          user_a: string
          user_b: string
          winner: string | null
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          flint_id: string
          id?: string
          status?: string
          user_a: string
          user_b: string
          winner?: string | null
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          flint_id?: string
          id?: string
          status?: string
          user_a?: string
          user_b?: string
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
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debates_user_b_fkey"
            columns: ["user_b"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debates_winner_fkey"
            columns: ["winner"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      flints: {
        Row: {
          agree_count: number
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
            referencedRelation: "users"
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
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          flint_id: string
          id: string
          reason: string
          reported_by: string
        }
        Insert: {
          created_at?: string
          flint_id: string
          id?: string
          reason: string
          reported_by: string
        }
        Update: {
          created_at?: string
          flint_id?: string
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
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          country: string | null
          created_at: string
          email: string
          id: string
          labs_id: string
          points: number
          rank: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          email: string
          id: string
          labs_id: string
          points?: number
          rank?: string
        }
        Update: {
          country?: string | null
          created_at?: string
          email?: string
          id?: string
          labs_id?: string
          points?: number
          rank?: string
        }
        Relationships: []
      }
      votes: {
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
            foreignKeyName: "votes_flint_id_fkey"
            columns: ["flint_id"]
            isOneToOne: false
            referencedRelation: "flints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cast_vote: {
        Args: { p_flint_id: string; p_user_id: string; p_vote_type: string }
        Returns: undefined
      }
      increment_points: {
        Args: { amount: number; user_id_input: string }
        Returns: undefined
      }
      resolve_debate: { Args: { p_debate_id: string }; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
