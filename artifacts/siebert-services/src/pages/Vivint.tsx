import { motion } from "framer-motion";
import {
  Shield, Camera, Lock, Thermometer, Smartphone, Star, CheckCircle,
  ExternalLink, DollarSign, Users, Zap, Home, AlertTriangle, Layers, Send
} from "lucide-react";
import { Card, CardContent, Button } from "@/components/ui";
import { Link } from "wouter";
import { usePageContent } from "@/hooks/usePageContent";

const VIVINT_BLUE = "#0176d3";
const VIVINT_GREEN = "#2ecc71";

const packages = [
  {
    name: "HomeProtect",
    subtitle: "Essential Security",
    color: VIVINT_BLUE,
    price: "$199.99",
    monitoring: "$24.99/mo",
    contract: "36-month agreement",
    features: [
      "Professional-grade security hub",
      "Keypad for easy arming/disarming",
      "Door & window sensors",
      "Motion detector",
      "Mobile app access",
      "24/7 professional monitoring",
      "Free professional installation",
    ],
    cta: "Start with HomeProtect",
  },
  {
    name: "HomeProtect Pro",
    subtitle: "Full Smart Home Control",
    color: VIVINT_GREEN,
    price: "$599.99+",
    monitoring: "$39.99–$69.94/mo",
    contract: "Flexible options",
    featured: true,
    features: [
      "Everything in HomeProtect",
      "Indoor & outdoor cameras with HD video",
      "Video doorbell camera",
      "Smart locks with remote access",
      "Smart thermostat for energy savings",
      "Smart lighting automation",
      "AI-powered Smart Deter (deters intruders)",
      "Google Home & Nest integration",
      "Smoke & CO detection",
    ],
    cta: "Upgrade to Pro",
  },
];

const benefits = [
  {
    icon: Shield,
    title: "Professional Monitoring",
    description: "24/7 U.S.-based monitoring center. Real people protecting your home around the clock.",
  },
  {
    icon: Zap,
    title: "AI-Powered Smart Deter",
    description: "Detects suspicious activity before it happens and deters break-ins with lights, sirens, and camera alerts.",
  },
  {
    icon: Lock,
    title: "Remote Access & Control",
    description: "Control locks, lights, thermostats, and cameras from anywhere using your smartphone.",
  },
  {
    icon: DollarSign,
    title: "Insurance Savings",
    description: "10–20% homeowner's insurance discount available in most states — pays for itself.",
  },
  {
    icon: Smartphone,
    title: "All-in-One App",
    description: "Single app controls all your smart home devices. Arm/disarm, lock doors, adjust temperature, watch cameras.",
  },
  {
    icon: Zap,
    title: "Energy Efficiency",
    description: "Smart thermostat learns your preferences and saves up to 15% on heating/cooling costs.",
  },
];

const faq = [
  {
    q: "Is professional installation required?",
    a: "Yes, all Vivint systems include free professional installation. Our technicians will set everything up, test it, and train you to use it.",
  },
  {
    q: "Can I upgrade or change my system later?",
    a: "Absolutely. You can upgrade packages at any time. Equipment costs are credited toward upgrades, and monitoring plans are flexible.",
  },
  {
    q: "What if I move?",
    a: "Vivint systems can be relocated. There are relocation fees ($129 removal + $129 reinstall), but your contract and service continue.",
  },
  {
    q: "Do you offer financing?",
    a: "Yes. 0% APR financing is available for up to 60 months on equipment purchases, making premium systems affordable.",
  },
  {
    q: "What happens if internet goes down?",
    a: "Your system includes cellular backup monitoring. If internet fails, the system uses cellular to maintain 24/7 professional monitoring.",
  },
  {
    q: "Can I integrate with Google Home?",
    a: "Yes. HomeProtect Pro systems work with Google Home and Nest thermostats for voice control and automation.",
  },
];

