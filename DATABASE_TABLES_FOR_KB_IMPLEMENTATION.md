# Database Tables for WorkFlowy-Style Knowledge Base Implementation

## Overview
This document outlines all database tables required to implement the WorkFlowy-style Minutes of Meeting knowledge base system. These tables should be created at the backend to support the frontend implementation.

---

## 1. CLIENT_KNOWLEDGE_BASE Table

**Purpose**: Stores hierarchical knowledge base items per client

```sql
CREATE TABLE client_knowledge_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  type VARCHAR(50) NOT NULL DEFAULT 'topic', -- 'topic', 'decision', 'action', 'insight'
  parent_id UUID REFERENCES client_knowledge_base(id) ON DELETE CASCADE,
  priority VARCHAR(20) DEFAULT 'medium', -- 'high', 'medium', 'low'
  tags TEXT[], -- Array of tags stored as JSONB array or TEXT array
  created_from_meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP, -- Soft delete support
  
  -- Indexes for performance
  INDEX idx_client_id (client_id),
  INDEX idx_parent_id (parent_id),
  INDEX idx_type (type),
  INDEX idx_created_from_meeting (created_from_meeting_id),
  UNIQUE INDEX idx_hierarchical_order (client_id, parent_id, id)
);
```

**Fields**:
- `id`: Unique identifier
- `client_id`: Links to the client this KB belongs to
- `title`: The node title (required)
- `content`: Full content/details of the node
- `type`: Category type for filtering and styling
- `parent_id`: References parent node for hierarchical structure (NULL for root-level items)
- `priority`: High/Medium/Low for sorting and emphasis
- `tags`: Array of string tags for searching and categorization
- `created_from_meeting_id`: Links back to the meeting this was created from
- `created_by`: User who created this item
- `created_at`, `updated_at`: Timestamps
- `deleted_at`: For soft deletes

**Relationships**:
- Many-to-one with `clients` table
- Self-referential (parent_id) for hierarchy
- Many-to-one with `meetings` table (for source tracking)
- Many-to-one with `users` table (for created_by)

---

## 2. CLIENT_KB_VERSIONS Table

**Purpose**: Maintains version history of KB items for audit trail and rollback capability

```sql
CREATE TABLE client_kb_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kb_item_id UUID NOT NULL REFERENCES client_knowledge_base(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  type VARCHAR(50) NOT NULL,
  priority VARCHAR(20),
  tags TEXT[],
  changed_by UUID NOT NULL REFERENCES users(id),
  change_reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_kb_item_id (kb_item_id),
  INDEX idx_created_at (created_at),
  UNIQUE INDEX idx_kb_version (kb_item_id, version_number)
);
```

**Fields**:
- `id`: Unique version record identifier
- `kb_item_id`: Links to the KB item being versioned
- `version_number`: Sequential version counter
- `title`, `content`, `type`, `priority`, `tags`: Snapshot of item state
- `changed_by`: User who made the change
- `change_reason`: Description of what changed (e.g., "Updated after Q2 meeting")
- `created_at`: When this version was created

**Use Cases**:
- Audit trail of all KB modifications
- Rollback to previous versions
- Change tracking and attribution

---

## 3. MEETING_KB_MAPPINGS Table

**Purpose**: Link meetings to KB items created from them

```sql
CREATE TABLE meeting_kb_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  kb_item_id UUID NOT NULL REFERENCES client_knowledge_base(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_meeting_id (meeting_id),
  INDEX idx_kb_item_id (kb_item_id),
  UNIQUE INDEX idx_unique_mapping (meeting_id, kb_item_id)
);
```

**Fields**:
- `id`: Unique mapping identifier
- `meeting_id`: References the meeting
- `kb_item_id`: References the KB item created from this meeting
- `created_at`: When the mapping was created

**Use Cases**:
- Trace which meeting generated which KB items
- Show "From Meeting" information in KB UI
- Generate meeting summaries

---

## 4. CLIENT_KB_SEARCH_INDEX Table (Optional, for performance)

**Purpose**: Denormalized search index for full-text search capability

```sql
CREATE TABLE client_kb_search_index (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kb_item_id UUID NOT NULL REFERENCES client_knowledge_base(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  searchable_text TSVECTOR, -- PostgreSQL full-text search vector
  search_metadata JSONB, -- Additional search metadata
  indexed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_client_kb (client_id, kb_item_id),
  FULLTEXT INDEX idx_searchable_text (searchable_text)
);
```

**Note**: This is optional but recommended for large knowledge bases with thousands of items. Use PostgreSQL's TSVECTOR for full-text search.

---

## 5. CLIENT_KB_COLLABORATORS Table (Optional, for team features)

**Purpose**: Track who has access/edit permissions to each KB item

```sql
CREATE TABLE client_kb_collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kb_item_id UUID NOT NULL REFERENCES client_knowledge_base(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission_level VARCHAR(50) NOT NULL DEFAULT 'view', -- 'view', 'edit', 'admin'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_kb_item_user (kb_item_id, user_id),
  UNIQUE INDEX idx_unique_collaboration (kb_item_id, user_id)
);
```

