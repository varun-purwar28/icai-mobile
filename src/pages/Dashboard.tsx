import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_LABELS } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Scale, LogOut, FileText, Calendar, MessageSquare, 
  Users, Bell, Settings, ChevronRight, BookOpen,
  Shield, Briefcase, HelpCircle, BarChart3
} from 'lucide-react';

export default function Dashboard() {
  const { user, profile, role, isLoading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-center">
          <Scale className="w-12 h-12 mx-auto text-accent mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const isAdmin = role && ['super_admin', 'cms_admin', 'cms_editor', 'cms_moderator'].includes(role);
  const isExpert = role === 'expert_panellist';
  const isModerator = role === 'cms_moderator';
  const isHelpdesk = role === 'helpdesk_user';

  const quickActions = [
    { 
      title: 'Discussion Forum', 
      description: isExpert ? 'View assigned queries' : 'Submit a tax query',
      icon: MessageSquare,
      color: 'bg-blue-500',
      path: '/forum',
      show: true,
    },
    { 
      title: 'Publications', 
      description: 'Access tax resources',
      icon: BookOpen,
      color: 'bg-emerald-500',
      path: '/publications',
      show: true,
    },
    { 
      title: 'Events', 
      description: 'Webinars & seminars',
      icon: Calendar,
      color: 'bg-purple-500',
      path: '/events',
      show: true,
    },
    { 
      title: 'Announcements', 
      description: 'Latest updates',
      icon: Bell,
      color: 'bg-amber-500',
      path: '/announcements',
      show: true,
    },
    { 
      title: 'Moderation Queue', 
      description: 'Review pending responses',
      icon: Shield,
      color: 'bg-red-500',
      path: '/forum',
      show: isModerator || isAdmin,
    },
  ].filter(action => action.show);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="hero-gradient text-primary-foreground">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="icai-emblem">
                <Scale className="w-8 h-8 text-accent-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold">ICAI DTC & CITAX</h1>
                <p className="text-xs text-primary-foreground/70">Mobile Application</p>
              </div>
            </div>
            <Button 
              variant="hero-outline" 
              size="sm"
              onClick={signOut}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Welcome Section */}
      <section className="container py-8">
        <div className="premium-card p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-display font-semibold text-foreground">
                Welcome, {profile.full_name}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="status-badge status-approved">
                  <Briefcase className="w-3 h-3" />
                  {role ? ROLE_LABELS[role] : 'Member'}
                </span>
                {profile.membership_number && (
                  <span className="text-sm text-muted-foreground">
                    #{profile.membership_number}
                  </span>
                )}
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-accent" />
            </div>
          </div>
        </div>
      </section>

      {/* Committee Selection */}
      <section className="container pb-8">
        <h3 className="text-lg font-display font-semibold mb-4">Select Committee</h3>
        <div className="grid grid-cols-2 gap-4">
          <Card className="premium-card cursor-pointer hover:border-accent transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">DTC</CardTitle>
              <CardDescription>Direct Taxes Committee</CardDescription>
            </CardHeader>
            <CardContent>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card className="premium-card cursor-pointer hover:border-accent transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">CITAX</CardTitle>
              <CardDescription>International Taxation</CardDescription>
            </CardHeader>
            <CardContent>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="container pb-8">
        <h3 className="text-lg font-display font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Card 
              key={action.title} 
              className="premium-card cursor-pointer"
              onClick={() => navigate(action.path)}
            >
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-semibold text-sm">{action.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Demo Info */}
      <section className="container pb-8">
        <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
          <h4 className="font-semibold text-accent flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Demo Mode Active
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            This is a demonstration of the ICAI DTC & CITAX mobile application 
            with role-based access control, discussion forum, and content management.
          </p>
        </div>
      </section>
    </div>
  );
}
