import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Announcement } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bell, AlertTriangle, Info, AlertCircle, Calendar, Filter, Loader2
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';

export default function Announcements() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCommittee, setFilterCommittee] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchAnnouncements();
    }
  }, [user]);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;
      setAnnouncements((data as Announcement[]) || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Demo announcements
  const demoAnnouncements: Announcement[] = [
    {
      id: '1',
      title: 'Income Tax Bill 2025 - Pre-Budget Memorandum Submission',
      content: 'ICAI invites suggestions from members for the Pre-Budget Memorandum on Income Tax Bill 2025. Please submit your suggestions by 15th January 2025 through the mobile app or email.',
      committee: 'DTC',
      priority: 'urgent',
      status: 'published',
      published_at: new Date().toISOString(),
      expires_at: null,
      created_by: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'OECD Pillar Two Implementation Guidelines',
      content: 'The OECD has released new implementation guidelines for Pillar Two of the global tax framework. CITAX is organizing a webinar to discuss the implications for Indian businesses.',
      committee: 'CITAX',
      priority: 'high',
      status: 'published',
      published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      expires_at: null,
      created_by: 'admin',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      title: 'Updated Guidance Note on Tax Audit Released',
      content: 'The revised Guidance Note on Tax Audit under Section 44AB has been released. Members can download the publication from the Publications section.',
      committee: 'DTC',
      priority: 'medium',
      status: 'published',
      published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      expires_at: null,
      created_by: 'admin',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      title: 'Certificate Course on UAE Corporate Tax - New Batch',
      content: 'Registrations are now open for the next batch of Certificate Course on UAE Corporate Tax. The course will cover all aspects of UAE CT law and compliance requirements.',
      committee: 'CITAX',
      priority: 'medium',
      status: 'published',
      published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      expires_at: null,
      created_by: 'admin',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const displayAnnouncements = announcements.length > 0 ? announcements : demoAnnouncements;

  const filteredAnnouncements = displayAnnouncements.filter(ann => {
    const matchesCommittee = filterCommittee === 'all' || ann.committee === filterCommittee || ann.committee === 'BOTH';
    const matchesPriority = filterPriority === 'all' || ann.priority === filterPriority;
    return matchesCommittee && matchesPriority;
  });

  const getPriorityIcon = (priority: string | null) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case 'high':
        return <AlertCircle className="w-5 h-5 text-warning" />;
      default:
        return <Info className="w-5 h-5 text-accent" />;
    }
  };

  const getPriorityBadge = (priority: string | null) => {
    const classes: Record<string, string> = {
      urgent: 'bg-destructive/10 text-destructive border-destructive/20',
      high: 'bg-warning/10 text-warning border-warning/20',
      medium: 'bg-accent/10 text-accent border-accent/20',
      low: 'bg-muted text-muted-foreground border-border',
    };
    return classes[priority || 'low'] || classes.low;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <AppLayout title="Announcements">
      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <Select value={filterCommittee} onValueChange={setFilterCommittee}>
          <SelectTrigger className="flex-1">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Committee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Committees</SelectItem>
            <SelectItem value="DTC">DTC</SelectItem>
            <SelectItem value="CITAX">CITAX</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Announcements List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <Card className="premium-card">
          <CardContent className="py-12 text-center">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Announcements</h3>
            <p className="text-muted-foreground">Check back later for updates.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement, index) => (
            <Card 
              key={announcement.id} 
              className={`premium-card border-l-4 animate-fade-in-up ${
                announcement.priority === 'urgent' 
                  ? 'border-l-destructive' 
                  : announcement.priority === 'high'
                  ? 'border-l-warning'
                  : 'border-l-accent'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getPriorityIcon(announcement.priority)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold text-foreground">
                        {announcement.title}
                      </h4>
                      <div className="flex gap-2 flex-shrink-0">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getPriorityBadge(announcement.priority)}`}>
                          {announcement.priority || 'Info'}
                        </span>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {announcement.committee}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {announcement.content}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {announcement.published_at 
                          ? new Date(announcement.published_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
