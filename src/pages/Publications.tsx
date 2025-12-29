import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Publication } from '@/types/database';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BookOpen, Search, FileText, Download, Calendar, Filter, Loader2, ExternalLink
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';

export default function Publications() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [publications, setPublications] = useState<Publication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCommittee, setFilterCommittee] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchPublications();
    }
  }, [user]);

  const fetchPublications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('publications')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;
      setPublications((data as Publication[]) || []);
    } catch (error) {
      console.error('Error fetching publications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ['Guidance Notes', 'Technical Guides', 'Tax Times', 'Background Material', 'Other'];

  const filteredPublications = publications.filter(pub => {
    const matchesSearch = pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (pub.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCommittee = filterCommittee === 'all' || pub.committee === filterCommittee;
    const matchesCategory = filterCategory === 'all' || pub.category === filterCategory;
    return matchesSearch && matchesCommittee && matchesCategory;
  });

  // Demo data for display
  const demoPublications: Publication[] = [
    {
      id: '1',
      title: 'Guidance Note on Tax Audit under Section 44AB',
      description: 'Comprehensive guidance for tax audit procedures under Section 44AB of the Income-tax Act, 1961',
      content: null,
      category: 'Guidance Notes',
      file_url: null,
      thumbnail_url: null,
      committee: 'DTC',
      status: 'published',
      published_at: '2024-12-01',
      created_by: 'admin',
      created_at: '2024-12-01',
      updated_at: '2024-12-01',
    },
    {
      id: '2',
      title: 'Technical Guide on BEPS Action Plans',
      description: 'Understanding Base Erosion and Profit Shifting (BEPS) Action Plans and Multilateral Instrument',
      content: null,
      category: 'Technical Guides',
      file_url: null,
      thumbnail_url: null,
      committee: 'CITAX',
      status: 'published',
      published_at: '2024-11-15',
      created_by: 'admin',
      created_at: '2024-11-15',
      updated_at: '2024-11-15',
    },
    {
      id: '3',
      title: 'Monthly Tax Times - December 2024',
      description: 'Latest updates and developments in direct taxation for December 2024',
      content: null,
      category: 'Tax Times',
      file_url: null,
      thumbnail_url: null,
      committee: 'DTC',
      status: 'published',
      published_at: '2024-12-10',
      created_by: 'admin',
      created_at: '2024-12-10',
      updated_at: '2024-12-10',
    },
    {
      id: '4',
      title: 'Certificate Course on UAE Corporate Tax',
      description: 'Background material for the Certificate Course on UAE Corporate Tax',
      content: null,
      category: 'Background Material',
      file_url: null,
      thumbnail_url: null,
      committee: 'CITAX',
      status: 'published',
      published_at: '2024-10-20',
      created_by: 'admin',
      created_at: '2024-10-20',
      updated_at: '2024-10-20',
    },
  ];

  const displayPublications = filteredPublications.length > 0 ? filteredPublications : demoPublications;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <AppLayout title="Publications">
      {/* Search & Filters */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search publications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-3">
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
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Publications List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : (
        <div className="space-y-4">
          {displayPublications.map((pub, index) => (
            <Card 
              key={pub.id} 
              className="premium-card cursor-pointer hover:border-accent/50 transition-colors animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-foreground line-clamp-2">
                        {pub.title}
                      </h4>
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary flex-shrink-0">
                        {pub.committee}
                      </span>
                    </div>
                    {pub.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {pub.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {pub.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {pub.published_at ? new Date(pub.published_at).toLocaleDateString() : 'N/A'}
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
