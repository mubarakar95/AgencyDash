export interface Project {
  id: string;
  name: string;
  client: string;
  status: "lead" | "quoted" | "active" | "in-progress" | "review" | "delivered" | "maintenance";
  deadline: string;
  progress: number;
  budget: number;
  spent: number;
  icon_url?: string | null;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  projects: number;
  lastContact: string;
  status: "active" | "lead" | "inactive";
}

export interface Renewal {
  id: string;
  assetName: string;
  type: "domain" | "hosting" | "ssl" | "license";
  client: string;
  expiryDate: string;
  cost: number;
  provider: string;
  status: "safe" | "warning" | "critical" | "expired";
}

export interface Task {
  id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  status: "backlog" | "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  type: "bug" | "feature" | "task" | "improvement";
  assignee_id: string | null;
  due_date: string | null;
  ticket_id: string | null;
  image_urls: string[];
  estimated_hours: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  client_id: string;
  type: "payment" | "invoice";
  amount: number;
  currency: string;
  original_amount: number | null;
  description: string | null;
  payment_method: string | null;
  reference_id: string | null;
  date: string;
  created_at: string;
  clients?: { name: string; company: string | null };
}

export interface TaskComment {
  id: string;
  task_id: string;
  author_id: string | null;
  author_name: string;
  content: string;
  image_urls: string[];
  created_at: string;
}
