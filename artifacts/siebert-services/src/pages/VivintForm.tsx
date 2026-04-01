import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui";
import { ArrowRight, CheckCircle, AlertCircle, Loader, Home, Building2, Camera, Lock, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type FormType = "residential" | "commercial" | null;
type Step = "type" | "contact" | "details" | "success";

const RESIDENTIAL_INTERESTS = ["Cameras", "Smart Lock", "Thermostat", "Lighting", "Monitoring"];
const COMMERCIAL_INTERESTS = ["Security Cameras", "Access Control", "Alarm Monitoring", "Energy Management", "Reporting Dashboard"];

export default function VivintForm() {
  const { toast } = useToast();
  const [formType, setFormType] = useState<FormType>(null);
  const [step, setStep] = useState<Step>("type");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    zipCode: "",
    propertyType: "",
    currentSystem: "",
    interestedIn: [] as string[],
    budget: "",
    timeframe: "",
    notes: "",
  });

  function handleInterestToggle(item: string) {
    setFormData(prev => ({
      ...prev,
      interestedIn: prev.interestedIn.includes(item)
        ? prev.interestedIn.filter(i => i !== item)
        : [...prev.interestedIn, item]
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formType || !formData.name || !formData.email || !formData.phone) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/vivint/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: formType,
          ...formData,
        }),
      });

      if (res.ok) {
        setStep("success");
        toast({ title: "Inquiry submitted! We'll be in touch soon." });
        setTimeout(() => window.history.back(), 3000);
      } else {
        const data = await res.json();
        toast({ title: data.message || "Failed to submit inquiry", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error submitting inquiry", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Step 1: Type Selection */}
        {step === "type" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-navy mb-2">Vivint Smart Home</h1>
              <p className="text-lg text-navy-light">What type of property are you inquiring about?</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {[
                {
                  type: "residential" as const,
                  title: "Residential",
                  icon: Home,
                  description: "Homeowners seeking security & automation",
                  color: "from-blue-600 to-blue-700",
                },
                {
                  type: "commercial" as const,
                  title: "Commercial",
                  icon: Building2,
                  description: "Businesses & offices",
                  color: "from-purple-600 to-purple-700",
                },
              ].map(({ type, title, icon: Icon, description, color }) => (
                <motion.button
                  key={type}
                  onClick={() => { setFormType(type); setStep("contact"); }}
                  whileHover={{ y: -4 }}
                  className={`relative p-8 rounded-xl border-2 border-white shadow-lg overflow-hidden group transition-all bg-gradient-to-br ${color}`}
                >
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                  <div className="relative z-10">
                    <Icon className="w-12 h-12 text-white mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
                    <p className="text-white/90">{description}</p>
                    <div className="mt-4 flex items-center gap-2 text-white group-hover:translate-x-2 transition-transform">
                      <span className="text-sm font-semibold">Get Started</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Contact Info */}
        {step === "contact" && (
          <motion.form
            onSubmit={(e) => { e.preventDefault(); setStep("details"); }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-8 space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-navy mb-1">Contact Information</h2>
              <p className="text-navy-light">Let's get your basic information</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-navy mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">Zip Code</label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  placeholder="12345"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep("type")}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-navy font-semibold hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.form>
        )}

        {/* Step 3: Details */}
        {step === "details" && (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-8 space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-navy mb-1">Tell Us More</h2>
              <p className="text-navy-light">Help us tailor the perfect solution for you</p>
            </div>

            <div className="space-y-4">
              {formType === "residential" ? (
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">Property Type</label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  >
                    <option value="">Select property type</option>
                    <option value="single-family">Single Family Home</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="condo">Condo</option>
                    <option value="apartment">Apartment</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">Property Type</label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  >
                    <option value="">Select property type</option>
                    <option value="office">Office</option>
                    <option value="retail">Retail</option>
                    <option value="warehouse">Warehouse</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">Current Security System</label>
                <input
                  type="text"
                  value={formData.currentSystem}
                  onChange={(e) => setFormData({ ...formData, currentSystem: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  placeholder="e.g., ADT, none, other..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-3">What are you interested in?</label>
                <div className="grid grid-cols-2 gap-3">
                  {(formType === "residential" ? RESIDENTIAL_INTERESTS : COMMERCIAL_INTERESTS).map(item => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleInterestToggle(item)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                        formData.interestedIn.includes(item)
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-300 bg-white text-navy hover:border-blue-600"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">Budget Range</label>
                <select
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                >
                  <option value="">Select budget range</option>
                  <option value="under-1000">Under $1,000</option>
                  <option value="1000-5000">$1,000 - $5,000</option>
                  <option value="5000-10000">$5,000 - $10,000</option>
                  <option value="10000-plus">$10,000+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">Timeframe</label>
                <select
                  value={formData.timeframe}
                  onChange={(e) => setFormData({ ...formData, timeframe: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                >
                  <option value="">Select timeframe</option>
                  <option value="immediately">Immediately</option>
                  <option value="1-month">Within 1 Month</option>
                  <option value="3-months">Within 3 Months</option>
                  <option value="6-months">Within 6 Months</option>
                  <option value="undecided">Still Exploring</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-2">Additional Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none resize-none"
                  placeholder="Tell us anything else that would help us serve you better..."
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep("contact")}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-navy font-semibold hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {loading ? "Submitting..." : "Submit Inquiry"}
              </button>
            </div>
          </motion.form>
        )}

        {/* Step 4: Success */}
        {step === "success" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-12 text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-navy">Thank You!</h2>
            <p className="text-navy-light max-w-sm mx-auto">
              Your inquiry has been received. Our Vivint specialists will contact you shortly to discuss your options.
            </p>
            <p className="text-sm text-gray-500">Redirecting you in a moment...</p>
          </motion.div>
        )}

      </div>
    </div>
  );
}
