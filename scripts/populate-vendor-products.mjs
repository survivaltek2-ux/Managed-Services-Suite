import pg from "pg";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const p = (name, category, desc = "") => ({ name, category, description: desc });

const CONNECTIVITY = "Connectivity";
const VOICE = "Voice & UCaaS";
const CLOUD = "Cloud & Hosting";
const SECURITY = "Security";
const CONTACT_CENTER = "Contact Center";
const SD_WAN = "SD-WAN & Networking";
const DATA_CENTER = "Data Center";
const MOBILITY = "Mobility & IoT";
const COLLABORATION = "Collaboration";
const MANAGED_IT = "Managed IT";
const EXPENSE_MGMT = "Expense Management";
const CPAAS = "CPaaS & Messaging";

// Master vendor catalog: [name pattern (lowercase), products[]]
// Patterns are matched against vendor names (case-insensitive contains)
const CATALOG = [
  // ── AT&T ──────────────────────────────────────────────────────────────────
  { match: ["at&t", "bellsouth", "at&t wireless", "at&t-evergreen", "firstnet"],
    products: [
      p("Dedicated Internet Access (DIA)", CONNECTIVITY, "High-speed dedicated fiber or fixed wireless internet"),
      p("Business Fiber Internet", CONNECTIVITY, "Symmetric fiber broadband for businesses"),
      p("MPLS / Private Network", CONNECTIVITY, "Multi-protocol label switching enterprise WAN"),
      p("AT&T SD-WAN", SD_WAN, "Software-defined WAN with Cisco Meraki or VMware integration"),
      p("AT&T Ethernet", CONNECTIVITY, "Metro and long-haul Ethernet services"),
      p("SIP Trunking", VOICE, "Session initiation protocol voice trunks"),
      p("AT&T Office@Hand (UCaaS)", VOICE, "RingCentral-powered cloud business phone system"),
      p("AT&T Collaborate", VOICE, "Hosted PBX and unified communications"),
      p("FirstNet", MOBILITY, "Priority wireless network for first responders and public safety"),
      p("5G Business Internet", CONNECTIVITY, "Fixed 5G wireless broadband connectivity"),
      p("4G LTE Wireless", MOBILITY, "Business mobile data and cellular connectivity"),
      p("AT&T IoT Solutions", MOBILITY, "M2M and IoT connectivity management"),
      p("AT&T Cybersecurity", SECURITY, "Managed threat detection, SIEM, firewall management"),
      p("AT&T Cloud Solutions", CLOUD, "Cloud consulting and connectivity services"),
      p("Toll-Free Services", VOICE, "Inbound 800/toll-free number services"),
    ]
  },

  // ── Verizon ───────────────────────────────────────────────────────────────
  { match: ["verizon"],
    products: [
      p("Dedicated Internet Access (DIA)", CONNECTIVITY, "Business-grade dedicated fiber internet"),
      p("Private IP / MPLS", CONNECTIVITY, "Enterprise-grade private WAN connectivity"),
      p("Ethernet Services", CONNECTIVITY, "Metro and long-haul Ethernet"),
      p("Verizon SD-WAN", SD_WAN, "Managed SD-WAN with Cisco or VMware"),
      p("5G Business Internet", CONNECTIVITY, "Ultra-fast fixed wireless via 5G Ultra Wideband"),
      p("4G LTE Wireless", MOBILITY, "Business wireless and mobility solutions"),
      p("Verizon One Talk", VOICE, "Unified cloud communications and UCaaS"),
      p("SIP Trunking", VOICE, "Hosted SIP voice trunks"),
      p("Intelligent Edge Network (IEN)", SD_WAN, "Cloud-connected network-as-a-service"),
      p("IoT Solutions", MOBILITY, "M2M, telematics, asset tracking, and industrial IoT"),
      p("Managed Security Services", SECURITY, "Firewall, intrusion detection, SIEM"),
      p("Virtual Network Services (VNS)", CONNECTIVITY, "Network function virtualization"),
    ]
  },

  // ── Comcast Business ─────────────────────────────────────────────────────
  { match: ["comcast business", "comcast"],
    products: [
      p("Business Internet", CONNECTIVITY, "Coaxial broadband up to multi-Gbps speeds"),
      p("Dedicated Ethernet", CONNECTIVITY, "Dedicated fiber Ethernet over HFC plant"),
      p("MPLS", CONNECTIVITY, "Private multi-site WAN with QoS"),
      p("ActiveCore SD-WAN", SD_WAN, "Cloud-delivered managed SD-WAN platform"),
      p("SecurityEdge", SECURITY, "DNS-layer network security and content filtering"),
      p("Business VoiceEdge (UCaaS)", VOICE, "Cloud-hosted PBX and unified communications"),
      p("SIP Trunking", VOICE, "SIP-based voice trunks for PBX systems"),
      p("Managed Network Services", MANAGED_IT, "Fully managed LAN/WAN and Wi-Fi"),
      p("Business TV", CONNECTIVITY, "Business-class video programming"),
    ]
  },

  // ── Cox Business ─────────────────────────────────────────────────────────
  { match: ["cox"],
    products: [
      p("Business Internet", CONNECTIVITY, "Coaxial and fiber broadband for businesses"),
      p("Dedicated Internet Access (DIA)", CONNECTIVITY, "Symmetric dedicated fiber internet"),
      p("Cox Business Ethernet", CONNECTIVITY, "Metro Ethernet and wide area Ethernet"),
      p("MPLS", CONNECTIVITY, "Private label-switched WAN"),
      p("SD-WAN", SD_WAN, "Software-defined WAN management"),
      p("Cloud Solutions (IP Centrex)", VOICE, "Hosted PBX and cloud phone system"),
      p("SIP Trunking", VOICE, "SIP voice trunks for legacy PBX"),
      p("Business Voice", VOICE, "PRI, analog, and hosted voice lines"),
      p("Managed Wi-Fi", MANAGED_IT, "Cloud-managed wireless LAN service"),
    ]
  },

  // ── Lumen / CenturyLink / Level3 ─────────────────────────────────────────
  { match: ["centurylink", "lumen", "level3"],
    products: [
      p("Dedicated Internet Access (DIA)", CONNECTIVITY, "Enterprise fiber internet access"),
      p("MPLS / VPN", CONNECTIVITY, "Global private IP network with QoS"),
      p("Ethernet", CONNECTIVITY, "Metro and long-haul Ethernet wavelengths"),
      p("IQ Fiber", CONNECTIVITY, "Residential and small business fiber broadband"),
      p("SD-WAN", SD_WAN, "Managed SD-WAN with Cisco, Versa, or Fortinet"),
      p("UCaaS (Lumen UCaaS)", VOICE, "Cloud business phone and unified communications"),
      p("SIP Trunking", VOICE, "Enterprise SIP trunks and DIDs"),
      p("Managed Security Services", SECURITY, "SIEM, firewall, DDoS, threat intelligence"),
      p("Cloud Connect", CLOUD, "Direct cloud on-ramp to AWS, Azure, Google Cloud"),
      p("Wavelength Services", CONNECTIVITY, "High-capacity optical transport"),
      p("Colocation", DATA_CENTER, "Data center colocation in Lumen facilities"),
      p("DDoS Mitigation", SECURITY, "Scrubbing-based DDoS protection"),
      p("Black Lotus Labs Threat Intel", SECURITY, "Threat intelligence and attack surface management"),
    ]
  },

  // ── Spectrum Enterprise ───────────────────────────────────────────────────
  { match: ["spectrum", "charter"],
    products: [
      p("Dedicated Internet Access (DIA)", CONNECTIVITY, "Symmetric fiber dedicated internet"),
      p("Business Internet", CONNECTIVITY, "Shared fiber and coax broadband"),
      p("Ethernet Services", CONNECTIVITY, "Metro Ethernet for multi-location connectivity"),
      p("SD-WAN", SD_WAN, "Managed software-defined WAN"),
      p("Cloud Connect", CLOUD, "Direct connectivity to AWS and Azure"),
      p("UCaaS", VOICE, "Cloud-hosted business phone system"),
      p("SIP Trunking", VOICE, "SIP voice services for existing PBX"),
      p("Business Voice", VOICE, "Traditional PRI and hosted voice"),
      p("Managed Wi-Fi", MANAGED_IT, "Cloud-managed wireless access points"),
    ]
  },

  // ── Frontier ─────────────────────────────────────────────────────────────
  { match: ["frontier"],
    products: [
      p("Dedicated Internet Access (DIA)", CONNECTIVITY, "Business-grade dedicated fiber internet"),
      p("Business Fiber Internet", CONNECTIVITY, "Symmetric fiber broadband service"),
      p("Ethernet", CONNECTIVITY, "Metro and regional Ethernet services"),
      p("MPLS", CONNECTIVITY, "Private MPLS WAN for multi-site businesses"),
      p("SIP Trunking", VOICE, "SIP voice trunks for PBX connectivity"),
      p("Business Voice", VOICE, "Traditional phone lines and PRI"),
      p("SD-WAN", SD_WAN, "Software-defined WAN overlay"),
    ]
  },

  // ── Windstream ────────────────────────────────────────────────────────────
  { match: ["windstream", "paetec", "cavalier"],
    products: [
      p("Dedicated Internet Access (DIA)", CONNECTIVITY, "Symmetric fiber dedicated internet"),
      p("Kinetic Business Internet", CONNECTIVITY, "Broadband internet for SMB"),
      p("MPLS", CONNECTIVITY, "Managed private WAN with SLAs"),
      p("Ethernet", CONNECTIVITY, "Metro and wide-area Ethernet"),
      p("OfficeSuite UCaaS", VOICE, "Cloud business phone and collaboration"),
      p("SD-WAN (Windstream SD-WAN)", SD_WAN, "Managed SD-WAN powered by Aryaka or Cisco"),
      p("SIP Trunking", VOICE, "Hosted SIP trunks for PBX"),
      p("Managed Network Services", MANAGED_IT, "Proactive network management and monitoring"),
    ]
  },

  // ── Zayo ──────────────────────────────────────────────────────────────────
  { match: ["zayo", "allstream"],
    products: [
      p("Dedicated Internet Access (DIA)", CONNECTIVITY, "High-bandwidth dedicated fiber internet"),
      p("Ethernet", CONNECTIVITY, "Metro, regional, and long-haul Ethernet"),
      p("MPLS", CONNECTIVITY, "Label-switched private WAN"),
      p("Wavelengths", CONNECTIVITY, "10G, 100G, 400G optical wavelength services"),
      p("Dark Fiber", CONNECTIVITY, "Unlit fiber for custom buildouts"),
      p("Colocation", DATA_CENTER, "Data center colocation in Zayo facilities"),
      p("SD-WAN", SD_WAN, "Managed SD-WAN overlay on Zayo backbone"),
      p("Cloud Connect", CLOUD, "Direct connect to AWS, Azure, Google Cloud"),
    ]
  },

  // ── Cogent ────────────────────────────────────────────────────────────────
  { match: ["cogent"],
    products: [
      p("Dedicated Internet Access (DIA)", CONNECTIVITY, "Wholesale and enterprise fiber internet"),
      p("Ethernet", CONNECTIVITY, "Point-to-point and multi-point Ethernet"),
      p("Colocation", DATA_CENTER, "Data center rack and cage space"),
      p("IP Transit", CONNECTIVITY, "BGP peering and IP transit"),
      p("Wavelengths", CONNECTIVITY, "High-capacity optical transport"),
    ]
  },

  // ── GTT ───────────────────────────────────────────────────────────────────
  { match: ["gtt"],
    products: [
      p("Dedicated Internet Access (DIA)", CONNECTIVITY, "Global Tier 1 internet access"),
      p("MPLS", CONNECTIVITY, "Global private WAN connectivity"),
      p("Ethernet", CONNECTIVITY, "Metro and long-haul Ethernet"),
      p("SD-WAN", SD_WAN, "Global managed SD-WAN"),
      p("UCaaS", VOICE, "Cloud-hosted unified communications"),
      p("Security (SASE)", SECURITY, "Cloud-native security service edge"),
    ]
  },

  // ── Arelion (Telia Carrier) ────────────────────────────────────────────────
  { match: ["arelion", "telia"],
    products: [
      p("IP Transit", CONNECTIVITY, "Tier-1 global internet transit"),
      p("Ethernet", CONNECTIVITY, "Metro and international Ethernet"),
      p("Dark Fiber", CONNECTIVITY, "Long-haul unlit fiber capacity"),
      p("Wavelengths", CONNECTIVITY, "100G/400G optical transport"),
      p("SD-WAN", SD_WAN, "Managed WAN overlay service"),
    ]
  },

  // ── Colt ──────────────────────────────────────────────────────────────────
  { match: ["colt"],
    products: [
      p("Ethernet", CONNECTIVITY, "Pan-European and global Ethernet"),
      p("MPLS / IP VPN", CONNECTIVITY, "Global private network services"),
      p("Dedicated Internet Access (DIA)", CONNECTIVITY, "High-bandwidth dedicated internet"),
      p("SD-WAN", SD_WAN, "Global managed SD-WAN on Colt IQ Network"),
      p("UCaaS", VOICE, "Colt hosted voice and collaboration"),
      p("Colocation", DATA_CENTER, "European data center colocation"),
    ]
  },

  // ── Rogers ────────────────────────────────────────────────────────────────
  { match: ["rogers"],
    products: [
      p("Dedicated Internet Access (DIA)", CONNECTIVITY, "Business fiber internet (Canada)"),
      p("MPLS", CONNECTIVITY, "Managed private WAN (Canada)"),
      p("Ethernet", CONNECTIVITY, "Metro Ethernet (Canada)"),
      p("Business Wireless", MOBILITY, "4G/5G wireless plans (Canada)"),
      p("Hosted PBX (UCaaS)", VOICE, "Cloud business phone system"),
      p("SIP Trunking", VOICE, "SIP voice trunks"),
    ]
  },

  // ── iTel Networks ─────────────────────────────────────────────────────────
  { match: ["itel"],
    products: [
      p("Dedicated Internet Access (DIA)", CONNECTIVITY, "Carrier-grade internet (Canada)"),
      p("Ethernet", CONNECTIVITY, "Metro Ethernet (Canada)"),
      p("MPLS", CONNECTIVITY, "Private WAN (Canada)"),
      p("SIP Trunking", VOICE, "SIP trunks for Canadian businesses"),
    ]
  },

  // ── Claro ─────────────────────────────────────────────────────────────────
  { match: ["claro"],
    products: [
      p("Dedicated Internet Access (DIA)", CONNECTIVITY, "Business internet (Latin America)"),
      p("MPLS", CONNECTIVITY, "Private WAN (Latin America)"),
      p("Voice Services", VOICE, "Business telephony and trunking"),
      p("Wireless", MOBILITY, "Mobile connectivity (Latin America)"),
    ]
  },

  // ── China Telecom / China Mobile ──────────────────────────────────────────
  { match: ["china telecom", "china mobile"],
    products: [
      p("Dedicated Internet Access (DIA)", CONNECTIVITY, "Business internet access (APAC)"),
      p("MPLS / VPN", CONNECTIVITY, "Private WAN in China and APAC"),
      p("Ethernet", CONNECTIVITY, "Metro Ethernet services (APAC)"),
      p("IoT Connectivity", MOBILITY, "M2M and IoT services"),
      p("Cloud Services", CLOUD, "IaaS and PaaS (China region)"),
    ]
  },

  // ── HGC ───────────────────────────────────────────────────────────────────
  { match: ["hgc", "hutchison"],
    products: [
      p("Dedicated Internet Access (DIA)", CONNECTIVITY, "Business internet (Hong Kong/APAC)"),
      p("MPLS", CONNECTIVITY, "Private WAN (APAC)"),
      p("Ethernet", CONNECTIVITY, "Metro Ethernet (Hong Kong)"),
      p("International Private Leased Circuit", CONNECTIVITY, "Cross-border connectivity"),
    ]
  },

  // ── 8x8 ───────────────────────────────────────────────────────────────────
  { match: ["8x8"],
    products: [
      p("8x8 X Series (UCaaS)", VOICE, "Cloud phone, video, and team messaging"),
      p("8x8 Contact Center (CCaaS)", CONTACT_CENTER, "Omnichannel cloud contact center"),
      p("Video Meetings", COLLABORATION, "HD video conferencing and webinars"),
      p("Team Messaging (Spaces)", COLLABORATION, "Persistent team chat and collaboration"),
      p("SIP Trunking", VOICE, "Bring-your-own-carrier SIP trunks"),
      p("APIs & CPaaS", CPAAS, "Programmable voice, video, and messaging APIs"),
      p("Analytics & AI", CONTACT_CENTER, "Conversation intelligence and speech analytics"),
    ]
  },

  // ── RingCentral ───────────────────────────────────────────────────────────
  { match: ["ringcentral"],
    products: [
      p("RingEX (UCaaS)", VOICE, "All-in-one cloud phone, video, and messaging"),
      p("RingCX (CCaaS)", CONTACT_CENTER, "AI-powered cloud contact center"),
      p("RingCentral Video", COLLABORATION, "HD video meetings and webinars"),
      p("Team Messaging (Glip)", COLLABORATION, "Persistent team chat"),
      p("SIP Trunking", VOICE, "High-availability SIP trunks"),
      p("APIs & CPaaS", CPAAS, "Voice, SMS, fax, and video APIs"),
      p("AI & Conversation Intelligence", CONTACT_CENTER, "Real-time transcription and insights"),
    ]
  },

  // ── Avaya ─────────────────────────────────────────────────────────────────
  { match: ["avaya"],
    products: [
      p("Avaya Cloud Office (UCaaS)", VOICE, "RingCentral-powered cloud communications"),
      p("Avaya Experience Platform (CCaaS)", CONTACT_CENTER, "Omnichannel cloud contact center"),
      p("IP Office", VOICE, "On-premises and cloud PBX for SMB"),
      p("Aura Communication Manager", VOICE, "Enterprise unified communications platform"),
      p("Workforce Engagement Management", CONTACT_CENTER, "WFM, quality management, analytics"),
      p("Video Collaboration", COLLABORATION, "Video conferencing and team spaces"),
    ]
  },

  // ── Dialpad ───────────────────────────────────────────────────────────────
  { match: ["dialpad"],
    products: [
      p("Dialpad Talk (UCaaS)", VOICE, "AI-powered cloud business phone system"),
      p("Dialpad Contact Center (CCaaS)", CONTACT_CENTER, "AI-driven omnichannel contact center"),
      p("Dialpad Meetings", COLLABORATION, "AI-powered video meetings"),
      p("Dialpad Sell", CONTACT_CENTER, "AI sales dialer and coaching platform"),
      p("DialpadGPT", CONTACT_CENTER, "Real-time AI transcription and recommendations"),
    ]
  },

  // ── Five9 ─────────────────────────────────────────────────────────────────
  { match: ["five9"],
    products: [
      p("Five9 Cloud Contact Center (CCaaS)", CONTACT_CENTER, "Omnichannel inbound/outbound contact center"),
      p("Predictive Dialer", CONTACT_CENTER, "Outbound automated dialing system"),
      p("IVR / Self-Service", CONTACT_CENTER, "Interactive voice response and automation"),
      p("Workforce Management", CONTACT_CENTER, "Scheduling, forecasting, and performance tracking"),
      p("Intelligent Virtual Agent", CONTACT_CENTER, "AI-powered conversational bots"),
      p("Analytics & Reporting", CONTACT_CENTER, "Real-time and historical performance dashboards"),
      p("CRM Integrations", CONTACT_CENTER, "Salesforce, ServiceNow, Zendesk connectors"),
    ]
  },

  // ── Genesys ───────────────────────────────────────────────────────────────
  { match: ["genesys"],
    products: [
      p("Genesys Cloud CX (CCaaS)", CONTACT_CENTER, "All-in-one cloud contact center platform"),
      p("Genesys DX (Digital)", CONTACT_CENTER, "Digital and AI-powered customer engagement"),
      p("Workforce Engagement Management", CONTACT_CENTER, "WFM, coaching, analytics, and gamification"),
      p("AI & Automation", CONTACT_CENTER, "Predictive routing, bots, and NLU"),
      p("Journey Management", CONTACT_CENTER, "Customer journey analytics and orchestration"),
    ]
  },

  // ── Zoom ──────────────────────────────────────────────────────────────────
  { match: ["zoom"],
    products: [
      p("Zoom Phone (UCaaS)", VOICE, "Cloud phone system with global PSTN"),
      p("Zoom Meetings", COLLABORATION, "HD video conferencing platform"),
      p("Zoom Webinars", COLLABORATION, "Large-scale online events and webinars"),
      p("Zoom Team Chat", COLLABORATION, "Persistent team messaging and file sharing"),
      p("Zoom Contact Center (CCaaS)", CONTACT_CENTER, "AI-powered omnichannel contact center"),
      p("Zoom Rooms", COLLABORATION, "Conference room video system"),
      p("Zoom Events", COLLABORATION, "Virtual and hybrid event platform"),
      p("Zoom AI Companion", COLLABORATION, "AI meeting summaries, chat, and drafts"),
    ]
  },

  // ── GoTo ──────────────────────────────────────────────────────────────────
  { match: ["goto", "logmein", "fuze"],
    products: [
      p("GoTo Connect (UCaaS)", VOICE, "Cloud phone system and video meetings"),
      p("GoTo Contact Center (CCaaS)", CONTACT_CENTER, "Cloud-based contact center solution"),
      p("GoTo Meeting", COLLABORATION, "Video conferencing for teams"),
      p("GoTo Webinar", COLLABORATION, "Online webinar and virtual events platform"),
      p("GoTo Resolve (IT Management)", MANAGED_IT, "Remote IT support and device management"),
      p("GoTo Training", COLLABORATION, "Virtual instructor-led training platform"),
    ]
  },

  // ── CallTower ─────────────────────────────────────────────────────────────
  { match: ["calltower"],
    products: [
      p("Microsoft Teams Direct Routing", VOICE, "PSTN calling via Microsoft Teams"),
      p("Cisco Hosted Collaboration (HCS)", VOICE, "Cisco-powered cloud UC"),
      p("CT Cloud UCaaS", VOICE, "CallTower-native cloud phone system"),
      p("Operator Connect for Teams", VOICE, "Certified Microsoft Operator Connect"),
      p("CT Cloud Contact Center (CCaaS)", CONTACT_CENTER, "Omnichannel cloud contact center"),
      p("Global Connectivity", CONNECTIVITY, "SIP trunks and toll-free services worldwide"),
    ]
  },

  // ── Vonage ────────────────────────────────────────────────────────────────
  { match: ["vonage"],
    products: [
      p("Vonage Business Communications (UCaaS)", VOICE, "Cloud phone, video, and messaging"),
      p("Vonage Contact Center (CCaaS)", CONTACT_CENTER, "Salesforce-native cloud contact center"),
      p("Vonage Video API", CPAAS, "Programmable video for apps and platforms"),
      p("Vonage SMS API", CPAAS, "Programmable SMS and messaging"),
      p("Vonage Voice API", CPAAS, "Programmable voice calls and IVR"),
      p("SIP Trunking", VOICE, "Enterprise SIP trunks"),
    ]
  },

  // ── Ooma ──────────────────────────────────────────────────────────────────
  { match: ["ooma"],
    products: [
      p("Ooma Office (UCaaS)", VOICE, "Cloud PBX for small and medium businesses"),
      p("Ooma Enterprise", VOICE, "Scalable cloud UC for larger organizations"),
      p("Ooma AirDial (POTS Replacement)", VOICE, "Analog line replacement over 4G LTE"),
      p("Video Conferencing", COLLABORATION, "HD video meetings"),
    ]
  },

  // ── Broadvoice ────────────────────────────────────────────────────────────
  { match: ["broadvoice"],
    products: [
      p("b-hive UCaaS", VOICE, "Cloud PBX and unified communications platform"),
      p("SIP Trunking", VOICE, "Enterprise SIP trunks with failover"),
      p("Contact Center", CONTACT_CENTER, "Cloud contact center solution"),
      p("Toll-Free Services", VOICE, "Inbound toll-free calling"),
    ]
  },

  // ── AireSpring ────────────────────────────────────────────────────────────
  { match: ["airespring"],
    products: [
      p("Dedicated Internet Access (DIA)", CONNECTIVITY, "Fiber internet access nationwide"),
      p("AireSpring UCaaS", VOICE, "Cloud business phone system"),
      p("MPLS / Private WAN", CONNECTIVITY, "Private managed WAN"),
      p("SD-WAN", SD_WAN, "Managed software-defined WAN"),
      p("SIP Trunking", VOICE, "SIP voice trunks"),
      p("Managed IT Services", MANAGED_IT, "Managed security, network, and IT"),
      p("Microsoft Teams Direct Routing", VOICE, "Teams PSTN via AireSpring"),
    ]
  },

  // ── IntelePeer ────────────────────────────────────────────────────────────
  { match: ["intelepeer"],
    products: [
      p("CPaaS", CPAAS, "Cloud communications platform APIs"),
      p("Atmosphere AI", CONTACT_CENTER, "AI-powered voice automation and IVR"),
      p("SIP Trunking", VOICE, "High-availability SIP trunks"),
      p("SMS & Messaging", CPAAS, "Business SMS and A2P messaging"),
      p("Conversational AI", CONTACT_CENTER, "Natural language virtual agents"),
    ]
  },

  // ── Palo Alto Networks ───────────────────────────────────────────────────
  { match: ["palo alto"],
    products: [
      p("Prisma SASE", SECURITY, "Cloud-native secure access service edge"),
      p("Prisma SD-WAN (CloudGenix)", SD_WAN, "AI-powered SD-WAN with SASE integration"),
      p("Prisma Cloud", SECURITY, "Cloud-native security platform (CNAPP)"),
      p("Cortex XDR", SECURITY, "Extended detection and response across endpoints"),
      p("Cortex XSOAR", SECURITY, "Security orchestration and automated response"),
      p("WildFire", SECURITY, "Cloud-based malware analysis and prevention"),
      p("Next-Generation Firewall (NGFW)", SECURITY, "Hardware and virtual firewall appliances"),
      p("Unit 42 Managed Threat Hunting", SECURITY, "Proactive managed detection and response"),
    ]
  },

  // ── Cato Networks ─────────────────────────────────────────────────────────
  { match: ["cato"],
    products: [
      p("Cato SASE Cloud", SECURITY, "Converged network and security as a service"),
      p("Cato SD-WAN", SD_WAN, "Global SD-WAN over Cato private backbone"),
      p("Secure Web Gateway (SWG)", SECURITY, "Cloud-based web traffic inspection"),
      p("Cloud Access Security Broker (CASB)", SECURITY, "SaaS application visibility and control"),
      p("Zero Trust Network Access (ZTNA)", SECURITY, "Identity-based secure remote access"),
      p("Firewall as a Service (FWaaS)", SECURITY, "Cloud-native stateful firewall"),
      p("Threat Prevention", SECURITY, "IPS, anti-malware, and DNS security"),
    ]
  },

  // ── Arctic Wolf ───────────────────────────────────────────────────────────
  { match: ["arctic wolf"],
    products: [
      p("Managed Detection & Response (MDR)", SECURITY, "24/7 SOC monitoring and threat hunting"),
      p("Managed Risk", SECURITY, "Vulnerability assessment and risk quantification"),
      p("Managed Cloud Monitoring", SECURITY, "Cloud workload and configuration monitoring"),
      p("Security Awareness Training", SECURITY, "Phishing simulation and employee training"),
      p("Incident Response", SECURITY, "Managed IR with Arctic Wolf Incident Response team"),
    ]
  },

  // ── BlueVoyant ────────────────────────────────────────────────────────────
  { match: ["bluevoyant"],
    products: [
      p("Managed Detection & Response (MDR)", SECURITY, "Co-managed SOC with SIEM and SOAR"),
      p("Digital Risk Protection (MXDR)", SECURITY, "External threat monitoring and takedowns"),
      p("Supply Chain Defense", SECURITY, "Third-party cyber risk monitoring"),
      p("Threat Intelligence", SECURITY, "Curated intelligence feeds and advisory"),
    ]
  },

  // ── Imperva ───────────────────────────────────────────────────────────────
  { match: ["imperva"],
    products: [
      p("Web Application Firewall (WAF)", SECURITY, "Cloud and on-premises WAF"),
      p("DDoS Protection", SECURITY, "Always-on DDoS mitigation at the edge"),
      p("Bot Management", SECURITY, "Advanced bot detection and mitigation"),
      p("API Security", SECURITY, "API discovery, monitoring, and protection"),
      p("Data Security", SECURITY, "Database activity monitoring and data masking"),
      p("Runtime Application Self-Protection (RASP)", SECURITY, "In-app attack prevention"),
    ]
  },

  // ── Open Systems ──────────────────────────────────────────────────────────
  { match: ["open systems"],
    products: [
      p("Managed SASE", SECURITY, "Secure access service edge with managed operations"),
      p("Managed Detection & Response (MDR)", SECURITY, "24/7 SOC and threat response"),
      p("SD-WAN", SD_WAN, "Managed software-defined WAN"),
      p("Managed Firewall", SECURITY, "Cloud and on-premises firewall management"),
      p("Zero Trust Network Access (ZTNA)", SECURITY, "Identity-based secure access"),
    ]
  },

  // ── Aryaka ────────────────────────────────────────────────────────────────
  { match: ["aryaka"],
    products: [
      p("Aryaka Unified SASE", SECURITY, "Combined SD-WAN and security as a service"),
      p("Global SD-WAN", SD_WAN, "Private backbone SD-WAN for global enterprises"),
      p("WAN Optimization", SD_WAN, "Application acceleration and data deduplication"),
      p("Cloud Access (Cloud Connect)", CLOUD, "Direct cloud on-ramp to AWS, Azure, GCP"),
      p("Managed Security Service", SECURITY, "Firewall, CASB, SWG, and ZTNA"),
    ]
  },

  // ── Bigleaf ───────────────────────────────────────────────────────────────
  { match: ["bigleaf"],
    products: [
      p("SD-WAN / Internet Optimization", SD_WAN, "Cloud-first SD-WAN with QoS and load balancing"),
      p("Dynamic QoS", SD_WAN, "Real-time traffic prioritization for VoIP and cloud apps"),
      p("Failover & Redundancy", CONNECTIVITY, "Automatic failover across multiple ISPs"),
      p("Uptime SLA", CONNECTIVITY, "Business continuity for broadband connections"),
    ]
  },

  // ── Versa Networks ────────────────────────────────────────────────────────
  { match: ["versa"],
    products: [
      p("Versa SASE", SECURITY, "Unified cloud-delivered networking and security"),
      p("Versa SD-WAN", SD_WAN, "Enterprise SD-WAN with embedded security"),
      p("Versa Secure Web Gateway", SECURITY, "Cloud-based web proxy and content filtering"),
      p("Zero Trust Network Access", SECURITY, "Granular identity and device-based access"),
      p("Multi-Cloud Networking", CLOUD, "Automated cloud connectivity and segmentation"),
    ]
  },

  // ── Command Link ──────────────────────────────────────────────────────────
  { match: ["command link"],
    products: [
      p("Managed SD-WAN", SD_WAN, "Cloud-managed SD-WAN with analytics"),
      p("Dedicated Internet Access", CONNECTIVITY, "Business fiber internet"),
      p("Network Management", MANAGED_IT, "Proactive network monitoring and management"),
      p("VoIP / SIP Trunking", VOICE, "Cloud voice services"),
    ]
  },

  // ── Ecessa ────────────────────────────────────────────────────────────────
  { match: ["ecessa"],
    products: [
      p("WANworX SD-WAN", SD_WAN, "SD-WAN with carrier-agnostic bonding"),
      p("PowerLink WAN Optimization", SD_WAN, "Multi-WAN load balancing and optimization"),
      p("Internet Failover", CONNECTIVITY, "Automatic ISP failover and redundancy"),
    ]
  },

  // ── ADTRAN ────────────────────────────────────────────────────────────────
  { match: ["adtran"],
    products: [
      p("SD-WAN (Mosaic)", SD_WAN, "Cloud-managed SD-WAN and access platform"),
      p("Fiber Access (GPON/XGS-PON)", CONNECTIVITY, "Fiber-to-the-premise access equipment"),
      p("Network Infrastructure", SD_WAN, "Routers, switches, and access points"),
      p("Business Broadband CPE", CONNECTIVITY, "DSL and fiber customer premises equipment"),
      p("Managed Wi-Fi", MANAGED_IT, "Cloud-managed wireless LAN"),
    ]
  },

  // ── Equinix ───────────────────────────────────────────────────────────────
  { match: ["equinix"],
    products: [
      p("IBX Colocation", DATA_CENTER, "Carrier-neutral data center colocation"),
      p("Equinix Fabric", CONNECTIVITY, "Software-defined interconnection platform"),
      p("Network Edge (Virtual Network Services)", SD_WAN, "Deploy virtual network functions at the edge"),
      p("Equinix Metal (Bare Metal)", CLOUD, "On-demand bare metal infrastructure"),
      p("Digital Exchange", CONNECTIVITY, "Cloud and internet exchange points"),
      p("Private Connectivity / Direct Connect", CLOUD, "Private circuits to AWS, Azure, Google"),
    ]
  },

  // ── CoreSite ──────────────────────────────────────────────────────────────
  { match: ["coresite"],
    products: [
      p("Colocation", DATA_CENTER, "Carrier-neutral data center colocation"),
      p("Cloud On-Ramps", CLOUD, "Private connectivity to major cloud providers"),
      p("Open Cloud Exchange (OCX)", CONNECTIVITY, "Multi-cloud interconnection fabric"),
      p("Cross Connects", CONNECTIVITY, "Physical and virtual cross connects"),
    ]
  },

  // ── CyrusOne ──────────────────────────────────────────────────────────────
  { match: ["cyrusone"],
    products: [
      p("Colocation", DATA_CENTER, "Enterprise and hyperscale data center colocation"),
      p("Managed Services", MANAGED_IT, "Data center managed operations"),
      p("Custom Data Center Solutions", DATA_CENTER, "Build-to-suit data center campuses"),
    ]
  },

  // ── QTS Data Centers ─────────────────────────────────────────────────────
  { match: ["qts"],
    products: [
      p("Colocation", DATA_CENTER, "Enterprise colocation in QTS facilities"),
      p("Managed Services", MANAGED_IT, "Fully managed IT infrastructure"),
      p("HyperScale", DATA_CENTER, "Large-scale wholesale data center capacity"),
      p("Software-Defined Data Center", CLOUD, "API-driven infrastructure management"),
    ]
  },

  // ── DataBank ──────────────────────────────────────────────────────────────
  { match: ["databank"],
    products: [
      p("Colocation", DATA_CENTER, "Edge and regional data center colocation"),
      p("vCloud Managed Services", CLOUD, "VMware-based private cloud"),
      p("Edge Infrastructure", DATA_CENTER, "Distributed edge computing facilities"),
      p("Disaster Recovery as a Service (DRaaS)", CLOUD, "Cloud-based business continuity"),
    ]
  },

  // ── Digital Realty ────────────────────────────────────────────────────────
  { match: ["digital realty"],
    products: [
      p("Colocation", DATA_CENTER, "Global data center colocation"),
      p("PlatformDIGITAL", DATA_CENTER, "Global data center platform and interconnection"),
      p("ServiceFabric", CONNECTIVITY, "Global interconnection and cloud access"),
      p("Hyperscale Data Centers", DATA_CENTER, "Wholesale capacity for large cloud consumers"),
    ]
  },

  // ── Cologix ───────────────────────────────────────────────────────────────
  { match: ["cologix"],
    products: [
      p("Colocation", DATA_CENTER, "Canadian and US network-neutral colocation"),
      p("Interconnection", CONNECTIVITY, "Carrier and cloud interconnection services"),
      p("Cloud On-Ramps", CLOUD, "Direct access to AWS, Azure, and GCP"),
    ]
  },

  // ── 365 Data Centers ─────────────────────────────────────────────────────
  { match: ["365 data"],
    products: [
      p("Colocation", DATA_CENTER, "East coast data center colocation"),
      p("Managed Hosting", CLOUD, "Dedicated and managed server hosting"),
      p("Network Services", CONNECTIVITY, "High-bandwidth internet and cross connects"),
    ]
  },

  // ── Peak 10 ───────────────────────────────────────────────────────────────
  { match: ["peak 10", "peak10"],
    products: [
      p("Colocation", DATA_CENTER, "Southeast US data center colocation"),
      p("Managed Cloud", CLOUD, "Private and hybrid cloud solutions"),
      p("Managed Services", MANAGED_IT, "Managed network, security, and hosting"),
    ]
  },

  // ── PhoenixNAP ────────────────────────────────────────────────────────────
  { match: ["phoenixnap"],
    products: [
      p("Bare Metal Cloud", CLOUD, "On-demand bare metal servers globally"),
      p("Cloud VMs", CLOUD, "Scalable virtual machine infrastructure"),
      p("Colocation", DATA_CENTER, "Phoenix and global data center colocation"),
      p("Network Edge Services", CONNECTIVITY, "Low-latency global network edge"),
      p("DRaaS", CLOUD, "Disaster recovery as a service"),
    ]
  },

  // ── Rackspace ─────────────────────────────────────────────────────────────
  { match: ["rackspace"],
    products: [
      p("Managed AWS", CLOUD, "AWS cloud management and optimization"),
      p("Managed Azure", CLOUD, "Azure cloud management and DevOps"),
      p("Managed Google Cloud", CLOUD, "GCP management and migration"),
      p("Private Cloud", CLOUD, "OpenStack and VMware private cloud"),
      p("Colocation", DATA_CENTER, "Data center rack and cage colocation"),
      p("Cybersecurity", SECURITY, "Managed security operations and compliance"),
    ]
  },

  // ── Flexential ────────────────────────────────────────────────────────────
  { match: ["flexential"],
    products: [
      p("Colocation", DATA_CENTER, "Colocation across 40+ data center facilities"),
      p("Hybrid Cloud (FlexAnywhere)", CLOUD, "Managed hybrid cloud infrastructure"),
      p("DRaaS", CLOUD, "Disaster recovery and business continuity"),
      p("Managed Networking", MANAGED_IT, "SD-WAN and network management"),
    ]
  },

  // ── Expedient ─────────────────────────────────────────────────────────────
  { match: ["expedient"],
    products: [
      p("Colocation", DATA_CENTER, "Regional data center colocation"),
      p("Private Cloud", CLOUD, "VMware-based private cloud"),
      p("DRaaS", CLOUD, "Disaster recovery as a service"),
      p("Managed Security", SECURITY, "Endpoint protection and SIEM"),
    ]
  },

  // ── 11:11 Systems ─────────────────────────────────────────────────────────
  { match: ["11:11"],
    products: [
      p("Cloud Infrastructure (IaaS)", CLOUD, "Scalable virtual infrastructure"),
      p("DRaaS", CLOUD, "Disaster recovery and cloud backup"),
      p("Managed Network", MANAGED_IT, "SD-WAN and connectivity management"),
      p("Security as a Service", SECURITY, "Managed threat detection and response"),
    ]
  },

  // ── Granite Telecom ───────────────────────────────────────────────────────
  { match: ["granite"],
    products: [
      p("Dedicated Internet Access (DIA)", CONNECTIVITY, "Managed broadband aggregation"),
      p("POTS/Analog Lines", VOICE, "Traditional copper phone line management"),
      p("SIP Trunking", VOICE, "Managed SIP trunk services"),
      p("SD-WAN", SD_WAN, "Managed SD-WAN service"),
      p("Hosted PBX", VOICE, "Cloud-based PBX platform"),
      p("Network Aggregation", CONNECTIVITY, "Single-source telecom management"),
    ]
  },

  // ── Lingo / BullsEye ──────────────────────────────────────────────────────
  { match: ["bullseye", "lingo"],
    products: [
      p("Hosted PBX (UCaaS)", VOICE, "Cloud business phone system"),
      p("SIP Trunking", VOICE, "SIP voice trunks for PBX connectivity"),
      p("Toll-Free Services", VOICE, "Inbound toll-free number management"),
      p("Business VoIP", VOICE, "Internet-based voice calling"),
    ]
  },

  // ── ACC Business ──────────────────────────────────────────────────────────
  { match: ["acc business"],
    products: [
      p("Dedicated Internet Access (DIA)", CONNECTIVITY, "Fiber internet over AT&T network"),
      p("MPLS / Virtual Private Network", CONNECTIVITY, "Private WAN on AT&T infrastructure"),
      p("Business Phone", VOICE, "Voice services over AT&T network"),
    ]
  },

  // ── BCN Telecom ────────────────────────────────────────────────────────────
  { match: ["bcn telecom"],
    products: [
      p("Dedicated Internet Access (DIA)", CONNECTIVITY, "Fiber and fixed wireless internet"),
      p("MPLS / Private WAN", CONNECTIVITY, "Managed WAN services"),
      p("SIP Trunking", VOICE, "SIP voice trunks"),
      p("Hosted PBX", VOICE, "Cloud phone system"),
    ]
  },

  // ── Astound Business ──────────────────────────────────────────────────────
  { match: ["astound"],
    products: [
      p("Business Internet", CONNECTIVITY, "Fiber and coax broadband"),
      p("Dedicated Internet Access (DIA)", CONNECTIVITY, "Symmetric dedicated fiber internet"),
      p("Business Ethernet", CONNECTIVITY, "Metro Ethernet services"),
      p("Business Voice", VOICE, "VoIP and hosted PBX"),
    ]
  },

  // ── WOW Business ──────────────────────────────────────────────────────────
  { match: ["wow business"],
    products: [
      p("Business Internet", CONNECTIVITY, "Fiber and coax broadband"),
      p("Dedicated Internet Access (DIA)", CONNECTIVITY, "Symmetric dedicated fiber"),
      p("Business Voice", VOICE, "Hosted VoIP and analog lines"),
      p("Managed Wi-Fi", MANAGED_IT, "Cloud-managed wireless"),
    ]
  },

  // ── Altice (Optimum / SuddenLink) ─────────────────────────────────────────
  { match: ["altice", "optimum", "suddenlink"],
    products: [
      p("Business Internet", CONNECTIVITY, "Coax and fiber broadband"),
      p("Dedicated Internet Access (DIA)", CONNECTIVITY, "Symmetric dedicated fiber internet"),
      p("Business Voice", VOICE, "VoIP and analog lines"),
      p("Business TV", CONNECTIVITY, "Commercial TV programming"),
    ]
  },

  // ── C Spire ───────────────────────────────────────────────────────────────
  { match: ["c spire"],
    products: [
      p("Business Internet (Fiber)", CONNECTIVITY, "Gigabit fiber internet"),
      p("Business Wireless", MOBILITY, "4G LTE and 5G mobility services"),
      p("Managed IT Services", MANAGED_IT, "Proactive IT management"),
      p("UCaaS", VOICE, "Cloud business communications"),
    ]
  },

  // ── Crown Castle ─────────────────────────────────────────────────────────
  { match: ["crown castle"],
    products: [
      p("Small Cell / DAS", CONNECTIVITY, "Distributed antenna systems and small cells"),
      p("Fiber Solutions", CONNECTIVITY, "Dark fiber and lit fiber services"),
      p("Tower Wireless Infrastructure", MOBILITY, "Macro cell tower leasing"),
    ]
  },

  // ── DukeNet ───────────────────────────────────────────────────────────────
  { match: ["dukenet"],
    products: [
      p("Ethernet Services", CONNECTIVITY, "Metro and regional Ethernet (Carolinas)"),
      p("Dark Fiber", CONNECTIVITY, "Unlit fiber capacity"),
      p("Dedicated Internet Access (DIA)", CONNECTIVITY, "Business fiber internet"),
      p("Colocation", DATA_CENTER, "Data center colocation facilities"),
    ]
  },

  // ── FiberLight ────────────────────────────────────────────────────────────
  { match: ["fiberlight"],
    products: [
      p("Dark Fiber", CONNECTIVITY, "Unlit long-haul and metro fiber"),
      p("Metro Ethernet", CONNECTIVITY, "Managed Ethernet over fiber"),
      p("Wavelengths", CONNECTIVITY, "High-capacity optical transport"),
    ]
  },

  // ── Pilot Fiber ───────────────────────────────────────────────────────────
  { match: ["pilot fiber"],
    products: [
      p("Dedicated Internet Access (DIA)", CONNECTIVITY, "NYC fiber internet"),
      p("Ethernet", CONNECTIVITY, "Metro Ethernet (New York Metro)"),
      p("Colocation (NYC)", DATA_CENTER, "New York data center services"),
    ]
  },

  // ── Segra ─────────────────────────────────────────────────────────────────
  { match: ["segra"],
    products: [
      p("Dedicated Internet Access (DIA)", CONNECTIVITY, "Southeast US fiber internet"),
      p("MPLS / Private WAN", CONNECTIVITY, "Managed private network (Southeast)"),
      p("Ethernet Services", CONNECTIVITY, "Metro and regional Ethernet"),
      p("Colocation", DATA_CENTER, "Southeast data center services"),
      p("Voice / SIP Trunking", VOICE, "Business voice services"),
    ]
  },

  // ── Uniti Fiber ───────────────────────────────────────────────────────────
  { match: ["uniti fiber"],
    products: [
      p("Dark Fiber", CONNECTIVITY, "Unlit fiber leases"),
      p("Ethernet", CONNECTIVITY, "Managed metro Ethernet"),
      p("Backhaul Services", CONNECTIVITY, "Wireless carrier backhaul"),
    ]
  },

  // ── Wave Business ─────────────────────────────────────────────────────────
  { match: ["wave business"],
    products: [
      p("Dedicated Internet Access (DIA)", CONNECTIVITY, "Pacific Northwest fiber internet"),
      p("Ethernet", CONNECTIVITY, "Metro Ethernet services"),
      p("Business Phone / Voice", VOICE, "Hosted voice services"),
    ]
  },

  // ── Firstlight ────────────────────────────────────────────────────────────
  { match: ["firstlight"],
    products: [
      p("Fiber / Dark Fiber", CONNECTIVITY, "New England regional fiber network"),
      p("Ethernet", CONNECTIVITY, "Metro and regional Ethernet"),
      p("Dedicated Internet Access (DIA)", CONNECTIVITY, "Business fiber internet"),
      p("Colocation", DATA_CENTER, "Northeast data center services"),
    ]
  },

  // ── Zenlayer ──────────────────────────────────────────────────────────────
  { match: ["zenlayer"],
    products: [
      p("Bare Metal Cloud", CLOUD, "On-demand bare metal globally"),
      p("Edge Computing", CLOUD, "Low-latency edge infrastructure"),
      p("CDN", CLOUD, "Content delivery network"),
      p("SD-WAN", SD_WAN, "Global software-defined networking"),
    ]
  },

  // ── Viasat ────────────────────────────────────────────────────────────────
  { match: ["viasat"],
    products: [
      p("Satellite Broadband", CONNECTIVITY, "High-throughput satellite internet"),
      p("Government Connectivity", CONNECTIVITY, "Satellite for government and military"),
      p("Aviation Connectivity", CONNECTIVITY, "In-flight satellite Wi-Fi"),
      p("Maritime Connectivity", CONNECTIVITY, "Satellite internet for vessels"),
    ]
  },

  // ── Globalgig ─────────────────────────────────────────────────────────────
  { match: ["globalgig"],
    products: [
      p("Global Mobile Data (IoT/M2M)", MOBILITY, "Multi-network global SIM and data"),
      p("IoT Connectivity Management", MOBILITY, "SIM lifecycle and data management"),
    ]
  },

  // ── Eseye ─────────────────────────────────────────────────────────────────
  { match: ["eseye"],
    products: [
      p("Global IoT SIM", MOBILITY, "Multi-network SIM for global IoT deployments"),
      p("IoT Connectivity Platform (AnyNet+)", MOBILITY, "Intelligent IoT network switching"),
      p("M2M Connectivity", MOBILITY, "Machine-to-machine data services"),
    ]
  },

  // ── EPIC iO ───────────────────────────────────────────────────────────────
  { match: ["epic io", "epic\u00a0io"],
    products: [
      p("5G / LTE Fixed Wireless", CONNECTIVITY, "Wireless broadband for enterprise sites"),
      p("IoT Platform", MOBILITY, "Industrial IoT monitoring and analytics"),
      p("Smart City Solutions", MOBILITY, "Video analytics and infrastructure intelligence"),
      p("Managed Connectivity", MANAGED_IT, "Managed LTE/5G connectivity services"),
    ]
  },

  // ── Radix IoT ─────────────────────────────────────────────────────────────
  { match: ["radix iot"],
    products: [
      p("IoT Data Platform", MOBILITY, "Device management and data analytics"),
      p("Edge Analytics", MOBILITY, "Real-time data processing at the edge"),
      p("DCIM Integration", DATA_CENTER, "Data center infrastructure monitoring"),
    ]
  },

  // ── Wireless Watchdogs ────────────────────────────────────────────────────
  { match: ["wireless watchdogs"],
    products: [
      p("Wireless Expense Management (WEM)", EXPENSE_MGMT, "Mobile cost optimization and audit"),
      p("Mobile Device Management (MDM)", MOBILITY, "Enterprise device management"),
      p("IoT Connectivity Management", MOBILITY, "SIM and IoT data management"),
    ]
  },

  // ── vMOX ─────────────────────────────────────────────────────────────────
  { match: ["vmox"],
    products: [
      p("Wireless Management Platform", EXPENSE_MGMT, "Mobile lifecycle and expense management"),
      p("Telecom Expense Management (TEM)", EXPENSE_MGMT, "Invoice audit and cost optimization"),
      p("MDM / EMM", MOBILITY, "Mobile device and application management"),
    ]
  },

  // ── Brightfin ─────────────────────────────────────────────────────────────
  { match: ["brightfin"],
    products: [
      p("Telecom Expense Management (TEM)", EXPENSE_MGMT, "Audit and optimization of telecom invoices"),
      p("Technology Lifecycle Management", EXPENSE_MGMT, "Device procurement and lifecycle tracking"),
      p("Wireless Management", EXPENSE_MGMT, "Mobile cost analytics and plan optimization"),
    ]
  },

  // ── Advantix ──────────────────────────────────────────────────────────────
  { match: ["advantix"],
    products: [
      p("Telecom Expense Management (TEM)", EXPENSE_MGMT, "Invoice audit and cost reduction"),
      p("Wireless Management", EXPENSE_MGMT, "Mobile expense optimization"),
      p("IT Asset Management", EXPENSE_MGMT, "Hardware and software lifecycle management"),
    ]
  },

  // ── Blue Mantis / Green Pages ─────────────────────────────────────────────
  { match: ["blue mantis", "greenpages", "green pages"],
    products: [
      p("Managed IT Services", MANAGED_IT, "Proactive IT infrastructure management"),
      p("Cloud Solutions", CLOUD, "Public and private cloud consulting"),
      p("Cybersecurity Services", SECURITY, "Managed security operations and compliance"),
      p("Collaboration", COLLABORATION, "Microsoft 365 and Teams solutions"),
    ]
  },

  // ── CBTS ──────────────────────────────────────────────────────────────────
  { match: ["cbts"],
    products: [
      p("Managed IT Services", MANAGED_IT, "IT operations and infrastructure management"),
      p("UCaaS", VOICE, "Cloud communications and collaboration"),
      p("Cloud Services", CLOUD, "Managed cloud infrastructure"),
      p("Cybersecurity", SECURITY, "Managed security and compliance"),
      p("Connectivity", CONNECTIVITY, "SD-WAN and network services"),
    ]
  },

  // ── Carousel Industries ───────────────────────────────────────────────────
  { match: ["carousel"],
    products: [
      p("Managed IT Services", MANAGED_IT, "IT infrastructure management"),
      p("Cloud Solutions", CLOUD, "Cloud migration and managed cloud"),
      p("Cybersecurity", SECURITY, "Managed security operations"),
      p("Communications (UCaaS)", VOICE, "Unified communications solutions"),
    ]
  },

  // ── Park Place Technologies ───────────────────────────────────────────────
  { match: ["park place"],
    products: [
      p("Data Center Hardware Support", MANAGED_IT, "Multi-vendor maintenance for servers and storage"),
      p("DCIM (Entuity)", DATA_CENTER, "Data center infrastructure management software"),
      p("Lifecycle Management", MANAGED_IT, "Asset disposal and lifecycle services"),
      p("Network Management", MANAGED_IT, "Network device monitoring and support"),
    ]
  },

  // ── Continuant ────────────────────────────────────────────────────────────
  { match: ["continuant"],
    products: [
      p("Avaya Support & Management", MANAGED_IT, "Managed Avaya UC and contact center"),
      p("Cisco Support & Management", MANAGED_IT, "Managed Cisco collaboration and networking"),
      p("Microsoft Teams Support", MANAGED_IT, "Teams deployment and managed services"),
      p("Legacy PBX Managed Services", MANAGED_IT, "Maintenance for end-of-life phone systems"),
    ]
  },

  // ── IBM ───────────────────────────────────────────────────────────────────
  { match: ["ibm"],
    products: [
      p("IBM Cloud", CLOUD, "Hybrid cloud platform with OpenShift"),
      p("IBM Security", SECURITY, "QRadar SIEM, X-Force threat intelligence"),
      p("AI & Watson", CLOUD, "Artificial intelligence and data analytics"),
      p("Managed Services", MANAGED_IT, "IT infrastructure outsourcing"),
      p("Consulting Services", MANAGED_IT, "Digital transformation and cloud strategy"),
    ]
  },

  // ── Google (Workspace / Fiber) ────────────────────────────────────────────
  { match: ["google"],
    products: [
      p("Google Workspace", COLLABORATION, "Cloud productivity suite (Gmail, Docs, Meet)"),
      p("Google Cloud Platform (GCP)", CLOUD, "IaaS and PaaS cloud services"),
      p("Google Fiber Business", CONNECTIVITY, "Gigabit fiber internet"),
      p("Google Voice", VOICE, "Cloud business phone system"),
    ]
  },

  // ── Alibaba Cloud ─────────────────────────────────────────────────────────
  { match: ["alibaba cloud"],
    products: [
      p("Elastic Compute Service (ECS)", CLOUD, "Scalable virtual machines"),
      p("Object Storage Service (OSS)", CLOUD, "Scalable object storage"),
      p("Content Delivery Network (CDN)", CLOUD, "Global content acceleration"),
      p("Alibaba Cloud VPN", CONNECTIVITY, "Secure cloud connectivity"),
      p("ApsaraDB", CLOUD, "Managed databases (MySQL, PostgreSQL, Redis)"),
    ]
  },

  // ── Infobip ───────────────────────────────────────────────────────────────
  { match: ["infobip"],
    products: [
      p("SMS & A2P Messaging", CPAAS, "Business text messaging at scale"),
      p("WhatsApp Business API", CPAAS, "WhatsApp messaging for enterprises"),
      p("Voice API", CPAAS, "Programmable voice calls"),
      p("Omnichannel Engagement Hub", CPAAS, "Multi-channel messaging orchestration"),
      p("Conversational AI (Answers)", CONTACT_CENTER, "Chatbot and virtual agent platform"),
    ]
  },

  // ── IntelePeer (duplicate entry) ──────────────────────────────────────────
  { match: ["cpaaS"],
    products: []
  },

  // ── West Interactive / West UC ─────────────────────────────────────────────
  { match: ["west interactive", "west uc", "intrado"],
    products: [
      p("IVR / Self-Service", CONTACT_CENTER, "Interactive voice response automation"),
      p("Cloud Contact Center (CCaaS)", CONTACT_CENTER, "Omnichannel cloud contact center"),
      p("Conferencing", COLLABORATION, "Audio and web conferencing services"),
      p("Emergency Communications", VOICE, "Mass notification and emergency alerts"),
      p("UCaaS", VOICE, "Cloud unified communications"),
    ]
  },

  // ── AnswerNet ─────────────────────────────────────────────────────────────
  { match: ["answernet"],
    products: [
      p("Answering Services", CONTACT_CENTER, "24/7 live call answering"),
      p("Contact Center Outsourcing (BPO)", CONTACT_CENTER, "Outsourced customer service"),
      p("Order Entry Services", CONTACT_CENTER, "Inbound sales and order processing"),
      p("Appointment Scheduling", CONTACT_CENTER, "Live scheduling for healthcare and services"),
    ]
  },

  // ── Ruby ──────────────────────────────────────────────────────────────────
  { match: ["ruby"],
    products: [
      p("Virtual Receptionist", CONTACT_CENTER, "Live answering for small businesses"),
      p("Live Chat", CONTACT_CENTER, "Website chat staffed by live agents"),
      p("Call Answering", CONTACT_CENTER, "24/7 phone answering service"),
    ]
  },

  // ── Outsource Consultants ─────────────────────────────────────────────────
  { match: ["outsource consultants"],
    products: [
      p("Contact Center Consulting", CONTACT_CENTER, "Vendor selection and CX optimization"),
      p("BPO Staffing", CONTACT_CENTER, "Contact center outsourcing partner sourcing"),
      p("Contact Center Outsourcing (BPO)", CONTACT_CENTER, "Full service contact center management"),
    ]
  },

  // ── Alvaria / Aspect ─────────────────────────────────────────────────────
  { match: ["alvaria", "aspect"],
    products: [
      p("Workforce Management (WFM)", CONTACT_CENTER, "Scheduling, forecasting, and adherence"),
      p("Alvaria CX (CCaaS)", CONTACT_CENTER, "Cloud contact center platform"),
      p("IVR / Self-Service", CONTACT_CENTER, "Automated interactive voice response"),
      p("Quality Management", CONTACT_CENTER, "Call recording and quality scoring"),
      p("Outbound Dialing", CONTACT_CENTER, "Automated and predictive dialer"),
    ]
  },

  // ── Verint ────────────────────────────────────────────────────────────────
  { match: ["verint"],
    products: [
      p("Workforce Engagement Management (WEM)", CONTACT_CENTER, "Scheduling, coaching, quality"),
      p("Customer Analytics", CONTACT_CENTER, "Speech and text analytics"),
      p("AI-Powered Knowledge Base", CONTACT_CENTER, "Intelligent knowledge management"),
      p("Workforce Management", CONTACT_CENTER, "Forecasting and scheduling"),
      p("Quality Bot", CONTACT_CENTER, "Automated AI quality scoring"),
    ]
  },

  // ── Eckoh ─────────────────────────────────────────────────────────────────
  { match: ["eckoh"],
    products: [
      p("PCI Compliance (EckohPAY)", SECURITY, "Secure payment IVR and agent-assist"),
      p("CallGuard (Agent Pause)", SECURITY, "PCI-compliant payment data protection"),
      p("Contact Center Security", SECURITY, "Secure data handling in the contact center"),
    ]
  },

  // ── PCI Pal ───────────────────────────────────────────────────────────────
  { match: ["pci pal"],
    products: [
      p("Secure IVR Payment", SECURITY, "PCI DSS compliant phone payment processing"),
      p("Agent Assist", SECURITY, "DTMF masking for agent-assisted payments"),
      p("Digital Payments", SECURITY, "Secure online and chat payment links"),
    ]
  },

  // ── Bucher + Suter ────────────────────────────────────────────────────────
  { match: ["bucher"],
    products: [
      p("Cisco Contact Center Integration", CONTACT_CENTER, "CRM connectors for Cisco UCCE/UCCX"),
      p("Genesys CRM Connector", CONTACT_CENTER, "Salesforce and ServiceNow integration"),
      p("Agent Desktop", CONTACT_CENTER, "Unified agent workspace for contact centers"),
    ]
  },

  // ── Broadsoft (Cisco BroadCloud) ───────────────────────────────────────────
  { match: ["broadsoft"],
    products: [
      p("BroadCloud Hosted PBX", VOICE, "Cloud PBX platform for service providers"),
      p("SIP Trunking", VOICE, "SIP connectivity platform"),
      p("UCaaS Platform", VOICE, "White-label unified communications"),
    ]
  },

  // ── Faxpipe ───────────────────────────────────────────────────────────────
  { match: ["faxpipe"],
    products: [
      p("Cloud Fax", CPAAS, "Internet fax and fax-to-email services"),
      p("eFax / Fax API", CPAAS, "Programmable fax integration"),
    ]
  },

  // ── FreeConferenceCall / PGi / Raindance ─────────────────────────────────
  { match: ["freeconferencecall", "pgi", "raindance", "intercall"],
    products: [
      p("Audio Conferencing", COLLABORATION, "Toll and toll-free conference calling"),
      p("Web Conferencing", COLLABORATION, "Online meeting and screen sharing"),
      p("Video Conferencing", COLLABORATION, "HD video meetings"),
      p("Event Webcasting", COLLABORATION, "Large-scale virtual events"),
    ]
  },

  // ── Intermedia ────────────────────────────────────────────────────────────
  { match: ["intermedia"],
    products: [
      p("Intermedia Unite (UCaaS)", VOICE, "Cloud PBX, video, and team messaging"),
      p("Intermedia Contact Center", CONTACT_CENTER, "Cloud contact center platform"),
      p("Email Hosting (Exchange)", COLLABORATION, "Managed Microsoft Exchange hosting"),
      p("Cloud Backup (SecuriSync)", CLOUD, "Endpoint and cloud data backup"),
    ]
  },

  // ── Dialpad covered above ─────────────────────────────────────────────────

  // ── Capacity ──────────────────────────────────────────────────────────────
  { match: ["capacity.com"],
    products: [
      p("AI-Powered Knowledge Base", CONTACT_CENTER, "Self-service helpdesk automation"),
      p("Chatbot / Virtual Agent", CONTACT_CENTER, "Conversational AI for support"),
    ]
  },

  // ── PolyAI ────────────────────────────────────────────────────────────────
  { match: ["polyai"],
    products: [
      p("Conversational Voice AI", CONTACT_CENTER, "AI voice agent for customer service"),
      p("Automated Phone Handling", CONTACT_CENTER, "AI-powered call automation"),
    ]
  },

  // ── EliteCX.ai ────────────────────────────────────────────────────────────
  { match: ["elitecx"],
    products: [
      p("AI Contact Center Solutions", CONTACT_CENTER, "AI-driven customer experience platform"),
      p("Conversational AI", CONTACT_CENTER, "Intelligent virtual agent and automation"),
    ]
  },

  // ── Humach ────────────────────────────────────────────────────────────────
  { match: ["humach"],
    products: [
      p("Managed Contact Center (BPO)", CONTACT_CENTER, "Outsourced contact center with AI"),
      p("mAI (AI Agent)", CONTACT_CENTER, "Digital AI agent for customer interactions"),
      p("CX Consulting", CONTACT_CENTER, "Customer experience strategy and transformation"),
    ]
  },

  // ── InflowCX ──────────────────────────────────────────────────────────────
  { match: ["inflowcx"],
    products: [
      p("CX Managed Services", CONTACT_CENTER, "Managed contact center operations"),
      p("Genesys & Avaya Support", CONTACT_CENTER, "Platform management and optimization"),
      p("CX Consulting", CONTACT_CENTER, "Contact center strategy and design"),
    ]
  },

  // ── BridgePointeCX ────────────────────────────────────────────────────────
  { match: ["bridgepointecx"],
    products: [
      p("CCaaS Consulting & Management", CONTACT_CENTER, "Contact center platform selection and support"),
      p("Genesys Managed Services", CONTACT_CENTER, "Managed Genesys Cloud implementation"),
      p("Workforce Optimization", CONTACT_CENTER, "WFM and quality management consulting"),
    ]
  },

  // ── Zailab ────────────────────────────────────────────────────────────────
  { match: ["zailab"],
    products: [
      p("Cloud Contact Center", CONTACT_CENTER, "Usage-based CCaaS platform"),
      p("Inbound / Outbound Contact Center", CONTACT_CENTER, "Omnichannel contact management"),
    ]
  },

  // ── Connect First ─────────────────────────────────────────────────────────
  { match: ["connect first"],
    products: [
      p("Cloud Contact Center", CONTACT_CENTER, "Outbound and blended contact center platform"),
      p("Predictive Dialer", CONTACT_CENTER, "Automated outbound dialing"),
      p("ACD / IVR", CONTACT_CENTER, "Inbound call routing and self-service"),
    ]
  },

  // ── Voce / VocalIP ────────────────────────────────────────────────────────
  { match: ["voce", "vocalip"],
    products: [
      p("Hosted VoIP / UCaaS", VOICE, "Cloud business phone system"),
      p("SIP Trunking", VOICE, "SIP voice trunks"),
    ]
  },

  // ── Broadview ─────────────────────────────────────────────────────────────
  { match: ["broadview"],
    products: [
      p("Business VoIP", VOICE, "Cloud-hosted voice services"),
      p("Hosted PBX", VOICE, "Cloud PBX platform"),
      p("SIP Trunking", VOICE, "SIP voice connectivity"),
    ]
  },

  // ── CallOne / Peerless Network ────────────────────────────────────────────
  { match: ["call one", "peerless"],
    products: [
      p("SIP Trunking", VOICE, "Carrier-grade SIP trunks"),
      p("Hosted PBX", VOICE, "Cloud phone system"),
      p("Toll-Free Services", VOICE, "Inbound toll-free calling"),
    ]
  },

  // ── FreedomVoice ──────────────────────────────────────────────────────────
  { match: ["freedomvoice"],
    products: [
      p("Virtual Phone System", VOICE, "Cloud phone with auto-attendant"),
      p("Toll-Free Numbers", VOICE, "Business toll-free number services"),
    ]
  },

  // ── YipTel ────────────────────────────────────────────────────────────────
  { match: ["yiptel"],
    products: [
      p("Hosted VoIP / UCaaS", VOICE, "Cloud business communications"),
      p("Microsoft Teams Direct Routing", VOICE, "PSTN via Teams"),
    ]
  },

  // ── Coredial ──────────────────────────────────────────────────────────────
  { match: ["coredial"],
    products: [
      p("UCaaS Platform (CloudSpan)", VOICE, "White-label cloud UC for service providers"),
      p("Microsoft Teams Direct Routing", VOICE, "Teams PSTN connectivity"),
      p("SIP Trunking", VOICE, "SIP voice services"),
    ]
  },

  // ── Corvisa ───────────────────────────────────────────────────────────────
  { match: ["corvisa"],
    products: [
      p("UCaaS (Corvisa Cloud)", VOICE, "Cloud PBX and communications platform"),
      p("CCaaS", CONTACT_CENTER, "Contact center automation"),
      p("CPaaS APIs", CPAAS, "Programmable voice and SMS APIs"),
    ]
  },

  // ── OneStream Networks ─────────────────────────────────────────────────────
  { match: ["onestream"],
    products: [
      p("SIP Trunking", VOICE, "Enterprise SIP trunks"),
      p("Hosted PBX", VOICE, "Cloud phone system"),
      p("Toll-Free Numbers", VOICE, "Inbound toll-free calling"),
    ]
  },

  // ── Pure IP ───────────────────────────────────────────────────────────────
  { match: ["pure ip"],
    products: [
      p("Microsoft Teams Direct Routing", VOICE, "Global PSTN for Microsoft Teams"),
      p("Operator Connect", VOICE, "Microsoft certified Operator Connect"),
      p("SIP Trunking", VOICE, "Global enterprise SIP trunks"),
    ]
  },

  // ── Whitelabel Communications ─────────────────────────────────────────────
  { match: ["whitelabel"],
    products: [
      p("White-Label UCaaS", VOICE, "Resellable cloud phone platform"),
      p("SIP Trunking", VOICE, "Wholesale SIP trunks"),
    ]
  },

  // ── InPhonex ──────────────────────────────────────────────────────────────
  { match: ["inphonex"],
    products: [
      p("Hosted VoIP", VOICE, "Internet-based business phone service"),
      p("International Calling", VOICE, "Low-cost international voice termination"),
    ]
  },

  // ── VOIP Networks ─────────────────────────────────────────────────────────
  { match: ["voip networks"],
    products: [
      p("Hosted VoIP / UCaaS", VOICE, "Cloud business communications"),
      p("SIP Trunking", VOICE, "SIP voice connectivity"),
    ]
  },

  // ── Pacific Networks / G12 ────────────────────────────────────────────────
  { match: ["g12"],
    products: [
      p("SIP Trunking", VOICE, "Carrier-grade SIP trunks"),
      p("DID Numbers", VOICE, "Direct inward dialing numbers"),
    ]
  },

  // ── Internap ──────────────────────────────────────────────────────────────
  { match: ["internap"],
    products: [
      p("Colocation", DATA_CENTER, "Data center colocation"),
      p("Cloud Hosting", CLOUD, "Managed dedicated and cloud servers"),
      p("CDN", CLOUD, "Content delivery network"),
      p("Bare Metal", CLOUD, "On-demand bare metal servers"),
    ]
  },

  // ── Carahsoft ─────────────────────────────────────────────────────────────
  { match: ["carahsoft"],
    products: [
      p("Government IT Marketplace", MANAGED_IT, "IT solutions for federal, state, and local government"),
      p("Cloud Solutions (SLED)", CLOUD, "Authorized government cloud marketplace"),
      p("Cybersecurity (SLED)", SECURITY, "Government-focused cybersecurity solutions"),
    ]
  },

  // ── nGenx / Cloud Jumper ──────────────────────────────────────────────────
  { match: ["ngenx", "cloud jumper"],
    products: [
      p("Desktop as a Service (DaaS)", CLOUD, "Azure Virtual Desktop and WVD management"),
      p("Azure Virtual Desktop (AVD)", CLOUD, "Managed Windows 365 and AVD deployments"),
      p("Application Hosting", CLOUD, "Cloud-hosted applications and desktops"),
    ]
  },

  // ── Dizzion ───────────────────────────────────────────────────────────────
  { match: ["dizzion"],
    products: [
      p("Desktop as a Service (DaaS)", CLOUD, "Managed end-user computing in the cloud"),
      p("Frame (Cloud Desktop)", CLOUD, "Browser-delivered desktop experience"),
      p("Managed Security for DaaS", SECURITY, "Endpoint security for virtual desktops"),
    ]
  },

  // ── RapidScale ────────────────────────────────────────────────────────────
  { match: ["rapidscale"],
    products: [
      p("Cloud Desktop (DaaS)", CLOUD, "Managed virtual desktop infrastructure"),
      p("Managed Cloud (AWS/Azure)", CLOUD, "Public cloud management and migration"),
      p("Hosted Exchange / Office 365", COLLABORATION, "Managed Microsoft productivity suite"),
      p("Disaster Recovery as a Service (DRaaS)", CLOUD, "Business continuity in the cloud"),
    ]
  },

  // ── XTIUM ─────────────────────────────────────────────────────────────────
  { match: ["xtium"],
    products: [
      p("DRaaS", CLOUD, "Disaster recovery as a service"),
      p("Cloud Hosting", CLOUD, "Managed private and hybrid cloud"),
      p("Managed IT Services", MANAGED_IT, "Proactive IT monitoring and support"),
    ]
  },

  // ── ViaWest ───────────────────────────────────────────────────────────────
  { match: ["viawest"],
    products: [
      p("Colocation", DATA_CENTER, "Mountain West data center colocation"),
      p("Cloud Computing", CLOUD, "Managed private and hybrid cloud"),
      p("Managed IT Services", MANAGED_IT, "IT monitoring and management"),
      p("Disaster Recovery", CLOUD, "DRaaS and business continuity"),
    ]
  },

  // ── Convergia ─────────────────────────────────────────────────────────────
  { match: ["convergia"],
    products: [
      p("SD-WAN", SD_WAN, "Managed SD-WAN for multi-site enterprises"),
      p("MPLS / Private WAN", CONNECTIVITY, "Managed private WAN (Latin America)"),
      p("UCaaS", VOICE, "Cloud business communications"),
      p("Managed Services", MANAGED_IT, "IT management and network operations"),
    ]
  },

  // ── BSO IxReach ───────────────────────────────────────────────────────────
  { match: ["bso", "ixreach"],
    products: [
      p("IP Transit", CONNECTIVITY, "High-performance global internet transit"),
      p("Ethernet", CONNECTIVITY, "Global point-to-point Ethernet"),
      p("MPLS", CONNECTIVITY, "Global private WAN"),
      p("SD-WAN", SD_WAN, "Global managed SD-WAN"),
    ]
  },

  // ── PacketFabric ──────────────────────────────────────────────────────────
  { match: ["packetfabric"],
    products: [
      p("Network as a Service (NaaS)", CONNECTIVITY, "On-demand private network fabric"),
      p("Cloud Router", CLOUD, "Multi-cloud connectivity and routing"),
      p("Dedicated Ports", CONNECTIVITY, "High-capacity network access ports"),
      p("Point-to-Point Circuits", CONNECTIVITY, "Private Ethernet circuits on demand"),
    ]
  },

  // ── CBTS / Cincinnati Bell ─────────────────────────────────────────────────
  // Already covered above

  // ── Arelion covered above ─────────────────────────────────────────────────

  // ── Fibernetics ───────────────────────────────────────────────────────────
  { match: ["fibernetics"],
    products: [
      p("Fiber Internet (Canada)", CONNECTIVITY, "Business fiber broadband"),
      p("SIP Trunking (Canada)", VOICE, "Hosted SIP trunks"),
      p("UCaaS (Canada)", VOICE, "Cloud business phone"),
    ]
  },

  // ── Ancero ────────────────────────────────────────────────────────────────
  { match: ["ancero"],
    products: [
      p("Managed IT Services", MANAGED_IT, "IT infrastructure and helpdesk support"),
      p("Cybersecurity", SECURITY, "Managed security operations and compliance"),
      p("Cloud Services", CLOUD, "Microsoft Azure and 365 management"),
      p("Communications", VOICE, "UCaaS and voice services"),
    ]
  },

  // ── Lumen-resold items  ────────────────────────────────────────────────────
  { match: ["earthlink"],
    products: [
      p("Business Internet", CONNECTIVITY, "Broadband and dedicated internet access"),
      p("MPLS / Private WAN", CONNECTIVITY, "Enterprise WAN services"),
      p("SD-WAN", SD_WAN, "Software-defined WAN"),
      p("Managed Services", MANAGED_IT, "Managed network and security"),
    ]
  },

  // ── Grande ────────────────────────────────────────────────────────────────
  { match: ["grande"],
    products: [
      p("Business Internet", CONNECTIVITY, "Fiber broadband (Texas)"),
      p("Dedicated Internet Access (DIA)", CONNECTIVITY, "Symmetric fiber"),
      p("Business Voice", VOICE, "VoIP and hosted phone"),
    ]
  },

  // ── Rise Broadband ────────────────────────────────────────────────────────
  { match: ["rise broadband"],
    products: [
      p("Fixed Wireless Internet", CONNECTIVITY, "Rural and suburban fixed wireless broadband"),
      p("Business Internet", CONNECTIVITY, "Commercial internet access"),
    ]
  },

  // ── AB&T Telecom ──────────────────────────────────────────────────────────
  { match: ["ab&t"],
    products: [
      p("Business Internet", CONNECTIVITY, "Fiber and broadband internet"),
      p("Voice Services", VOICE, "Business telephony"),
    ]
  },

  // ── All West ──────────────────────────────────────────────────────────────
  { match: ["all west"],
    products: [
      p("Business Fiber Internet", CONNECTIVITY, "Fiber broadband (Utah/Wyoming)"),
      p("Business Voice", VOICE, "Hosted VoIP and phone lines"),
    ]
  },

  // ── Dynalink ──────────────────────────────────────────────────────────────
  { match: ["dynalink"],
    products: [
      p("4G/5G LTE Router (CPE)", MOBILITY, "Business LTE and 5G routers"),
      p("SD-WAN CPE", SD_WAN, "Customer premises SD-WAN equipment"),
    ]
  },

  // ── EnTelegent ────────────────────────────────────────────────────────────
  { match: ["entelegent"],
    products: [
      p("SD-WAN", SD_WAN, "Multi-carrier SD-WAN platform"),
      p("MPLS / Private WAN", CONNECTIVITY, "Managed WAN aggregation"),
      p("Network Management", MANAGED_IT, "Multi-vendor network management"),
    ]
  },

  // ── Xchange Telecom ───────────────────────────────────────────────────────
  { match: ["xchange telecom"],
    products: [
      p("Fiber Internet (NYC)", CONNECTIVITY, "Business fiber broadband in New York"),
      p("Dedicated Internet Access (DIA)", CONNECTIVITY, "Symmetric dedicated fiber"),
    ]
  },

  // ── Warner Telecom ────────────────────────────────────────────────────────
  { match: ["warner telecom"],
    products: [
      p("Fiber Internet", CONNECTIVITY, "Business-grade fiber broadband"),
      p("Voice Services", VOICE, "Business telephone services"),
    ]
  },

  // ── WiLine ────────────────────────────────────────────────────────────────
  { match: ["wiline"],
    products: [
      p("Fixed Wireless Internet", CONNECTIVITY, "Business fixed wireless broadband"),
      p("Fiber Internet", CONNECTIVITY, "Business fiber internet"),
      p("UCaaS", VOICE, "Cloud business communications"),
    ]
  },

  // ── Wilcon ────────────────────────────────────────────────────────────────
  { match: ["wilcon"],
    products: [
      p("Fiber Internet", CONNECTIVITY, "Business fiber broadband"),
      p("Dedicated Internet Access (DIA)", CONNECTIVITY, "Symmetric dedicated fiber"),
    ]
  },

  // ── Utah Broadband ────────────────────────────────────────────────────────
  { match: ["utah broadband"],
    products: [
      p("Fixed Wireless Internet", CONNECTIVITY, "Business wireless broadband (Utah)"),
      p("Fiber Internet", CONNECTIVITY, "Business fiber broadband (Utah)"),
    ]
  },

  // ── CentraCom ─────────────────────────────────────────────────────────────
  { match: ["centracom"],
    products: [
      p("Business Fiber Internet", CONNECTIVITY, "Fiber broadband (Utah)"),
      p("Business Voice", VOICE, "Hosted VoIP and analog lines"),
    ]
  },

  // ── 1Wire Fiber ───────────────────────────────────────────────────────────
  { match: ["1wire"],
    products: [
      p("Business Fiber Internet", CONNECTIVITY, "Gigabit fiber broadband"),
      p("Dedicated Internet Access (DIA)", CONNECTIVITY, "Symmetric dedicated fiber"),
    ]
  },

  // ── Fidium Fiber ──────────────────────────────────────────────────────────
  { match: ["fidium"],
    products: [
      p("Business Fiber Internet", CONNECTIVITY, "High-speed fiber broadband"),
    ]
  },

  // ── Bandwave Systems ──────────────────────────────────────────────────────
  { match: ["bandwave"],
    products: [
      p("Dedicated Internet Access (DIA)", CONNECTIVITY, "Fiber internet access"),
      p("Ethernet", CONNECTIVITY, "Metro Ethernet services"),
      p("SD-WAN", SD_WAN, "Managed SD-WAN"),
    ]
  },

  // ── BandTel ───────────────────────────────────────────────────────────────
  { match: ["bandtel"],
    products: [
      p("SIP Trunking", VOICE, "Wholesale and enterprise SIP trunks"),
      p("DID Numbers", VOICE, "Direct inward dialing numbers"),
      p("Toll-Free Services", VOICE, "Inbound toll-free calling"),
    ]
  },

  // ── Datavalet ─────────────────────────────────────────────────────────────
  { match: ["datavalet"],
    products: [
      p("Managed Wi-Fi", MANAGED_IT, "Hospitality and commercial managed wireless"),
      p("Guest Wi-Fi Analytics", MANAGED_IT, "Wi-Fi analytics and captive portal"),
    ]
  },

  // ── Bulk TV & Internet ────────────────────────────────────────────────────
  { match: ["bulk tv"],
    products: [
      p("Bulk TV Programming", CONNECTIVITY, "Commercial TV for hospitality and MDU"),
      p("Managed Internet (Hospitality)", CONNECTIVITY, "Bulk internet for hotels and apartments"),
    ]
  },

  // ── Blue Panda / Altigen ──────────────────────────────────────────────────
  { match: ["blue panda", "altigen"],
    products: [
      p("Microsoft Teams UCaaS", VOICE, "Teams-native cloud communications"),
      p("Hosted PBX", VOICE, "Cloud phone system"),
      p("Contact Center", CONTACT_CENTER, "Teams-integrated contact center"),
    ]
  },

  // ── Blue Mantis covered above ─────────────────────────────────────────────

  // ── BlueVoyant covered above ──────────────────────────────────────────────

  // ── ClearView ─────────────────────────────────────────────────────────────
  { match: ["clearview"],
    products: [
      p("Managed Broadcast TV", CONNECTIVITY, "Commercial TV distribution"),
      p("Video on Demand", CONNECTIVITY, "Digital content delivery"),
    ]
  },

  // ── Defendry ──────────────────────────────────────────────────────────────
  { match: ["defendry"],
    products: [
      p("AI Video Analytics", SECURITY, "Weapon and threat detection via video"),
      p("Physical Security AI", SECURITY, "Access control and surveillance intelligence"),
      p("Gunshot Detection", SECURITY, "Real-time gunshot alert system"),
    ]
  },

  // ── 360 SOC ───────────────────────────────────────────────────────────────
  { match: ["360 soc"],
    products: [
      p("SOC as a Service", SECURITY, "Managed 24/7 security operations center"),
      p("SIEM Management", SECURITY, "Security event monitoring and analysis"),
      p("Threat Detection & Response", SECURITY, "MDR and incident response"),
    ]
  },

  // ── CyberReef ─────────────────────────────────────────────────────────────
  { match: ["cyberreef"],
    products: [
      p("Network Security (SafePath)", SECURITY, "DNS filtering and content control"),
      p("K-12 CIPA Compliance", SECURITY, "Filtering for schools and libraries"),
      p("Managed Firewall", SECURITY, "Cloud-managed security appliances"),
    ]
  },

  // ── Allgress ──────────────────────────────────────────────────────────────
  { match: ["allgress"],
    products: [
      p("Risk Management Platform", SECURITY, "Integrated GRC and risk quantification"),
      p("Vulnerability Management", SECURITY, "Automated scanning and prioritization"),
      p("Compliance Automation", SECURITY, "Policy and controls management"),
    ]
  },

  // ── Vigilant ──────────────────────────────────────────────────────────────
  { match: ["vigilant"],
    products: [
      p("CyberSOC (MDR)", SECURITY, "24/7 managed detection and response"),
      p("Threat Intelligence", SECURITY, "Dark web and threat intelligence monitoring"),
      p("Incident Response Retainer", SECURITY, "On-call IR team and forensics"),
    ]
  },

  // ── IGI ───────────────────────────────────────────────────────────────────
  { match: ["igi"],
    products: [
      p("Dedicated Internet Access (DIA)", CONNECTIVITY, "Business internet (Israel)"),
      p("MPLS", CONNECTIVITY, "Private WAN"),
    ]
  },

  // ── CCNA ──────────────────────────────────────────────────────────────────
  { match: ["ccna"],
    products: [
      p("Dedicated Internet Access (DIA)", CONNECTIVITY, "Business internet (Australia)"),
      p("Ethernet Services", CONNECTIVITY, "Metro Ethernet (Australia)"),
    ]
  },

  // ── HCS ───────────────────────────────────────────────────────────────────
  { match: ["hcs"],
    products: [
      p("Unified Communications", VOICE, "Cisco and Microsoft collaboration solutions"),
      p("Managed IT", MANAGED_IT, "IT management and helpdesk"),
      p("Contact Center", CONTACT_CENTER, "CCaaS deployment and support"),
    ]
  },

  // ── GHA Technologies ──────────────────────────────────────────────────────
  { match: ["gha"],
    products: [
      p("IT Hardware Procurement", MANAGED_IT, "Technology product resale"),
      p("Managed IT Services", MANAGED_IT, "IT infrastructure support"),
    ]
  },

  // ── Hypercore ─────────────────────────────────────────────────────────────
  { match: ["hypercore"],
    products: [
      p("Hyper-Converged Infrastructure (HCI)", CLOUD, "On-premises HCI for private cloud"),
      p("Cloud Backup", CLOUD, "Automated backup to cloud"),
    ]
  },

  // ── Atlantic Metro ────────────────────────────────────────────────────────
  { match: ["atlantic metro"],
    products: [
      p("Colocation", DATA_CENTER, "Northeast US data center colocation"),
      p("Ethernet & Transport", CONNECTIVITY, "Carrier-grade fiber transport"),
      p("Cloud Connect", CLOUD, "Private cloud on-ramp services"),
    ]
  },

  // ── QOS Networks ─────────────────────────────────────────────────────────
  { match: ["qos networks"],
    products: [
      p("SD-WAN", SD_WAN, "Managed SD-WAN with QoS guarantees"),
      p("Managed Network Services", MANAGED_IT, "Network monitoring and management"),
    ]
  },

  // ── RevGen Networks ───────────────────────────────────────────────────────
  { match: ["revgen"],
    products: [
      p("Fixed Wireless Internet", CONNECTIVITY, "Rural business fixed wireless"),
      p("Dedicated Internet Access", CONNECTIVITY, "Symmetric business internet"),
    ]
  },

  // ── Data Canopy ───────────────────────────────────────────────────────────
  { match: ["data canopy"],
    products: [
      p("Colocation", DATA_CENTER, "Southeast data center colocation"),
      p("Managed Hosting", CLOUD, "Managed dedicated server hosting"),
    ]
  },

  // ── Centersquare ──────────────────────────────────────────────────────────
  { match: ["centersquare"],
    products: [
      p("Colocation", DATA_CENTER, "Philadelphia area data center colocation"),
      p("Network Services", CONNECTIVITY, "High-bandwidth connectivity"),
    ]
  },

  // ── ValorC3 Data Centers ──────────────────────────────────────────────────
  { match: ["valorc3"],
    products: [
      p("Colocation", DATA_CENTER, "Texas data center colocation"),
      p("Managed Services", MANAGED_IT, "IT operations and support"),
    ]
  },

  // ── ACE Data Centers ─────────────────────────────────────────────────────
  { match: ["ace data"],
    products: [
      p("Colocation", DATA_CENTER, "Data center rack and cage colocation"),
      p("Managed Hosting", CLOUD, "Managed dedicated servers"),
      p("Cloud Services", CLOUD, "Hosted private and hybrid cloud"),
    ]
  },

  // ── Raging Wire ───────────────────────────────────────────────────────────
  { match: ["raging wire"],
    products: [
      p("Colocation", DATA_CENTER, "Hyperscale data center colocation"),
      p("Power and Cooling", DATA_CENTER, "Metered data center power and cooling"),
    ]
  },

  // ── Lightpath ─────────────────────────────────────────────────────────────
  { match: ["lightpath"],
    products: [
      p("Dedicated Internet Access (DIA)", CONNECTIVITY, "NY Metro fiber internet"),
      p("Ethernet", CONNECTIVITY, "Metro and regional Ethernet (NY/NJ)"),
      p("Colocation (NYC)", DATA_CENTER, "Data center services in New York area"),
    ]
  },

  // ── Colotraq ──────────────────────────────────────────────────────────────
  { match: ["colotraq"],
    products: [
      p("Colocation Brokerage", DATA_CENTER, "Data center marketplace and consulting"),
      p("Data Center Advisory", DATA_CENTER, "Site selection and colocation RFP management"),
    ]
  },

  // ── Peacey Systems ────────────────────────────────────────────────────────
  { match: ["peacey"],
    products: [
      p("Hosted VoIP (UCaaS)", VOICE, "Cloud phone system for businesses"),
      p("SIP Trunking", VOICE, "SIP voice connectivity"),
    ]
  },

  // ── PhySaaS ───────────────────────────────────────────────────────────────
  { match: ["physaas"],
    products: [
      p("Healthcare UCaaS", VOICE, "HIPAA-compliant cloud communications"),
      p("Secure Messaging (Healthcare)", COLLABORATION, "Encrypted clinical messaging"),
    ]
  },

  // ── InsideSales.com ───────────────────────────────────────────────────────
  { match: ["insidesales"],
    products: [
      p("Sales Engagement Platform", CONTACT_CENTER, "AI-driven sales acceleration"),
      p("Predictive Dialer", CONTACT_CENTER, "AI-powered outbound calling"),
      p("Revenue Intelligence", CONTACT_CENTER, "Sales forecasting and analytics"),
    ]
  },

  // ── Hootsuite ─────────────────────────────────────────────────────────────
  { match: ["hootsuite"],
    products: [
      p("Social Media Management", COLLABORATION, "Scheduling, monitoring, and analytics"),
      p("Social Customer Care", CONTACT_CENTER, "Social media contact center integration"),
    ]
  },

  // ── Webbing ───────────────────────────────────────────────────────────────
  { match: ["webbing"],
    products: [
      p("Business Internet", CONNECTIVITY, "Fixed wireless and fiber internet"),
    ]
  },

  // ── RealLinx ──────────────────────────────────────────────────────────────
  { match: ["reallinx"],
    products: [
      p("Fiber Internet", CONNECTIVITY, "Business fiber broadband (Texas)"),
      p("Ethernet", CONNECTIVITY, "Metro Ethernet services"),
    ]
  },

  // ── ImOn Communications ───────────────────────────────────────────────────
  { match: ["imon"],
    products: [
      p("Business Fiber Internet", CONNECTIVITY, "Fiber broadband (Iowa)"),
      p("Business Voice", VOICE, "Hosted VoIP and phone lines"),
    ]
  },

  // ── Powernet ──────────────────────────────────────────────────────────────
  { match: ["powernet"],
    products: [
      p("Managed IT Services", MANAGED_IT, "IT infrastructure and support (Ohio)"),
      p("Cloud Services", CLOUD, "Hosted cloud and backup"),
    ]
  },

  // ── ForeThought.net ───────────────────────────────────────────────────────
  { match: ["forethought"],
    products: [
      p("Business Internet", CONNECTIVITY, "Regional broadband and fiber"),
      p("Voice Services", VOICE, "Business telephony"),
    ]
  },

  // ── Effortless Office ─────────────────────────────────────────────────────
  { match: ["effortless office"],
    products: [
      p("Managed IT Services", MANAGED_IT, "Complete IT management for SMB"),
      p("Cloud Solutions", CLOUD, "Microsoft 365 and cloud migrations"),
      p("UCaaS", VOICE, "Cloud business communications"),
    ]
  },

  // ── C3 Integrated Solutions ───────────────────────────────────────────────
  { match: ["c3 integrated"],
    products: [
      p("Managed IT Services", MANAGED_IT, "IT infrastructure management"),
      p("Cybersecurity", SECURITY, "Managed security services"),
      p("Communications", VOICE, "Unified communications solutions"),
    ]
  },

  // ── Coeo Solutions ────────────────────────────────────────────────────────
  { match: ["coeo"],
    products: [
      p("SD-WAN", SD_WAN, "Managed SD-WAN services (UK)"),
      p("Connectivity", CONNECTIVITY, "Business broadband and leased lines"),
      p("Voice (UCaaS)", VOICE, "Cloud communications"),
    ]
  },

  // ── DCI / Ten4 ────────────────────────────────────────────────────────────
  { match: ["dci", "ten4"],
    products: [
      p("Fixed Wireless Access", CONNECTIVITY, "Business fixed wireless broadband"),
      p("Managed Connectivity", MANAGED_IT, "Network management and monitoring"),
    ]
  },

  // ── Comm-Core ─────────────────────────────────────────────────────────────
  { match: ["comm-core"],
    products: [
      p("Hosted PBX / UCaaS", VOICE, "Cloud business phone system"),
      p("SIP Trunking", VOICE, "SIP voice connectivity"),
    ]
  },

  // ── KMC Telecom ───────────────────────────────────────────────────────────
  { match: ["kmc"],
    products: [
      p("Business Fiber Internet", CONNECTIVITY, "Fiber broadband (Midwest)"),
      p("Business Voice", VOICE, "Hosted VoIP and PRI"),
    ]
  },

  // ── Retarus ───────────────────────────────────────────────────────────────
  { match: ["retarus"],
    products: [
      p("Cloud Fax", CPAAS, "Enterprise cloud fax services"),
      p("Email Security", SECURITY, "Anti-spam, anti-phishing, email filtering"),
      p("Business SMS", CPAAS, "Enterprise SMS gateway"),
    ]
  },

  // ── Open Text / EasyLink ──────────────────────────────────────────────────
  { match: ["open text"],
    products: [
      p("Enterprise Fax", CPAAS, "High-volume fax and document exchange"),
      p("Document Management", MANAGED_IT, "Enterprise content management"),
    ]
  },

  // ── Unitas Global ─────────────────────────────────────────────────────────
  { match: ["unitas global"],
    products: [
      p("SD-WAN", SD_WAN, "Global managed SD-WAN"),
      p("Cloud Connect", CLOUD, "Multi-cloud connectivity"),
      p("MPLS / Private WAN", CONNECTIVITY, "Global private network"),
    ]
  },

  // ── Ericsson ──────────────────────────────────────────────────────────────
  { match: ["ericsson"],
    products: [
      p("5G Infrastructure", MOBILITY, "Radio access network (RAN) equipment"),
      p("IoT Connectivity", MOBILITY, "Global IoT and M2M platform"),
      p("Managed Network Services", MANAGED_IT, "Telecom network managed services"),
    ]
  },

  // ── PLDT ─────────────────────────────────────────────────────────────────
  { match: ["pldt"],
    products: [
      p("Business Internet (Philippines)", CONNECTIVITY, "Fiber and DSL internet"),
      p("MPLS (Philippines)", CONNECTIVITY, "Private WAN in the Philippines"),
      p("Business Voice", VOICE, "Telephony services (Philippines)"),
    ]
  },

  // ── PacNet ────────────────────────────────────────────────────────────────
  { match: ["pacnet"],
    products: [
      p("Ethernet", CONNECTIVITY, "Asia-Pacific Ethernet services"),
      p("MPLS", CONNECTIVITY, "APAC private WAN"),
      p("Dedicated Internet Access (DIA)", CONNECTIVITY, "APAC internet access"),
    ]
  },

  // ── Brodynt / Expereo ─────────────────────────────────────────────────────
  { match: ["brodynt", "expereo"],
    products: [
      p("Global Internet (SD-WAN)", SD_WAN, "Global managed internet and SD-WAN"),
      p("SD-WAN", SD_WAN, "Global software-defined networking"),
      p("Managed Connectivity", MANAGED_IT, "Global ISP aggregation and management"),
    ]
  },

  // ── VXSuite ───────────────────────────────────────────────────────────────
  { match: ["vxsuite"],
    products: [
      p("Contact Center Reporting", CONTACT_CENTER, "Real-time and historical wallboard reporting"),
      p("Cisco CUCM / UCCX Analytics", CONTACT_CENTER, "Performance monitoring for Cisco CC"),
    ]
  },

  // ── VisualCue ─────────────────────────────────────────────────────────────
  { match: ["visualcue"],
    products: [
      p("Real-Time Contact Center Analytics", CONTACT_CENTER, "Visual KPI dashboards for agents"),
    ]
  },

  // ── YourSix ───────────────────────────────────────────────────────────────
  { match: ["yoursix"],
    products: [
      p("Video Surveillance as a Service (VSaaS)", SECURITY, "Cloud-managed video cameras"),
      p("Physical Security Monitoring", SECURITY, "AI-powered video analytics"),
    ]
  },

  // ── Amazon Leo (Kuiper) ───────────────────────────────────────────────────
  { match: ["amazon leo"],
    products: [
      p("Satellite Broadband (Kuiper)", CONNECTIVITY, "Low-earth orbit satellite internet"),
    ]
  },

  // ── Zultys ────────────────────────────────────────────────────────────────
  { match: ["zultys"],
    products: [
      p("Unified Communications (UCaaS)", VOICE, "Cloud and on-premises UC platform"),
      p("Contact Center", CONTACT_CENTER, "Inbound and outbound contact center"),
      p("SIP Trunking", VOICE, "SIP voice connectivity"),
    ]
  },

  // ── Verve ─────────────────────────────────────────────────────────────────
  { match: ["verve"],
    products: [
      p("Mobile Marketing Platform", CPAAS, "Location-based mobile advertising"),
    ]
  },

  // ── VLOCITY ───────────────────────────────────────────────────────────────
  { match: ["vlocity"],
    products: [
      p("Industry Cloud (Salesforce)", CLOUD, "Telecom and media CRM on Salesforce"),
      p("CPQ (Configure Price Quote)", CLOUD, "Order management and product catalog"),
    ]
  },

  // ── RSI ───────────────────────────────────────────────────────────────────
  { match: ["rsi"],
    products: [
      p("Managed IT Services", MANAGED_IT, "IT infrastructure management"),
      p("Networking", CONNECTIVITY, "Managed network services"),
    ]
  },

  // ── Quest Technology Management ───────────────────────────────────────────
  { match: ["quest technology"],
    products: [
      p("Managed IT Services", MANAGED_IT, "IT support and management"),
      p("Cloud Solutions", CLOUD, "Cloud migration and hosting"),
    ]
  },

  // ── Comstar USA ───────────────────────────────────────────────────────────
  { match: ["comstar"],
    products: [
      p("Hosted VoIP / UCaaS", VOICE, "Cloud business phone system"),
      p("SIP Trunking", VOICE, "SIP voice trunks"),
    ]
  },

  // ── Clarix ────────────────────────────────────────────────────────────────
  { match: ["clarix"],
    products: [
      p("Hosted VoIP", VOICE, "Business VoIP service"),
      p("SIP Trunking", VOICE, "SIP voice connectivity"),
    ]
  },

  // ── Getphound ─────────────────────────────────────────────────────────────
  { match: ["getphound"],
    products: [
      p("Business Phone System", VOICE, "Cloud phone service"),
    ]
  },

  // ── GetConnected ─────────────────────────────────────────────────────────
  { match: ["getconnected"],
    products: [
      p("Managed Connectivity", CONNECTIVITY, "ISP aggregation and management"),
    ]
  },

  // ── Data2Go Wireless ─────────────────────────────────────────────────────
  { match: ["data2go"],
    products: [
      p("IoT / M2M Data Plans", MOBILITY, "Wireless data for IoT devices"),
      p("Business LTE", MOBILITY, "4G LTE cellular connectivity"),
    ]
  },

  // ── Genesys covered above ─────────────────────────────────────────────────

  // ── Eventus ───────────────────────────────────────────────────────────────
  { match: ["eventus"],
    products: [
      p("CCaaS", CONTACT_CENTER, "Cloud contact center platform"),
      p("Communications Solutions", VOICE, "Business communications services"),
    ]
  },

  // ── Ezwim ─────────────────────────────────────────────────────────────────
  { match: ["ezwim"],
    products: [
      p("Telecom Expense Management (TEM)", EXPENSE_MGMT, "Invoice management and audit"),
      p("Wireless Management", EXPENSE_MGMT, "Mobile cost optimization"),
    ]
  },

  // ── Customer Dynamics ─────────────────────────────────────────────────────
  { match: ["customer dynamics"],
    products: [
      p("CRM Integration", CONTACT_CENTER, "Dynamics 365 and Salesforce contact center connectors"),
      p("Agent Desktop", CONTACT_CENTER, "Unified agent workspace for Microsoft platforms"),
    ]
  },

  // ── Continuant (JTAPI/Avaya) ──────────────────────────────────────────────

  // ── GreenLight Networks ────────────────────────────────────────────────────
  { match: ["green light", "greenlight"],
    products: [
      p("Business Fiber Internet", CONNECTIVITY, "Gigabit fiber broadband (NY)"),
    ]
  },

  // ── Document Solutions ────────────────────────────────────────────────────
  { match: ["document solutions"],
    products: [
      p("Document Management", MANAGED_IT, "Managed print and document workflow"),
      p("Managed Print Services", MANAGED_IT, "Print fleet management"),
    ]
  },

  // ── ALURA Business Solutions ──────────────────────────────────────────────
  { match: ["alura"],
    products: [
      p("Managed IT Services", MANAGED_IT, "IT support and infrastructure"),
      p("UCaaS", VOICE, "Business communications"),
    ]
  },

  // ── Cobalt Business Systems ───────────────────────────────────────────────
  { match: ["cobalt"],
    products: [
      p("Managed IT Services", MANAGED_IT, "IT support and network management"),
      p("Cloud Solutions", CLOUD, "Hosted and cloud services"),
    ]
  },

  // ── Utility Telecom ───────────────────────────────────────────────────────
  { match: ["utility telecom"],
    products: [
      p("Hosted VoIP / UCaaS", VOICE, "Cloud business phone system"),
      p("Business Internet", CONNECTIVITY, "Internet access services"),
    ]
  },

  // ── WOW! covered above ────────────────────────────────────────────────────

  // ── Fraser Broadband ─────────────────────────────────────────────────────
  { match: ["fraser"],
    products: [
      p("Business Internet", CONNECTIVITY, "Regional fiber and broadband"),
    ]
  },

  // ── Bluetone Communications ───────────────────────────────────────────────
  { match: ["bluetone"],
    products: [
      p("Business Internet", CONNECTIVITY, "Broadband internet service"),
      p("VoIP / Business Phone", VOICE, "Business telephony"),
    ]
  },

  // ── NetStar / Whitelabel ──────────────────────────────────────────────────
  { match: ["netstar"],
    products: [
      p("Hosted VoIP", VOICE, "Business VoIP phone service"),
    ]
  },

  // ── Kore Wireless ─────────────────────────────────────────────────────────
  { match: ["kore"],
    products: [
      p("IoT Connectivity Management", MOBILITY, "Global IoT SIM and data management"),
      p("eSIM Management", MOBILITY, "eUICC and eSIM lifecycle management"),
      p("M2M Connectivity", MOBILITY, "Machine-to-machine data services"),
    ]
  },

  // ── Lingo / FreeConferenceCall etc. ──────────────────────────────────────

  // ── Zog Inc ───────────────────────────────────────────────────────────────
  { match: ["zog"],
    products: [
      p("Managed IT Consulting", MANAGED_IT, "IT consulting and project services"),
    ]
  },

  // ── Premiere Global ───────────────────────────────────────────────────────
  { match: ["premiere global"],
    products: [
      p("Audio Conferencing", COLLABORATION, "Toll and toll-free conference calling"),
      p("Webcasting", COLLABORATION, "Large-scale webcast events"),
    ]
  },

  // ── Federal Networking ────────────────────────────────────────────────────
  { match: ["federal"],
    products: [
      p("Government IT Solutions", MANAGED_IT, "Federal IT infrastructure and support"),
      p("Managed Network Services", MANAGED_IT, "Network management for government"),
    ]
  },

  // ── CableFinder ───────────────────────────────────────────────────────────
  { match: ["cablefinder"],
    products: [
      p("Internet Availability Tool", CONNECTIVITY, "ISP lookup and availability checker"),
    ]
  },

  // ── Pure Caller ID ────────────────────────────────────────────────────────
  { match: ["pure caller"],
    products: [
      p("CNAM / Caller ID Services", VOICE, "Caller ID reputation and labeling"),
    ]
  },

  // ── Atlas ─────────────────────────────────────────────────────────────────
  { match: ["atlas"],
    products: [
      p("UCaaS", VOICE, "Cloud business phone system"),
      p("SIP Trunking", VOICE, "SIP voice trunks"),
    ]
  },

  // ── Epic Connections ─────────────────────────────────────────────────────
  { match: ["epic connections"],
    products: [
      p("Managed IT Services", MANAGED_IT, "IT management and support"),
      p("UCaaS Consulting", VOICE, "Communications consulting and deployment"),
      p("Cloud Solutions", CLOUD, "Cloud infrastructure and services"),
    ]
  },

  // ── OpDecision ────────────────────────────────────────────────────────────
  { match: ["opdecision"],
    products: [
      p("Network Optimization Consulting", MANAGED_IT, "WAN cost reduction and optimization"),
    ]
  },

  // ── Pro Computer Service ──────────────────────────────────────────────────
  { match: ["pro computer"],
    products: [
      p("IT Support & Repair", MANAGED_IT, "Computer and network support services"),
    ]
  },

  // ── Paramount Communications ──────────────────────────────────────────────
  { match: ["paramount communications"],
    products: [
      p("Business Phone Solutions", VOICE, "PBX and VoIP telephony"),
      p("Network Services", CONNECTIVITY, "Business connectivity solutions"),
    ]
  },

  // ── 1440 ─────────────────────────────────────────────────────────────────
  { match: ["1440"],
    products: [
      p("Customer Engagement Platform", CONTACT_CENTER, "Real-time CX personalization"),
    ]
  },

  // ── 1SEO Tech ─────────────────────────────────────────────────────────────
  { match: ["1seo"],
    products: [
      p("Digital Marketing", MANAGED_IT, "SEO, PPC, and digital advertising"),
    ]
  },

  // ── Phone America ─────────────────────────────────────────────────────────
  { match: ["phone america"],
    products: [
      p("Business VoIP", VOICE, "Internet-based business phone service"),
    ]
  },

  // ── IPv4 Market Group ─────────────────────────────────────────────────────
  { match: ["ipv4"],
    products: [
      p("IPv4 Address Brokerage", CONNECTIVITY, "Buy and sell IP address blocks"),
      p("IPv4 Leasing", CONNECTIVITY, "Lease IPv4 addresses on demand"),
    ]
  },

  // ── Razor Technology ──────────────────────────────────────────────────────
  { match: ["razor technology"],
    products: [
      p("Managed IT Services", MANAGED_IT, "IT management for SMB"),
    ]
  },

  // ── Comtec Systems ────────────────────────────────────────────────────────
  { match: ["comtec"],
    products: [
      p("Business Phone Systems", VOICE, "PBX and VoIP installation"),
      p("Managed IT Services", MANAGED_IT, "Network and IT support"),
    ]
  },

  // ── ConnexiCore ───────────────────────────────────────────────────────────
  { match: ["connexicore"],
    products: [
      p("SD-WAN", SD_WAN, "Managed SD-WAN services"),
      p("Managed Connectivity", CONNECTIVITY, "ISP management and aggregation"),
    ]
  },

  // ── Buwelo ────────────────────────────────────────────────────────────────
  { match: ["buwelo"],
    products: [
      p("Contact Center Outsourcing (BPO)", CONTACT_CENTER, "Offshore contact center services"),
    ]
  },

  // ── Zailab ────────────────────────────────────────────────────────────────
  // Covered above

  // ── EPIC iO / DukeNet / Segra / etc. ─────────────────────────────────────
  // All covered above

  // ── Voce ─────────────────────────────────────────────────────────────────
  // Covered above

  // ── nGenx / Cloud Jumper ──────────────────────────────────────────────────
  // Covered above

  // ── PolyAI ────────────────────────────────────────────────────────────────
  // Covered above

  // ── 360 SOC ───────────────────────────────────────────────────────────────
  // Covered above
];

