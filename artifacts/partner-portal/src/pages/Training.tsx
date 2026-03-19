import { PortalLayout } from "@/components/layout/PortalLayout";
import { Award, Clock, PlayCircle, CheckCircle2 } from "lucide-react";

const MOCK_CERTS = [
  { id: 1, name: "Zoom Solutions Sales Specialist", provider: "Zoom", duration: "4 hours", status: "completed", progress: 100 },
  { id: 2, name: "Siebert Cloud Architect Foundation", provider: "Siebert Services", duration: "6 hours", status: "in_progress", progress: 45 },
  { id: 3, name: "Cybersecurity Basics for Partners", provider: "Siebert Services", duration: "2 hours", status: "not_started", progress: 0 },
  { id: 4, name: "Advanced Networking Sales", provider: "Siebert Services", duration: "8 hours", status: "not_started", progress: 0 },
];

export default function Training() {
  const completedCount = MOCK_CERTS.filter(c => c.status === "completed").length;
  const inProgressCount = MOCK_CERTS.filter(c => c.status === "in_progress").length;

  return (
    <PortalLayout>
      <div className="sf-page-header px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-foreground">Training & Certifications</h1>
            <span className="text-xs text-muted-foreground">{MOCK_CERTS.length} courses</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="sf-card p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#2e844a]/10 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-[#2e844a]" /></div>
            <div><p className="text-xl font-bold">{completedCount}</p><p className="text-[10px] text-muted-foreground uppercase font-medium">Completed</p></div>
          </div>
          <div className="sf-card p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#fe9339]/10 flex items-center justify-center"><Clock className="w-4 h-4 text-[#fe9339]" /></div>
            <div><p className="text-xl font-bold">{inProgressCount}</p><p className="text-[10px] text-muted-foreground uppercase font-medium">In Progress</p></div>
          </div>
          <div className="sf-card p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#0176d3]/10 flex items-center justify-center"><Award className="w-4 h-4 text-[#0176d3]" /></div>
            <div><p className="text-xl font-bold">{MOCK_CERTS.length}</p><p className="text-[10px] text-muted-foreground uppercase font-medium">Total Courses</p></div>
          </div>
        </div>

        <div className="sf-card overflow-hidden">
          <div className="sf-card-header">
            <span>All Courses</span>
          </div>
          <div className="divide-y divide-border">
            {MOCK_CERTS.map(cert => (
              <div key={cert.id} className="px-4 py-4 flex items-center gap-4 hover:bg-[#f3f3f3] transition-colors">
                <div className={`w-10 h-10 rounded flex items-center justify-center flex-shrink-0 ${
                  cert.status === "completed" ? "bg-[#2e844a]/10" : cert.status === "in_progress" ? "bg-[#fe9339]/10" : "bg-[#706e6b]/10"
                }`}>
                  {cert.status === "completed" ? <CheckCircle2 className="w-5 h-5 text-[#2e844a]" /> :
                   cert.status === "in_progress" ? <PlayCircle className="w-5 h-5 text-[#fe9339]" /> :
                   <PlayCircle className="w-5 h-5 text-[#706e6b]" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-foreground">{cert.name}</span>
                    {cert.status === "completed" && <span className="sf-badge sf-badge-success">Certified</span>}
                    {cert.status === "in_progress" && <span className="sf-badge sf-badge-warning">In Progress</span>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="sf-badge sf-badge-default">{cert.provider}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{cert.duration}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="w-32 hidden sm:block">
                    <div className="flex justify-between text-[10px] font-semibold text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>{cert.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#d8dde6] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${cert.progress}%`,
                          backgroundColor: cert.status === "completed" ? "#2e844a" : cert.progress > 0 ? "#0176d3" : "#d8dde6"
                        }}
                      />
                    </div>
                  </div>

                  <button className={`sf-btn text-xs h-7 px-3 ${cert.status === "completed" ? "sf-btn-neutral" : "sf-btn-primary"}`}>
                    {cert.status === "completed" ? (
                      <><Award className="w-3 h-3" /> Certificate</>
                    ) : (
                      <><PlayCircle className="w-3 h-3" /> {cert.progress > 0 ? "Continue" : "Start"}</>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
