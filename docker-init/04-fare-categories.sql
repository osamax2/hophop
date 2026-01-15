-- Migration: Create fare_categories table
-- Run this on the database to add fare categories support

-- Create fare_categories table if not exists
CREATE TABLE IF NOT EXISTS fare_categories (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    label VARCHAR(100) NOT NULL,
    description TEXT,
    is_extra BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create booking_options table if not exists
CREATE TABLE IF NOT EXISTS booking_options (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    label VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'SYP',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default fare categories
INSERT INTO fare_categories (code, label, description, is_extra) VALUES
('adult', 'Erwachsener', 'Standard-Tarif für Erwachsene', false),
('child', 'Kind', 'Ermäßigter Tarif für Kinder (4-12 Jahre)', false),
('infant', 'Kleinkind', 'Kostenlos für Kleinkinder unter 4 Jahren', false),
('student', 'Student', 'Ermäßigter Tarif für Studenten', false),
('senior', 'Senior', 'Ermäßigter Tarif für Senioren (65+)', false),
('luggage', 'Zusätzliches Gepäck', 'Extra Gepäckstück', true),
('pet', 'Haustier', 'Haustier im Transportbehälter', true),
('bicycle', 'Fahrrad', 'Fahrradmitnahme', true)
ON CONFLICT (code) DO NOTHING;

-- Insert default booking options
INSERT INTO booking_options (code, label, description, price, currency, is_active) VALUES
('window_seat', 'Fensterplatz', 'Sitzplatz am Fenster', 500, 'SYP', true),
('extra_legroom', 'Mehr Beinfreiheit', 'Sitzplatz mit mehr Beinfreiheit', 1000, 'SYP', true),
('priority_boarding', 'Prioritäts-Einstieg', 'Bevorzugtes Einsteigen', 750, 'SYP', true),
('meal', 'Mahlzeit', 'Mahlzeit während der Fahrt', 2000, 'SYP', true),
('wifi', 'WLAN-Zugang', 'Internetzugang während der Fahrt', 500, 'SYP', true)
ON CONFLICT (code) DO NOTHING;

-- Verify
SELECT 'fare_categories' as table_name, COUNT(*) as count FROM fare_categories
UNION ALL
SELECT 'booking_options' as table_name, COUNT(*) as count FROM booking_options;
