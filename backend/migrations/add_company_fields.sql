-- Add missing columns to transport_companies table
ALTER TABLE transport_companies 
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_transport_companies_deleted_at ON transport_companies(deleted_at);
CREATE INDEX IF NOT EXISTS idx_transport_companies_email ON transport_companies(email);
CREATE INDEX IF NOT EXISTS idx_transport_companies_cr_number ON transport_companies(cr_number);
