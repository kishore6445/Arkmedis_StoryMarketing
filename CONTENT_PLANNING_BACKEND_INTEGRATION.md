# Content Planning Backend Integration Summary

## Overview
All Content Planning components under the Content Visibility page are now connected to the backend through Supabase APIs.

## Connected Components & APIs

### 1. Content Records Unified Component
**File:** `/components/content-records-unified.tsx`
**Function:** Manages three view modes (List, Calendar, Timeline)
**Backend Connection:** Routes data to child components

**Child Components:**
- **List View** → `ContentVisibilityTable`
- **Calendar View** → `ContentCalendarEnhanced`
- **Timeline View** → Placeholder (coming soon)

---

### 2. Content Visibility Table (List View)
**File:** `/components/content-visibility-table.tsx`
**API Endpoint:** `GET /api/content/records`
**Features:**
- Fetches all content records from `scheduled_posts` table
- Filters by: client, month, week, status
- Displays: Title, Client, Platform, Scheduled Date, Owner, Status
- Real-time status indicators (Published, Scheduled, In Production, Planned, Delayed)

**Query Parameters:**
```
/api/content/records?viewMode=all&clientId=xxx&month=march&week=Week1
```

---

### 3. Content Calendar (Calendar View)
**File:** `/components/content-calendar-enhanced.tsx`
**API Endpoint:** `GET /api/posts/calendar`
**Features:**
- Month/week view with drag-and-drop support
- Displays scheduled posts on calendar dates
- Publishing frequency analysis by platform
- Blackout date management
- Status updates via `PATCH /api/posts/{id}/status`
- SWR caching (1-minute revalidation)
- Platform-specific optimal posting times

**Query Parameters:**
```
/api/posts/calendar?startDate=2026-03-01&endDate=2026-03-31&clientId=xxx
```

---

### 4. Overview Metrics Components
**Connected Overview Dashboard Elements:**

| Component | Purpose | Data Source |
|-----------|---------|------------|
| `delivery-health-hero.tsx` | Overall delivery health status | Summary from records |
| `needs-attention-simple.tsx` | Flagged delayed/at-risk content | Filtered from records |
| `client-sla-simple.tsx` | SLA compliance tracking | Calculated from dates |
| `team-bottlenecks.tsx` | Team workload analysis | Post count by assignee |
| `weekly-delivery-tracker.tsx` | Weekly delivery progress | Date-range filtered records |
| `scheduling-readiness.tsx` | Content ready to schedule | Status-filtered records |

---

## API Endpoints

### Content Records API
**Endpoint:** `GET /api/content/records`
**Auth:** Required (JWT token from localStorage)
**Parameters:**
- `viewMode` - View mode (all, published, scheduled, planned)
- `clientId` - Filter by client
- `status` - Filter by status
- `startDate` - Filter by date range
- `endDate` - Filter by date range

**Response:**
```json
{
  "records": [
    {
      "id": "uuid",
      "client": "Client Name",
      "title": "Content Title",
      "platform": "linkedin",
      "plannedDate": "2026-03-01",
      "scheduledDate": "2026-03-05",
      "publishedDate": "2026-03-05",
      "owner": "Team Member",
      "status": "PUBLISHED",
      "month": "march",
      "week": "Week 1"
    }
  ],
  "total": 42,
  "viewMode": "all"
}
```

### Calendar Posts API (Existing)
**Endpoint:** `GET /api/posts/calendar`
**Auth:** Required
**Caching:** SWR with 1-minute revalidation
**Data Source:** `scheduled_posts` table with date range filter

### Analytics Content API (Existing)
**Endpoint:** `GET /api/analytics/content`
**Auth:** Required
**Purpose:** Top-performing content metrics for insights

---

## Data Flow Architecture

```
Content Visibility Page
├── Overview Tab
│   ├── DeliveryHealthHero (dashboard metrics)
│   ├── NeedsAttention (filtered records)
│   ├── ClientSLA (SLA tracking)
│   ├── TeamBottlenecks (workload analysis)
│   ├── WeeklyDeliveryTracker (weekly progress)
│   └── SchedulingReadiness (ready to schedule)
│
├── Content Records Tab
│   └── ContentRecordsUnified (view mode switcher)
│       ├── List View
│       │   └── ContentVisibilityTable ← /api/content/records
│       ├── Calendar View
│       │   └── ContentCalendarEnhanced ← /api/posts/calendar
│       └── Timeline View (placeholder)
│
├── Client SLA Tab
│   └── ClientSLASimple (SLA metrics)
│
└── Team Workload Tab
    └── TeamBottlenecks (team capacity)
```

---

## Filter Integration

All components respect these unified filters:
- **Month** - March, April, etc.
- **Week** - Week 1, Week 2, etc.
- **Client** - Specific client selection

Filters are passed from `content-visibility/page.tsx` down to all child components.

---

## Real-time Updates

### Automatic Refresh Triggers:
1. **Manual Refresh:** Click retry button on error
2. **Filter Changes:** Any filter change triggers API call
3. **SWR Revalidation:** Calendar automatically revalidates every 1 minute
4. **User Interaction:** Status updates trigger `mutate()` to refresh calendar

---

## Database Tables Used

### scheduled_posts
- `id` (UUID)
- `client_id` (FK)
- `content` (text)
- `platforms` (array)
- `media_urls` (array)
- `scheduled_date` (date)
- `scheduled_time` (time)
- `status` (enum: draft, scheduled, published, failed, cancelled)
- `created_at`, `updated_at`
- Relationships: clients, assigned_to (users)

---

## Error Handling

All components include:
- Loading states with spinners
- Error messages with retry buttons
- Graceful fallbacks for missing data
- Console logging for debugging (`[v0]` prefix)

---

## Next Steps / Future Enhancements

1. **Timeline View** - Implement trend analysis and SLA performance tracking
2. **Blackout Dates API** - Make dynamic with database support
3. **Bulk Actions** - Multi-select and batch operations
4. **Analytics Integration** - Connect engagement metrics to content records
5. **Export Functionality** - Download records as CSV/PDF
6. **Real-time Notifications** - WebSocket updates for status changes
