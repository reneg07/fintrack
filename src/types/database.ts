export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          currency: string;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          currency?: string;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          currency?: string;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: "income" | "expense";
          color: string;
          icon: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: "income" | "expense";
          color: string;
          icon: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: "income" | "expense";
          color?: string;
          icon?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          type: "income" | "expense";
          amount_cents: number;
          occurred_on: string;
          description: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          type: "income" | "expense";
          amount_cents: number;
          occurred_on: string;
          description: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string;
          type?: "income" | "expense";
          amount_cents?: number;
          occurred_on?: string;
          description?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_category_owner_type_fkey";
            columns: ["category_id", "user_id", "type"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id", "user_id", "type"];
          },
        ];
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          category_type: string | null;
          month: string;
          limit_cents: number;
          alert_threshold_pct: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          month: string;
          limit_cents: number;
          alert_threshold_pct?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string;
          month?: string;
          limit_cents?: number;
          alert_threshold_pct?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "budgets_expense_category_owner_fkey";
            columns: ["category_id", "user_id", "category_type"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id", "user_id", "type"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
export type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];
export type BudgetRow = Database["public"]["Tables"]["budgets"]["Row"];
