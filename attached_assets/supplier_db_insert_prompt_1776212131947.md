You are a database assistant. Your task is to generate SQL INSERT statements for a supplier product catalog database using the data below. Use the following table schema:

TABLE: suppliers
- id (INT, AUTO_INCREMENT, PRIMARY KEY)
- company_name (VARCHAR 255)
- website (VARCHAR 255)
- industry_category (VARCHAR 255)

TABLE: products_services
- id (INT, AUTO_INCREMENT, PRIMARY KEY)
- supplier_id (INT, FK → suppliers.id)
- category (VARCHAR 255)
- product_name (VARCHAR 255)
- description (TEXT)

Instructions:
- For each supplier, create one INSERT into `suppliers`
- Then create one or more INSERTs into `products_services` for each distinct product or service line
- Use sequential integer IDs starting at 1
- Escape any single quotes in text fields (use '')
- Wrap all INSERTs in a transaction (BEGIN; ... COMMIT;)
- Group the output by supplier

---

SUPPLIER DATA:

[1] Company Name: 11:11 Systems
    Website: https://1111systems.com
    Industry Category: Managed Cloud Infrastructure, Connectivity, and Security (11:11 Systems, Cloudtango)
    Product/Service Categories: Cloud (IaaS, backup, DR, VDI, storage), Connectivity (NaaS, WAN, internet access), Security (firewall, EDR, SIEM), Managed Services (11:11 Systems blog, Success Center)
    Key Specific Products & Services: 11:11 Cloud Platform, Cloud Backup, Disaster Recovery as a Service (DRaaS), Backup as a Service (BaaS), Object Storage, Network as a Service (NaaS), SD-WAN, Global Cloud Native Backbone, Managed Last-Mile, Firewall, EDR, SIEM, LabEngine, Managed OS Services (homepage, NaaS page, blog)

[2] Company Name: 8x8, Inc.
    Website: https://www.8x8.com/
    Industry Category: UCaaS, CCaaS, Cloud Communications
    Product/Service Categories: Contact Center, Unified Communications (voice, video, chat), Communications APIs
    Key Specific Products & Services: 8x8 X Series (X2, X4, X6, X8 editions), 8x8 Work, 8x8 Contact Center, 8x8 Engage, Omnichannel Routing, Agent Assist

[3] Company Name: 911inform
    Website: https://inform.911inform.com/
    Industry Category: Public Safety and Emergency Management
    Product/Service Categories: Notification platforms, Security management, Emergency response software, Connected building solutions
    Key Specific Products & Services: 911inform Emergency Management Platform, 911 InformPod (panic button), 911inform LDS (IP phone location), 911inform gateway (hardware), Four-tiered notification groups: Acknowledge Users, Basic Users, Cardiac/Health Emergency Users, Administration Users

[4] Company Name: Abundant IoT
    Website: https://abundantiot.com
    Industry Category: IoT (Internet of Things), Energy (eIoT)
    Product/Service Categories: Sustainable IoT ecosystems: connectivity, mobility, energy; IT services auction; smart building/city consulting; ESG consulting; IRA incentives; partner marketing (PRM-xAmplify); M2M, MDM, MEM
    Key Specific Products & Services: eIoT; Green Generator; HotDrop 2.0; Temperature & Humidity sensor; Water Leak Sensor; LoRaWAN sensors/gateways (700+ sensors, 5G/LTE gateways); Building Controls; IT Services Auction; PRM-xAmplify

[5] Company Name: ACC Business
    Website: https://accbusiness.com
    Industry Category: Telecommunications
    Product/Service Categories: Networking, Data/IP, Cloud, Voice, Cybersecurity, Ethernet
    Key Specific Products & Services: AT&T Dedicated Internet (ADI), AT&T Internet Access (AIA), AT&T VPN (AVPN), AT&T IP Flexible Reach, AT&T Switched Ethernet Service (ASE), AT&T Wavelength Metro (AWM), AT&T Wavelength Long Haul (AWL), Fiber Services

[6] Company Name: Access One Inc.
    Website: https://www.accessoneinc.com/
    Industry Category: IT Services and IT Consulting, Telecommunications
    Product/Service Categories: Managed IT, Cybersecurity, Cloud Services, Voice and Data (UCaaS, SD-WAN), Physical Security
    Key Specific Products & Services: Managed IT Help Desk, Office 365, Virtual CIO, SD-WAN, MPLS & IP VPN, SIP Trunking, Unified Communications, Hosted PBX, Email Security, Mobile Security, Business Continuity, Disaster Recovery

[7] Company Name: Advantix Solutions
    Website: https://advantixsolutions.com
    Industry Category: Telecommunications
    Product/Service Categories: Managed connectivity (MCx), multicarrier cellular connectivity, technology expense management (TEM), managed mobility, audits and optimization
    Key Specific Products & Services: SmartSIM (multi-carrier SIM with auto-failover), Grooov (carrier/data/expense management platform), BLITZ carrier middleware, MCx managed connectivity experience

[8] Company Name: Affirma
    Website: https://www.affirma.com
    Industry Category: IT Consulting, Technology Services
    Product/Service Categories: AI & Machine Learning, Cloud Computing, Data Analytics & Business Intelligence, Custom Software Development, Digital Marketing, Business Strategy Consulting
    Key Specific Products & Services: Predictive Analytics, Generative AI, Application Modernization, Mobile & Web Applications, Marketing Automation, SEO/AEO, HubSpot Support, Salesforce CRM Implementation, M365 Migration, Content Services

[9] Company Name: AireSpring
    Website: https://airespring.com/
    Industry Category: Telecommunications, Managed Network Services, MSP
    Product/Service Categories: Managed Connectivity, Managed SD-WAN/SD-Branch/SASE/Security, Cloud Voice Communications/UCaaS, Global Mobility, MPLS, SIP Trunking, Disaster Recovery
    Key Specific Products & Services: AirePBX UCaaS, AireContact CCaaS, Global Managed SD-WAN (VMware by VeloCloud, Fortinet Secure SD-WAN, Cisco-Meraki SD-WAN), AireNMS Network Monitoring, Managed Firewall (FortiGate NGFW), Dedicated Internet Access, Managed Failover, 4G LTE Wireless, Microsoft Teams Direct Routing, SIP Trunking, MPLS Mesh

[10] Company Name: Akamai Technologies
    Website: https://www.akamai.com
    Industry Category: Cloud computing, cybersecurity, CDN Akamai, Wikipedia
    Product/Service Categories: Security, Cloud/Compute, Content Delivery/CDN Akamai Products, Akamai Solutions
    Key Specific Products & Services: App & API Protector, Kona Site Defender, Bot Manager, Prolexic, mPulse, Ion, Identity Cloud, Enterprise Application Access, Connected Cloud, App Platform, Cloud Inference Appsruntheworld, Macnica

[11] Company Name: Aligned Technology Group
    Website: https://www.alignedtg.com
    Industry Category: Cloud Computing, IT Services and Consulting (AWS-focused)
    Product/Service Categories: Cloud Advisory, Cloud Engineering, Cloud Finance, Cloud Security, Managed Services, Data & AI, Migrations
    Key Specific Products & Services: Ignite Managed Services, Catalyst program, Cloud Security Posture Assessments (CSPA), Well-Architected Framework Reviews, Elastic Engineering, AWS Marketplace services

[12] Company Name: Altafiber
    Website: https://www.altafiber.com
    Industry Category: Telecommunications
    Product/Service Categories: Fiber-optic Internet, IPTV/Video, Voice/Home Phone, Enterprise IT solutions, Data services
    Key Specific Products & Services: Fioptics (fiber Internet, TV bundles), 400 Mbps, 600 Mbps, 1 Gig, 3 Gig Internet tiers; Gigabit/2 Gig speeds; MyTV Video bundles; UCaaS, SD-WAN, Managed Security (enterprise)

[13] Company Name: Americaneagle Managed Cloud Services (AEMCS)
    Website: https://www.aemcs.com
    Industry Category: Managed Cloud Services, Cloud Computing
    Product/Service Categories: Application-Centric Cloud Management, Cost & Performance Optimization, Security & Compliance, Web & Application Development, Backup & Disaster Recovery, DevOps Enablement, White-Glove Support AEMCS.com, Services
    Key Specific Products & Services: No-Cost Cloud Audit (Cloud Cost & Performance Audit), Immutable Backup & Disaster Recovery, Continuous Cost & Performance Optimization, Advanced Services & DevOps Enablement AEMCS.com, About

[14] Company Name: Appgate
    Website: https://www.appgate.com
    Industry Category: Cybersecurity
    Product/Service Categories: Zero Trust Network Access (ZTNA), Fraud Protection, Threat Advisory Services
    Key Specific Products & Services: Appgate SDP (ZTNA), Appgate ZTNA, 360 Fraud Protection (including 360 Brand Guardian, 360 Risk Control, 360 Adaptive Authentication), Cyber Advisory Services

[15] Company Name: APX Net
    Website: https://apxnet.com
    Industry Category: Telecommunications
    Product/Service Categories: Business Internet, Wide Area Networks (WAN), Private Line, SD-WAN, Network Monitoring and Management
    Key Specific Products & Services: Dedicated Internet Access (DIA), SD-WAN, SD-Internet, Private Line, INSITE (Network Monitoring and Management platform), Fixed Wireless Backup

[16] Company Name: Arelion
    Website: https://www.arelion.com
    Industry Category: Telecommunications, Global IP Backbone ProviderTelia Carrier, Arelion
    Product/Service Categories: IP Connectivity (Transit, DIA, Cloud Connect), Ethernet & Networking (Wavelengths, VPN), Voice & Messaging, Mobile Data & Roaming, Security (DDoS Mitigation)Arelion Products, Arelion
    Key Specific Products & Services: IP Transit (AS1299), DIA (IP Connect), Cloud Connect (AWS, Azure, Google, Oracle, IBM), DDoS Mitigation, SecureConnect Transit & DIA, Wavelengths, Ethernet (EVPL, ELAN), Smart IP-VPN, Managed Optical Fiber Network, Flash Call Monetization, Mobile Data Roaming, IPX & IoTArelion Products, CoreSite

[17] Company Name: Arvig
    Website: https://arvig.com
    Industry Category: Telecommunications
    Product/Service Categories: Broadband Internet, TV, Phone (including Hosted PBX), Managed WiFi, Mobile, Security, Managed IT, Construction, Digital Marketing
    Key Specific Products & Services: MultiWav fiber internet, Arvig Mobile Unlimited Plan, Arvig Mobile Unlimited Max Plan, By The Gig mobile plan, Managed WiFi Plus and Premium tiers, Hosted PBX (HPBX), Ethernet solutions up to 400Gbps, Arvig Answering Solutions, Arvig Media, Arvig Construction, All State Communications, Precision Locating

[18] Company Name: Aryaka
    Website: https://www.aryaka.com/
    Industry Category: Networking, SD-WAN, SASE, Cloud Networking Aryaka Products Page, Aryaka Wikipedia, Aryaka Homepage
    Product/Service Categories: Unified SASE as a Service, SD-WAN, Secure Remote Access, WAN Optimization, Advanced Security, Last Mile Services Aryaka Products Page, Aryaka SD-WAN Datasheet
    Key Specific Products & Services: Secure SD-WAN, Global Connectivity, Multi-Cloud, AI> Perform, NGFW-SWG, IPS, Anti-Malware, CASB, NextGen DLP, Essential Universal ZTNA, Advanced Universal ZTNA, SaaS Acceleration, AI> Secure, AI> Observe Aryaka Products Page

[19] Company Name: Assured Data Protection
    Website: https://assured-dp.com
    Industry Category: Cybersecurity, Data Protection, Managed Services
    Product/Service Categories: Data Backup, Disaster Recovery, Cyber Resiliency, Business Continuity
    Key Specific Products & Services: Assured Backup with BackBox, Assured Recovery with Zerto, Rubrik as-a-Service (RUaaS), Backup as a Service (BaaS), Disaster Recovery as a Service (DRaaS), M365 Cloud Backup, Nutanix Disaster Recovery as-a-Service, Tier I/II/III services

[20] Company Name: Astound Business Solutions
    Website: https://www.astound.com/business/
    Industry Category: Telecommunications
    Product/Service Categories: High-speed Internet, Voice (Hosted Voice, Business Voice), Business TV, Wi-Fi Solutions, Cloud Hosting, Fiber Connectivity, SD-WAN
    Key Specific Products & Services: High Speed Internet (55 Mbps to 5 Gbps), Business Class Internet (50 Mbps to 1 Gbps symmetrical), Hosted Voice (Essential, Express, Premium seats), Astound Wi-Fi Pro, Poly Edge E Series phones (E220, E350, E450), 1G fiber-based SD-WAN

[21] Company Name: AT&amp;T
    Website: https://www.att.com
    Industry Category: Telecommunications
    Product/Service Categories: Wireless/Mobility, Broadband/Fiber Internet, Voice/UCaaS, Networking/SD-WAN, IoT, Cybersecurity
    Key Specific Products & Services: Unlimited Your Way® wireless plans, AT&amp;T Business Fiber (300, 500, 1 Gig+), AT&amp;T Dedicated Internet, AT&amp;T Internet Air®, Office@Hand (UCaaS), AT&amp;T SD-WAN, FirstNet®, ActiveArmor®, AT&amp;T Dynamic Defense®, AT&amp;T OneConnect bundle

[22] Company Name: AudioCodes Ltd.
    Website: https://www.audiocodes.com
    Industry Category: Unified Communications (UCaaS), Voice Networking, Contact Center (CCaaS), Conversational AI AudioCodes, Wikipedia
    Product/Service Categories: Voice infrastructure (SBCs, media gateways, IP phones), Management & operations software, AI-powered voice applications & SaaS services, Contact center solutions AudioCodes
    Key Specific Products & Services: Mediant Session Border Controllers, 400HD series IP phones, MediaPack gateways, One Voice Operations Center (OVOC), AudioCodes Device Manager, AudioCodes Routing Manager (ARM), Voca CIC, Live Hub AudioCodes, Investor Relations

[23] Company Name: Avail
    Website: https://www.4avail.com
    Industry Category: Telecom Expense Management (TEM), Connected IT and Telecom Management
    Product/Service Categories: Connected Operations Management, Audit, Invoice Management, Inventory Management, Usage Management, Sourcing Management, Ordering & Provision Management, Dispute Management, RFP Consulting
    Key Specific Products & Services: Connected Operations Management (COM) platform, 4Avail Platform, client-managed SD-WAN solutions

[24] Company Name: Avaya
    Website: https://www.avaya.com/en/
    Industry Category: Cloud Communications, Unified Communications (UCaaS), Contact Center (CCaaS) Avaya.com, Wikipedia
    Product/Service Categories: Unified Communications, Contact Center Solutions, Critical Communications, Cloud Collaboration, Professional and Managed Services Avaya Products, Avaya Homepage
    Key Specific Products & Services: Avaya Nexus™, Avaya Infinity, Avaya Experience Platform (On-Prem, Private Cloud, Public Cloud), Avaya Cloud Office, Avaya Aura, Avaya IP Office, Avaya Aura Private Cloud Avaya.com, No Jitter

[25] Company Name: Avaya Cloud Office (ACO)
    Website: https://www.avaya.com/en/products/cloud-office/
    Industry Category: UCaaS, Cloud Communications
    Product/Service Categories: Unified Communications as a Service (UCaaS): voice calling, team messaging, video meetings, conferencing, collaboration tools
    Key Specific Products & Services: Core, Advanced, Ultra plans; Avaya Cloud Office AI Assistant; Global Office; Avaya Cloud Office Rooms; integrations with Microsoft Teams, Google, Salesforce

[26] Company Name: Aviture
    Website: https://www.aviture.us.com
    Industry Category: Software Consulting and Custom Technology Solutions Aviture, CB Insights
    Product/Service Categories: Consulting & Assessment, Custom Development, User Engagement, System Integrations, Hybrid/Cloud Architecture, Data Engineering, Smart Technology & IoT Aviture What We Do, Aviture
    Key Specific Products & Services: Aim High (Air Force recruitment app), CQMAP (Contingency Quarters Management Accountability Platform), Decision Logic (restaurant management software partnership), Ascendon platform (customer engagement, developed for CSG) Aviture Blog, Aviture Aim High, Aviture Decision Logic

[27] Company Name: Azuga
    Website: https://www.azuga.com
    Industry Category: Fleet Management / Telematics
    Product/Service Categories: GPS fleet tracking, video telematics / dashcams, driver safety management, asset tracking, ELD compliance, field management software
    Key Specific Products & Services: SafetyCam Pro, SafetyCam Plus, Fleet Mobile app, Azuga eLogs (ELD), Driver Rewards, BasicFleet ($25/vehicle/mo), SafeFleet ($30/vehicle/mo), CompleteFleet ($35/vehicle/mo) Azuga.com, Tech.co review

