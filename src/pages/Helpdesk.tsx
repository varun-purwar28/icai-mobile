import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Plus, HelpCircle, Clock, CheckCircle, AlertCircle,
  MessageSquare, X
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string | null;
  category: string | null;
  created_at: string;
  resolved_at: string | null;
}

export default function Helpdesk() {
  const { user, role, isLoading } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: '',
    priority: 'medium',
  });

  const isHelpdesk = role === 'helpdesk_user';
  const isAdmin = role && ['super_admin', 'cms_admin'].includes(role);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    async function fetchTickets() {
      setLoading(true);
      
      let query = supabase
        .from('helpdesk_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      // If not helpdesk or admin, only show own tickets
      if (!isHelpdesk && !isAdmin) {
        query = query.eq('user_id', user!.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error(error);
      } else {
        setTickets(data || []);
      }
      
      setLoading(false);
    }

    if (user) {
      fetchTickets();
    }
  }, [user, isHelpdesk, isAdmin]);

  const handleSubmit = async () => {
    if (!formData.subject.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    const { data, error } = await supabase
      .from('helpdesk_tickets')
      .insert({
        user_id: user!.id,
        subject: formData.subject,
        description: formData.description,
        category: formData.category || null,
        priority: formData.priority,
        status: 'open',
      })
      .select()
      .single();

    setSubmitting(false);

    if (error) {
      toast.error('Failed to create ticket');
      console.error(error);
    } else {
      toast.success('Ticket created successfully');
      setTickets([data, ...tickets]);
      setSheetOpen(false);
      setFormData({ subject: '', description: '', category: '', priority: 'medium' });
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    const updates: Record<string, unknown> = { status: newStatus };
    if (newStatus === 'closed') {
      updates.resolved_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('helpdesk_tickets')
      .update(updates)
      .eq('id', ticketId);

    if (error) {
      toast.error('Failed to update ticket');
    } else {
      toast.success('Ticket updated');
      setTickets(tickets.map(t => 
        t.id === ticketId ? { ...t, status: newStatus, resolved_at: updates.resolved_at as string } : t
      ));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-blue-500 text-white">Open</Badge>;
      case 'in_progress':
        return <Badge className="bg-warning text-warning-foreground">In Progress</Badge>;
      case 'closed':
        return <Badge className="bg-success text-success-foreground">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string | null) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return null;
    }
  };

  if (isLoading || !user) {
    return null;
  }

  const openTickets = tickets.filter(t => t.status === 'open');
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress');
  const closedTickets = tickets.filter(t => t.status === 'closed');

  return (
    <AppLayout title="Helpdesk" backButton onBack={() => navigate('/dashboard')}>
      {/* New Ticket Button */}
      {!isHelpdesk && !isAdmin && (
        <Button 
          variant="gold" 
          className="w-full mb-6"
          onClick={() => setSheetOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Report an Issue
        </Button>
      )}

      {/* Tickets */}
      <Tabs defaultValue="open">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="open" className="relative">
            Open
            {openTickets.length > 0 && (
              <span className="ml-1 text-xs">({openTickets.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="in_progress">
            In Progress
            {inProgressTickets.length > 0 && (
              <span className="ml-1 text-xs">({inProgressTickets.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="closed">
            Closed
          </TabsTrigger>
        </TabsList>

        {['open', 'in_progress', 'closed'].map((status) => (
          <TabsContent key={status} value={status}>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : tickets.filter(t => t.status === status).length === 0 ? (
              <div className="text-center py-8">
                <HelpCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No {status.replace('_', ' ')} tickets</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets
                  .filter(t => t.status === status)
                  .map((ticket) => (
                    <Card key={ticket.id} className="premium-card">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">{ticket.subject}</h4>
                          <div className="flex gap-1">
                            {getPriorityBadge(ticket.priority)}
                            {getStatusBadge(ticket.status)}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {ticket.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </span>
                          {(isHelpdesk || isAdmin) && ticket.status !== 'closed' && (
                            <div className="flex gap-2">
                              {ticket.status === 'open' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleStatusChange(ticket.id, 'in_progress')}
                                >
                                  Start
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                variant="success"
                                onClick={() => handleStatusChange(ticket.id, 'closed')}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Close
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* New Ticket Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="h-[85vh]">
          <SheetHeader>
            <SheetTitle>Report an Issue</SheetTitle>
            <SheetDescription>
              Describe your issue and we'll get back to you
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Brief description of the issue"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical Issue</SelectItem>
                  <SelectItem value="account">Account Problem</SelectItem>
                  <SelectItem value="content">Content Issue</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(v) => setFormData({ ...formData, priority: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide details about your issue..."
                rows={5}
              />
            </div>
            <Button 
              variant="gold" 
              className="w-full" 
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Ticket'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}
