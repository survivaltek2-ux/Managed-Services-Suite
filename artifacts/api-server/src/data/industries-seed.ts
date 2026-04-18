// Auto-generated from artifacts/siebert-services/src/data/industries.ts
// Used as initial seed for the industries CMS table on first DB boot.

export interface IndustrySeed {
  slug: string;
  name: string;
  shortLabel: string;
  navTitle: string;
  metaDescription: string;
  hero: { eyebrow: string; title: string; subtitle: string };
  painPoints: { title: string; description: string }[];
  regulations: { name: string; description: string }[];
  softwareStacks: { category: string; items: string[] }[];
  whatWeDo: string[];
  testimonial: { quote: string; name: string; role: string; company: string };
  caseStudyHint: string;
  relatedServices: { title: string; href: string; description: string }[];
  ctaLabel: string;
}

export const INDUSTRIES_SEED: IndustrySeed[] = [
  {
    "slug": "healthcare",
    "name": "Healthcare",
    "shortLabel": "Healthcare & medical practices",
    "navTitle": "Healthcare IT",
    "metaDescription": "HIPAA-compliant managed IT for medical practices, clinics, and healthcare organizations in the Hudson Valley. EHR support, secure backup, and 24/7 helpdesk.",
    "hero": {
      "eyebrow": "Industry · Healthcare",
      "title": "HIPAA-grade IT for medical practices that can't afford downtime.",
      "subtitle": "Patient charts, e-prescribing, and imaging have to be available the moment a clinician asks for them. We keep your EHR online, your PHI encrypted, and your audit trail clean — so your team can focus on patients, not the network."
    },
    "painPoints": [
      {
        "title": "EHR slowdowns during clinic hours",
        "description": "Charting lag, slow imaging loads, and Citrix or RDP sessions that drop in the middle of an exam."
      },
      {
        "title": "HIPAA risk you can't see",
        "description": "Unencrypted laptops, shared logins, missing audit logs, and BAAs with vendors nobody is tracking."
      },
      {
        "title": "Backups that aren't actually recoverable",
        "description": "Quarterly tests skipped, ransomware-vulnerable file shares, and no documented recovery time for the practice management system."
      },
      {
        "title": "Helpdesk that doesn't speak clinical",
        "description": "Tickets bounced between vendors while patients are waiting and the front desk is on hold with the EHR vendor."
      }
    ],
    "regulations": [
      {
        "name": "HIPAA Security Rule",
        "description": "Administrative, physical, and technical safeguards for ePHI — risk analysis, access controls, audit logs, encryption, and workforce training."
      },
      {
        "name": "HIPAA Privacy & Breach Notification",
        "description": "Policies, BAAs with every vendor that touches PHI, and a documented breach response plan."
      },
      {
        "name": "HITECH",
        "description": "Tighter enforcement, breach reporting, and meaningful-use technology requirements for EHR systems."
      },
      {
        "name": "NY SHIELD Act",
        "description": "New York's data security requirements for any practice that handles private information of NY residents."
      },
      {
        "name": "PCI-DSS",
        "description": "If you take card payments at the front desk, the same network that touches PHI is in scope for PCI too."
      }
    ],
    "softwareStacks": [
      {
        "category": "EHR & practice management",
        "items": [
          "Epic (Citrix / Hyperspace)",
          "Cerner / Oracle Health",
          "athenahealth",
          "eClinicalWorks",
          "NextGen",
          "Allscripts / Veradigm",
          "Practice Fusion",
          "Kareo / Tebra",
          "DrChrono"
        ]
      },
      {
        "category": "Imaging, lab & telehealth",
        "items": [
          "PACS / DICOM viewers",
          "Dragon Medical One",
          "Doxy.me",
          "Zoom for Healthcare",
          "Updox"
        ]
      },
      {
        "category": "Productivity & security",
        "items": [
          "Microsoft 365 with HIPAA BAA",
          "Google Workspace (HIPAA-enabled)",
          "Sophos / SentinelOne EDR",
          "Datto / Veeam backup",
          "Duo / Microsoft MFA"
        ]
      }
    ],
    "whatWeDo": [
      "Annual HIPAA security risk analysis with a written remediation plan and BAA inventory.",
      "EHR-aware monitoring, patching, and helpdesk that knows your clinical workflow.",
      "Encrypted endpoints, MFA, and identity hygiene for every clinician, biller, and front-desk user.",
      "Immutable, tested backups for the EHR, file shares, and Microsoft 365 — with documented RTOs.",
      "Network segmentation between clinical, guest Wi-Fi, payment, and IoT medical devices."
    ],
    "testimonial": {
      "quote": "We needed a partner who understood that a 30-minute EHR outage means rescheduling a whole afternoon of patients. Siebert treats it that way.",
      "name": "Practice Administrator",
      "role": "Multi-provider medical group",
      "company": "Hudson Valley, NY"
    },
    "caseStudyHint": "Multi-provider medical group · EHR uptime + HIPAA risk analysis",
    "relatedServices": [
      {
        "title": "Cybersecurity & Compliance",
        "href": "/services",
        "description": "HIPAA risk analysis, EDR, MFA, and policy work mapped to the Security Rule."
      },
      {
        "title": "Backup & Disaster Recovery",
        "href": "/services",
        "description": "Immutable backups for the EHR, imaging, and Microsoft 365 with tested recovery."
      },
      {
        "title": "Managed IT & Helpdesk",
        "href": "/services",
        "description": "Clinical-aware helpdesk and proactive monitoring tuned to exam-room workflow."
      }
    ],
    "ctaLabel": "Book a healthcare IT consultation"
  },
  {
    "slug": "legal",
    "name": "Legal",
    "shortLabel": "Law firms & legal practices",
    "navTitle": "Legal IT",
    "metaDescription": "Confidentiality-first managed IT for law firms — secure document management, eDiscovery support, encrypted email, and 24/7 helpdesk for attorneys and staff.",
    "hero": {
      "eyebrow": "Industry · Legal",
      "title": "IT that takes attorney-client privilege as seriously as you do.",
      "subtitle": "Your matters live in your DMS, your email, and your file shares — and the duty of confidentiality follows every byte. We harden the systems, lock down access, and keep the firm productive when a deal is closing at 11pm."
    },
    "painPoints": [
      {
        "title": "Confidentiality and privilege exposure",
        "description": "Shared drives with no permissions, personal email used for client work, and unencrypted laptops walking out of the office."
      },
      {
        "title": "DMS and email outages mid-matter",
        "description": "iManage, NetDocuments, or Outlook going down during a filing deadline or due-diligence sprint."
      },
      {
        "title": "Phishing and wire-fraud risk",
        "description": "Business email compromise targeting trust accounts, real estate closings, and partner approvals."
      },
      {
        "title": "eDiscovery and litigation holds",
        "description": "No defensible process for preserving email, Teams chats, and files when a hold drops."
      }
    ],
    "regulations": [
      {
        "name": "ABA Model Rules 1.1 & 1.6",
        "description": "Duty of competence (including tech competence) and the duty to safeguard confidential client information."
      },
      {
        "name": "NY SHIELD Act",
        "description": "Reasonable safeguards for any private information of NY residents held by the firm."
      },
      {
        "name": "GLBA (real estate & lending matters)",
        "description": "Safeguards Rule controls when handling consumer financial information."
      },
      {
        "name": "HIPAA (health-related practices)",
        "description": "Required when the firm handles PHI for medical, employment, or personal-injury matters."
      },
      {
        "name": "Court & client cyber requirements",
        "description": "Outside-counsel guidelines, MFA mandates, and security questionnaires from corporate clients."
      }
    ],
    "softwareStacks": [
      {
        "category": "Document & matter management",
        "items": [
          "iManage Work / Cloud",
          "NetDocuments",
          "Worldox",
          "Clio Manage",
          "MyCase",
          "PracticePanther",
          "SharePoint / OneDrive"
        ]
      },
      {
        "category": "Time, billing & litigation",
        "items": [
          "Elite 3E / ProLaw",
          "Aderant Expert",
          "TABS3",
          "Tabs / Bill4Time",
          "Relativity / Everlaw",
          "Logikcull",
          "CaseMap"
        ]
      },
      {
        "category": "Productivity & security",
        "items": [
          "Microsoft 365 (E5 / Business Premium)",
          "Mimecast / Proofpoint",
          "Duo / Microsoft MFA",
          "Sophos / SentinelOne EDR",
          "BitLocker + Intune"
        ]
      }
    ],
    "whatWeDo": [
      "Locked-down Microsoft 365 with MFA, conditional access, and DLP for client data.",
      "DMS administration and break-fix for iManage, NetDocuments, and SharePoint matter sites.",
      "Wire-fraud and BEC defense — anti-phishing, banking change verification, and partner training.",
      "Defensible litigation hold and eDiscovery collection workflows across mailboxes and Teams.",
      "After-hours and weekend support tuned to filing deadlines and closings."
    ],
    "testimonial": {
      "quote": "When the DMS hiccups at 9pm before a closing, we need someone who answers. Siebert does, and they understand what's at stake.",
      "name": "Managing Partner",
      "role": "Mid-sized law firm",
      "company": "Hudson Valley, NY"
    },
    "caseStudyHint": "Mid-sized law firm · BEC prevention + iManage support",
    "relatedServices": [
      {
        "title": "Cybersecurity & Compliance",
        "href": "/services",
        "description": "MFA, DLP, anti-phishing, and policies aligned to ABA 1.6 and SHIELD."
      },
      {
        "title": "Cloud Services",
        "href": "/services",
        "description": "Microsoft 365 hardening, SharePoint matter sites, and email security."
      },
      {
        "title": "Backup & Disaster Recovery",
        "href": "/services",
        "description": "Immutable backups for the DMS, mailboxes, Teams, and OneDrive."
      }
    ],
    "ctaLabel": "Book a legal IT consultation"
  },
  {
    "slug": "financial-services",
    "name": "Financial Services",
    "shortLabel": "RIAs, broker-dealers & finance",
    "navTitle": "Financial Services IT",
    "metaDescription": "SEC, GLBA, and PCI-aligned managed IT for RIAs, broker-dealers, accounting firms, and lenders. Compliance, archiving, and 24/7 support.",
    "hero": {
      "eyebrow": "Industry · Financial Services",
      "title": "Managed IT that survives an SEC exam — and a Monday-morning trade desk.",
      "subtitle": "Regulators expect a written cybersecurity program, tested controls, and an incident response plan you can prove. We build it, run it, and document it — without slowing the front office down."
    },
    "painPoints": [
      {
        "title": "SEC and FINRA exam readiness",
        "description": "Reg S-P, S-ID, and the new cybersecurity rules require evidence — not promises. Most firms can't pull it on demand."
      },
      {
        "title": "Email archiving and supervision gaps",
        "description": "Texts, WhatsApp, and personal email used for client communication with no capture or review."
      },
      {
        "title": "Vendor and third-party risk",
        "description": "Custodians, portfolio tools, and cloud providers with no documented due diligence or monitoring."
      },
      {
        "title": "Wire fraud and account takeover",
        "description": "Targeted phishing against advisors and ops staff; weak MFA on critical financial platforms."
      }
    ],
    "regulations": [
      {
        "name": "SEC Reg S-P (Safeguards & Disposal)",
        "description": "Written policies to safeguard customer records and dispose of consumer information securely."
      },
      {
        "name": "SEC Reg S-ID (Identity Theft Red Flags)",
        "description": "Documented program to detect, prevent, and mitigate identity theft on covered accounts."
      },
      {
        "name": "SEC Cybersecurity Risk Management Rule",
        "description": "Written cyber policies, annual review, and material incident disclosure."
      },
      {
        "name": "GLBA Safeguards Rule",
        "description": "Designated qualified individual, risk assessment, MFA, encryption, and incident response plan."
      },
      {
        "name": "FINRA cybersecurity guidance",
        "description": "Supervision of electronic communications, business continuity, and recordkeeping under Rule 17a-4."
      },
      {
        "name": "PCI-DSS",
        "description": "Required wherever card payments are taken or processed by the firm."
      }
    ],
    "softwareStacks": [
      {
        "category": "Portfolio, CRM & planning",
        "items": [
          "Orion / Black Diamond / Tamarac",
          "Addepar",
          "Redtail / Wealthbox",
          "eMoney / MoneyGuidePro",
          "Salesforce Financial Services Cloud"
        ]
      },
      {
        "category": "Trading, custody & accounting",
        "items": [
          "Schwab Advisor Center",
          "Fidelity Institutional",
          "Pershing NetX360",
          "Bloomberg Terminal",
          "QuickBooks / Sage Intacct",
          "CCH Axcess / UltraTax"
        ]
      },
      {
        "category": "Compliance & security",
        "items": [
          "Smarsh / Global Relay archiving",
          "Mimecast / Proofpoint",
          "Microsoft 365 with Purview",
          "Duo / Microsoft MFA",
          "SentinelOne / CrowdStrike EDR"
        ]
      }
    ],
    "whatWeDo": [
      "Written information security program (WISP) mapped to GLBA Safeguards and SEC Reg S-P / S-ID.",
      "Microsoft 365 hardening with conditional access, DLP, and Purview for archiving and review.",
      "Smarsh / Global Relay deployment to capture email, Teams, and mobile communications.",
      "Vendor risk inventory, third-party diligence, and annual control testing.",
      "Incident response runbooks ready for the new SEC material incident disclosure rules."
    ],
    "testimonial": {
      "quote": "Our last SEC exam asked for our cyber program by name. We handed it over the same day because Siebert had it built and documented.",
      "name": "Chief Compliance Officer",
      "role": "Registered Investment Advisor",
      "company": "Hudson Valley, NY"
    },
    "caseStudyHint": "RIA · WISP + Smarsh archiving rollout ahead of SEC exam",
    "relatedServices": [
      {
        "title": "Cybersecurity & Compliance",
        "href": "/services",
        "description": "WISP, GLBA Safeguards, and SEC cyber rule implementation and evidence."
      },
      {
        "title": "Cloud Services",
        "href": "/services",
        "description": "Microsoft 365, Purview archiving, and conditional access for advisors."
      },
      {
        "title": "Backup & Disaster Recovery",
        "href": "/services",
        "description": "Recordkeeping-grade backup and BCP testing under FINRA and SEC expectations."
      }
    ],
    "ctaLabel": "Book a financial services IT consultation"
  },
  {
    "slug": "dental",
    "name": "Dental",
    "shortLabel": "Dental practices & DSOs",
    "navTitle": "Dental IT",
    "metaDescription": "HIPAA-compliant managed IT for dental practices and DSOs. Dentrix, Eaglesoft, Open Dental, and digital imaging support with 24/7 helpdesk.",
    "hero": {
      "eyebrow": "Industry · Dental",
      "title": "Dentrix won't open. The hygienist's chair is full. We answer.",
      "subtitle": "Dental practices live and die by the practice management system, the imaging server, and the front-desk PCs. We keep them all running, encrypt the patient data behind them, and pick up the phone when the schedule is on the line."
    },
    "painPoints": [
      {
        "title": "Practice management server crashes",
        "description": "Dentrix or Eaglesoft databases that fail mid-day and leave the front desk paper-and-pen."
      },
      {
        "title": "Imaging that won't load at the chair",
        "description": "Dexis, Sirona, Carestream, or Romexis acquisitions stuck on slow networks or aging operatory PCs."
      },
      {
        "title": "HIPAA exposure on tight margins",
        "description": "Shared logins at the front desk, unencrypted laptops, no risk analysis, no BAA tracking."
      },
      {
        "title": "Multi-location DSO sprawl",
        "description": "Each office on a different ISP, a different firewall, a different backup — and no central visibility."
      }
    ],
    "regulations": [
      {
        "name": "HIPAA Security Rule",
        "description": "Risk analysis, access control, audit logging, encryption, and workforce training for ePHI."
      },
      {
        "name": "HIPAA Privacy & Breach Notification",
        "description": "BAAs with every PHI vendor and a documented breach response plan."
      },
      {
        "name": "NY SHIELD Act",
        "description": "Reasonable security safeguards for the personal information of NY residents."
      },
      {
        "name": "PCI-DSS",
        "description": "Card-on-file and front-desk payments put the operatory network in PCI scope."
      }
    ],
    "softwareStacks": [
      {
        "category": "Practice management",
        "items": [
          "Dentrix Enterprise & G-series",
          "Henry Schein Eaglesoft",
          "Open Dental",
          "Curve Dental (cloud)",
          "Carestream PracticeWorks / SoftDent",
          "tab32"
        ]
      },
      {
        "category": "Imaging & clinical",
        "items": [
          "Dexis",
          "Sirona / Sidexis",
          "Carestream CS Imaging",
          "Planmeca Romexis",
          "VixWin",
          "Apteryx XVWeb"
        ]
      },
      {
        "category": "Productivity & security",
        "items": [
          "Microsoft 365 with HIPAA BAA",
          "Sophos / SentinelOne EDR",
          "Datto / Veeam backup",
          "Meraki / Fortinet firewalls",
          "Duo MFA"
        ]
      }
    ],
    "whatWeDo": [
      "Annual HIPAA risk analysis with a written remediation roadmap and BAA inventory.",
      "Dentrix / Eaglesoft / Open Dental server tuning, patching, and break-fix.",
      "Operatory PC standards, imaging-grade networking, and end-of-life refresh planning.",
      "Immutable backup for the PMS database with documented restore tests.",
      "Standardized firewalls, Wi-Fi, and remote management across every location of the DSO."
    ],
    "testimonial": {
      "quote": "When Dentrix slows down, the whole office stops. Siebert finally got our server and operatory PCs running like new — and they pick up the phone fast.",
      "name": "Office Manager",
      "role": "Group dental practice",
      "company": "Hudson Valley, NY"
    },
    "caseStudyHint": "Multi-location dental group · Dentrix performance + HIPAA program",
    "relatedServices": [
      {
        "title": "Managed IT & Helpdesk",
        "href": "/services",
        "description": "Front-desk and operatory support, server care, and proactive monitoring."
      },
      {
        "title": "Cybersecurity & Compliance",
        "href": "/services",
        "description": "HIPAA risk analysis, EDR, MFA, and policies for dental practices and DSOs."
      },
      {
        "title": "Backup & Disaster Recovery",
        "href": "/services",
        "description": "Tested backup for Dentrix, Eaglesoft, and imaging — with documented RTOs."
      }
    ],
    "ctaLabel": "Book a dental IT consultation"
  },
  {
    "slug": "government-contractors",
    "name": "Government Contractors",
    "shortLabel": "DoD & federal contractors",
    "navTitle": "Gov Contractor IT",
    "metaDescription": "CMMC, NIST 800-171, and DFARS-aligned managed IT for defense and federal contractors. CUI enclaves, GCC High, and assessment-ready evidence.",
    "hero": {
      "eyebrow": "Industry · Government Contractors",
      "title": "CMMC and NIST 800-171, built into the way you actually work.",
      "subtitle": "If you handle CUI, the prime is going to ask for evidence — and the C3PAO is going to want to see it. We build the enclave, implement the 110 controls, and produce the SSP and POA&M your assessor expects."
    },
    "painPoints": [
      {
        "title": "CMMC Level 2 timeline pressure",
        "description": "Primes adding DFARS 7021 to flow-downs and asking for SPRS scores, with no path to compliance."
      },
      {
        "title": "CUI mixed in with the rest of the business",
        "description": "Drawings, specs, and ITAR data living in general-purpose Microsoft 365 with no enclave, no labels, and no logging."
      },
      {
        "title": "Incomplete SSP and POA&M",
        "description": "Templates copied off the internet, controls marked 'implemented' with no evidence, and no plan to close gaps."
      },
      {
        "title": "FCI and CUI on engineer laptops and CNC machines",
        "description": "Endpoints, shop-floor PCs, and OT devices that have never seen a security baseline."
      }
    ],
    "regulations": [
      {
        "name": "DFARS 252.204-7012",
        "description": "Adequate security for CUI, 72-hour incident reporting, and media preservation requirements."
      },
      {
        "name": "DFARS 252.204-7019 / 7020",
        "description": "NIST SP 800-171 self-assessment with a current SPRS score on file."
      },
      {
        "name": "DFARS 252.204-7021 (CMMC)",
        "description": "CMMC Level 1 or Level 2 certification before contract award for covered programs."
      },
      {
        "name": "NIST SP 800-171 Rev. 2/3",
        "description": "110 controls across 14 families covering access, audit, configuration, IR, and more."
      },
      {
        "name": "ITAR & EAR",
        "description": "Export control rules that govern who can access technical data and from where."
      }
    ],
    "softwareStacks": [
      {
        "category": "Compliant cloud & productivity",
        "items": [
          "Microsoft 365 GCC High",
          "Azure Government",
          "AWS GovCloud",
          "Microsoft Purview (labels, DLP, audit)",
          "Microsoft Defender for Endpoint"
        ]
      },
      {
        "category": "Engineering & business systems",
        "items": [
          "SolidWorks / PDM",
          "Autodesk Vault",
          "Siemens NX / Teamcenter",
          "Deltek Costpoint / Unanet",
          "QuickBooks / NetSuite",
          "Procurement & ITAR-aware file shares"
        ]
      },
      {
        "category": "Compliance tooling",
        "items": [
          "Kiteworks / PreVeil for CUI sharing",
          "Tenable / Nessus for vuln scanning",
          "Splunk / Sentinel for audit logging",
          "Duo / YubiKey FIPS-validated MFA",
          "BitLocker / FileVault FIPS mode"
        ]
      }
    ],
    "whatWeDo": [
      "CUI scoping workshop and enclave design — GCC High, GovCloud, or hybrid.",
      "NIST 800-171 gap assessment with a complete SSP, POA&M, and SPRS score upload.",
      "Implementation of MFA, FIPS-validated encryption, audit logging, and configuration baselines.",
      "Incident response runbook tuned to the DFARS 72-hour reporting clock.",
      "Pre-assessment readiness review with your C3PAO before the formal CMMC assessment."
    ],
    "testimonial": {
      "quote": "Our prime asked for our SPRS score and CMMC plan. Siebert had us scoped, scored, and on a remediation timeline within a month.",
      "name": "Director of Operations",
      "role": "DoD subcontractor",
      "company": "Hudson Valley, NY"
    },
    "caseStudyHint": "DoD subcontractor · GCC High enclave + 800-171 SSP/POA&M",
    "relatedServices": [
      {
        "title": "Cybersecurity & Compliance",
        "href": "/services",
        "description": "NIST 800-171 implementation, SSP/POA&M, and CMMC readiness."
      },
      {
        "title": "Cloud Services",
        "href": "/services",
        "description": "Microsoft 365 GCC High, Azure Government, and AWS GovCloud enclaves."
      },
      {
        "title": "Networking & Infrastructure",
        "href": "/services",
        "description": "Firewall baselines, network segmentation, and audit logging for CUI environments."
      }
    ],
    "ctaLabel": "Book a CMMC / 800-171 consultation"
  },
  {
    "slug": "manufacturing",
    "name": "Manufacturing",
    "shortLabel": "Manufacturing & distribution",
    "navTitle": "Manufacturing IT",
    "metaDescription": "Managed IT for Hudson Valley manufacturers. ERP support, OT/IT convergence, plant-floor uptime, and cybersecurity for shop-floor and corporate networks.",
    "hero": {
      "eyebrow": "Industry · Manufacturing",
      "title": "Uptime on the shop floor. Visibility from the front office.",
      "subtitle": "When a line stops, the cost is measured in dollars per minute. We unify your ERP, plant-floor controls, and corporate IT under one managed plan — with the segmentation and monitoring to keep ransomware out of production."
    },
    "painPoints": [
      {
        "title": "Plant-floor downtime nobody owns",
        "description": "PLCs, HMIs, and MES screens going dark with the controls vendor and IT each pointing at the other."
      },
      {
        "title": "ERP slowness during month-end",
        "description": "SAP, Epicor, or NetSuite crawling under load when the team needs it most."
      },
      {
        "title": "OT/IT cyber risk",
        "description": "Flat networks where a phishing click on a sales laptop can reach the CNC machines and the PLCs."
      },
      {
        "title": "Aging Windows on the shop floor",
        "description": "Windows 7 or unsupported HMIs running critical equipment with no patching, no monitoring, no plan."
      }
    ],
    "regulations": [
      {
        "name": "NIST Cybersecurity Framework (CSF) 2.0",
        "description": "The de-facto baseline customers and insurers expect for governance, identify, protect, detect, respond, and recover."
      },
      {
        "name": "NIST SP 800-82 (ICS Security)",
        "description": "Guidance for protecting industrial control systems, SCADA, and OT environments."
      },
      {
        "name": "IEC 62443",
        "description": "International standard for industrial automation and control system security."
      },
      {
        "name": "CMMC / NIST 800-171 (DoD work)",
        "description": "Required for any production tied to DoD contracts or CUI."
      },
      {
        "name": "Cyber insurance requirements",
        "description": "MFA, EDR, immutable backup, and segmentation are now table-stakes on policy renewals."
      }
    ],
    "softwareStacks": [
      {
        "category": "ERP, MES & PLM",
        "items": [
          "SAP S/4HANA & Business One",
          "Epicor Kinetic",
          "Microsoft Dynamics 365 / Business Central",
          "NetSuite",
          "Infor CloudSuite",
          "Plex / Rockwell MES",
          "Autodesk Vault / SolidWorks PDM"
        ]
      },
      {
        "category": "Plant floor & OT",
        "items": [
          "Rockwell / Allen-Bradley PLCs",
          "Siemens SIMATIC",
          "Ignition SCADA",
          "Wonderware / AVEVA",
          "Mazak / Fanuc / Haas CNCs",
          "Industrial Wi-Fi & RFID"
        ]
      },
      {
        "category": "Productivity & security",
        "items": [
          "Microsoft 365 / Teams",
          "Fortinet / Palo Alto NGFWs",
          "Cisco Meraki for site-to-site",
          "SentinelOne / CrowdStrike EDR",
          "Veeam / Datto backup with immutable storage"
        ]
      }
    ],
    "whatWeDo": [
      "OT/IT network segmentation with industrial firewalls between corporate, plant, and guest networks.",
      "ERP support and tuning for SAP, Epicor, Dynamics, and NetSuite — including Citrix / RDS front ends.",
      "Asset inventory of every PLC, HMI, and CNC with patch and lifecycle plans.",
      "Immutable, off-site backup with documented RTOs for production and ERP systems.",
      "24/7 monitoring tuned for shift schedules — alerts that wake us up, not your plant manager."
    ],
    "testimonial": {
      "quote": "Our line stops, and dollars stop. Siebert built the segmentation, the backups, and the response plan that lets us sleep at night.",
      "name": "Plant Manager",
      "role": "Precision manufacturer",
      "company": "Hudson Valley, NY"
    },
    "caseStudyHint": "Precision manufacturer · OT/IT segmentation + ERP performance",
    "relatedServices": [
      {
        "title": "Networking & Infrastructure",
        "href": "/services",
        "description": "OT/IT segmentation, industrial firewalls, and shop-floor Wi-Fi from Fortinet, Meraki, and Palo Alto."
      },
      {
        "title": "Cybersecurity & Compliance",
        "href": "/services",
        "description": "EDR, MFA, and NIST CSF programs that hold up to insurer and customer audits."
      },
      {
        "title": "Backup & Disaster Recovery",
        "href": "/services",
        "description": "Immutable backup and tested recovery for ERP, MES, and engineering data."
      }
    ],
    "ctaLabel": "Book a manufacturing IT consultation"
  }
] as const;
