import { PortalLayout } from "@/components/layout/PortalLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Award, Clock, PlayCircle } from "lucide-react";

// Mock data since we didn't write full hooks for certs yet, ensuring UI is complete.
const MOCK_CERTS = [
  { id: 1, name: "Zoom Solutions Sales Specialist", provider: "Zoom", duration: "4 hours", status: "completed", progress: 100 },
  { id: 2, name: "Siebert Cloud Architect Foundation", provider: "Siebert Services", duration: "6 hours", status: "in_progress", progress: 45 },
  { id: 3, name: "Cybersecurity Basics for Partners", provider: "Siebert Services", duration: "2 hours", status: "not_started", progress: 0 },
  { id: 4, name: "Advanced Networking Sales", provider: "Siebert Services", duration: "8 hours", status: "not_started", progress: 0 },
];

export default function Training() {
  return (
    <PortalLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Training & Certifications</h1>
        <p className="text-muted-foreground mt-1">Level up your team to unlock higher partner tiers.</p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {MOCK_CERTS.map(cert => (
          <div key={cert.id} className="bg-card border border-border/50 rounded-2xl p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <Badge variant="outline" className="bg-slate-50 dark:bg-slate-900 shadow-sm">{cert.provider}</Badge>
              {cert.status === 'completed' ? (
                <Badge variant="success" className="shadow-sm">Certified</Badge>
              ) : cert.status === 'in_progress' ? (
                <Badge variant="warning" className="shadow-sm">In Progress</Badge>
              ) : null}
            </div>
            
            <h3 className="text-xl font-bold text-foreground mb-2 leading-tight">{cert.name}</h3>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 font-medium">
              <Clock className="w-4 h-4" /> {cert.duration}
            </div>

            <div className="mt-auto pt-4 border-t border-border/50">
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span>Progress</span>
                <span>{cert.progress}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-6 shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full transition-all duration-1000" 
                  style={{ width: `${cert.progress}%` }} 
                />
              </div>

              <Button className="w-full rounded-xl shadow-md gap-2" variant={cert.status === 'completed' ? 'outline' : 'default'}>
                {cert.status === 'completed' ? (
                   <><Award className="w-4 h-4" /> View Certificate</>
                ) : (
                   <><PlayCircle className="w-4 h-4" /> {cert.progress > 0 ? "Continue" : "Start Course"}</>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </PortalLayout>
  );
}
