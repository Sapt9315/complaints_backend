-- Database schema for customer complaint system

-- Create branches table
CREATE TABLE IF NOT EXISTS branches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    manager_name VARCHAR(255),
    qr_code_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create complaints table
CREATE TABLE IF NOT EXISTS complaints (
    id SERIAL PRIMARY KEY,
    complaint_number VARCHAR(50) UNIQUE NOT NULL,
    branch_id INTEGER REFERENCES branches(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    complaint_type VARCHAR(50) NOT NULL CHECK (complaint_type IN (
        'product_quality',
        'service_issue',
        'staff_behavior',
        'pricing_dispute',
        'cleanliness',
        'waiting_time',
        'other'
    )),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
    description TEXT NOT NULL,
    purchase_date DATE,
    receipt_number VARCHAR(100),
    attachments JSONB,
    resolution TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_complaints_branch_id ON complaints(branch_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON complaints(priority);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at);
CREATE INDEX IF NOT EXISTS idx_complaints_complaint_number ON complaints(complaint_number);

-- Insert sample branches (you can modify these)
INSERT INTO branches (name, address, city, phone, email, manager_name) VALUES
('Main Branch', '123 Main Street', 'Downtown', '+1-555-0101', 'main@supermarket.com', 'John Smith'),
('North Branch', '456 North Avenue', 'Northside', '+1-555-0102', 'north@supermarket.com', 'Jane Doe'),
('South Branch', '789 South Road', 'Southside', '+1-555-0103', 'south@supermarket.com', 'Mike Johnson'),
('East Branch', '321 East Boulevard', 'Eastside', '+1-555-0104', 'east@supermarket.com', 'Sarah Wilson'),
('West Branch', '654 West Street', 'Westside', '+1-555-0105', 'west@supermarket.com', 'David Brown')
ON CONFLICT DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON complaints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
