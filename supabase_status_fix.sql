-- 1. Drop existing constraint if any
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;

-- 2. Add the clean constraint with specified values
ALTER TABLE leads ADD CONSTRAINT leads_status_check 
CHECK (status IN ('New', 'Contacted', 'Qualified', 'Lost', 'Won'));

-- 3. Update existing rows to comply (defaulting to 'New' if they don't match)
UPDATE leads SET status = 'New' WHERE status NOT IN ('New', 'Contacted', 'Qualified', 'Lost', 'Won') OR status IS NULL;

-- 4. Verification
SELECT id, name, status FROM leads LIMIT 10;
