-- Furrowmark Agricultural Business - Catalog & Inventory Seed Data
-- 12 Authentic Pakistani Agricultural Products with Active Batches and Verified Stock

DO $$
DECLARE
  v_user_id UUID;
  v_cat_seeds UUID;
  v_cat_fert UUID;
  v_cat_pest UUID;
  v_cat_nutr UUID;
  v_cat_tool UUID;
  
  v_br_engro UUID;
  v_br_fauji UUID;
  v_br_syngenta UUID;
  v_br_bayer UUID;
  v_br_fmc UUID;
  v_br_ici UUID;
  v_br_pioneer UUID;
  v_br_agripro UUID;
  
  v_prod_id UUID;
  v_var_id UUID;
BEGIN
  -- 1. Ensure system staff user exists
  INSERT INTO users (id, email, password_hash, role, status)
  VALUES (
    '00000000-0000-0000-0000-000000000001',
    'store@furrowmark.pk',
    '$argon2id$v=19$m=65536,t=3,p=4$system',
    'owner',
    'active'
  )
  ON CONFLICT (email) DO NOTHING;

  SELECT id INTO v_user_id FROM users ORDER BY created_at ASC LIMIT 1;

  -- 2. Insert Categories
  INSERT INTO categories (name, slug, description, position)
  VALUES ('Seeds', 'seeds', 'Certified hybrid and open-pollinated agricultural seeds', 1)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_cat_seeds;

  INSERT INTO categories (name, slug, description, position)
  VALUES ('Fertilizers', 'fertilizers', 'Primary macronutrient and basal chemical fertilizers', 2)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_cat_fert;

  INSERT INTO categories (name, slug, description, position)
  VALUES ('Plant Protection', 'plant-protection', 'Regulated insecticides, fungicides, and crop chemicals', 3)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_cat_pest;

  INSERT INTO categories (name, slug, description, position)
  VALUES ('Nutrients & Foliar', 'nutrients-foliar', 'Chelated micronutrients and water-soluble foliar feeds', 4)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_cat_nutr;

  INSERT INTO categories (name, slug, description, position)
  VALUES ('Agricultural Tools', 'agricultural-tools', 'Sprayers, protective equipment, and field machinery', 5)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_cat_tool;

  -- 3. Insert Brands
  INSERT INTO brands (name, country) VALUES ('Engro Agritech', 'Pakistan')
  ON CONFLICT (name) DO UPDATE SET country = EXCLUDED.country RETURNING id INTO v_br_engro;

  INSERT INTO brands (name, country) VALUES ('Fauji Fertilizer Company', 'Pakistan')
  ON CONFLICT (name) DO UPDATE SET country = EXCLUDED.country RETURNING id INTO v_br_fauji;

  INSERT INTO brands (name, country) VALUES ('Syngenta Pakistan', 'Pakistan')
  ON CONFLICT (name) DO UPDATE SET country = EXCLUDED.country RETURNING id INTO v_br_syngenta;

  INSERT INTO brands (name, country) VALUES ('Bayer Crop Science', 'Pakistan')
  ON CONFLICT (name) DO UPDATE SET country = EXCLUDED.country RETURNING id INTO v_br_bayer;

  INSERT INTO brands (name, country) VALUES ('FMC Pakistan', 'Pakistan')
  ON CONFLICT (name) DO UPDATE SET country = EXCLUDED.country RETURNING id INTO v_br_fmc;

  INSERT INTO brands (name, country) VALUES ('ICI Pakistan', 'Pakistan')
  ON CONFLICT (name) DO UPDATE SET country = EXCLUDED.country RETURNING id INTO v_br_ici;

  INSERT INTO brands (name, country) VALUES ('Pioneer Seeds Pakistan', 'Pakistan')
  ON CONFLICT (name) DO UPDATE SET country = EXCLUDED.country RETURNING id INTO v_br_pioneer;

  INSERT INTO brands (name, country) VALUES ('AgriPro Machinery', 'Pakistan')
  ON CONFLICT (name) DO UPDATE SET country = EXCLUDED.country RETURNING id INTO v_br_agripro;

  -- 4. Products, Variants & Inventory Batches

  -- Product 1: Hybrid Cotton Seed BS-15
  INSERT INTO products (category_id, brand_id, name, slug, class, status, description, country_of_origin, authored_by, published_by, published_at)
  VALUES (v_cat_seeds, v_br_engro, 'Hybrid Cotton Seed BS-15', 'hybrid-cotton-seed-bs-15', 'seed', 'published',
    'High germination heat-resistant hybrid cotton seed certified by Federal Seed Certification Department for Punjab and Sindh. High boll retention with early maturity.',
    'Pakistan', v_user_id, v_user_id, now())
  ON CONFLICT (slug) DO UPDATE SET status = 'published' RETURNING id INTO v_prod_id;

  INSERT INTO variants (product_id, sku, pack_size, pack_size_value, pack_size_unit, price_minor, currency, is_active)
  VALUES (v_prod_id, 'SEED-COT-BS15', '10 kg Bag', 10, 'kg', 450000, 'PKR', true)
  ON CONFLICT (sku) DO UPDATE SET price_minor = EXCLUDED.price_minor RETURNING id INTO v_var_id;

  INSERT INTO batches (variant_id, lot_number, manufactured_on, expires_on, received_quantity, on_hand, reserved, quarantined, status)
  VALUES (v_var_id, 'LOT-COT-2026-A1', now(), now() + interval '2 years', 150, 150, 0, 0, 'available')
  ON CONFLICT (variant_id, lot_number) DO UPDATE SET on_hand = 150, status = 'available';

  -- Product 2: Pioneer 30Y87 Hybrid Corn
  INSERT INTO products (category_id, brand_id, name, slug, class, status, description, country_of_origin, authored_by, published_by, published_at)
  VALUES (v_cat_seeds, v_br_pioneer, 'Pioneer 30Y87 Hybrid White Corn', 'pioneer-30y87-hybrid-corn', 'seed', 'published',
    'Top-tier dual purpose spring maize seed offering drought tolerance, strong stalk strength, and uniform cob placement.',
    'Pakistan', v_user_id, v_user_id, now())
  ON CONFLICT (slug) DO UPDATE SET status = 'published' RETURNING id INTO v_prod_id;

  INSERT INTO variants (product_id, sku, pack_size, pack_size_value, pack_size_unit, price_minor, currency, is_active)
  VALUES (v_prod_id, 'SEED-CRN-30Y87', '15 kg Bag', 15, 'kg', 1250000, 'PKR', true)
  ON CONFLICT (sku) DO UPDATE SET price_minor = EXCLUDED.price_minor RETURNING id INTO v_var_id;

  INSERT INTO batches (variant_id, lot_number, manufactured_on, expires_on, received_quantity, on_hand, reserved, quarantined, status)
  VALUES (v_var_id, 'LOT-CRN-2026-B1', now(), now() + interval '2 years', 120, 120, 0, 0, 'available')
  ON CONFLICT (variant_id, lot_number) DO UPDATE SET on_hand = 120, status = 'available';

  -- Product 3: Faisalabad-2008 Certified Wheat Seed
  INSERT INTO products (category_id, brand_id, name, slug, class, status, description, country_of_origin, authored_by, published_by, published_at)
  VALUES (v_cat_seeds, v_br_engro, 'Faisalabad-2008 Certified Wheat Seed', 'faisalabad-2008-wheat-seed', 'seed', 'published',
    'Rust-resistant wheat seed variety engineered for medium to high fertility irrigated lands. High grain yield and superior chapati baking quality.',
    'Pakistan', v_user_id, v_user_id, now())
  ON CONFLICT (slug) DO UPDATE SET status = 'published' RETURNING id INTO v_prod_id;

  INSERT INTO variants (product_id, sku, pack_size, pack_size_value, pack_size_unit, price_minor, currency, is_active)
  VALUES (v_prod_id, 'SEED-WHT-FSD08', '50 kg Bag', 50, 'kg', 580000, 'PKR', true)
  ON CONFLICT (sku) DO UPDATE SET price_minor = EXCLUDED.price_minor RETURNING id INTO v_var_id;

  INSERT INTO batches (variant_id, lot_number, manufactured_on, expires_on, received_quantity, on_hand, reserved, quarantined, status)
  VALUES (v_var_id, 'LOT-WHT-2026-C1', now(), now() + interval '2 years', 200, 200, 0, 0, 'available')
  ON CONFLICT (variant_id, lot_number) DO UPDATE SET on_hand = 200, status = 'available';

  -- Product 4: Sona Urea Prilled 46% Nitrogen
  INSERT INTO products (category_id, brand_id, name, slug, class, status, description, country_of_origin, authored_by, published_by, published_at)
  VALUES (v_cat_fert, v_br_fauji, 'Sona Urea Prilled 46% Nitrogen', 'sona-urea-46-nitrogen', 'fertiliser', 'published',
    'Standard prilled 46 percent nitrogen fertilizer promoting vegetative foliage growth across all major Kharif and Rabi crops.',
    'Pakistan', v_user_id, v_user_id, now())
  ON CONFLICT (slug) DO UPDATE SET status = 'published' RETURNING id INTO v_prod_id;

  INSERT INTO variants (product_id, sku, pack_size, pack_size_value, pack_size_unit, price_minor, currency, is_active)
  VALUES (v_prod_id, 'FERT-UREA-SONA', '50 kg Bag', 50, 'kg', 465000, 'PKR', true)
  ON CONFLICT (sku) DO UPDATE SET price_minor = EXCLUDED.price_minor RETURNING id INTO v_var_id;

  INSERT INTO batches (variant_id, lot_number, manufactured_on, expires_on, received_quantity, on_hand, reserved, quarantined, status)
  VALUES (v_var_id, 'LOT-UREA-2026-D1', now(), now() + interval '2 years', 300, 300, 0, 0, 'available')
  ON CONFLICT (variant_id, lot_number) DO UPDATE SET on_hand = 300, status = 'available';

  -- Product 5: Engro DAP Di-Ammonium Phosphate 18-46-0
  INSERT INTO products (category_id, brand_id, name, slug, class, status, description, country_of_origin, authored_by, published_by, published_at)
  VALUES (v_cat_fert, v_br_engro, 'Engro DAP Di-Ammonium Phosphate 18-46-0', 'engro-dap-18-46-0', 'fertiliser', 'published',
    'High-analysis basal fertilizer delivering 18 percent ammoniacal nitrogen and 46 percent water-soluble phosphate for vigorous root establishment.',
    'Pakistan', v_user_id, v_user_id, now())
  ON CONFLICT (slug) DO UPDATE SET status = 'published' RETURNING id INTO v_prod_id;

  INSERT INTO variants (product_id, sku, pack_size, pack_size_value, pack_size_unit, price_minor, currency, is_active)
  VALUES (v_prod_id, 'FERT-DAP-ENGRO', '50 kg Bag', 50, 'kg', 1320000, 'PKR', true)
  ON CONFLICT (sku) DO UPDATE SET price_minor = EXCLUDED.price_minor RETURNING id INTO v_var_id;

  INSERT INTO batches (variant_id, lot_number, manufactured_on, expires_on, received_quantity, on_hand, reserved, quarantined, status)
  VALUES (v_var_id, 'LOT-DAP-2026-E1', now(), now() + interval '2 years', 250, 250, 0, 0, 'available')
  ON CONFLICT (variant_id, lot_number) DO UPDATE SET on_hand = 250, status = 'available';

  -- Product 6: SOP Soluble Potassium Sulphate 0-0-50
  INSERT INTO products (category_id, brand_id, name, slug, class, status, description, country_of_origin, authored_by, published_by, published_at)
  VALUES (v_cat_fert, v_br_fauji, 'SOP Soluble Potassium Sulphate 0-0-50', 'sop-potassium-sulphate-0-0-50', 'fertiliser', 'published',
    'Chloride-free potassium sulphate for tuber, fruit, and boll development. Highly water-soluble for fertigation and flood application.',
    'Pakistan', v_user_id, v_user_id, now())
  ON CONFLICT (slug) DO UPDATE SET status = 'published' RETURNING id INTO v_prod_id;

  INSERT INTO variants (product_id, sku, pack_size, pack_size_value, pack_size_unit, price_minor, currency, is_active)
  VALUES (v_prod_id, 'FERT-SOP-POTASH', '25 kg Bag', 25, 'kg', 1480000, 'PKR', true)
  ON CONFLICT (sku) DO UPDATE SET price_minor = EXCLUDED.price_minor RETURNING id INTO v_var_id;

  INSERT INTO batches (variant_id, lot_number, manufactured_on, expires_on, received_quantity, on_hand, reserved, quarantined, status)
  VALUES (v_var_id, 'LOT-SOP-2026-F1', now(), now() + interval '2 years', 100, 100, 0, 0, 'available')
  ON CONFLICT (variant_id, lot_number) DO UPDATE SET on_hand = 100, status = 'available';

  -- Product 7: Virtako 0.6% GR Insecticide
  INSERT INTO products (category_id, brand_id, name, slug, class, status, description, country_of_origin, authored_by, published_by, published_at)
  VALUES (v_cat_pest, v_br_syngenta, 'Virtako 0.6% GR Stem Borer Insecticide', 'virtako-06-gr-insecticide', 'pesticide', 'published',
    'Systemic granular insecticide for stem borer and leaf folder protection in rice, maize, and sugarcane. Long residual control.',
    'Pakistan', v_user_id, v_user_id, now())
  ON CONFLICT (slug) DO UPDATE SET status = 'published' RETURNING id INTO v_prod_id;

  INSERT INTO variants (product_id, sku, pack_size, pack_size_value, pack_size_unit, price_minor, currency, is_active)
  VALUES (v_prod_id, 'PEST-VIRTAKO-4KG', '4 kg Bag', 4, 'kg', 320000, 'PKR', true)
  ON CONFLICT (sku) DO UPDATE SET price_minor = EXCLUDED.price_minor RETURNING id INTO v_var_id;

  INSERT INTO batches (variant_id, lot_number, manufactured_on, expires_on, received_quantity, on_hand, reserved, quarantined, status)
  VALUES (v_var_id, 'LOT-VIR-2026-G1', now(), now() + interval '2 years', 150, 150, 0, 0, 'available')
  ON CONFLICT (variant_id, lot_number) DO UPDATE SET on_hand = 150, status = 'available';

  -- Product 8: Coragen 20 SC Caterpillars Specialist
  INSERT INTO products (category_id, brand_id, name, slug, class, status, description, country_of_origin, authored_by, published_by, published_at)
  VALUES (v_cat_pest, v_br_fmc, 'Coragen 20 SC Caterpillars Specialist', 'coragen-20-sc-fmc', 'pesticide', 'published',
    'Novel anthranilic diamide insecticide providing target-specific control of American bollworm, armyworm, and spodoptera caterpillars.',
    'Pakistan', v_user_id, v_user_id, now())
  ON CONFLICT (slug) DO UPDATE SET status = 'published' RETURNING id INTO v_prod_id;

  INSERT INTO variants (product_id, sku, pack_size, pack_size_value, pack_size_unit, price_minor, currency, is_active)
  VALUES (v_prod_id, 'PEST-CORAGEN-100ML', '100 mL Bottle', 100, 'ml', 285000, 'PKR', true)
  ON CONFLICT (sku) DO UPDATE SET price_minor = EXCLUDED.price_minor RETURNING id INTO v_var_id;

  INSERT INTO batches (variant_id, lot_number, manufactured_on, expires_on, received_quantity, on_hand, reserved, quarantined, status)
  VALUES (v_var_id, 'LOT-COR-2026-H1', now(), now() + interval '2 years', 180, 180, 0, 0, 'available')
  ON CONFLICT (variant_id, lot_number) DO UPDATE SET on_hand = 180, status = 'available';

  -- Product 9: Amistar Top 325 SC Fungicide
  INSERT INTO products (category_id, brand_id, name, slug, class, status, description, country_of_origin, authored_by, published_by, published_at)
  VALUES (v_cat_pest, v_br_syngenta, 'Amistar Top 325 SC Broad Spectrum Fungicide', 'amistar-top-325-sc', 'pesticide', 'published',
    'Broad-spectrum preventative and curative systemic fungicide for powdery mildew, leaf spots, and blights on vegetable and field crops.',
    'Pakistan', v_user_id, v_user_id, now())
  ON CONFLICT (slug) DO UPDATE SET status = 'published' RETURNING id INTO v_prod_id;

  INSERT INTO variants (product_id, sku, pack_size, pack_size_value, pack_size_unit, price_minor, currency, is_active)
  VALUES (v_prod_id, 'PEST-AMISTAR-200ML', '200 mL Bottle', 200, 'ml', 240000, 'PKR', true)
  ON CONFLICT (sku) DO UPDATE SET price_minor = EXCLUDED.price_minor RETURNING id INTO v_var_id;

  INSERT INTO batches (variant_id, lot_number, manufactured_on, expires_on, received_quantity, on_hand, reserved, quarantined, status)
  VALUES (v_var_id, 'LOT-AMI-2026-I1', now(), now() + interval '2 years', 120, 120, 0, 0, 'available')
  ON CONFLICT (variant_id, lot_number) DO UPDATE SET on_hand = 120, status = 'available';

  -- Product 10: Engro Zorawar Zinc 33%
  INSERT INTO products (category_id, brand_id, name, slug, class, status, description, country_of_origin, authored_by, published_by, published_at)
  VALUES (v_cat_nutr, v_br_engro, 'Engro Zorawar Zinc 33% Chelated Micronutrient', 'engro-zorawar-zinc-33', 'nutrient', 'published',
    'High-bioavailability agricultural zinc preventing khaira disease in paddy rice and leaf chlorosis in citrus and cotton.',
    'Pakistan', v_user_id, v_user_id, now())
  ON CONFLICT (slug) DO UPDATE SET status = 'published' RETURNING id INTO v_prod_id;

  INSERT INTO variants (product_id, sku, pack_size, pack_size_value, pack_size_unit, price_minor, currency, is_active)
  VALUES (v_prod_id, 'NUTR-ZINC-5KG', '5 kg Bag', 5, 'kg', 195000, 'PKR', true)
  ON CONFLICT (sku) DO UPDATE SET price_minor = EXCLUDED.price_minor RETURNING id INTO v_var_id;

  INSERT INTO batches (variant_id, lot_number, manufactured_on, expires_on, received_quantity, on_hand, reserved, quarantined, status)
  VALUES (v_var_id, 'LOT-ZNC-2026-J1', now(), now() + interval '2 years', 160, 160, 0, 0, 'available')
  ON CONFLICT (variant_id, lot_number) DO UPDATE SET on_hand = 160, status = 'available';

  -- Product 11: Bayer Nativo 75 WG Systemic Fungicide
  INSERT INTO products (category_id, brand_id, name, slug, class, status, description, country_of_origin, authored_by, published_by, published_at)
  VALUES (v_cat_pest, v_br_bayer, 'Bayer Nativo 75 WG Systemic Fungicide', 'bayer-nativo-75-wg', 'pesticide', 'published',
    'Broad spectrum systemic fungicide combining tebuconazole and trifloxystrobin for rice blast, wheat rust, and fruit powdery mildew.',
    'Pakistan', v_user_id, v_user_id, now())
  ON CONFLICT (slug) DO UPDATE SET status = 'published' RETURNING id INTO v_prod_id;

  INSERT INTO variants (product_id, sku, pack_size, pack_size_value, pack_size_unit, price_minor, currency, is_active)
  VALUES (v_prod_id, 'PEST-NATIVO-65G', '65 g Pack', 65, 'g', 240000, 'PKR', true)
  ON CONFLICT (sku) DO UPDATE SET price_minor = EXCLUDED.price_minor RETURNING id INTO v_var_id;

  INSERT INTO batches (variant_id, lot_number, manufactured_on, expires_on, received_quantity, on_hand, reserved, quarantined, status)
  VALUES (v_var_id, 'LOT-NAT-2026-K1', now(), now() + interval '2 years', 220, 220, 0, 0, 'available')
  ON CONFLICT (variant_id, lot_number) DO UPDATE SET on_hand = 220, status = 'available';

  -- Product 12: Battery Powered 16L Knapsack Sprayer
  INSERT INTO products (category_id, brand_id, name, slug, class, status, description, country_of_origin, authored_by, published_by, published_at)
  VALUES (v_cat_tool, v_br_agripro, 'Battery Powered 16L Backpack Knapsack Sprayer', 'battery-powered-16l-knapsack-sprayer', 'tool', 'published',
    'Heavy-duty rechargeable 12V 8Ah lithium battery knapsack sprayer with adjustable brass lance, pressure regulator, and dual spray nozzles.',
    'Pakistan', v_user_id, v_user_id, now())
  ON CONFLICT (slug) DO UPDATE SET status = 'published' RETURNING id INTO v_prod_id;

  INSERT INTO variants (product_id, sku, pack_size, pack_size_value, pack_size_unit, price_minor, currency, is_active)
  VALUES (v_prod_id, 'TOOL-SPRAY-16L', '1 Unit Box', 1, 'unit', 750000, 'PKR', true)
  ON CONFLICT (sku) DO UPDATE SET price_minor = EXCLUDED.price_minor RETURNING id INTO v_var_id;

  INSERT INTO batches (variant_id, lot_number, manufactured_on, expires_on, received_quantity, on_hand, reserved, quarantined, status)
  VALUES (v_var_id, 'LOT-SPR-2026-L1', now(), now() + interval '2 years', 50, 50, 0, 0, 'available')
  ON CONFLICT (variant_id, lot_number) DO UPDATE SET on_hand = 50, status = 'available';

END $$;
