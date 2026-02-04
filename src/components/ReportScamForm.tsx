import { useState } from "react";
import { motion } from "framer-motion";
import { FileWarning, Send, Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ReportScamFormProps {
  userId?: string;
  onReportSubmitted?: () => void;
}

const ReportScamForm = ({ userId, onReportSubmitted }: ReportScamFormProps) => {
  const [jobText, setJobText] = useState("");
  const [description, setDescription] = useState("");
  const [proofUrls, setProofUrls] = useState<string[]>([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const addProofUrl = () => {
    if (proofUrls.length < 5) {
      setProofUrls([...proofUrls, ""]);
    }
  };

  const removeProofUrl = (index: number) => {
    setProofUrls(proofUrls.filter((_, i) => i !== index));
  };

  const updateProofUrl = (index: number, value: string) => {
    const updated = [...proofUrls];
    updated[index] = value;
    setProofUrls(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a scam report.",
        variant: "destructive",
      });
      return;
    }

    if (!jobText.trim() || !description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both the job text and a description.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const validUrls = proofUrls.filter((url) => url.trim() !== "");

      const { error } = await supabase.from("scam_reports").insert({
        user_id: userId,
        job_text: jobText.trim(),
        description: description.trim(),
        proof_urls: validUrls.length > 0 ? validUrls : null,
      });

      if (error) throw error;

      toast({
        title: "Report Submitted",
        description: "Thank you for helping protect other job seekers!",
      });

      // Reset form
      setJobText("");
      setDescription("");
      setProofUrls([""]);
      onReportSubmitted?.();
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
          <FileWarning className="w-6 h-6 text-destructive" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Report a Scam</h2>
          <p className="text-sm text-muted-foreground">
            Help protect others by reporting fraudulent job offers
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="jobText" className="text-foreground">
            Job Text / Email Content <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="jobText"
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            placeholder="Paste the suspicious job offer, email, or message here..."
            className="mt-1.5 min-h-[120px]"
            required
          />
        </div>

        <div>
          <Label htmlFor="description" className="text-foreground">
            Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe why you believe this is a scam and any relevant details..."
            className="mt-1.5 min-h-[80px]"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label className="text-foreground">Proof URLs (optional)</Label>
            {proofUrls.length < 5 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addProofUrl}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add URL
              </Button>
            )}
          </div>
          <div className="space-y-2">
            {proofUrls.map((url, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => updateProofUrl(index, e.target.value)}
                  placeholder="https://screenshot-proof.com/image.png"
                />
                {proofUrls.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeProofUrl(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Add links to screenshots or evidence (e.g., image hosting URLs)
          </p>
        </div>

        <Button type="submit" className="w-full h-12" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Submit Report
            </>
          )}
        </Button>
      </form>
    </motion.div>
  );
};

export default ReportScamForm;
