-- Create user roles enum
CREATE TYPE public.app_role AS ENUM (
  'super_admin',
  'cms_admin', 
  'cms_editor',
  'cms_moderator',
  'registered_member',
  'expert_panellist',
  'helpdesk_user'
);

-- Create query status enum
CREATE TYPE public.query_status AS ENUM (
  'submitted',
  'assigned',
  'responded',
  'under_review',
  'approved',
  'rejected',
  'escalated'
);

-- Create content status enum
CREATE TYPE public.content_status AS ENUM (
  'draft',
  'pending_review',
  'published',
  'unpublished',
  'archived'
);

-- Create query category enum
CREATE TYPE public.query_category AS ENUM (
  'returns_forms',
  'capital_gains',
  'assessment_procedure',
  'international_taxation',
  'transfer_pricing',
  'miscellaneous'
);

-- Profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  email TEXT,
  phone TEXT,
  full_name TEXT NOT NULL,
  membership_number TEXT,
  avatar_url TEXT,
  bio TEXT,
  expertise_areas TEXT[],
  notification_preferences JSONB DEFAULT '{"push": true, "email": true}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  assigned_by UUID,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Publications table
CREATE TABLE public.publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  category TEXT NOT NULL,
  file_url TEXT,
  thumbnail_url TEXT,
  committee TEXT NOT NULL CHECK (committee IN ('DTC', 'CITAX')),
  status content_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('webinar', 'seminar', 'conference', 'workshop')),
  committee TEXT NOT NULL CHECK (committee IN ('DTC', 'CITAX')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT,
  online_link TEXT,
  banner_url TEXT,
  speakers JSONB,
  status content_status NOT NULL DEFAULT 'draft',
  max_attendees INTEGER,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Event registrations table
CREATE TABLE public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  attended BOOLEAN DEFAULT false,
  UNIQUE (event_id, user_id)
);

-- Announcements table
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  committee TEXT NOT NULL CHECK (committee IN ('DTC', 'CITAX', 'BOTH')),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status content_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Forum queries table (Discussion Forum)
CREATE TABLE public.forum_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL,
  category query_category NOT NULL,
  subject TEXT NOT NULL,
  question TEXT NOT NULL,
  status query_status NOT NULL DEFAULT 'submitted',
  assigned_expert_id UUID,
  assigned_at TIMESTAMPTZ,
  escalation_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Forum responses table
CREATE TABLE public.forum_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id UUID NOT NULL REFERENCES public.forum_queries(id) ON DELETE CASCADE,
  expert_id UUID NOT NULL,
  response TEXT NOT NULL,
  status query_status NOT NULL DEFAULT 'responded',
  moderated_by UUID,
  moderated_at TIMESTAMPTZ,
  moderator_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helpdesk tickets table
CREATE TABLE public.helpdesk_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to UUID,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helpdesk_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY assigned_at DESC
  LIMIT 1
$$;

-- Function to check if user is admin/moderator
CREATE OR REPLACE FUNCTION public.is_admin_or_moderator(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'cms_admin', 'cms_editor', 'cms_moderator')
  )
$$;

-- Profiles RLS policies
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User roles RLS policies  
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin_or_moderator(auth.uid()));

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can insert own initial role" ON public.user_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Publications RLS policies
CREATE POLICY "Anyone can view published publications" ON public.publications
  FOR SELECT USING (status = 'published' OR public.is_admin_or_moderator(auth.uid()));

CREATE POLICY "Editors can manage publications" ON public.publications
  FOR ALL USING (public.is_admin_or_moderator(auth.uid()));

-- Events RLS policies
CREATE POLICY "Anyone can view published events" ON public.events
  FOR SELECT USING (status = 'published' OR public.is_admin_or_moderator(auth.uid()));

CREATE POLICY "Editors can manage events" ON public.events
  FOR ALL USING (public.is_admin_or_moderator(auth.uid()));

-- Event registrations RLS policies
CREATE POLICY "Users can view own registrations" ON public.event_registrations
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin_or_moderator(auth.uid()));

CREATE POLICY "Users can register for events" ON public.event_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Announcements RLS policies
CREATE POLICY "Anyone can view published announcements" ON public.announcements
  FOR SELECT USING (status = 'published' OR public.is_admin_or_moderator(auth.uid()));

CREATE POLICY "Editors can manage announcements" ON public.announcements
  FOR ALL USING (public.is_admin_or_moderator(auth.uid()));

-- Forum queries RLS policies
CREATE POLICY "Members can view own queries" ON public.forum_queries
  FOR SELECT USING (
    auth.uid() = member_id 
    OR auth.uid() = assigned_expert_id 
    OR public.is_admin_or_moderator(auth.uid())
    OR public.has_role(auth.uid(), 'expert_panellist')
  );

CREATE POLICY "Members can create queries" ON public.forum_queries
  FOR INSERT WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Experts and admins can update queries" ON public.forum_queries
  FOR UPDATE USING (
    auth.uid() = assigned_expert_id 
    OR public.is_admin_or_moderator(auth.uid())
  );

-- Forum responses RLS policies
CREATE POLICY "Approved responses visible to query owner" ON public.forum_responses
  FOR SELECT USING (
    status = 'approved' 
    AND EXISTS (SELECT 1 FROM public.forum_queries WHERE id = query_id AND member_id = auth.uid())
    OR auth.uid() = expert_id
    OR public.is_admin_or_moderator(auth.uid())
    OR public.has_role(auth.uid(), 'expert_panellist')
  );

CREATE POLICY "Experts can create responses" ON public.forum_responses
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'expert_panellist') 
    OR public.is_admin_or_moderator(auth.uid())
  );

CREATE POLICY "Experts and moderators can update responses" ON public.forum_responses
  FOR UPDATE USING (
    auth.uid() = expert_id 
    OR public.has_role(auth.uid(), 'cms_moderator')
    OR public.is_admin_or_moderator(auth.uid())
  );

-- Helpdesk tickets RLS policies
CREATE POLICY "Users can view own tickets" ON public.helpdesk_tickets
  FOR SELECT USING (
    auth.uid() = user_id 
    OR public.has_role(auth.uid(), 'helpdesk_user')
    OR public.is_admin_or_moderator(auth.uid())
  );

CREATE POLICY "Users can create tickets" ON public.helpdesk_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Helpdesk can update tickets" ON public.helpdesk_tickets
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'helpdesk_user')
    OR public.is_admin_or_moderator(auth.uid())
  );

-- Audit logs RLS policies
CREATE POLICY "Only admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (public.is_admin_or_moderator(auth.uid()));

CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- Notifications RLS policies
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_publications_updated_at
  BEFORE UPDATE ON public.publications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forum_queries_updated_at
  BEFORE UPDATE ON public.forum_queries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forum_responses_updated_at
  BEFORE UPDATE ON public.forum_responses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_helpdesk_tickets_updated_at
  BEFORE UPDATE ON public.helpdesk_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user registration (creates profile and assigns default role)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User')
  );
  
  -- Assign default role based on metadata or default to registered_member
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id, 
    COALESCE(
      (NEW.raw_user_meta_data->>'role')::app_role, 
      'registered_member'
    )
  );
  
  RETURN NEW;
END;
$$;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_queries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_responses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;