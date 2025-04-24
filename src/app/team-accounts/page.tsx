'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Lock, Shield, Workflow, LineChart, UserPlus, Settings, ClipboardList, Eye, EyeOff, InfoIcon, Briefcase, Share2, Activity, BarChart3, FileCog, Building, MessagesSquare, Check, Calendar } from 'lucide-react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  ShieldCheck,
  Bell,
  FileText,
  Home,
  UserCheck,
  UserX,
  CheckCircle2,
  Clock
} from 'lucide-react'

export default function TeamAccountsPage() {
  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">Team Accounts</h1>
          <Badge className="bg-amber-500 hover:bg-amber-600">Coming Soon</Badge>
        </div>
        <p className="text-muted-foreground">
          Collaborate with your team, share deals, and manage permissions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-1 md:col-span-2">
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6 text-white">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Users className="h-6 w-6" />
                Supercharge Your Investment Team
              </h2>
              <p className="max-w-3xl opacity-90">
                Enhance collaboration and streamline your real estate investment workflows with 
                Team Accounts. Share deals, assign tasks, customize permissions, and track activity 
                all in one centralized platform.
              </p>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-md">
                    <Users className="h-5 w-5 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Shared Dashboards</h3>
                    <p className="text-sm text-muted-foreground">
                      Create custom dashboards for your entire team to track deals, metrics, and activities
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-md">
                    <ShieldCheck className="h-5 w-5 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Role-Based Permissions</h3>
                    <p className="text-sm text-muted-foreground">
                      Control what each team member can see and do with granular permission settings
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-md">
                    <Bell className="h-5 w-5 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Activity Feed & Notifications</h3>
                    <p className="text-sm text-muted-foreground">
                      Stay updated on important team activities, deal changes, and assignments
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Team Roles & Permissions
            </CardTitle>
            <CardDescription>
              Customize access for every team member
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 pb-4 border-b">
              <div className="w-10 h-10 rounded-md bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Settings className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Admin</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Full access to all features, settings, billing, and user management
                </p>
                <div className="flex gap-1 flex-wrap">
                  <Badge variant="outline" className="text-xs">Invite Users</Badge>
                  <Badge variant="outline" className="text-xs">Manage Billing</Badge>
                  <Badge variant="outline" className="text-xs">Set Permissions</Badge>
                  <Badge variant="outline" className="text-xs">All Features</Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 pb-4 border-b">
              <div className="w-10 h-10 rounded-md bg-green-100 flex items-center justify-center flex-shrink-0">
                <LineChart className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Analyst</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Full access to deal analysis features, limited access to team management
                </p>
                <div className="flex gap-1 flex-wrap">
                  <Badge variant="outline" className="text-xs">Run Analysis</Badge>
                  <Badge variant="outline" className="text-xs">View All Deals</Badge>
                  <Badge variant="outline" className="text-xs">Create Reports</Badge>
                  <Badge variant="outline" className="text-xs">Read-Only Team</Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 pb-4 border-b">
              <div className="w-10 h-10 rounded-md bg-amber-100 flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Deal Manager</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Can create and manage deals, generate offers, and track progress
                </p>
                <div className="flex gap-1 flex-wrap">
                  <Badge variant="outline" className="text-xs">Create Deals</Badge>
                  <Badge variant="outline" className="text-xs">Generate Offers</Badge>
                  <Badge variant="outline" className="text-xs">Update Status</Badge>
                  <Badge variant="outline" className="text-xs">Limited Analytics</Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-md bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Home className="h-5 w-5 text-purple-700" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Agent</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Limited access to specific deals and properties they're involved with
                </p>
                <div className="flex gap-1 flex-wrap">
                  <Badge variant="outline" className="text-xs">View Assigned Deals</Badge>
                  <Badge variant="outline" className="text-xs">Add Comments</Badge>
                  <Badge variant="outline" className="text-xs">Update Status</Badge>
                  <Badge variant="outline" className="text-xs">No Admin Access</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Team Activity Dashboard
            </CardTitle>
            <CardDescription>
              Track performance and engagement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-100 rounded-md p-4 mb-4">
              <h3 className="text-sm font-medium mb-3">Team Performance Overview</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Deals Analyzed</span>
                    <span className="font-medium">86</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Offers Generated</span>
                    <span className="font-medium">32</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full rounded-full" style={{ width: '50%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Deals Closed</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <h3 className="text-sm font-medium mb-3">Recent Team Activity</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>JS</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm"><span className="font-medium">John Smith</span> analyzed a new property in Houston, TX</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>MJ</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm"><span className="font-medium">Mary Johnson</span> generated an offer for 123 Main St</p>
                  <p className="text-xs text-muted-foreground">5 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>RD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm"><span className="font-medium">Robert Davis</span> added a new contact to the CRM</p>
                  <p className="text-xs text-muted-foreground">Yesterday</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>LW</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm"><span className="font-medium">Lisa Wang</span> closed a deal on 456 Oak Ave</p>
                  <p className="text-xs text-muted-foreground">2 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Team Management
            </CardTitle>
            <CardDescription>Add and manage team members</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-2 rounded-md border">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>YS</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">You (Account Owner)</p>
                  <p className="text-xs text-muted-foreground">Admin</p>
                </div>
              </div>
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Owner</Badge>
            </div>
            
            <div className="rounded-md border p-4">
              <h3 className="text-sm font-medium mb-2">Invite Team Members</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Add your colleagues, agents, or partners to collaborate on deals.
              </p>
              <div className="flex gap-2">
                <input type="text" placeholder="Email address" className="flex-1 p-2 text-sm border rounded-md" />
                <Button size="sm" className="whitespace-nowrap">
                  Invite
                </Button>
              </div>
            </div>
            
            <Alert className="bg-blue-50 border-blue-100">
              <AlertTitle className="text-sm">Team Plan Benefits</AlertTitle>
              <AlertDescription className="text-xs">
                <ul className="list-disc pl-4 space-y-1 mt-1">
                  <li>Unlimited team members</li>
                  <li>Customizable permission levels</li>
                  <li>Team analytics dashboard</li>
                  <li>Shared deal pipeline</li>
                  <li>Team activity notifications</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building className="h-4 w-4" />
              Deal Sharing
            </CardTitle>
            <CardDescription>Collaborate on properties</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-100 rounded-md p-3 space-y-2">
              <h3 className="text-sm font-medium">123 Main St, Houston, TX</h3>
              <div className="flex gap-1">
                <Badge variant="outline" className="text-xs">Single Family</Badge>
                <Badge variant="outline" className="text-xs">Fix & Flip</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">List Price</p>
                  <p className="font-medium">$210,000</p>
                </div>
                <div>
                  <p className="text-muted-foreground">ARV</p>
                  <p className="font-medium">$285,000</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Deal Score</p>
                  <p className="font-medium text-green-600">8.3</p>
                </div>
              </div>
              <div className="pt-2 border-t flex justify-between items-center">
                <div className="flex -space-x-2">
                  <Avatar className="h-6 w-6 border-2 border-white">
                    <AvatarFallback className="text-xs">YS</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-6 w-6 border-2 border-white">
                    <AvatarFallback className="text-xs">MJ</AvatarFallback>
                  </Avatar>
                </div>
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  Share
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Team Deal Permissions</h3>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-green-600" />
                    <span>View all team deals</span>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-green-600" />
                    <span>Comment on deals</span>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <UserX className="h-4 w-4 text-red-600" />
                    <span>Delete team deals</span>
                  </div>
                  <Lock className="h-4 w-4 text-amber-600" />
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span>Deal activity history</span>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Access Controls
            </CardTitle>
            <CardDescription>Privacy & permissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-1 border-b">
                <span className="text-sm font-medium">Permission Presets</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md border border-blue-100">
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">Full Access</h4>
                    <p className="text-xs text-muted-foreground">Can view, edit, and manage all deals</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-2 rounded-md border">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">Analysis Only</h4>
                    <p className="text-xs text-muted-foreground">Can view and analyze deals, but not edit</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-2 rounded-md border">
                  <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">Limited Access</h4>
                    <p className="text-xs text-muted-foreground">Can only view specific assigned deals</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-2 rounded-md border">
                  <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">View Only</h4>
                    <p className="text-xs text-muted-foreground">Can only view deal details, no actions</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-1 border-b">
                <span className="text-sm font-medium">Privacy Controls</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span className="text-sm">Show financial details to team</span>
                  </div>
                  <div className="w-8 h-4 bg-green-500 rounded-full relative">
                    <div className="absolute right-0 top-0 w-4 h-4 bg-white rounded-full shadow"></div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <EyeOff className="h-4 w-4" />
                    <span className="text-sm">Hide contact information</span>
                  </div>
                  <div className="w-8 h-4 bg-gray-300 rounded-full relative">
                    <div className="absolute left-0 top-0 w-4 h-4 bg-white rounded-full shadow"></div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <span className="text-sm">Notify on deal changes</span>
                  </div>
                  <div className="w-8 h-4 bg-green-500 rounded-full relative">
                    <div className="absolute right-0 top-0 w-4 h-4 bg-white rounded-full shadow"></div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span className="text-sm">Track team activity</span>
                  </div>
                  <div className="w-8 h-4 bg-green-500 rounded-full relative">
                    <div className="absolute right-0 top-0 w-4 h-4 bg-white rounded-full shadow"></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-1 md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Team Dashboard Examples</CardTitle>
            <CardDescription>
              Customize how your team views and interacts with data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="deals">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="deals">Deal Pipeline</TabsTrigger>
                <TabsTrigger value="metrics">Team Metrics</TabsTrigger>
                <TabsTrigger value="tasks">Task Management</TabsTrigger>
              </TabsList>
              
              <TabsContent value="deals" className="space-y-4">
                <div className="bg-slate-100 rounded-lg p-4 h-64 flex items-center justify-center">
                  <p className="text-center text-muted-foreground italic">
                    Team deal pipeline dashboard preview<br />
                    <span className="text-sm">Track deals through acquisition, analysis, and closing stages</span>
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="metrics" className="space-y-4">
                <div className="bg-slate-100 rounded-lg p-4 h-64 flex items-center justify-center">
                  <p className="text-center text-muted-foreground italic">
                    Team performance metrics dashboard preview<br />
                    <span className="text-sm">Track analysis counts, deal scores, and success rates by team member</span>
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="tasks" className="space-y-4">
                <div className="bg-slate-100 rounded-lg p-4 h-64 flex items-center justify-center">
                  <p className="text-center text-muted-foreground italic">
                    Team task management dashboard preview<br />
                    <span className="text-sm">Assign and track tasks related to property analysis and acquisition</span>
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-6">
            <Button size="lg" className="gap-2">
              <Users className="h-4 w-4" />
              Join Team Accounts Waitlist
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 