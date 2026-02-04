import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShieldCheck, ShieldAlert, AlertTriangle, Loader2, X, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ResultType = "safe" | "scam" | "suspicious" | null;

interface AnalysisResult {
  type: ResultType;
  confidence: number;
  tips: string[];
  redFlags?: string[];
}

const JobChecker = () => {
  const [jobText, setJobText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // Simulated analysis - In production, this would call the ML backend
  const analyzeJob = async () => {
    if (!jobText.trim()) return;
    
    setIsAnalyzing(true);
    setResult(null);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock analysis logic (to be replaced with actual ML model)
    const lowerText = jobText.toLowerCase();
    const scamIndicators = [
      "advance fee", "upfront payment", "wire transfer", "money order",
      "guaranteed income", "no experience needed", "work from home immediately",
      "pay for training", "cryptocurrency", "send money", "western union",
      "too good to be true", "urgent hiring", "easy money"
    ];

    const suspiciousIndicators = [
      "immediate start", "high salary", "no interview", "personal info",
      "click this link", "urgent", "limited time"
    ];

    const scamCount = scamIndicators.filter(indicator => lowerText.includes(indicator)).length;
    const suspiciousCount = suspiciousIndicators.filter(indicator => lowerText.includes(indicator)).length;

    let analysisResult: AnalysisResult;

    if (scamCount >= 2) {
      analysisResult = {
        type: "scam",
        confidence: Math.min(85 + scamCount * 3, 98),
        tips: [
          "Never pay upfront fees for job applications",
          "Verify the company through official channels",
          "Report this job posting to authorities",
        ],
        redFlags: scamIndicators.filter(indicator => lowerText.includes(indicator)),
      };
    } else if (scamCount === 1 || suspiciousCount >= 2) {
      analysisResult = {
        type: "suspicious",
        confidence: 60 + suspiciousCount * 8,
        tips: [
          "Research the company thoroughly before applying",
          "Be cautious of unrealistic promises",
          "Verify contact information independently",
        ],
        redFlags: [...scamIndicators, ...suspiciousIndicators].filter(indicator => lowerText.includes(indicator)),
      };
    } else {
      analysisResult = {
        type: "safe",
        confidence: 75 + Math.random() * 15,
        tips: [
          "Always verify company details before sharing personal information",
          "Research the company on LinkedIn and Glassdoor",
          "Trust your instincts if something feels off",
        ],
      };
    }

    setResult(analysisResult);
    setIsAnalyzing(false);
  };

  const clearResult = () => {
    setResult(null);
    setJobText("");
  };

  const getResultStyles = (type: ResultType) => {
    switch (type) {
      case "safe":
        return {
          bg: "bg-success/10",
          border: "border-success/30",
          icon: ShieldCheck,
          iconColor: "text-success",
          title: "Likely Genuine",
          description: "This job posting appears to be legitimate.",
        };
      case "scam":
        return {
          bg: "bg-destructive/10",
          border: "border-destructive/30",
          icon: ShieldAlert,
          iconColor: "text-destructive",
          title: "Potential Scam Detected",
          description: "This job posting shows multiple red flags.",
        };
      case "suspicious":
        return {
          bg: "bg-warning/10",
          border: "border-warning/30",
          icon: AlertTriangle,
          iconColor: "text-warning",
          title: "Proceed with Caution",
          description: "This job posting has some concerning elements.",
        };
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="glass-card rounded-2xl p-6 md:p-8">
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            Paste Job Description or Email
          </label>
          <Textarea
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            placeholder="Paste the job offer, email, or message you want to analyze..."
            className="min-h-[160px] resize-none bg-background border-border focus:border-primary"
          />
        </div>

        <div className="flex gap-4">
          <Button
            onClick={analyzeJob}
            disabled={!jobText.trim() || isAnalyzing}
            className="flex-1 h-12 text-base gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Check Job
              </>
            )}
          </Button>
          {result && (
            <Button
              variant="outline"
              onClick={clearResult}
              className="h-12 px-4"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Result Display */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6"
            >
              {(() => {
                const styles = getResultStyles(result.type);
                if (!styles) return null;
                const Icon = styles.icon;

                return (
                  <div className={`${styles.bg} ${styles.border} border rounded-xl p-6`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl ${styles.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-6 h-6 ${styles.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-foreground">
                            {styles.title}
                          </h3>
                          <span className={`text-sm font-medium ${styles.iconColor}`}>
                            {result.confidence.toFixed(0)}% confidence
                          </span>
                        </div>
                        <p className="text-muted-foreground mb-4">
                          {styles.description}
                        </p>

                        {/* Red Flags */}
                        {result.redFlags && result.redFlags.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-foreground mb-2">
                              Red Flags Detected:
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {result.redFlags.map((flag, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 rounded-full bg-destructive/20 text-destructive text-xs font-medium"
                                >
                                  {flag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Safety Tips */}
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4" />
                            Safety Tips:
                          </h4>
                          <ul className="space-y-1">
                            {result.tips.map((tip, index) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default JobChecker;
