import { motion } from "framer-motion";
import { ClipboardPaste, Cpu, ShieldCheck, Bell } from "lucide-react";

const steps = [
  {
    icon: ClipboardPaste,
    title: "Paste Job Details",
    description: "Copy and paste the job offer, email, or message you received into our analyzer.",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: Cpu,
    title: "AI Analysis",
    description: "Our ML model scans for 100+ scam patterns and indicators in seconds.",
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    icon: ShieldCheck,
    title: "Get Results",
    description: "Receive instant feedback with confidence scores and detailed safety tips.",
    color: "bg-success/10 text-success",
  },
  {
    icon: Bell,
    title: "Report & Learn",
    description: "Report confirmed scams to help others and access our awareness resources.",
    color: "bg-orange-500/10 text-orange-600",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Protect yourself in four simple steps. No technical knowledge required.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-border" />
              )}

              <div className="glass-card rounded-2xl p-6 text-center card-hover">
                <div className="relative inline-block mb-4">
                  <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center`}>
                    <step.icon className="w-8 h-8" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
