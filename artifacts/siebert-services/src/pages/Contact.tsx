import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { Card, CardContent, Input, Textarea, Button, Label } from "@/components/ui";
import { useSubmitContact } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();
  const contactMutation = useSubmitContact();

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", company: "", service: "General Inquiry", message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await contactMutation.mutateAsync({ data: formData });
      toast({ title: "Message sent!", description: "We will get back to you shortly." });
      setFormData({ name: "", email: "", phone: "", company: "", service: "General Inquiry", message: "" });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to send message. Please try again." });
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-navy mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground">Have a question or need emergency IT support? Reach out to our team today.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Info Panels */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <Card className="border-none shadow-lg">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-navy text-lg">Call Us</h3>
                  <p className="text-muted-foreground mt-1">866-484-9180</p>
                  <p className="text-sm text-primary font-semibold mt-1">24/7 Support Available</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-lg">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-navy text-lg">Email Us</h3>
                  <p className="text-muted-foreground mt-1">support@siebertservices.com</p>
                  <p className="text-muted-foreground">sales@siebertservices.com</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-navy text-lg">Headquarters</h3>
                  <p className="text-muted-foreground mt-1">123 Tech Boulevard<br/>Suite 400<br/>Innovation City, ST 12345</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="border-none shadow-xl">
              <CardContent className="p-8 md:p-10">
                <h2 className="text-2xl font-bold text-navy mb-8 font-display">Send a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input id="name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input id="email" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input id="company" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service">Topic / Service</Label>
                    <div className="relative">
                      <select 
                        id="service"
                        className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary appearance-none"
                        value={formData.service}
                        onChange={e => setFormData({...formData, service: e.target.value})}
                      >
                        <option>General Inquiry</option>
                        <option>IT Support & Helpdesk</option>
                        <option>Zoom Partner Services</option>
                        <option>Cloud Migration</option>
                        <option>Cybersecurity</option>
                        <option>Hardware/Software Licensing</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea id="message" required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="min-h-[150px]" />
                  </div>

                  <Button type="submit" size="lg" className="w-full gap-2" disabled={contactMutation.isPending}>
                    {contactMutation.isPending ? "Sending..." : <>Send Message <Send className="w-4 h-4" /></>}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
