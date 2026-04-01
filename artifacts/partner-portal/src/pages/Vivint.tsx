import { PortalLayout } from "@/components/layout/PortalLayout";
import {
  Shield,
  Camera,
  Lock,
  Thermometer,
  Smartphone,
  Star,
  CheckCircle,
  ExternalLink,
  DollarSign,
  Users,
  Zap,
  Home,
  AlertTriangle,
} from "lucide-react";

const packages = [
  {
    name: "HomeProtect",
    subtitle: "Entry-Level",
    color: "#0176d3",
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
    color: "#2ecc71",
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

const partnerPrograms = [
  {
    title: "Authorized Dealer",
    icon: Users,
    color: "#0176d3",
    bestFor: "Sales orgs, entrepreneurs, field sales teams",
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
    title: "Affiliate Program",
    icon: Zap,
    color: "#f39c12",
    bestFor: "Content creators, publishers, review sites",
    commission: "Up to 30% or $200 flat per sale",
    payout: "Via Awin network (standard payouts)",
    details: [
      "30-day cookie duration",
      "Promote Vivint.com shop products",
      "Apply via Awin or FlexOffers",
      "Access to affiliate dashboard + tracking links",
      "Approved in a few days",
    ],
    link: "https://ui.awin.com/merchant-profile/21822",
    cta: "Apply on Awin",
  },
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

export default function Vivint() {
  return (
    <PortalLayout>
      <div className="sf-page-header px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#0176d3" }}>
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Vivint Smart Home</h1>
            <p className="text-xs text-muted-foreground">Partner resource — smart home security & automation</p>
          </div>
          <div className="ml-auto flex gap-2">
            <a
              href="https://www.vivint.com/partners/vivint-dealers"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-white"
              style={{ backgroundColor: "#0176d3" }}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Dealer Program
            </a>
            <a
              href="https://www.vivint.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border border-border bg-background text-foreground hover:bg-muted"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              vivint.com
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* Overview Banner */}
        <div className="sf-card p-5 rounded-lg" style={{ borderLeft: "4px solid #0176d3" }}>
          <div className="flex gap-4 items-start">
            <div>
              <h2 className="text-base font-semibold text-foreground mb-1">About Vivint</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Vivint, an NRG company, is one of the leading smart home security providers in the U.S. Their integrated platform combines
                professional security monitoring, energy management, and full home automation — all controlled through a single app.
                Vivint requires professional installation and is best suited for homeowners looking for a long-term, fully connected home solution.
              </p>
              <div className="flex gap-6 mt-3">
                <div className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">Founded:</span> 1999</div>
                <div className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">Headquarters:</span> Lehi, Utah</div>
                <div className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">Parent:</span> NRG Energy</div>
                <div className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">Phone:</span> 844-481-8630</div>
              </div>
            </div>
          </div>
        </div>

        {/* System Packages */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">System Packages</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {packages.map((pkg) => (
              <div
                key={pkg.name}
                className={`sf-card rounded-lg overflow-hidden ${pkg.featured ? "ring-2 ring-green-500" : ""}`}
              >
                {pkg.featured && (
                  <div className="px-4 py-1 text-xs font-medium text-white flex items-center gap-1" style={{ backgroundColor: "#2ecc71" }}>
                    <Star className="w-3 h-3" /> Most Popular
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-foreground text-base">{pkg.name}</h3>
                      <p className="text-xs text-muted-foreground">{pkg.subtitle}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold" style={{ color: pkg.color }}>{pkg.price}</div>
                      <div className="text-xs text-muted-foreground">equipment</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4 p-2 rounded" style={{ backgroundColor: `${pkg.color}10` }}>
                    <DollarSign className="w-3.5 h-3.5 shrink-0" style={{ color: pkg.color }} />
                    <span className="text-xs font-medium" style={{ color: pkg.color }}>{pkg.monitoring} monitoring · {pkg.contract}</span>
                  </div>

                  <ul className="space-y-1.5 mb-4">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-green-500" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {pkg.note && (
                    <p className="text-xs text-muted-foreground italic border-t border-border pt-3">{pkg.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monitoring Plans */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">Monthly Monitoring Plans</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {monitoringPlans.map((plan) => (
              <div key={plan.name} className="sf-card p-4 rounded-lg flex gap-4 items-start">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <plan.icon className="w-4.5 h-4.5 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-foreground">{plan.name}</h3>
                    <span className="text-sm font-bold text-blue-600">{plan.price}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{plan.description}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2 italic">
            Note: Vivint does not support self-monitoring. A monitoring plan is required with all systems.
            Pricing adjusts based on total equipment in the system.
          </p>
        </div>

        {/* Equipment Catalog */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">Equipment Catalog</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {equipment.map((cat) => (
              <div key={cat.category} className="sf-card p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <cat.icon className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-semibold text-foreground">{cat.category}</h3>
                </div>
                <ul className="space-y-1">
                  {cat.items.map((item) => (
                    <li key={item} className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/50 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Key Selling Points */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">Key Selling Points</h2>
          <div className="sf-card p-5 rounded-lg">
            <div className="grid sm:grid-cols-2 gap-2">
              {sellingPoints.map((point) => (
                <div key={point} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 mt-0.5 shrink-0 text-green-500" />
                  {point}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing Summary */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">Pricing Summary</h2>
          <div className="sf-card rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase">Cost Item</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase">Range</th>
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
                  <tr key={item} className="hover:bg-muted/30">
                    <td className="px-4 py-2.5 text-xs text-foreground">{item}</td>
                    <td className="px-4 py-2.5 text-xs font-medium text-blue-600">{range}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Partner Programs */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">Partner Programs</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {partnerPrograms.map((prog) => (
              <div key={prog.title} className="sf-card rounded-lg overflow-hidden">
                <div className="px-5 py-3 text-white" style={{ backgroundColor: prog.color }}>
                  <div className="flex items-center gap-2">
                    <prog.icon className="w-4 h-4" />
                    <h3 className="font-semibold text-sm">{prog.title}</h3>
                  </div>
                  <p className="text-xs text-white/80 mt-0.5">Best for: {prog.bestFor}</p>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <div className="text-xs text-muted-foreground">Commission</div>
                      <div className="text-sm font-semibold text-foreground">{prog.commission}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Payout</div>
                      <div className="text-sm font-semibold text-foreground">{prog.payout}</div>
                    </div>
                  </div>
                  <ul className="space-y-1.5 mb-4">
                    {prog.details.map((d) => (
                      <li key={d} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-green-500" />
                        {d}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={prog.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 w-full justify-center px-4 py-2 rounded text-xs font-medium text-white"
                    style={{ backgroundColor: prog.color }}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {prog.cta}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ideal Customer Profile */}
        <div className="sf-card p-5 rounded-lg" style={{ borderLeft: "4px solid #f39c12" }}>
          <h2 className="text-sm font-semibold text-foreground mb-2">Ideal Customer Profile</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Vivint is best suited for <strong>homeowners</strong> who are settled in their residence and want a sophisticated, fully integrated smart home system for the long term.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <h3 className="text-xs font-semibold text-green-600 mb-1.5">✓ Good Fit</h3>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Homeowners (not renters)</li>
                <li>• Families wanting full home automation</li>
                <li>• Customers interested in insurance discounts</li>
                <li>• Those who want professional installation</li>
                <li>• Long-term residents (3+ years)</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-red-500 mb-1.5">✗ Not Ideal For</h3>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Renters or temporary residents</li>
                <li>• Those expecting to move soon</li>
                <li>• Budget-focused customers (DIY preferred)</li>
                <li>• Apartment dwellers</li>
                <li>• Self-monitoring preference</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </PortalLayout>
  );
}
