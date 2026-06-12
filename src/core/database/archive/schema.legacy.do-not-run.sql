-- =========================================================================
-- 🇸🇦 Sahm OS - Enterprise Database Schema (Supabase / Vanilla PostgreSQL)
-- Multi-Store Isolation & High Fidelity eCommerce Data Layer
-- 📜 Version 22.0 - Professional Production Ready Schema with Tenant RLS
-- =========================================================================

-- Enable UUID extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TENANTS TABLE (تنظيم بيانات المنشآت والمستأجرين الأساسيين في سهم)
CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default Tenant Seed

-- 2. USERS TABLE (حسابات المستخدمين والمنسوبين والشركاء)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id),
    organization_id VARCHAR(100),
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL DEFAULT 'cashier',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ROLES TABLE (أدوار وصلاحيات النفاذ والتشغيل)
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PERMISSIONS TABLE (تفاصيل الميكانيكيات والتحكم)
CREATE TABLE IF NOT EXISTS permissions (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. COMPANIES TABLE (الشركات التابعة أو المنشآت الشقيقة والفرعية القابضة)
CREATE TABLE IF NOT EXISTS companies (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id),
    name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default Company Seed

-- 6. STORES & S_STORES TABLE (بوابة عزل المتاجر والمخازن)
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);



-- 7. BRANCHES & S_BRANCHES TABLE (الفروع ونقاط التوزيع الميدانية)
CREATE TABLE IF NOT EXISTS branches (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id),
    company_id VARCHAR(100) REFERENCES companies(id),
    store_id VARCHAR(100) REFERENCES stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);



-- 8. WAREHOUSES & S_WAREHOUSES TABLE (المستودعات والمخازن اللوجستية الإقليمية)
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);



-- 9. CATEGORIES TABLE (فئات وتصنيفات السلع والمنتجات)
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id),
    company_id VARCHAR(100) REFERENCES companies(id),
    store_id VARCHAR(100) REFERENCES stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. PRODUCTS & S_PRODUCTS TABLE (كتالوج وسجل المنتجات التفصيلي)
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
    seo_title VARCHAR(255),
    seo_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);



-- 11. INVENTORY TABLE (إدارة حركات المخزون والمستويات الدورية للفروع)
CREATE TABLE IF NOT EXISTS inventory (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id),
    company_id VARCHAR(100) REFERENCES companies(id),
    store_id VARCHAR(100) REFERENCES stores(id) ON DELETE CASCADE,
    branch_id VARCHAR(100) REFERENCES branches(id) ON DELETE CASCADE,
    warehouse_id VARCHAR(100) REFERENCES warehouses(id) ON DELETE CASCADE,
    product_id VARCHAR(100) NOT NULL,
    stock_qty INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. POS_TERMINALS TABLE (أجهزة الكاشير ونقاط البيع النشطة)
CREATE TABLE IF NOT EXISTS pos_terminals (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id),
    company_id VARCHAR(100) REFERENCES companies(id),
    store_id VARCHAR(100) REFERENCES stores(id) ON DELETE CASCADE,
    branch_id VARCHAR(100) REFERENCES branches(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12b. SUPPLIERS & S_SUPPLIERS TABLE (موردين المنشأة وتوثيق الأرصدة المالية)
CREATE TABLE IF NOT EXISTS suppliers (
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



-- 13. CUSTOMERS & S_CUSTOMERS TABLE (سجل المستهلكين والعملاء)
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id),
    company_id VARCHAR(100) REFERENCES companies(id),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(100),
    email VARCHAR(255),
    balance NUMERIC(15, 2) DEFAULT 0.00,
    tags TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);



-- 14. SALES TABLE (المبيعات والمعاملات المسجلة)
CREATE TABLE IF NOT EXISTS sales (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id),
    company_id VARCHAR(100) REFERENCES companies(id),
    store_id VARCHAR(100) REFERENCES stores(id) ON DELETE CASCADE,
    branch_id VARCHAR(100) REFERENCES branches(id) ON DELETE CASCADE,
    customer_id VARCHAR(100) REFERENCES customers(id),
    total NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    tax NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. SALE_ITEMS TABLE (تفاصيل وعناصر بنود المبيعات)
