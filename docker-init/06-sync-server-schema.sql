-- Migration: Sync local database with server schema
-- This migration adds missing tables and columns to match the production server

-- ============================================================
-- 1. USERS TABLE: Add 2FA columns
-- ============================================================
DO $$
BEGIN
    -- Add twofa_enabled column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'twofa_enabled'
    ) THEN
        ALTER TABLE public.users ADD COLUMN twofa_enabled BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add twofa_secret column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'twofa_secret'
    ) THEN
        ALTER TABLE public.users ADD COLUMN twofa_secret VARCHAR(255);
    END IF;
END $$;

-- ============================================================
-- 2. BOOKINGS TABLE: Add missing columns
-- ============================================================
DO $$
BEGIN
    -- Add status_token column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'status_token'
    ) THEN
        ALTER TABLE public.bookings ADD COLUMN status_token VARCHAR(255);
    END IF;

    -- Add fare_category_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'fare_category_id'
    ) THEN
        ALTER TABLE public.bookings ADD COLUMN fare_category_id INTEGER;
        ALTER TABLE public.bookings 
            ADD CONSTRAINT fk_bookings_fare_category 
            FOREIGN KEY (fare_category_id) 
            REFERENCES public.fare_categories(id);
    END IF;

    -- Add booking_option_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'booking_option_id'
    ) THEN
        ALTER TABLE public.bookings ADD COLUMN booking_option_id INTEGER;
        ALTER TABLE public.bookings 
            ADD CONSTRAINT fk_bookings_booking_option 
            FOREIGN KEY (booking_option_id) 
            REFERENCES public.booking_options(id);
    END IF;

    -- Add assigned_seats column (JSON array of seat numbers)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'assigned_seats'
    ) THEN
        ALTER TABLE public.bookings ADD COLUMN assigned_seats JSONB;
    END IF;
END $$;

-- ============================================================
-- 3. TRIPS TABLE: Add missing columns
-- ============================================================
DO $$
BEGIN
    -- Add image_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trips' AND column_name = 'image_id'
    ) THEN
        ALTER TABLE public.trips ADD COLUMN image_id INTEGER;
        ALTER TABLE public.trips 
            ADD CONSTRAINT fk_trips_image 
            FOREIGN KEY (image_id) 
            REFERENCES public.images(id);
    END IF;

    -- Add price column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trips' AND column_name = 'price'
    ) THEN
        ALTER TABLE public.trips ADD COLUMN price NUMERIC(10,2);
    END IF;

    -- Add currency column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trips' AND column_name = 'currency'
    ) THEN
        ALTER TABLE public.trips ADD COLUMN currency VARCHAR(3) DEFAULT 'SYP';
    END IF;

    -- Add is_sponsored column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trips' AND column_name = 'is_sponsored'
    ) THEN
        ALTER TABLE public.trips ADD COLUMN is_sponsored BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add sponsored_until column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trips' AND column_name = 'sponsored_until'
    ) THEN
        ALTER TABLE public.trips ADD COLUMN sponsored_until TIMESTAMP WITHOUT TIME ZONE;
    END IF;

    -- Add sponsor_amount column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trips' AND column_name = 'sponsor_amount'
    ) THEN
        ALTER TABLE public.trips ADD COLUMN sponsor_amount NUMERIC(10,2);
    END IF;
END $$;

-- ============================================================
-- 4. BOOKING_PASSENGERS TABLE: Track individual passengers per booking
-- ============================================================
CREATE TABLE IF NOT EXISTS public.booking_passengers (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL,
    passenger_name VARCHAR(255) NOT NULL,
    seat_number INTEGER,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT booking_passengers_booking_id_fkey 
        FOREIGN KEY (booking_id) 
        REFERENCES public.bookings(id) ON DELETE CASCADE
);

-- Create index if not exists
CREATE INDEX IF NOT EXISTS idx_booking_passengers_booking_id 
    ON public.booking_passengers(booking_id);

-- ============================================================
-- 5. SUBSCRIPTION SYSTEM: Plans, Company Subscriptions, Payments
-- ============================================================

-- Subscription Plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    max_branches INTEGER NOT NULL,
    price_per_month NUMERIC(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    features TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default subscription plans if table was just created
INSERT INTO public.subscription_plans (name, max_branches, price_per_month, currency, features, is_active)
SELECT 'Starter', 1, 29.99, 'EUR', 'Basic features, 1 branch, Up to 50 trips/month', TRUE
WHERE NOT EXISTS (SELECT 1 FROM public.subscription_plans WHERE name = 'Starter');

INSERT INTO public.subscription_plans (name, max_branches, price_per_month, currency, features, is_active)
SELECT 'Professional', 5, 79.99, 'EUR', 'All features, Up to 5 branches, Unlimited trips, Priority support', TRUE
WHERE NOT EXISTS (SELECT 1 FROM public.subscription_plans WHERE name = 'Professional');

INSERT INTO public.subscription_plans (name, max_branches, price_per_month, currency, features, is_active)
SELECT 'Enterprise', 999, 199.99, 'EUR', 'All features, Unlimited branches, API access, Dedicated support', TRUE
WHERE NOT EXISTS (SELECT 1 FROM public.subscription_plans WHERE name = 'Enterprise');

-- Company Subscriptions table
CREATE TABLE IF NOT EXISTS public.company_subscriptions (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL,
    subscription_plan_id INTEGER NOT NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT company_subscriptions_company_id_fkey 
        FOREIGN KEY (company_id) 
        REFERENCES public.transport_companies(id) ON DELETE CASCADE,
    CONSTRAINT company_subscriptions_subscription_plan_id_fkey 
        FOREIGN KEY (subscription_plan_id) 
        REFERENCES public.subscription_plans(id)
);

-- Create indexes if not exists
CREATE INDEX IF NOT EXISTS idx_company_subscriptions_company_id 
    ON public.company_subscriptions(company_id);
CREATE INDEX IF NOT EXISTS idx_company_subscriptions_active 
    ON public.company_subscriptions(is_active);

-- Subscription Payments table
CREATE TABLE IF NOT EXISTS public.subscription_payments (
    id SERIAL PRIMARY KEY,
    company_subscription_id INTEGER NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'pending',
    transaction_id VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT subscription_payments_company_subscription_id_fkey 
        FOREIGN KEY (company_subscription_id) 
        REFERENCES public.company_subscriptions(id) ON DELETE CASCADE
);

-- Create index if not exists
CREATE INDEX IF NOT EXISTS idx_subscription_payments_company_subscription 
    ON public.subscription_payments(company_subscription_id);
