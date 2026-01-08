-- Subscription Plans Table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  max_branches INTEGER NOT NULL,
  price_per_month NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  features TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, max_branches, price_per_month, features) VALUES
('Free', 14, 0.00, '14 branches, 1 manager + 1 driver + 1 assistant per branch'),
('Starter', 5, 49.99, '5 branches, unlimited staff per branch'),
('Business', 10, 89.99, '10 branches, unlimited staff per branch'),
('Professional', 25, 199.99, '25 branches, unlimited staff per branch'),
('Enterprise', 50, 399.99, '50 branches, unlimited staff per branch'),
('Ultimate', 999, 799.99, '100+ branches, unlimited staff per branch');

-- Company Subscriptions Table
CREATE TABLE IF NOT EXISTS company_subscriptions (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES transport_companies(id) ON DELETE CASCADE,
  subscription_plan_id INTEGER NOT NULL REFERENCES subscription_plans(id),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX idx_company_subscriptions_company_id ON company_subscriptions(company_id);
CREATE INDEX idx_company_subscriptions_active ON company_subscriptions(is_active);

-- Branches Table
CREATE TABLE IF NOT EXISTS branches (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES transport_companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  city_id INTEGER REFERENCES cities(id),
  phone VARCHAR(50),
  email VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX idx_branches_company_id ON branches(company_id);
CREATE INDEX idx_branches_active ON branches(is_active);

-- Add branch_id to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS branch_id INTEGER REFERENCES branches(id);
CREATE INDEX IF NOT EXISTS idx_users_branch_id ON users(branch_id);

-- Staff Roles for branch management
CREATE TABLE IF NOT EXISTS branch_staff_roles (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT
);

-- Insert branch staff roles
INSERT INTO branch_staff_roles (code, name, description) VALUES
('branch_manager', 'Branch Manager', 'Manages branch operations'),
('driver', 'Driver', 'Drives vehicles'),
('driver_assistant', 'Driver Assistant', 'Assists driver');

-- Add staff role to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS branch_staff_role_id INTEGER REFERENCES branch_staff_roles(id);
CREATE INDEX IF NOT EXISTS idx_users_branch_staff_role ON users(branch_staff_role_id);

-- Payment History Table
CREATE TABLE IF NOT EXISTS subscription_payments (
  id SERIAL PRIMARY KEY,
  company_subscription_id INTEGER NOT NULL REFERENCES company_subscriptions(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending',
  transaction_id VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscription_payments_company_subscription ON subscription_payments(company_subscription_id);

-- Function to create default subscription for new companies
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
BEGIN
  -- Assign free plan (id=1) to new company
  INSERT INTO company_subscriptions (company_id, subscription_plan_id, is_active)
  VALUES (NEW.id, 1, true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically create subscription on company creation
DROP TRIGGER IF EXISTS trigger_create_default_subscription ON transport_companies;
CREATE TRIGGER trigger_create_default_subscription
  AFTER INSERT ON transport_companies
  FOR EACH ROW
  EXECUTE FUNCTION create_default_subscription();

-- Function to check branch limit
CREATE OR REPLACE FUNCTION check_branch_limit()
RETURNS TRIGGER AS $$
DECLARE
  branch_count INTEGER;
  max_branches INTEGER;
BEGIN
  -- Count current branches for this company
  SELECT COUNT(*) INTO branch_count
  FROM branches
  WHERE company_id = NEW.company_id AND is_active = true;
  
  -- Get max branches from active subscription
  SELECT sp.max_branches INTO max_branches
  FROM company_subscriptions cs
  JOIN subscription_plans sp ON cs.subscription_plan_id = sp.id
  WHERE cs.company_id = NEW.company_id AND cs.is_active = true
  ORDER BY cs.created_at DESC
  LIMIT 1;
  
  -- Check if limit exceeded
  IF branch_count >= max_branches THEN
    RAISE EXCEPTION 'Branch limit exceeded. Current plan allows % branches. Please upgrade your subscription.', max_branches;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce branch limit
DROP TRIGGER IF EXISTS trigger_check_branch_limit ON branches;
CREATE TRIGGER trigger_check_branch_limit
  BEFORE INSERT ON branches
  FOR EACH ROW
  EXECUTE FUNCTION check_branch_limit();
