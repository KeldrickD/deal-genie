'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, DollarSign, Calendar, Phone, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface CrmLead {
  id: string;
  address: string;
  city: string;
  state?: string;
  zipcode?: string;
  price?: number;
  propertyType?: string;
  daysOnMarket?: number;
  source: string;
  status: string;
  leadNotes?: string;
  listingUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export function CrmLeadsList() {
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();
  
  // Detail dialog
  const [selectedLead, setSelectedLead] = useState<CrmLead | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Delete dialog
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch leads from the API
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/crm/leads');
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch leads');
      }
      
      const data = await response.json();
      setLeads(data.leads || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: "Error",
        description: "Failed to load leads. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Filter leads based on search term and status
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      searchTerm === '' || 
      lead.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.leadNotes?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Handle opening lead detail dialog
  const handleViewLead = (lead: CrmLead) => {
    setSelectedLead(lead);
    setEditNotes(lead.leadNotes || '');
    setEditStatus(lead.status);
    setIsDetailOpen(true);
  };

  // Handle updating lead
  const handleSaveLead = async () => {
    if (!selectedLead) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/crm/leads/${selectedLead.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: editStatus,
          lead_notes: editNotes,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update lead');
      }
      
      // Update the lead in the local state
      setLeads(leads.map(lead => 
        lead.id === selectedLead.id 
          ? { ...lead, status: editStatus, leadNotes: editNotes, updatedAt: new Date().toISOString() }
          : lead
      ));
      
      toast({
        title: "Lead updated",
        description: "Lead has been updated successfully",
      });
      
      setIsDetailOpen(false);
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({
        title: "Error",
        description: "Failed to update lead. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle opening delete confirmation
  const handleDeleteClick = (id: string) => {
    setLeadToDelete(id);
    setIsDeleteOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!leadToDelete) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/crm/leads/${leadToDelete}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete lead');
      }
      
      // Remove the lead from the local state
      setLeads(leads.filter(lead => lead.id !== leadToDelete));
      
      toast({
        title: "Lead deleted",
        description: "Lead has been removed from your CRM",
      });
      
      setIsDeleteOpen(false);
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast({
        title: "Error",
        description: "Failed to delete lead. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setLeadToDelete(null);
    }
  };

  // Render status badge
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'new':
        return <Badge variant="secondary">New</Badge>;
      case 'contacted':
        return <Badge className="bg-blue-500">Contacted</Badge>;
      case 'offer_made':
        return <Badge className="bg-amber-500">Offer Made</Badge>;
      case 'closed':
        return <Badge className="bg-green-500">Closed</Badge>;
      case 'dead':
        return <Badge variant="destructive">Dead</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-[180px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="offer_made">Offer Made</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="dead">Dead</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No leads in your CRM yet</h3>
              <p className="text-muted-foreground mb-4">
                Save leads from the Lead Genie search to start building your pipeline.
              </p>
              <Button asChild>
                <a href="/lead-genie">Go to Lead Genie</a>
              </Button>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No matching leads</h3>
              <p className="text-muted-foreground">
                Try changing your search or filter criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="hidden md:table-cell">Days on Market</TableHead>
                    <TableHead className="hidden md:table-cell">Added on</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div className="font-medium">{lead.address}</div>
                        <div className="text-sm text-muted-foreground">
                          {lead.city}{lead.state ? `, ${lead.state}` : ''}
                          {lead.zipcode ? ` ${lead.zipcode}` : ''}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(lead.status)}
                      </TableCell>
                      <TableCell>
                        {lead.price ? (
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
                            <span>${lead.price.toLocaleString()}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {lead.daysOnMarket ? (
                          <span>{lead.daysOnMarket} days</span>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
                          <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewLead(lead)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(lead.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Lead Detail Dialog */}
      {selectedLead && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Lead</DialogTitle>
              <DialogDescription>
                {selectedLead.address}, {selectedLead.city}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Lead Status</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="offer_made">Offer Made</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="dead">Dead</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about this lead..."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={4}
                />
              </div>
              
              {selectedLead.listingUrl && (
                <div className="mt-4">
                  <Button variant="outline" className="w-full" asChild>
                    <a 
                      href={selectedLead.listingUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Listing
                    </a>
                  </Button>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveLead} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Lead</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this lead? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Lead'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 