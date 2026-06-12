-- =========================================================================
-- 🇸🇦 Sahm OS - Professional Enterprise Database Migration SQL Script
-- Designed for Supabase SQL Editor / Vanilla PostgreSQL
-- 📊 This script bootstraps all 18 requested commerce & management tables
-- 🔒 Meets the strict constraint of tenant_id, created_at, and updated_at on all commercial tables
-- =========================================================================

-- Enable UUID extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. tenants
CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default Tenant Seed
INSERT INTO tenants (id, name) VALUES ('tenant-default', 'منشأة سهم العامة') ON CONFLICT DO NOTHING;

-- 2. users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id),
    organization_id VARCHAR(100),
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL DEFAULT 'cashier',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. roles
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. permissions
CREATE TABLE IF NOT EXISTS permissions (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. companies
CREATE TABLE IF NOT EXISTS companies (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id),
    name VARCHAR(255) NOT NULL,
    company_legal_name VARCHAR(255),
    registration_number VARCHAR(100),
    vat_number VARCHAR(100),
    manager_name VARCHAR(255),
    phone VARCHAR(100),
    email VARCHAR(255),
    bank_account VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    subscription_plan VARCHAR(255) DEFAULT 'الباقة الاحترافية الذهبية',
    logo_url TEXT,
    cover_url TEXT,
    invoice_logo_url TEXT,
    stamp_url TEXT,
    address TEXT,
    country VARCHAR(100),
    country_code VARCHAR(10),
    phone_country_code VARCHAR(10),
    phone_e164 VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default Company Seed
INSERT INTO companies (id, tenant_id, name, registration_number) VALUES ('comp-default', 'tenant-default', 'شركة مراسيم الطيب للتجارة المحدودة', '1010887645') ON CONFLICT DO NOTHING;

-- 6. stores
CREATE TABLE IF NOT EXISTS stores (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id),
    company_id VARCHAR(100) REFERENCES companies(id),
    name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    company_legal_name VARCHAR(255),
    description TEXT,
    cr_number VARCHAR(100),
    vat_number VARCHAR(100),
    logo_url TEXT,
    address JSONB DEFAULT '{}'::jsonb,
    bank_accounts JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default Store Seed
INSERT INTO stores (id, tenant_id, company_id, name, cr_number, vat_number, is_active) 
VALUES ('store_1', 'tenant-default', 'comp-default', 'متجر مراسيم الطيب - الرياض الرئيسي', '1010887645', '311245678900003', TRUE) 
ON CONFLICT DO NOTHING;


-- 7. branches
CREATE TABLE IF NOT EXISTS branches (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id),
    company_id VARCHAR(100) REFERENCES companies(id),
    store_id VARCHAR(100) REFERENCES stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default Branch Seed
INSERT INTO branches (id, tenant_id, company_id, store_id, name, city, address, is_active) 
VALUES ('branch_1', 'tenant-default', 'comp-default', 'store_1', 'الفرع الميداني الرئيسي واللوجستي', 'الرياض', 'شارع العليا العام، الرياض 11564', TRUE) 
ON CONFLICT DO NOTHING;


-- 8. warehouses
CREATE TABLE IF NOT EXISTS warehouses (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id),
    company_id VARCHAR(100) REFERENCES companies(id),
    store_id VARCHAR(100) REFERENCES stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) DEFAULT 'رئيسي',
    capacity INTEGER DEFAULT 10000,
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 20. pos_terminals
DROP TABLE IF EXISTS pos_terminals CASCADE;
CREATE TABLE pos_terminals (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id),
    company_id VARCHAR(100) REFERENCES companies(id),
    store_id VARCHAR(100) REFERENCES stores(id) ON DELETE CASCADE,
    branch_id VARCHAR(100) REFERENCES branches(id) ON DELETE CASCADE,
    warehouse_id VARCHAR(100) REFERENCES warehouses(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    status VARCHAR(100) DEFAULT 'نشط',
    is_active BOOLEAN DEFAULT TRUE,
    assigned_user_id VARCHAR(100) REFERENCES users(id),
    archived_at TIMESTAMP WITH TIME ZONE,
    cashier VARCHAR(255),
    pay_methods TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default POS Terminals Seed
INSERT INTO pos_terminals (id, tenant_id, store_id, branch_id, name, is_default, status)
VALUES 
('pos_riyadh_1', 'tenant-default', 'store_1', 'branch_1', 'كاشير فرع الرياض 1 🖥️', TRUE, 'نشط'),
('pos_riyadh_2', 'tenant-default', 'store_1', 'branch_1', 'كاشير فرع الرياض 2 📱', FALSE, 'نشط')
ON CONFLICT DO NOTHING;

-- 16. shifts
CREATE TABLE IF NOT EXISTS shifts (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id),
    company_id VARCHAR(100) REFERENCES companies(id) DEFAULT 'comp-default',
    store_id VARCHAR(100) REFERENCES stores(id),
    branch_id VARCHAR(100) REFERENCES branches(id),
    pos_id VARCHAR(100),
    cashier_id VARCHAR(100) NOT NULL,
    cashier_name VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'open', -- open, closed, approved, has_discrepancy
    starting_cash NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    start_time VARCHAR(100) NOT NULL,
    end_time VARCHAR(100),
    system_sales_count INTEGER DEFAULT 0,
    system_total_sales NUMERIC(15, 2) DEFAULT 0.00,
    system_cash_sales NUMERIC(15, 2) DEFAULT 0.00,
    system_card_sales NUMERIC(15, 2) DEFAULT 0.00,
    system_transfer_sales NUMERIC(15, 2) DEFAULT 0.00,
    system_wallet_sales NUMERIC(15, 2) DEFAULT 0.00,
    system_refunds NUMERIC(15, 2) DEFAULT 0.00,
    system_discounts NUMERIC(15, 2) DEFAULT 0.00,
    system_tax NUMERIC(15, 2) DEFAULT 0.00,
    expected_net NUMERIC(15, 2) DEFAULT 0.00,
    actual_cash NUMERIC(15, 2) DEFAULT 0.00,
    actual_card NUMERIC(15, 2) DEFAULT 0.00,
    actual_transfers NUMERIC(15, 2) DEFAULT 0.00,
    actual_expenses NUMERIC(15, 2) DEFAULT 0.00,
    cash_discrepancy NUMERIC(15, 2) DEFAULT 0.00,
    card_discrepancy NUMERIC(15, 2) DEFAULT 0.00,
    total_discrepancy NUMERIC(15, 2) DEFAULT 0.00,
    notes TEXT,
    giver_manager_name VARCHAR(255),
    receiver_manager_name VARCHAR(255),
    entry_notes TEXT,
    approved_by VARCHAR(255),
    approved_time VARCHAR(100),
    approval_notes TEXT,
    signature_manager VARCHAR(255),
    opening_cash NUMERIC(15, 2) DEFAULT 0.00,
    cash_sales NUMERIC(15, 2) DEFAULT 0.00,
    card_sales NUMERIC(15, 2) DEFAULT 0.00,
    transfer_sales NUMERIC(15, 2) DEFAULT 0.00,
    wallet_sales NUMERIC(15, 2) DEFAULT 0.00,
    expected_cash NUMERIC(15, 2) DEFAULT 0.00,
    difference NUMERIC(15, 2) DEFAULT 0.00,
    closed_at TIMESTAMP WITH TIME ZONE,
    closed_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. shift_balances
CREATE TABLE IF NOT EXISTS shift_balances (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id),
    shift_id VARCHAR(100) REFERENCES shifts(id) ON DELETE CASCADE,
    payment_method VARCHAR(100) NOT NULL, -- cash, card, transfer, wallet
    expected_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    actual_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    discrepancy NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- Default Warehouse Seed
INSERT INTO warehouses (id, tenant_id, company_id, store_id, name, type, capacity, is_active) 
VALUES ('wh_1', 'tenant-default', 'comp-default', 'store_1', 'المستودع الرئيسي المغلق', 'رئيسي', 15000, TRUE) 
ON CONFLICT DO NOTHING;


-- 9. categories
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id),
    company_id VARCHAR(100) REFERENCES companies(id),
    store_id VARCHAR(100) REFERENCES stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100) DEFAULT '🏷️',
    color VARCHAR(50) DEFAULT '#D4AF37',
    parent VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. products
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id),
    company_id VARCHAR(100) REFERENCES companies(id),
    store_id VARCHAR(100) REFERENCES stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    barcode VARCHAR(100),
    price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    cost NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    stock INTEGER NOT NULL DEFAULT 0,
    weight NUMERIC(10, 2),
    category VARCHAR(150) DEFAULT 'عام',
    description TEXT,
    product_status VARCHAR(50) DEFAULT 'published',
    images JSONB DEFAULT '[]'::jsonb,
    image TEXT,
    seo_title VARCHAR(255),
    seo_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. inventory