// Default products for unmatched vendors by keyword
function guessProducts(name) {
  const n = name.toLowerCase();
  if (n.includes("fiber") || n.includes("broadband") || n.includes("internet")) {
    return [
      p("Business Internet", CONNECTIVITY, "Broadband internet access"),
      p("Dedicated Internet Access (DIA)", CONNECTIVITY, "Symmetric dedicated internet"),
    ];
  }
  if (n.includes("voip") || n.includes("voice") || n.includes("phone") || n.includes("tel")) {
    return [
      p("Business VoIP", VOICE, "Internet-based business phone service"),
      p("SIP Trunking", VOICE, "SIP voice trunks"),
    ];
  }
  if (n.includes("cloud") || n.includes("hosting") || n.includes("saas")) {
    return [
      p("Cloud Hosting", CLOUD, "Managed cloud infrastructure"),
    ];
  }
  if (n.includes("security") || n.includes("cyber") || n.includes("soc")) {
    return [
      p("Managed Security Services", SECURITY, "Cybersecurity monitoring and response"),
    ];
  }
  if (n.includes("data center") || n.includes("colo") || n.includes("datacenter")) {
    return [
      p("Colocation", DATA_CENTER, "Data center rack and cage space"),
    ];
  }
  if (n.includes("wireless") || n.includes("mobile") || n.includes("iot")) {
    return [
      p("Wireless Connectivity", MOBILITY, "Business cellular and IoT services"),
    ];
  }
  if (n.includes("managed") || n.includes("msp")) {
    return [
      p("Managed IT Services", MANAGED_IT, "IT infrastructure management"),
    ];
  }
  return [];
}

function findProducts(vendorName) {
  const n = vendorName.toLowerCase();
  for (const entry of CATALOG) {
    for (const pattern of entry.match) {
      if (n.includes(pattern.toLowerCase())) {
        return entry.products;
      }
    }
  }
  return guessProducts(vendorName);
}

async function main() {
  const client = await pool.connect();
  try {
    const { rows: vendors } = await client.query(
      "SELECT external_id, name FROM telarus_vendors WHERE is_active = true ORDER BY name"
    );
    console.log(`Processing ${vendors.length} vendors...`);
    let updated = 0;
    let skipped = 0;
    for (const vendor of vendors) {
      const products = findProducts(vendor.name);
      await client.query(
        "UPDATE telarus_vendors SET products = $1 WHERE external_id = $2",
        [JSON.stringify(products), vendor.external_id]
      );
      if (products.length > 0) {
        updated++;
        console.log(`  ✓ ${vendor.name}: ${products.length} products`);
      } else {
        skipped++;
        console.log(`  - ${vendor.name}: no products matched`);
      }
    }
    console.log(`\nDone! Updated: ${updated}, No match: ${skipped}`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
