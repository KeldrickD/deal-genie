'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle, XCircle, Search, UserPlus } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface User {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string | null;
  is_admin?: boolean;
  genie2_access?: boolean;
}

interface AccessManagementProps {
  users: User[];
  adminId: string;
}

export default function AccessManagementPanel({ users: initialUsers, adminId }: AccessManagementProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [userAccess, setUserAccess] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [emailToAdd, setEmailToAdd] = useState('');
  const [addingUser, setAddingUser] = useState(false);
  
  const supabase = createClient();
  
  // Load access status for each user
  useEffect(() => {
    async function loadAccessStatus() {
      const loadingStatus: Record<string, boolean> = {};
      const accessStatus: Record<string, boolean> = {};
      
      for (const user of users) {
        loadingStatus[user.id] = true;
        
        try {
          // Get user's access status
          const { data, error } = await supabase
            .from('profiles')
            .select('is_admin, genie2_access')
            .eq('id', user.id)
            .single();
          
          if (!error && data) {
            user.is_admin = data.is_admin;
            user.genie2_access = data.genie2_access;
            accessStatus[user.id] = data.genie2_access || false;
          }
        } catch (error) {
          console.error(`Error loading access status for user ${user.id}:`, error);
        }
        
        loadingStatus[user.id] = false;
      }
      
      setLoading(loadingStatus);
      setUserAccess(accessStatus);
    }
    
    loadAccessStatus();
  }, [users]);
  
  // Toggle access for a user
  const toggleAccess = async (userId: string) => {
    setLoading(prev => ({ ...prev, [userId]: true }));
    
    try {
      const currentAccess = userAccess[userId] || false;
      const newAccess = !currentAccess;
      
      // Update the user's access
      const response = await fetch(`/api/admin/genie2-access${newAccess ? '' : `?userId=${userId}`}`, {
        method: newAccess ? 'POST' : 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: newAccess ? JSON.stringify({ userId }) : undefined
      });
      
      if (response.ok) {
        setUserAccess(prev => ({ ...prev, [userId]: newAccess }));
        
        // Update the user in the list
        setUsers(prev => 
          prev.map(user => 
            user.id === userId 
              ? { ...user, genie2_access: newAccess } 
              : user
          )
        );
      } else {
        console.error('Error toggling access:', await response.text());
      }
    } catch (error) {
      console.error('Error toggling access:', error);
    }
    
    setLoading(prev => ({ ...prev, [userId]: false }));
  };
  
  // Add a new user by email
  const addUserByEmail = async () => {
    if (!emailToAdd) return;
    
    setAddingUser(true);
    
    try {
      // First find the user by email
      const { data: foundUser, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, created_at')
        .eq('email', emailToAdd)
        .single();
      
      if (error || !foundUser) {
        alert(`No user found with email: ${emailToAdd}`);
        setAddingUser(false);
        return;
      }
      
      // Grant access to the user
      const response = await fetch('/api/admin/genie2-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: foundUser.id })
      });
      
      if (response.ok) {
        // Add the user to the list if not already present
        const exists = users.some(user => user.id === foundUser.id);
        
        if (!exists) {
          setUsers(prev => [
            { ...foundUser, genie2_access: true },
            ...prev
          ]);
        } else {
          // Update existing user
          setUsers(prev => 
            prev.map(user => 
              user.id === foundUser.id 
                ? { ...user, genie2_access: true } 
                : user
            )
          );
        }
        
        setUserAccess(prev => ({ ...prev, [foundUser.id]: true }));
        setEmailToAdd('');
      } else {
        console.error('Error adding user:', await response.text());
        alert('Error granting access. Please try again.');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('An unexpected error occurred. Please try again.');
    }
    
    setAddingUser(false);
  };
  
  // Filter users by search term
  const filteredUsers = searchTerm
    ? users.filter(user => 
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : users;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col gap-6">
        {/* Search and Add User */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users by name or email"
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Input
              value={emailToAdd}
              onChange={(e) => setEmailToAdd(e.target.value)}
              placeholder="Email address"
              className="w-full md:w-64"
            />
            <Button 
              onClick={addUserByEmail} 
              disabled={addingUser || !emailToAdd}
              className="whitespace-nowrap"
            >
              {addingUser ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              Grant Access
            </Button>
          </div>
        </div>
        
        {/* User List */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4">User</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Joined</th>
                <th className="text-left py-3 px-4">Admin</th>
                <th className="text-right py-3 px-4">Genie 2.0 Access</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">
                      {user.full_name || 'Unnamed User'}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {user.email}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {user.created_at 
                        ? new Date(user.created_at).toLocaleDateString() 
                        : 'Unknown'
                      }
                    </td>
                    <td className="py-3 px-4">
                      {user.is_admin ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-300" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {user.id === adminId ? (
                        <span className="text-sm text-gray-500">Self</span>
                      ) : (
                        <Button
                          size="sm"
                          variant={userAccess[user.id] ? "destructive" : "outline"}
                          disabled={loading[user.id]}
                          onClick={() => toggleAccess(user.id)}
                        >
                          {loading[user.id] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : userAccess[user.id] ? (
                            'Remove Access'
                          ) : (
                            'Grant Access'  
                          )}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 