[28] Company Name: BCN Telecom
    Website: https://www.bcntele.com
    Industry Category: Telecommunications, Managed Network and Technology Solutions
    Product/Service Categories: Network Connectivity (NaaS, SD-WAN, SASE), Cloud and UCaaS, Wireless, Voice Services
    Key Specific Products & Services: BCN Cloud Voice, BCNmobile app, BCN Direct Routing to Microsoft Teams, Dedicated Internet Access (DIA), Managed SD-WAN

[29] Company Name: Bigleaf Networks
    Website: https://www.bigleaf.net
    Industry Category: SD-WAN, Hybrid WAN, Network Optimization
    Product/Service Categories: Cloud-first SD-WAN services, Internet optimization, Wireless connectivity add-ons
    Key Specific Products & Services: Bigleaf Cloud Connect, Bigleaf Wireless Connect (20GB, 100GB, Unlimited plans), High Availability (Premier), Essential, Home Office tiers; symmetric speed tiers (75/75 Mbps to 3/3 Gbps); features: Dynamic QoS, Same-IP Failover, Intelligent Load Balancing

[30] Company Name: Blue Mantis
    Website: https://www.bluemantis.com/
    Industry Category: IT Services and IT Consulting (security-first focus on cloud, cybersecurity, managed services)
    Product/Service Categories: Managed Services, Cybersecurity & Risk Management, Cloud Services, Modern Workspace, Carrier Services & Networking, Strategic Advisory Services
    Key Specific Products & Services: Blue Mantis Protect (managed cybersecurity with 24/7 MDR, vulnerability management, dark web monitoring), SD-WAN, Unified Communications

[31] Company Name: Blue Team Alpha
    Website: https://blueteamalpha.com
    Industry Category: Cybersecurity
    Product/Service Categories: Incident Response, Managed SOC, Penetration Testing/Offensive Security, Advisory Services (vCISO), Forensics, Compliance
    Key Specific Products & Services: Emergency Incident Response, “No Brainer” IR Retainer, Managed Incident Response, Compromise Assessment, Penetration Testing, Vulnerability Assessment, vCISO, Ransomware Readiness Assessment, AI Managed Detection & Response, Memory Forensics, Risk Assessment, DFIR Services

[32] Company Name: BlueAlly
    Website: https://www.blueally.com
    Industry Category: IT Services and Consulting, focusing on cloud, security, telecom, and infrastructure BlueAlly website, LinkedIn
    Product/Service Categories: Cloud, Security/Compliance, Telecom & Broadband, Data Center, Networking, Application Development & Modernization, Collaboration, Automation, DevOps BlueAlly solutions
    Key Specific Products & Services: Infinera XTM Series, NetApp Classified Cloud, Juniper Networks infrastructure, Cisco SD-Access & Catalyst Center, Azure Adoption, Office 365 Migration, OneTrust Compliance, SOC 2 & PCI Compliance services BlueAlly pages, security, telecom

[33] Company Name: Bluebird Fiber
    Website: https://bluebirdfiber.com
    Industry Category: Telecommunications
    Product/Service Categories: Fiber internet, data transport (Ethernet, Wavelengths, Dark Fiber), Dedicated Internet Access (DIA), data center services, cloud connectivity
    Key Specific Products & Services: Dedicated Internet Access (DIA) up to 400 Gbps, Dark Fiber, Waves, Ethernet (E-Line: EPL, EVPL; E-LAN: EP-LAN, EVP-LAN), Colocation, Cloud Connect (220+ on-ramps)

[34] Company Name: Blueline Telecom
    Website: https://www.bluelinetelecom.com/
    Industry Category: Telecommunications
    Product/Service Categories: Voice and data services, UCaaS, CCaaS, SD-WAN
    Key Specific Products & Services: Hosted PBX, SIP Trunking, 4G LTE backup, Multi-Location solutions, Yealink phones (T57W, T54W, T53W, T48S, T46S, T42S, T33G)

[35] Company Name: Breezeline
    Website: https://www.breezeline.com/
    Industry Category: Telecommunications (Cable Broadband)
    Product/Service Categories: Residential: Internet, TV, Mobile, Home Phone, WiFi. Business: Fiber Internet, Hosted Voice, WiFi, Wireless Backup, Stream TV
    Key Specific Products & Services: Residential: Internet plans (100Mbps, 200Mbps, 500Mbps, 1Gig, fiber variants), Stream TV, Breezeline Mobile, WiFi Your Way. Business: Fiber Internet (100Mbps to 1Gbps), Hosted Voice Essential, WiFi Your Way for Business, Wireless Internet Backup

[36] Company Name: Bright Pattern
    Website: https://www.brightpattern.com
    Industry Category: Omnichannel Contact Center (CCaaS)
    Product/Service Categories: Cloud-based contact center software, AI-powered customer engagement, workforce management, outbound dialing
    Key Specific Products & Services: Bright Pattern Omnichannel Contact Center, AI Suite (Virtual Agent, AI Agents, Agent Assist, Transcription), Workforce Management, Predictive Dialer, Progressive Dialer, Bright Pattern Mobile App

[37] Company Name: brightfin
    Website: https://www.brightfin.com
    Industry Category: Telecom Expense Management (TEM), IT Expense Management, Technology Business Management (TBM)
    Product/Service Categories: Telecom Expense Management, Mobility Management, Cloud Expense Management, Managed Mobility Services, Digital Workplace Solutions
    Key Specific Products & Services: Brightfin Sync, Managed Mobility Services (MMS), Fixed Telecom Management, Mobile Management; support tiers: 12x5, 24x7x365

[38] Company Name: Broadvoice
    Website: https://www.broadvoice.com
    Industry Category: Telecommunications, UCaaS, CCaaS Broadvoice, Wikipedia
    Product/Service Categories: Cloud Communications: UCaaS, CCaaS, SIP Trunking, VoIP Phone Systems, Contact Center, Business Texting, Network Security Broadvoice, Wikipedia
    Key Specific Products & Services: b-hive (cloud PBX, virtual call center, UCaaS), Cloud PBX, SIP Trunking, Broadvoice CCaaS, Bubble Texting Broadvoice, Wikipedia, BPO page

[39] Company Name: BullsEye Telecom
    Website: https://www.lingo.com
    Industry Category: Telecommunications
    Product/Service Categories: Business Communications (UCaaS, CCaaS), Connectivity (Broadband, SD-WAN), Security (Managed Security, Cybersecurity), Managed Services (Tech Support, Cloud Contact Center)
    Key Specific Products & Services: Cloud Phone, Serenity Broadband, Insync Managed Security, Lingo Voice for Teams, Cloud Contact Center, Fire Life & Safety, Business Communication Platform

[40] Company Name: Calero
    Website: https://www.calero.com
    Industry Category: Technology Expense Management (TEM), focusing on telecom, mobility, SaaS, and market data Calero, LinkedIn
    Product/Service Categories: Expense management, inventory management, operations optimization for telecom, mobility, SaaS, market data Calero, LinkedIn
    Key Specific Products & Services: Telecom Expense Management, Managed Mobility Services, Market Data Management, SaaS/UCaaS Expense Management, Call Accounting, VeraSMART (eCAS), Calero Network Visualizer, Calero Benchmarking Calero, YouTube, LinkedIn, Jenne

[41] Company Name: CallMiner
    Website: https://callminer.com
    Industry Category: Customer Experience (CX) Automation, Conversation Intelligence
    Product/Service Categories: AI-powered conversation intelligence, CX automation platform analyzing voice and digital interactions (calls, chat, email, SMS, surveys, social media)
    Key Specific Products & Services: Eureka platform, CallMiner AI Assist, OmniAgent, Outreach, Solution Catalogue (230+ topics, 50+ scores); acquired integrations: VOCALLS (conversational AI), OrecX (call recording)

[42] Company Name: CallTower
    Website: https://www.calltower.com
    Industry Category: Cloud Communications, UCaaS, CCaaS
    Product/Service Categories: Unified Communications as a Service (UCaaS), Collaboration, Contact Center as a Service (CCaaS), Conversational AI (CAI), Managed Services
    Key Specific Products & Services: Microsoft Teams Operator Connect, MS Teams Direct Routing, GCC High Teams Direct Routing, Teams Mobile Dialer, Cisco Webex Calling/UCM/CCP, Zoom Phone, Zoom (BYOB), Five9, CallTower Connect, Microsoft 365

[43] Company Name: Cato Networks
    Website: https://www.catonetworks.com
    Industry Category: Cybersecurity, SASE, SD-WAN
    Product/Service Categories: SASE Cloud Platform, SD-WAN, Zero Trust Security (SSE), ZTNA, AI Security, Next Gen Networking
    Key Specific Products & Services: Cato SASE Cloud, Cato SSE 360, Cato Socket (edge SD-WAN appliance in branch, office, data center models), Cato Management Application, Cato AI Security, ZTNA client, Secure Browser, Clientless Portal Cato Networks, Cato SD-WAN, Wikipedia

[44] Company Name: CBTS
    Website: https://www.cbts.com
    Industry Category: IT Services and IT Consulting, Managed IT Services, Hybrid Cloud and Cybersecurity
    Product/Service Categories: Managed Hybrid Cloud, Cybersecurity, Unified Communications (UCaaS), SD-WAN/Network as a Service (NaaS), Application Modernization, Infrastructure as a Service (IaaS), Digital Workplace, Consulting
    Key Specific Products & Services: Managed Threat Detection and Response (MDR), Extended Detection and Response (XDR), Managed Firewall, Cloud Security, AWS Managed Services, Managed Azure, Disaster Recovery as a Service (DRaaS), Five9 CCaaS, Microsoft Teams Voice, Cisco Meraki NaaS, Vulnerability Management, Patch Management, DDoS Protection

[45] Company Name: Centersquare
    Website: https://www.csquare.com
    Industry Category: Data Centers
    Product/Service Categories: Colocation, Connectivity, Interconnection, Customer Care
    Key Specific Products & Services: IP Connect, Cloud Connect, Metro Connect, Secure Cabinets, Secure Cages, Centersquare Digital Exchange, Enterprise Storage

[46] Company Name: Channel Exchange
    Website: https://intelisys.com/channel-exchange/
    Industry Category: Cloud Services Distribution, SaaS Marketplace, Telecom/Connectivity
    Product/Service Categories: SaaS Marketplace Platform, Cloud Software Solutions, CSP Services
    Key Specific Products & Services: Exchange Elite Suite, Microsoft (Azure, M365, NCE), Exclaimer, LastPass, Bitdefender, Acronis, BitTitan, CloudSoda

[47] Company Name: China Mobile International Limited
    Website: https://www.cmi.chinamobile.com
    Industry Category: Telecommunications
    Product/Service Categories: Carrier services (Voice, SMS, Roaming, Data, China Access), Enterprise solutions (Connectivity, Cloud, IDC, IoT, ICT), Mobile/roaming services CMI website, iConnect, iSolutions
    Key Specific Products & Services: iConnect (carrier platform), iSolutions (enterprise platform), IPLC, IEPL, MPLS VPN, IP Transit, SD-WAN, Cloud Connect, IoT SIM, CDN, CloudSMS, CloudVoIP, AIHub, CMLink (consumer mobile brand) LinkedIn, iSolutions products

[48] Company Name: China Telecom Americas
    Website: https://www.ctamericas.com
    Industry Category: Telecommunications
    Product/Service Categories: Network connectivity (SD-WAN, IP VPN, Ethernet, Wavelength), Cloud and data center services (Colocation, Cloud Networking), Security (DDoS Mitigation), Content Delivery (CDN), Unified Communications
    Key Specific Products & Services: SD-WAN, Hybrid WAN, Elastic Connection Platform (ECP), Wavelength, Colocation, DDoS Mitigation Services, Internet Access, Ethernet, Cloud Services, IP Transit, IP VPN, Remote Access VPN

[49] Company Name: Cirion Technologies
    Website: https://www.ciriontechnologies.com
    Industry Category: Digital Infrastructure, Telecommunications
    Product/Service Categories: Connectivity (fiber network, IP, Ethernet, wavelength, dark fiber, cloud connect), Data Centers (colocation, interconnections, bare metal, private cloud), Network Services (MPLS/IP VPN, managed security, voice & collaboration), Cloud Infrastructure
    Key Specific Products & Services: TIER 1 Internet, DC Connect, CUR1 (Curitiba Data Center), dark fiber, wavelength, Ethernet, IP services, DDoS Mitigation, CDN, MPLS/IP VPN, VPLS, EVPL, bare metal, edge computing

[50] Company Name: Cisco Systems
    Website: https://www.cisco.com
    Industry Category: Networking, Security, AI Infrastructure
    Product/Service Categories: Networking (Access, Data Center, Cloud, WAN, Industrial IoT, Silicon, Optics), Security (Network, Cloud, User/Device), Observability, Collaboration; Services (Professional, AI-powered Support, Learning)
    Key Specific Products & Services: Products: Cisco Silicon One, Smart Switches, Hybrid Mesh Firewall, Cisco Duo, Cisco Firewalls, Cisco Hypershield, Cisco Identity Services Engine (ISE), Cisco Secure Access (SSE), Cisco XDR, Webex, Nexus Switches, Catalyst Switches, ASR Routers; Services: Cisco Smart Net Total Care, Cisco Solution Support, Cisco IQ, Cisco ThousandEyes

[51] Company Name: Claro Enterprise Solutions
    Website: https://www.usclaro.com
    Industry Category: Telecommunications and Managed IT Services
    Product/Service Categories: Infrastructure & Connectivity, Security, Managed Cloud Services, Digital Innovation & Hyper-Automation, Intelligent Insights & AI, Talent Extension
    Key Specific Products & Services: SD-WAN, SD-WAN SASE, MPLS, Ethernet, Business Internet, Enterprise Cloud Connect, UCaaS with Webex, Managed Detection and Response (MDR+), Shield Engine, Foundation Engine, Enterprise Claro Cloud, Microsoft Azure, Microsoft Office 365, IoT SIM, AI Video Analytics

[52] Company Name: Cloudflare
    Website: https://www.cloudflare.com/
    Industry Category: Cloud cybersecurity and connectivity cloud Cloudflare, Wikipedia, LinkedIn
    Product/Service Categories: Connectivity cloud, application services, SASE and workspace security, network services, developer platform Cloudflare About, Product Portfolio
    Key Specific Products & Services: Workers, Pages, R2, D1, Magic Transit, Magic WAN, Cloudflare One (SASE), DDoS protection, WAF, Spectrum, Stream, Images, AI Gateway, Vectorize Product Portfolio, Network Services, Developer Platform

[53] Company Name: CM.com
    Website: https://www.cm.com
    Industry Category: Conversational Commerce, CPaaS, Customer Engagement , LinkedIn
    Product/Service Categories: Communications Platform (CPaaS), Customer Engagement, Marketing Cloud, Service Cloud, Payments, Ticketing
    Key Specific Products & Services: HALO AI agents, Mobile Service Cloud, Mobile Marketing Cloud, One Time Password API, Business Messaging API, SIP Trunking, Generative AI, Customer Data Platform , CM.com

[54] Company Name: CMS360
    Website: https://cms360solutions.com
    Industry Category: Telecommunications Lifecycle Management
    Product/Service Categories: Lifecycle Management solutions: Telecom Expense Management, Enterprise Managed Mobility, Network Transformation, Professional Services
    Key Specific Products & Services: Enterprise Managed Mobility, Telecom Expense Management, Network Transformation, Professional Services

[55] Company Name: Coeo Solutions
    Website: https://www.coeosolutions.com/
    Industry Category: Telecommunications
    Product/Service Categories: Cloud Communications (UCaaS, CCaaS, Cloud Phone Systems), SIP Trunking, SD-WAN, Network Security, Managed Services, Internet Access, Session Border Controllers
    Key Specific Products & Services: SD-WAN, SIP Trunking, Cloud Phone Systems, UCaaS, CCaaS, MPLS, Free Network Assessment Tool

[56] Company Name: Cologix
    Website: https://cologix.com
    Industry Category: Data Centers, Digital Infrastructure
    Product/Service Categories: Colocation, Interconnection/Connectivity, Hyperscale Edge Data Centers
    Key Specific Products & Services: Scalelogix (hyperscale edge data centers), Access Marketplace (self-service network exchange), Cloud onramps (AWS Direct Connect, Google Cloud Interconnect, Microsoft Azure ExpressRoute, Oracle FastConnect, IBM Cloud)

[57] Company Name: Colt Technology Services
    Website: https://www.colt.net
    Industry Category: Telecommunications, Digital Infrastructure
    Product/Service Categories: Networking/Connectivity, Cloud, Voice & Collaboration, Security
    Key Specific Products & Services: Colt Network as a Service (NaaS), Colt Dark Fibre, Colt Ethernet Services, Colt IP VPN, SD-WAN & SASE, Colt Private Cloud, Colt Public Cloud (Cloud Manager), Colt Dedicated Cloud Access, Colt Rack Colocation