---

## API Endpoints Required

### 1. GET `/api/clients/:clientId/knowledge-base`
**Purpose**: Fetch complete KB tree structure for a client
**Query Parameters**:
- `format`: 'tree' (hierarchical) or 'flat' (all items)
- `filterType`: Filter by type (topic, decision, action, insight)
- `searchQuery`: Search in title and content

**Response**:
```json
{
  "nodes": [
    {
      "id": "kb-1",
      "title": "Q1 Strategy",
      "content": "...",
      "type": "topic",
      "parentId": null,
      "priority": "high",
      "tags": ["strategy", "q1"],
      "createdAt": "2024-01-15T10:00:00Z",
      "children": [...]
    }
  ]
}
```

### 2. POST `/api/clients/:clientId/knowledge-base`
**Purpose**: Create a new KB item or add from MOM
**Request Body**:
```json
{
  "title": "Q1 Budget Allocation",
  "content": "...",
  "type": "decision",
  "parentId": "kb-1",
  "priority": "high",
  "tags": ["budget", "allocation"],
  "createdFromMeetingId": "meeting-123"
}
```

**Response**: Created KB item with ID

### 3. PATCH `/api/clients/:clientId/knowledge-base/:itemId`
**Purpose**: Update KB item
**Request Body**: Partial fields to update
**Response**: Updated item

### 4. DELETE `/api/clients/:clientId/knowledge-base/:itemId`
**Purpose**: Delete KB item (cascade to children)
**Response**: Success confirmation

### 5. GET `/api/clients/:clientId/knowledge-base/:itemId/versions`
**Purpose**: Fetch version history of an item
**Response**: List of versions with timestamps and authors

### 6. POST `/api/clients/:clientId/knowledge-base/:itemId/restore`
**Purpose**: Restore item to a previous version
**Request Body**:
```json
{
  "versionNumber": 3
}
```

### 7. GET `/api/meetings/:meetingId/knowledge-base-items`
**Purpose**: Get all KB items created from a specific meeting
**Response**: List of KB items

### 8. POST `/api/clients/:clientId/knowledge-base/export`
**Purpose**: Export knowledge base as PDF, Markdown, or JSON
**Query Parameters**:
- `format`: 'pdf', 'markdown', 'json'

---

## Data Flow

### Adding MOM to Knowledge Base
1. User views completed meeting MOM
2. Clicks "Add to KB" button
3. POST `/api/clients/:clientId/knowledge-base` with:
   - Meeting summary as content
   - Key decisions as top-level items
   - Action items as children
4. Backend creates KB structure with meeting reference
5. Creates entries in `meeting_kb_mappings` table
6. Creates initial version in `client_kb_versions`

### Editing KB Items
1. User edits item via editor modal
2. PATCH `/api/clients/:clientId/knowledge-base/:itemId`
3. Backend:
   - Updates `client_knowledge_base` row
   - Creates new version in `client_kb_versions`
   - Updates `updated_at` timestamp

### Search and Filter
1. Frontend sends GET request with filters
2. Backend queries `client_knowledge_base` with:
   - `WHERE client_id = :clientId`
   - `AND type = :type` (if filterType provided)
   - `AND (title ILIKE :query OR content ILIKE :query)` (if searchQuery provided)
3. Returns hierarchical tree structure

---

## Indexes for Performance

Recommended indexes to create:
```sql
-- Lookups by client
CREATE INDEX idx_kb_by_client ON client_knowledge_base(client_id);

-- Finding children of a parent
CREATE INDEX idx_kb_by_parent ON client_knowledge_base(parent_id);

-- Filtering by type
CREATE INDEX idx_kb_by_type ON client_knowledge_base(client_id, type);

-- Hierarchical queries
CREATE INDEX idx_kb_hierarchy ON client_knowledge_base(client_id, parent_id, type);

-- Meeting references
CREATE INDEX idx_kb_by_meeting ON client_knowledge_base(created_from_meeting_id);

-- Soft delete queries
CREATE INDEX idx_kb_active ON client_knowledge_base(client_id) 
  WHERE deleted_at IS NULL;
```

---

## Constraints and Validations

1. **Type enum**: Only allow 'topic', 'decision', 'action', 'insight'
2. **Priority enum**: Only allow 'high', 'medium', 'low'
3. **No circular references**: Ensure parent_id never creates a cycle
4. **Title required**: Cannot be empty
5. **Client isolation**: Users can only access KB items for their assigned clients
6. **Soft deletes**: Don't delete items, just set `deleted_at` timestamp

---

## Migration Path

1. Create `client_knowledge_base` table first
2. Create `client_kb_versions` table
3. Create `meeting_kb_mappings` table
4. Add foreign key constraints
5. Create indexes
6. Create API endpoints
7. Test with frontend

All indexes and relationships are in place to support the WorkFlowy-style hierarchical UI with version history and full-text search capabilities.
