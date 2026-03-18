import { useState } from "react";
import { Link } from "wouter";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/use-auth";

export default function Register() {
  const { register, isRegistering } = useAuth();
  const [formData, setFormData] = useState({
    companyName: "", contactName: "", email: "", password: "", phone: "", website: "", businessType: "MSP"
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await register(formData);
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <PublicLayout>
      <div className="flex-1 py-16 px-4 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-2xl mx-auto bg-card border border-border shadow-xl rounded-3xl p-8 sm:p-12">
          <h2 className="text-3xl font-display font-bold text-foreground mb-2">Apply for Partnership</h2>
          <p className="text-muted-foreground mb-8 pb-8 border-b border-border">Join our network to access reseller pricing, deal protection, and dedicated support.</p>
          
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-xl mb-8 border border-destructive/20 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground ml-1">Company Name *</label>
                <Input name="companyName" value={formData.companyName} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground ml-1">Website</label>
                <Input name="website" value={formData.website} onChange={handleChange} placeholder="https://" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground ml-1">Primary Contact Name *</label>
                <Input name="contactName" value={formData.contactName} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground ml-1">Phone Number</label>
                <Input name="phone" type="tel" value={formData.phone} onChange={handleChange} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground ml-1">Work Email *</label>
                <Input name="email" type="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground ml-1">Password *</label>
                <Input name="password" type="password" value={formData.password} onChange={handleChange} required minLength={8} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground ml-1">Business Type</label>
              <select 
                name="businessType" 
                value={formData.businessType} 
                onChange={handleChange}
                className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
              >
                <option value="MSP">Managed Service Provider (MSP)</option>
                <option value="VAR">Value Added Reseller (VAR)</option>
                <option value="Consultant">IT Consultant</option>
                <option value="Agent">Telecom Agent</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="pt-6">
              <Button type="submit" className="w-full h-12 text-base rounded-xl" disabled={isRegistering}>
                {isRegistering ? "Submitting Application..." : "Submit Application"}
              </Button>
            </div>
            
            <p className="text-center text-sm text-muted-foreground mt-4">
              Already have an account? <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </PublicLayout>
  );
}