[58] Company Name: Comcast Business (including Masergy)
    Website: https://business.comcast.com
    Industry Category: Telecommunications, Networking, Cloud, Cybersecurity
    Product/Service Categories: Connectivity (Internet, Ethernet, Mobile), Communications (Voice, UCaaS), Networking (SD-WAN, SDN), Cybersecurity, Managed Services, Cloud Solutions
    Key Specific Products & Services: Internet tiers: Standard (300 Mbps), Performance (500 Mbps), Gigabit Extra (1.25 Gbps), 2 Gigabit (2 Gbps); SecurityEdge™; VoiceEdge, VoiceEdge Select™; ActiveCore; Masergy SD-WAN, UCaaS Services, SASE, ZTNA, MDR, SDN, CASB

[59] Company Name: CommandLink
    Website: https://commandlink.com
    Industry Category: Telecom Infrastructure, Networking, IT Operations (SD-WAN, UCaaS, SASE, Managed Security)
    Product/Service Categories: SaaS Platform, Bandwidth/Connectivity, SD-WAN, SASE, UCaaS/CCaaS, Managed Security, IT Service Management, Network Monitoring & Support
    Key Specific Products & Services: COMMAND|LINK Platform, Command|POD Support, Command|Monitor, Command|Alert, CCaaS|Link, UCaaS|Link, SDWAN|Link, Security|Link, PulseAI, Starlink Reseller Services, Tier 3 NOC/SOC (self-managed, co-managed, pro-managed)

[60] Company Name: CommunityWFM
    Website: https://www.communitywfm.com
    Industry Category: Contact Center Workforce Management (WFM)
    Product/Service Categories: Cloud-based workforce management software including forecasting, scheduling, intraday management, adherence tracking, time off management, agent self-service, mobile app, and integrations
    Key Specific Products & Services: CommunityWFM Essentials (for small/mid-size contact centers, <100 agents), CommunityWFM Enterprise (for large/multi-site, 101-10,000 agents), Community Everywhere (mobile app)

[61] Company Name: ConectUS Wireless
    Website: https://www.conectus.com/
    Industry Category: Telecommunications
    Product/Service Categories: Wireless mobility, IoT/M2M, business internet, business continuity, video conferencing, office phone systems, vehicle tracking
    Key Specific Products & Services: Verizon 5G Business Internet, Verizon Connect (fleet management), Verizon Cell Tower Technology (CTT), Smartphones, Tablets, Failover Routers, Jetpacks, MaaS360, Samsung Knox, Verizon IoT/M2M

[62] Company Name: Content Guru
    Website: https://www.contentguru.com
    Industry Category: Cloud CX (Contact Center as a Service, CCaaS)
    Product/Service Categories: Cloud contact center solutions, AI-powered CX, omni-channel customer engagement, customer data platforms
    Key Specific Products & Services: storm® (cloud CX platform), brain® (AI orchestration layer), Machine Agent™ (conversational chatbot)

[63] Company Name: Convergia
    Website: https://convergia.io/en-us/
    Industry Category: Telecommunications
    Product/Service Categories: Connectivity (wireline, wireless, cloud, SD-WAN), Voice/Telephony (SIP Trunking, UCaaS), IoT, Cybersecurity
    Key Specific Products & Services: Cloud Connect, SD-WAN Cisco, SD-WAN Fortinet, 3CX, SIM IoT, SIM BWB, Edge Netgate, Flex Multicloud, Flex Megaport Cloud Router, LEO Satellite High Speed Internet, SIP Trunking, Operator Connect for Microsoft Teams, Cloud Fax

[64] Company Name: CoreSite
    Website: https://www.coresite.com
    Industry Category: Data Centers / Colocation / Interconnection
    Product/Service Categories: Colocation, Interconnection, Cloud Connectivity
    Key Specific Products & Services: Open Cloud Exchange®, Retail Colocation (cabinets/racks), Cage Colocation, Private Suites (wholesale colocation), Remote Hands, MyCoreSite platform, Cloud Networks

[65] Company Name: Corporate IT Solutions (CIS)
    Website: https://cis.us
    Industry Category: Managed IT Services, Networking, SD-WAN, UCaaS
    Product/Service Categories: Field Services, Managed Services, Professional Services, Network Design & Procurement, Managed Aggregation
    Key Specific Products & Services: Managed SD-WAN (VeloCloud partner), SimpleVoIP (hosted VoIP)

[66] Company Name: Corvid Cyberdefense LLC
    Website: https://www.corvidcyberdefense.com/
    Industry Category: Cybersecurity
    Product/Service Categories: Managed Security Services (MSSP): Network security, Endpoint protection, Email security, SIEM, Employee training, Professional services (vCISO, assessments, penetration testing)
    Key Specific Products & Services: Haven™ platform (defense-in-depth solution with HavenPro, HavenNetwork, HavenEndpoint, HavenEmail); Technologies: Palo Alto Networks FW, CylancePROTECT/OPTICS (or SentinelOne), Mimecast; Service tiers: Haven™, Haven Cloud, Haven SecureAdvisor; Compliance: CMMC, NIST

[67] Company Name: Cox Business
    Website: https://www.cox.com/business/home.html
    Industry Category: Telecommunications
    Product/Service Categories: Business Internet, Phone & Unified Communications, Managed Services, Networking, Cloud Solutions, Cybersecurity, Business TV
    Key Specific Products & Services: Internet Starter (300 Mbps), Internet Essential (500 Mbps), Internet Preferred (1 Gbps), Internet Ultimate (2 Gbps), Cox Business Connect with RingCentral, VoiceManager, Complete Care (cybersecurity), Complete Reliability (remote IT support), Internet Backup (4G LTE), Managed WiFi, Enterprise Internet (up to 400Gbps)

[68] Company Name: Crown Castle Inc.
    Website: https://www.crowncastle.com
    Industry Category: Telecommunications infrastructure (REIT)
    Product/Service Categories: Shared communications infrastructure: towers, small cells, fiber solutions
    Key Specific Products & Services: Cell tower leasing (~40,000 towers), small cell nodes (~115,000), fiber route miles (~85,000 miles); services include site development, network design, construction, 24/7 monitoring; note: fiber and small cells divestiture announced March 2025, expected close H1 2026 (Crown Castle site, Wikipedia, Zayo announcement)

[69] Company Name: CyberMaxx
    Website: https://www.cybermaxx.com
    Industry Category: Cybersecurity
    Product/Service Categories: Managed Detection and Response (MDR), Offensive Security, Threat Hunting, Managed Email Security, Cyber Resiliency Services (Pen Testing, Risk Assessments, etc.)
    Key Specific Products & Services: MaxxMDR (Core, Advanced, Elite tiers)

[70] Company Name: Cytellix Corporation
    Website: https://www.cytellix.com/
    Industry Category: Cybersecurity
    Product/Service Categories: Managed Cybersecurity SaaS (GRC, XDR/MDR, Risk Management, Compliance)
    Key Specific Products & Services: Cytellix Cyber Watch Platform (CCWP®), Cytellix Cyber Watch Portal (C-CWP™)

[71] Company Name: Data Canopy
    Website: https://datacanopy.com
    Industry Category: Data Center Infrastructure (Cloud, Colocation)
    Product/Service Categories: Cloud Solutions (Hybrid, Private, Multi-Cloud), Colocation, Disaster Recovery, Connectivity
    Key Specific Products & Services: Canopy Connect (multi-cloud connectivity), Private Cloud, Virtual Private Cloud, Cloud Canopy™ (connectivity suite), DRaaS (with snapshot, cloning, replication; customizable RPO/RTO), High-Density GPU Colocation

[72] Company Name: DataBank
    Website: https://www.databank.com
    Industry Category: Data Centers, Colocation, Cloud Infrastructure
    Product/Service Categories: Colocation, Interconnection, Cloud, Bare Metal, Managed Services
    Key Specific Products & Services: Enterprise Cloud, FedRAMP Cloud, Multi-Tenant Cloud, Private Cloud, High Density Colocation, Cabinets/Cages/Suites, Remote Hands, Cross Connects, Managed Security, Disaster Recovery-as-a-Service (DRaaS), SAN Storage, Object Storage

[73] Company Name: Dataprise
    Website: https://www.dataprise.com
    Industry Category: Managed IT Services
    Product/Service Categories: Fully Managed IT, Co-Managed IT, Managed Cybersecurity, Disaster Recovery, Cloud Management, IT Infrastructure, Mobility Management, End User Support, IT Consulting
    Key Specific Products & Services: IT Foundation, IT Fortify, IT Comply managed IT plans; Fully Managed Cloud; DRaaS

[74] Company Name: Deft (a Summit company)
    Website: https://deft.com
    Industry Category: Cloud Computing, Data Centers, Managed IT Services Summit Acquires Deft, GlobeNewswire
    Product/Service Categories: Colocation, Managed Cloud, Network Services, Dedicated Servers, Disaster Recovery, Application Hosting deft.com
    Key Specific Products & Services: Private Cloud, Mac Hosting, Dedicated GPU Servers, QuickBooks Hosting, Sage Hosting, Desktop as a Service (DaaS) deft.com

[75] Company Name: Dialpad
    Website: https://www.dialpad.com/
    Industry Category: UCaaS, CCaaS, Cloud Communications Dialpad, Contrary Research, SalesHive
    Product/Service Categories: Unified business communications (voice, messaging, video meetings), AI-powered contact center, sales engagement Dialpad Products, Dialpad Homepage
    Key Specific Products & Services: Dialpad Connect, Dialpad Meetings, Dialpad Support (Ai Contact Center), Dialpad Sell (Ai Sales), Dialpad WFM (workforce management), Dialpad Ai (including DialpadGPT), AI Agent; tiers: Standard ($15/user/mo), Pro ($25/user/mo), Enterprise (custom) SalesHive, Dialpad Products

[76] Company Name: Digital Realty
    Website: https://www.digitalrealty.com
    Industry Category: Data Center Infrastructure (REIT)
    Product/Service Categories: Data centers, Colocation, Interconnection solutions
    Key Specific Products & Services: PlatformDIGITAL®, ServiceFabric®, High-Density Colocation

[77] Company Name: DIRECTV FOR BUSINESS
    Website: https://www.directv.com/forbusiness/
    Industry Category: Telecommunications (Satellite and Streaming TV)
    Product/Service Categories: Commercial TV services, streaming TV, pay-per-view, premium sports, music programming
    Key Specific Products & Services: BUSINESS SELECT™ PACK (95+ channels), BUSINESS ENTERTAINMENT™ (105+ channels), BUSINESS XTRA PACK (185+ channels), COMMERCIAL BASIC PLUS (45+ channels), COMMERCIAL ENTERTAINMENT™ PACK, COMMERCIAL XTRA™ PACK, Music Choice® (84+ channels), NFL Sunday Ticket, NCAA Sports, PREMIUM SPORTS ADD-ONS

[78] Company Name: Dobson Fiber
    Website: https://www.dobson.net
    Industry Category: Telecommunications (Fiber Optic Internet)
    Product/Service Categories: Residential Fiber Internet, Business Fiber Internet, Voice Services, Cloud Solutions, Wholesale Connectivity
    Key Specific Products & Services: Gig Speeds (up to 1 Gbps+ symmetrical), Up to 10 Gbps, eero WiFi 7 Router (residential), eero mesh WiFi for business, Fiber-to-the-Home (FTTH), Fiber-to-the-Business

[79] Company Name: Dynascale
    Website: https://www.dynascale.com
    Industry Category: IT Services and IT Consulting, Cloud Infrastructure
    Product/Service Categories: Managed Private Cloud, Hybrid Cloud, Disaster Recovery (DRaaS), Zero Trust Security & Compliance, Resilient IT, Data Center Services, Cloud Modernization
    Key Specific Products & Services: Dedicated DSU v6 platform, Enterprise KVM Hypervisor, CrowdStrike MDR + DUO 2FA security suite, Veeam backups

[80] Company Name: EarthLink
    Website: https://www.earthlink.net
    Industry Category: Telecommunications (Internet Service Provider)
    Product/Service Categories: High-speed Internet (Fiber, 5G Home, Fixed Wireless, DSL), Web Hosting, Cybersecurity, VoIP, Cloud Computing, Managed Network & IT Services
    Key Specific Products & Services: Residential: Fiber 100, Fiber 300, Fiber 1 Gig, Fiber 5 Gig, Unlimited 5G Home Internet, 100 GB Fixed Wireless; Business: Dedicated Fiber (up to 10 Gbps), Business Broadband Fiber, Fixed Wireless, bundles with SEO, Reputation Manager

[81] Company Name: Effectual
    Website: https://effectual.ai
    Industry Category: Cloud Computing, IT Services
    Product/Service Categories: Cloud Migration, Cloud Management, Application Modernization, Data & Analytics, AI/ML, Digital Innovation
    Key Specific Products & Services: Modernization Engineers™, CloudOps (24x7 support), Data Center Evacuation, Workload Migration, Database Migration, Mainframe Migration, Windows Workload to AWS, AI Accelerators, AWS Premier Tier Services Partner, AWS Migration Acceleration Program (MAP) Ambassadors

[82] Company Name: EPIC iO Technologies
    Website: https://www.epicio.com/
    Industry Category: AIoT and Wireless Connectivity
    Product/Service Categories: Wireless Connectivity (4G/5G LTE, Satellite/Starlink, Private LTE, POTS Replacement, Failover, Bonded), AI + IoT Platforms and Security Solutions (Video Surveillance, Site Security, Environmental Monitoring, License Plate Recognition, Fire/Vape Detection)
    Key Specific Products & Services: DeepInsights™ (AI platform), Starlink, 4G/5G LTE Services, Private LTE, VMS, Universal IoT Gateway (UiG), Mobile Security Unit

[83] Company Name: Equinix
    Website: https://www.equinix.com
    Industry Category: Digital Infrastructure, Data Centers
    Product/Service Categories: Colocation, Interconnection, Data Center Services, Digital Services, Managed Infrastructure
    Key Specific Products & Services: Equinix Fabric, Secure Cabinet Express, Custom Secure Cabinets, Private Cage, Equinix Internet Exchange, Cross Connects, Smart Hands, Network Edge, Equinix Fabric Cloud Router

[84] Company Name: eSentire
    Website: https://www.esentire.com
    Industry Category: Cybersecurity
    Product/Service Categories: Managed Detection and Response (MDR), Continuous Threat Exposure Management (CTEM), Digital Forensics and Incident Response (DFIR), Threat Hunting, SOC-as-a-Service
    Key Specific Products & Services: Atlas Essentials, Atlas Advanced, Atlas Complete (MDR tiers); Atlas XDR Platform, Atlas AI; Managed Vulnerability Service; Threat Response Unit (TRU)

[85] Company Name: eSure.AI
    Website: https://esure.ai/
    Industry Category: Cybersecurity & Cyber Insurance
    Product/Service Categories: AI-powered endpoint protection, 24/7 SOC monitoring, cyber liability insurance
    Key Specific Products & Services: Home Protection, Home Pro Protection, Business Protection, Executive & VIP Protection

[86] Company Name: Everstream
    Website: https://everstream.net/
    Industry Category: Telecommunications (Business Fiber Networks)
    Product/Service Categories: Business fiber connectivity: Dedicated Internet Access, Ethernet/WAN, Dark Fiber, Data Center solutions
    Key Specific Products & Services: Dedicated Internet Access (DIA), Point-to-Point Ethernet, Point-to-MultiPoint Ethernet, Dark Fiber, Managed Wave, D-DWDM, VDIA, Software Defined WAN (SD-WAN), Managed Services

[87] Company Name: Evocative
    Website: https://evocative.com
    Industry Category: Data Centers, Cloud Infrastructure
    Product/Service Categories: Colocation, Bare Metal Servers, Network Services, Cloud Connectivity, Managed Services (Network, IaaS, Professional)
    Key Specific Products & Services: Evocative Metal (bare metal: Small, Medium, Large configs), Premium Colocation Cabinets, Private Cages & Suites, Managed Network, Managed IaaS, Managed NGFW/IDS/IPS/SD-WAN/VPN

[88] Company Name: EXA Infrastructure
    Website: https://exainfra.net
    Industry Category: Digital Infrastructure, Telecommunications
    Product/Service Categories: Infrastructure (dark fibre, metro networks), Transport (wavelength, spectrum, Ethernet), Colocation, Technical Services
    Key Specific Products & Services: Managed Fibre Network (MFN), Wavelength Services (10G-400G), Optical Spectrum Services, Ethernet Services (50M-3G), EXA Express (ultra-low latency transatlantic), EXA Financial Network (EFN)

[89] Company Name: Expedient
    Website: https://expedient.com/
    Industry Category: Cloud Computing, Data Centers, Managed Infrastructure Services
    Product/Service Categories: Cloud Services (Public, Private, Hybrid), Colocation, Disaster Recovery, Managed Services, Edge Computing, AI Infrastructure
    Key Specific Products & Services: Expedient Enterprise Cloud (EEC), Expedient AI CTRL Platform, Expedient Edge, Cloud File Storage

[90] Company Name: Expereo
    Website: https://www.expereo.com
    Industry Category: Networking and Connectivity (SD-WAN, SASE, Global Internet)
    Product/Service Categories: Managed SD-WAN, SASE, Global Internet, Enhanced Internet, Cloud Connectivity
    Key Specific Products & Services: expereoOne platform, Fixed Internet, Dedicated Internet (DIA), Broadband Internet, Fixed Wireless Access, Low Earth Orbit, Enhanced IP Core

