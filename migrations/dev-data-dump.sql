--
-- PostgreSQL database dump
--

\restrict Tj3fGkcuDGqcABxGzhc82kUD0aiByvJcSA7NDkZL65zq24zPX368wv2vPMVhy4Z

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: activity_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activity_log (id, user_id, action, entity, entity_id, details, ip_address, created_at) FROM stdin;
1	2	update	quote	1	Status changed to: closed	\N	2026-03-20 13:52:48.819438
\.


--
-- Data for Name: blog_posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blog_posts (id, title, slug, excerpt, content, cover_image, author, category, tags, status, featured, published_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chat_messages (id, session_id, sender, message, name, email, created_at) FROM stdin;
\.


--
-- Data for Name: cms_services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cms_services (id, title, description, icon, category, features, sort_order, active, created_at, updated_at) FROM stdin;
1	Managed IT Support	24/7 remote and on-site helpdesk support, proactive monitoring, patch management, and system maintenance to keep your business running smoothly.	Headphones	managed	["24/7 helpdesk","Remote & on-site support","Proactive monitoring","Patch management","System health reports"]	1	t	2026-03-18 21:42:21.529601	2026-03-18 21:42:21.529601
2	Cloud Services	Microsoft 365, Google Workspace, Azure, and AWS migrations, setup, and ongoing management. Move to the cloud with confidence.	Cloud	cloud	["Microsoft 365 setup & migration","Google Workspace","Azure & AWS management","Cloud storage solutions","Email & collaboration tools"]	2	t	2026-03-18 21:42:25.456145	2026-03-18 21:42:25.456145
3	Cybersecurity & Compliance	Endpoint protection, threat detection, vulnerability assessments, and compliance support for HIPAA, PCI, and other regulatory frameworks.	Shield	security	["Endpoint protection","Threat detection & response","Security audits","HIPAA & PCI compliance","Employee security training"]	3	t	2026-03-18 21:42:29.279492	2026-03-18 21:42:29.279492
4	Networking & Infrastructure	Firewall configuration, VPN setup, structured cabling, enterprise WiFi, and server infrastructure design and deployment.	Network	infrastructure	["Firewall & VPN setup","Enterprise WiFi","Structured cabling","Server deployment","Network monitoring"]	4	t	2026-03-18 21:42:33.241473	2026-03-18 21:42:33.241473
5	Backup & Disaster Recovery	Business continuity planning, cloud-based backup solutions, and rapid recovery strategies to protect your data from any threat.	HardDrive	backup	["Cloud backup","Business continuity planning","Rapid data recovery","Offsite redundancy","Regular backup testing"]	5	t	2026-03-18 21:42:37.000348	2026-03-18 21:42:37.000348
6	VoIP & Telephony	Modern hosted VoIP phone systems that reduce costs, improve reliability, and scale with your business — including Zoom Phone.	Phone	voip	["Hosted VoIP","Zoom Phone integration","Auto-attendant & IVR","Mobile & desktop apps","Call recording"]	6	t	2026-03-18 21:42:40.899303	2026-03-18 21:42:40.899303
7	Hardware & Software Reselling	Authorized reseller for leading brands. We source, configure, and deploy laptops, desktops, servers, peripherals, and software licenses.	Monitor	reseller	["Laptops & desktops","Servers & networking gear","Printers & peripherals","Software licensing","Warranty management"]	7	t	2026-03-18 21:42:44.844895	2026-03-18 21:42:44.844895
8	Zoom Solutions	As an authorized Zoom partner, we sell and support the complete Zoom suite — Meetings, Phone, Rooms, Webinars, and more — with local expert support.	Video	zoom	["Zoom Meetings","Zoom Phone","Zoom Rooms","Zoom Webinars & Events","Zoom AI Companion"]	8	t	2026-03-18 21:42:48.679471	2026-03-18 21:42:48.679471
\.


--
-- Data for Name: contacts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contacts (id, name, email, phone, company, service, message, created_at) FROM stdin;
1	Jane Doe	jane@example.com	\N	Acme Corp	Zoom Phone	We need Zoom Phone for 50 users.	2026-03-19 22:14:19.974839
2	SMTP Test	test@siebertservices.com	\N	Test Corp	\N	Testing SMTP connection.	2026-03-19 22:16:01.715512
3	Gmail Test	test@siebertservices.com	\N	Test Co	\N	Testing Gmail SMTP.	2026-03-19 22:18:14.784858
4	App Password Test	test@siebertservices.com	\N	Test Co	\N	Testing Gmail App Password SMTP.	2026-03-19 22:22:03.05892
5	Final SMTP Test	test@siebertservices.com	\N	Test Co	\N	Testing updated Gmail credentials.	2026-03-19 22:23:16.0086
6	Live Email Test	test@siebertservices.com	\N	Test Co	\N	Testing live Gmail SMTP after restart.	2026-03-19 22:23:56.269666
7	Richard Siebert	richard@siebertrservices.com	\N	Siebert Services	\N	This is a test email to verify SMTP is working correctly.	2026-03-19 22:26:38.35023
8	Richard Siebert	richard@siebertrservices.com	\N	Siebert Services	\N	Test email to verify SMTP is working correctly.	2026-03-19 22:26:59.334286
9	Richard Siebert	richard@siebertrservices.com	\N	Siebert Services	\N	This is a test email to verify the SMTP system is working correctly. If you receive this, email notifications are fully operational!	2026-03-19 22:29:07.89219
10	Office 365 Test	test@office365.com	\N	Test Co	\N	Testing Office 365 SMTP.	2026-03-19 22:32:46.470588
11	Test User	survivaltek2@gmail.com	\N	Test Company	\N	This is a test email from Siebert Services to verify Office 365 SMTP is working correctly.	2026-03-19 22:33:48.468327
\.


--
-- Data for Name: faq_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.faq_items (id, question, answer, category, sort_order, active, created_at) FROM stdin;
1	What is a Managed Service Provider (MSP)?	An MSP is a company that remotely manages a customer's IT infrastructure and systems. Siebert Services acts as your outsourced IT department, handling everything from helpdesk support to cybersecurity and cloud management.	general	1	t	2026-03-18 21:43:30.77433
2	Why buy Zoom through Siebert Services instead of directly?	As an authorized Zoom partner, we offer the same pricing as buying direct — but you also get local expert support, bundled IT services, simplified billing, and a dedicated account manager who knows your business.	zoom	2	t	2026-03-18 21:43:34.721479
3	Do you offer hardware and software for resale?	Yes! We are an authorized reseller for leading brands of laptops, desktops, servers, networking equipment, and software licensing. We source, configure, and deploy everything for you.	reseller	3	t	2026-03-18 21:43:38.727974
4	How quickly can you respond to a support issue?	Our managed IT clients receive prioritized support with response times based on issue severity. Critical issues are addressed immediately; standard requests within 2-4 hours during business hours.	support	4	t	2026-03-18 21:43:42.701065
5	Can you help migrate our business to the cloud?	Absolutely. We specialize in Microsoft 365, Google Workspace, Azure, and AWS migrations. We handle the planning, data migration, user training, and ongoing management.	cloud	5	t	2026-03-18 21:43:46.638595
6	Do you offer cybersecurity services for small businesses?	Yes. Cybersecurity is not just for enterprises. We offer endpoint protection, threat monitoring, security audits, and compliance support tailored for small and medium-sized businesses.	security	6	t	2026-03-18 21:43:50.597441
\.


--
-- Data for Name: partner_announcements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.partner_announcements (id, title, body, category, min_tier, pinned, active, published_at, created_at) FROM stdin;
1	🎉 Welcome to the Siebert Services Partner Program!	Thank you for joining our partner community. This portal is your hub for deal registration, resources, training, and support. Explore the resources section to get started, and don't hesitate to reach out to your partner manager.	general	registered	t	t	2026-03-18 21:53:41.985101	2026-03-18 21:53:41.985101
2	Zoom Phone Q1 2024 Promotions — Earn Extra Margin	Siebert Services is offering enhanced partner margins on Zoom Phone deals closed in Q1 2024. Register your deals now to lock in the promotion. Contact your partner manager for details on eligible deal sizes.	promotions	registered	t	t	2026-03-18 21:53:46.115273	2026-03-18 21:53:46.115273
3	New Silver Tier Benefit: Co-Marketing Fund	Silver, Gold, and Platinum partners now have access to a quarterly co-marketing development fund (MDF). Submit your campaign proposals through your partner manager to get reimbursed for qualified marketing activities.	program	silver	f	t	2026-03-18 21:53:50.013601	2026-03-18 21:53:50.013601
4	Microsoft 365 Copilot Now Available to Resell	Siebert Services partners can now resell Microsoft 365 Copilot AI features. New sales enablement resources are available in the Resources section. Attend our upcoming webinar for a full product walkthrough.	products	registered	f	t	2026-03-18 21:53:53.82827	2026-03-18 21:53:53.82827
5	Partner Appreciation Event — Save the Date	Join us for the annual Siebert Services Partner Summit. This year's event will feature executive keynotes, product deep-dives, networking, and recognition awards for our top performers. Details coming soon.	events	silver	f	t	2026-03-18 21:53:57.738997	2026-03-18 21:53:57.738997
\.


--
-- Data for Name: partner_certifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.partner_certifications (id, name, description, provider, category, duration, badge_url, active, sort_order, created_at) FROM stdin;
1	Zoom Meetings & Team Chat Fundamentals	Master the core Zoom platform including meetings, webinars, and team chat for business use cases.	Zoom	zoom	3 hours	\N	t	1	2026-03-18 21:53:18.728857
2	Zoom Phone Sales Specialist	Learn to position, quote, and close Zoom Phone deals. Covers features, competitive differentiation, and objection handling.	Zoom	zoom	5 hours	\N	t	2	2026-03-18 21:53:22.558088
3	Zoom Rooms Certified Installer	Technical certification for deploying and configuring Zoom Rooms hardware and software.	Zoom	zoom	8 hours	\N	t	3	2026-03-18 21:53:26.388624
4	Cybersecurity Essentials for Resellers	Understand core cybersecurity concepts and how to identify and close security opportunities with clients.	Siebert Services	security	4 hours	\N	t	4	2026-03-18 21:53:30.492772
5	Microsoft 365 Sales & Licensing	Navigate M365 licensing tiers, bundles, and add-ons to recommend the right plan for each customer.	Microsoft	cloud	3 hours	\N	t	5	2026-03-18 21:53:34.278559
6	MSP Sales & Deal Closing	Consultative selling techniques for managed services — discovery, proposal writing, and objection handling.	Siebert Services	sales	6 hours	\N	t	6	2026-03-18 21:53:38.150997
\.


--
-- Data for Name: partners; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.partners (id, company_name, contact_name, email, password, phone, website, address, city, state, zip, country, business_type, years_in_business, employee_count, annual_revenue, specializations, tier, status, total_deals, total_revenue, ytd_revenue, approved_at, created_at, updated_at, sso_provider, sso_id) FROM stdin;
2	Siebert Admin	Admin User	richard@siebertrservices.com.com	$2b$10$eJ5L4X7B7Do3/vX3RL4JU.fR0fX05dkDnjPyGmsWeWGa9vu2DPCOS	555-0000	\N	\N	\N	\N	\N	US	\N	\N	\N	\N	[]	platinum	approved	0	0.00	0.00	\N	2026-03-19 21:42:01.990523	2026-03-19 21:42:01.990523	\N	\N
3	Siebert Admin	Portal Admin	admin@siebert.com	$2b$10$G4nQg45P/GLYqAgpgOWsFePGwFYhH0j6S0ueVPIDB3xtGGfwAHogG	555-0001	\N	\N	\N	\N	\N	US	\N	\N	\N	\N	[]	platinum	approved	0	0.00	0.00	\N	2026-03-19 21:48:44.09614	2026-03-19 21:48:44.09614	\N	\N
1	Acme Solutions LLC	John Smith	testpartner@acme.com	$2b$10$/aeBU4sgk0tDeiU12zZFNOIp3iU.K4QcnA5OR4yJW0Ot2lD2XL1he	555-123-4567	\N	\N	\N	\N	\N	US	\N	\N	\N	\N	[]	gold	approved	2	0.00	0.00	\N	2026-03-19 21:33:48.896715	2026-03-19 21:33:48.896715	\N	\N
\.


--
-- Data for Name: partner_cert_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.partner_cert_progress (id, partner_id, certification_id, status, progress_pct, completed_at, expires_at, created_at) FROM stdin;
\.


--
-- Data for Name: partner_deals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.partner_deals (id, partner_id, title, customer_name, customer_email, customer_phone, description, products, estimated_value, actual_value, status, stage, expected_close_date, closed_at, notes, created_at, updated_at) FROM stdin;
1	1	Zoom Phone - TestCorp	TestCorp Inc	test@testcorp.com	\N	\N	["Zoom Phone","Zoom Rooms"]	15000.00	\N	registered	prospect	\N	\N	\N	2026-03-19 22:09:22.121829	2026-03-19 22:09:22.121829
2	1	Zoom Workplace - <script>alert(1)</script>	Evil Corp & Co	\N	\N	\N	["Zoom Phone"]	5000.00	\N	registered	prospect	\N	\N	\N	2026-03-19 22:11:20.53994	2026-03-19 22:11:20.53994
\.


--
-- Data for Name: partner_commissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.partner_commissions (id, partner_id, deal_id, type, description, amount, rate, status, paid_at, period_start, period_end, created_at) FROM stdin;
1	1	\N	bonus	Q1 2024 Performance Bonus	500.00	5.00	rejected	2026-03-19 22:01:56.791	\N	\N	2026-03-19 22:01:44.423728
\.


--
-- Data for Name: partner_leads; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.partner_leads (id, partner_id, company_name, contact_name, email, phone, source, interest, status, notes, assigned_at, created_at) FROM stdin;
\.


--
-- Data for Name: partner_mdf_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.partner_mdf_requests (id, partner_id, title, description, activity_type, requested_amount, approved_amount, start_date, end_date, expected_leads, status, proof_of_execution, approved_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: partner_resources; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.partner_resources (id, title, description, url, type, category, min_tier, featured, download_count, active, created_at) FROM stdin;
1	Zoom Partner Sales Playbook 2024	Complete sales guide for positioning and selling Zoom products to SMB and enterprise clients.	https://zoom.us/docs/partner-playbook.pdf	pdf	sales	registered	t	0	t	2026-03-18 21:52:47.424862
2	Siebert Services Partner Overview Deck	Slide deck introducing Siebert Services and the partner program. Use in prospect meetings.	https://docs.google.com/presentation/partner-overview	presentation	marketing	registered	t	0	t	2026-03-18 21:52:51.301024
3	Zoom Phone ROI Calculator	Excel-based calculator to demonstrate Zoom Phone cost savings vs. traditional PBX systems.	https://zoom.us/docs/phone-roi.xlsx	pdf	zoom	registered	f	0	t	2026-03-18 21:52:55.28473
4	Microsoft 365 Competitive Battle Card	Feature comparison against Google Workspace to help close Microsoft 365 deals.	https://partner.microsoft.com/battlecard	pdf	sales	silver	f	0	t	2026-03-18 21:52:59.197709
5	Cybersecurity Solutions Product Brief	Overview of Siebert Services cybersecurity offerings for partners to share with prospects.	https://siebertservices.com/resources/cybersecurity-brief.pdf	pdf	technical	registered	f	0	t	2026-03-18 21:53:03.081166
6	Partner Co-Marketing Templates	Branded email templates, social media assets, and co-branded collateral for your marketing campaigns.	https://drive.google.com/drive/partner-marketing	link	marketing	silver	t	0	t	2026-03-18 21:53:06.92319
7	Zoom Rooms Setup & Configuration Guide	Technical guide for deploying Zoom Rooms in conference rooms and huddle spaces.	https://zoom.us/docs/rooms-setup.pdf	pdf	technical	registered	f	0	t	2026-03-18 21:53:10.696265
8	Deal Registration Best Practices	Tips and best practices for successfully registering and closing deals in the partner portal.	https://siebertservices.com/resources/deal-reg-guide.pdf	pdf	training	registered	f	0	t	2026-03-18 21:53:14.730761
\.


--
-- Data for Name: partner_support_tickets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.partner_support_tickets (id, partner_id, subject, description, category, priority, status, assigned_to, resolution, resolved_at, created_at, updated_at) FROM stdin;
1	3	test	test	general	medium	open	\N	\N	\N	2026-03-19 21:55:25.058762	2026-03-19 21:55:25.058762
2	1	Need pricing for Zoom Rooms	Customer is requesting a detailed pricing breakdown for 10 Zoom Rooms licenses.	sales	high	open	\N	\N	\N	2026-03-19 22:09:22.189869	2026-03-19 22:09:22.189869
\.


--
-- Data for Name: partner_ticket_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.partner_ticket_messages (id, ticket_id, sender_type, sender_name, message, created_at) FROM stdin;
\.


--
-- Data for Name: quotes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quotes (id, name, email, phone, company, company_size, services, budget, timeline, details, status, created_at, assigned_to, internal_notes) FROM stdin;
1	Bob Smith	bob@widget.co	\N	Widget Co	\N	["Zoom Workplace","Zoom Rooms"]	$10k-$25k	Q2 2026	\N	closed	2026-03-19 22:14:20.055899	\N	\N
\.


--
-- Data for Name: quote_proposals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quote_proposals (id, quote_id, proposal_number, client_name, client_email, client_company, client_phone, title, summary, subtotal, discount, discount_type, tax, total, status, valid_until, terms, notes, sent_at, viewed_at, responded_at, client_signature, version, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: quote_line_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quote_line_items (id, proposal_id, name, description, category, quantity, unit_price, unit, recurring, recurring_interval, total, sort_order) FROM stdin;
\.


--
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.site_settings (id, key, value, updated_at) FROM stdin;
1	company_name	Siebert Services	2026-03-18 21:41:30.219252
2	company_legal	Siebert Repair Services LLC DBA Siebert Services	2026-03-18 21:41:34.111879
3	tagline	Technology Solutions. Delivered Simply.	2026-03-18 21:41:37.92137
4	phone	1-800-SIEBERT	2026-03-18 21:41:41.891988
5	email	info@siebertservices.com	2026-03-18 21:41:45.716879
6	address	123 Tech Boulevard, Suite 100	2026-03-18 21:41:49.626025
7	city_state_zip	Your City, ST 00000	2026-03-18 21:41:53.667806
8	hero_heading	Technology Solutions.	2026-03-18 21:41:57.514613
9	hero_subheading	Delivered Simply.	2026-03-18 21:42:01.546484
10	hero_description	Siebert Services is your trusted MSP and technology reseller — delivering enterprise-grade IT solutions, cybersecurity, cloud services, and the full Zoom product suite to businesses of all sizes.	2026-03-18 21:42:05.360925
11	about_story	Siebert Services was founded on a simple belief: businesses deserve technology that works — and a partner who explains it clearly. As a trusted MSP and authorized reseller, we bring enterprise-grade tools to businesses of every size, without the enterprise complexity.	2026-03-18 21:42:09.203629
12	zoom_partner_tier	Authorized Zoom Partner	2026-03-18 21:42:13.081603
13	zoom_partner_description	As an authorized Zoom partner, Siebert Services offers the complete Zoom product portfolio — with local support, simplified billing, and bundled IT services you won't find buying direct.	2026-03-18 21:42:17.195383
\.


--
-- Data for Name: team_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.team_members (id, name, role, bio, image_url, sort_order, active, created_at) FROM stdin;
\.


--
-- Data for Name: testimonials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.testimonials (id, name, company, role, content, rating, active, sort_order, created_at) FROM stdin;
1	Mark Thompson	Thompson Law Group	Managing Partner	Siebert Services transformed our office communications. They migrated us to Zoom Phone and we've never looked back. The support is incredible — they feel like our own IT department.	5	t	1	2026-03-18 21:43:14.646162
2	Sandra Reyes	Reyes Medical Associates	Office Manager	We needed HIPAA-compliant solutions fast. Siebert set us up with Microsoft 365 and proper security in a matter of days. Professional, knowledgeable, and always available.	5	t	2	2026-03-18 21:43:18.547017
3	James Kowalski	Kowalski Manufacturing	IT Director	Best reseller experience we've had. They sourced our entire server refresh, handled the migration, and the Zoom Rooms setup in our conference spaces is seamless.	5	t	3	2026-03-18 21:43:22.68974
4	Priya Nair	Nair Consulting Group	CEO	From day one, Siebert felt like a partner, not a vendor. They explained everything clearly and our team actually understands the tools they gave us.	5	t	4	2026-03-18 21:43:26.645441
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, company, phone, role, created_at, sso_provider, sso_id) FROM stdin;
1	Siebert Admin	admin@siebertservices.com	$2b$10$uPfSKwxT9qZW9sheXHJI7.RKLaES4OIs3K4zJ/pW8YoKtcj.vEzyK	Siebert Services	\N	admin	2026-03-18 21:45:08.533764	\N	\N
2	Administrator	admin@siebertrservices.com	$2b$10$DKTLwR/q7M/q0m2PS/bI3eU0k5sI5FH6la/S/u7iKytCIytBcTuD.	Siebert Services	\N	admin	2026-03-20 13:42:33.274983	\N	\N
\.


--
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tickets (id, subject, description, priority, category, status, user_id, created_at, updated_at) FROM stdin;
\.


--
-- Name: activity_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.activity_log_id_seq', 1, true);


--
-- Name: blog_posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.blog_posts_id_seq', 1, false);


--
-- Name: chat_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.chat_messages_id_seq', 1, false);


--
-- Name: cms_services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cms_services_id_seq', 8, true);


--
-- Name: contacts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contacts_id_seq', 11, true);


--
-- Name: faq_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.faq_items_id_seq', 6, true);


--
-- Name: partner_announcements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.partner_announcements_id_seq', 5, true);


--
-- Name: partner_cert_progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.partner_cert_progress_id_seq', 1, false);


--
-- Name: partner_certifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.partner_certifications_id_seq', 6, true);


--
-- Name: partner_commissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.partner_commissions_id_seq', 1, true);


--
-- Name: partner_deals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.partner_deals_id_seq', 2, true);


--
-- Name: partner_leads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.partner_leads_id_seq', 1, false);


--
-- Name: partner_mdf_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.partner_mdf_requests_id_seq', 1, false);


--
-- Name: partner_resources_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.partner_resources_id_seq', 8, true);


--
-- Name: partner_support_tickets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.partner_support_tickets_id_seq', 2, true);


--
-- Name: partner_ticket_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.partner_ticket_messages_id_seq', 1, false);


--
-- Name: partners_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.partners_id_seq', 3, true);


--
-- Name: quote_line_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.quote_line_items_id_seq', 1, false);


--
-- Name: quote_proposals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.quote_proposals_id_seq', 1, false);


--
-- Name: quotes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.quotes_id_seq', 1, true);


--
-- Name: site_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.site_settings_id_seq', 13, true);


--
-- Name: team_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.team_members_id_seq', 1, false);


--
-- Name: testimonials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.testimonials_id_seq', 4, true);


--
-- Name: tickets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tickets_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- PostgreSQL database dump complete
--

\unrestrict Tj3fGkcuDGqcABxGzhc82kUD0aiByvJcSA7NDkZL65zq24zPX368wv2vPMVhy4Z