export default function Vivint() {
  const content = usePageContent("vivint", {
    heroTitle: "Vivint Smart Home Security",
    heroSubtitle: "Professional monitoring + complete home automation",
    heroDescription: "Sleep better at night knowing your home is protected by 24/7 professional monitoring, AI-powered threat detection, and smart automation that gives you control from anywhere.",
  });
  return (
    <div className="w-full bg-background">
      {/* Header */}
      <motion.div
        className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white/10">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">{content.heroTitle}</h1>
              <p className="text-blue-100 text-lg mt-1">{content.heroSubtitle}</p>
            </div>
          </div>
          <p className="text-blue-100 max-w-2xl mb-8 text-lg leading-relaxed">
            {content.heroDescription}
          </p>
          <Link href="/vivint/inquiry" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-blue-900 font-bold hover:bg-blue-50 transition-colors text-lg">
            <Send className="w-5 h-5" />
            Get Your Free Quote
          </Link>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

        {/* Key Benefits */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose Vivint?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              More than just security—complete peace of mind with smart home automation.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  className="bg-card border border-border rounded-xl p-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* System Packages */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Choose Your Package</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Start with the essentials or go all-in with our full smart home suite. Upgrade anytime.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {packages.map((pkg) => (
              <motion.div
                key={pkg.name}
                className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                  pkg.featured
                    ? "border-green-500 ring-2 ring-green-200 shadow-xl"
                    : "border-border"
                }`}
                whileHover={{ y: -4 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                {pkg.featured && (
                  <div className="px-4 py-2 text-xs font-bold text-white flex items-center gap-1.5 bg-green-500">
                    <Star className="w-4 h-4 fill-current" /> MOST POPULAR
                  </div>
                )}
                <div className="p-8 bg-card">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">{pkg.name}</h3>
                      <p className="text-sm text-muted-foreground">{pkg.subtitle}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold" style={{ color: pkg.color }}>{pkg.price}</div>
                      <p className="text-xs text-muted-foreground">Equipment</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg mb-6" style={{ backgroundColor: `${pkg.color}10`, borderLeft: `4px solid ${pkg.color}` }}>
                    <p className="text-sm font-bold" style={{ color: pkg.color }}>{pkg.monitoring}</p>
                    <p className="text-xs text-muted-foreground">{pkg.contract}</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 mt-0.5 shrink-0 text-green-500" />
                        <span className="text-sm text-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/vivint/inquiry" className="block w-full px-4 py-3 rounded-lg font-bold text-white text-center transition-all" style={{ backgroundColor: pkg.color }}>
                    {pkg.cta}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* What's Included */}
        <motion.section
          className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold text-foreground mb-8">Every System Includes</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Free Professional Installation</h3>
                <p className="text-sm text-muted-foreground">Expert technicians set up, test, and train you on your system.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">24/7 Professional Monitoring</h3>
                <p className="text-sm text-muted-foreground">U.S.-based monitoring center with rapid emergency response.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Insurance Discounts</h3>
                <p className="text-sm text-muted-foreground">10–20% savings on homeowner's insurance in most states.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Flexible Financing</h3>
                <p className="text-sm text-muted-foreground">0% APR financing for up to 60 months on equipment.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Cellular Backup Monitoring</h3>
                <p className="text-sm text-muted-foreground">Protection continues even if your internet goes down.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Lifetime Warranty Option</h3>
                <p className="text-sm text-muted-foreground">Premium service plans include lifetime equipment warranty.</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Pricing Breakdown */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-foreground mb-8">Investment & Costs</h2>
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-6 py-4 font-bold text-foreground">Cost Item</th>
                  <th className="text-left px-6 py-4 font-bold text-foreground">Investment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  ["HomeProtect Equipment (one-time)", "$199.99"],
                  ["HomeProtect Pro Equipment (one-time)", "$599.99 – $2,400+"],
                  ["Professional Installation", "FREE with system"],
                  ["Basic Monitoring (monthly)", "$24.99 – $39.99"],
                  ["Enhanced Video Monitoring (per camera)", "+$5/month"],
                  ["Cellular Backup Fee", "$1.48/month"],
                  ["0% APR Financing (up to 60 months)", "Available"],
                  ["Insurance Discount (annual savings)", "10–20% off premium"],
                ].map(([item, cost]) => (
                  <tr key={item} className="hover:bg-muted/30">
                    <td className="px-6 py-4 font-medium text-foreground">{item}</td>
                    <td className="px-6 py-4 font-semibold text-blue-600">{cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground mt-4 italic">
            *Insurance savings typically pay for monitoring within months. Financing makes premium systems accessible with no upfront cost.
          </p>
        </motion.section>

        {/* FAQ */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-foreground mb-8">Common Questions</h2>
          <div className="space-y-4">
            {faq.map((item, i) => (
              <motion.details
                key={i}
                className="border border-border rounded-lg overflow-hidden"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                viewport={{ once: true }}
              >
                <summary className="px-6 py-4 cursor-pointer font-bold text-foreground hover:bg-muted/50 transition-colors flex items-center gap-2">
                  <span className="text-blue-600">+</span> {item.q}
                </summary>
                <div className="px-6 py-4 bg-muted/30 border-t border-border text-sm text-muted-foreground">
                  {item.a}
                </div>
              </motion.details>
            ))}
          </div>
        </motion.section>

        {/* Final CTA */}
        <motion.div
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Protect Your Home?</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of homeowners who sleep better with Vivint's 24/7 professional monitoring and smart home automation.
          </p>
          <Link href="/vivint/inquiry" className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-white text-blue-600 font-bold hover:bg-blue-50 transition-colors text-lg">
            <Send className="w-5 h-5" />
            Request Your Free Quote
          </Link>
          <p className="text-blue-100 text-sm mt-6">No credit card required. Flexible financing available.</p>
        </motion.div>

      </div>
    </div>
  );
}