[91] Company Name: Fatbeam
    Website: https://www.fatbeam.com
    Industry Category: Telecommunications
    Product/Service Categories: Fiber-based networking, broadband internet access, connectivity solutions
    Key Specific Products & Services: Dedicated Internet Access (DIA), Dark Fiber, Ethernet Virtual Private Line (EVPL), Wide Area Network (WAN), Fiber to the Home (residential tiers: 250 Mbps, 500 Mbps, 1 Gig, 2 Gig), Wireless Backup, Managed Wi-Fi (FatbeamBiz), Tower Infrastructure

[92] Company Name: FiberLight, LLC
    Website: https://www.fiberlight.com
    Industry Category: Telecommunications, Fiber Optic Infrastructure
    Product/Service Categories: Dark Fiber, Lit Fiber Services (Ethernet, Wavelengths, Dedicated Internet Access, Cloud Connect, Data Center Connectivity, Wireless Backhaul)
    Key Specific Products & Services: Dedicated Internet Access, Ethernet (1-100 Gbps), Wavelengths, Cloud Connect, Data Center Connectivity, Dark Fiber, Wireless Backhaul, 100G Long-Haul, Internet Protocol services

[93] Company Name: Fidium
    Website: https://www.fidiumfiber.com
    Industry Category: Telecommunications, Fiber Broadband
    Product/Service Categories: Fiber Internet (Residential, Business, Wholesale), Network Services, Transport Solutions
    Key Specific Products & Services: Residential: Basic Fiber (100 Mbps, $30/mo), Superior Fiber + WiFi (1 Gig, $50/mo), Best Fiber + Extended WiFi (2 Gig, $60/mo); Business: Fiber Internet up to 100 Gbps, Security, Voice, Collaboration; Wholesale: Dark Fiber, Wavelengths (up to 400Gbps), Switched Ethernet, DIA, Cell Tower Backhaul, Data Center Interconnect; Fidium Fiber Pro for small businesses

[94] Company Name: First Orion
    Website: https://firstorion.com
    Industry Category: Telecommunications
    Product/Service Categories: Branded calling and communication solutions, call protection and fraud prevention
    Key Specific Products & Services: INFORM®, ENRICH, AFFIRM®, SENTRY®, SCAM LIKELY, Protect+ Risk Detection, Next-Gen Global Exchange firstorion.com, LinkedIn, BuiltIn

[95] Company Name: FirstComm
    Website: https://www.firstcomm.com
    Industry Category: Telecommunications, UCaaS, SD-WAN, Managed Security
    Product/Service Categories: Cloud Communications (UCaaS), Business Connectivity (fiber, SD-WAN, internet), Managed Network Security, Professional & Managed Services, Data Center & Colocation
    Key Specific Products & Services: AscendOne (UCaaS/CCaaS suite), FusionOne (5G SD-WAN), OneSuite (unified platform), UC Teams (Teams integration)

[96] Company Name: FirstLight Fiber
    Website: https://www.firstlight.net
    Industry Category: Telecommunications, Fiber Optic Networks
    Product/Service Categories: Fiber Network Connectivity, SD-WAN/SASE, Unified Communications, Cloud & Data Center (Colocation), Security
    Key Specific Products & Services: Dedicated Internet Access, Wavelength Services up to 800G, Ethernet, Dark Fiber, SIP Trunks, Managed Services, Cloud Backup & DR, Cloud Connectivity, Disaster Recovery, IaaS, DRaaS

[97] Company Name: Five9
    Website: https://www.five9.com
    Industry Category: CCaaS (Contact Center as a Service)
    Product/Service Categories: Cloud contact center software, AI-powered CX platform, workforce engagement management (WEM), omnichannel routing, analytics
    Key Specific Products & Services: Intelligent CX Platform, Five9 Genius AI, AI Agents, Agent Assist, Digital ($119/user/mo), Core ($159/user/mo), Premium/Optimum/Ultimate (custom pricing)

[98] Company Name: Flexential
    Website: https://www.flexential.com/
    Industry Category: Hybrid IT Infrastructure, Data Centers
    Product/Service Categories: Colocation, Interconnection, Cloud, Data Protection, Managed Services, Professional Services
    Key Specific Products & Services: FlexAnywhere® Platform, high-density colocation (80+ kW/cabinet), cabinets/cages/suites, private cloud connections (AWS, Azure, Google Cloud, Oracle), Backup as a Service, Disaster Recovery as a Service, Managed Infrastructure Services, Managed Security

[99] Company Name: For2Fi
    Website: https://www.for2fi.com
    Industry Category: Telecom, Wireless WAN, SD-WAN
    Product/Service Categories: Managed 5G/4G/LTE connectivity, IoT solutions, Wireless internet (primary/backup)
    Key Specific Products & Services: For2Fi Metered/Pooled (2GB, 5GB, 10GB), For2Fi+ Unlimited Data Plans, For2Fi+ High-Capacity (200GB, 300GB), Pooled Data Plans; Hardware: Digi EX50, Ericsson E300 Series, L950 LTE Adapter, W1850 5G Adapter, Cradlepoint routers, MIMO LTE Antenna, THOR92PP

[100] Company Name: Frontier Communications
    Website: https://frontier.com
    Industry Category: Telecommunications
    Product/Service Categories: Broadband Internet (Fiber, DSL), TV & Streaming, Home Phone, Business Internet
    Key Specific Products & Services: Fiber 200, Fiber 500, Fiber 1 Gig, Fiber 2 Gig, Fiber 5 Gig, Fiber 7 Gig, Business Fiber 500M, Business Fiber 1 Gig, Business Fiber 2 Gig, Business Fiber 5 Gig, YouTube TV bundles, Home Phone

[101] Company Name: Fusion Connect
    Website: https://www.fusionconnect.com
    Industry Category: Cloud Communications, UCaaS, Managed Connectivity, SD-WAN , LinkedIn
    Product/Service Categories: Communications (UCaaS, VoIP, CCaaS), Connectivity (SD-WAN, Internet Access), Microsoft Services , Connectivity
    Key Specific Products & Services: Managed SD-WAN, Dedicated Internet Access (DIA), Broadband Internet, Hosted Voice, Microsoft Teams Calling, Cisco Webex Calling, Contact Center (CCaaS), Starlink Satellite Internet, Managed WiFi, SIP Trunks, POTS Replacement , Services

[102] Company Name: Genesys Cloud Services, Inc.
    Website: https://www.genesys.com
    Industry Category: Customer Experience (CX) / Contact Center as a Service (CCaaS) Genesys.com, Wikipedia)
    Product/Service Categories: Cloud contact center software, AI-powered experience orchestration, workforce engagement management, omnichannel customer engagement Genesys.com, Genesys Products, Wikipedia)
    Key Specific Products & Services: Genesys Cloud CX, Genesys Cloud EX, Genesys Multicloud CX, Genesys DX Wikipedia), Genesys.com

[103] Company Name: Glia
    Website: https://www.glia.com/
    Industry Category: Fintech, Banking AI, Digital Customer Service
    Product/Service Categories: AI-powered customer interaction platform (voice, digital, self-service, agent tools), support services
    Key Specific Products & Services: Glia AI (Glia Banker, Glia CoPilot, Glia Analyst), Glia Voice, Glia Digital, White Glove support tiers (White Glove, White Glove AI, AI Plus, AI Premier)

[104] Company Name: Globalgig
    Website: https://globalgig.com
    Industry Category: Telecommunications
    Product/Service Categories: Managed network services, SD-WAN, wireless connectivity, internet access, UCaaS, SASE, mobility/IoT
    Key Specific Products & Services: Broadband Internet, Wireless Broadband, Dedicated Internet Access (DIA), IP Transit, Wireless Failover, Wireless WAN, Wireless Out-of-Band Management (OOBM), Private LTE/5G, IoT Connectivity, SIM Management, Managed SASE, Orchestra platform

[105] Company Name: GoExceed
    Website: https://goexceed.com/
    Industry Category: Telecom, Enterprise Mobility Management, Wireless Expense Management
    Product/Service Categories: Wireless Expense Management (WEM), Managed Mobility Services, Mobile Device Management, IT Asset Management, API Integrations
    Key Specific Products & Services: Solve(X) (AI-powered expense management platform with ADAMM), OneSYNC (API integration platform), Depot (inventory system), Audit (bill auditing), Mobile Care (support services), Inventory, Mobile Intel (analytics), Carrier Request (ordering system) GoExceed.com, LinkedIn

[106] Company Name: GoTo Technologies USA, Inc. (GoTo)
    Website: https://www.goto.com
    Industry Category: SaaS, UCaaS, IT Management & Support
    Product/Service Categories: Cloud Communications (UCaaS, CCaaS), Cloud Collaboration, Unified Endpoint Management & Remote Support
    Key Specific Products & Services: GoTo Connect (Phone System, CX, Contact Center), GoTo Meeting, GoTo Webinar, GoTo Training, LogMeIn Resolve, LogMeIn Rescue, LogMeIn Central, LogMeIn Pro, LogMeIn Miradore, GoToMyPC, Grasshopper

[107] Company Name: Granite Telecommunications
    Website: https://www.granitenet.com
    Industry Category: Telecommunications
    Product/Service Categories: Voice, Network/Access, Mobility, Cloud Services, Managed Services
    Key Specific Products & Services: Granite360 (NOCExpress, TechExpress), Granite Labs (FlexEdge, EPIK, edgeboot), EPIK POTS Replacement, VoIP & Cloud Phone Systems, SIP Trunking, SD-WAN, SASE, Private IP (PIP) with Bronze/Silver/Gold/Platinum tiers, Dedicated Ethernet, Starlink, Fixed Wireless Access

[108] Company Name: GTT Communications, Inc.
    Website: https://www.gtt.net
    Industry Category: Networking and Security as a Service (NaaS, SECaaS), Telecom
    Product/Service Categories: Secure Networking (SASE, SD-WAN, Cloud Security), Managed Networking (Internet, WAN, Cloud Connect), Voice (SIP Trunking, Cloud Phone), Professional Services
    Key Specific Products & Services: GTT Envision, GTT EnvisionDX, Managed SD-WAN, SASE: Secure Connect, SIP Trunking, Cloud Phone Direct, Virtual Voice Network, Zero Trust Network Access (ZTNA), Dedicated Internet, MPLS

[109] Company Name: Halo Global
    Website: https://haloglobal.net/
    Industry Category: Telecommunications (SD-WAN, SASE, Networking)
    Product/Service Categories: Managed SD-WAN, SASE/SSE, Global Connectivity, Network Security, Next-Gen Firewall
    Key Specific Products & Services: Managed SD-WAN (VeloCloud/VMware, Fortinet, Aruba), Managed SASE, Halo Connect (global underlay circuits), Halo Remote (remote connectivity), Cloud Connectivity (SaaS/IaaS), Halo SMB (with Netskope), SSE (top providers incl. Netskope), Next-Gen Firewall

[110] Company Name: Hiya
    Website: https://www.hiya.com
    Industry Category: Voice security, telecommunications, cybersecurity
    Product/Service Categories: Spam and fraud protection, branded calling, caller ID, AI voice intelligence
    Key Specific Products & Services: Hiya Protect, Hiya Connect (Branded Call), Hiya AI Phone, Hiya Spam Blocker app, Number Registration, Caller Reputation, Smart Call

[111] Company Name: Infobip
    Website: https://www.infobip.com
    Industry Category: Communications Platform as a Service (CPaaS) , Gartner
    Product/Service Categories: Omnichannel customer engagement, messaging (SMS, WhatsApp, RCS, Email, Voice), contact center, AI agents and chatbots, customer data platforms, journey automation, analytics , Infobip
    Key Specific Products & Services: AgentOS (including Inbox, Automation Studio/Journeys/Chatbots, AI Agents, Customer Profiles, Insights and Analytics), CPaaS X, Network APIs, Authentication, WhatsApp Business, Viber, Zalo, RCS Business, Inbox Copilot , Infobip Homepage, Infobip Company

[112] Company Name: Infrastructure Networks (iNet)
    Website: https://inetlte.com
    Industry Category: Telecommunications, Critical Infrastructure (Energy, Oil & Gas)
    Product/Service Categories: Wireless Connectivity, Managed Services, IIoT Integration, SD-WAN, Private LTE Networks
    Key Specific Products & Services: Wireless Infrastructure-as-a-Service (W-IaaS), iNPath SD-WAN (built on Juniper 128T), Private 4G/5G LTE, Satellite (LEO/GEO), Remote Monitoring & Management

[113] Company Name: IntelePeer
    Website: https://intelepeer.ai
    Industry Category: Telecom, CPaaS, Conversational AI
    Product/Service Categories: Communications Automation Platform (CAP), Omnichannel Communications (voice, SMS, messaging), AI and Automation, Analytics, APIs and Integrations
    Key Specific Products & Services: SmartFlows, SmartEngage, SmartAgent, Atmosphere CPaaS platform (including Atmosphere Voice, Atmosphere Messaging, Atmosphere Insights, Atmosphere Managed Solutions), SuperRegistry, AppWorx

[114] Company Name: Intermedia
    Website: https://www.intermedia.com
    Industry Category: Cloud Communications, UCaaS
    Product/Service Categories: Unified Communications (UCaaS), Contact Center (CCaaS), Business Email & Productivity, File Sharing & Backup, Security & Compliance, VoIP, Video Conferencing
    Key Specific Products & Services: Intermedia Unite (Pro $27.99/user/mo, Enterprise $32.99/user/mo), Intermedia Contact Center, Intermedia Archiving, SecuriSync, AI Call Recap, AI Agent Assist, AI Meeting Recap Intermedia.com, LinkedIn

[115] Company Name: Intrado
    Website: https://www.intrado.com
    Industry Category: Public Safety and Emergency Communications
    Product/Service Categories: PSAP call handling, Enterprise E911 & safety, NG911 networks, GIS & location services, Service provider 911 solutions, Incident management, AI-enhanced emergency tools
    Key Specific Products & Services: VIPER (as a Service, On Prem, NextGen), Intrado OneAlert, Emergency Routing Service (ERS), Emergency Gateway, NG Nexus, V911, Spatial Engine, ECaTS Analytics, Emergency Data Broker, Text-to-911

[116] Company Name: Ionstream
    Website: https://www.ionstream.ai
    Industry Category: Cloud Computing, AI Infrastructure , Data Center Dynamics
    Product/Service Categories: GPU Cloud Services, AI Infrastructure as a Service, High-Performance Computing (HPC)
    Key Specific Products & Services: NVIDIA B200, H200, L40S GPUs; AMD Instinct MI300X; NVIDIA DGX systems, H100; on-demand rentals from $2.40/hr, pay-as-you-go , DCD, Engineering.com

[117] Company Name: iTel Networks Inc.
    Website: https://itel.com
    Industry Category: Telecommunications
    Product/Service Categories: Business Internet, SD-WAN, Voice, Managed Network Services
    Key Specific Products & Services: iLINK (SD-WAN, 5G, LEO Satellite portable network), Managed Connectivity, Managed Router, Managed Cloud Connect, Managed Network Security, DDoS Protection, Fibre Internet, SIP Trunks, Hosted PBX

[118] Company Name: KORE Wireless
    Website: https://www.korewireless.com
    Industry Category: IoT Connectivity and Solutions
    Product/Service Categories: IoT connectivity (cellular, LPWAN, satellite), managed services, device management, SIM/eSIM solutions, platforms
    Key Specific Products & Services: KORE Super SIM™, KORE OmniSIM™, ConnectivityPro, LP Hub, Connected Health Telemetry Solution (CHTS), KORE Wireless Business Internet, Position Logic, KORE One®

[119] Company Name: Kore.ai
    Website: https://kore.ai/
    Industry Category: Enterprise AI, Conversational AI
    Product/Service Categories: Agentic AI applications for customer service, employee productivity (AI for Work, AI for Service), and process automation (AI for Process)
    Key Specific Products & Services: Automation AI, Search AI, Contact Center AI, Agent AI, Quality AI; XO Platform; Agent Platform

[120] Company Name: Level AI
    Website: https://thelevel.ai
    Industry Category: Customer Experience (CX), Contact Center AI
    Product/Service Categories: AI Virtual Agents, Automated Quality Assurance, Agent Assist and Coaching, Voice of the Customer Insights, Business Intelligence
    Key Specific Products & Services: Naviant (AI Virtual Agent), QA-GPT, VoC Insights, AgentGPT, Agent Assist

[121] Company Name: Lightpath
    Website: https://lightpathfiber.com
    Industry Category: Telecommunications
    Product/Service Categories: Fiber connectivity, Ethernet services, Wavelength services, Dark Fiber, Private Networks, Voice & Conferencing, Managed SD-WAN, Managed Security, Managed WiFi
    Key Specific Products & Services: Dedicated Fiber Internet Access (up to 100 Gbps), Ethernet (E-Line, E-LAN, V-Line, 20 Mbps to 100 Gbps), Wavelengths (1G-800G), LP FlexNet Managed SD-WAN (Versa, Meraki), LP DDoS Shield (Radware)

