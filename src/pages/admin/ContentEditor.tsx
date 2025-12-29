import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Save, Send } from 'lucide-react';

type ContentType = 'publications' | 'events' | 'announcements';

export default function ContentEditor() {
  const { type, id } = useParams<{ type: ContentType; id: string }>();
  const { user, role, isLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const contentType = type as ContentType;
  const isNew = id === 'new';
  const isAdmin = role && ['super_admin', 'cms_admin', 'cms_editor', 'cms_moderator'].includes(role);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    committee: 'DTC',
    category: '',
    event_type: '',
    start_date: '',
    end_date: '',
    location: '',
    online_link: '',
    priority: 'normal',
    status: 'draft',
  });

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate('/dashboard');
    }
  }, [user, role, isLoading, navigate, isAdmin]);

  useEffect(() => {
    async function fetchContent() {
      if (isNew || !id || !contentType) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from(contentType)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        toast.error('Failed to load content');
        navigate(`/admin/${contentType}`);
      } else if (data) {
        const d = data as Record<string, unknown>;
        setFormData({
          title: (d.title as string) || '',
          description: (d.description as string) || '',
          content: (d.content as string) || '',
          committee: (d.committee as string) || 'DTC',
          category: (d.category as string) || '',
          event_type: (d.event_type as string) || '',
          start_date: d.start_date ? (d.start_date as string).slice(0, 16) : '',
          end_date: d.end_date ? (d.end_date as string).slice(0, 16) : '',
          location: (d.location as string) || '',
          online_link: (d.online_link as string) || '',
          priority: (d.priority as string) || 'normal',
          status: (d.status as string) || 'draft',
        });
      }
      setLoading(false);
    }

    if (user && isAdmin) {
      fetchContent();
    }
  }, [user, isAdmin, id, isNew, contentType, navigate]);

  const handleSave = async (publish: boolean = false) => {
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    setSaving(true);
    const status = publish ? 'published' : formData.status;

    let payload: Record<string, unknown> = {
      title: formData.title,
      committee: formData.committee,
      status,
      ...(publish && { published_at: new Date().toISOString() }),
    };

    if (contentType === 'publications') {
      payload = { ...payload, description: formData.description, content: formData.content, category: formData.category || 'General' };
    } else if (contentType === 'events') {
      payload = { ...payload, description: formData.description, event_type: formData.event_type || 'Webinar', start_date: formData.start_date || new Date().toISOString(), end_date: formData.end_date || null, location: formData.location, online_link: formData.online_link };
    } else if (contentType === 'announcements') {
      payload = { ...payload, content: formData.content, priority: formData.priority };
    }

    let error;
    if (isNew) {
      payload.created_by = user!.id;
      const result = await supabase.from(contentType).insert(payload as never);
      error = result.error;
    } else {
      const result = await supabase.from(contentType).update(payload as never).eq('id', id);
      error = result.error;
    }

    setSaving(false);

    if (error) {
      toast.error('Failed to save content');
    } else {
      toast.success(publish ? 'Content published!' : 'Content saved');
      navigate(`/admin/${contentType}`);
    }
  };

  if (isLoading || loading || !user || !isAdmin) return null;

  const typeLabel = contentType === 'publications' ? 'Publication' : contentType === 'events' ? 'Event' : 'Announcement';

  return (
    <AppLayout title={isNew ? `New ${typeLabel}` : `Edit ${typeLabel}`} backButton onBack={() => navigate(`/admin/${contentType}`)}>
      <Card className="premium-card">
        <CardHeader><CardTitle>Content Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Enter title" />
          </div>
          <div className="space-y-2">
            <Label>Committee</Label>
            <Select value={formData.committee} onValueChange={(v) => setFormData({ ...formData, committee: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DTC">DTC - Direct Taxes</SelectItem>
                <SelectItem value="CITAX">CITAX - International Taxation</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {contentType === 'events' && (
            <>
              <div className="space-y-2">
                <Label>Event Type</Label>
                <Select value={formData.event_type} onValueChange={(v) => setFormData({ ...formData, event_type: v })}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Webinar">Webinar</SelectItem>
                    <SelectItem value="Seminar">Seminar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="datetime-local" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="datetime-local" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Venue or Online" />
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} placeholder="Main content..." rows={6} />
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => handleSave(false)} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />Save Draft
            </Button>
            <Button variant="gold" className="flex-1" onClick={() => handleSave(true)} disabled={saving}>
              <Send className="w-4 h-4 mr-2" />Publish
            </Button>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
