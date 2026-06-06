export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          name: string;
          client_id: string | null;
          status: string;
          deadline: string | null;
          progress: number;
          budget: number;
          spent: number;
          description: string | null;
          quotation_url: string | null;
          icon_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['projects']['Insert']>;
      };
      clients: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          company: string | null;
          status: string;
          last_contact: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['clients']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['clients']['Insert']>;
      };
      renewals: {
        Row: {
          id: string;
          asset_name: string;
          type: string;
          client_id: string | null;
          expiry_date: string;
          cost: number;
          provider: string | null;
          status: string;
          auto_renew: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['renewals']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['renewals']['Insert']>;
      };
      team_members: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: string;
          tags: string[];
          workload: number;
          active_projects: number;
          user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['team_members']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['team_members']['Insert']>;
      };
      follow_ups: {
        Row: {
          id: string;
          client_id: string | null;
          type: string;
          scheduled_date: string;
          status: string;
          message: string | null;
          sequence_step: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['follow_ups']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['follow_ups']['Insert']>;
      };
      time_entries: {
        Row: {
          id: string;
          project_id: string | null;
          team_member_id: string | null;
          description: string | null;
          hours: number;
          date: string;
          billable: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['time_entries']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['time_entries']['Insert']>;
      };
      tickets: {
        Row: {
          id: string;
          project_id: string | null;
          client_id: string | null;
          title: string;
          description: string | null;
          status: string;
          priority: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tickets']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['tickets']['Insert']>;
      };
      ticket_comments: {
        Row: {
          id: string;
          ticket_id: string;
          author_name: string;
          author_role: string;
          content: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['ticket_comments']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['ticket_comments']['Insert']>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string | null;
          title: string;
          message: string | null;
          type: string;
          reference_id: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
      tasks: {
        Row: {
          id: string;
          project_id: string | null;
          title: string;
          description: string | null;
          status: string;
          priority: string;
          type: string;
          assignee_id: string | null;
          due_date: string | null;
          ticket_id: string | null;
          image_urls: string[];
          estimated_hours: number | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tasks']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>;
      };
      task_comments: {
        Row: {
          id: string;
          task_id: string;
          author_id: string | null;
          author_name: string;
          content: string;
          image_urls: string[];
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['task_comments']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['task_comments']['Insert']>;
      };
      task_comment_views: {
        Row: {
          id: string;
          task_id: string;
          user_id: string;
          last_viewed_at: string;
        };
        Insert: Omit<Database['public']['Tables']['task_comment_views']['Row'], 'id' | 'last_viewed_at'>;
        Update: Partial<Database['public']['Tables']['task_comment_views']['Insert']>;
      };
    };
  };
}
