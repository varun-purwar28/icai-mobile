import { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Scale, ArrowLeft, Home, MessageSquare, BookOpen, 
  Calendar, Bell, Settings, HelpCircle, LogOut, Menu
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ROLE_LABELS } from '@/types/database';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  backButton?: boolean;
  onBack?: () => void;
}

export default function AppLayout({ children, title, backButton, onBack }: AppLayoutProps) {
  const { user, profile, role, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = role && ['super_admin', 'cms_admin', 'cms_editor', 'cms_moderator'].includes(role);

  const navItems = [
    { icon: Home, label: 'Home', path: '/dashboard', show: true },
    { icon: MessageSquare, label: 'Forum', path: '/forum', show: true },
    { icon: BookOpen, label: 'Publications', path: '/publications', show: true },
    { icon: Calendar, label: 'Events', path: '/events', show: true },
    { icon: Bell, label: 'Announcements', path: '/announcements', show: true },
    { icon: HelpCircle, label: 'Helpdesk', path: '/helpdesk', show: true },
    { icon: Settings, label: 'Admin', path: '/admin', show: isAdmin },
  ].filter(item => item.show);

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <header className="hero-gradient text-primary-foreground sticky top-0 z-50">
        <div className="container py-3 md:py-4">
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
              <div className="icai-emblem w-9 h-9 md:w-10 md:h-10">
                <Scale className="w-4 h-4 md:w-5 md:h-5 text-accent-foreground" />
              </div>
              <div>
                <h1 className="text-base md:text-lg font-display font-bold truncate max-w-[180px] md:max-w-none">
                  {title || 'ICAI DTC & CITAX'}
                </h1>
              </div>
            </div>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.slice(0, 5).map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(item.path)}
                    className={`text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 ${isActive ? 'bg-primary-foreground/10 text-primary-foreground' : ''}`}
                  >
                    <item.icon className="w-4 h-4 mr-1" />
                    {item.label}
                  </Button>
                );
              })}
              {isAdmin && (
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => navigate('/admin')}
                  className="ml-2"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Admin
                </Button>
              )}
            </nav>

            {/* Mobile Menu */}
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  {profile && (
                    <div className="px-2 py-3 mb-4 bg-muted rounded-lg">
                      <p className="font-semibold">{profile.full_name}</p>
                      <p className="text-xs text-muted-foreground">{role && ROLE_LABELS[role]}</p>
                    </div>
                  )}
                  <div className="space-y-1">
                    {navItems.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <button
                          key={item.path}
                          onClick={() => handleNavigation(item.path)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                            isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="border-t mt-4 pt-4">
                    <button
                      onClick={() => { signOut(); setMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={signOut}
              className="hidden md:flex text-primary-foreground hover:bg-primary-foreground/10"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-4 md:py-6">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 md:hidden">
        <div className="grid grid-cols-5 gap-1 px-2 py-1.5 pb-safe">
          {navItems.slice(0, 5).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-0.5 py-1.5 rounded-lg transition-colors ${
                  isActive ? 'text-accent' : 'text-muted-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] leading-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
