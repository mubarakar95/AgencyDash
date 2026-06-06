import { Project, Client, Renewal } from "@/types";

export const mockProjects: Project[] = [
  { id: "1", name: "E-Commerce Redesign", client: "Acme Corp", status: "in-progress", deadline: "2026-06-15", progress: 65, budget: 15000, spent: 8750 },
  { id: "2", name: "Mobile App V2", client: "TechStart", status: "review", deadline: "2026-05-30", progress: 90, budget: 25000, spent: 22000 },
  { id: "3", name: "SEO Campaign", client: "GreenLeaf", status: "active", deadline: "2026-07-01", progress: 30, budget: 5000, spent: 1200 },
  { id: "4", name: "Internal CRM", client: "In-House", status: "active", deadline: "2026-08-10", progress: 15, budget: 10000, spent: 1500 },
  { id: "5", name: "Portfolio Site", client: "DesignStudio", status: "delivered", deadline: "2026-05-01", progress: 100, budget: 3000, spent: 2900 },
];

export const mockClients: Client[] = [
  { id: "1", name: "John Doe", email: "john@acme.com", phone: "+1 555-0101", company: "Acme Corp", projects: 2, lastContact: "2026-05-20", status: "active" },
  { id: "2", name: "Sarah Smith", email: "sarah@techstart.io", phone: "+1 555-0102", company: "TechStart", projects: 1, lastContact: "2026-05-22", status: "active" },
  { id: "3", name: "Mike Johnson", email: "mike@greenleaf.org", phone: "+1 555-0103", company: "GreenLeaf", projects: 1, lastContact: "2026-05-18", status: "active" },
  { id: "4", name: "Emily Davis", email: "emily@design.studio", phone: "+1 555-0104", company: "DesignStudio", projects: 1, lastContact: "2026-05-10", status: "inactive" },
  { id: "5", name: "New Lead Inc", email: "contact@newlead.com", phone: "+1 555-0105", company: "New Lead Inc", projects: 0, lastContact: "2026-05-24", status: "lead" },
];

export const mockRenewals: Renewal[] = [
  { id: "1", assetName: "acme.com", type: "domain", client: "Acme Corp", expiryDate: "2026-06-05", cost: 12, provider: "Namecheap", status: "critical" },
  { id: "2", assetName: "techstart.io Hosting", type: "hosting", client: "TechStart", expiryDate: "2026-06-20", cost: 150, provider: "AWS", status: "warning" },
  { id: "3", assetName: "greenleaf.org SSL", type: "ssl", client: "GreenLeaf", expiryDate: "2026-12-31", cost: 50, provider: "Let's Encrypt", status: "safe" },
  { id: "4", assetName: "design.studio", type: "domain", client: "DesignStudio", expiryDate: "2026-05-20", cost: 15, provider: "GoDaddy", status: "expired" },
  { id: "5", assetName: "Analytics License", type: "license", client: "In-House", expiryDate: "2026-07-15", cost: 200, provider: "Plausible", status: "warning" },
];

