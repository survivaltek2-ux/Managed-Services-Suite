import { motion } from "framer-motion";
import {
  Shield, Camera, Lock, Thermometer, Smartphone, Star, CheckCircle,
  ExternalLink, DollarSign, Users, Zap, Home, AlertTriangle, Layers
} from "lucide-react";
import { Card, CardContent, Button } from "@/components/ui";
import { Link } from "wouter";

const VIVINT_BLUE = "#0176d3";
const VIVINT_GREEN = "#2ecc71";

const packages = [
  {
    name: "HomeProtect",
    subtitle: "Entry-Level",
    color: VIVINT_BLUE,
    price: "$199.99",
    monitoring: "$24.99/mo",
    contract: "36-month agreement",
    features: [
      "Security Hub + Keypad",
      "Motion Sensor",
      "Door & Window Sensors",
      "Vivint App Access",
      "24/7 Professional Monitoring",
      "Free Professional Installation",
    ],
    note: "Upgrade to HomeProtect Pro at any time — your initial purchase is credited toward the upgrade.",
  },
  {
    name: "HomeProtect Pro",
    subtitle: "Full Smart Home",
    color: VIVINT_GREEN,
    price: "$599.99+",
    monitoring: "$39.99–$69.94/mo",
    contract: "Flexible options",
    featured: true,
    features: [
      "Everything in HomeProtect",
      "Smart Cameras (indoor/outdoor)",
      "Video Doorbell Camera Pro",
      "Smart Lock + Smart Thermostat",
      "Smart Lighting Control",
      "AI-Powered Smart Deter",
      "Smoke & CO Detector",
      "Google Home / Nest Integration",
    ],
    note: "Fully customizable — add any combination of Vivint's smart home devices.",
  },
];

const monitoringPlans = [
  {
    name: "Smart Home Monitoring",
    price: "$39.99/mo",
    description: "Full app control, smart lock, thermostat, and automation features.",
    icon: Home,
  },
  {
    name: "Smart Home Video Monitoring",
    price: "$44.99–$69.94/mo",
    description: "Everything above plus video recording and cloud storage for up to 6 cameras (+$5/camera).",
    icon: Camera,
  },
];

const equipment = [
  { category: "Cameras", icon: Camera, items: ["Indoor Camera Pro", "Outdoor Camera Pro", "Doorbell Camera Pro"] },
  { category: "Sensors", icon: AlertTriangle, items: ["Door/Window Sensors", "Motion Sensors", "Glass Break Sensors"] },
  { category: "Safety", icon: Shield, items: ["Smoke & CO Detector", "Water/Flood Sensors"] },
  { category: "Smart Home", icon: Lock, items: ["Smart Locks", "Smart Thermostat", "Smart Lighting"] },
  { category: "Control", icon: Smartphone, items: ["Vivint Smart Hub (tablet)", "Vivint Mobile App"] },
];

const sellingPoints = [
  "Professional installation included — no DIY required",
  "U.S.-based, in-house 24/7 monitoring center",
  "AI-powered Smart Deter deters break-ins before they happen",
  "0% financing for up to 60 months on equipment",
  "Homeowners insurance discount of 10–20% in many states",
  "Google Home and Nest thermostat integration",
  "Lifetime warranty available with Premium Service plan",
];

const partnerPrograms = [
  {
    title: "Authorized Dealer",
    icon: Users,
    color: VIVINT_BLUE,
    commission: "Uncapped + revenue share",
    payout: "Paid weekly — Friday after installation",
    details: [
      "No setup fees, no startup costs",
      "Live reporting: commissions, rep training, analytics",
      "Dedicated account manager + 24/7 support",
      "Onboard reps in under 24 hours",
      "Marketing resources and training portal",
    ],
    link: "https://www.vivint.com/partners/vivint-dealers",
    cta: "Apply as Authorized Dealer",
  },
  {
    title: "Affiliate Program (Awin)",
    icon: Zap,
    color: "#f39c12",
    commission: "Up to 30% or $200 flat per sale",
    payout: "Via Awin network (standard payouts)",
    details: [
      "30-day cookie duration",
      "Promote Vivint.com shop products",
      "Access to affiliate dashboard + tracking links",
      "Approved in a few days",
      "No approval hassles",
    ],
    link: "https://ui.awin.com/merchant-profile/21822",
    cta: "Apply on Awin",
  },
];

