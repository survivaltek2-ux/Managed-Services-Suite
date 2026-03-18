import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, ArrowRight } from "lucide-react";
import { Card, CardContent, Input, Textarea, Button, Label } from "@/components/ui";
import { useSubmitQuote, QuoteRequestInputCompanySize } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export default function Quote() {
  const { toast } = useToast();
  const quoteMutation = useSubmitQuote();
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    companySize: "1-10" as QuoteRequestInputCompanySize,
    budget: "",
    timeline: "",
    details: "",
    services: [] as string[]
  });

  const availableServices = [
    "Managed IT / Helpdesk",
    "Zoom Deployment (Meetings, Phone, Rooms)",
    "Cloud Migration (O365, AWS, Azure)",
    "Cybersecurity & Compliance",
    "Networking & Infrastructure",
    "Backup & Disaster Recovery",
    "Hardware/Software Procurement"
  ];

  const toggleService = (srv: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(srv) 
        ? prev.services.filter(s => s !== srv)
        : [...prev.services, srv]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.services.length === 0) {
      toast({ variant: "destructive", title: "Validation Error", description: "Please select at least one service." });
      return;
    }
    
    try {
      await quoteMutation.mutateAsync({ data: formData });
      setIsSuccess(true);
      window.scrollTo(0, 0);
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to submit quote request." });
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calculator className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-navy mb-4">Quote Request Received!</h1>
          <p className="text-muted-foreground mb-8">
            Thank you for considering Siebert Services. One of our specialists will review your requirements and get back to you within 1 business day.
          </p>
          <Button onClick={() => window.location.href = "/"}>Return to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      <div className="bg-navy py-16 px-4 sm:px-6 lg:px-8 text-center border-b-4 border-primary">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">Request a Custom Quote</h1>
        <p className="text-lg text-white/80 max-w-2xl mx-auto">
          Tell us about your organization and technology needs, and we'll craft a customized solution proposal.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-[-40px] relative z-10">
        <Card className="border-none shadow-2xl">
          <CardContent className="p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-10">
              
              {/* Section 1 */}
              <div>
                <h3 className="text-xl font-bold text-navy border-b pb-2 mb-6">1. Your Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address *</Label>
                    <Input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Company Name *</Label>
                    <Input required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Company Size</Label>
                    <select 
                      className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary appearance-none"
                      value={formData.companySize}
                      onChange={e => setFormData({...formData, companySize: e.target.value as QuoteRequestInputCompanySize})}
                    >
                      {Object.values(QuoteRequestInputCompanySize).map(s => <option key={s} value={s}>{s} employees</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2 */}
              <div>
                <h3 className="text-xl font-bold text-navy border-b pb-2 mb-6">2. Services Required</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availableServices.map(srv => (
                    <label key={srv} className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${formData.services.includes(srv) ? 'border-primary bg-primary/5 shadow-sm' : 'border-input hover:bg-gray-50'}`}>
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 text-primary rounded focus:ring-primary"
                        checked={formData.services.includes(srv)}
                        onChange={() => toggleService(srv)}
                      />
                      <span className="font-medium text-navy text-sm">{srv}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Section 3 */}
              <div>
                <h3 className="text-xl font-bold text-navy border-b pb-2 mb-6">3. Project Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <Label>Estimated Budget</Label>
                    <select 
                      className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary appearance-none"
                      value={formData.budget}
                      onChange={e => setFormData({...formData, budget: e.target.value})}
                    >
                      <option value="">Select a range</option>
                      <option value="Under $1,000 / mo">Under $1,000 / mo</option>
                      <option value="$1,000 - $5,000 / mo">$1,000 - $5,000 / mo</option>
                      <option value="$5,000 - $10,000 / mo">$5,000 - $10,000 / mo</option>
                      <option value="$10,000+ / mo">$10,000+ / mo</option>
                      <option value="One-time project">One-time project</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Timeline</Label>
                    <select 
                      className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary appearance-none"
                      value={formData.timeline}
                      onChange={e => setFormData({...formData, timeline: e.target.value})}
                    >
                      <option value="">Select a timeline</option>
                      <option value="ASAP (Urgent)">ASAP (Urgent)</option>
                      <option value="Within 30 days">Within 30 days</option>
                      <option value="1-3 months">1-3 months</option>
                      <option value="Just researching">Just researching</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Additional Details or Specific Requirements</Label>
                  <Textarea 
                    value={formData.details} 
                    onChange={e => setFormData({...formData, details: e.target.value})} 
                    className="min-h-[120px]"
                    placeholder="Tell us more about your current setup, pain points, or goals..."
                  />
                </div>
              </div>

              <div className="pt-6 border-t">
                <Button type="submit" size="lg" className="w-full text-lg h-14 shadow-lg shadow-primary/20" disabled={quoteMutation.isPending}>
                  {quoteMutation.isPending ? "Submitting..." : <>Submit Quote Request <ArrowRight className="w-5 h-5 ml-2" /></>}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
