import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ROLE_LABELS, AppRole } from '@/types/database';
import { Search, Shield, MoreVertical, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UserWithRole {
  id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  membership_number: string | null;
  created_at: string;
  role?: AppRole;
}

export default function UserManagement() {
  const { user, role, isLoading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [newRole, setNewRole] = useState<AppRole>('registered_member');
  const [dialogOpen, setDialogOpen] = useState(false);

  const isAdmin = role && ['super_admin', 'cms_admin'].includes(role);
  const isSuperAdmin = role === 'super_admin';

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate('/dashboard');
    }
  }, [user, role, isLoading, navigate, isAdmin]);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      
      // Fetch profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, email, membership_number, created_at')
        .order('created_at', { ascending: false });

      if (profileError) {
        toast.error('Failed to load users');
        console.error(profileError);
        setLoading(false);
        return;
      }

      // Fetch roles
      const { data: roles, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (roleError) {
        console.error(roleError);
      }

      // Merge data
      const usersWithRoles = (profiles || []).map(profile => ({
        ...profile,
        role: roles?.find(r => r.user_id === profile.user_id)?.role as AppRole | undefined,
      }));

      setUsers(usersWithRoles);
      setLoading(false);
    }

    if (user && isAdmin) {
      fetchUsers();
    }
  }, [user, isAdmin]);

  const handleRoleChange = async () => {
    if (!selectedUser || !isSuperAdmin) return;

    const { error } = await supabase
      .from('user_roles')
      .update({ role: newRole, assigned_by: user!.id, assigned_at: new Date().toISOString() })
      .eq('user_id', selectedUser.user_id);

    if (error) {
      toast.error('Failed to update role');
      console.error(error);
    } else {
      toast.success('Role updated successfully');
      setUsers(users.map(u => 
        u.user_id === selectedUser.user_id ? { ...u, role: newRole } : u
      ));
    }
    setDialogOpen(false);
    setSelectedUser(null);
  };

  const filteredUsers = users.filter(u =>
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading || !user || !isAdmin) {
    return null;
  }

  const getRoleBadge = (userRole?: AppRole) => {
    if (!userRole) return <Badge variant="outline">No Role</Badge>;
    
    const colors: Record<AppRole, string> = {
      super_admin: 'bg-red-500 text-white',
      cms_admin: 'bg-purple-500 text-white',
      cms_editor: 'bg-blue-500 text-white',
      cms_moderator: 'bg-orange-500 text-white',
      expert_panellist: 'bg-emerald-500 text-white',
      helpdesk_user: 'bg-cyan-500 text-white',
      registered_member: 'bg-gray-500 text-white',
    };

    return (
      <Badge className={colors[userRole]}>
        {ROLE_LABELS[userRole]}
      </Badge>
    );
  };

  return (
    <AppLayout title="User Management" backButton onBack={() => navigate('/admin')}>
      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* User List */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-8">
          <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No users found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((u) => (
            <Card key={u.id} className="premium-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-accent text-accent-foreground">
                      {u.full_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{u.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getRoleBadge(u.role)}
                      {u.membership_number && (
                        <span className="text-xs text-muted-foreground">
                          #{u.membership_number}
                        </span>
                      )}
                    </div>
                  </div>
                  {isSuperAdmin && u.user_id !== user?.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedUser(u);
                            setNewRole(u.role || 'registered_member');
                            setDialogOpen(true);
                          }}
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          Change Role
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Role Change Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for {selectedUser?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="gold" className="flex-1" onClick={handleRoleChange}>
                Update Role
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
