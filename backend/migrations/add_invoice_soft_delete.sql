-- Add soft delete support to invoices table

-- Add deleted_at column
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_invoices_deleted_at ON invoices(deleted_at);
CREATE INDEX IF NOT EXISTS idx_invoices_booking_id ON invoices(booking_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_method ON invoices(payment_method);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date);

-- Add comment
COMMENT ON COLUMN invoices.deleted_at IS 'Soft delete timestamp. NULL means active, otherwise deleted';
