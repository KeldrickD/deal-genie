'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash, Bell, BellOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';

type SavedSearch = {
  id: string;
  name: string;
  city: string;
  sources: string[];
  keywords?: string;
  days_on_market?: number;
  price_min?: number;
  price_max?: number;
  email_alert: boolean;
  enabled: boolean;
  created_at: string;
};

export default function SavedSearchesPage() {
  const router = useRouter();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchSavedSearches();
  }, []);

  const fetchSavedSearches = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/saved-searches');
      
      if (!response.ok) {
        throw new Error('Failed to fetch saved searches');
      }
      
      const data = await response.json();
      setSavedSearches(data.searches || []);
    } catch (error) {
      console.error('Error fetching saved searches:', error);
      toast.error('Failed to load saved searches');
    } finally {
      setLoading(false);
    }
  };

  const toggleEmailAlert = async (searchId: string, currentValue: boolean) => {
    try {
      setUpdating(searchId);
      const response = await fetch(`/api/saved-searches/${searchId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email_alert: !currentValue }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update search');
      }
      
      setSavedSearches(searches => 
        searches.map(search => 
          search.id === searchId 
            ? { ...search, email_alert: !currentValue } 
            : search
        )
      );
      toast.success(`Email alerts ${!currentValue ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error updating search:', error);
      toast.error('Failed to update search');
    } finally {
      setUpdating(null);
    }
  };

  const toggleEnabled = async (searchId: string, currentValue: boolean) => {
    try {
      setUpdating(searchId);
      const response = await fetch(`/api/saved-searches/${searchId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled: !currentValue }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update search');
      }
      
      setSavedSearches(searches => 
        searches.map(search => 
          search.id === searchId 
            ? { ...search, enabled: !currentValue } 
            : search
        )
      );
      toast.success(`Search ${!currentValue ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error updating search:', error);
      toast.error('Failed to update search');
    } finally {
      setUpdating(null);
    }
  };

  const deleteSearch = async (searchId: string) => {
    try {
      setDeleting(searchId);
      const response = await fetch(`/api/saved-searches/${searchId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete search');
      }
      
      setSavedSearches(searches => searches.filter(search => search.id !== searchId));
      toast.success('Search deleted');
    } catch (error) {
      console.error('Error deleting search:', error);
      toast.error('Failed to delete search');
    } finally {
      setDeleting(null);
    }
  };

  const formatSearchCriteria = (search: SavedSearch) => {
    const criteria = [];
    
    if (search.keywords) {
      criteria.push(`Keywords: ${search.keywords}`);
    }
    
    if (search.days_on_market) {
      criteria.push(`Days on market: <${search.days_on_market}`);
    }
    
    if (search.price_min || search.price_max) {
      let priceRange = 'Price: ';
      if (search.price_min) priceRange += `$${search.price_min.toLocaleString()}`;
      priceRange += ' - ';
      if (search.price_max) priceRange += `$${search.price_max.toLocaleString()}`;
      criteria.push(priceRange);
    }
    
    return criteria;
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Saved Searches</h1>
          <p className="text-gray-500">Manage your saved property searches and email alerts</p>
        </div>
        <Button onClick={() => router.push('/lead-genie/search')}>
          <Plus className="mr-2 h-4 w-4" /> New Search
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : savedSearches.length === 0 ? (
        <Card className="border-dashed bg-muted/50">
          <CardContent className="py-10">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="text-muted-foreground">
                <p>You haven&apos;t saved any searches yet.</p>
                <p>Save a search to get email alerts and quick access to your favorite criteria.</p>
              </div>
              <Button onClick={() => router.push('/lead-genie/search')}>
                <Plus className="mr-2 h-4 w-4" /> Create New Search
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedSearches.map((search) => (
            <Card key={search.id} className={search.enabled ? "" : "opacity-70"}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{search.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => deleteSearch(search.id)}
                    disabled={deleting === search.id}
                  >
                    {deleting === search.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex flex-wrap gap-1 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {search.city}
                  </Badge>
                  {search.sources.map((source) => (
                    <Badge key={source} variant="secondary" className="text-xs">
                      {source}
                    </Badge>
                  ))}
                </div>
                
                {formatSearchCriteria(search).length > 0 && (
                  <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                    {formatSearchCriteria(search).map((criterion, index) => (
                      <li key={index}>{criterion}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => toggleEmailAlert(search.id, search.email_alert)}
                    disabled={updating === search.id}
                  >
                    {updating === search.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : search.email_alert ? (
                      <Bell className="h-4 w-4 mr-2 text-primary" />
                    ) : (
                      <BellOff className="h-4 w-4 mr-2" />
                    )}
                    {search.email_alert ? 'Alerts On' : 'Alerts Off'}
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Active</span>
                  <Switch
                    checked={search.enabled}
                    onCheckedChange={() => toggleEnabled(search.id, search.enabled)}
                    disabled={updating === search.id}
                  />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 