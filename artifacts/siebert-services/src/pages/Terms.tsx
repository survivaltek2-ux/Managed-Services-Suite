import { motion } from "framer-motion";
import { FileText } from "lucide-react";

const LAST_UPDATED = "April 14, 2026";

const sections = [
  {
    title: "Acceptance of Terms",
    content: `By accessing or using any service provided by Siebert Repair Services LLC, doing business as Siebert Services ("Siebert Services," "we," "our," or "us"), including our website (siebertrservices.com), client portal, partner portal, or any managed IT service, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please discontinue use immediately.

We reserve the right to update these Terms at any time. Continued use of our services after changes constitutes acceptance of the updated Terms.`,
  },
  {
    title: "Description of Services",
    content: `Siebert Services provides managed IT services, technology consulting, cybersecurity solutions, cloud services, VoIP, connectivity procurement, and related technology services to business clients. Specific service terms, deliverables, SLAs, and pricing are defined in separate service agreements, statements of work, or proposals provided to each client.`,
  },
  {
    title: "Accounts and Portals",
    subsections: [
      {
        subtitle: "Client Portal",
        text: `Access to the Siebert Services client portal requires a registered account. You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. Notify us immediately at support@siebertrservices.com if you suspect unauthorized access.`,
      },
      {
        subtitle: "Partner Portal",
        text: `Access to the Siebert Services partner portal is limited to approved reseller and referral partners. Partner accounts are subject to additional terms in the Siebert Services Partner Agreement. Misuse of partner portal access may result in immediate account termination.`,
      },
    ],
  },
  {
    title: "Acceptable Use",
    content: `You agree not to:
• Use our services for any unlawful purpose or in violation of any applicable law or regulation
• Attempt to gain unauthorized access to our systems, networks, or data
• Reverse engineer, decompile, or disassemble any software or system we provide
• Upload or transmit malware, viruses, or any malicious code
• Use our services to send unsolicited communications (spam)
• Resell or sublicense our services without prior written authorization
• Interfere with the proper operation of our services or infrastructure

We reserve the right to suspend or terminate access for any violation of this acceptable use policy.`,
  },
  {
    title: "Payments and Billing",
    content: `Service fees are outlined in your service agreement or proposal. Unless otherwise agreed:
• Invoices are due within 30 days of the invoice date
• Late payments may be subject to a 1.5% per month finance charge
• We reserve the right to suspend services for accounts more than 60 days past due
• All fees are in U.S. dollars unless otherwise specified
• Disputes must be submitted in writing within 15 days of invoice date

Refund eligibility is determined on a case-by-case basis and outlined in individual service agreements.`,
  },
  {
    title: "Intellectual Property",
    content: `All content on our website and portals — including text, graphics, logos, and software — is the property of Siebert Services or its licensors and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without express written permission.

Custom work or deliverables created specifically for a client are governed by the intellectual property terms in the applicable service agreement.`,
  },
  {
    title: "Limitation of Liability",
    highlight: true,
    phrase: "TO THE MAXIMUM EXTENT PERMITTED BY LAW, SIEBERT SERVICES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF OUR SERVICES.",
    content: `Our total liability to you for any claim arising out of or relating to our services shall not exceed the total fees paid by you to Siebert Services in the three (3) months preceding the claim. Some jurisdictions do not allow the exclusion of certain warranties or the limitation of liability, so some of the above limitations may not apply to you.`,
  },
  {
    title: "Disclaimer of Warranties",
    content: `Our services are provided "as is" and "as available" without warranty of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement. We do not warrant that our services will be uninterrupted, error-free, or free from viruses or other harmful components.`,
  },
  {
    title: "Confidentiality",
    content: `Each party agrees to keep confidential any non-public information disclosed by the other party in connection with the services. This obligation does not apply to information that: (a) becomes publicly available through no fault of the receiving party; (b) was already known to the receiving party; (c) is independently developed without use of confidential information; or (d) must be disclosed by law or court order.`,
  },
  {
    title: "Termination",
    content: `Either party may terminate a service agreement with 30 days written notice unless a specific term is agreed upon. We may terminate or suspend services immediately and without notice for: material breach of these Terms, non-payment, or any use that poses a security or legal risk to Siebert Services or its clients.

Upon termination, your right to access our portals ceases immediately. Any outstanding fees remain due.`,
  },
  {
    title: "Governing Law",
    content: `These Terms are governed by the laws of the State of Florida, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be resolved exclusively in the state or federal courts located in Florida. You consent to the personal jurisdiction of such courts.`,
  },
  {
    title: "Contact Information",
    content: `If you have questions about these Terms of Service, please contact us:

Siebert Repair Services LLC, dba Siebert Services
Email: support@siebertrservices.com
Website: siebertrservices.com`,
  },
];

export default function Terms() {
  return (
    <div className="min-h-screen bg-background pt-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-navy via-navy/90 to-primary/80 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-5"
          >
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 mt-1">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-1">Legal</p>
              <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white mb-2">
                Terms of Service
              </h1>
              <p className="text-white/70 text-sm">Last updated: {LAST_UPDATED}</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-10">
          {sections.map((section, i) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              {section.highlight ? (
                <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-8">
                  <h2 className="text-xl font-display font-bold text-navy mb-5 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary shrink-0" />
                    {section.title}
                  </h2>
                  {section.phrase && (
                    <p className="text-navy font-semibold text-base leading-relaxed mb-4">
                      {section.phrase}
                    </p>
                  )}
                  {section.content && (
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {section.content}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-display font-bold text-navy mb-4 pb-2 border-b border-border">
                    {i + 1}. {section.title}
                  </h2>
                  {section.content && (
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {section.content}
                    </p>
                  )}
                  {"subsections" in section && section.subsections && (
                    <div className="space-y-5 mt-2">
                      {section.subsections.map((sub) => (
                        <div key={sub.subtitle}>
                          <h3 className="font-semibold text-navy mb-2">{sub.subtitle}</h3>
                          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                            {sub.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
