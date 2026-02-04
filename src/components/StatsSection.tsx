import { motion } from "framer-motion";
import { Users, ShieldCheck, FileWarning, TrendingUp } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "50K+",
    label: "Jobs Analyzed",
    description: "Trusted by thousands",
  },
  {
    icon: ShieldCheck,
    value: "95%",
    label: "Accuracy Rate",
    description: "ML-powered detection",
  },
  {
    icon: FileWarning,
    value: "12K+",
    label: "Scams Detected",
    description: "Users protected",
  },
  {
    icon: TrendingUp,
    value: "24/7",
    label: "Active Protection",
    description: "Always available",
  },
];

const StatsSection = () => {
  return (
    <section className="py-16 bg-primary">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
                <stat.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-primary-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-primary-foreground/90 font-medium mb-1">
                {stat.label}
              </div>
              <div className="text-primary-foreground/60 text-sm">
                {stat.description}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
