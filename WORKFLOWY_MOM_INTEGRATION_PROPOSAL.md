# WorkFlowy-Style MOM Integration Proposal

## Vision
Transform Minutes of Meeting (MOM) into a WorkFlowy-like hierarchical note-taking system where all information about each brand/client is stored, organized, and accessible in one unified space.

## Current State Analysis

### Existing Components
- **Meetings Page** (`/app/meetings/page.tsx`) - Main meeting management interface
- **MOM Card** (`/components/meetings-mom-card.tsx`) - Simple flat MOM capture (summary + key decisions)
- **Meeting Details Panel** - Shows meeting info, attendees, agenda
- **Client Portal** - Stores meetings, action items, workflows for each client
- **Task Notes** - Has public/private note types but not hierarchical

### Current Limitations
1. MOM is flat (summary + list of decisions) - no nested structure
2. No dedicated "brand/client knowledge base"
3. Notes don't persist hierarchically across meetings
4. No way to drill into sub-topics or create nested action items
5. MOM card is tied to individual meetings, not client-centric

## Proposed Architecture: "Client Knowledge Hub"

### Level 1: Client Hub (Brand/Client Central)
**New Page**: `/app/client-hub/[clientId]/knowledge-base`

```
Client Hub for "TechBrand Inc"
├── All Meetings (searchable timeline)
├── Knowledge Base (WorkFlowy-style)
│   ├── Q1 2026 Strategy
│   │   ├── LinkedIn Strategy
│   │   │   ├── Algorithm Changes (from Jan 15 meeting)
│   │   │   ├── Engagement Metrics (from Jan 20 meeting)
│   │   │   └── Competitor Comparison (from Feb 5 meeting)
│   │   ├── Website Redesign
│   │   │   ├── Design Brief (from Feb 1 meeting)
│   │   │   ├── Development Timeline (from Feb 8 meeting)
│   │   │   └── Launch Checklist
│   │   └── Budget Allocation
│   ├── Campaign Performance (evergreen)
│   │   ├── Campaign A (live tracking)
│   │   ├── Campaign B (completed)
│   │   └── Campaign C (planning)
│   └── Decisions & Action Items (organized by meeting)
│       ├── Decision: Primary messaging (Jan 15)
│       ├── Decision: Visual language (Jan 22)
│       └── Task: Brand audit (due Feb 28)
```

## Implementation Strategy

### Phase 1: Database Schema (Foundation)
Create new table: `client_knowledge_base` with hierarchical structure

```sql
CREATE TABLE client_knowledge_base (
  id SERIAL PRIMARY KEY,
  client_id UUID,
  parent_id INTEGER (null for root nodes),
  title TEXT,
  content TEXT,
  type ENUM ('topic', 'decision', 'action_item', 'note', 'insight'),
  source_meeting_id UUID,
  created_from_meeting_date TIMESTAMP,
  created_by UUID,
  last_updated TIMESTAMP,
  tags TEXT[],
  priority INT (1-5),
  order_index INT,
  is_collapsed BOOLEAN DEFAULT false
);
```

### Phase 2: Components to Build

#### 1. Hierarchical MOM Importer
- **Location**: Enhanced MeetingsMomCard component
- **Features**:
  - When saving MOM, offer: "Save as flat MOM" OR "Add to Knowledge Base"
  - Suggest category placement based on meeting context
  - Allow creating new nested topics on-the-fly
  - Example: "Add 'LinkedIn Algorithm Changes' under Q1 2026 Strategy > LinkedIn Strategy"

#### 2. Knowledge Base Viewer
- **Location**: New `/app/client-hub/[clientId]/knowledge-base` page
- **Structure**: WorkFlowy-style collapsible tree
- **Features**:
  - Expand/collapse nodes (with smooth animations)
  - Color-coded by type (decision = blue, action = green, insight = orange)
  - Drag-to-reorder nodes
  - Right-click context menu (edit, move, delete, convert to task)
  - Timeline view: See when each node was added (meeting date)
  - Source badge: Shows which meeting contributed this node

