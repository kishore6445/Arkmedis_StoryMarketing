# PKR Calculation - "In Review" Status Update

## Overview

When a task enters the **"in_review"** status, it is now considered as **SUBMITTED/COMPLETED** for both Internal PKR and External PKR calculations. This reflects the real business scenario where submission to the client (or review stage) marks the delivery point.

## Key Changes

### 1. Task Completion Recognition

**Previously:** Only `done` status counted as task completion
**Now:** Both `in_review` and `done` statuses count as task completion

### 2. Completion Date Determination

When calculating PKR for a task in `in_review` or `done` status, the system uses the following priority order to find the completion timestamp:

1. **`reviewed_at`** - Specific timestamp for when task entered review (if available)
2. **`completed_at`** - Timestamp for actual completion (if available)
3. **`updated_at`** - Fallback to last update timestamp

```typescript
// Helper function that determines completion date
export function getCompletionDate(task: Task): Date | null {
  if (task.status === 'in_review' || task.status === 'done') {
    if (task.reviewed_at) return new Date(task.reviewed_at)
    if (task.completed_at) return new Date(task.completed_at)
    if (task.updated_at) return new Date(task.updated_at)
  }
  return null
}
```

### 3. PKR Metrics Updated

#### Internal PKR (Team Performance)
- Counts tasks in both `in_review` AND `done` status as completed
- Uses the completion date (from above) to determine if internal deadline was met
- Formula: `(On-Time Tasks / Total Tasks with Due Dates) × 100`

#### External PKR (Client Promise Performance)
- Counts tasks in both `in_review` AND `done` status as delivered
- Uses the completion date to determine if client promise was met
- Formula: `(On-Time Deliveries / Total Tasks with Promised Dates) × 100`

#### Commitment Quality Score
- Measures what percentage of completed tasks (in_review + done) met internal deadlines
- Formula: `(Completed On-Time / All Completed Tasks) × 100`

## Practical Example

### Scenario
A task has:
- **Due Date (Internal):** March 23, 5:00 PM
- **Promised Date (Client):** March 25, 9:00 AM
- **Status Transition:** 
  - 2:00 PM on March 23: Moved to "in_review"
  - 11:00 AM on March 24: Moved to "done"

### Calculation
- ✅ **Internal PKR:** Task marked as submitted at 2:00 PM March 23 (before 5:00 PM due date) = **ON TIME**
- ✅ **External PKR:** Task marked as delivered at 2:00 PM March 23 (before March 25, 9:00 AM promise) = **ON TIME**

The system won't wait for "done" status if the task is already in "in_review" - that's when delivery is counted.

## Implementation Details

### New Helper Functions

1. **`isTaskCompleted(task)`** - Returns true if status is `in_review` or `done`
2. **`getCompletionDate(task)`** - Returns the appropriate timestamp for completion

### Updated Functions

- `calculateInternalPKR()` - Now uses new completion logic
- `calculateExternalPKR()` - Now uses new completion logic
- `calculateCommitmentQuality()` - Now considers in_review as completed
- `calculateTaskPKR()` - Single task PKR now respects in_review status

## Database Column Requirements

For full functionality, ensure your tasks table has these columns:
- `reviewed_at` - TIMESTAMPTZ (optional but recommended)
- `completed_at` - TIMESTAMPTZ (for detailed tracking)
- `updated_at` - TIMESTAMPTZ (fallback, should always exist)

If `reviewed_at` is not available, the system will use `completed_at` or `updated_at` based on availability.

## Business Logic Summary

| Status | Counts as Completed? | Used in PKR? |
|--------|---------------------|------------|
| `todo` | ❌ No | ❌ No |
| `in_progress` | ❌ No | ❌ No |
| `in_review` | ✅ Yes | ✅ Yes (NEW) |
| `done` | ✅ Yes | ✅ Yes |

This ensures that delivery/submission (`in_review`) is properly recognized in your PKR metrics without waiting for the final `done` status.
