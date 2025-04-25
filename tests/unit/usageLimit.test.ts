import { expect, describe, it, beforeEach, vi, afterEach } from 'vitest';
import { checkUsageLimit, enforceUsageLimit, recordUsage } from '@/lib/usageLimit';
import { FEATURE_NAMES, STATUS_CODES } from '@/lib/config';

// Mock the supabase client
vi.mock('@/utils/supabase/server', () => ({
  createClient: () => ({
    from: () => ({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      count: vi.fn().mockReturnThis(),
      then: vi.fn().mockImplementation(cb => cb({
        data: [],
        count: 0,
        error: null
      }))
    })
  })
}));

// Mock the getUserProfile function
vi.mock('@/lib/auth', () => ({
  getUserProfile: vi.fn()
}));

// Import the mocked getUserProfile
import { getUserProfile } from '@/lib/auth';

describe('Usage Limit Functions', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.resetAllMocks();
  });

  afterEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('checkUsageLimit', () => {
    it('should return hasReachedLimit=true if no userId is provided', async () => {
      const result = await checkUsageLimit('', FEATURE_NAMES.ANALYZE);
      expect(result.hasReachedLimit).toBe(true);
      expect(result.currentUsage).toBe(0);
      expect(result.limit).toBe(0);
    });

    it('should return hasReachedLimit=false for a pro user regardless of usage', async () => {
      // Mock pro user
      vi.mocked(getUserProfile).mockResolvedValue({ subscription_tier: 'pro' });
      
      const result = await checkUsageLimit('pro-user-id', FEATURE_NAMES.ANALYZE);
      expect(result.hasReachedLimit).toBe(false);
      expect(result.limit).toBe(Infinity);
    });

    it('should return hasReachedLimit=true for a free user who has reached their limit', async () => {
      // Mock free user
      vi.mocked(getUserProfile).mockResolvedValue({ subscription_tier: 'free' });
      
      // Mock 5 usages for deal analysis (at the limit)
      const mockSupabase = {
        from: () => ({
          select: () => ({
            eq: () => ({
              eq: () => ({
                gte: () => ({
                  then: (cb: Function) => cb({
                    data: Array(5).fill({}),
                    count: 5,
                    error: null
                  })
                })
              })
            })
          })
        })
      };
      
      vi.mock('@/utils/supabase/server', () => ({
        createClient: () => mockSupabase
      }));
      
      const result = await checkUsageLimit('free-user-id', FEATURE_NAMES.ANALYZE);
      expect(result.hasReachedLimit).toBe(true);
      expect(result.currentUsage).toBe(5);
      expect(result.limit).toBe(5);
    });

    it('should return hasReachedLimit=false for a free user below their limit', async () => {
      // Mock free user
      vi.mocked(getUserProfile).mockResolvedValue({ subscription_tier: 'free' });
      
      // Mock 3 usages for deal analysis (below the limit of 5)
      const mockSupabase = {
        from: () => ({
          select: () => ({
            eq: () => ({
              eq: () => ({
                gte: () => ({
                  then: (cb: Function) => cb({
                    data: Array(3).fill({}),
                    count: 3,
                    error: null
                  })
                })
              })
            })
          })
        })
      };
      
      vi.mock('@/utils/supabase/server', () => ({
        createClient: () => mockSupabase
      }));
      
      const result = await checkUsageLimit('free-user-id', FEATURE_NAMES.ANALYZE);
      expect(result.hasReachedLimit).toBe(false);
      expect(result.currentUsage).toBe(3);
      expect(result.limit).toBe(5);
    });
  });

  describe('enforceUsageLimit', () => {
    it('should return success=false if no userId is provided', async () => {
      const result = await enforceUsageLimit('', FEATURE_NAMES.ANALYZE);
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(STATUS_CODES.UNAUTHORIZED);
    });

    it('should return success=true for a pro user', async () => {
      // Mock pro user
      vi.mocked(getUserProfile).mockResolvedValue({ subscription_tier: 'pro' });
      
      // Mock successful usage recording
      const mockSupabase = {
        from: () => ({
          insert: () => ({
            then: (cb: Function) => cb({
              data: [{}],
              error: null
            })
          })
        })
      };
      
      vi.mock('@/utils/supabase/server', () => ({
        createClient: () => mockSupabase
      }));
      
      const result = await enforceUsageLimit('pro-user-id', FEATURE_NAMES.ANALYZE);
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(STATUS_CODES.SUCCESS);
    });

    it('should return success=false for a free user who has reached their limit', async () => {
      // Mock free user at their limit
      vi.mocked(getUserProfile).mockResolvedValue({ subscription_tier: 'free' });
      
      // Mock checkUsageLimit to return that the user has reached their limit
      vi.mock('@/lib/usageLimit', async () => {
        const original = await vi.importActual('@/lib/usageLimit');
        return {
          ...original,
          checkUsageLimit: vi.fn().mockResolvedValue({
            hasReachedLimit: true,
            currentUsage: 5,
            limit: 5
          })
        };
      });
      
      const result = await enforceUsageLimit('free-user-id', FEATURE_NAMES.ANALYZE);
      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(STATUS_CODES.USAGE_LIMIT_REACHED);
    });
  });

  describe('recordUsage', () => {
    it('should return false if no userId is provided', async () => {
      const result = await recordUsage('', FEATURE_NAMES.ANALYZE);
      expect(result).toBe(false);
    });

    it('should return true when successfully recording usage', async () => {
      // Mock successful usage recording
      const mockSupabase = {
        from: () => ({
          insert: () => ({
            then: (cb: Function) => cb({
              data: [{}],
              error: null
            })
          })
        })
      };
      
      vi.mock('@/utils/supabase/server', () => ({
        createClient: () => mockSupabase
      }));
      
      const result = await recordUsage('user-id', FEATURE_NAMES.ANALYZE);
      expect(result).toBe(true);
    });
  });
}); 