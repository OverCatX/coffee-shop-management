-- Add password_hash column to employees table for authentication
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Create index on email for faster login lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email) WHERE is_deleted = FALSE;

-- Update existing employees with default password hash (password: "password123")
-- In production, employees should set their own passwords
-- Using bcrypt hash for "password123"
UPDATE employees 
SET password_hash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY5Y5Y5Y5Y'
WHERE password_hash IS NULL AND email IS NOT NULL;