[122] Company Name: Lingo
    Website: https://www.lingo.com
    Industry Category: Telecommunications, UCaaS, SD-WAN, Cloud Communications
    Product/Service Categories: Business Phone Systems (UCaaS), Broadband Connectivity, Managed Security, SD-WAN, Cloud Contact Center (CCaaS), Managed Wi-Fi, POTS Replacement
    Key Specific Products & Services: Lingo Voice for Teams, Cloud Phone (Hosted PBX, starting at $18.99/user/mo), Insync (Managed Security powered by Sophos), Serenity Broadband, Lingo Contact Center ($22.99), Fire Life & Safety, Lingo Unlimited ($19.95/mo), Lingo Essential ($9.95/mo)

[123] Company Name: Liquid Web
    Website: https://www.liquidweb.com
    Industry Category: Cloud Computing, Web Hosting
    Product/Service Categories: Dedicated Servers, Cloud Hosting, VPS Hosting, Managed WordPress Hosting, Ecommerce Hosting (Magento, WooCommerce), Compliance Hosting (HIPAA, PCI), Reseller Hosting
    Key Specific Products & Services: Cloud VPS (starting at $5/mo with various compute/memory/CPU optimized tiers), Managed Dedicated Servers (e.g., Intel 6226R 16-core, Intel 6526Y NVMe tiers), ServerSecure, Cloud Servers

[124] Company Name: Logicworks
    Website: https://rapidscale.net/
    Industry Category: Cloud Computing Wikipedia, Cox Newsroom
    Product/Service Categories: Cloud Migration & Modernization, Managed Cloud Services (AWS & Azure), Compliance & Security, Cloud Cost Management CXponent
    Key Specific Products & Services: Cloud Reliability Platform, Cloud Reliability Assessments, tiered Managed Cloud Services, IaC modules, Compliance-as-Code CXponent

[125] Company Name: LOGIX Fiber Networks
    Website: https://logix.com
    Industry Category: Telecommunications
    Product/Service Categories: Fiber Internet, Ethernet, Wavelength Services, Business Voice (Cloud and Trunks), Cloud Connect, SD-WAN/SASE, Data Center Connectivity, Wholesale Carrier Services (Dark Fiber, Metro Ethernet, Managed Wavelength, Wireless Backhaul)
    Key Specific Products & Services: Dedicated Internet Access (100 Mbps to 10 Gbps), Business Ethernet (100 Mbps to 10 Gbps), Business Wavelength (up to 100 Gbps), Business Voice Cloud (10/15/25 seat bundles with 500 MB/1 GB Internet), LOGIX SASE (with SD-WAN), Solution Bundles (Voice Cloud + Internet, SD-WAN Secure + Internet), Managed Wavelength, Dark Fiber, Metro Ethernet, Fiber Internet (10 Mbps to 100 Gbps symmetrical)

[126] Company Name: LS Networks (LSN)
    Website: https://www.lsnetworks.net/
    Industry Category: Telecommunications
    Product/Service Categories: Fiber connectivity, Data services, UCaaS, SIP Trunking, Colocation LS Networks website, Allied battlecard
    Key Specific Products & Services: AspenUC (UCaaS platform), Dedicated Internet, Business Ethernet, SIP Trunking LS Networks website, Allied battlecard

[127] Company Name: Lumen Technologies
    Website: https://www.lumen.com
    Industry Category: Telecommunications, Networking, Edge Cloud, AI Infrastructure
    Product/Service Categories: Infrastructure (fiber, colocation, wavelengths), Connectivity (internet, Ethernet, SD-WAN), Cybersecurity (DDoS, SASE), Communications (cloud voice, UC&C)
    Key Specific Products & Services: Dedicated Internet Access (DIA), Internet On-Demand, Lumen SD-WAN, SASE, Lumen Cloud Voice, Voice Complete, Wavelengths, Dark Fiber, Multi-Cloud Gateway, Contact Center, Vyvx Broadcast Solutions Lumen homepage, Product Finder, Wikipedia

[128] Company Name: Magna5
    Website: https://www.magna5.com
    Industry Category: Managed IT Services and Cybersecurity
    Product/Service Categories: Managed IT Services, Cybersecurity, Cloud Services, Compliance Services, IT Consulting & Procurement
    Key Specific Products & Services: Pentaguard suite, Pentaguard AI, SD-WAN and managed network, Network and server management, Co-managed IT, DevOps/DevSecOps, Unified communications, Data backup and disaster recovery, 24/7 help desk

[129] Company Name: Marco Technologies
    Website: https://www.marconet.com
    Industry Category: IT Services and Consulting
    Product/Service Categories: Managed IT/Security, Managed Print Services, Managed Voice/Communications, Copiers/Printers, Cybersecurity, Cloud Services, Document Management, Audio/Video Systems
    Key Specific Products & Services: AmplifyIT (Managed IT), Microsoft Insights Assessment, Marco Technology Assessment, NIST Cybersecurity Framework-aligned services, Desktop as a Service (DaaS), partnerships with Toshiba, Sharp, Cisco, HP, Microsoft, Dell

[130] Company Name: Massive IT
    Website: https://www.massiveit.com
    Industry Category: Managed IT Services (MSP/MSSP)
    Product/Service Categories: Managed IT Services, Cloud Solutions, Cybersecurity & Compliance, Professional Services, Hardware & Software Licensing, Microsoft Dynamics 365 Consulting
    Key Specific Products & Services: Microsoft Dynamics 365 Business Central, Microsoft 365 Copilot, Microsoft 365 GCC-High, Dell VxRail, Cisco CUCM, Fortinet, VMware, Veeam, Intune, Power BI, Teams Phone

[131] Company Name: Mediacom Communications Corporation
    Website: https://mediacomcable.com
    Industry Category: Cable Telecommunications
    Product/Service Categories: Residential: Internet, TV, Phone; Business: Broadband Internet, Wi-Fi, Phone, TV, Fiber Solutions
    Key Specific Products & Services: Residential: Internet 300, 1 Gig Internet, Xtream Internet; Business: Business Internet + Advanced Wi-Fi + Data Security (from $99.99/mo), Cloud Voice, 100% Fiber-Optic Enterprise Broadband

[132] Company Name: Megaport
    Website: https://www.megaport.com
    Industry Category: Network as a Service (NaaS), Cloud Connectivity, Software Defined Networking (SDN) Megaport Business Overview, Megaport Products
    Product/Service Categories: Interconnection services: Ports, Virtual Cross Connects (VXCs), Cloud Router, Virtual Edge, Internet Exchange (IX), Marketplace Megaport Business Overview, Megaport Products
    Key Specific Products & Services: Megaport Cloud Router (MCR), Megaport Virtual Edge (MVE), Virtual Cross Connect (VXC; 1 Mbps to 100 Gbps), Port (up to 100G/400G), Megaport Firewall as a Service, Megaport Internet, NAT Gateway Megaport Products, Megaport Business Overview

[133] Company Name: Meter
    Website: https://www.meter.com
    Industry Category: Enterprise Networking, NaaS (Meter.com), (Wikipedia))
    Product/Service Categories: Full-stack networking hardware, software, and managed operations/services including wired LAN, wireless/Wi-Fi, cellular, firewalls, SD-WAN elements (Meter.com), (Meter Network)
    Key Specific Products & Services: F-Series Firewalls, S-Series Switches, A-Series Access Points, G-Series Gateways (5G Cellular), P-Series PDUs, Meter Dashboard, Meter Command (AI), Meter Cellular (Meter.com), (Meter Network)

[134] Company Name: Metronet
    Website: https://www.metronet.com
    Industry Category: Telecommunications (Metronet About, LinkedIn)
    Product/Service Categories: Fiber internet, fiber phone, IPTV/TV, WholeHome WiFi, home security, business fiber solutions (Metronet, Metronet Fiber Internet)
    Key Specific Products & Services: Internet tiers: 150 Mbps, 500 Mbps, 1 Gig, 2 Gig, 5 Gig; Unlimited Phone ($20/mo); Fiber IPTV; eero WholeHome WiFi; eero Plus security (Metronet, Allconnect, Metronet Phone)

[135] Company Name: MetTel
    Website: https://www.mettel.net
    Industry Category: Telecommunications
    Product/Service Categories: Voice/Communications, Network, Mobility, Cloud, Security, Managed Services
    Key Specific Products & Services: Managed SD-WAN, SIP Trunking, Cloud PBX, UCaaS, CCaaS, IP Telephony, MetTel Portal, Mobility as a Service (MaaS), 5G Solutions, POTS Replacement

[136] Company Name: Momentum Telecom
    Website: https://gomomentum.com
    Industry Category: Telecommunications (UCaaS, SD-WAN, managed cloud services)
    Product/Service Categories: Connectivity (Global Internet, SD-WAN, SASE), Collaboration (UCaaS, Microsoft Teams Phone), Engagement (Contact Center AI, Messaging), Security
    Key Specific Products & Services: Navigator SD-WAN (powered by Juniper Mist AI), Microsoft Teams Phone, Microsoft Teams Operator Connect, Microsoft Teams Direct Routing, Teams Contact Center, Cato Networks SASE, Starlink Global Coverage, Azure ExpressRoute

[137] Company Name: Natural Wireless, LLC
    Website: https://naturalwireless.com
    Industry Category: Telecommunications (Fixed Wireless Internet Access)
    Product/Service Categories: Dedicated Business Internet, Residential Internet, Event WiFi Services
    Key Specific Products & Services: Fixed Wireless Fiber DIA (10x10 Mbps to 10/10 Gbps), ReZilient UltraConnect (up to 20/20 Gbps), Advanced & Dedicated Internet Access (ADIA), Private Access Connection (PAC), Managed Enterprise Network Service (MENS)

[138] Company Name: net2phone
    Website: https://www.net2phone.com
    Industry Category: UCaaS, Cloud Communications, VoIP
    Product/Service Categories: Unified Communications, Contact Center as a Service (CCaaS), Hosted PBX, SIP Trunking, AI-powered tools
    Key Specific Products & Services: UNITE (Unified Communications), uContact (Contact Center), Huddle (video conferencing), Essentials/Professional/Ultimate plans, net2phone AI, Coach for UCaaS/CCaaS

[139] Company Name: Netrality Data Centers
    Website: https://netrality.com
    Industry Category: Data Centers, Interconnection
    Product/Service Categories: Colocation, Interconnection, Wholesale Data Centers, Powered Shell
    Key Specific Products & Services: Retail colocation (cabinets, cages, private suites), wholesale solutions, carrier-neutral Meet-Me-Rooms, cloud-connected colocation, Netrality Marketplace, Delta Cube³ cooling

[140] Company Name: NETRIO
    Website: https://www.netrio.com
    Industry Category: Managed IT Services (MSP/MSSP), Connectivity, Cloud, Cybersecurity
    Product/Service Categories: Managed IT infrastructure, Cybersecurity, Cloud services, Connectivity & Voice/UCaaS/SD-WAN, Custom application development, Professional services
    Key Specific Products & Services: Alliance (UCaaS), Cyber Secure Plus (CSP), XDR, MDR, EDR, SIEM, vCISO, Manual Pen Testing, SOCaaS, Managed SD-WAN, Microsoft Teams Direct Routing, Cisco Webex Calling

[141] Company Name: NetWolves
    Website: https://www.netwolves.com/
    Industry Category: Telecommunications, Managed Network Services, Cybersecurity
    Product/Service Categories: Managed Network Services (SD-WAN, Connectivity, Monitoring), Security Services, Managed IT, Cloud Services, Professional Services
    Key Specific Products & Services: SRM²™ (Secure Remote Monitoring platform), WolfPac™ (monitoring device), Monitoring tiers: Silver, Gold, Platinum; EndpointLock™ (keystroke encryption), Next Gen Firewall, Dark Web Scan (DWS), Data Security as a Service (DSaaS), Managed Security Services (MSS)

[142] Company Name: Network-Value Inc
    Website: https://network-value.com
    Industry Category: IT Services and Consulting (Networking Infrastructure, Lifecycle Management)
    Product/Service Categories: Managed IT Lifecycle Services, Hardware Procurement (New/Refurbished/CPO), IT Asset Disposition (ITAD), Third-Party Maintenance (TPM), Managed Licensing
    Key Specific Products & Services: IT Managed Lifecycle, Network-Value Analytics and Engine, Certified Pre-Owned networking equipment (Cisco, Juniper, Arista switches/routers), Asset Recovery/Buyback Programs, Network-Value Hardware (UC devices), Net-Value Support TPM

[143] Company Name: New Horizon Communications
    Website: https://nhcgrp.com
    Industry Category: Telecommunications
    Product/Service Categories: Overlay Services (UCaaS, SD-WAN, VoIP, Contact Center, Security), Network Services (Fiber, Broadband, LTE/5G, Satellite), Managed Services
    Key Specific Products & Services: NV UCaaS (Standard $19.99, UCaaS $24.99, Pro $32.99), newVoice Desktop, newVoice Mobile, newVoice WEBINAR (100/500/1000), NHC SD-WAN, STACK™, Polycom VVX 250 phone

[144] Company Name: Nextiva
    Website: https://www.nextiva.com
    Industry Category: UCaaS, CCaaS, CXM (Customer Experience Management)
    Product/Service Categories: Unified Communications, Contact Center, AI Customer Experience Platform, VoIP Phone Systems, Video Conferencing, Team Collaboration
    Key Specific Products & Services: NEXT Platform, XBert AI, NextOS, Nextiva App, Plans: Starter/Core ($15/user/mo), Engage ($25/user/mo), Scale ($75/user/mo), Professional, Enterprise, Contact Center Basic

[145] Company Name: NexusTek
    Website: https://www.nexustek.com/
    Industry Category: Managed IT Services, Cybersecurity, Hybrid Cloud
    Product/Service Categories: Managed IT Services, Cybersecurity Services, Hybrid Cloud, Data & AI Services, IT Consulting
    Key Specific Products & Services: Fully Managed IT Services Plans, Co-Managed IT Service Plans, Managed Hybrid Cloud, Managed Cybersecurity, NexusTek MDR Service, vCIO, vCISO, AI Consulting, Secure AI Platform

[146] Company Name: NICE
    Website: https://www.nice.com
    Industry Category: Customer Experience (CX), CCaaS, UCaaS
    Product/Service Categories: Cloud contact center software, AI-powered customer engagement platforms, unified communications
    Key Specific Products & Services: CXone (CCaaS platform), 1CX (UCaaS solution at $5/user/month), CXone Mpower, Enlighten AI

[147] Company Name: Nitel
    Website: https://www.nitelusa.com
    Industry Category: Telecom, Network-as-a-Service (NaaS), SD-WAN, SASE
    Product/Service Categories: Managed network services, connectivity (Ethernet, MPLS, Dedicated Internet Access, Private Line), SD-WAN, SASE, security, voice, cloud enablement
    Key Specific Products & Services: NaaS, Global SD-WAN, SASE (with Content Filtering, Threat Detection & Prevention, CASB, DLP, Zero Trust Access), FasTrack (for DIA and broadband), Ethernet Private Line (EPL), Ethernet Virtual Private Line (EVPL), Managed Security, SIP Trunks

[148] Company Name: Nord Security
    Website: https://nordsecurity.com
    Industry Category: Cybersecurity
    Product/Service Categories: VPN and network security, password management, encrypted storage, threat exposure and identity protection, eSIM services
    Key Specific Products & Services: NordVPN (VPN with Threat Protection Pro™), NordLayer (business network security), NordPass (password manager), NordLocker (encrypted storage), NordStellar (threat exposure management), NordProtect (identity theft protection), Saily (eSIM)

[149] Company Name: NRI North America
    Website: https://nri-na.com/
    Industry Category: IT Services and IT Consulting, focused on cloud, cybersecurity, networking , nri-na.com
    Product/Service Categories: Strategize & Advise, Build & Transform, Protect & Manage, Managed Services, Cloud, Hybrid Infrastructure, Modern Workplace, Data Analytics
    Key Specific Products & Services: SD-WAN, SDN (Network Modernization), Managed SASE Cisco Powered Service, Meraki SD-WAN, Zero Trust, Managed Security Services

[150] Company Name: Ntirety
    Website: https://www.ntirety.com
    Industry Category: IT Services and Managed Services Provider (MSP), Cybersecurity
    Product/Service Categories: Managed Infrastructure, Managed Security, Data Services, Compliance Services
    Key Specific Products & Services: Compliance Lifecycle Services (Standard, Advanced, Premier bundles), Managed Detection and Response (MDR) with Endpoint Protection, Data Readiness, Managed Data Lakehouse, Ntirety OnDemand Services (DBA, DevOps, Network, AWS Consulting, Azure Consulting, Compliance, Monitoring Insights), Penetration Testing Service, vCISO

[151] Company Name: NTT Cloud Communications
    Website: https://hello.global.ntt
    Industry Category: Cloud Communications, UCaaS, Telecommunications services.global.ntt, craft.co
    Product/Service Categories: Unified Communications, Cloud Voice, Digital Events, Managed Services, Consulting telarus.com, cxponent.com
    Key Specific Products & Services: Microsoft Teams and Cisco Webex UCaaS, Cloud Voice (formerly Arkadin Anytime), NTT DATA Extend, SIP Trunking, Contact Center as a Service (CCaaS) ntt-review.jp, LinkedIn

