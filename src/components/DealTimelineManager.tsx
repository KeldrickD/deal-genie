'use client';

import { useState, useEffect } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import { CalendarIcon, CheckCircle2, Clock, Trash2 } from 'lucide-react';

type Deadline = Database['public']['Tables']['deal_deadlines']['Row'];
type Deal = Database['public']['Tables']['deals']['Row'];

interface DealTimelineManagerProps {
  deal: Deal;
  supabase: SupabaseClient<Database> | null;
}

export default function DealTimelineManager({ deal, supabase }: DealTimelineManagerProps) {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state for new deadline
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load deadlines when component mounts
  useEffect(() => {
    if (supabase && deal.id) {
      loadDeadlines();
    }
  }, [supabase, deal.id]);

  async function loadDeadlines() {
    if (!supabase) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('deal_deadlines')
        .select('*')
        .eq('deal_id', deal.id)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      setDeadlines(data || []);
    } catch (err: any) {
      console.error('Error loading deadlines:', err);
      setError('Failed to load deadlines. Please try again.');
      toast.error('Failed to load deadlines');
    } finally {
      setIsLoading(false);
    }
  }

  async function addDeadline(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !newName || !newDueDate) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('deal_deadlines')
        .insert({
          deal_id: deal.id,
          name: newName,
          description: newDescription || null,
          due_date: new Date(newDueDate).toISOString(),
          completed: false
        });
      
      if (error) throw error;
      
      toast.success('Deadline added successfully');
      setNewName('');
      setNewDescription('');
      setNewDueDate('');
      setShowAddForm(false);
      loadDeadlines();
    } catch (err: any) {
      console.error('Error adding deadline:', err);
      toast.error('Failed to add deadline');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function toggleDeadlineCompletion(deadline: Deadline) {
    if (!supabase) return;
    
    try {
      const { error } = await supabase
        .from('deal_deadlines')
        .update({ completed: !deadline.completed })
        .eq('id', deadline.id);
      
      if (error) throw error;
      
      // Update local state
      setDeadlines(deadlines.map(d => 
        d.id === deadline.id ? { ...d, completed: !deadline.completed } : d
      ));
      
      toast.success(`Marked as ${deadline.completed ? 'incomplete' : 'complete'}`);
    } catch (err: any) {
      console.error('Error updating deadline:', err);
      toast.error('Failed to update deadline');
    }
  }

  async function deleteDeadline(id: string) {
    if (!supabase) return;
    
    if (!window.confirm('Are you sure you want to delete this deadline?')) return;
    
    try {
      const { error } = await supabase
        .from('deal_deadlines')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setDeadlines(deadlines.filter(d => d.id !== id));
      toast.success('Deadline deleted');
    } catch (err: any) {
      console.error('Error deleting deadline:', err);
      toast.error('Failed to delete deadline');
    }
  }

  function formatDueDate(dateString: string) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  }

  function getDaysUntilDue(dateString: string) {
    const dueDate = new Date(dateString);
    const today = new Date();
    
    // Reset time to compare just the dates
    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  function getStatusClass(deadline: Deadline) {
    if (deadline.completed) return 'bg-green-50 border-green-200';
    
    const daysUntil = getDaysUntilDue(deadline.due_date);
    
    if (daysUntil < 0) return 'bg-red-50 border-red-200'; // Overdue
    if (daysUntil <= 3) return 'bg-yellow-50 border-yellow-200'; // Due soon
    return 'bg-blue-50 border-blue-200'; // Upcoming
  }

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Timeline & Milestones</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : '+ Add Deadline'}
        </Button>
      </div>
      
      {/* Add Deadline Form */}
      {showAddForm && (
        <form onSubmit={addDeadline} className="mb-6 p-4 border rounded-md bg-gray-50">
          <h4 className="text-md font-medium mb-3">Add New Deadline</h4>
          <div className="space-y-4">
            <div>
              <Label htmlFor="deadlineName">Name</Label>
              <Input
                id="deadlineName"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., Inspection Period"
                required
              />
            </div>
            <div>
              <Label htmlFor="deadlineDescription">Description (Optional)</Label>
              <Textarea
                id="deadlineDescription"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Add any relevant details..."
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="deadlineDueDate">Due Date</Label>
              <Input
                id="deadlineDueDate"
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setShowAddForm(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !newName || !newDueDate}>
                {isSubmitting ? 'Adding...' : 'Add Deadline'}
              </Button>
            </div>
          </div>
        </form>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-800 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {/* Loading State */}
      {isLoading && (
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading deadlines...</p>
        </div>
      )}
      
      {/* Deadlines List */}
      {!isLoading && deadlines.length === 0 && (
        <div className="text-center p-4 bg-gray-50 rounded-md">
          <p className="text-gray-500">No deadlines added yet. Add your first deadline to track important dates.</p>
        </div>
      )}
      
      {!isLoading && deadlines.length > 0 && (
        <div className="space-y-3">
          {deadlines.map(deadline => (
            <div 
              key={deadline.id} 
              className={`border p-3 rounded-md ${getStatusClass(deadline)} relative`}
            >
              <div className="flex justify-between">
                <div className="flex-1">
                  <div className="flex items-start">
                    <button 
                      onClick={() => toggleDeadlineCompletion(deadline)}
                      className="mr-2 mt-1 text-gray-500 hover:text-green-600 focus:outline-none"
                      aria-label={deadline.completed ? "Mark as incomplete" : "Mark as complete"}
                    >
                      <CheckCircle2 
                        className={`h-5 w-5 ${deadline.completed ? 'text-green-600 fill-green-600' : 'text-gray-300'}`} 
                      />
                    </button>
                    <div>
                      <h4 className={`font-medium ${deadline.completed ? 'line-through text-gray-500' : ''}`}>
                        {deadline.name}
                      </h4>
                      {deadline.description && (
                        <p className="text-sm text-gray-600">{deadline.description}</p>
                      )}
                      <div className="flex items-center mt-1">
                        <CalendarIcon className="h-3 w-3 mr-1 text-gray-500" />
                        <span className="text-xs text-gray-600">
                          {formatDueDate(deadline.due_date)}
                        </span>
                        <Clock className="h-3 w-3 ml-3 mr-1 text-gray-500" />
                        <DeadlineStatus deadline={deadline} />
                      </div>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => deleteDeadline(deadline.id)}
                  className="text-gray-400 hover:text-red-600 focus:outline-none"
                  aria-label="Delete deadline"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DeadlineStatus({ deadline }: { deadline: Deadline }) {
  if (deadline.completed) {
    return <span className="text-xs text-green-600">Completed</span>;
  }
  
  const daysUntil = getDaysUntilDue(deadline.due_date);
  
  if (daysUntil < 0) {
    return <span className="text-xs text-red-600">Overdue by {Math.abs(daysUntil)} days</span>;
  }
  
  if (daysUntil === 0) {
    return <span className="text-xs text-orange-600">Due today</span>;
  }
  
  if (daysUntil <= 3) {
    return <span className="text-xs text-orange-600">Due in {daysUntil} days</span>;
  }
  
  return <span className="text-xs text-blue-600">Due in {daysUntil} days</span>;
}

function getDaysUntilDue(dateString: string) {
  const dueDate = new Date(dateString);
  const today = new Date();
  
  // Reset time to compare just the dates
  dueDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
} 