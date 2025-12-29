import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ForumQuery, ForumResponse, CATEGORY_LABELS, STATUS_LABELS } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, ArrowLeft, User, Calendar, Clock,
  CheckCircle2, XCircle, Send, Loader2, AlertTriangle, Shield
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';

type QueryWithDetails = ForumQuery & {
  profiles?: { full_name: string } | null;
};

type ResponseWithDetails = ForumResponse & {
  profiles?: { full_name: string } | null;
};

export default function ForumDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, role, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [query, setQuery] = useState<QueryWithDetails | null>(null);
  const [responses, setResponses] = useState<ResponseWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [moderatorNotes, setModeratorNotes] = useState('');

  const isExpert = role === 'expert_panellist';
  const isModerator = role === 'cms_moderator';
  const isAdmin = role && ['super_admin', 'cms_admin'].includes(role);
  const canRespond = isExpert || isAdmin;
  const canModerate = isModerator || isAdmin;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (id && user) {
      fetchQueryDetails();
    }
  }, [id, user]);

  const fetchQueryDetails = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      // Fetch query
      const { data: queryData, error: queryError } = await supabase
        .from('forum_queries')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (queryError) throw queryError;
      if (!queryData) {
        toast({ title: 'Query not found', variant: 'destructive' });
        navigate('/forum');
        return;
      }
      
      setQuery(queryData as QueryWithDetails);

      // Fetch responses
      const { data: responseData, error: responseError } = await supabase
        .from('forum_responses')
        .select('*')
        .eq('query_id', id)
        .order('created_at', { ascending: true });

      if (responseError) throw responseError;
      setResponses((responseData || []) as ResponseWithDetails[]);
    } catch (error) {
      console.error('Error fetching query:', error);
      toast({
        title: 'Error',
        description: 'Failed to load query details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitResponse = async () => {
    if (!user || !query || !responseText.trim()) return;

    setIsSubmitting(true);
    try {
      // Insert response
      const { error: responseError } = await supabase
        .from('forum_responses')
        .insert({
          query_id: query.id,
          expert_id: user.id,
          response: responseText,
          status: 'responded',
        });

      if (responseError) throw responseError;

      // Update query status
      const { error: updateError } = await supabase
        .from('forum_queries')
        .update({ 
          status: 'responded',
          assigned_expert_id: user.id,
          assigned_at: new Date().toISOString(),
        })
        .eq('id', query.id);

      if (updateError) throw updateError;

      toast({
        title: 'Response Submitted',
        description: 'Your response has been submitted for moderation.',
      });

      setResponseText('');
      fetchQueryDetails();
    } catch (error: any) {
      console.error('Error submitting response:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit response',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModerate = async (responseId: string, action: 'approve' | 'reject') => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      
      // Update response
      const { error: responseError } = await supabase
        .from('forum_responses')
        .update({
          status: newStatus,
          moderated_by: user.id,
          moderated_at: new Date().toISOString(),
          moderator_notes: moderatorNotes || null,
        })
        .eq('id', responseId);

      if (responseError) throw responseError;

      // Update query status if approved
      if (action === 'approve' && query) {
        const { error: updateError } = await supabase
          .from('forum_queries')
          .update({ status: 'approved' })
          .eq('id', query.id);

        if (updateError) throw updateError;
      }

      toast({
        title: action === 'approve' ? 'Response Approved' : 'Response Rejected',
        description: action === 'approve' 
          ? 'The response is now visible to the member.'
          : 'The response has been rejected.',
      });

      setModeratorNotes('');
      fetchQueryDetails();
    } catch (error: any) {
      console.error('Error moderating response:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to moderate response',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      submitted: 'status-submitted',
      assigned: 'status-assigned',
      responded: 'status-responded',
      under_review: 'status-responded',
      approved: 'status-approved',
      rejected: 'status-rejected',
      escalated: 'status-rejected',
    };
    return statusClasses[status] || 'status-submitted';
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!query) {
    return null;
  }

  const isMember = query.member_id === user?.id;
  const approvedResponses = responses.filter(r => r.status === 'approved');
  const pendingResponses = responses.filter(r => r.status === 'responded');

  return (
    <AppLayout 
      title="Query Details"
      backButton
      onBack={() => navigate('/forum')}
    >
      {/* Query Card */}
      <Card className="premium-card mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{query.subject}</CardTitle>
              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {query.profiles?.full_name || 'Member'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(query.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <span className={`status-badge ${getStatusBadge(query.status)}`}>
              {STATUS_LABELS[query.status]}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <span className="text-xs font-medium text-accent">
              {CATEGORY_LABELS[query.category]}
            </span>
          </div>
          <p className="text-foreground whitespace-pre-wrap">{query.question}</p>
        </CardContent>
      </Card>

      {/* Approved Responses (Visible to member) */}
      {approvedResponses.length > 0 && (
        <div className="mb-6">
          <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success" />
            Expert Response
          </h3>
          {approvedResponses.map((response) => (
            <Card key={response.id} className="premium-card border-success/30 bg-success/5">
              <CardContent className="p-4">
                <p className="text-foreground whitespace-pre-wrap mb-4">
                  {response.response}
                </p>
                <Separator className="my-4" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    Expert Response
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(response.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-3 italic">
                  Disclaimer: The views expressed are not those of ICAI.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pending Responses (Visible to moderators) */}
      {canModerate && pendingResponses.length > 0 && (
        <div className="mb-6">
          <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-warning" />
            Pending Moderation
          </h3>
          {pendingResponses.map((response) => (
            <Card key={response.id} className="premium-card border-warning/30">
              <CardContent className="p-4">
                <p className="text-foreground whitespace-pre-wrap mb-4">
                  {response.response}
                </p>
                <div className="text-sm text-muted-foreground mb-4">
                  Responded by: {response.profiles?.full_name || 'Expert'}
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="notes">Moderator Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={moderatorNotes}
                      onChange={(e) => setModeratorNotes(e.target.value)}
                      placeholder="Add notes about this moderation decision..."
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="success"
                      onClick={() => handleModerate(response.id, 'approve')}
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleModerate(response.id, 'reject')}
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Expert Response Form */}
      {canRespond && query.status !== 'approved' && (
        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Submit Response
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="response">Your Response</Label>
              <Textarea
                id="response"
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Provide a detailed response to this query..."
                rows={6}
              />
            </div>
            <Button
              variant="gold"
              onClick={handleSubmitResponse}
              disabled={isSubmitting || !responseText.trim()}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Response
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              Your response will be reviewed by a moderator before being shown to the member.
            </p>
          </CardContent>
        </Card>
      )}

      {/* No response yet for member */}
      {isMember && responses.length === 0 && (
        <Card className="premium-card">
          <CardContent className="py-8 text-center">
            <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">Awaiting Expert Response</h3>
            <p className="text-muted-foreground text-sm">
              An expert will respond to your query soon. You'll be notified when there's an update.
            </p>
          </CardContent>
        </Card>
      )}
    </AppLayout>
  );
}
