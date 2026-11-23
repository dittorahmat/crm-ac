-- Seed Users (Admin & Field Technicians)
INSERT OR REPLACE INTO users (id, name, email, email_verified, role, phone, created_at, updated_at) VALUES 
('usr_admin_1', 'Admin Operasional', 'admin@koolsync.com', 1, 'admin', '081211223344', 1732363200, 1732363200),
('usr_tech_1', 'Fajar Pratama', 'fajar.tech@koolsync.com', 1, 'technician', '081377889900', 1732363200, 1732363200),
('usr_tech_2', 'Agus Santoso', 'agus.tech@koolsync.com', 1, 'technician', '081299001122', 1732363200, 1732363200);

-- Seed Customers (B2B Corporate Clients)
INSERT OR REPLACE INTO customers (id, name, pic_name, pic_phone, pic_email, default_service_interval_months, notes, created_at, updated_at) VALUES
('cust_1', 'PT. Mega Solusi Finansial', 'Bpk. Rahmat Hidayat', '081288992211', 'procurement@megasolusi.co.id', 3, 'Gedung Wisma Sudirman - Perawatan rutin server room & lantai kerja', 1732363200, 1732363200),
('cust_2', 'CV. Digital Niaga Nusantara', 'Ibu Linda Wijaya', '081399887766', 'ga@digitalniaga.id', 3, 'Head office Tebet', 1732363200, 1732363200),
('cust_3', 'PT. Surya Teknologi Global', 'Bpk. Hendra Gunawan', '081912345678', 'finance@suryatekno.com', 2, 'Graha Mandiri Lt. 12', 1732363200, 1732363200);

-- Seed Locations
INSERT OR REPLACE INTO locations (id, customer_id, name, address, city, pic_name, pic_phone, created_at) VALUES
('loc_1', 'cust_1', 'Gedung Wisma Sudirman', 'Jl. Jend. Sudirman Kav. 24', 'Jakarta Pusat', 'Bpk. Rahmat', '081288992211', 1732363200),
('loc_2', 'cust_2', 'Head Office Tebet', 'Jl. Tebet Raya No. 45', 'Jakarta Selatan', 'Ibu Linda', '081399887766', 1732363200),
('loc_3', 'cust_3', 'Graha Mandiri Lt. 12', 'Jl. M.H. Thamrin No. 8', 'Jakarta Pusat', 'Bpk. Hendra', '081912345678', 1732363200);

-- Seed Zones
INSERT OR REPLACE INTO zones (id, location_id, name, floor, created_at) VALUES
('zone_1', 'loc_1', 'Lantai 2 - Ruang Server', '2', 1732363200),
('zone_2', 'loc_1', 'Lantai 8 - Open Office Workstation', '8', 1732363200),
('zone_3', 'loc_1', 'Lantai 1 - Lobby Utama', '1', 1732363200),
('zone_4', 'loc_2', 'Area Operasional Staff', '1', 1732363200),
('zone_5', 'loc_3', 'Executive Boardroom', '12', 1732363200);

-- Seed AC Units with Asset Tags for Barcodes
INSERT OR REPLACE INTO ac_units (id, customer_id, location_id, zone_id, asset_tag, brand, model_number, serial_number, ac_type, capacity_pk, refrigerant_type, service_interval_months, status, notes, created_at) VALUES
('ac_1', 'cust_1', 'loc_1', 'zone_1', 'AC-MSF-SRV-01', 'Daikin Inverter', 'FTKC25TV', 'SN-DKN-88219', 'split_wall', 2.0, 'R32', 1, 'active', 'Ruang Server Kritis - Perlu servis tiap 1 bulan', 1732363200),
('ac_2', 'cust_1', 'loc_1', 'zone_2', 'AC-MSF-WRK-02', 'Panasonic Inverter', 'CS-XU18XKP', 'SN-PNS-33102', 'split_wall', 2.0, 'R32', 3, 'active', 'Workstation A', 1732363200),
('ac_3', 'cust_1', 'loc_1', 'zone_3', 'AC-MSF-LOB-03', 'Panasonic Cassette', 'S-24PU2H5', 'SN-PNS-44910', 'cassette', 3.0, 'R410A', 3, 'active', 'Lobby Utama Gedung', 1732363200),
('ac_4', 'cust_2', 'loc_2', 'zone_4', 'AC-DNN-OPS-01', 'Sharp Plasmacluster', 'AH-X12ZY', 'SN-SHP-12001', 'split_wall', 1.5, 'R32', 3, 'active', 'Area Staff Tebet', 1732363200),
('ac_5', 'cust_3', 'loc_3', 'zone_5', 'AC-STG-BDR-01', 'Daikin Multi-S', 'MKC50RVM', 'SN-DKN-90112', 'central', 3.0, 'R32', 2, 'active', 'Boardroom VIP', 1732363200);

-- Seed Service Orders
INSERT OR REPLACE INTO service_orders (id, order_number, customer_id, location_id, technician_id, scheduled_date, status, created_at) VALUES
('so_1', 'SO-202611-101', 'cust_1', 'loc_1', 'usr_tech_1', 1732438800, 'DISPATCHED', 1732363200),
('so_2', 'SO-202611-102', 'cust_2', 'loc_2', 'usr_tech_2', 1732453200, 'SCHEDULED', 1732363200),
('so_3', 'SO-202611-099', 'cust_3', 'loc_3', 'usr_tech_1', 1732266000, 'COMPLETED', 1732363200);

-- Seed Invoices
INSERT OR REPLACE INTO invoices (id, invoice_number, service_order_id, customer_id, subtotal, tax_amount, total_amount, status, due_date, created_at) VALUES
('inv_1', 'INV-202611-101', 'so_3', 'cust_3', 2400000, 264000, 2664000, 'PAID', 1733572800, 1732363200),
('inv_2', 'INV-202611-102', 'so_1', 'cust_1', 1600000, 176000, 1776000, 'SENT', 1733659200, 1732363200);