CREATE TABLE IF NOT EXISTS sale_items (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id),
    sale_id VARCHAR(100) NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id VARCHAR(100) NOT NULL,
    qty INTEGER NOT NULL DEFAULT 1,
    price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. INVOICES & S_INVOICES TABLE (الفواتير الضريبية المبسطة المعتمدة)
CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id),
    company_id VARCHAR(100) REFERENCES companies(id),
    store_id VARCHAR(100) REFERENCES stores(id) ON DELETE CASCADE,
    branch_id VARCHAR(100) REFERENCES branches(id) ON DELETE CASCADE,
    sale_id VARCHAR(100) REFERENCES sales(id),
    total NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'paid',
    date VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);



-- 17. SHIFTS TABLE (مناوبات العمل والصناديق للكاشيرية)
CREATE TABLE IF NOT EXISTS shifts (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id),
    company_id VARCHAR(100) REFERENCES companies(id),
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 18. SHIFT_BALANCES TABLE (جدولة ومطابقة الأرصدة الميدانية)
CREATE TABLE IF NOT EXISTS shift_balances (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id),
    shift_id VARCHAR(100) REFERENCES shifts(id) ON DELETE CASCADE,
    payment_method VARCHAR(100) NOT NULL, -- cash, card, transfer, wallet
    expected_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    actual_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    discrepancy NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 19. AUDIT_LOGS & S_AUDIT_LOGS
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);



