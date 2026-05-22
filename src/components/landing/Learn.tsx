import { motion } from "framer-motion";
import { Clock, BookOpen, Award } from "lucide-react";

const tips = [
  { icon: Clock, title: "15 minutes a day", desc: "Build a daily ritual. We'll surface only what changed and what matters." },
  { icon: BookOpen, title: "Bite-sized lessons", desc: "From P/E ratios to options — each concept in under 3 minutes." },
  { icon: Award, title: "Earn confidence badges", desc: "Track your growth as an investor. Every milestone celebrated." },
];

export function Learn() {
  return (
    <section id="learn" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial opacity-30 -z-10" />
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tighter">
            You're not just an investor. <span className="text-gradient">You're learning.</span>
          </h2>
          <p className="mt-5 text-muted-foreground">Every screen designed to make you feel capable, calm, and in control of your money.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {tips.map((t, i) => (
            <motion.div
              key={t.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="glass rounded-3xl p-8 text-center hover:bg-card/60 transition"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-primary mx-auto flex items-center justify-center shadow-glow mb-5">
                <t.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-display font-bold text-xl mb-2">{t.title}</h3>
              <p className="text-sm text-muted-foreground">{t.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
