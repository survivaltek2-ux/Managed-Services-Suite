import { motion } from "framer-motion";
import { Shield } from "lucide-react";

const LAST_UPDATED = "March 26, 2026";

const sections = [
  {
    title: "Introduction",
    content: `Siebert Repair Services LLC, doing business as Siebert Services ("Siebert Services," "we," "our," or "us"), is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website (siebertrservices.com), use our client or partner portals, or interact with us through any other means including SMS messaging.

Please read this policy carefully. If you disagree with its terms, please discontinue use of our services.`,
  },
  {
    title: "Information We Collect",
    subsections: [
      {
        subtitle: "Information You Provide Directly",
        text: `We may collect information you voluntarily provide, including:
• Full name and contact information (email address, phone number, mailing address)
• Business name, title, and company details
• Account credentials for our client and partner portals
• Communications sent to us via contact forms, email, or phone
• Billing and payment information (processed securely through third-party payment processors)
• Details submitted in support tickets, quote requests, or proposals`,
      },
      {
        subtitle: "Information Collected Automatically",
        text: `When you visit our website or portals, we may automatically collect:
• IP address and general geographic location
• Browser type, operating system, and device information
• Pages visited, links clicked, and time spent on pages
• Referring URLs and exit pages
• Session data via cookies and similar technologies`,
      },
    ],
  },
  {
    title: "SMS Messaging & Mobile Phone Numbers",
    highlight: true,
    phrase: "Siebert Services does not share, sell, or rent your mobile phone number or any personal information collected through SMS messaging with third parties for their marketing purposes. Your mobile number will only be used to send you the SMS messages you have opted in to receive.",
    content: `By opting in to SMS communications from Siebert Services, you consent to receive text messages related to your account, service updates, support notifications, and other information you have requested. Standard message and data rates may apply. You may opt out at any time by replying STOP to any message or by contacting us directly.`,
  },
  {
    title: "How We Use Your Information",
    content: `We use the information we collect to:
• Provide, operate, and maintain our IT services and managed service offerings
• Create and manage your client or partner portal account
• Process transactions and send related billing communications
• Respond to your inquiries, support tickets, and service requests
• Send administrative and operational communications (service alerts, maintenance notices, account updates)
• Send marketing and promotional communications, where you have opted in
• Improve our website, services, and customer experience
• Comply with applicable legal obligations
• Detect, investigate, and prevent fraudulent or unauthorized activity`,
  },
  {
    title: "How We Share Your Information",
    content: `We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following limited circumstances:

Service Providers: We work with trusted third-party vendors (hosting providers, payment processors, email delivery services, customer support tools) who assist us in operating our business. These vendors are contractually bound to use your data only to perform services on our behalf.

Business Transfers: If Siebert Services is involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. We will notify you of any such change.

Legal Compliance: We may disclose your information if required by law, court order, or governmental authority, or if we believe disclosure is necessary to protect our rights, your safety, or the safety of others.

With Your Consent: We may share your information for any other purpose with your explicit consent.`,
  },
  {
    title: "Cookies and Tracking Technologies",
    content: `Our website uses cookies and similar technologies to enhance your browsing experience, analyze site traffic, and understand where visitors are coming from. You may control cookie preferences through your browser settings; however, disabling certain cookies may affect the functionality of our portals and services.

We do not currently use third-party advertising cookies or cross-site tracking tools for behavioral advertising purposes.`,
  },
  {
    title: "Data Security",
    content: `We implement industry-standard technical and organizational measures to protect your personal information against unauthorized access, loss, misuse, alteration, or destruction. These measures include encrypted data transmission (HTTPS/TLS), access controls, and secure storage practices.

While we take reasonable precautions, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security of your data.`,
  },
  {
    title: "Data Retention",
    content: `We retain your personal information for as long as necessary to fulfill the purposes described in this policy, maintain your account, provide ongoing services, and comply with our legal obligations. When information is no longer needed, we delete or anonymize it in accordance with our data retention procedures.`,
  },
  {
    title: "Your Rights and Choices",
    content: `Depending on your location, you may have the right to:
• Access the personal information we hold about you
• Request correction of inaccurate or incomplete data
• Request deletion of your personal information, subject to legal retention requirements
• Object to or restrict certain processing activities
• Withdraw consent where processing is based on consent
• Receive a copy of your data in a portable format

To exercise any of these rights, please contact us using the information in the "Contact Us" section below. We will respond to your request within a reasonable timeframe.`,
  },
  {
    title: "Children's Privacy",
    content: `Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have inadvertently collected information from a minor, please contact us immediately and we will take steps to delete it.`,
  },
  {
    title: "Third-Party Links",
    content: `Our website may contain links to third-party websites or services. This Privacy Policy does not apply to those external sites. We encourage you to review the privacy policies of any third-party sites you visit, as we have no control over their practices.`,
  },
  {
    title: "Changes to This Policy",
    content: `We may update this Privacy Policy from time to time to reflect changes in our practices or applicable law. When we make material changes, we will update the "Last Updated" date at the top of this page and, where appropriate, notify you by email or through a prominent notice on our website. Your continued use of our services after any update constitutes your acceptance of the revised policy.`,
  },
  {
    title: "Contact Us",
    content: `If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:

Siebert Repair Services LLC DBA Siebert Services
Email: support@siebertrservices.com
Website: siebertrservices.com`,
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-navy pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy to-primary/20 pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[300px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6"
          >
            <Shield className="w-4 h-4" />
            Your Privacy Matters
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-display font-extrabold text-white mb-4"
          >
            Privacy Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-lg"
          >
            Last updated: {LAST_UPDATED}
          </motion.p>
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
                    <Shield className="w-5 h-5 text-primary shrink-0" />
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
                  {section.subsections && (
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
