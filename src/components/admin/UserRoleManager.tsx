import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, Users, Shield, Crown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCollection } from '../../hooks/useFirestore';
import { setUserRole } from '../../lib/roles';
import { ROLES, UserRole } from '../../lib/types/auth';

interface UserWithRole {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export const UserRoleManager: React.FC = () => {
  const { userRole } = useAuth();
  const { data: users, loading } = useCollection('users');
  const [updating, setUpdating] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (!userRole || userRole !== ROLES.ADMIN) {
      setMessage({ type: 'error', text: 'Only admin users can change roles' });
      return;
    }

    setUpdating(userId);
    setMessage(null);

    try {
      await setUserRole(userId, newRole, userRole);
      setMessage({ type: 'success', text: `Role updated successfully to ${newRole}` });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update role' });
    } finally {
      setUpdating(null);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case ROLES.ADMIN:
        return <Crown className="h-4 w-4" />;
      case ROLES.MANAGER:
        return <Shield className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case ROLES.ADMIN:
        return 'destructive';
      case ROLES.MANAGER:
        return 'default';
      default:
        return 'secondary';
    }
  };

  if (userRole !== ROLES.ADMIN) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Admin access required to manage user roles.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading users...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Role Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {users.map((user: UserWithRole) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {getRoleIcon(user.role)}
                  <Badge variant={getRoleColor(user.role)}>
                    {user.role}
                  </Badge>
                </div>
                <div>
                  <p className="font-medium">{user.displayName || 'No Name'}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Select
                  value={user.role}
                  onValueChange={(newRole: UserRole) => handleRoleChange(user.id, newRole)}
                  disabled={updating === user.id}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ROLES.GUEST}>Guest</SelectItem>
                    <SelectItem value={ROLES.MANAGER}>Manager</SelectItem>
                    <SelectItem value={ROLES.ADMIN}>Admin</SelectItem>
                  </SelectContent>
                </Select>
                {updating === user.id && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
              </div>
            </div>
          ))}
        </div>

        {users.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No users found
          </div>
        )}
      </CardContent>
    </Card>
  );
};