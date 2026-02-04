import { motion } from "framer-motion";
import { BookOpen, AlertCircle, Newspaper, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const articles = [
  {
    id: 1,
    category: "Guide",
    icon: BookOpen,
    title: "10 Warning Signs of Job Scams",
    description: "Learn to identify the most common red flags in fraudulent job offers.",
    readTime: "5 min read",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  {
    id: 2,
    category: "Alert",
    icon: AlertCircle,
    title: "Remote Work Scams on the Rise",
    description: "How scammers are exploiting the work-from-home trend to deceive job seekers.",
    readTime: "4 min read",
    color: "bg-destructive/10 text-destructive border-destructive/20",
  },
  {
    id: 3,
    category: "News",
    icon: Newspaper,
    title: "FBI Reports 2024 Job Fraud Statistics",
    description: "Latest data shows job scams cost victims over $200 million annually.",
    readTime: "3 min read",
    color: "bg-success/10 text-success border-success/20",
  },
];

const scamTypes = [
  { name: "Advance Fee Scams", percentage: 35 },
  { name: "Identity Theft", percentage: 28 },
  { name: "Fake Recruiters", percentage: 22 },
  { name: "Work Equipment Scams", percentage: 15 },
];

const AwarenessSection = () => {
  return (
    <section id="awareness" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Stay Informed
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Scam Awareness Center
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Knowledge is your best defense. Explore our resources to stay protected.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Articles */}
          <div className="lg:col-span-2 space-y-6">
            {articles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card rounded-xl p-6 card-hover cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${article.color} border flex items-center justify-center flex-shrink-0`}>
                    <article.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${article.color}`}>
                        {article.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {article.readTime}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {article.description}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                </div>
              </motion.div>
            ))}

            <Button variant="outline" className="w-full gap-2">
              View All Articles
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Scam Types Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-6">
              Common Scam Types
            </h3>
            <div className="space-y-5">
              {scamTypes.map((type, index) => (
                <div key={type.name}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-foreground font-medium">{type.name}</span>
                    <span className="text-muted-foreground">{type.percentage}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${type.percentage}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className="h-full hero-gradient rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 rounded-xl bg-warning/10 border border-warning/20">
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-warning" />
                Did You Know?
              </h4>
              <p className="text-sm text-muted-foreground">
                Job scams have increased by 118% in the past year. Always verify before applying.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AwarenessSection;
