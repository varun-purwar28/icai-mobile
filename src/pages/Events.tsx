import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, MapPin, Clock, Users, Video, Filter, 
  Loader2, ExternalLink, CheckCircle2
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';

export default function Events() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCommittee, setFilterCommittee] = useState<string>('all');
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchEvents();
      fetchRegistrations();
    }
  }, [user]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .order('start_date', { ascending: true });

      if (error) throw error;
      setEvents((data as Event[]) || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('event_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setRegisteredEvents(data?.map(r => r.event_id) || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  const handleRegister = async (eventId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: eventId,
          user_id: user.id,
        });

      if (error) throw error;

      setRegisteredEvents([...registeredEvents, eventId]);
      toast({
        title: 'Registered Successfully',
        description: 'You have been registered for this event.',
      });
    } catch (error: any) {
      console.error('Error registering:', error);
      toast({
        title: 'Registration Failed',
        description: error.message || 'Could not register for this event.',
        variant: 'destructive',
      });
    }
  };

  const eventTypes = ['webinar', 'seminar', 'conference', 'workshop'];

  // Demo data
  const demoEvents: Event[] = [
    {
      id: '1',
      title: 'Webinar on Income Tax Bill 2025',
      description: 'A comprehensive overview of the new Income Tax Bill 2025 and its implications for taxpayers.',
      event_type: 'webinar',
      committee: 'DTC',
      start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: null,
      location: null,
      online_link: 'https://icai.org/webinar',
      banner_url: null,
      speakers: [{ name: 'CA. Rajesh Kumar', designation: 'Chairman, DTC' }],
      status: 'published',
      max_attendees: 500,
      created_by: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'International Taxation Conference 2025',
      description: 'Annual conference on international taxation developments and cross-border transactions.',
      event_type: 'conference',
      committee: 'CITAX',
      start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'ICAI Bhawan, New Delhi',
      online_link: null,
      banner_url: null,
      speakers: [
        { name: 'CA. Suresh Mehta', designation: 'Vice Chairman, CITAX' },
        { name: 'CA. Priya Sharma', designation: 'Partner, Big 4' }
      ],
      status: 'published',
      max_attendees: 200,
      created_by: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'Workshop on Transfer Pricing',
      description: 'Hands-on workshop covering transfer pricing documentation and compliance requirements.',
      event_type: 'workshop',
      committee: 'CITAX',
      start_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: null,
      location: 'Virtual',
      online_link: 'https://icai.org/workshop',
      banner_url: null,
      speakers: [{ name: 'CA. Amit Verma', designation: 'Transfer Pricing Expert' }],
      status: 'published',
      max_attendees: 100,
      created_by: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const displayEvents = events.length > 0 ? events : demoEvents;

  const filteredEvents = displayEvents.filter(event => {
    const matchesType = filterType === 'all' || event.event_type === filterType;
    const matchesCommittee = filterCommittee === 'all' || event.committee === filterCommittee;
    return matchesType && matchesCommittee;
  });

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      webinar: 'bg-blue-500',
      seminar: 'bg-purple-500',
      conference: 'bg-amber-500',
      workshop: 'bg-emerald-500',
    };
    return colors[type] || 'bg-primary';
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <AppLayout title="Events">
      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="flex-1">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Event Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {eventTypes.map(type => (
              <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterCommittee} onValueChange={setFilterCommittee}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Committee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Committees</SelectItem>
            <SelectItem value="DTC">DTC</SelectItem>
            <SelectItem value="CITAX">CITAX</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Events List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <Card className="premium-card">
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Events Found</h3>
            <p className="text-muted-foreground">Check back later for upcoming events.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event, index) => {
            const isRegistered = registeredEvents.includes(event.id);
            const isPast = new Date(event.start_date) < new Date();
            
            return (
              <Card 
                key={event.id} 
                className="premium-card overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`h-2 ${getEventTypeColor(event.event_type)}`} />
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-xs font-medium text-accent uppercase">
                        {event.event_type} • {event.committee}
                      </span>
                      <h4 className="font-semibold text-foreground mt-1">
                        {event.title}
                      </h4>
                    </div>
                  </div>

                  {event.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {event.description}
                    </p>
                  )}

                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        {new Date(event.start_date).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {event.online_link ? (
                        <>
                          <Video className="w-4 h-4" />
                          <span>Online Event</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-4 h-4" />
                          <span>{event.location || 'TBA'}</span>
                        </>
                      )}
                    </div>
                    {event.max_attendees && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>Max {event.max_attendees} attendees</span>
                      </div>
                    )}
                  </div>

                  {!isPast && (
                    <Button
                      variant={isRegistered ? 'secondary' : 'gold'}
                      className="w-full"
                      disabled={isRegistered}
                      onClick={() => handleRegister(event.id)}
                    >
                      {isRegistered ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Registered
                        </>
                      ) : (
                        'Register Now'
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
