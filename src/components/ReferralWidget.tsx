'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/components/AuthProvider';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CopyIcon, CheckIcon, UsersIcon, TrendingUpIcon, GiftIcon, SparklesIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ReferralStats {
  codeUrl: string;
  totalReferrals: number;
  pendingReferrals: number;
  completedReferrals: number;
  xpEarned: number;
}

interface ReferralSignup {
  id: string;
  email: string;
  status: 'pending' | 'complete' | 'rewarded';
  date: string;
  rewardAmount?: number;
}

export default function ReferralWidget() {
  const { user, supabase } = useAuthContext();
  const [referralUrl, setReferralUrl] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<ReferralSignup[]>([]);
  const [activeTab, setActiveTab] = useState('link');

  useEffect(() => {
    if (!user) return;

    const fetchReferralData = async () => {
      setLoading(true);
      try {
        // Get user's referral code
        const { data: referralData, error: referralError } = await supabase
          .from('user_referrals')
          .select('*')
          .eq('referrer_id', user.id)
          .single();

        // If no code exists, create one
        if (referralError || !referralData) {
          // Generate a new referral code on the server
          const { data: newReferral, error: createError } = await supabase
            .rpc('create_user_referral', { user_id: user.id });

          if (createError) {
            console.error('Error creating referral code:', createError);
            toast.error('Failed to generate your referral link');
            setLoading(false);
            return;
          }

          // Use the newly created referral
          if (newReferral) {
            setReferralUrl(`${window.location.origin}/signup?ref=${newReferral.referral_code}`);
          }
        } else {
          // Use existing referral code
          setReferralUrl(`${window.location.origin}/signup?ref=${referralData.referral_code}`);
        }

        // Get referral stats
        const { data: statsData, error: statsError } = await supabase
          .rpc('get_referral_stats', { user_id: user.id });

        if (!statsError && statsData) {
          setStats(statsData);
        }

        // Get referral signups
        const { data: signupsData, error: signupsError } = await supabase
          .from('referral_signups')
          .select(`
            id,
            status,
            created_at,
            completed_at,
            reward_details,
            auth.users(email)
          `)
          .eq('referrer_id', user.id)
          .order('created_at', { ascending: false });

        if (!signupsError && signupsData) {
          const formattedSignups = signupsData.map(signup => ({
            id: signup.id,
            email: signup.users?.email || 'Unknown user',
            status: signup.status,
            date: new Date(signup.created_at).toLocaleDateString(),
            rewardAmount: signup.reward_details?.xp_amount || 0
          }));
          setReferrals(formattedSignups);
        }
      } catch (error) {
        console.error('Error fetching referral data:', error);
        toast.error('Something went wrong while loading your referral data');
      } finally {
        setLoading(false);
      }
    };

    fetchReferralData();
  }, [user, supabase]);

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopiedUrl(true);
      toast.success('Referral link copied to clipboard');
      setTimeout(() => setCopiedUrl(false), 3000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Failed to copy link. Please try again.');
    }
  };

  const mockShareViaEmail = () => {
    const subject = encodeURIComponent('Join me on Deal Genie for real estate investing');
    const body = encodeURIComponent(
      `Hey there,\n\nI've been using Deal Genie to find great real estate deals. Sign up using my referral link:\n\n${referralUrl}\n\nCheers!`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UsersIcon className="h-5 w-5 text-primary" />
          Invite Investors & Earn Rewards
        </CardTitle>
        <CardDescription>
          Share Deal Genie with fellow investors and earn XP rewards when they sign up
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link">Referral Link</TabsTrigger>
            <TabsTrigger value="stats">Your Referrals</TabsTrigger>
          </TabsList>
          
          <TabsContent value="link" className="space-y-4 py-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">How it works</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <SparklesIcon className="h-4 w-4 text-primary mt-0.5" />
                  <span>Share your unique link with fellow investors</span>
                </li>
                <li className="flex items-start gap-2">
                  <GiftIcon className="h-4 w-4 text-primary mt-0.5" />
                  <span>Earn 50 XP when they sign up</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUpIcon className="h-4 w-4 text-primary mt-0.5" />
                  <span>Earn 100 XP when they analyze their first property</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="referral-link" className="text-sm font-medium">
                Your Referral Link
              </label>
              <div className="flex space-x-2">
                <Input
                  id="referral-link"
                  value={referralUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyReferralLink}
                  aria-label="Copy referral link"
                >
                  {copiedUrl ? (
                    <CheckIcon className="h-4 w-4 text-green-600" />
                  ) : (
                    <CopyIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button onClick={copyReferralLink} className="w-full">
                <CopyIcon className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
              <Button variant="outline" onClick={mockShareViaEmail} className="w-full">
                Share via Email
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="stats" className="py-4">
            {stats ? (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-muted/30 p-3 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Total Referrals</p>
                    <p className="text-2xl font-bold">{stats.totalReferrals}</p>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">XP Earned</p>
                    <p className="text-2xl font-bold text-primary">{stats.xpEarned}</p>
                  </div>
                </div>
                
                <h3 className="font-medium mb-2">Recent Referrals</h3>
                {referrals.length > 0 ? (
                  <div className="space-y-2">
                    {referrals.map((referral) => (
                      <div 
                        key={referral.id}
                        className="border rounded-lg p-3 flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium">{referral.email}</p>
                          <p className="text-xs text-muted-foreground">{referral.date}</p>
                        </div>
                        <Badge variant={referral.status === 'rewarded' ? 'default' : 'outline'}>
                          {referral.status === 'pending' ? 'Pending' : 
                           referral.status === 'complete' ? 'Signed Up' : 
                           `+${referral.rewardAmount} XP`}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-6">
                    No referrals yet. Share your link to start earning rewards!
                  </p>
                )}
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">
                  Your referral stats will appear here once you share your link
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="bg-muted/20 border-t">
        <div className="w-full text-center text-sm text-muted-foreground py-1">
          The more investors you invite, the more rewards you earn!
        </div>
      </CardFooter>
    </Card>
  );
} 