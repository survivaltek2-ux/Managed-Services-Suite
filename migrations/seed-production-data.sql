-- Siebert Services - Production Data Seed
-- This file contains all test/development data to seed the production database on first deployment

-- Disable triggers during restore for performance
ALTER TABLE IF EXISTS partner_deals DISABLE TRIGGER ALL;
ALTER TABLE IF EXISTS partner_commissions DISABLE TRIGGER ALL;

-- Clear existing data (if any) to avoid conflicts
DELETE FROM activity_log;
DELETE FROM partner_ticket_messages;
DELETE FROM partner_support_tickets;
DELETE FROM partner_leads;
DELETE FROM partner_commissions;
DELETE FROM partner_deals;
DELETE FROM partner_cert_progress;
DELETE FROM quote_line_items;
DELETE FROM quote_proposals;
DELETE FROM quotes;
DELETE FROM contacts;
DELETE FROM chat_messages;
DELETE FROM blog_posts;
DELETE FROM partner_resources;
DELETE FROM partner_certifications;
DELETE FROM partner_announcements;
DELETE FROM testimonials;
DELETE FROM team_members;
DELETE FROM faq_items;
DELETE FROM cms_services;
DELETE FROM site_settings;
DELETE FROM tickets;
DELETE FROM partners;
DELETE FROM users WHERE role != 'admin'; -- Keep admin user

-- Reset sequences
SELECT setval('activity_log_id_seq', 1, false) WHERE EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='activity_log');
SELECT setval('blog_posts_id_seq', 1, false) WHERE EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='blog_posts');
SELECT setval('chat_messages_id_seq', 1, false) WHERE EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='chat_messages');
SELECT setval('cms_services_id_seq', 1, false) WHERE EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='cms_services');
SELECT setval('contacts_id_seq', 1, false) WHERE EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='contacts');
SELECT setval('faq_items_id_seq', 1, false) WHERE EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='faq_items');
SELECT setval('partners_id_seq', 1, false) WHERE EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='partners');
SELECT setval('partner_deals_id_seq', 1, false) WHERE EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='partner_deals');
SELECT setval('quotes_id_seq', 1, false) WHERE EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='quotes');

-- Data will be inserted by the seed script
-- This file is a placeholder for structure

-- Re-enable triggers
ALTER TABLE IF EXISTS partner_deals ENABLE TRIGGER ALL;
ALTER TABLE IF EXISTS partner_commissions ENABLE TRIGGER ALL;
