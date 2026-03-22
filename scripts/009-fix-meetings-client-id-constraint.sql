-- Drop the foreign key constraint on meetings.client_id that references users
ALTER TABLE meetings
DROP CONSTRAINT IF EXISTS meetings_client_id_fkey;

-- Change client_id to TEXT to store client names instead of UUID references
ALTER TABLE meetings
ALTER COLUMN client_id TYPE TEXT;

-- Add a check constraint to ensure client_id is not empty if provided
ALTER TABLE meetings
ADD CONSTRAINT client_id_not_empty CHECK (client_id IS NULL OR client_id != '');
