import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  Clock, User, FileText, Shield, LogIn, LogOut, 
  Edit, Trash2, Eye, Send, CheckCircle
} from 'lucide-react';

interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: unknown;
  ip_address: string | null;
  created_at: string;
  user?: {
    full_name: string;
  };
}

export default function AuditLogs() {
  const { user, role, isLoading } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = role && ['super_admin', 'cms_admin'].includes(role);

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate('/dashboard');
    }
  }, [user, role, isLoading, navigate, isAdmin]);

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error(error);
      } else if (data) {
        const userIds = [...new Set(data.filter(l => l.user_id).map(l => l.user_id))] as string[];
        
        if (userIds.length > 0) {
          const { data: users } = await supabase
            .from('profiles')
            .select('user_id, full_name')
            .in('user_id', userIds);

          setLogs(data.map(log => ({
            ...log,
            user: users?.find(u => u.user_id === log.user_id),
          })) as AuditLog[]);
        } else {
          setLogs(data as AuditLog[]);
        }
      }
      
      setLoading(false);
    }

    if (user && isAdmin) {
      fetchLogs();
    }
  }, [user, isAdmin]);

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login': return <LogIn className="w-4 h-4" />;
      case 'logout': return <LogOut className="w-4 h-4" />;
      case 'create': return <FileText className="w-4 h-4" />;
      case 'update': return <Edit className="w-4 h-4" />;
      case 'delete': return <Trash2 className="w-4 h-4" />;
      case 'view': return <Eye className="w-4 h-4" />;
      case 'publish': return <Send className="w-4 h-4" />;
      case 'approve': return <CheckCircle className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login': return 'bg-success text-success-foreground';
      case 'logout': return 'bg-muted text-muted-foreground';
      case 'create': return 'bg-blue-500 text-white';
      case 'update': return 'bg-amber-500 text-white';
      case 'delete': return 'bg-destructive text-destructive-foreground';
      case 'publish': return 'bg-purple-500 text-white';
      case 'approve': return 'bg-emerald-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading || !user || !isAdmin) {
    return null;
  }

  return (
    <AppLayout title="Audit Logs" backButton onBack={() => navigate('/admin')}>
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-8">
          <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No audit logs found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <Card key={log.id} className="premium-card">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getActionColor(log.action)}`}>
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline">{log.action}</Badge>
                      <span className="text-sm font-medium">{log.entity_type}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {log.user?.full_name || 'System'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(log.created_at).toLocaleString()}
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
