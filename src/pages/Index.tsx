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
    <div className="min-h-screen hero-gradient overflow-x-hidden">
      {/* Hero Section */}
      <header className="container pt-6 sm:pt-8 pb-4">
        <div className="flex items-center gap-3">
          <div className="icai-emblem animate-pulse-gold w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
            <Scale className="w-6 h-6 sm:w-8 sm:h-8 text-accent-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-xl font-display font-bold text-primary-foreground leading-tight">
              The Institute of Chartered Accountants of India
            </h1>
            <p className="text-xs sm:text-sm text-primary-foreground/70 mt-1">
              Direct Taxes Committee & Committee on International Taxation
            </p>
          </div>
        </div>
      </header>

      <main className="container py-6 sm:py-8">
        {/* Main CTA */}
        <div className="text-center mb-8 sm:mb-12 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-primary-foreground mb-3 sm:mb-4 px-2">
            DTC & CITAX
            <span className="block text-gradient-gold mt-2">Mobile Application</span>
          </h2>
          <p className="text-sm sm:text-base text-primary-foreground/80 max-w-md mx-auto mb-6 sm:mb-8 px-4">
            A professional platform for ICAI members to access tax resources, 
            participate in discussions, and stay updated with the latest developments.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Button 
              variant="gold" 
              size="lg"
              onClick={() => navigate('/auth')}
              className="group w-full sm:w-auto"
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="hero-outline" 
              size="lg"
              onClick={() => navigate('/auth')}
              className="w-full sm:w-auto"
            >
              Sign In
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8 sm:mb-12">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="glass-dark rounded-xl p-4 sm:p-5 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-10 h-10 rounded-lg bg-accent/30 flex items-center justify-center mb-3">
                <feature.icon className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-semibold text-primary-foreground text-sm sm:text-base mb-1">
                {feature.title}
              </h3>
              <p className="text-xs sm:text-sm text-primary-foreground/80 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Role-Based Access */}
        <div className="glass-dark rounded-xl p-5 sm:p-6 mb-6 sm:mb-8 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-accent" />
            <h3 className="font-display font-semibold text-primary-foreground text-base sm:text-lg">
              Role-Based Access Control
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {roles.map((role) => (
              <span 
                key={role}
                className="px-3 py-1.5 rounded-full bg-accent/20 text-primary-foreground text-xs sm:text-sm border border-accent/30"
              >
                {role}
              </span>
            ))}
          </div>
        </div>

        {/* Demo Info */}
        <div className="text-center text-primary-foreground/70 text-xs sm:text-sm animate-fade-in-up px-4" style={{ animationDelay: '500ms' }}>
          <Users className="w-5 h-5 mx-auto mb-2" />
          <p className="leading-relaxed">
            Production-ready demo with secure authentication,<br className="hidden sm:block" />
            real data flow, and complete moderation workflow.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="container py-4 sm:py-6 text-center">
        <p className="text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} ICAI. Technical Evaluation Demo.
        </p>
      </footer>
    </div>
  );
}