CREATE TABLE IF NOT EXISTS inventory (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id),
    company_id VARCHAR(100) REFERENCES companies(id),
    store_id VARCHAR(100) REFERENCES stores(id) ON DELETE CASCADE,
    branch_id VARCHAR(100) REFERENCES branches(id) ON DELETE CASCADE,
    warehouse_id VARCHAR(100) REFERENCES warehouses(id) ON DELETE CASCADE,
    product_id VARCHAR(100) NOT NULL,
    stock_qty INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. customers
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id),
    company_id VARCHAR(100) REFERENCES companies(id),
    store_id VARCHAR(100) REFERENCES stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(100),
    email VARCHAR(255),
    balance NUMERIC(15, 2) DEFAULT 0.00,
    tags TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. sales
CREATE TABLE IF NOT EXISTS sales (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id),
    company_id VARCHAR(100) REFERENCES companies(id) DEFAULT 'comp-default',
    store_id VARCHAR(100) REFERENCES stores(id) ON DELETE CASCADE,
    branch_id VARCHAR(100) REFERENCES branches(id) ON DELETE CASCADE,
    customer_id VARCHAR(100) REFERENCES customers(id),
    pos_id VARCHAR(100) REFERENCES pos_terminals(id),
    warehouse_id VARCHAR(100) REFERENCES warehouses(id),
    shift_id VARCHAR(100) REFERENCES shifts(id),
    total NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    tax NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    payment_method VARCHAR(100),
    cash_amount NUMERIC(15, 2) DEFAULT 0.00,
    card_amount NUMERIC(15, 2) DEFAULT 0.00,
    transfer_amount NUMERIC(15, 2) DEFAULT 0.00,
    wallet_amount NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. sale_items