export default function Vivint() {
  return (
    <div className="w-full bg-background">
      {/* Header */}
      <motion.div
        className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12 px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white/10">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Vivint Smart Home</h1>
              <p className="text-blue-100 text-lg mt-1">Professional Security & Home Automation</p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <a
              href="https://www.vivint.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-blue-900 font-semibold hover:bg-blue-50 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Visit vivint.com
            </a>
            <a
              href="https://www.vivint.com/partners/vivint-dealers"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/20 text-white font-semibold hover:bg-white/30 transition-colors border border-white/30"
            >
              <ExternalLink className="w-4 h-4" />
              Dealer Program
            </a>
          </div>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">

        {/* About */}
        <motion.section
          className="grid md:grid-cols-3 gap-6 items-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="md:col-span-2">
            <h2 className="text-3xl font-bold text-foreground mb-4">About Vivint</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Vivint, an NRG company, is one of the leading smart home security providers in the U.S.
              Their integrated platform combines professional security monitoring, energy management,
              and full home automation — all controlled through a single app.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Vivint requires professional installation and is best suited for homeowners looking for
              a long-term, fully connected home solution with premium support.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-xs text-muted-foreground font-semibold">Founded</p>
                <p className="text-lg font-bold text-foreground">1999</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-xs text-muted-foreground font-semibold">Headquarters</p>
                <p className="text-lg font-bold text-foreground">Lehi, Utah</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-xs text-muted-foreground font-semibold">Parent Company</p>
                <p className="text-lg font-bold text-foreground">NRG Energy</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-xs text-muted-foreground font-semibold">Phone</p>
                <p className="text-lg font-bold text-foreground">844-481-8630</p>
              </div>
            </div>
          </div>
          <div className="md:col-span-1">
            <div className="relative h-72 rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
              <Shield className="w-32 h-32 text-blue-200" />
            </div>
          </div>
        </motion.section>

        {/* System Packages */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-foreground mb-8">System Packages</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {packages.map((pkg) => (
              <motion.div
                key={pkg.name}
                className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                  pkg.featured
                    ? `border-${pkg.color === VIVINT_GREEN ? "green" : "blue"}-500 ring-2 ring-${pkg.color === VIVINT_GREEN ? "green" : "blue"}-200`
                    : "border-border"
                }`}
                whileHover={{ y: -4 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                {pkg.featured && (
                  <div className="px-4 py-2 text-xs font-semibold text-white flex items-center gap-1.5" style={{ backgroundColor: pkg.color }}>
                    <Star className="w-4 h-4 fill-current" /> Most Popular
                  </div>
                )}
                <div className="p-6 bg-card">
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

                  <div className="p-3 rounded-lg mb-4" style={{ backgroundColor: `${pkg.color}10`, borderLeft: `4px solid ${pkg.color}` }}>
                    <p className="text-sm font-semibold" style={{ color: pkg.color }}>{pkg.monitoring}</p>
                    <p className="text-xs text-muted-foreground">{pkg.contract}</p>
                  </div>

                  <ul className="space-y-2.5 mb-4">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <CheckCircle className="w-5 h-5 mt-0.5 shrink-0 text-green-500" />
                        <span className="text-sm text-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {pkg.note && (
                    <p className="text-xs text-muted-foreground italic border-t pt-3">{pkg.note}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Monitoring Plans */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-foreground mb-8">Monthly Monitoring Plans</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-3">
            {monitoringPlans.map((plan) => {
              const Icon = plan.icon;
              return (
                <motion.div
                  key={plan.name}
                  className="bg-card border border-border rounded-xl p-6 flex gap-4"
                  whileHover={{ y: -2 }}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-foreground">{plan.name}</h3>
                      <span className="font-bold text-blue-600">{plan.price}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <p className="text-sm text-muted-foreground italic bg-muted/50 border border-border rounded-lg p-4">
            Note: Vivint does not support self-monitoring. A monitoring plan is required with all systems.
            Pricing adjusts based on total equipment in the system.
          </p>
        </motion.section>

        {/* Equipment Catalog */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-foreground mb-8">Equipment Catalog</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {equipment.map((cat) => {
              const Icon = cat.icon;
              return (
                <motion.div
                  key={cat.category}
                  className="bg-card border border-border rounded-lg p-4"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center gap-2.5 mb-4">
                    <Icon className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-foreground text-sm">{cat.category}</h3>
                  </div>
                  <ul className="space-y-2">
                    {cat.items.map((item) => (
                      <li key={item} className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Key Selling Points */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-50 to-blue-50/50 border border-blue-200 rounded-xl p-8"
        >
          <h2 className="text-3xl font-bold text-foreground mb-8">Key Selling Points</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {sellingPoints.map((point) => (
              <div key={point} className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 mt-0.5 shrink-0 text-green-500" />
                <span className="text-foreground">{point}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Pricing Table */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-foreground mb-8">Pricing Summary</h2>
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-6 py-4 font-semibold text-foreground">Cost Item</th>
                  <th className="text-left px-6 py-4 font-semibold text-foreground">Range</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  ["Equipment (HomeProtect)", "$199.99"],
                  ["Equipment (HomeProtect Pro)", "$599.99–$2,400+"],
                  ["Professional Installation", "Free (included) or $199"],
                  ["Monthly Monitoring", "$39.99–$69.94+/mo"],
                  ["Cellular Maintenance Fee", "$1.48/month"],
                  ["Cloud Storage (per camera)", "$5/month after 1st"],
                  ["Local Storage (Smart Drive)", "$249.99 one-time"],
                  ["Relocation", "$129 removal + $129 reinstall"],
                  ["Financing", "0% APR up to 60 months"],
                ].map(([item, range]) => (
                  <tr key={item} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 text-foreground font-medium">{item}</td>
                    <td className="px-6 py-4 font-semibold text-blue-600">{range}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* Partner Programs */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-foreground mb-8">Partner Programs</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {partnerPrograms.map((prog) => {
              const Icon = prog.icon;
              return (
                <motion.div
                  key={prog.title}
                  className="rounded-xl overflow-hidden border border-border bg-card"
                  whileHover={{ y: -4 }}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="px-6 py-4 text-white" style={{ backgroundColor: prog.color }}>
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-5 h-5" />
                      <h3 className="font-bold text-lg">{prog.title}</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase">Commission</p>
                        <p className="text-lg font-bold text-foreground mt-1">{prog.commission}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase">Payout</p>
                        <p className="text-lg font-bold text-foreground mt-1">{prog.payout}</p>
                      </div>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {prog.details.map((d) => (
                        <li key={d} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-0.5 shrink-0 text-green-500" />
                          <span className="text-sm text-muted-foreground">{d}</span>
                        </li>
                      ))}
                    </ul>
                    <a
                      href={prog.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg font-semibold text-white transition-all"
                      style={{ backgroundColor: prog.color }}
                    >
                      <ExternalLink className="w-4 h-4" />
                      {prog.cta}
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Ideal Customer Profile */}
        <motion.section
          className="bg-amber-50 border-l-4 border-amber-500 rounded-xl overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Ideal Customer Profile</h2>
            <p className="text-muted-foreground mb-6">
              Vivint is best suited for <strong>homeowners</strong> who are settled in their residence
              and want a sophisticated, fully integrated smart home system for the long term.
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-green-600 mb-3 text-lg">✓ Good Fit</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    Homeowners (not renters)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    Families wanting full home automation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    Customers interested in insurance discounts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    Those who want professional installation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    Long-term residents (3+ years)
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-red-500 mb-3 text-lg">✗ Not Ideal For</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                    Renters or temporary residents
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                    Those expecting to move soon
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                    Budget-focused customers (DIY preferred)
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                    Apartment dwellers
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                    Self-monitoring preference
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.section>

      </div>
    </div>
  );
}
