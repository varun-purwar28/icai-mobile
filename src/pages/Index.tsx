import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Scale, ChevronRight, Shield, Users, MessageSquare, 
  BookOpen, Calendar, Bell, ArrowRight, Loader2
} from 'lucide-react';

export default function Index() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/dashboard');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const features = [
    {
      icon: MessageSquare,
      title: 'Discussion Forum',
      description: 'Expert-moderated Q&A on tax matters',
    },
    {
      icon: BookOpen,
      title: 'Publications',
      description: 'Access guidance notes & technical guides',
    },
    {
      icon: Calendar,
      title: 'Events',
      description: 'Webinars, seminars & conferences',
    },
    {
      icon: Bell,
      title: 'Announcements',
      description: 'Latest updates & notifications',
    },
  ];

  const roles = [
    'Super Admin',
    'CMS Admin', 
    'CMS Editor',
    'CMS Moderator',
    'Registered Member',
    'Expert Panellist',
    'Helpdesk User',
  ];

  return (
    <div className="min-h-screen hero-gradient overflow-hidden">
      {/* Hero Section */}
      <header className="container pt-8 pb-4">
        <div className="flex items-center gap-3">
          <div className="icai-emblem animate-pulse-gold">
            <Scale className="w-8 h-8 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-primary-foreground">
              The Institute of Chartered Accountants of India
            </h1>
            <p className="text-sm text-primary-foreground/70">
              Direct Taxes Committee & Committee on International Taxation
            </p>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Main CTA */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-primary-foreground mb-4">
            DTC & CITAX
            <span className="block text-gradient-gold mt-2">Mobile Application</span>
          </h2>
          <p className="text-primary-foreground/80 max-w-md mx-auto mb-8">
            A professional platform for ICAI members to access tax resources, 
            participate in discussions, and stay updated with the latest developments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="gold" 
              size="xl"
              onClick={() => navigate('/auth')}
              className="group"
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="hero-outline" 
              size="xl"
              onClick={() => navigate('/auth')}
            >
              Sign In
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-4 mb-12">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="glass rounded-xl p-4 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center mb-3">
                <feature.icon className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-semibold text-primary-foreground text-sm">
                {feature.title}
              </h3>
              <p className="text-xs text-primary-foreground/60 mt-1">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Role-Based Access */}
        <div className="glass rounded-xl p-6 mb-8 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-accent" />
            <h3 className="font-display font-semibold text-primary-foreground">
              Role-Based Access Control
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {roles.map((role) => (
              <span 
                key={role}
                className="px-3 py-1 rounded-full bg-primary-foreground/10 text-primary-foreground/80 text-xs"
              >
                {role}
              </span>
            ))}
          </div>
        </div>

        {/* Demo Info */}
        <div className="text-center text-primary-foreground/60 text-sm animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <Users className="w-5 h-5 mx-auto mb-2" />
          <p>
            Production-ready demo with secure authentication,<br />
            real data flow, and complete moderation workflow.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="container py-6 text-center">
        <p className="text-xs text-primary-foreground/40">
          © {new Date().getFullYear()} ICAI. Technical Evaluation Demo.
        </p>
      </footer>
    </div>
  );
}