[152] Company Name: NTT Global Data Centers
    Website: https://services.global.ntt/en-us/services-and-products/global-data-centers
    Industry Category: Data Centers
    Product/Service Categories: Colocation, Data Center Connectivity, Data Center Implementation and Management, Hybrid Data Center Solutions
    Key Specific Products & Services: Secure cabinets, custom cages, dedicated vaults, build-to-suit data centers; carrier-neutral connectivity; on-site fit-out, implementation, 24x7 remote hands; Smart AI AgentTM Ecosystem

[153] Company Name: Observe.AI
    Website: https://www.observe.ai
    Industry Category: Contact Center AI, Customer Experience
    Product/Service Categories: AI Agents, AI Copilots, Conversation Intelligence
    Key Specific Products & Services: VoiceAI Agents, ChatAI Agents, Real-Time AI, Post-Interaction AI

[154] Company Name: One Source
    Website: https://www.onesource.net
    Industry Category: Technology advisory and managed services (telecom expense management, cybersecurity, IT infrastructure, UCaaS)
    Product/Service Categories: Technology Expense Management, Cybersecurity, Technology Infrastructure, Customer Experience (CX)
    Key Specific Products & Services: Managed TEM, Managed Mobility, Cloud Optimization, Managed Security, Incident Response, Assessments, Managed Network, Data Center, UCaaS, Contact Center, Business Process Outsourcing, AI for CX, OneLink TEM platform

[155] Company Name: Ontinue
    Website: https://www.ontinue.com
    Industry Category: Cybersecurity
    Product/Service Categories: Managed Extended Detection and Response (MXDR), Managed Detection and Response (MDR), Security Operations Center (SOC) services, Consulting services for Microsoft security
    Key Specific Products & Services: Ontinue ION (AI-powered MXDR platform with ION Cyber Defense Center), ION IQ (proprietary security AI), ION for IoT (add-on for IoT/OT security)

[156] Company Name: Ooma, Inc.
    Website: https://www.ooma.com/
    Industry Category: Telecommunications (VoIP, UCaaS, POTS Replacement)
    Product/Service Categories: Business Communications (UCaaS, cloud phone systems), Residential Home Phone Service, POTS Line Replacement
    Key Specific Products & Services: Ooma Office (Essentials, Pro, Pro Plus), Ooma Enterprise, Ooma AirDial, Ooma Telo (Air, LTE), Ooma Basic, Ooma Premier, Ooma 2600Hz

[157] Company Name: Open Systems
    Website: https://www.open-systems.com
    Industry Category: Cybersecurity, SASE, SD-WAN
    Product/Service Categories: Managed SASE, Security Service Edge (SSE), SD-WAN, ZTNA, Email Security
    Key Specific Products & Services: Open Systems SASE Experience, Secure SD-WAN, SD-WAN as a Service, Universal Zero Trust

[158] Company Name: OptiCool Technologies
    Website: https://opticooltechnologies.com
    Industry Category: Data center cooling (telecom, enterprise IT, HPC)
    Product/Service Categories: Two-phase refrigerant cooling systems: rear door heat exchangers, refrigerant pumps, delivery networks, heat rejection units
    Key Specific Products & Services: RDHx/AHX (rear door heat exchangers, up to 120kW), RPW pumps (60kW, 120kW, 230kW models), CDS (Cool Door System, 3-45kW/rack), ODX outdoor units (ODX-060, ODX-115, ODX-230)

[159] Company Name: Optimum Business
    Website: https://www.optimum-business.com
    Industry Category: Telecommunications
    Product/Service Categories: Business Internet, Voice/Phone, TV, Technical Support, Network Backup, Hosted Voice
    Key Specific Products & Services: 300 Mbps Secure Internet, 500 Mbps Secure Internet, 1 Gig Secure Internet, Secure Fiber Internet (up to 8 Gig), Business Phone, Business Hosted Voice, Business TV, Business Connection Backup, Business Premier Protection & Support, Service Protection, Premier Technical Support

[160] Company Name: PanTerra Networks
    Website: https://www.panterranetworks.com
    Industry Category: UCaaS, CPaaS, Telecommunications
    Product/Service Categories: Unified cloud communications, AI-powered collaboration, contact center, networking
    Key Specific Products & Services: Streams (core platform), Streams.AI, Luna (AI Receptionist), Cloud PBX, Contact Center AI, Connect AI, Contact Center AI, Team Messaging, SmartBox (file sync & share), Video Conferencing AI, Streamlets (IVR/IVA, free), POTS Replacement, SD-WAN with Bigleaf Networks & 4G LTE Failover, SmartBand MPLS; Service tiers: Business Plus ($24.95/user/mo), Professional ($29.95/user/mo), Call Center ($44.95/user/mo), Contact Center (custom)

[161] Company Name: Passpoint Security
    Website: https://www.passpointsecurity.com
    Industry Category: cybersecurity
    Product/Service Categories: cybersecurity consulting, business continuity planning, threat and vulnerability management, governance/risk/compliance
    Key Specific Products & Services: PTaaS (AI-verified Penetration Testing as a Service), penetration testing, vulnerability scans, phishing simulations, business continuity plans, tabletop exercises, policy creation, Business Impact Analysis (BIA), security audits, risk assessments Homepage, About, PTaaS, LinkedIn, YouTube

[162] Company Name: PCCW Global
    Website: https://www.pccwglobalinc.com
    Industry Category: Telecommunications
    Product/Service Categories: Managed connectivity, On-demand connectivity (NaaS), Security, Satellite, Media content delivery, International voice, Collaboration, Mobility, Software-Defined Networking (SDN)
    Key Specific Products & Services: Console Connect (on-demand interconnection platform), Managed SD-WAN, IPX network

[163] Company Name: PDI Security and Network Solutions
    Website: https://security.pditechnologies.com
    Industry Category: Cybersecurity, Managed Network Services
    Product/Service Categories: Managed Security Services (MDR, EDR, SOC), Network Management (Firewall as a Service, 5G as a Service, Wi-Fi as a Service), Cybersecurity Platform
    Key Specific Products & Services: PDI Cybersecurity Platform (with Threat Modeling Tool TMT, Cyber X Platform CXP, Security Program NSP), PDI Mobile App, Managed Detection and Response (MDR), Endpoint Detection and Response (EDR), Vulnerability Management Service (VMS), PDI MNSE (Managed Network Secure Edge)

[164] Company Name: PhySaaS
    Website: https://www.physaas.com
    Industry Category: Physical Security as a Service (PhySaaS)
    Product/Service Categories: Video Security, Access Control, Air Quality Sensors, Alarm Monitoring, Guest Management
    Key Specific Products & Services: Verkada-integrated cameras (Dome, Mini, Fisheye, Multi-Sensor, Bullet), 4/16 Door Controllers, Multi-format door readers, IO Controllers, Alarm hubs with sensors (Motion, Glass Break, Door Contact, Water/Leak, Panic), Air quality sensors (TVOC, AQI, Vape/Smoke, CO2, Temperature, Humidity, Noise)

[165] Company Name: Pilot Fiber
    Website: https://www.pilotfiber.com
    Industry Category: Telecommunications (Fiber Optic Infrastructure, Enterprise Connectivity)
    Product/Service Categories: Dedicated Internet Access, Dark Fiber, IP Transit, Wavelength Services, Ethernet Transport, Cloud Connectivity
    Key Specific Products & Services: Dedicated Internet (100 Mbps to 100 Gbps symmetrical tiers: 100 Mbps, 500 Mbps, 1 Gbps, 2.5 Gbps, 10 Gbps, 25 Gbps, 100 Gbps), Dark Fiber (with Advanced Link Monitoring), IP Transit (up to 100G ports, 95th percentile or burstable), Wavelength (up to 400G/800G), Ethernet Transport, CloudConnect (to AWS, Azure, Google Cloud)

[166] Company Name: Pisteyo
    Website: https://www.pisteyo.com
    Industry Category: AI Consulting, Business Consulting and Services Pisteyo website, LinkedIn
    Product/Service Categories: Generative AI enablement consulting services: strategy development, roadmapping, upskilling/change management, app integration/innovation, developer enablement, app development/data management Pisteyo homepage
    Key Specific Products & Services: Innovation Labs (co-development of AI solutions), AI Intelligence Briefing, Proof of Concepts/Pilots, Partner Program Pisteyo about, Innovation Labs

[167] Company Name: PolyAI
    Website: https://poly.ai
    Industry Category: Conversational AI, Customer Experience (CX)
    Product/Service Categories: Voice AI agents, Omnichannel conversational AI platform
    Key Specific Products & Services: Agent Studio (voice-first omnichannel platform), Smart Analyst, Analyst Agents

[168] Company Name: Powervox
    Website: https://powervox.com
    Industry Category: AI Voice Technology, Customer Service Automation
    Product/Service Categories: AI Voice Agents, Custom AI for Calls/Texts/Chats, Workflow Automation
    Key Specific Products & Services: Kira (AI workflow builder), Abby (dental office AI agent); Pricing: $0.12 per call minute

[169] Company Name: PS LIGHTWAVE
    Website: https://www.pslightwave.com
    Industry Category: Telecommunications
    Product/Service Categories: Fiber Internet, Ethernet, Dark Fiber, VoIP/Hosted PBX, Data Centers/Colocation, Carrier Services, Cloud Connect
    Key Specific Products & Services: Hosted PBX, Data Center Internet Port (DCIP), Cloud Connect to AWS, Google Cloud, Microsoft Azure, Oracle Cloud, IBM Cloud; bandwidth up to 40G/100G

[170] Company Name: PureTalk
    Website: https://www.puretalk.com
    Industry Category: Telecommunications (Mobile Virtual Network Operator - MVNO)
    Product/Service Categories: Wireless mobile services, Prepaid cell phone plans, Mobile hotspots/tablet data plans, Device sales (smartphones)
    Key Specific Products & Services: 3 GB Plan ($20/mo, unlimited talk/text, 3GB data, 2GB hotspot), 5 GB Plan ($25/mo, unlimited talk/text, 5GB data, 2GB hotspot), 10 GB Plan ($30/mo, unlimited talk/text, 10GB data, 5GB hotspot), Unlimited Data Plan ($55/mo, unlimited talk/text/data throttled after 60GB, 20GB hotspot); Family multi-line discounts up to 20%; Phones (iPhones, Androids with financing/discounts)

[171] Company Name: Quest Technology Management
    Website: https://questsys.com
    Industry Category: Telecom, UCaaS, SD-WAN, Managed IT Services
    Product/Service Categories: Managed IT Services, Cloud Services, Cybersecurity, Unified Communications (UCaaS), Network Services including Voice/Data Circuits and VoIP, Business Continuity/Disaster Recovery, Professional Services
    Key Specific Products & Services: QuestFlex® (flexible SLA), Virtual UC solutions, Multimedia collaboration plans, VoIP Services, Cyber attack simulation exercise, Infrastructure as Code (IaC)

[172] Company Name: Rackspace Technology
    Website: https://www.rackspace.com
    Industry Category: Cloud Computing, IT Services
    Product/Service Categories: Multicloud solutions, Managed Hosting, Professional Services, AI, Data, Security, Applications
    Key Specific Products & Services: Rackspace Fabric™, Fanatical Experience®, Managed Cloud (Infrastructure and Operations tiers), Elastic Engineering, Modern Operations, Optimizer+, Rackspace OpenStack Enterprise, VMware Cloud Foundation, FAIR™ for Generative AI

[173] Company Name: RapidScale
    Website: https://rapidscale.net
    Industry Category: Cloud Computing, Managed Cloud Services
    Product/Service Categories: Infrastructure as a Service (IaaS), Desktop as a Service (DaaS), Disaster Recovery as a Service (DRaaS), Security as a Service (SECaaS), SD-WAN, Managed IT Services, Backup and Storage
    Key Specific Products & Services: CloudServer, CloudDesktop, CloudRecovery, CloudMail, CloudOffice, Orchestration Portal, Identity as a Service (IDaaS), RapidResponse Support, WiFi Complete, Managed Detection and Response (MDR), Azure Virtual Desktop (AVD); tiers include Cloud Hosting, Managed Cloud Services, Disaster Recovery Solutions, Compliance-Focused Solutions

[174] Company Name: Regal
    Website: https://www.regal.ai
    Industry Category: AI, Customer Experience, Contact Center
    Product/Service Categories: Voice AI Agents, Customer Support Automation, Lead Qualification, Scheduling & Reminders, Collections, Bookings
    Key Specific Products & Services: Copilot (AI agent builder), AI Phone Agents, AI Voice Agent Builder, Unified Customer Profile, AI Sales Dialer, Conversation Intelligence, Outbound Journey Builder

[175] Company Name: Replicant
    Website: https://www.replicant.com
    Industry Category: Conversational AI for Contact Centers
    Product/Service Categories: Conversation Automation, Conversation Intelligence
    Key Specific Products & Services: Replicant Platform, Replicare (unlimited support service), Replicant Voice (voice AI)

[176] Company Name: Retarus
    Website: https://www.retarus.com/
    Industry Category: Cloud Communications, Secure Messaging, Business Process Automation
    Product/Service Categories: Messaging (Cloud Fax, Transactional Email, Enterprise SMS), Email Security & Compliance (Threat Protection, Encryption, Archiving), Business Process Solutions (EDI, E-Invoicing, Intelligent Document Processing)
    Key Specific Products & Services: Cloud Fax (incl. Fax for Epic, Fax for Outlook, Cloud Fax App for Salesforce), Enterprise SMS API, Email Security, Email Encryption, Email Archive, IDP (Intelligent Document Processing), EDI Integration, WebConnect for Suppliers, IDHUB (Identity Management), Business Process Solutions

[177] Company Name: RingCentral
    Website: https://www.ringcentral.com
    Industry Category: UCaaS, CCaaS, Cloud Communications RingCentral, Wikipedia
    Product/Service Categories: Unified Communications as a Service (UCaaS), Contact Center as a Service (CCaaS), AI-powered communications, video meetings, events RingCentral, RingCentral
    Key Specific Products & Services: RingEX (messaging, video, phone), RingCX (contact center), AIR (AI Receptionist), AVA (AI Virtual Assistant), ACE (AI Conversation Expert), RingCentral Video, RingSense, plans: Core, Advanced, Ultra RingCentral, Chanty

[178] Company Name: Sangoma Technologies Corporation
    Website: https://sangoma.com
    Industry Category: UCaaS, CCaaS, CPaaS, VoIP hardware, managed networking and security
    Product/Service Categories: Unified Communications as a Service (UCaaS), Contact Center as a Service (CCaaS), Communications Platform as a Service (CPaaS), SIP Trunking, Faxing, VoIP Gateways, Open-source PBX software, Managed SD-WAN and Security
    Key Specific Products & Services: Sangoma Meet, Sangoma Phone, Sangoma CX, Sangoma TeamHub, Asterisk, FreePBX, PBXact, FAXStation, Vega VoIP Gateway, Starbox

[179] Company Name: SeCAP Inc.
    Website: https://secapinc.com/
    Industry Category: Captive Insurance, Cybersecurity Insurance SeCAP About, SeCAP Home
    Product/Service Categories: Cyber Security Insurance, Enterprise Risk Insurance, Core Risk Insurance, Captive-Insurance-as-a-Service (CIaaS) SeCAP About, SeCAP Home
    Key Specific Products & Services: Cyber Security Insurance (with no-cost threat discovery), Directors & Officers, Fiduciary Liability, Stop Loss, Commercial Crime, Errors & Omissions, Workers Compensation, Fleet, Healthcare, General Liability SeCAP About

[180] Company Name: Segra
    Website: https://www.segra.com
    Industry Category: Telecommunications (fiber bandwidth infrastructure)
    Product/Service Categories: Connectivity (Internet, Ethernet, Dark Fiber, Wavelengths, SD-WAN), Cybersecurity (Firewall, DDoS Protection), Voice (SkyVoice, SIP Trunking, PRI, Digital Voice), Cloud (Express Cloud Connect), Colocation & Data Centers
    Key Specific Products & Services: SkyVoice, Dedicated Internet Access (DIA), EdgeLync, Express Cloud Connect, Ethernet Access, Wavelengths, SD-WAN, Firewall, DDoS Protection, SIP Trunking, PRI, Dynamic Line

[181] Company Name: Semtech Corporation
    Website: https://www.semtech.com
    Industry Category: Semiconductors
    Product/Service Categories: Analog and mixed-signal semiconductors, IoT connectivity platforms (LoRa®, Cellular IoT), Signal Integrity (optical & networking ICs), Circuit Protection, Power Management, Smart Sensing (PerSe®), Professional AV (BlueRiver®), Broadcast Video
    Key Specific Products & Services: LoRa® transceivers (SX1261, SX1262, SX1276), Tri-Edge®/ClearEdge® CDRs, RClamp®/µClamp® protection devices, BlueRiver® AV processors (AVP1000, AVP2000), PerSe® smart sensing solutions, nanoSmart® power management

