import { getMigratorDb, closePools } from "../src/modules/database";

async function migrate() {
  console.log("Running database migrations...");
  const { pool } = getMigratorDb();

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Extensions
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    await client.query("CREATE EXTENSION IF NOT EXISTS pg_trgm;");
    await client.query("CREATE EXTENSION IF NOT EXISTS unaccent;");

    // Enums
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
          CREATE TYPE user_role AS ENUM ('owner', 'manager', 'staff', 'support', 'customer');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
          CREATE TYPE user_status AS ENUM ('active', 'suspended', 'deactivated');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'session_kind') THEN
          CREATE TYPE session_kind AS ENUM ('customer', 'staff');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mfa_type') THEN
          CREATE TYPE mfa_type AS ENUM ('totp');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'token_purpose') THEN
          CREATE TYPE token_purpose AS ENUM ('password_reset', 'email_verification', 'staff_bootstrap');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_class') THEN
          CREATE TYPE product_class AS ENUM ('seed', 'fertiliser', 'nutrient', 'pesticide', 'tool');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_status') THEN
          CREATE TYPE product_status AS ENUM ('draft', 'in_review', 'published', 'archived');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'batch_status') THEN
          CREATE TYPE batch_status AS ENUM ('available', 'quarantined', 'expired', 'recalled', 'written_off');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ledger_movement_type') THEN
          CREATE TYPE ledger_movement_type AS ENUM (
            'receipt',
            'reservation',
            'release',
            'shipment',
            'return_quarantine',
            'quarantine_release',
            'adjustment',
            'write_off'
          );
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_kind') THEN
          CREATE TYPE document_kind AS ENUM ('label_pdf', 'safety_data_sheet', 'technical_bulletin');
        END IF;
      END
      $$;
    `);

    // Core Identity & Auth Tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role user_role NOT NULL DEFAULT 'customer',
        status user_status NOT NULL DEFAULT 'active',
        locale TEXT NOT NULL DEFAULT 'en',
        mfa_enrolled_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id_hash TEXT PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        kind session_kind NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        absolute_expires_at TIMESTAMPTZ NOT NULL,
        revoked_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS mfa_credentials (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type mfa_type NOT NULL,
        secret_enc TEXT NOT NULL,
        recovery_codes_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS auth_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        token_hash TEXT NOT NULL UNIQUE,
        purpose token_purpose NOT NULL,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TIMESTAMPTZ NOT NULL,
        used_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS login_attempts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        key_hash TEXT NOT NULL,
        outcome TEXT NOT NULL,
        at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS audit_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        actor_id UUID,
        action TEXT NOT NULL,
        entity TEXT NOT NULL,
        entity_id TEXT,
        before JSONB,
        after JSONB,
        ip_hash TEXT NOT NULL,
        user_agent TEXT,
        at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS config_settings (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL,
        updated_by UUID REFERENCES users(id),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS job_runs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        job_name TEXT NOT NULL,
        started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        ended_at TIMESTAMPTZ,
        outcome TEXT NOT NULL,
        summary JSONB
      );
    `);

    // Phase 2 Tables: Catalog, Hierarchy & Products
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        description TEXT,
        position INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS brands (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        country TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS manufacturers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        country TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS crops (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS targets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        kind TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS active_ingredients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        category_id UUID NOT NULL REFERENCES categories(id),
        brand_id UUID NOT NULL REFERENCES brands(id),
        manufacturer_id UUID REFERENCES manufacturers(id),
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        class product_class NOT NULL,
        status product_status NOT NULL DEFAULT 'draft',
        description TEXT NOT NULL,
        country_of_origin TEXT NOT NULL,
        authored_by UUID NOT NULL REFERENCES users(id),
        published_by UUID REFERENCES users(id),
        published_at TIMESTAMPTZ,
        current_safety_version_id UUID,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS variants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        sku TEXT NOT NULL UNIQUE,
        pack_size TEXT NOT NULL,
        pack_size_value INT NOT NULL,
        pack_size_unit TEXT NOT NULL,
        price_minor INT NOT NULL,
        currency TEXT NOT NULL DEFAULT 'PKR',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS price_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        variant_id UUID NOT NULL REFERENCES variants(id) ON DELETE CASCADE,
        price_minor INT NOT NULL,
        currency TEXT NOT NULL DEFAULT 'PKR',
        changed_by UUID NOT NULL REFERENCES users(id),
        valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        valid_to TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS safety_versions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        version_number INT NOT NULL,
        label_text TEXT NOT NULL,
        application_rate TEXT NOT NULL,
        application_method TEXT NOT NULL,
        pre_harvest_interval_days INT NOT NULL,
        reentry_interval_hours INT NOT NULL,
        hazard_class TEXT NOT NULL,
        signal_word TEXT NOT NULL,
        registration_number TEXT NOT NULL,
        first_aid TEXT NOT NULL,
        storage_and_handling TEXT NOT NULL,
        is_restricted_use BOOLEAN NOT NULL DEFAULT FALSE,
        authored_by UUID NOT NULL REFERENCES users(id),
        approved_by UUID REFERENCES users(id),
        approved_at TIMESTAMPTZ,
        is_approved BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_product_safety_version UNIQUE(product_id, version_number)
      );

      CREATE TABLE IF NOT EXISTS product_documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        safety_version_id UUID REFERENCES safety_versions(id) ON DELETE CASCADE,
        kind document_kind NOT NULL,
        title TEXT NOT NULL,
        storage_key TEXT NOT NULL,
        file_size_bytes INT NOT NULL,
        sha256 TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS product_images (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        storage_key TEXT NOT NULL,
        source TEXT NOT NULL,
        permission_note TEXT NOT NULL,
        alt_text TEXT NOT NULL,
        width INT NOT NULL,
        height INT NOT NULL,
        is_primary BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS seed_details (
        product_id UUID PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
        variety TEXT NOT NULL,
        germination_rate_percent INT NOT NULL,
        purity_percent INT NOT NULL,
        is_treated BOOLEAN NOT NULL DEFAULT FALSE,
        treatment_warning TEXT,
        recommended_season TEXT NOT NULL,
        recommended_region TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS fertiliser_details (
        product_id UUID PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
        nutrient_analysis TEXT NOT NULL,
        net_weight_kg INT NOT NULL,
        registration_number TEXT NOT NULL,
        storage_handling TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS product_crops (
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        crop_id UUID NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
        PRIMARY KEY (product_id, crop_id)
      );

      CREATE TABLE IF NOT EXISTS product_targets (
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        target_id UUID NOT NULL REFERENCES targets(id) ON DELETE CASCADE,
        PRIMARY KEY (product_id, target_id)
      );

      CREATE TABLE IF NOT EXISTS product_ingredients (
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        ingredient_id UUID NOT NULL REFERENCES active_ingredients(id) ON DELETE CASCADE,
        concentration TEXT NOT NULL,
        PRIMARY KEY (product_id, ingredient_id)
      );

      CREATE TABLE IF NOT EXISTS suppliers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        contact_info TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS batches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        variant_id UUID NOT NULL REFERENCES variants(id),
        lot_number TEXT NOT NULL,
        supplier_id UUID REFERENCES suppliers(id),
        manufactured_on TIMESTAMPTZ NOT NULL,
        expires_on TIMESTAMPTZ NOT NULL,
        received_quantity INT NOT NULL,
        on_hand INT NOT NULL DEFAULT 0,
        reserved INT NOT NULL DEFAULT 0,
        quarantined INT NOT NULL DEFAULT 0,
        status batch_status NOT NULL DEFAULT 'available',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_batch_lot_variant UNIQUE(variant_id, lot_number),
        CONSTRAINT chk_on_hand_non_negative CHECK (on_hand >= 0),
        CONSTRAINT chk_reserved_non_negative CHECK (reserved >= 0),
        CONSTRAINT chk_quarantined_non_negative CHECK (quarantined >= 0),
        CONSTRAINT chk_allocation_limit CHECK (reserved + quarantined <= on_hand)
      );

      CREATE TABLE IF NOT EXISTS stock_ledger (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        batch_id UUID NOT NULL REFERENCES batches(id),
        movement_type ledger_movement_type NOT NULL,
        quantity INT NOT NULL,
        actor_id UUID NOT NULL REFERENCES users(id),
        reason TEXT NOT NULL,
        reference_id TEXT,
        at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS recalls (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        initiated_by UUID NOT NULL REFERENCES users(id),
        reason TEXT NOT NULL,
        severity TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS recall_batches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        recall_id UUID NOT NULL REFERENCES recalls(id) ON DELETE CASCADE,
        batch_id UUID NOT NULL REFERENCES batches(id),
        quarantined_quantity INT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_recall_batch UNIQUE(recall_id, batch_id)
      );

      CREATE TABLE IF NOT EXISTS search_queries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        normalized_query TEXT NOT NULL,
        results_count INT NOT NULL,
        at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Append-only immutability triggers
    await client.query(`
      CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
      RETURNS TRIGGER AS $$
      BEGIN
        RAISE EXCEPTION 'audit_log is append-only and cannot be modified or deleted.';
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_audit_log_immutable ON audit_log;
      CREATE TRIGGER trg_audit_log_immutable
      BEFORE UPDATE OR DELETE ON audit_log
      FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();

      CREATE OR REPLACE FUNCTION prevent_stock_ledger_modification()
      RETURNS TRIGGER AS $$
      BEGIN
        RAISE EXCEPTION 'stock_ledger is append-only and cannot be modified or deleted.';
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_stock_ledger_immutable ON stock_ledger;
      CREATE TRIGGER trg_stock_ledger_immutable
      BEFORE UPDATE OR DELETE ON stock_ledger
      FOR EACH ROW EXECUTE FUNCTION prevent_stock_ledger_modification();
    `);

    // Commerce Tables (Carts, Tax, Shipping, Coupons, Orders, Lines, Allocations, Events, Payments, WebhookEvents, Refunds)
    await client.query(`
      CREATE TABLE IF NOT EXISTS carts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        guest_token_hash TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS cart_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
        variant_id UUID NOT NULL REFERENCES variants(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_cart_items_cart_variant UNIQUE (cart_id, variant_id),
        CONSTRAINT chk_cart_item_quantity_positive CHECK (quantity > 0)
      );

      CREATE TABLE IF NOT EXISTS tax_rates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        rate_bp INTEGER NOT NULL,
        inclusive BOOLEAN NOT NULL DEFAULT FALSE,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS shipping_zones (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        region_code TEXT NOT NULL UNIQUE,
        base_fee_minor BIGINT NOT NULL,
        free_threshold_minor BIGINT,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS coupons (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code TEXT NOT NULL UNIQUE,
        discount_type TEXT NOT NULL,
        discount_value BIGINT NOT NULL,
        min_subtotal_minor BIGINT NOT NULL DEFAULT 0,
        usage_limit INTEGER,
        times_used INTEGER NOT NULL DEFAULT 0,
        valid_from TIMESTAMPTZ NOT NULL,
        valid_until TIMESTAMPTZ NOT NULL,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_coupon_discount_value_positive CHECK (discount_value > 0),
        CONSTRAINT chk_coupon_times_used_non_negative CHECK (times_used >= 0)
      );

      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        public_ref TEXT NOT NULL UNIQUE,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        customer_email TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        shipping_address JSONB NOT NULL,
        billing_address JSONB NOT NULL,
        state TEXT NOT NULL,
        payment_method TEXT NOT NULL,
        currency TEXT NOT NULL DEFAULT 'PKR',
        subtotal_minor BIGINT NOT NULL,
        discount_minor BIGINT NOT NULL DEFAULT 0,
        tax_minor BIGINT NOT NULL DEFAULT 0,
        shipping_minor BIGINT NOT NULL DEFAULT 0,
        total_minor BIGINT NOT NULL,
        pricing_snapshot JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_order_total_non_negative CHECK (total_minor >= 0)
      );

      CREATE TABLE IF NOT EXISTS order_lines (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        variant_id UUID NOT NULL REFERENCES variants(id) ON DELETE RESTRICT,
        product_name_snapshot TEXT NOT NULL,
        variant_sku_snapshot TEXT NOT NULL,
        unit_price_minor BIGINT NOT NULL,
        quantity INTEGER NOT NULL,
        tax_minor BIGINT NOT NULL DEFAULT 0,
        total_minor BIGINT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS order_line_allocations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_line_id UUID NOT NULL REFERENCES order_lines(id) ON DELETE CASCADE,
        batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE RESTRICT,
        quantity INTEGER NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS order_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        from_state TEXT,
        to_state TEXT NOT NULL,
        actor_id UUID,
        actor_type TEXT NOT NULL,
        reason TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        provider TEXT NOT NULL,
        provider_reference TEXT,
        amount_minor BIGINT NOT NULL,
        currency TEXT NOT NULL DEFAULT 'PKR',
        status TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS webhook_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        provider TEXT NOT NULL,
        event_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        payload_hash TEXT NOT NULL,
        processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        outcome TEXT NOT NULL,
        CONSTRAINT uq_webhook_events_provider_event UNIQUE (provider, event_id)
      );

      CREATE TABLE IF NOT EXISTS refunds (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        amount_minor BIGINT NOT NULL,
        reason TEXT NOT NULL,
        provider_refund_id TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_refund_amount_positive CHECK (amount_minor > 0)
      );

      CREATE OR REPLACE FUNCTION prevent_order_events_modification()
      RETURNS TRIGGER AS $$
      BEGIN
        RAISE EXCEPTION 'order_events is append-only and cannot be modified or deleted.';
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_order_events_immutable ON order_events;
      CREATE TRIGGER trg_order_events_immutable
      BEFORE UPDATE OR DELETE ON order_events
      FOR EACH ROW EXECUTE FUNCTION prevent_order_events_modification();
    `);

    // Indexes (FTS & Trigram fuzzy matching & Commerce Lookups)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin (name gin_trgm_ops);
      CREATE INDEX IF NOT EXISTS idx_brands_name_trgm ON brands USING gin (name gin_trgm_ops);
      CREATE INDEX IF NOT EXISTS idx_active_ingredients_name_trgm ON active_ingredients USING gin (name gin_trgm_ops);
      CREATE INDEX IF NOT EXISTS idx_products_category_status ON products(category_id, status);
      CREATE INDEX IF NOT EXISTS idx_batches_fefo ON batches(variant_id, expires_on) WHERE status = 'available';
      CREATE INDEX IF NOT EXISTS idx_search_queries_count ON search_queries(results_count);
      CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
      CREATE INDEX IF NOT EXISTS idx_orders_state ON orders(state);
      CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
      CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
      CREATE INDEX IF NOT EXISTS idx_payments_provider_ref ON payments(provider_reference);
    `);

    // Phase 5: Notifications & Queue tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS notification_preferences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        channel TEXT NOT NULL,
        enabled BOOLEAN NOT NULL DEFAULT true,
        quiet_hours_start TEXT,
        quiet_hours_end TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS suppressions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        channel TEXT NOT NULL,
        destination TEXT NOT NULL,
        reason TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS message_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        channel TEXT NOT NULL,
        recipient TEXT NOT NULL,
        template_id TEXT NOT NULL,
        status TEXT NOT NULL,
        subject TEXT,
        body TEXT NOT NULL,
        metadata JSONB,
        error TEXT,
        sent_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS queue_jobs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        queue TEXT NOT NULL DEFAULT 'default',
        payload JSONB NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        max_attempts INTEGER NOT NULL DEFAULT 5,
        available_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        reserved_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        last_error TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS idx_notif_prefs_user ON notification_preferences(user_id);
      CREATE INDEX IF NOT EXISTS idx_suppressions_dest ON suppressions(destination);
      CREATE INDEX IF NOT EXISTS idx_message_log_status ON message_log(status);
      CREATE INDEX IF NOT EXISTS idx_message_log_created_at ON message_log(created_at);
      CREATE INDEX IF NOT EXISTS idx_queue_jobs_poll ON queue_jobs(queue, available_at) WHERE completed_at IS NULL;

      -- Phase 6: Fulfilment, Returns (RMA), Operations, and Reporting
      CREATE TABLE IF NOT EXISTS shipments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES orders(id),
        shipment_number TEXT NOT NULL UNIQUE,
        parcel_type TEXT NOT NULL DEFAULT 'general',
        carrier_name TEXT NOT NULL DEFAULT 'ManualDispatch',
        tracking_number TEXT,
        tracking_url TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        shipped_at TIMESTAMPTZ,
        delivered_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS shipment_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
        order_line_id UUID NOT NULL REFERENCES order_lines(id),
        quantity INTEGER NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS shipment_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
        status TEXT NOT NULL,
        location TEXT,
        details TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS cod_collections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES orders(id),
        amount_due_minor BIGINT NOT NULL,
        amount_collected_minor BIGINT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        collected_at TIMESTAMPTZ,
        remitted_at TIMESTAMPTZ,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS return_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES orders(id),
        rma_number TEXT NOT NULL UNIQUE,
        customer_id UUID REFERENCES users(id),
        reason TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'requested',
        resolution TEXT,
        staff_notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS return_lines (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        return_request_id UUID NOT NULL REFERENCES return_requests(id) ON DELETE CASCADE,
        order_line_id UUID NOT NULL REFERENCES order_lines(id),
        quantity INTEGER NOT NULL,
        condition TEXT NOT NULL,
        restockable BOOLEAN NOT NULL DEFAULT false,
        inspection_notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS store_credit_ledger (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        amount_minor BIGINT NOT NULL,
        balance_after_minor BIGINT NOT NULL,
        reason TEXT NOT NULL,
        reference_id TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS report_exports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        staff_id UUID NOT NULL REFERENCES users(id),
        report_type TEXT NOT NULL,
        parameters JSONB DEFAULT '{}'::jsonb,
        record_count TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS idx_shipments_order ON shipments(order_id);
      CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
      CREATE INDEX IF NOT EXISTS idx_return_requests_order ON return_requests(order_id);
      CREATE INDEX IF NOT EXISTS idx_return_requests_customer ON return_requests(customer_id);
      CREATE INDEX IF NOT EXISTS idx_store_credit_user ON store_credit_ledger(user_id);

      -- Append-only trigger for store_credit_ledger
      CREATE OR REPLACE FUNCTION prevent_modify_store_credit_ledger()
      RETURNS TRIGGER AS $$
      BEGIN
        RAISE EXCEPTION 'store_credit_ledger is immutable and append-only. Modification is disallowed.';
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_store_credit_ledger_immutable ON store_credit_ledger;
      CREATE TRIGGER trg_store_credit_ledger_immutable
      BEFORE UPDATE OR DELETE ON store_credit_ledger
      FOR EACH ROW EXECUTE FUNCTION prevent_modify_store_credit_ledger();

      -- Phase 7: Chatbot and Assisted Discovery
      CREATE TABLE IF NOT EXISTS chat_conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_token_hash TEXT NOT NULL,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        tool_calls JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS chat_spend_daily (
        date DATE PRIMARY KEY,
        token_count INTEGER NOT NULL DEFAULT 0,
        estimated_cost_cents INTEGER NOT NULL DEFAULT 0,
        hard_limit_cents INTEGER NOT NULL DEFAULT 500,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS support_tickets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ticket_number TEXT NOT NULL UNIQUE,
        conversation_id UUID REFERENCES chat_conversations(id) ON DELETE SET NULL,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        customer_email TEXT,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'open',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS idx_chat_conv_session ON chat_conversations(session_token_hash);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_conv ON chat_messages(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_support_tickets_num ON support_tickets(ticket_number);
    `);

    // Enforce least privilege runtime permissions if app_runtime role exists (e.g. on dedicated servers)
    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_runtime') THEN
          GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_runtime;
          REVOKE UPDATE, DELETE ON audit_log FROM app_runtime;
          REVOKE UPDATE, DELETE ON stock_ledger FROM app_runtime;
          REVOKE UPDATE, DELETE ON order_events FROM app_runtime;
          REVOKE UPDATE, DELETE ON store_credit_ledger FROM app_runtime;
          GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_runtime;
        END IF;
      END
      $$;
    `);

    // Seed realistic Pakistani agricultural catalog (idempotent ON CONFLICT)
    try {
      console.log("Seeding / updating verified Pakistani agricultural catalog...");
      const fs = await import("node:fs");
      const path = await import("node:path");
      const candidatePaths = [
        path.join(process.cwd(), "scripts", "seed-catalog.sql"),
        path.join(__dirname, "seed-catalog.sql"),
      ];
      let seedSql = "";
      for (const p of candidatePaths) {
        if (fs.existsSync(p)) {
          seedSql = fs.readFileSync(p, "utf8");
          break;
        }
      }
      if (seedSql) {
        await client.query(
          "UPDATE products SET status = 'archived' WHERE slug IN ('crop-booster-npk-20-20-20', 'nutrivex-zinc-33-chelated');",
        );
        await client.query(seedSql);
        console.log("Sample catalog successfully updated.");
      }
    } catch (seedErr) {
      console.warn("Catalog seed warning:", seedErr);
    }

    await client.query("COMMIT");
    console.log("Database migrations completed successfully.");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.warn("Migration warning during build step:", error);
  } finally {
    client.release();
    await closePools();
  }
}

migrate();
