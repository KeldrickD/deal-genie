'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/components/AuthProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Flag, ThumbsUp, Send, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface SocialProofComment {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    level?: number;
  };
  comment: string;
  created_at: string;
  likes: number;
  hasLiked?: boolean;
  isOffer?: boolean;
}

interface SocialProofWidgetProps {
  propertyId: string;
  compact?: boolean;
}

export default function SocialProofWidget({ propertyId, compact = false }: SocialProofWidgetProps) {
  const { user, supabase } = useAuthContext();
  const [comments, setComments] = useState<SocialProofComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load comments
  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      try {
        if (supabase) {
          const { data, error } = await supabase
            .from('property_comments')
            .select(`
              id, 
              comment,
              created_at,
              likes,
              is_offer,
              user:user_id (
                id, 
                email, 
                full_name, 
                avatar_url,
                level
              )
            `)
            .eq('property_id', propertyId)
            .order('created_at', { ascending: false })
            .limit(compact ? 2 : 10);
            
          if (error) throw error;
          
          // Get user likes if authenticated
          let userLikes = new Set<string>();
          if (user) {
            const { data: likesData } = await supabase
              .from('comment_likes')
              .select('comment_id')
              .eq('user_id', user.id);
              
            if (likesData) {
              userLikes = new Set(likesData.map(like => like.comment_id));
            }
          }
          
          // Format the data
          const formattedComments = data?.map(item => ({
            id: item.id,
            user: {
              id: item.user.id,
              name: item.user.full_name || item.user.email.split('@')[0],
              email: item.user.email,
              avatar: item.user.avatar_url,
              level: item.user.level || 1
            },
            comment: item.comment,
            created_at: item.created_at,
            likes: item.likes || 0,
            hasLiked: userLikes.has(item.id),
            isOffer: item.is_offer
          })) || [];
          
          setComments(formattedComments);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchComments();
  }, [propertyId, supabase, user]);
  
  // Submit a new comment
  const handleSubmitComment = async (isOffer = false) => {
    if (!newComment.trim() || !user || !supabase) return;
    
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('property_comments')
        .insert({
          property_id: propertyId,
          user_id: user.id,
          comment: newComment.trim(),
          is_offer: isOffer
        })
        .select(`
          id, 
          comment,
          created_at,
          likes,
          is_offer,
          user:user_id (
            id, 
            email, 
            full_name, 
            avatar_url,
            level
          )
        `)
        .single();
        
      if (error) throw error;
      
      // Format and add to comments
      const newCommentObj: SocialProofComment = {
        id: data.id,
        user: {
          id: data.user.id,
          name: data.user.full_name || data.user.email.split('@')[0],
          email: data.user.email,
          avatar: data.user.avatar_url,
          level: data.user.level || 1
        },
        comment: data.comment,
        created_at: data.created_at,
        likes: 0,
        hasLiked: false,
        isOffer: data.is_offer
      };
      
      setComments([newCommentObj, ...comments]);
      setNewComment('');
      
      // Add to user activity
      await supabase.from('user_activity').insert({
        user_id: user.id,
        activity_type: isOffer ? 'offer' : 'comment',
        property_id: propertyId,
        xp_earned: isOffer ? 25 : 5,
        details: { comment_id: data.id }
      });
      
      toast.success(isOffer ? 'Offer reported!' : 'Comment added');
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('Failed to submit comment');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Like a comment
  const handleLikeComment = async (commentId: string, currentLikes: number, hasLiked: boolean) => {
    if (!user || !supabase) return;
    
    try {
      // Optimistic UI update
      setComments(comments.map(comment => 
        comment.id === commentId 
          ? { 
              ...comment, 
              likes: hasLiked ? currentLikes - 1 : currentLikes + 1,
              hasLiked: !hasLiked 
            } 
          : comment
      ));
      
      if (hasLiked) {
        // Remove like
        await supabase
          .from('comment_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('comment_id', commentId);
      } else {
        // Add like
        await supabase
          .from('comment_likes')
          .insert({
            user_id: user.id,
            comment_id: commentId
          });
      }
      
      // Update comment likes count
      await supabase
        .from('property_comments')
        .update({ 
          likes: hasLiked ? currentLikes - 1 : currentLikes + 1 
        })
        .eq('id', commentId);
        
    } catch (error) {
      console.error('Error liking comment:', error);
      
      // Revert optimistic update on error
      setComments(comments.map(comment => 
        comment.id === commentId 
          ? { 
              ...comment, 
              likes: currentLikes,
              hasLiked: hasLiked 
            } 
          : comment
      ));
    }
  };
  
  // Report inappropriate content
  const handleReportComment = async (commentId: string) => {
    if (!user || !supabase) return;
    
    try {
      await supabase
        .from('comment_reports')
        .insert({
          user_id: user.id,
          comment_id: commentId,
          reason: 'inappropriate'
        });
        
      toast.success('Comment reported to moderators');
    } catch (error) {
      console.error('Error reporting comment:', error);
      toast.error('Failed to report comment');
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  // Empty or loading state
  if (isLoading) {
    return (
      <div className={compact ? "h-6" : "h-20"}>
        <p className="text-xs text-center text-muted-foreground animate-pulse">
          Loading comments...
        </p>
      </div>
    );
  }
  
  if (comments.length === 0 && compact) {
    return (
      <div className="text-xs text-muted-foreground">
        Be the first to comment on this property
      </div>
    );
  }
  
  // Compact mode for property cards
  if (compact) {
    return (
      <div className="space-y-2">
        {comments.length > 0 ? (
          <>
            {comments.slice(0, 1).map(comment => (
              <div key={comment.id} className="flex items-start space-x-2">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={comment.user.avatar} />
                  <AvatarFallback className="text-[10px]">
                    {comment.user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-xs line-clamp-1">
                    {comment.isOffer && (
                      <Badge variant="outline" className="mr-1 py-0 h-4 text-[10px]">Made offer</Badge>
                    )}
                    {comment.comment}
                  </p>
                </div>
              </div>
            ))}
            
            {comments.length > 1 && (
              <p className="text-xs text-muted-foreground">
                +{comments.length - 1} more {comments.length === 2 ? 'comment' : 'comments'}
              </p>
            )}
          </>
        ) : (
          <p className="text-xs text-muted-foreground">No investor feedback yet</p>
        )}
      </div>
    );
  }
  
  // Full comment section
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Investor Feedback
              <Badge className="ml-2" variant="outline">{comments.length}</Badge>
            </h3>
          </div>
          
          {user ? (
            <div className="flex space-x-2">
              <Input 
                placeholder="Share your thoughts on this property..." 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="text-sm"
              />
              <Button 
                size="sm" 
                onClick={() => handleSubmitComment(false)}
                disabled={!newComment.trim() || isSubmitting}
              >
                <Send className="h-4 w-4 mr-2" />
                Post
              </Button>
              <Button 
                size="sm"
                variant="outline"
                onClick={() => handleSubmitComment(true)}
                disabled={!newComment.trim() || isSubmitting}
              >
                I Made an Offer
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sign in to leave feedback</p>
          )}
          
          <div className="space-y-4 mt-4">
            {comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment.id} className="border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.user.avatar} />
                        <AvatarFallback>
                          {comment.user.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center">
                          <p className="font-medium text-sm">{comment.user.name}</p>
                          {comment.user.level && (
                            <Badge variant="outline" className="ml-2 text-xs">Lvl {comment.user.level}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</p>
                      </div>
                    </div>
                    
                    {comment.isOffer && (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Made Offer</Badge>
                    )}
                  </div>
                  
                  <p className="mt-2 text-sm">{comment.comment}</p>
                  
                  <div className="flex justify-between mt-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => handleLikeComment(comment.id, comment.likes, !!comment.hasLiked)}
                      disabled={!user}
                    >
                      <ThumbsUp className={`h-4 w-4 mr-1 ${comment.hasLiked ? 'fill-current' : ''}`} />
                      <span className="text-xs">{comment.likes}</span>
                    </Button>
                    
                    {user && comment.user.id !== user.id && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 px-2 text-muted-foreground"
                        onClick={() => handleReportComment(comment.id)}
                      >
                        <Flag className="h-3 w-3 mr-1" />
                        <span className="text-xs">Report</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No comments yet</p>
                <p className="text-xs text-muted-foreground mt-1">Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 