CREATE TABLE IF NOT EXISTS sale_items (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id),
    sale_id VARCHAR(100) NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id VARCHAR(100) NOT NULL,
    qty INTEGER NOT NULL DEFAULT 1,
    price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. invoices
CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id),
    company_id VARCHAR(100) REFERENCES companies(id) DEFAULT 'comp-default',
    store_id VARCHAR(100) REFERENCES stores(id) ON DELETE CASCADE,
    branch_id VARCHAR(100) REFERENCES branches(id) ON DELETE CASCADE,
    sale_id VARCHAR(100) REFERENCES sales(id),
    pos_id VARCHAR(100) REFERENCES pos_terminals(id),
    warehouse_id VARCHAR(100) REFERENCES warehouses(id),
    shift_id VARCHAR(100) REFERENCES shifts(id),
    total NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'paid',
    date VARCHAR(50) NOT NULL,
    discount NUMERIC(15, 2) DEFAULT 0.00,
    customer VARCHAR(255),
    items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 18. audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id),
    company_id VARCHAR(100),
    store_id VARCHAR(100),
    branch_id VARCHAR(100),
    user_id VARCHAR(100),
    action VARCHAR(255),
    entity_type VARCHAR(100),
    entity_id VARCHAR(100),
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    event VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    "user" VARCHAR(150) DEFAULT 'المدير العام',
    time VARCHAR(50) DEFAULT 'الآن',
    date VARCHAR(50) DEFAULT 'اليوم',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 19. suppliers
