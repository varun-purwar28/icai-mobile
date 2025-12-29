import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ForumQuery, QueryCategory, CATEGORY_LABELS, STATUS_LABELS } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, Plus, ArrowLeft, Clock, CheckCircle2, 
  AlertCircle, User, Calendar, Filter, Loader2, Send
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';

type QueryWithDetails = ForumQuery & {
  profiles?: { full_name: string } | null;
};

export default function Forum() {
  const { user, role, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [queries, setQueries] = useState<QueryWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // Form state
  const [subject, setSubject] = useState('');
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState<QueryCategory>('miscellaneous');

  const isExpert = role === 'expert_panellist';
  const isModerator = role === 'cms_moderator';
  const isAdmin = role && ['super_admin', 'cms_admin'].includes(role);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchQueries();
    }
  }, [user, role]);

  const fetchQueries = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('forum_queries')
        .select('*')
        .order('created_at', { ascending: false });

      // Members see only their queries, experts/admins see all
      if (role === 'registered_member') {
        query = query.eq('member_id', user?.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setQueries((data || []) as QueryWithDetails[]);
    } catch (error) {
      console.error('Error fetching queries:', error);
      toast({
        title: 'Error',
        description: 'Failed to load queries',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('forum_queries')
        .insert({
          member_id: user.id,
          subject,
          question,
          category,
          status: 'submitted',
        });

      if (error) throw error;

      toast({
        title: 'Query Submitted',
        description: 'Your query has been submitted successfully.',
      });

      setSubject('');
      setQuestion('');
      setCategory('miscellaneous');
      setIsDialogOpen(false);
      fetchQueries();
    } catch (error: any) {
      console.error('Error submitting query:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit query',
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

  const filteredQueries = filterCategory === 'all' 
    ? queries 
    : queries.filter(q => q.category === filterCategory);

  const categories = Object.entries(CATEGORY_LABELS) as [QueryCategory, string][];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <AppLayout title="Discussion Forum">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {role === 'registered_member' && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gold">
                <Plus className="w-4 h-4" />
                New Query
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Submit New Query</DialogTitle>
                <DialogDescription>
                  Ask a question about tax procedures. An expert will respond.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitQuery} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as QueryCategory)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief subject of your query"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="question">Question</Label>
                  <Textarea
                    id="question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Describe your question in detail..."
                    rows={5}
                    required
                  />
                </div>
                <Button type="submit" variant="gold" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Query
                    </>
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Queries List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : filteredQueries.length === 0 ? (
        <Card className="premium-card">
          <CardContent className="py-12 text-center">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Queries Found</h3>
            <p className="text-muted-foreground">
              {role === 'registered_member' 
                ? 'Submit your first query to get expert assistance.'
                : 'No queries available at this time.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredQueries.map((query) => (
            <Card 
              key={query.id} 
              className="premium-card cursor-pointer hover:border-accent/50 transition-colors"
              onClick={() => navigate(`/forum/${query.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground line-clamp-1">
                      {query.subject}
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {query.question}
                    </p>
                  </div>
                  <span className={`status-badge ${getStatusBadge(query.status)} ml-4`}>
                    {STATUS_LABELS[query.status]}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {query.profiles?.full_name || 'Member'}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {CATEGORY_LABELS[query.category]}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(query.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
