import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText, Calendar, Bell, Users, MessageSquare, 
  BarChart3, Shield, HelpCircle, ChevronRight, TrendingUp
} from 'lucide-react';

interface DashboardStats {
  publications: number;
  events: number;
  announcements: number;
  users: number;
  pendingQueries: number;
  pendingModeration: number;
  openTickets: number;
}

export default function AdminDashboard() {
  const { user, role, isLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    publications: 0,
    events: 0,
    announcements: 0,
    users: 0,
    pendingQueries: 0,
    pendingModeration: 0,
    openTickets: 0,
  });

  const isAdmin = role && ['super_admin', 'cms_admin', 'cms_editor', 'cms_moderator'].includes(role);

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate('/dashboard');
    }
  }, [user, role, isLoading, navigate, isAdmin]);

  useEffect(() => {
    async function fetchStats() {
      const [
        { count: pubCount },
        { count: eventCount },
        { count: announcementCount },
        { count: userCount },
        { count: pendingQueries },
        { count: pendingModeration },
        { count: openTickets },
      ] = await Promise.all([
        supabase.from('publications').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('announcements').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('forum_queries').select('*', { count: 'exact', head: true }).eq('status', 'submitted'),
        supabase.from('forum_responses').select('*', { count: 'exact', head: true }).eq('status', 'responded'),
        supabase.from('helpdesk_tickets').select('*', { count: 'exact', head: true }).eq('status', 'open'),
      ]);

      setStats({
        publications: pubCount || 0,
        events: eventCount || 0,
        announcements: announcementCount || 0,
        users: userCount || 0,
        pendingQueries: pendingQueries || 0,
        pendingModeration: pendingModeration || 0,
        openTickets: openTickets || 0,
      });
    }

    if (user && isAdmin) {
      fetchStats();
    }
  }, [user, isAdmin]);

  if (isLoading || !user || !isAdmin) {
    return null;
  }

  const statCards = [
    { title: 'Publications', count: stats.publications, icon: FileText, color: 'bg-blue-500', path: '/admin/publications' },
    { title: 'Events', count: stats.events, icon: Calendar, color: 'bg-purple-500', path: '/admin/events' },
    { title: 'Announcements', count: stats.announcements, icon: Bell, color: 'bg-amber-500', path: '/admin/announcements' },
    { title: 'Users', count: stats.users, icon: Users, color: 'bg-emerald-500', path: '/admin/users' },
  ];

  const actionCards = [
    { 
      title: 'Pending Queries', 
      count: stats.pendingQueries, 
      description: 'Queries awaiting assignment',
      icon: MessageSquare, 
      color: 'text-blue-500',
      path: '/admin/forum' 
    },
    { 
      title: 'Moderation Queue', 
      count: stats.pendingModeration, 
      description: 'Responses pending approval',
      icon: Shield, 
      color: 'text-red-500',
      path: '/admin/moderation' 
    },
    { 
      title: 'Open Tickets', 
      count: stats.openTickets, 
      description: 'Helpdesk tickets to resolve',
      icon: HelpCircle, 
      color: 'text-orange-500',
      path: '/admin/helpdesk' 
    },
  ];

  return (
    <AppLayout title="Admin Dashboard" backButton onBack={() => navigate('/dashboard')}>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {statCards.map((stat) => (
          <Card 
            key={stat.title}
            className="premium-card cursor-pointer"
            onClick={() => navigate(stat.path)}
          >
            <CardContent className="p-4">
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold">{stat.count}</p>
              <p className="text-xs text-muted-foreground">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Items */}
      <h3 className="text-lg font-display font-semibold mb-4">Action Required</h3>
      <div className="space-y-3 mb-6">
        {actionCards.map((action) => (
          <Card 
            key={action.title}
            className="premium-card cursor-pointer"
            onClick={() => navigate(action.path)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <action.icon className={`w-6 h-6 ${action.color}`} />
                  <div>
                    <p className="font-semibold">{action.title}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {action.count > 0 && (
                    <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full">
                      {action.count}
                    </span>
                  )}
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <h3 className="text-lg font-display font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="gold" onClick={() => navigate('/admin/publications/new')} className="h-auto py-4">
          <FileText className="w-4 h-4 mr-2" />
          New Publication
        </Button>
        <Button variant="gold" onClick={() => navigate('/admin/events/new')} className="h-auto py-4">
          <Calendar className="w-4 h-4 mr-2" />
          New Event
        </Button>
        <Button variant="outline" onClick={() => navigate('/admin/announcements/new')} className="h-auto py-4">
          <Bell className="w-4 h-4 mr-2" />
          New Announcement
        </Button>
        <Button variant="outline" onClick={() => navigate('/admin/audit-logs')} className="h-auto py-4">
          <BarChart3 className="w-4 h-4 mr-2" />
          Audit Logs
        </Button>
      </div>
    </AppLayout>
  );
}
