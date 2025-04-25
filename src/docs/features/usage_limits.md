# Usage Limits

This document describes the usage limits system in Deal Genie, including how to implement limits for new features.

## Overview

Deal Genie uses a tiered subscription model with different usage limits:
- **Free Tier**: Limited usage of core features
- **Trial Tier**: Expanded usage during 14-day trial
- **Pro Tier**: Unlimited usage of all features

The usage limits system consists of:
1. Usage tracking and enforcement
2. UI components to display limits
3. Upgrade prompts when limits are reached
4. Email notifications for limit-related events

## Configuration

Usage limits are configured in `src/lib/config.ts`:

```typescript
export const USAGE_LIMITS = {
  free: {
    analyses: 5,      // 5 analyses per month
    offers: 3,        // 3 offers per month
    imports: 10,      // 10 imports per month
  },
  trial: {
    analyses: 50,     // 50 analyses during 14-day trial
    offers: 20,       // 20 offers during trial
    imports: 100,     // 100 imports during trial
  },
  pro: {
    analyses: Infinity, // unlimited
    offers: Infinity,   // unlimited
    imports: Infinity,  // unlimited
  },
};

export const FEATURE_NAMES = {
  ANALYZE: 'deal_analyze',
  OFFER: 'deal_offer',
  IMPORT: 'csv_import',
};
```

To add a new feature with limits:
1. Add the feature name to `FEATURE_NAMES`
2. Add limits for each tier in `USAGE_LIMITS`

## Server-Side Usage Enforcement

The core functions for usage limits are in `src/lib/usageLimit.ts`:

### Recording Usage

```typescript
await recordUsage(userId, FEATURE_NAMES.YOUR_FEATURE, { 
  // Optional metadata
  context: 'some_context',
  itemId: 'item_123'
});
```

### Checking Limits

```typescript
const { hasReachedLimit, currentUsage, limit } = await checkUsageLimit(
  userId, 
  FEATURE_NAMES.YOUR_FEATURE
);

if (hasReachedLimit) {
  // Handle limit reached
}
```

### Enforcing Limits

```typescript
const result = await enforceUsageLimit(
  userId, 
  FEATURE_NAMES.YOUR_FEATURE,
  { context: 'some_context' }
);

if (!result.success) {
  // Handle limit reached
  return { error: result.message };
}

// Proceed with feature execution
```

## Client-Side Integration

### React Hook

Use the `useUsageLimit` hook to integrate with React components:

```typescript
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { FEATURE_NAMES } from '@/lib/config';

function YourComponent() {
  const { 
    enforceLimit, 
    showUpgradePrompt, 
    promptFeature, 
    closeUpgradePrompt 
  } = useUsageLimit();

  const handleAction = async () => {
    const result = await enforceLimit(FEATURE_NAMES.YOUR_FEATURE, {
      metadata: { context: 'your_context' },
      featureInfo: {
        displayName: 'Your Feature',
        upgradeMessage: 'Upgrade to use more of this feature'
      }
    });

    if (result) {
      // Proceed with feature execution
    }
  };

  return (
    <>
      {/* Render upgrade modal when needed */}
      {showUpgradePrompt && promptFeature && (
        <UpgradePromptModal
          isOpen={showUpgradePrompt}
          onClose={closeUpgradePrompt}
          feature={promptFeature.feature}
          currentUsage={promptFeature.currentUsage}
          limit={promptFeature.limit}
          featureDisplayName={promptFeature.featureDisplayName}
        />
      )}

      {/* Your component content */}
    </>
  );
}
```

### UI Components

Display usage limits with the `UsageLimits` component:

```tsx
// Show all feature limits
<UsageLimits />

// Show a specific feature's limits
<UsageLimits 
  standalone={false} 
  showSingleFeature={FEATURE_NAMES.YOUR_FEATURE} 
/>
```

## Near-Limit Alerts

When a user is approaching their limit, the system will:
1. Show an upgrade prompt modal
2. Track an analytics event
3. Potentially send an email notification

Implement near-limit detection:

```typescript
// In your component or hook
if (result.limit !== Infinity && result.currentUsage >= result.limit - 1) {
  // User has only 1 usage left
  trackEvent('usage_near_limit', feature, `${result.currentUsage}/${result.limit}`);
  
  // Show prompt
  setPromptFeature({
    displayName: 'Your Feature',
    upgradeMessage: 'You're approaching your usage limit. Upgrade for unlimited access.'
  });
  setShowingUpgradePrompt(true);
}
```

## Testing

The usage limit system has both unit tests and E2E tests:

- Unit tests: `tests/unit/usageLimit.test.ts`
- E2E tests: `tests/e2e/usage-limits.spec.ts`

When adding a new feature with limits, add test cases for:
- Free users hitting limits
- Trial users hitting limits
- Pro users with unlimited usage

## Monitoring

Monitor usage with:

1. **Analytics events**:
   - `usage_approaching_limit`
   - `usage_near_limit`
   - `usage_limit_reached`
   - `upgrade_prompt_click`

2. **Supabase Dashboard**:
   Create a view to analyze usage patterns:
   ```sql
   CREATE VIEW usage_summary AS
   SELECT 
     profiles.subscription_tier,
     usage_log.feature,
     COUNT(*) as usage_count
   FROM usage_log
   JOIN profiles ON usage_log.user_id = profiles.id
   GROUP BY profiles.subscription_tier, usage_log.feature;
   ```

3. **Error tracking**:
   Monitor 429 errors in your error tracking system to identify when users hit limits.

## Email Notifications

Send emails to users who hit their usage limits:

```typescript
// In your API route or server function
if (result.hasReachedLimit) {
  // Send limit reached email
  await sendLimitReachedEmail(user.email, feature);
}
```

## Best Practices

1. **Clear messaging**: Always explain why a limit exists and how to upgrade.
2. **Graceful degradation**: When a user hits a limit, still allow them to use other features.
3. **Tracking**: Always track limit-related events for analysis.
4. **Testing**: Test all limit scenarios, including edge cases.
5. **User education**: Proactively notify users before they hit limits. 