[182] Company Name: Sharpen Technologies (Sharpen CX)
    Website: https://sharpencx.com
    Industry Category: Contact Center as a Service (CCaaS), UCaaS
    Product/Service Categories: Cloud contact center platform with voice, messaging, AI automation, outbound dialing, IVR; modular for standalone or integration
    Key Specific Products & Services: Sharpen CX platform, Sharpen Ascend (UCaaS integration), Sharpen AI (voice agents and sidekick), Inbound Contact Center, Outbound Sales Dialer, Modern IVR, Messaging/SMS

[183] Company Name: SilverSky
    Website: https://www.silversky.com
    Industry Category: Cybersecurity
    Product/Service Categories: Managed Detection and Response (MDR/MxDR), Managed SIEM, Email Protection, Vulnerability Management, Security Device Management, SOC-as-a-Service
    Key Specific Products & Services: Lightning MDR (Self-Service, Standard, Advanced, Elite tiers), Microsoft MxDR, Managed Modern Work, Managed Defender M365

[184] Company Name: Sinch
    Website: https://sinch.com
    Industry Category: Communications Platform as a Service (CPaaS), Cloud Communications Sinch.com products, Wikipedia
    Product/Service Categories: Messaging, Voice, Email, Verification, Contact Center, Network Connectivity, APIs Sinch.com products
    Key Specific Products & Services: Sinch Engage, Sinch Mailjet, Sinch Chatlayer, Sinch Contact Pro, Conversation API, SMS API, Verification API, SIP Trunking, RCS Sinch.com products

[185] Company Name: Skywire Networks
    Website: https://skywirenetworks.com
    Industry Category: Telecommunications
    Product/Service Categories: Broadband Internet, Ethernet, Voice, SD-WAN, Managed Wi-Fi, Cloud Connect, Fixed Wireless, Mobile
    Key Specific Products & Services: Residential Internet ($45/month, starting 100Mbps), Small Business Bundle ($129/month: 100Mbps, 2 Voice lines, 2 Mobile Lines, 2 WiFi Access Points), Dedicated Internet Access (DIA), Business Internet Access (BIA), High-Speed Internet (HSI), bandwidth tiers 100Mbps to 10Gbps

[186] Company Name: Soracom, Inc.
    Website: https://soracom.io
    Industry Category: IoT Connectivity, Telecommunications
    Product/Service Categories: IoT SIMs/eSIMs, Cellular Connectivity (LTE-M, LPWA, Global Multicarrier), Hardware Modems/Buttons, Cloud-Native IoT Platform, Network Management/Security
    Key Specific Products & Services: Soracom EcoSIM, Soracom eSIM, Soracom Onyx USB LTE Modem, Soracom LTE-M IoT Smart Button, Soracom User Console, Soracom Air (cellular data plans)

[187] Company Name: Spectrotel
    Website: https://www.spectrotel.com
    Industry Category: Managed Network Services, Telecom
    Product/Service Categories: Managed Network Services, Cloud Communications (UCaaS), Connectivity, Managed Mobility Services, Consulting & Professional Services, Security
    Key Specific Products & Services: Managed SD-WAN (incl. Secure One-Box SD-WAN), Managed SASE, ZTNA, Managed EDR, Managed Firewall, NOC as a Service, Starlink Satellite Broadband, POTS Replacement, Managed CPE (routers, switches, WiFi)

[188] Company Name: Spectrum (Charter Communications)
    Website: https://www.spectrum.com
    Industry Category: Telecommunications
    Product/Service Categories: Residential: Internet, Mobile, TV, Voice; Business: Internet/WiFi, Phone/Voice/UCaaS, Mobile, TV, Dedicated Fiber, Managed Services (SD-WAN, Security)
    Key Specific Products & Services: Residential: Internet Gig (1 Gbps), Internet Premier (500 Mbps), Internet Advantage (100 Mbps), Spectrum Mobile Unlimited, Spectrum TV; Business: Fiber-Powered Internet, Invincible WiFi, Business Unlimited Mobile, Managed SD-WAN, MultiCaaS/UCaaS

[189] Company Name: Spectrum Community Solutions
    Website: https://www.spectrum.com/community-solutions
    Industry Category: Telecommunications
    Product/Service Categories: Broadband Internet, Managed WiFi, TV/Streaming, Mobile, Voice
    Key Specific Products & Services: Spectrum Internet (up to 2 Gbps), Spectrum Advanced WiFi (WiFi 6E, Security Shield), Spectrum TV (150+ channels via Spectrum TV App), Spectrum Voice, Spectrum Mobile, Spectrum Ready (pre-installed instant activation service)

[190] Company Name: Splice Technologies Inc
    Website: https://www.splicetechnologies.com
    Industry Category: Telecommunications, Fiber Optics
    Product/Service Categories: Fiber optic passive components and hardware, primarily fusion splice protection sleeves
    Key Specific Products & Services: Thin Series, Slim Series, Z Series (1.2mm), Mini Series (2.0mm), Flexible Micro Series (1.5mm), Ribbon Fiber Series (2-12 fibers), Flexible Mini Series; Biconic Connectors, Cable Breakout Kits, Ribbon Forming Fixtures Splice Technologies, About Us

[191] Company Name: Sprinklr
    Website: https://www.sprinklr.com
    Industry Category: Customer Experience Management (Unified-CXM) Software Sprinklr Products, Investor Relations
    Product/Service Categories: Unified-CXM platform with suites for Service, Insights, Social, Marketing Sprinklr Products
    Key Specific Products & Services: Sprinklr Service (e.g., Sprinklr Voice, Live Chat, Conversational AI & Bots), Sprinklr Insights (e.g., Social Listening, Product Insights), Sprinklr Social (e.g., Social Publishing & Engagement), Sprinklr Marketing (e.g., Campaign Planning, Social Advertising), Unified Platform (e.g., AI Studio, Integrations) Sprinklr Products

[192] Company Name: Square
    Website: https://squareup.com
    Industry Category: Financial services, Fintech, Payments
    Product/Service Categories: Point-of-sale (POS) systems, Payment processing, Business management software, Banking services, Team management, Customer engagement
    Key Specific Products & Services: Square Register, Square Terminal, Square Reader, Square Invoices, Square Appointments, Square Payroll, Square Loans, Square Checking, Square Savings, Square for Restaurants, Square for Retail, Square Loyalty

[193] Company Name: SuccessKPI
    Website: https://successkpi.com/
    Industry Category: Customer Experience (CX), Contact Center / Workforce Engagement Management (WEM)
    Product/Service Categories: Workforce Engagement Management (WEM), Business Intelligence & Analytics, Speech & Text Analytics, Quality Management, Agent Assist, Workforce Management
    Key Specific Products & Services: Playbook Builder™, Contact Center Intelligence, BI and QM Package, Speak Sense, Agent Assist, GenAI package, Automated Quality Monitoring (Auto-QM), Topic Miner, GenAI Deep Prompts

[194] Company Name: Switch
    Website: https://www.switch.com
    Industry Category: Data Centers
    Product/Service Categories: Colocation, Cloud Infrastructure, Telecommunications
    Key Specific Products & Services: Exascale Colocation®, Switch COLO®, Switch CLOUD (private, public, hybrid IaaS/PaaS/SaaS), SUPERNAP facilities, Tier 5® Platinum, Switch SUPERLOOP®

[195] Company Name: T-Mobile powered by Hyperion
    Website: https://hyperionpartners.net
    Industry Category: Telecom
    Product/Service Categories: Wireless connectivity, Managed Mobility, Fixed Wireless Access (FWA), IoT solutions
    Key Specific Products & Services: Hyperion Managed Mobility program, Cradlepoint E300 and W1850 routers bundles, Glass Enterprise Edition 2 with Google Pixel 6 on T-Mobile 5G, Siyata SD7 Push-to-Talk devices

[196] Company Name: TailWind Voice & Data
    Website: https://www.tailwindvoiceanddata.com
    Industry Category: Telecommunications
    Product/Service Categories: Connectivity & Carrier Management, Managed Network Services, WiFi & Infrastructure, Field Services
    Key Specific Products & Services: UCaaS, SD-WAN, TEM, NOCaaS, Bill Consolidation, Structured Cabling, Business Fiber, Ethernet, DIA

[197] Company Name: Talkdesk
    Website: https://www.talkdesk.com
    Industry Category: Cloud Contact Center as a Service (CCaaS)
    Product/Service Categories: AI-powered cloud contact center solutions: Customer Experience Automation (CXA), omnichannel engagement (voice, digital: email, chat, SMS, social), workforce management, analytics, self-service, industry-specific Experience Clouds
    Key Specific Products & Services: Talkdesk CX Cloud; CXA components: Copilot, Autopilot, Navigator, Interaction & Quality Analytics, Identity; Service tiers: Digital Essentials ($85/user/mo), Voice Essentials ($105), Elite ($165), Industry Experience Clouds ($225, e.g., Financial Services, Healthcare, Retail); Talkdesk Express (SMB); Workspace, AppConnect, Guardian

[198] Company Name: Tangoe
    Website: https://www.tangoe.com
    Industry Category: IT Expense Management (ITEM), Technology Expense Management (TEM)
    Product/Service Categories: Telecom Expense Management (TEM), Managed Mobility Services (MMS), Cloud Expense Management (CEM), IT Asset Management
    Key Specific Products & Services: Tangoe One Platform, Tangoe One Telecom, Tangoe One Mobile, Tangoe One Cloud, Tangoe AI Assistant, Tangoe Advisory Services, Tangoe for Apple, Managed Mobility Services (Help Desk, Logistics, Repair & Maintenance), Tangoe Pay

[199] Company Name: TekSecute Technology Group
    Website: https://www.teksecutetechgroup.com/
    Industry Category: Hospitality Technology, Telecommunications
    Product/Service Categories: Internet/WiFi, Voice/PBX/Phone Systems, Video/TV, Cabling, Legacy Support, Security (CCTV)
    Key Specific Products & Services: Managed Wired & WiFi on Enterprise IP Infrastructure, Cloud & On-Premise PBX, Full-Service Video Delivery (IPTV, OTT, VOD), Low-Voltage Cabling (Cat6, Fiber), 24/7 Break-Fix for Legacy Systems, High-Speed Internet, Associate Alert

[200] Company Name: Telefónica
    Website: https://www.telefonica.com/en/
    Industry Category: Telecommunications Telefónica, Wikipedia
    Product/Service Categories: Fixed and mobile telephony, broadband, connectivity, entertainment, cloud, cybersecurity, IoT, Big Data, AI, Blockchain, SD-WAN, networks Telefónica Services, Telefónica Tech
    Key Specific Products & Services: Movistar, O2, Vivo brands; Edge Basic, Edge Smart; TTCP (Telefónica Tech Cloud Platform) Business Services, Wikipedia, Edge PR

[201] Company Name: TeleSpace LLC
    Website: https://telespace.com
    Industry Category: Telecommunications, UCaaS, Cloud Communications telespace.com, LinkedIn, RocketReach
    Product/Service Categories: Cloud-based voice, video, contact center, unified communications
    Key Specific Products & Services: UCaaS (IP telephony, messaging, mobility, IM, presence), TPaaS (high-definition video), CCaaS (customer care), Cisco Hosted Collaboration Solution (HCS), monthly subscriptions

[202] Company Name: Telesystem
    Website: https://www.trusttelesystem.com
    Industry Category: Telecommunications
    Product/Service Categories: Cybersecurity, Networking, Communications (UCaaS, VoIP, SD-WAN, Managed WiFi, Managed Security, DDoS Protection)
    Key Specific Products & Services: SD-WAN, Hosted VoIP, UCaaS, SIP Trunking, Video Conferencing, Microsoft Teams Integration, Managed Firewalls, SASE, Endpoint Protection, Email Encryption, Pen Testing, Compliance Audits, Colocation, Managed WiFi, LTE, DDoS Protected Internet, Broadband Internet (1-10 Mbps, 25 Mbps, 50 Mbps, 100+ Mbps)

[203] Company Name: Telstra
    Website: https://www.telstra.com.au
    Industry Category: Telecommunications
    Product/Service Categories: Mobile telephony, fixed-line broadband (nbn), enterprise networks, cloud, security, unified communications, IoT, satellite services
    Key Specific Products & Services: Upfront Mobile Plans (Basic 50GB, Essential 180GB, Premium 300GB), Essential nbn Broadband, Telstra Satellite Messaging, Telstra Dynamic Connect, Belong (low-cost mobile/internet), Telstra Pre-Paid, Next G/4GX/5G networks

[204] Company Name: Third Wave Innovations
    Website: https://3rdwave.io
    Industry Category: Cybersecurity, Risk Management
    Product/Service Categories: Cybersecurity services, Managed detection and response, Network operations, Compliance and risk management
    Key Specific Products & Services: C4 Intelligence Platform, cyber Network Operations Center (cNOC), Managed Detection and Response (MDR), Managed SIEM

[205] Company Name: threatER (Threater)
    Website: https://www.threater.com
    Industry Category: Cybersecurity
    Product/Service Categories: Network security, Threat intelligence, Autonomous threat defense, DNS security, Zero-trust protection
    Key Specific Products & Services: threatER platform, Enforce, EnforceDNS, Threat Intelligence Gateway, ThreatBlockr

[206] Company Name: Thrive
    Website: https://thrivenextgen.com
    Industry Category: IT Managed Services (MSP/MSSP), Networking, Cloud, Cybersecurity, SD-WAN
    Product/Service Categories: Managed IT Services, Cybersecurity, Cloud Services, Networking/SD-WAN, IT Automation Platform
    Key Specific Products & Services: Thrive Platform (powered by ServiceNow), Managed Secure SD-WAN (powered by Fortinet FortiGate), Thrive Cloud Workspace (DaaS), Microsoft 365 Managed Services, Managed Detection and Response (MDR), Endpoint Detection and Response (EDR), Cybersecurity Mesh Architecture (CSMA)

[207] Company Name: TierPoint
    Website: https://www.tierpoint.com/
    Industry Category: IT Services and IT Consulting, Data Center Services, Hybrid Cloud Infrastructure TierPoint.com, LinkedIn
    Product/Service Categories: Colocation & Data Center Services, Hybrid Cloud (Public, Private, Multitenant), Managed Security, Disaster Recovery & Backup (DRaaS, BaaS), Managed Services, IT Advisory & Consulting, IBM Managed Services TierPoint Services, TierPoint Homepage
    Key Specific Products & Services: Adapt MDR, Adapt NGFW, Adapt Platform, Zerto DRaaS, Nutanix Leap, vCloud Director Availability, Commvault BaaS, Veeam Cloud Connect, Managed Azure, Managed AWS, SAP Managed Services, Microsoft 365, SOC as a Service TierPoint Services

[208] Company Name: Titanium Payments
    Website: https://www.titaniumpayments.com
    Industry Category: Financial Services, Payment Processing
    Product/Service Categories: Merchant Services, Credit Card Processing, POS Systems, eCommerce Gateways, B2B Payments, Mobile Processing, ACH/Recurring Billing
    Key Specific Products & Services: Titanium Flex (payment platform and API), Titanium Boost Business Mastercard, Card Present Solutions, Custom Developed Solutions

[209] Company Name: TouchTone Communications
    Website: https://touchtone.net
    Industry Category: Telecommunications
    Product/Service Categories: Voice and Collaboration (VoIP, SIP Trunking, UCaaS, Toll-Free, Long Distance), Internet and Connectivity (MPLS, Ethernet, Dedicated Internet), Cybersecurity
    Key Specific Products & Services: TouchTone Office (UCaaS), TouchTone Enterprise SIP, BusinessFlex SIP Trunking, POTS Replacements (Ooma AirDial, Adtran, Grandstream), Control Center portal, Toll-Free Services (domestic/international from 75+ countries)

[210] Company Name: TPx Communications
    Website: https://www.tpx.com/
    Industry Category: Managed IT Services, UCaaS, Network Connectivity, Cybersecurity TPx Website, Wikipedia, LinkedIn
    Product/Service Categories: Managed IT, Unified Communications (UCaaS), Networking (SD-WAN, Managed WAN), Cybersecurity, Collaboration, Contact Center TPx Services, LinkedIn Specialties
    Key Specific Products & Services: UCx (unified communications platform with Webex integration), UCx Contact Center, UCx Call Center, Managed SD-WAN (Fortinet-powered), SIP Trunking, Managed Firewalls, Managed Detection and Response (MDR), Managed Endpoints, Security Awareness Training TPx UCx, SD-WAN, Press Release

[211] Company Name: Trustwave
    Website: https://www.trustwave.com
    Industry Category: cybersecurity
    Product/Service Categories: Managed Detection and Response (MDR), Managed Security Services (MSS), database security, email security, penetration testing, threat intelligence, incident response, cyber advisory
    Key Specific Products & Services: Trustwave Fusion (security operations platform), SpiderLabs (threat intelligence and research), MailMarshal/SEG (Secure Email Gateway), AppDetectivePRO, DbProtect (database security), Managed SIEM

