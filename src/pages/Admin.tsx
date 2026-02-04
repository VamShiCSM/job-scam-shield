import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Shield, ShieldCheck, ShieldAlert, AlertTriangle, ArrowLeft,
  Check, X, Eye, Clock, User, FileText, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ScamReport {
  id: string;
  user_id: string;
  job_text: string;
  description: string;
  proof_urls: string[] | null;
  status: "pending" | "verified" | "rejected";
  admin_notes: string | null;
  created_at: string;
  profiles?: {
    email: string;
    full_name: string;
  };
}

interface Stats {
  total: number;
  pending: number;
  verified: number;
  rejected: number;
}

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [reports, setReports] = useState<ScamReport[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, verified: 0, rejected: 0 });
  const [loadingData, setLoadingData] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ScamReport | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processingAction, setProcessingAction] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "verified" | "rejected">("pending");

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/dashboard");
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchReports();
    }
  }, [isAdmin, filter]);

  const fetchReports = async () => {
    setLoadingData(true);
    try {
      let query = supabase
        .from("scam_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data: reportsData, error } = await query;
      if (error) throw error;

      // Fetch profiles for each report
      const reportsWithProfiles: ScamReport[] = [];
      for (const report of reportsData || []) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("user_id", report.user_id)
          .maybeSingle();
        
        reportsWithProfiles.push({
          ...report,
          profiles: profileData || undefined,
        } as ScamReport);
      }

      setReports(reportsWithProfiles);

      // Fetch stats
      const { data: allReports } = await supabase
        .from("scam_reports")
        .select("status");
      
      if (allReports) {
        setStats({
          total: allReports.length,
          pending: allReports.filter(r => r.status === "pending").length,
          verified: allReports.filter(r => r.status === "verified").length,
          rejected: allReports.filter(r => r.status === "rejected").length,
        });
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast({
        title: "Error",
        description: "Failed to fetch reports",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleStatusUpdate = async (status: "verified" | "rejected") => {
    if (!selectedReport) return;
    
    setProcessingAction(true);
    try {
      const { error } = await supabase
        .from("scam_reports")
        .update({
          status,
          admin_notes: adminNotes || null,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", selectedReport.id);

      if (error) throw error;

      toast({
        title: "Report Updated",
        description: `Report has been marked as ${status}.`,
      });

      setSelectedReport(null);
      setAdminNotes("");
      fetchReports();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update report",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-success/10 text-success border-success/30">Verified</Badge>;
      case "rejected":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/30">Rejected</Badge>;
      default:
        return <Badge className="bg-warning/10 text-warning border-warning/30">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl hero-gradient flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl text-foreground">
                  Admin Panel
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-foreground">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Reports</div>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-warning">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-success">{stats.verified}</div>
              <div className="text-sm text-muted-foreground">Verified</div>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-destructive">{stats.rejected}</div>
              <div className="text-sm text-muted-foreground">Rejected</div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {(["pending", "all", "verified", "rejected"] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
                className="capitalize"
              >
                {f} {f === "pending" && stats.pending > 0 && `(${stats.pending})`}
              </Button>
            ))}
          </div>

          {/* Reports List */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Scam Reports
            </h2>

            {loadingData ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading reports...
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No reports found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          {getStatusBadge(report.status)}
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="w-3 h-3" />
                            {report.profiles?.email || "Unknown"}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {new Date(report.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <p className="text-sm font-medium text-foreground mb-1">
                          {report.description}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {report.job_text.substring(0, 200)}...
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedReport(report);
                          setAdminNotes(report.admin_notes || "");
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </main>

      {/* Review Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Scam Report</DialogTitle>
            <DialogDescription>
              Review the report details and decide whether to verify or reject it.
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-foreground mb-2">Reported By</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedReport.profiles?.full_name || "Unknown"} ({selectedReport.profiles?.email || "No email"})
                </p>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-2">Description</h4>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                  {selectedReport.description}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-2">Job Text</h4>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg max-h-48 overflow-y-auto">
                  {selectedReport.job_text}
                </p>
              </div>

              {selectedReport.proof_urls && selectedReport.proof_urls.length > 0 && (
                <div>
                  <h4 className="font-medium text-foreground mb-2">Proof URLs</h4>
                  <div className="space-y-1">
                    {selectedReport.proof_urls.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline block"
                      >
                        {url}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium text-foreground mb-2">Admin Notes</h4>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about your decision..."
                  className="min-h-[100px]"
                />
              </div>

              {selectedReport.status === "pending" && (
                <div className="flex gap-3">
                  <Button
                    className="flex-1"
                    onClick={() => handleStatusUpdate("verified")}
                    disabled={processingAction}
                  >
                    {processingAction ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    Verify as Scam
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleStatusUpdate("rejected")}
                    disabled={processingAction}
                  >
                    {processingAction ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <X className="w-4 h-4 mr-2" />
                    )}
                    Reject Report
                  </Button>
                </div>
              )}

              {selectedReport.status !== "pending" && (
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    This report has already been reviewed and marked as{" "}
                    <span className="font-medium">{selectedReport.status}</span>.
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