#### 3. Nested Note Editor
- **Location**: Modal/panel when clicking a node
- **Features**:
  - Rich text editor
  - Add attachments
  - @mention team members
  - Link to related action items
  - Version history

#### 4. Smart Node Suggestions
- AI-powered suggestions based on meeting content
- Auto-organize insights into existing structure

#### 5. Client Hub Sidebar Integration
- New section in existing client detail view
- Quick-access to latest KB entries
- "Recent Decisions" widget
- "Pending Action Items" widget

## Integration Points

### 1. Existing Meetings Page
- After saving MOM → Show modal: "Add these insights to Knowledge Base?"
- Let user drag/drop decisions into KB structure
- One-click: Auto-organize under "Decisions from [Client Name] on [Date]"

### 2. Client Detail View (Account Manager)
- Add "Knowledge Base" tab
- Show KB tree on right panel
- Show upcoming meeting agenda context from KB

### 3. Client Portal (Client-facing)
- Read-only knowledge base access
- Shows decisions affecting them
- Shows action items assigned to them

### 4. Team Workload Page
- Filter by "tasks created from knowledge base"
- Track which KB decisions are driving work

## Advanced Features (Phase 4+)

#### Knowledge Search
- Full-text search across all KB nodes
- Filter by: client, date range, type, tags

#### Client Timeline
- Visual timeline of all decisions/changes
- "Decision made Jan 15" → "Task completed Jan 28" flow

#### Export/Reporting
- Export KB as PDF
- Generate "Client Summary Report" from KB
- Archive yearly KB snapshots

#### Collaborative Editing
- Multi-user simultaneous editing
- Comments/reactions on nodes
- Mention notifications

## Key Advantages

| Feature | Current | Proposed | Benefit |
|---------|---------|----------|---------|
| MOM Storage | Flat list per meeting | Hierarchical per client | Context & relationships visible |
| Knowledge Access | Only in meeting view | Dedicated hub | Quick lookup, better decisions |
| Decision Tracking | Scattered across meetings | Centralized timeline | Audit trail, accountability |
| Team Collaboration | Isolated notes | Nested discussions | Better communication |
| Client Context | Fragmented | Unified KB | Better service, fewer repeated questions |

## Technical Feasibility: YES

### Easy to Implement
- Supabase supports hierarchical queries with parent_id FK
- React tree components available
- SWR caching works well for nested structures
- Existing patterns can be reused

### No Major Blockers
- Database schema change needed but non-breaking
- New API endpoints needed
- No dependency conflicts
- Can build incrementally

## Recommended Implementation Path

### Week 1-2: Foundation
- Create client_knowledge_base table
- Build API endpoints for CRUD operations
- Create ClientKnowledgeBase viewer component (basic tree)

### Week 3: Integration
- Update MeetingsMomCard with "Add to KB" button
- Build modal for categorizing into KB structure
- Create /app/client-hub/[clientId]/knowledge-base page

### Week 4: Polish
- Drag-drop reordering
- Search functionality
- Timeline view
- Client portal read-only access

## User Experience Flow

```
1. User completes meeting & MOM
2. Saves MOM normally (existing flow)
3. System suggests: "Add to Knowledge Base?"
4. User clicks "Yes"
5. Modal shows: Client's KB structure with suggested category
6. User can:
   - Accept suggestion → Auto-save under that category
   - Manually drag items to different categories
   - Create new categories on-the-fly
7. Knowledge Base updates in real-time
8. Next time viewing client → KB shows latest insights
```

## Questions to Consider

1. Should old MOM data be migrated to KB? (Yes - provide bulk import script)
2. Private vs Shared KB? (Suggested: Shared by default, but respect RBAC)
3. KB per client or per account? (Per client - simpler, more focused)
4. Should KB be versioned? (Yes - version history for compliance)
5. How to handle deleted nodes? (Soft delete + archive, searchable)

## Summary

This is highly achievable and adds tremendous value. The WorkFlowy-style MOM system transforms meeting notes from one-time capture into a living client knowledge base. It reduces duplicate decisions, improves team alignment, and gives clients confidence that you truly understand their business.

Start with Phases 1-2 for MVP, then expand with search and collaborative features.
