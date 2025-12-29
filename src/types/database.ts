// Application types matching the database schema

export type AppRole = 
  | 'super_admin'
  | 'cms_admin'
  | 'cms_editor'
  | 'cms_moderator'
  | 'registered_member'
  | 'expert_panellist'
  | 'helpdesk_user';

export type QueryStatus = 
  | 'submitted'
  | 'assigned'
  | 'responded'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'escalated';

export type ContentStatus = 
  | 'draft'
  | 'pending_review'
  | 'published'
  | 'unpublished'
  | 'archived';

export type QueryCategory = 
  | 'returns_forms'
  | 'capital_gains'
  | 'assessment_procedure'
  | 'international_taxation'
  | 'transfer_pricing'
  | 'miscellaneous';

export interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  phone: string | null;
  full_name: string;
  membership_number: string | null;
  avatar_url: string | null;
  bio: string | null;
  expertise_areas: string[] | null;
  notification_preferences: {
    push: boolean;
    email: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  assigned_by: string | null;
  assigned_at: string;
}

export interface Publication {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  category: string;
  file_url: string | null;
  thumbnail_url: string | null;
  committee: 'DTC' | 'CITAX';
  status: ContentStatus;
  published_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_type: 'webinar' | 'seminar' | 'conference' | 'workshop';
  committee: 'DTC' | 'CITAX';
  start_date: string;
  end_date: string | null;
  location: string | null;
  online_link: string | null;
  banner_url: string | null;
  speakers: {
    name: string;
    designation: string;
    avatar?: string;
  }[] | null;
  status: ContentStatus;
  max_attendees: number | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  committee: 'DTC' | 'CITAX' | 'BOTH';
  priority: 'low' | 'medium' | 'high' | 'urgent' | null;
  status: ContentStatus;
  published_at: string | null;
  expires_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ForumQuery {
  id: string;
  member_id: string;
  category: QueryCategory;
  subject: string;
  question: string;
  status: QueryStatus;
  assigned_expert_id: string | null;
  assigned_at: string | null;
  escalation_count: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  member?: Profile;
  assigned_expert?: Profile;
  responses?: ForumResponse[];
}

export interface ForumResponse {
  id: string;
  query_id: string;
  expert_id: string;
  response: string;
  status: QueryStatus;
  moderated_by: string | null;
  moderated_at: string | null;
  moderator_notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  expert?: Profile;
  moderator?: Profile;
}

export interface HelpdeskTicket {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  category: string | null;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  action_url: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

// Helper type for role display
export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: 'Super Admin',
  cms_admin: 'CMS Admin',
  cms_editor: 'CMS Editor',
  cms_moderator: 'CMS Moderator',
  registered_member: 'Registered Member',
  expert_panellist: 'Expert Panellist',
  helpdesk_user: 'Helpdesk User',
};

export const CATEGORY_LABELS: Record<QueryCategory, string> = {
  returns_forms: 'Returns & Forms',
  capital_gains: 'Capital Gains',
  assessment_procedure: 'Assessment Procedure',
  international_taxation: 'International Taxation',
  transfer_pricing: 'Transfer Pricing',
  miscellaneous: 'Miscellaneous',
};

export const STATUS_LABELS: Record<QueryStatus, string> = {
  submitted: 'Submitted',
  assigned: 'Assigned',
  responded: 'Responded',
  under_review: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
  escalated: 'Escalated',
};