DROP TABLE IF EXISTS suppliers CASCADE;
CREATE TABLE suppliers (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id),
    company_id VARCHAR(100) REFERENCES companies(id),
    store_id VARCHAR(100) REFERENCES stores(id) ON DELETE CASCADE,
    branch_id VARCHAR(100) REFERENCES branches(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(100),
    company VARCHAR(255),
    balance NUMERIC(15, 2) DEFAULT 0.00,
    address_profile JSONB DEFAULT '{}'::jsonb,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- Disable Row Level Security or Create Simple RLS Rules for Direct Access
-- (Since these apps are deployed within a unified admin interface, we ensure simple rules)
-- =========================================================================
-- =========================================================================
-- Enable Row Level Security (RLS) and Create Tenant Isolation Policies
-- =========================================================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_terminals ENABLE ROW LEVEL SECURITY;

-- Create Tenant Isolation Policies
DROP POLICY IF EXISTS tenant_isolation_policy ON tenants;
CREATE POLICY tenant_isolation_policy ON tenants FOR ALL USING (id = (auth.jwt() ->> 'tenant_id'));

DROP POLICY IF EXISTS tenant_isolation_policy ON users;
CREATE POLICY tenant_isolation_policy ON users FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id'));

DROP POLICY IF EXISTS tenant_isolation_policy ON roles;
CREATE POLICY tenant_isolation_policy ON roles FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id'));

DROP POLICY IF EXISTS tenant_isolation_policy ON permissions;
CREATE POLICY tenant_isolation_policy ON permissions FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id'));

DROP POLICY IF EXISTS tenant_isolation_policy ON companies;
CREATE POLICY tenant_isolation_policy ON companies FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id'));

DROP POLICY IF EXISTS tenant_isolation_policy ON stores;
CREATE POLICY tenant_isolation_policy ON stores FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id'));

DROP POLICY IF EXISTS tenant_isolation_policy ON branches;
CREATE POLICY tenant_isolation_policy ON branches FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id'));

DROP POLICY IF EXISTS tenant_isolation_policy ON warehouses;
CREATE POLICY tenant_isolation_policy ON warehouses FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id'));

DROP POLICY IF EXISTS tenant_isolation_policy ON categories;
CREATE POLICY tenant_isolation_policy ON categories FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id'));

DROP POLICY IF EXISTS tenant_isolation_policy ON products;
CREATE POLICY tenant_isolation_policy ON products FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id'));

DROP POLICY IF EXISTS tenant_isolation_policy ON inventory;
CREATE POLICY tenant_isolation_policy ON inventory FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id'));

DROP POLICY IF EXISTS tenant_isolation_policy ON customers;
CREATE POLICY tenant_isolation_policy ON customers FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id'));

DROP POLICY IF EXISTS tenant_isolation_policy ON sales;
CREATE POLICY tenant_isolation_policy ON sales FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id'));

DROP POLICY IF EXISTS tenant_isolation_policy ON sale_items;
CREATE POLICY tenant_isolation_policy ON sale_items FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id'));

DROP POLICY IF EXISTS tenant_isolation_policy ON invoices;
CREATE POLICY tenant_isolation_policy ON invoices FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id'));

DROP POLICY IF EXISTS tenant_isolation_policy ON shifts;
CREATE POLICY tenant_isolation_policy ON shifts FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id'));

DROP POLICY IF EXISTS tenant_isolation_policy ON shift_balances;
CREATE POLICY tenant_isolation_policy ON shift_balances FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id'));

DROP POLICY IF EXISTS tenant_isolation_policy ON audit_logs;
CREATE POLICY tenant_isolation_policy ON audit_logs FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id'));

DROP POLICY IF EXISTS tenant_isolation_policy ON suppliers;
CREATE POLICY tenant_isolation_policy ON suppliers FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id'));

DROP POLICY IF EXISTS tenant_isolation_policy ON pos_terminals;
CREATE POLICY tenant_isolation_policy ON pos_terminals FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id'));

-- Ensure any existing tables from previous schema configurations are upgraded with missing columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount NUMERIC(15, 2) DEFAULT 0.00;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS customer VARCHAR(255);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE shift_balances ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE shift_balances ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id VARCHAR(100);

ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS company_id VARCHAR(100);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS store_id VARCHAR(100);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS branch_id VARCHAR(100);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS user_id VARCHAR(100);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS action VARCHAR(255);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS entity_type VARCHAR(100);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS entity_id VARCHAR(100);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Safe Alterations for existing tables to add pos_id, warehouse_id, and shift_id columns
ALTER TABLE sales ADD COLUMN IF NOT EXISTS pos_id VARCHAR(100);
ALTER TABLE sales ADD COLUMN IF NOT EXISTS warehouse_id VARCHAR(100);
ALTER TABLE sales ADD COLUMN IF NOT EXISTS shift_id VARCHAR(100);

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS pos_id VARCHAR(100);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS warehouse_id VARCHAR(100);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS shift_id VARCHAR(100);

-- Safe Alterations for existing companies table to add metadata, country and phone details
ALTER TABLE companies ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS company_legal_name VARCHAR(255);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS vat_number VARCHAR(100);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS manager_name VARCHAR(255);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS phone VARCHAR(100);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS bank_account VARCHAR(255);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(255);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS invoice_logo_url TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS stamp_url TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS country VARCHAR(100);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS country_code VARCHAR(10);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS phone_country_code VARCHAR(10);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS phone_e164 VARCHAR(100);

-- =========================================================================
-- 💳 SaaS Subscription & Billing System Upgrade
-- =========================================================================

-- 21. subscription_plans
CREATE TABLE IF NOT EXISTS subscription_plans (
    id VARCHAR(100) PRIMARY KEY,
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    description TEXT,
    monthly_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    yearly_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(50) DEFAULT 'SAR',
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, inactive, hidden
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 22. plan_features
CREATE TABLE IF NOT EXISTS plan_features (
    id VARCHAR(100) PRIMARY KEY,
    plan_id VARCHAR(100) NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
    feature_key VARCHAR(100) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    limit_value INTEGER DEFAULT 0,
    is_unlimited BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 23. tenant_subscriptions
CREATE TABLE IF NOT EXISTS tenant_subscriptions (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    company_id VARCHAR(100) REFERENCES companies(id) ON DELETE CASCADE,
    plan_id VARCHAR(100) REFERENCES subscription_plans(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'trial', -- trial, active, suspended, expired, cancelled
    start_date VARCHAR(50),
    trial_ends_at VARCHAR(50),
    current_period_start VARCHAR(50),
    current_period_end VARCHAR(50),
    billing_cycle VARCHAR(50) DEFAULT 'monthly', -- monthly, yearly
    custom_price NUMERIC(15, 2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 24. subscription_usage
CREATE TABLE IF NOT EXISTS subscription_usage (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    company_id VARCHAR(100) REFERENCES companies(id) ON DELETE CASCADE,
    period_month VARCHAR(50) NOT NULL, -- e.g., '2026-06'
    invoices_count INTEGER DEFAULT 0,
    products_count INTEGER DEFAULT 0,
    users_count INTEGER DEFAULT 0,
    branches_count INTEGER DEFAULT 0,
    stores_count INTEGER DEFAULT 0,
    pos_count INTEGER DEFAULT 0,
    ai_requests_count INTEGER DEFAULT 0,
    storage_used_mb NUMERIC(15, 2) DEFAULT 0.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 25. tenant_feature_overrides
CREATE TABLE IF NOT EXISTS tenant_feature_overrides (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    company_id VARCHAR(100) REFERENCES companies(id) ON DELETE CASCADE,
    feature_key VARCHAR(100) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    limit_value INTEGER DEFAULT 0,
    is_unlimited BOOLEAN DEFAULT FALSE,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_feature_overrides ENABLE ROW LEVEL SECURITY;

-- Create Tenant Isolation Policies
DROP POLICY IF EXISTS platform_owner_manage_plans ON subscription_plans;
CREATE POLICY platform_owner_manage_plans ON subscription_plans FOR ALL USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS platform_owner_manage_features ON plan_features;
CREATE POLICY platform_owner_manage_features ON plan_features FOR ALL USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS tenant_subscription_isolation ON tenant_subscriptions;
CREATE POLICY tenant_subscription_isolation ON tenant_subscriptions FOR ALL USING (
  (auth.jwt() ->> 'tenant_id') IS NULL OR 
  tenant_id = (auth.jwt() ->> 'tenant_id')
);

DROP POLICY IF EXISTS tenant_usage_isolation ON subscription_usage;
CREATE POLICY tenant_usage_isolation ON subscription_usage FOR ALL USING (
  (auth.jwt() ->> 'tenant_id') IS NULL OR 
  tenant_id = (auth.jwt() ->> 'tenant_id')
);

DROP POLICY IF EXISTS tenant_overrides_isolation ON tenant_feature_overrides;
CREATE POLICY tenant_overrides_isolation ON tenant_feature_overrides FOR ALL USING (
  (auth.jwt() ->> 'tenant_id') IS NULL OR 
  tenant_id = (auth.jwt() ->> 'tenant_id')
);

-- Safe Alterations for users table to support direct credentials verification & syncing
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_id VARCHAR(100) REFERENCES companies(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Safe Alterations for pos_terminals table to add assigned_user_id and is_active columns
ALTER TABLE pos_terminals ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE pos_terminals ADD COLUMN IF NOT EXISTS assigned_user_id VARCHAR(100) REFERENCES users(id);
ALTER TABLE pos_terminals ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;

-- Safe campaigns table DDL with RLS and tenant isolation policy
CREATE TABLE IF NOT EXISTS campaigns (
  id VARCHAR(100) PRIMARY KEY,
  campaign_id VARCHAR(100) UNIQUE,
  tenant_id VARCHAR(100) REFERENCES tenants(id) ON DELETE CASCADE,
  company_id VARCHAR(100) REFERENCES companies(id) ON DELETE CASCADE,
  product_id VARCHAR(100),
  store_id VARCHAR(100) REFERENCES stores(id) ON DELETE SET NULL,
  campaign_name TEXT,
  campaign_content TEXT,
  created_by VARCHAR(100),
  selected_channels TEXT[],
  campaign_price NUMERIC(15,2) DEFAULT 0,
  campaign_quantity INTEGER DEFAULT 0,
  campaign_status VARCHAR(50) DEFAULT 'draft',
  clicks INTEGER DEFAULT 0,
  orders INTEGER DEFAULT 0,
  performance JSONB DEFAULT '{}'::jsonb,
  ad_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS campaigns_tenant_isolation ON campaigns;
CREATE POLICY campaigns_tenant_isolation
ON campaigns FOR ALL
USING (
  tenant_id = (auth.jwt() ->> 'tenant_id')
  OR (auth.jwt() ->> 'role') IN ('platform_owner', 'system_owner', 'system_admin')
)
WITH CHECK (
  tenant_id = (auth.jwt() ->> 'tenant_id')
  OR (auth.jwt() ->> 'role') IN ('platform_owner', 'system_owner', 'system_admin')
);


-- 19. product_studio_sessions
CREATE TABLE IF NOT EXISTS product_studio_sessions (
  id VARCHAR(100) PRIMARY KEY,
  tenant_id VARCHAR(100) REFERENCES tenants(id) ON DELETE CASCADE,
  company_id VARCHAR(100) REFERENCES companies(id) ON DELETE CASCADE,
  store_id VARCHAR(100) REFERENCES stores(id) ON DELETE SET NULL,
  branch_id VARCHAR(100) REFERENCES branches(id) ON DELETE SET NULL,
  product_id VARCHAR(100) REFERENCES products(id) ON DELETE SET NULL,
  category_id VARCHAR(100),
  status VARCHAR(50) DEFAULT 'draft',
  current_step VARCHAR(100) DEFAULT 'إدخال المنتج',
  brand_voice TEXT,
  target_market TEXT,
  target_audience TEXT,
  sales_channel TEXT,
  original_image_url TEXT,
  approved_text_version_id VARCHAR(100),
  approved_image_asset_ids JSONB DEFAULT '[]'::jsonb,
  approved_video_asset_ids JSONB DEFAULT '[]'::jsonb,
  created_by VARCHAR(100) REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on product_studio_sessions
ALTER TABLE product_studio_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS studio_sessions_tenant_isolation ON product_studio_sessions;
CREATE POLICY studio_sessions_tenant_isolation ON product_studio_sessions FOR ALL USING (
  (auth.jwt() ->> 'tenant_id') IS NULL OR
  tenant_id = (auth.jwt() ->> 'tenant_id')
  OR (auth.jwt() ->> 'role') IN ('platform_owner', 'system_owner', 'system_admin')
) WITH CHECK (
  (auth.jwt() ->> 'tenant_id') IS NULL OR
  tenant_id = (auth.jwt() ->> 'tenant_id')
  OR (auth.jwt() ->> 'role') IN ('platform_owner', 'system_owner', 'system_admin')
);


-- 20. brand_profiles
CREATE TABLE IF NOT EXISTS brand_profiles (
  id VARCHAR(100) PRIMARY KEY,
  tenant_id VARCHAR(100) REFERENCES tenants(id) ON DELETE CASCADE,
  company_id VARCHAR(100) REFERENCES companies(id) ON DELETE CASCADE,
  brand_name VARCHAR(255) NOT NULL,
  primary_color VARCHAR(50),
  secondary_color VARCHAR(50),
  accent_color VARCHAR(50),
  fonts JSONB DEFAULT '{}'::jsonb,
  tone_of_voice TEXT,
  forbidden_words JSONB DEFAULT '[]'::jsonb,
  preferred_words JSONB DEFAULT '[]'::jsonb,
  logo_url TEXT,
  guidelines JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on brand_profiles
ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS brand_profiles_tenant_isolation ON brand_profiles;
CREATE POLICY brand_profiles_tenant_isolation ON brand_profiles FOR ALL USING (
  (auth.jwt() ->> 'tenant_id') IS NULL OR
  tenant_id = (auth.jwt() ->> 'tenant_id')
  OR (auth.jwt() ->> 'role') IN ('platform_owner', 'system_owner', 'system_admin')
) WITH CHECK (
  (auth.jwt() ->> 'tenant_id') IS NULL OR
  tenant_id = (auth.jwt() ->> 'tenant_id')
  OR (auth.jwt() ->> 'role') IN ('platform_owner', 'system_owner', 'system_admin')
);


-- 21. product_ai_analysis
CREATE TABLE IF NOT EXISTS product_ai_analysis (
  id VARCHAR(100) PRIMARY KEY,
  session_id VARCHAR(100) REFERENCES product_studio_sessions(id) ON DELETE CASCADE,
  tenant_id VARCHAR(100) REFERENCES tenants(id) ON DELETE CASCADE,
  product_id VARCHAR(100),
  analysis_json JSONB DEFAULT '{}'::jsonb,
  product_type VARCHAR(255),
  suggested_category VARCHAR(255),
  target_audience TEXT,
  strengths JSONB DEFAULT '[]'::jsonb,
  weaknesses JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on product_ai_analysis
ALTER TABLE product_ai_analysis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ai_analysis_tenant_isolation ON product_ai_analysis;
CREATE POLICY ai_analysis_tenant_isolation ON product_ai_analysis FOR ALL USING (
  (auth.jwt() ->> 'tenant_id') IS NULL OR
  tenant_id = (auth.jwt() ->> 'tenant_id')
  OR (auth.jwt() ->> 'role') IN ('platform_owner', 'system_owner', 'system_admin')
) WITH CHECK (
  (auth.jwt() ->> 'tenant_id') IS NULL OR
  tenant_id = (auth.jwt() ->> 'tenant_id')
  OR (auth.jwt() ->> 'role') IN ('platform_owner', 'system_owner', 'system_admin')
);


-- Initialize storage bucket and access policies for product-assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-assets', 'product-assets', true) 
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-assets');

DROP POLICY IF EXISTS "Insert Access" ON storage.objects;
CREATE POLICY "Insert Access" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-assets');

-- Alter product_studio_sessions table to add Phase 2 fields
ALTER TABLE product_studio_sessions ADD COLUMN IF NOT EXISTS product_name VARCHAR(255);
ALTER TABLE product_studio_sessions ADD COLUMN IF NOT EXISTS price NUMERIC;
ALTER TABLE product_studio_sessions ADD COLUMN IF NOT EXISTS cost NUMERIC;
ALTER TABLE product_studio_sessions ADD COLUMN IF NOT EXISTS sku VARCHAR(100);
ALTER TABLE product_studio_sessions ADD COLUMN IF NOT EXISTS quantity INTEGER;
ALTER TABLE product_studio_sessions ADD COLUMN IF NOT EXISTS user_notes TEXT;


-- 22. product_content_versions
CREATE TABLE IF NOT EXISTS product_content_versions (
  id VARCHAR(100) PRIMARY KEY,
  session_id VARCHAR(100) REFERENCES product_studio_sessions(id) ON DELETE CASCADE,
  tenant_id VARCHAR(100) REFERENCES tenants(id) ON DELETE CASCADE,
  product_id VARCHAR(100),
  version_number INTEGER NOT NULL,
  style VARCHAR(100),
  language VARCHAR(50),
  title VARCHAR(255),
  product_name VARCHAR(255),
  short_description TEXT,
  long_description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  benefits JSONB DEFAULT '[]'::jsonb,
  seo_keywords JSONB DEFAULT '[]'::jsonb,
  captions JSONB DEFAULT '{}'::jsonb,
  ad_copy JSONB DEFAULT '{}'::jsonb,
  cta VARCHAR(255),
  status VARCHAR(50) DEFAULT 'draft',
  is_approved BOOLEAN DEFAULT FALSE,
  prompt_used TEXT,
  ai_model VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on product_content_versions
ALTER TABLE product_content_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS content_versions_tenant_isolation ON product_content_versions;
CREATE POLICY content_versions_tenant_isolation ON product_content_versions FOR ALL USING (
  (auth.jwt() ->> 'tenant_id') IS NULL OR
  tenant_id = (auth.jwt() ->> 'tenant_id')
  OR (auth.jwt() ->> 'role') IN ('platform_owner', 'system_owner', 'system_admin')
) WITH CHECK (
  (auth.jwt() ->> 'tenant_id') IS NULL OR
  tenant_id = (auth.jwt() ->> 'tenant_id')
  OR (auth.jwt() ->> 'role') IN ('platform_owner', 'system_owner', 'system_admin')
);


-- 23. product_assets
CREATE TABLE IF NOT EXISTS product_assets (
  id VARCHAR(100) PRIMARY KEY,
  session_id VARCHAR(100) REFERENCES product_studio_sessions(id) ON DELETE CASCADE,
  tenant_id VARCHAR(100) REFERENCES tenants(id) ON DELETE CASCADE,
  company_id VARCHAR(100) DEFAULT 'comp-default',
  product_id VARCHAR(100),
  category_id VARCHAR(100),
  asset_type VARCHAR(100) DEFAULT 'image', -- e.g. 'image', 'image_prompt', 'video'
  asset_purpose VARCHAR(100), -- e.g. 'Hero', 'Features', 'Offer', 'Story'
  title VARCHAR(255),
  url TEXT,
  content TEXT,
  prompt_used TEXT,
  generation_settings JSONB DEFAULT '{}'::jsonb,
  dimensions VARCHAR(50), -- e.g. '1:1', '4:5', '9:16', '16:9', 'Banner'
  file_size INTEGER,
  mime_type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'draft',
  is_approved BOOLEAN DEFAULT FALSE,
  storage_path VARCHAR(255),
  created_by VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on product_assets
ALTER TABLE product_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS product_assets_tenant_isolation ON product_assets;
CREATE POLICY product_assets_tenant_isolation ON product_assets FOR ALL USING (
  (auth.jwt() ->> 'tenant_id') IS NULL OR
  tenant_id = (auth.jwt() ->> 'tenant_id')
  OR (auth.jwt() ->> 'role') IN ('platform_owner', 'system_owner', 'system_admin')
) WITH CHECK (
  (auth.jwt() ->> 'tenant_id') IS NULL OR
  tenant_id = (auth.jwt() ->> 'tenant_id')
  OR (auth.jwt() ->> 'role') IN ('platform_owner', 'system_owner', 'system_admin')
);


-- 28. product_publish_packages
CREATE TABLE IF NOT EXISTS product_publish_packages (
  id VARCHAR(100) PRIMARY KEY,
  session_id VARCHAR(100) NOT NULL REFERENCES product_studio_sessions(id) ON DELETE CASCADE,
  tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  product_id VARCHAR(100) NOT NULL,
  channel VARCHAR(100) NOT NULL,
  title VARCHAR(255),
  description TEXT,
  caption TEXT,
  hashtags JSONB DEFAULT '[]'::jsonb,
  cta VARCHAR(255),
  selected_asset_ids JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'reviewed', 'approved'
  reviewed_by VARCHAR(100),
  reviewed_at VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on product_publish_packages
ALTER TABLE product_publish_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS product_publish_packages_tenant_isolation ON product_publish_packages;
CREATE POLICY product_publish_packages_tenant_isolation ON product_publish_packages FOR ALL USING (
  (auth.jwt() ->> 'tenant_id') IS NULL OR
  tenant_id = (auth.jwt() ->> 'tenant_id')
  OR (auth.jwt() ->> 'role') IN ('platform_owner', 'system_owner', 'system_admin')
) WITH CHECK (
  (auth.jwt() ->> 'tenant_id') IS NULL OR
  tenant_id = (auth.jwt() ->> 'tenant_id')
  OR (auth.jwt() ->> 'role') IN ('platform_owner', 'system_owner', 'system_admin')
);


-- 29. product_quality_reviews
CREATE TABLE IF NOT EXISTS product_quality_reviews (
  id VARCHAR(100) PRIMARY KEY,
  session_id VARCHAR(100) NOT NULL REFERENCES product_studio_sessions(id) ON DELETE CASCADE,
  tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  product_id VARCHAR(100),
  overall_score INTEGER NOT NULL,
  content_score INTEGER NOT NULL,
  image_score INTEGER NOT NULL,
  video_score INTEGER NOT NULL,
  brand_score INTEGER NOT NULL,
  persuasion_score INTEGER NOT NULL,
  positives JSONB DEFAULT '[]'::jsonb,
  negatives JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(50) DEFAULT 'ready', -- 'ready', 'needs_improvement', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on product_quality_reviews
ALTER TABLE product_quality_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS product_quality_reviews_tenant_isolation ON product_quality_reviews;
CREATE POLICY product_quality_reviews_tenant_isolation ON product_quality_reviews FOR ALL USING (
  (auth.jwt() ->> 'tenant_id') IS NULL OR
  tenant_id = (auth.jwt() ->> 'tenant_id')
  OR (auth.jwt() ->> 'role') IN ('platform_owner', 'system_owner', 'system_admin')
) WITH CHECK (
  (auth.jwt() ->> 'tenant_id') IS NULL OR
  tenant_id = (auth.jwt() ->> 'tenant_id')
  OR (auth.jwt() ->> 'role') IN ('platform_owner', 'system_owner', 'system_admin')
);


-- 30. customer_conversations
CREATE TABLE IF NOT EXISTS customer_conversations (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    company_id VARCHAR(100) NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_phone VARCHAR(100) NOT NULL,
    customer_name VARCHAR(255),
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on customer_conversations
ALTER TABLE customer_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS customer_conversations_tenant_isolation ON customer_conversations;
CREATE POLICY customer_conversations_tenant_isolation ON customer_conversations FOR ALL USING (
(auth.jwt() ->> 'tenant_id') IS NULL OR
tenant_id = (auth.jwt() ->> 'tenant_id')
OR (auth.jwt() ->> 'role') IN ('platform_owner', 'system_owner', 'system_admin')
) WITH CHECK (
(auth.jwt() ->> 'tenant_id') IS NULL OR
tenant_id = (auth.jwt() ->> 'tenant_id')
OR (auth.jwt() ->> 'role') IN ('platform_owner', 'system_owner', 'system_admin')
);

DROP POLICY IF EXISTS customer_conversations_anon_policy ON customer_conversations;
CREATE POLICY customer_conversations_anon_policy ON customer_conversations FOR ALL USING (true) WITH CHECK (true);


-- 31. customer_messages
CREATE TABLE IF NOT EXISTS customer_messages (
    id VARCHAR(100) PRIMARY KEY,
    conversation_id VARCHAR(100) NOT NULL REFERENCES customer_conversations(id) ON DELETE CASCADE,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    company_id VARCHAR(100) NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    direction VARCHAR(50) NOT NULL, -- 'inbound' or 'outbound'
    sender_phone VARCHAR(100) NOT NULL,
    message_text TEXT,
    status VARCHAR(50) DEFAULT 'received', -- 'sent', 'delivered', 'read', 'received'
    whatsapp_message_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on customer_messages
ALTER TABLE customer_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS customer_messages_tenant_isolation ON customer_messages;
CREATE POLICY customer_messages_tenant_isolation ON customer_messages FOR ALL USING (
(auth.jwt() ->> 'tenant_id') IS NULL OR
tenant_id = (auth.jwt() ->> 'tenant_id')
OR (auth.jwt() ->> 'role') IN ('platform_owner', 'system_owner', 'system_admin')
) WITH CHECK (
(auth.jwt() ->> 'tenant_id') IS NULL OR
tenant_id = (auth.jwt() ->> 'tenant_id')
OR (auth.jwt() ->> 'role') IN ('platform_owner', 'system_owner', 'system_admin')
);

DROP POLICY IF EXISTS customer_messages_anon_policy ON customer_messages;
CREATE POLICY customer_messages_anon_policy ON customer_messages FOR ALL USING (true) WITH CHECK (true);



