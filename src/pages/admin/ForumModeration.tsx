import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { STATUS_LABELS, CATEGORY_LABELS, QueryStatus, QueryCategory } from '@/types/database';
import { CheckCircle, XCircle, MessageSquare, User, Clock, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PendingResponse {
  id: string;
  response: string;
  status: QueryStatus;
  created_at: string;
  expert_id: string;
  query_id: string;
  query?: {
    subject: string;
    question: string;
    category: QueryCategory;
  };
  expert?: {
    full_name: string;
  };
}

interface PendingQuery {
  id: string;
  subject: string;
  question: string;
  category: QueryCategory;
  status: QueryStatus;
  created_at: string;
  member?: {
    full_name: string;
  };
}

export default function ForumModeration() {
  const { user, role, isLoading } = useAuth();
  const navigate = useNavigate();
  const [responses, setResponses] = useState<PendingResponse[]>([]);
  const [queries, setQueries] = useState<PendingQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState<PendingResponse | null>(null);
  const [moderatorNotes, setModeratorNotes] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const isAdmin = role && ['super_admin', 'cms_admin', 'cms_editor', 'cms_moderator'].includes(role);

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate('/dashboard');
    }
  }, [user, role, isLoading, navigate, isAdmin]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      // Fetch pending responses
      const { data: responseData, error: responseError } = await supabase
        .from('forum_responses')
        .select('id, response, status, created_at, expert_id, query_id')
        .eq('status', 'responded')
        .order('created_at', { ascending: true });

      if (responseError) {
        console.error(responseError);
      }

      // Fetch associated queries and experts
      if (responseData && responseData.length > 0) {
        const queryIds = responseData.map(r => r.query_id);
        const expertIds = responseData.map(r => r.expert_id);

        const [{ data: queriesData }, { data: expertsData }] = await Promise.all([
          supabase.from('forum_queries').select('id, subject, question, category').in('id', queryIds),
          supabase.from('profiles').select('user_id, full_name').in('user_id', expertIds),
        ]);

        const enrichedResponses = responseData.map(r => ({
          ...r,
          query: queriesData?.find(q => q.id === r.query_id),
          expert: expertsData?.find(e => e.user_id === r.expert_id),
        }));

        setResponses(enrichedResponses);
      }

      // Fetch unassigned queries
      const { data: unassignedQueries, error: queryError } = await supabase
        .from('forum_queries')
        .select('id, subject, question, category, status, created_at, member_id')
        .eq('status', 'submitted')
        .order('created_at', { ascending: true });

      if (queryError) {
        console.error(queryError);
      }

      if (unassignedQueries && unassignedQueries.length > 0) {
        const memberIds = unassignedQueries.map(q => q.member_id);
        const { data: membersData } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', memberIds);

        const enrichedQueries = unassignedQueries.map(q => ({
          ...q,
          member: membersData?.find(m => m.user_id === q.member_id),
        }));

        setQueries(enrichedQueries);
      }

      setLoading(false);
    }

    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin]);

  const handleApprove = async () => {
    if (!selectedResponse) return;

    const { error } = await supabase
      .from('forum_responses')
      .update({
        status: 'approved',
        moderated_by: user!.id,
        moderated_at: new Date().toISOString(),
        moderator_notes: moderatorNotes || null,
      })
      .eq('id', selectedResponse.id);

    if (error) {
      toast.error('Failed to approve response');
    } else {
      toast.success('Response approved');
      setResponses(responses.filter(r => r.id !== selectedResponse.id));
      
      // Update query status
      await supabase
        .from('forum_queries')
        .update({ status: 'approved' })
        .eq('id', selectedResponse.query_id);
    }
    setDialogOpen(false);
    setSelectedResponse(null);
    setModeratorNotes('');
  };

  const handleReject = async () => {
    if (!selectedResponse || !moderatorNotes.trim()) {
      toast.error('Please provide rejection reason');
      return;
    }

    const { error } = await supabase
      .from('forum_responses')
      .update({
        status: 'rejected',
        moderated_by: user!.id,
        moderated_at: new Date().toISOString(),
        moderator_notes: moderatorNotes,
      })
      .eq('id', selectedResponse.id);

    if (error) {
      toast.error('Failed to reject response');
    } else {
      toast.success('Response rejected');
      setResponses(responses.filter(r => r.id !== selectedResponse.id));
    }
    setDialogOpen(false);
    setSelectedResponse(null);
    setModeratorNotes('');
  };

  if (isLoading || !user || !isAdmin) {
    return null;
  }

  return (
    <AppLayout title="Forum Moderation" backButton onBack={() => navigate('/admin')}>
      <Tabs defaultValue="responses">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="responses" className="relative">
            Responses
            {responses.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                {responses.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="queries" className="relative">
            Queries
            {queries.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-warning text-warning-foreground text-xs rounded-full flex items-center justify-center">
                {queries.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="responses">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : responses.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 mx-auto text-success mb-4" />
              <p className="text-muted-foreground">No pending responses</p>
            </div>
          ) : (
            <div className="space-y-4">
              {responses.map((response) => (
                <Card key={response.id} className="premium-card">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{response.query?.subject}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {response.query?.category && CATEGORY_LABELS[response.query.category]}
                        </Badge>
                      </div>
                      <Badge className="bg-warning text-warning-foreground">
                        Pending Review
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Original Question:</p>
                      <p className="text-sm">{response.query?.question}</p>
                    </div>
                    <div className="bg-accent/10 p-3 rounded-lg border border-accent/20">
                      <p className="text-xs text-accent mb-1">Expert Response:</p>
                      <p className="text-sm">{response.response}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {response.expert?.full_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(response.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="success" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedResponse(response);
                          setDialogOpen(true);
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="queries">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : queries.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No unassigned queries</p>
            </div>
          ) : (
            <div className="space-y-4">
              {queries.map((query) => (
                <Card key={query.id} className="premium-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{query.subject}</h4>
                      <Badge variant="secondary">
                        {CATEGORY_LABELS[query.category]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {query.question}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {query.member?.full_name}
                      </span>
                      <Button 
                        variant="gold" 
                        size="sm"
                        onClick={() => navigate(`/forum/${query.id}`)}
                      >
                        Assign Expert
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Moderation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Response</DialogTitle>
            <DialogDescription>
              Approve or reject this expert response
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Response:</p>
              <p className="text-sm">{selectedResponse?.response}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Moderator Notes (required for rejection)</label>
              <Textarea
                value={moderatorNotes}
                onChange={(e) => setModeratorNotes(e.target.value)}
                placeholder="Add notes or feedback..."
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <Button 
                variant="destructive" 
                className="flex-1" 
                onClick={handleReject}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button 
                variant="success" 
                className="flex-1" 
                onClick={handleApprove}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
