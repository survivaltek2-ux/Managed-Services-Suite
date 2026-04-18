import { motion } from "framer-motion";
import { LeadMagnetCTA, ALL_MAGNETS } from "@/components/leadMagnets";

export default function ResourcesIndex() {
  return (
    <div className="min-h-screen pt-28 pb-20 bg-gradient-to-b from-gray-50 via-white to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest text-primary font-bold mb-3">Free resources</p>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-navy mb-4">
            Tools, checklists, and guides for IT leaders
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to assess your security posture, calculate downtime risk, and choose the right managed-services partner. No fluff, no spam.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {ALL_MAGNETS.map(m => (
            <LeadMagnetCTA key={m.slug} magnet={m} />
          ))}
        </div>
      </div>
    </div>
  );
}
