import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { AppRole, ROLE_LABELS } from '@/types/database';
import { Scale, Users, Shield, BookOpen, Loader2 } from 'lucide-react';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<AppRole>('registered_member');
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validationData = isLogin 
        ? { email, password }
        : { email, password, fullName };
      
      authSchema.parse(validationData);

      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: 'Login Failed',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Welcome back!',
            description: 'You have successfully logged in.',
          });
          navigate('/dashboard');
        }
      } else {
        const { error } = await signUp(email, password, fullName, selectedRole);
        if (error) {
          toast({
            title: 'Registration Failed',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Account Created!',
            description: 'You can now access the platform.',
          });
          navigate('/dashboard');
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Validation Error',
          description: error.errors[0].message,
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const availableRoles: AppRole[] = [
    'registered_member',
    'expert_panellist',
    'cms_moderator',
    'cms_editor',
    'cms_admin',
    'helpdesk_user',
    'super_admin',
  ];

  return (
    <div className="min-h-screen hero-gradient flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="flex items-center gap-3">
          <div className="icai-emblem">
            <Scale className="w-8 h-8 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-primary-foreground">ICAI</h1>
            <p className="text-xs text-primary-foreground/70">DTC & CITAX</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md animate-fade-in-up">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-display">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription>
              {isLogin 
                ? 'Sign in to access the DTC & CITAX platform' 
                : 'Register as a new member or expert'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="role">Select Role</Label>
                  <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Choose the role that matches your function for the demo
                  </p>
                </div>
              )}

              <Button 
                type="submit" 
                variant="gold" 
                className="w-full" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {isLogin 
                  ? "Don't have an account? Create one" 
                  : 'Already have an account? Sign in'}
              </button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Features */}
      <footer className="p-6">
        <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
          {[
            { icon: Shield, label: 'Secure' },
            { icon: Users, label: 'Multi-Role' },
            { icon: BookOpen, label: 'Resources' },
            { icon: Scale, label: 'Compliant' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="text-center">
              <div className="w-10 h-10 mx-auto rounded-full bg-primary-foreground/10 flex items-center justify-center mb-1">
                <Icon className="w-5 h-5 text-primary-foreground/70" />
              </div>
              <span className="text-xs text-primary-foreground/60">{label}</span>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
