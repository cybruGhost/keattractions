-- Modify the image column to support longer URLs
ALTER TABLE attractions MODIFY COLUMN image VARCHAR(3000);

-- Add image_url column if it doesn't exist
ALTER TABLE attractions ADD COLUMN IF NOT EXISTS image_url VARCHAR(3000);

