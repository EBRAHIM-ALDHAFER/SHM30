-- =========================================================================
-- 🇸🇦 Sahm OS - Enterprise Database Schema (Supabase / Vanilla PostgreSQL)
-- Multi-Store Isolation & High Fidelity eCommerce Data Layer
-- 📜 Version 21.0 - Professional Production Ready Schema
-- =========================================================================

-- 1. STORES TABLE (البوابة وجذر عزل المتاجر)
CREATE TABLE IF NOT EXISTS s_stores (
    id VARCHAR(100) PRIMARY KEY,
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

-- 2. PRODUCTS TABLE (كتالوج وبطاقات السلع التفاعلية)
CREATE TABLE IF NOT EXISTS s_products (
    id VARCHAR(100) PRIMARY KEY,
    store_id VARCHAR(100) REFERENCES s_stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    barcode VARCHAR(100),
    price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    cost NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    stock INTEGER NOT NULL DEFAULT 0,
    weight NUMERIC(10, 2),
    category VARCHAR(150) DEFAULT 'عام',
    description TEXT,
    product_status VARCHAR(50) DEFAULT 'published', -- published, drafted, archived
    images JSONB DEFAULT '[]'::jsonb, -- Array of strings/objects
    seo_title VARCHAR(255),
    seo_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. INTERACTIVE INTELLIGENT CAMPAIGNS (جدولة وحملات التسويق الذكية)
CREATE TABLE IF NOT EXISTS s_campaigns (
    campaign_id VARCHAR(100) PRIMARY KEY,
    product_id VARCHAR(100) REFERENCES s_products(id) ON DELETE CASCADE,
    store_id VARCHAR(100) REFERENCES s_stores(id) ON DELETE CASCADE,
    campaign_name VARCHAR(255),
    created_by VARCHAR(150) DEFAULT 'المدير العام',
    selected_channels TEXT[] DEFAULT '{}', -- Array of channels (Platforms)
    campaign_price NUMERIC(15, 2) DEFAULT 0.00,
    campaign_quantity INTEGER DEFAULT 0,
    campaign_content TEXT,
    campaign_status VARCHAR(50) DEFAULT 'نشطة', -- نشطة، مؤقتة، مؤرشفة
    clicks INTEGER DEFAULT 0,
    orders INTEGER DEFAULT 0,
    performance VARCHAR(100) DEFAULT 'غير معروف',
    ad_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. COMPETITOR PRODUCTS (رصد المنافسين المباشرين)
CREATE TABLE IF NOT EXISTS s_competitor_products (
    competitor_product_id VARCHAR(100) PRIMARY KEY,
    linked_product_id VARCHAR(100) REFERENCES s_products(id) ON DELETE SET NULL,
    store_id VARCHAR(100) REFERENCES s_stores(id) ON DELETE CASCADE,
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
    monitoring_status VARCHAR(50) DEFAULT 'normal', -- normal, warning, critical, archived
    fetch_source VARCHAR(50) DEFAULT 'manual_entry', -- real_scrape, ai_estimate, manual_entry
    initial_comparison TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. COMPETITOR PRICE HISTORY LOGS (سجل الهبوط والصعود التاريخي للمنافسين)
CREATE TABLE IF NOT EXISTS s_competitor_price_history (
    history_id VARCHAR(100) PRIMARY KEY,
    competitor_product_id VARCHAR(100) REFERENCES s_competitor_products(competitor_product_id) ON DELETE CASCADE,
    price NUMERIC(15, 2) NOT NULL,
    old_price NUMERIC(15, 2),
    availability VARCHAR(100) DEFAULT 'متوفر',
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    change_type VARCHAR(100), -- انخفاض سعر, ارتفاع سعر, نفاد, عودة التوفر, تعديل محتوى
    source VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. PRODUCT TIMELINE EVENTS (الخط الممتد لنشاطات القطعة في سهم)
CREATE TABLE IF NOT EXISTS s_product_timeline_events (
    event_id VARCHAR(100) PRIMARY KEY,
    product_id VARCHAR(100) REFERENCES s_products(id) ON DELETE CASCADE,
    store_id VARCHAR(100) REFERENCES s_stores(id) ON DELETE CASCADE,
    event_type VARCHAR(100) DEFAULT 'standard', -- campaign, competitor_link, price_update, stock_receipt, details_edit
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_by VARCHAR(150) DEFAULT 'النظام التلقائي',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 7. NOTIFICATIONS CENTRALS (مركز الإشعارات الموحد لغرفة القيادة)
CREATE TABLE IF NOT EXISTS s_notifications (
    id VARCHAR(100) PRIMARY KEY,
    store_id VARCHAR(100) REFERENCES s_stores(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    time VARCHAR(100) DEFAULT 'الآن',
    type VARCHAR(50) DEFAULT 'info', -- sync, alert, sale, security, success, warning, critical, info, ai
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. AUDIT LOGS (سجل العمليات والامتثال والرقابة والأنشطة الإدارية)
CREATE TABLE IF NOT EXISTS s_audit_logs (
    id VARCHAR(100) PRIMARY KEY,
    store_id VARCHAR(100) REFERENCES s_stores(id) ON DELETE CASCADE,
    event VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    "user" VARCHAR(150) DEFAULT 'المدير العام',
    time VARCHAR(50) DEFAULT 'الآن',
    date VARCHAR(50) DEFAULT 'اليوم',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. CUSTOMERS TABLE (العلاقات الشاملة وإحصاءات العملاء)
CREATE TABLE IF NOT EXISTS s_customers (
    id VARCHAR(100) PRIMARY KEY,
    store_id VARCHAR(100) REFERENCES s_stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(100),
    email VARCHAR(255),
    balance NUMERIC(15, 2) DEFAULT 0.00,
    tags TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. SUPPLIERS TABLE (الموردين الخارجيين وعلاقات سلاسل الإمداد)
CREATE TABLE IF NOT EXISTS s_suppliers (
    id VARCHAR(100) PRIMARY KEY,
    store_id VARCHAR(100) REFERENCES s_stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    phone VARCHAR(100),
    email VARCHAR(255),
    balance NUMERIC(15, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. EMPLOYEES & USERS ROLE MANAGEMENT (فريق النفاذ والتشغيل في الفروع)
CREATE TABLE IF NOT EXISTS s_employees (
    id VARCHAR(100) PRIMARY KEY,
    store_id VARCHAR(100) REFERENCES s_stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    role VARCHAR(100) NOT NULL DEFAULT 'cashier', -- ceo, store_manager, accountant, cashier, inventory_keeper
    phone VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. BRANCHES TABLE (الفروع الميدانية ومراكز البيع ونقاط توزيع سهم)
CREATE TABLE IF NOT EXISTS s_branches (
    id VARCHAR(100) PRIMARY KEY,
    store_id VARCHAR(100) REFERENCES s_stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. WAREHOUSES TABLE (المستودعات وسعات تخزين الإمدادات الإقليمية)
CREATE TABLE IF NOT EXISTS s_warehouses (
    id VARCHAR(100) PRIMARY KEY,
    store_id VARCHAR(100) REFERENCES s_stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) DEFAULT 'رئيسي', -- رئيسي, فرعي, جاف, مبرد
    capacity INTEGER DEFAULT 10000,
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- INDEXES & PERFORMANCE OPTIMIZATION FOR MULTI-STORE TENANCY
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_products_store_id ON s_products(store_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_product_id ON s_campaigns(product_id);
CREATE INDEX IF NOT EXISTS idx_competitor_products_linked ON s_competitor_products(linked_product_id);
CREATE INDEX IF NOT EXISTS idx_competitor_history_pid ON s_competitor_price_history(competitor_product_id);
CREATE INDEX IF NOT EXISTS idx_timeline_events_product ON s_product_timeline_events(product_id);
CREATE INDEX IF NOT EXISTS idx_notifications_store_id ON s_notifications(store_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_store_id ON s_audit_logs(store_id);
