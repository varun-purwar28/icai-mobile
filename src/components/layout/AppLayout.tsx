import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Scale, ArrowLeft, Home, MessageSquare, BookOpen, 
  Calendar, Bell, Settings, HelpCircle, LogOut, Users, Shield
} from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  backButton?: boolean;
  onBack?: () => void;
}

export default function AppLayout({ children, title, backButton, onBack }: AppLayoutProps) {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = role && ['super_admin', 'cms_admin', 'cms_editor', 'cms_moderator'].includes(role);
  const isExpert = role === 'expert_panellist';
  const isHelpdesk = role === 'helpdesk_user';

  const navItems = [
    { icon: Home, label: 'Home', path: '/dashboard', show: true },
    { icon: MessageSquare, label: 'Forum', path: '/forum', show: true },
    { icon: BookOpen, label: 'Publications', path: '/publications', show: true },
    { icon: Calendar, label: 'Events', path: '/events', show: true },
    { icon: Bell, label: 'Announcements', path: '/announcements', show: true },
    { icon: Shield, label: 'Moderation', path: '/moderation', show: role === 'cms_moderator' || isAdmin },
    { icon: Settings, label: 'Admin', path: '/admin', show: isAdmin },
    { icon: HelpCircle, label: 'Helpdesk', path: '/helpdesk', show: isHelpdesk || isAdmin },
  ].filter(item => item.show);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="hero-gradient text-primary-foreground sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center gap-3">
            {backButton && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleBack}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div className="flex items-center gap-3 flex-1">
              <div className="icai-emblem w-10 h-10">
                <Scale className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-display font-bold">
                  {title || 'ICAI DTC & CITAX'}
                </h1>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={signOut}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="container">
          <div className="flex items-center justify-around py-2">
            {navItems.slice(0, 5).map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                    isActive 
                      ? 'text-accent' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-[10px]">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
