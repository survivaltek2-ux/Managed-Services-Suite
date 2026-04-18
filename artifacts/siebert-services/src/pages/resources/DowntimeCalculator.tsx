import { useMemo, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Calculator, Mail, ArrowRight, AlertTriangle } from "lucide-react";
import { Card, CardContent, Input, Label, Button } from "@/components/ui";
import { LeadMagnetForm, LEAD_MAGNETS } from "@/components/leadMagnets";

export default function DowntimeCalculator() {
  const magnet = LEAD_MAGNETS["downtime-calculator"];
  const [employees, setEmployees] = useState("25");
  const [hourlyCost, setHourlyCost] = useState("65");
  const [hours, setHours] = useState("4");
  const [outagesPerYear, setOutagesPerYear] = useState("4");
  const [showForm, setShowForm] = useState(false);

  const result = useMemo(() => {
    const e = Math.max(0, Number(employees) || 0);
    const h = Math.max(0, Number(hourlyCost) || 0);
    const t = Math.max(0, Number(hours) || 0);
    const o = Math.max(0, Number(outagesPerYear) || 0);
    const perOutage = e * h * t;
    const annual = perOutage * o;
    return { perOutage, annual };
  }, [employees, hourlyCost, hours, outagesPerYear]);

  const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  return (
    <div className="min-h-screen pt-28 pb-20 bg-gradient-to-b from-amber-50/40 via-white to-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <Calculator className="w-3.5 h-3.5" /> Free interactive tool
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-navy mb-4 leading-tight">
            What does an outage actually cost you?
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Plug in your numbers — see your real-time cost per outage and your annual exposure. Email yourself a summary in one click.{" "}
          </p>
        </div>

        <Card className="border-none shadow-xl">
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Employees affected</Label>
                <Input type="number" min={0} value={employees} onChange={e => setEmployees(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Avg fully-loaded hourly cost ($)</Label>
                <Input type="number" min={0} value={hourlyCost} onChange={e => setHourlyCost(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Hours of downtime</Label>
                <Input type="number" min={0} value={hours} onChange={e => setHours(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Outages per year (typical: 4)</Label>
                <Input type="number" min={0} value={outagesPerYear} onChange={e => setOutagesPerYear(e.target.value)} />
              </div>
            </div>

            <motion.div
              key={result.perOutage}
              initial={{ scale: 0.97, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-navy text-white rounded-2xl p-6 md:p-8"
            >
              <div className="grid md:grid-cols-2 gap-4 items-center">
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/60 font-bold">Cost per outage</p>
                  <p className="text-4xl md:text-5xl font-display font-bold text-primary mt-1">{fmt(result.perOutage)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/60 font-bold">Estimated annual exposure</p>
                  <p className="text-2xl md:text-3xl font-bold text-white mt-1">{fmt(result.annual)}</p>
                </div>
              </div>
              <p className="text-xs text-white/60 mt-4 flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-400" />
                Estimates exclude lost revenue, customer churn, recovery costs, and reputational damage — typically 2–3× this number.
              </p>
            </motion.div>

            {!showForm ? (
              <Button size="lg" className="w-full gap-2" onClick={() => setShowForm(true)}>
                <Mail className="w-4 h-4" /> Email me this summary
              </Button>
            ) : (
              <div className="border-t pt-6">
                <p className="text-sm font-semibold text-navy mb-4">
                  Where should we send your downtime report?
                </p>
                <LeadMagnetForm
                  magnet={magnet}
                  payload={{
                    employees: Number(employees),
                    hourlyCost: Number(hourlyCost),
                    hours: Number(hours),
                    outagesPerYear: Number(outagesPerYear),
                    perOutage: result.perOutage,
                    annual: result.annual,
                  }}
                  source="downtime_calculator"
                  cta="Email me the summary"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Want to slash that number? <Link href="/services/managed-it" className="text-primary font-semibold hover:underline">See our managed IT plans <ArrowRight className="inline w-3.5 h-3.5" /></Link>
        </div>
      </div>
    </div>
  );
}