-- Extra Enterprise Campaigns/Competitors
CREATE TABLE IF NOT EXISTS campaigns (
    campaign_id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id),
    product_id VARCHAR(100) REFERENCES products(id) ON DELETE CASCADE,
    store_id VARCHAR(100) REFERENCES stores(id) ON DELETE CASCADE,
    campaign_name VARCHAR(255),
    created_by VARCHAR(150) DEFAULT 'المدير العام',
    selected_channels TEXT[] DEFAULT '{}',
    campaign_price NUMERIC(15, 2) DEFAULT 0.00,
    campaign_quantity INTEGER DEFAULT 0,
    campaign_content TEXT,
    campaign_status VARCHAR(50) DEFAULT 'نشطة',
    clicks INTEGER DEFAULT 0,
    orders INTEGER DEFAULT 0,
    performance VARCHAR(100) DEFAULT 'غير معروف',
    ad_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS competitor_products (
    competitor_product_id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id),
    linked_product_id VARCHAR(100) REFERENCES products(id) ON DELETE SET NULL,
    store_id VARCHAR(100) REFERENCES stores(id) ON DELETE CASCADE,
    competitor_name VARCHAR(255) NOT NULL,
    competitor_url TEXT NOT NULL,
    competitor_product_name VARCHAR(255) NOT NULL,
    competitor_image TEXT,
    current_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    old_price NUMERIC(15, 2),
    currency VARCHAR(20) DEFAULT 'ر.س',
    availability VARCHAR(100) DEFAULT 'متوفر',
    category VARCHAR(150) DEFAULT 'عام',
    last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    monitoring_status VARCHAR(50) DEFAULT 'normal',
    fetch_source VARCHAR(50) DEFAULT 'manual_entry',
    initial_comparison TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS competitor_price_history (
    history_id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id),
    competitor_product_id VARCHAR(100) REFERENCES competitor_products(competitor_product_id) ON DELETE CASCADE,
    price NUMERIC(15, 2) NOT NULL,
    old_price NUMERIC(15, 2),
    availability VARCHAR(100) DEFAULT 'متوفر',
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    change_type VARCHAR(100),
    source VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_timeline_events (
    event_id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id),
    product_id VARCHAR(100) REFERENCES products(id) ON DELETE CASCADE,
    store_id VARCHAR(100) REFERENCES stores(id) ON DELETE CASCADE,
    event_type VARCHAR(100) DEFAULT 'standard',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_by VARCHAR(150) DEFAULT 'النظام التلقائي',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id),
    store_id VARCHAR(100) REFERENCES stores(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    time VARCHAR(100) DEFAULT 'الآن',
    type VARCHAR(50) DEFAULT 'info',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR TENANT ISOLATION
-- =========================================================================

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE s_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE s_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE s_warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE s_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_terminals ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE s_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE s_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE s_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE s_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE s_competitor_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE s_competitor_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE s_product_timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE s_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE s_suppliers ENABLE ROW LEVEL SECURITY;

-- Helper policy definition macro: Every tenant isolated securely
-- RLS Policy: Users can only see/modify rows of their active tenant.
-- Uses auth.jwt() claims with current_setting('app.current_tenant_id') and standard fallback 'tenant-local'.

CREATE POLICY tenant_isolation_tenants ON tenants
    FOR ALL USING (((auth.jwt() ->> 'tenant_id') IS NULL OR id = (auth.jwt() ->> 'tenant_id')));

CREATE POLICY tenant_isolation_users ON users
    FOR ALL USING (((auth.jwt() ->> 'tenant_id') IS NULL OR tenant_id = (auth.jwt() ->> 'tenant_id')));

CREATE POLICY tenant_isolation_roles ON roles
    FOR ALL USING (((auth.jwt() ->> 'tenant_id') IS NULL OR tenant_id = (auth.jwt() ->> 'tenant_id')));

CREATE POLICY tenant_isolation_permissions ON permissions
    FOR ALL USING (((auth.jwt() ->> 'tenant_id') IS NULL OR tenant_id = (auth.jwt() ->> 'tenant_id')));

CREATE POLICY tenant_isolation_companies ON companies
    FOR ALL USING (((auth.jwt() ->> 'tenant_id') IS NULL OR tenant_id = (auth.jwt() ->> 'tenant_id')));

CREATE POLICY tenant_isolation_stores ON stores
    FOR ALL USING (((auth.jwt() ->> 'tenant_id') IS NULL OR tenant_id = (auth.jwt() ->> 'tenant_id')));

CREATE POLICY tenant_isolation_s_stores ON s_stores
    FOR ALL USING (((auth.jwt() ->> 'tenant_id') IS NULL OR tenant_id = (auth.jwt() ->> 'tenant_id')));

CREATE POLICY tenant_isolation_branches ON branches
    FOR ALL USING (((auth.jwt() ->> 'tenant_id') IS NULL OR tenant_id = (auth.jwt() ->> 'tenant_id')));

CREATE POLICY tenant_isolation_s_branches ON s_branches
    FOR ALL USING (((auth.jwt() ->> 'tenant_id') IS NULL OR tenant_id = (auth.jwt() ->> 'tenant_id')));

CREATE POLICY tenant_isolation_warehouses ON warehouses
    FOR ALL USING (((auth.jwt() ->> 'tenant_id') IS NULL OR tenant_id = (auth.jwt() ->> 'tenant_id')));

CREATE POLICY tenant_isolation_s_warehouses ON s_warehouses
    FOR ALL USING (((auth.jwt() ->> 'tenant_id') IS NULL OR tenant_id = (auth.jwt() ->> 'tenant_id')));

CREATE POLICY tenant_isolation_categories ON categories
    FOR ALL USING (((auth.jwt() ->> 'tenant_id') IS NULL OR tenant_id = (auth.jwt() ->> 'tenant_id')));

CREATE POLICY tenant_isolation_products ON products
    FOR ALL USING (((auth.jwt() ->> 'tenant_id') IS NULL OR tenant_id = (auth.jwt() ->> 'tenant_id')));

CREATE POLICY tenant_isolation_s_products ON s_products
    FOR ALL USING (((auth.jwt() ->> 'tenant_id') IS NULL OR tenant_id = (auth.jwt() ->> 'tenant_id')));

CREATE POLICY tenant_isolation_inventory ON inventory
    FOR ALL USING (((auth.jwt() ->> 'tenant_id') IS NULL OR tenant_id = (auth.jwt() ->> 'tenant_id')));

CREATE POLICY tenant_isolation_pos_terminals ON pos_terminals
    FOR ALL USING (((auth.jwt() ->> 'tenant_id') IS NULL OR tenant_id = (auth.jwt() ->> 'tenant_id')));

CREATE POLICY tenant_isolation_customers ON customers
    FOR ALL USING (((auth.jwt() ->> 'tenant_id') IS NULL OR tenant_id = (auth.jwt() ->> 'tenant_id')));

CREATE POLICY tenant_isolation_s_customers ON s_customers
    FOR ALL USING (((auth.jwt() ->> 'tenant_id') IS NULL OR tenant_id = (auth.jwt() ->> 'tenant_id')));

CREATE POLICY tenant_isolation_sales ON sales
    FOR ALL USING (((auth.jwt() ->> 'tenant_id') IS NULL OR tenant_id = (auth.jwt() ->> 'tenant_id')));

CREATE POLICY tenant_isolation_sale_items ON sale_items
    FOR ALL USING (((auth.jwt() ->> 'tenant_id') IS NULL OR tenant_id = (auth.jwt() ->> 'tenant_id')));

CREATE POLICY tenant_isolation_invoices ON invoices
    FOR ALL USING (((auth.jwt() ->> 'tenant_id') IS NULL OR tenant_id = (auth.jwt() ->> 'tenant_id')));

CREATE POLICY tenant_isolation_s_invoices ON s_invoices
    FOR ALL USING (((auth.jwt() ->> 'tenant_id') IS NULL OR tenant_id = (auth.jwt() ->> 'tenant_id')));

CREATE POLICY tenant_isolation_shifts ON shifts
    FOR ALL USING (((auth.jwt() ->> 'tenant_id') IS NULL OR tenant_id = (auth.jwt() ->> 'tenant_id')));

CREATE POLICY tenant_isolation_shift_balances ON shift_balances
    FOR ALL USING (((auth.jwt() ->> 'tenant_id') IS NULL OR tenant_id = (auth.jwt() ->> 'tenant_id')));

CREATE POLICY tenant_isolation_audit_logs ON audit_logs
    FOR ALL USING (((auth.jwt() ->> 'tenant_id') IS NULL OR tenant_id = (auth.jwt() ->> 'tenant_id')));

CREATE POLICY tenant_isolation_s_audit_logs ON s_audit_logs
    FOR ALL USING (((auth.jwt() ->> 'tenant_id') IS NULL OR tenant_id = (auth.jwt() ->> 'tenant_id')));

CREATE POLICY tenant_isolation_s_campaigns ON s_campaigns
    FOR ALL USING (((auth.jwt() ->> 'tenant_id') IS NULL OR tenant_id = (auth.jwt() ->> 'tenant_id')));

CREATE POLICY tenant_isolation_competitors ON s_competitor_products
    FOR ALL USING (((auth.jwt() ->> 'tenant_id') IS NULL OR tenant_id = (auth.jwt() ->> 'tenant_id')));

CREATE POLICY tenant_isolation_history ON s_competitor_price_history
    FOR ALL USING (((auth.jwt() ->> 'tenant_id') IS NULL OR tenant_id = (auth.jwt() ->> 'tenant_id')));

CREATE POLICY tenant_isolation_timeline ON s_product_timeline_events
    FOR ALL USING (((auth.jwt() ->> 'tenant_id') IS NULL OR tenant_id = (auth.jwt() ->> 'tenant_id')));

CREATE POLICY tenant_isolation_notifications ON s_notifications
    FOR ALL USING (((auth.jwt() ->> 'tenant_id') IS NULL OR tenant_id = (auth.jwt() ->> 'tenant_id')));

CREATE POLICY tenant_isolation_suppliers ON suppliers
    FOR ALL USING (((auth.jwt() ->> 'tenant_id') IS NULL OR tenant_id = (auth.jwt() ->> 'tenant_id')));

CREATE POLICY tenant_isolation_s_suppliers ON s_suppliers
    FOR ALL USING (((auth.jwt() ->> 'tenant_id') IS NULL OR tenant_id = (auth.jwt() ->> 'tenant_id')));

-- Optional Performance Indexing for multi-store tenancy
CREATE INDEX IF NOT EXISTS idx_s_products_tenant ON s_products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_s_invoices_tenant ON s_invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_shifts_tenant ON shifts(tenant_id);

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

ALTER TABLE s_audit_logs ADD COLUMN IF NOT EXISTS company_id VARCHAR(100);
ALTER TABLE s_audit_logs ADD COLUMN IF NOT EXISTS store_id VARCHAR(100);
ALTER TABLE s_audit_logs ADD COLUMN IF NOT EXISTS branch_id VARCHAR(100);
ALTER TABLE s_audit_logs ADD COLUMN IF NOT EXISTS user_id VARCHAR(100);
ALTER TABLE s_audit_logs ADD COLUMN IF NOT EXISTS action VARCHAR(255);
ALTER TABLE s_audit_logs ADD COLUMN IF NOT EXISTS entity_type VARCHAR(100);
ALTER TABLE s_audit_logs ADD COLUMN IF NOT EXISTS entity_id VARCHAR(100);
ALTER TABLE s_audit_logs ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE s_audit_logs ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS company_id VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS store_id VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS branch_id VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS pos_id VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS warehouse_id VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS shift_id VARCHAR(100);

ALTER TABLE s_products ADD COLUMN IF NOT EXISTS company_id VARCHAR(100);
ALTER TABLE s_products ADD COLUMN IF NOT EXISTS store_id VARCHAR(100);
ALTER TABLE s_products ADD COLUMN IF NOT EXISTS branch_id VARCHAR(100);
ALTER TABLE s_products ADD COLUMN IF NOT EXISTS pos_id VARCHAR(100);
ALTER TABLE s_products ADD COLUMN IF NOT EXISTS warehouse_id VARCHAR(100);
ALTER TABLE s_products ADD COLUMN IF NOT EXISTS shift_id VARCHAR(100);

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS company_id VARCHAR(100);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS store_id VARCHAR(100);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS branch_id VARCHAR(100);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS pos_id VARCHAR(100);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS warehouse_id VARCHAR(100);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS shift_id VARCHAR(100);

ALTER TABLE s_invoices ADD COLUMN IF NOT EXISTS company_id VARCHAR(100);
ALTER TABLE s_invoices ADD COLUMN IF NOT EXISTS store_id VARCHAR(100);
ALTER TABLE s_invoices ADD COLUMN IF NOT EXISTS branch_id VARCHAR(100);
ALTER TABLE s_invoices ADD COLUMN IF NOT EXISTS pos_id VARCHAR(100);
ALTER TABLE s_invoices ADD COLUMN IF NOT EXISTS warehouse_id VARCHAR(100);
ALTER TABLE s_invoices ADD COLUMN IF NOT EXISTS shift_id VARCHAR(100);

ALTER TABLE shifts ADD COLUMN IF NOT EXISTS warehouse_id VARCHAR(100);

-- Upgrade branches and pos_terminals with missing fields for linking
ALTER TABLE branches ADD COLUMN IF NOT EXISTS associated_wh VARCHAR(100) REFERENCES warehouses(id) ON DELETE SET NULL;
ALTER TABLE pos_terminals ADD COLUMN IF NOT EXISTS warehouse_id VARCHAR(100) REFERENCES warehouses(id) ON DELETE SET NULL;
ALTER TABLE pos_terminals ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE;
ALTER TABLE pos_terminals ADD COLUMN IF NOT EXISTS status VARCHAR(100) DEFAULT 'نشط';
ALTER TABLE pos_terminals ADD COLUMN IF NOT EXISTS cashier VARCHAR(255);
ALTER TABLE pos_terminals ADD COLUMN IF NOT EXISTS pay_methods TEXT[] DEFAULT '{}';

-- Upgrade companies table with status and metadata fields
ALTER TABLE companies ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS company_legal_name VARCHAR(255);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS vat_number VARCHAR(100);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS manager_name VARCHAR(255);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS phone VARCHAR(100);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS bank_account TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(255) DEFAULT 'الباقة الاحترافية الذهبية';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS invoice_logo_url TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS stamp_url TEXT;



-- =========================================================================
-- 🔑 GRANT PRIVILEGES TO CLIENT ROLES FOR API ACCESS
-- =========================================================================
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon, authenticated, postgres, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, postgres, service_role;