[212] Company Name: UJET, Inc.
    Website: https://ujet.cx
    Industry Category: Customer Experience (CX), CCaaS (Contact Center as a Service)
    Product/Service Categories: AI-powered cloud contact center platform, Workforce Management (WFM), Omnichannel CX orchestration (voice, chat, messaging, virtual agents)
    Key Specific Products & Services: Experience Center, Agentic Experience Orchestration (AXO), Spiral by UJET, SmartActions, Visual IVR, Mobile/Web SDKs, Voice and Chat bundle

[213] Company Name: Uniti Fiber
    Website: https://uniti.com
    Industry Category: Telecommunications
    Product/Service Categories: Fiber infrastructure, dark fiber, wavelengths, ethernet, enterprise connectivity, managed network services
    Key Specific Products & Services: FastWaves™, Dark Fiber, Wavelengths, Ethernet Access, IP Transit, Dedicated Internet Access (DIA), Managed Spectrum, Managed Router, Managed SD-WAN, Managed Wi-Fi

[214] Company Name: unWired Broadband
    Website: https://www.getunwired.com
    Industry Category: Telecommunications (Fixed Wireless Broadband)
    Product/Service Categories: Residential and Business Internet Access, Fiber Internet, Redundancy Solutions, Data Center Services
    Key Specific Products & Services: Fixed wireless plans up to 400 Mbps (e.g., 100 Mbps, 200 Mbps, 400 Mbps), NextGen Fiber, Enterprise plans with SLAs, Symmetrical/Asymmetrical tiers, Managed Services, Business Redundancy/Failover

[215] Company Name: US Signal
    Website: https://ussignal.com
    Industry Category: Digital Infrastructure, Data Center Services, Telecommunications
    Product/Service Categories: Cloud, Colocation, Connectivity, Managed Services, Data Protection
    Key Specific Products & Services: OpenCloud, ReliaCloud, Dedicated Internet Access (DIA), Ethernet Transport, MPLS, Cato SD-WAN, SASE powered by Cato Networks, Managed Detection and Response (MDR), Extended Detection and Response (XDR), SyncSafe Replication, Remote Monitoring and Management (RMM)

[216] Company Name: VerifiNow
    Website: https://getverifinow.com
    Industry Category: Cybersecurity, Identity Verification, Fraud Prevention
    Product/Service Categories: Identity Verification, Fraud Prevention, Compliance (eKYC/AML), In-Person IDV, Workforce Identity
    Key Specific Products & Services: Identity Verification, LiveVerifi (In-Person IDV), Fraud Prevention, Trust & Compliance Suite (eKYC, AML, Employment Verification, Income Verification), Workforce Identity

[217] Company Name: Verizon Communications Inc.
    Website: https://www.verizon.com
    Industry Category: Telecommunications
    Product/Service Categories: Wireless services, Wireline broadband, Business networking and security, IoT, Voice and collaboration
    Key Specific Products & Services: Fios Internet, 5G Home Internet, Verizon Smart Family, Call Filter, Verizon Cloud, Private 5G Network, DDoS Shield, FWA broadband, Unlimited plans

[218] Company Name: VesuvITas
    Website: https://vesuvitas.com
    Industry Category: IT Services and IT Consulting (Contact Center, Customer Experience)
    Product/Service Categories: Contact Center Solutions, Customer Experience Consulting, Cloud & Hybrid Solutions, Managed Services, Telecom & Data Connectivity, Analytics, Cybersecurity
    Key Specific Products & Services: Dialer Management as a Service (DMaaS), Vendor Neutral Evaluation and Selection, Staff Augmentation & Deployment Support, CX Journey Mapping, ROI & Business Case Services; Platforms: Five9, Talkdesk, Nice inContact, RingCentral, Avaya, Cisco, Microsoft Teams, CCaaS, UCaaS

[219] Company Name: Viasat, Inc.
    Website: https://www.viasat.com
    Industry Category: Satellite Communications
    Product/Service Categories: Satellite Services (aviation, residential, business, enterprise, maritime), Government Systems (secure networking for defense), Space & Commercial Networks (terminals, ground systems, satellites)
    Key Specific Products & Services: ViaSat-3 satellites, Viasat Internet plans (Unlimited Choice, Choice 300 GB), Business Internet (Primary up to 150 Mbps, Backup, Low-cost CAF II), In-flight Wi-Fi, Enterprise: IoT Pro/Nano/Select/Direct/VSAT, Go-anywhere Pro/Flex/VSAT, PTT Pro/Select, IsatPhone2, Viasat Voice, VCare, NetAgility, NeoTide

[220] Company Name: Vigilant
    Website: https://vigilantnow.com
    Industry Category: Cybersecurity
    Product/Service Categories: Managed Detection and Response (MDR), Network Visibility, Endpoint Visibility, Email Visibility, Breach Response
    Key Specific Products & Services: VigilantMDR, CyberDNA® Platform, Vigilant365™, VigilantMEDR, VigilantMNDR, Unlimited Breach Response

[221] Company Name: vMOX
    Website: https://www.vmox.com/
    Industry Category: Managed Mobility Services (MMS), Enterprise Mobility Management (EMM), Telecom
    Product/Service Categories: Expense Management, Cost Optimization, Inventory Management, Procurement & Logistics, Program Management, Endpoint Managed Services
    Key Specific Products & Services: vMOX OnePortal, Essentials bundle (Financial/Program/Procurement Management), Add-ons (Pick/Pack/Ship, Staging/Kitting, Reverse Logistics), Bill Auditing/Fraud Detection, MACD Management, Wireless Contract Negotiations

[222] Company Name: Vodafone Business
    Website: https://www.vodafone.com/business
    Industry Category: Telecommunications, Digital Services (Connectivity, IoT, Cloud, Security, UCaaS, SD-WAN)
    Product/Service Categories: Core Connectivity, Unified Communications, Cloud and Security, Internet of Things, Mobile Private Networks, Fixed Connectivity, Carrier Services
    Key Specific Products & Services: V-Hub, Vodafone Business IoT Platform, UCaaS with RingCentral, SD-WAN, SD-LAN, Secure Access Service Edge (SASE), eSIM manager, Multi-access Edge Computing, Vodafone Carrier Services, 4G & 5G Private Mobile Networks, Messaging Hub

[223] Company Name: Volli Communications
    Website: https://www.vollicomm.com
    Industry Category: Telecommunications (VoIP, SIP Trunking, UCaaS)
    Product/Service Categories: SIP Trunking, UCaaS, Microsoft Teams Direct Routing, Toll-free Voice, SMS
    Key Specific Products & Services: Volli Connect (SIP Trunking, metered/unlimited plans), Volli Direct (Teams Direct Routing), Volli Business (UCaaS with phone, messaging, call management, metered/unlimited plans)

[224] Company Name: Vonage Business
    Website: https://www.vonage.com/
    Industry Category: Cloud Communications (UCaaS, CPaaS, CCaaS) Vonage.com, Wikipedia
    Product/Service Categories: Unified Communications, Contact Centers, Communications APIs, Network-Powered Solutions Vonage.com
    Key Specific Products & Services: Vonage Business Communications (VBC) with Mobile/Basic, Premium, Advanced plans; Vonage Fusion; VBC SmartWAN/SmartWAN+; AI Virtual Assistant; Communications APIs Vonage.com, Vonage.com

[225] Company Name: Warner Telecomm
    Website: https://www.warnertelecomm.com/
    Industry Category: Telecommunications
    Product/Service Categories: Telecom Expense Management (TEM), Enterprise Technology Management (ETM), Strategic Sourcing, Lifecycle Management, Consulting for UCaaS, SD-WAN, CCaaS
    Key Specific Products & Services: Enterprise Technology Management (ETM) platform, Warner Active Inventory, Telecom Audit & Recovery, Managed TEM, Strategic Sourcing, Full Lifecycle Management, FinOps for Cloud

[226] Company Name: Waterfield Technologies
    Website: https://waterfieldtech.com
    Industry Category: Contact Center / Customer Experience (CX) Technology Waterfield Tech website, LinkedIn
    Product/Service Categories: Contact center solutions, CCaaS, Conversational AI, Workforce Engagement Management (WEM), Managed Services, CX Modernization, Applied AI, Secure IT Infrastructure Waterfield Tech website, LinkedIn
    Key Specific Products & Services: Ascend (flat-rate CCaaS subscription), Genesys Software, Avaya Software, Alvaria Software, Twilio Flex, Xcelerate, PCI IVR, IVA Platform, Custom Application Development Waterfield Tech website, LinkedIn

[227] Company Name: Webinar.net
    Website: https://www.webinar.net
    Industry Category: SaaS, Webinar Software
    Product/Service Categories: Online webinar platform, live/simulive/on-demand streaming, branded presentations, analytics
    Key Specific Products & Services: Squad plans (&lt;100, &lt;500 attendees), Enterprise plans (&lt;1,000, &lt;1,500, &lt;2,000, +2,000 attendees), Webinar Admin, Webinar Presenter, Webinar Analytics, The Lab (editor) webinar.net, G2

[228] Company Name: Windstream
    Website: https://www.windstream.com
    Industry Category: Telecommunications
    Product/Service Categories: Broadband Internet, Voice/Phone, Managed Network & Security Services, Wholesale Fiber & Optical Transport (SD-WAN, UCaaS, Wavelengths, Dark Fiber)
    Key Specific Products & Services: Kinetic Fiber Internet (100 Mbps, 1 Gig, 2 Gig tiers), Business Ready Internet (300 Mbps $49.99/mo, 1 Gig $99.99/mo, 2 Gig $129.99/mo), OfficeSuite UC, Wavelengths, Dark Fiber, Managed Spectrum, IP Transit, Dedicated Internet Access, Ethernet Access, SD-WAN, UCaaS

[229] Company Name: Windstream Wholesale
    Website: https://www.windstreamwholesale.com
    Industry Category: Telecommunications (Wholesale Optical Networking)
    Product/Service Categories: Wavelength services, Dark Fiber, Managed Spectrum, IP Transit, Dedicated Internet Access (DIA), Ethernet Access, Colocation, Custom Engineered Solutions
    Key Specific Products & Services: Intelligent Converged Optical Network (ICON), iconnect customer portal, Regional 400G (ZR+), IP transit (DIA PoP), Dedicated internet access (DIA Prem), Wave services (10GB to multi-terabit), E-Line, E-Access, MPLS, Tower Backhaul

[230] Company Name: Wireless Watchdogs
    Website: https://www.wirelesswatchdogs.com/
    Industry Category: Managed Mobility Services, Enterprise Mobility Management (Telecom/IT)
    Product/Service Categories: Managed Mobility Services (MMS), Mobile Device Management (MDM), Unified Endpoint Management (UEM), Wireless Expense Management, Mobile Security, IoT Management
    Key Specific Products & Services: Airwatch support, Intune support, Mobility Planning, Device Procurement & Deployment, Unlimited Mobile Help Desk, Real-Time Reporting & Analytics, Device Monitoring, End-of-Life Management

[231] Company Name: WOW! Business
    Website: https://www.wowforbusiness.com
    Industry Category: Telecommunications
    Product/Service Categories: Business Internet, Phone (VoIP), Networking (WiFi, DIA), Data Center services
    Key Specific Products & Services: Internet tiers: 300 Mbps, 600 Mbps, 1.2 Gbps, up to 10 Gbps Fiber/DIA; Hosted VoIP (Professional Seat, Basic Seat); Dedicated Internet Access (DIA); Whole-Business WiFi; Wireless Internet Backup; Data Center & Colocation

[232] Company Name: Xcelocloud
    Website: https://www.xcelocloud.com
    Industry Category: IT Services and IT Consulting
    Product/Service Categories: Multi-vendor IT support, Managed Services, Advanced Engineering, Advanced Support, Strategic Services, Multi-Cloud Solutions, Endpoint Management, Enterprise Service Desk (ITSM), Remote Infrastructure Management (RIM)
    Key Specific Products & Services: MVSS365 (managed multi-vendor support service), XceloHub (AI-powered IT management platform)

[233] Company Name: Xcitium
    Website: https://www.xcitium.com
    Industry Category: Cybersecurity
    Product/Service Categories: Zero Trust platform, Endpoint Detection and Response (EDR), Extended Detection and Response (XDR), Managed Detection and Response (MDR), Ransomware Protection, Cloud Workload Protection, Threat Intelligence, Incident Response Xcitium, Packages
    Key Specific Products & Services: ZeroDwell™ Containment, Essential EDR, Pro EDR, Enterprise EDR with EXDR, CTRL Threat Research Labs, Automation Scripting, Baseling Pro, Cyber Transparency Services, Add-ons: DNS/Web Filtering, Email Security, Cloud Compliance/CSPM/CWPP Xcitium, Packages

[234] Company Name: XTIUM
    Website: https://xtium.com
    Industry Category: Managed IT Services (MSP), cybersecurity, cloud computing, UCaaS
    Product/Service Categories: Virtual Desktops (DaaS), Managed Security, Managed Network, Unified Communications (UCaaS), Managed IT Helpdesk, AI Consulting
    Key Specific Products & Services: XTIUM MDR (Managed Detection & Response with Essentials, Select, Premium tiers), XTIUM Unified Communications as a Service (UC&C), XTIUM Desktop as a Service, XTIUM Contact Center, XTIUM Managed Network Services XTIUM, Business Wire, G2

[235] Company Name: YourSix
    Website: https://www.yoursix.com
    Industry Category: Physical Security (PSaaS, cloud-native security)
    Product/Service Categories: Video surveillance, access control, audio, sensors, AI analytics, professional monitoring
    Key Specific Products & Services: Y6OS platform, YourSixOS Peripherals, cloud surveillance, unified access control

[236] Company Name: Zayo Group
    Website: https://www.zayo.com
    Industry Category: Telecommunications infrastructure
    Product/Service Categories: Fiber & Transport (Dark Fiber, Wavelengths, Private Networks, Wireless Infrastructure), Packet & Connectivity (Ethernet, IP Transit, Dedicated Internet Access, CloudLink, DynamicLink, WANs), Managed Edge Services (Managed SD-WAN, Managed SASE, Managed Firewall), Communication Solutions (Zayo UC+, Zayo Voice, Zayo SIP Solutions)
    Key Specific Products & Services: Dark Fiber, Wavelengths (including Waves on Demand, 400G/800G-enabled), CloudLink, DynamicLink, Managed SD-WAN, Managed SASE, E-LAN, IP VPN, zInsights portal, Managed Firewall, Zayo UC+, Zayo Voice

[237] Company Name: Zenlayer
    Website: https://www.zenlayer.com/
    Industry Category: Edge Cloud Services, AI Infrastructure
    Product/Service Categories: Distributed Cloud Compute (Bare Metal, Elastic Compute, GPU), Cloud Networking, Application Acceleration, IP Transit, CDN, Edge Data Center Services
    Key Specific Products & Services: Distributed Inference, AI Gateway, Fabric for AI, Zenlayer Global Accelerator (ZGA), Private Connect, Cloud Router, Edge Colocation

[238] Company Name: ZeroOutages
    Website: https://www.zerooutages.net
    Industry Category: Telecommunications, SD-WAN, SASE, Network Reliability
    Product/Service Categories: SD-WAN, SASE, LEO Satellite Internet, Network Redundancy, Managed Connectivity, Enterprise VPN
    Key Specific Products & Services: FlexPREM (Sophos SD-WAN), FlexPOINT (endpoint management), FlexSTREAM (cloud security), Enterprise SASE, Starlink LEO solutions, CloudHub, Virtual IP (VIP)

[239] Company Name: Ziply Fiber
    Website: https://ziplyfiber.com
    Industry Category: Telecommunications Ziply Fiber, Wikipedia
    Product/Service Categories: Fiber internet, DSL internet, phone/voice services, WiFi solutions, business connectivity (UCaaS, Ethernet) Ziply Fiber homepage, business page
    Key Specific Products & Services: Residential: Fiber 100/100, Fiber 300/300, Fiber Gig (1 Gig), 2 Gig Fiber, 5 Gig, 10 Gig, 50 Gig; DSL Internet; Ziply Fiber Phone, SafeConnect, WiFi 7 router. Business: 300/300, 500/500, Fiber Gig, Fiber 2 Gig, DSL up to 115 Mbps; Business Voice, Hosted Voice & Unified Communications, Whole Business WiFi, Ethernet Solutions plans, HighSpeedInternet, smallbusiness

[240] Company Name: Zoom Video Communications
    Website: https://www.zoom.com/en/about/
    Industry Category: UCaaS (Unified Communications as a Service)
    Product/Service Categories: Collaboration platform including communication (meetings, chat, phone), productivity (docs, whiteboard, clips), spaces (rooms, reservation), customer experience (contact center, webinars), AI tools, developer ecosystem
    Key Specific Products & Services: Zoom Meetings (Basic, Pro, Business, Enterprise tiers), Zoom Phone, Zoom Chat, Zoom Rooms, Zoom Contact Center (Essentials, Premium, Elite), Zoom Webinars & Events, Zoom AI Companion, Zoom Workplace

Generate the SQL INSERT statements now.