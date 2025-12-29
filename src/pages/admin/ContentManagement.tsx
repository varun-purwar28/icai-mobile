import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Plus, Search, Edit2, Trash2, Eye, EyeOff, 
  FileText, Calendar, Bell, MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ContentType = 'publications' | 'events' | 'announcements';

interface ContentItem {
  id: string;
  title: string;
  status: string;
  created_at: string;
  committee: string;
}

const contentConfig = {
  publications: {
    title: 'Publications',
    icon: FileText,
    fields: ['title', 'category', 'description', 'content'],
  },
  events: {
    title: 'Events',
    icon: Calendar,
    fields: ['title', 'event_type', 'description', 'start_date', 'location'],
  },
  announcements: {
    title: 'Announcements',
    icon: Bell,
    fields: ['title', 'content', 'priority'],
  },
};

export default function ContentManagement() {
  const { type } = useParams<{ type: ContentType }>();
  const { user, role, isLoading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const contentType = type as ContentType;
  const config = contentConfig[contentType];
  const isAdmin = role && ['super_admin', 'cms_admin', 'cms_editor', 'cms_moderator'].includes(role);

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate('/dashboard');
    }
  }, [user, role, isLoading, navigate, isAdmin]);

  useEffect(() => {
    async function fetchContent() {
      if (!contentType || !config) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from(contentType)
        .select('id, title, status, created_at, committee')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Failed to load content');
        console.error(error);
      } else {
        setItems(data || []);
      }
      setLoading(false);
    }

    if (user && isAdmin && contentType) {
      fetchContent();
    }
  }, [user, isAdmin, contentType, config]);

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    const { error } = await supabase
      .from(contentType)
      .update({ 
        status: newStatus,
        published_at: newStatus === 'published' ? new Date().toISOString() : null
      })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success(`Content ${newStatus === 'published' ? 'published' : 'unpublished'}`);
      setItems(items.map(item => 
        item.id === id ? { ...item, status: newStatus } : item
      ));
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from(contentType)
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete content');
    } else {
      toast.success('Content deleted');
      setItems(items.filter(item => item.id !== id));
    }
  };

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading || !user || !isAdmin || !config) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-success text-success-foreground">Published</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'pending_review':
        return <Badge className="bg-warning text-warning-foreground">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AppLayout title={config.title} backButton onBack={() => navigate('/admin')}>
      {/* Search & Add */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder={`Search ${config.title.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="gold" onClick={() => navigate(`/admin/${contentType}/new`)}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Content List */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-8">
          <config.icon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No {config.title.toLowerCase()} found</p>
          <Button 
            variant="gold" 
            className="mt-4"
            onClick={() => navigate(`/admin/${contentType}/new`)}
          >
            Create First {config.title.slice(0, -1)}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <Card key={item.id} className="premium-card">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{item.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(item.status)}
                      <span className="text-xs text-muted-foreground">
                        {item.committee}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/admin/${contentType}/${item.id}`)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusToggle(item.id, item.status)}>
                        {item.status === 'published' ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-2" />
                            Unpublish
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            Publish
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
