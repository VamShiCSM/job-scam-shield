import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Shield, Search, History, FileWarning, LogOut, User, 
  ShieldCheck, ShieldAlert, AlertTriangle, Clock, ChevronRight,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import JobChecker from "@/components/JobChecker";
import ReportScamForm from "@/components/ReportScamForm";

interface PredictionHistory {
  id: string;
  job_text: string;
  result: "safe" | "suspicious" | "scam";
  confidence: number;
  red_flags: string[];
  tips: string[];
  created_at: string;
}

interface ScamReport {
  id: string;
  job_text: string;
  description: string;
  status: "pending" | "verified" | "rejected";
  created_at: string;
}

const Dashboard = () => {
  const { user, signOut, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [predictions, setPredictions] = useState<PredictionHistory[]>([]);
  const [reports, setReports] = useState<ScamReport[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    setLoadingData(true);
    try {
      // Fetch prediction history
      const { data: predictionData, error: predictionError } = await supabase
        .from("prediction_history")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (predictionError) throw predictionError;
      setPredictions(predictionData || []);

      // Fetch scam reports
      const { data: reportData, error: reportError } = await supabase
        .from("scam_reports")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (reportError) throw reportError;
      setReports(reportData || []);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
    navigate("/");
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case "safe":
        return <ShieldCheck className="w-5 h-5 text-success" />;
      case "scam":
        return <ShieldAlert className="w-5 h-5 text-destructive" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-warning" />;
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case "safe":
        return "bg-success/10 text-success border-success/30";
      case "scam":
        return "bg-destructive/10 text-destructive border-destructive/30";
      default:
        return "bg-warning/10 text-warning border-warning/30";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-success/10 text-success border-success/30";
      case "rejected":
        return "bg-destructive/10 text-destructive border-destructive/30";
      default:
        return "bg-warning/10 text-warning border-warning/30";
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
            <a href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl hero-gradient flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">
                Job<span className="text-primary">Guard</span>
              </span>
            </a>

            <div className="flex items-center gap-4">
              {isAdmin && (
                <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
                  Admin Panel
                </Button>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{user?.email}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Check job offers, view your history, and report scams.
            </p>
          </div>

          <Tabs defaultValue="check" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="check" className="gap-2">
                <Search className="w-4 h-4" />
                Check Job
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <History className="w-4 h-4" />
                History
              </TabsTrigger>
              <TabsTrigger value="reports" className="gap-2">
                <FileWarning className="w-4 h-4" />
                Reports
              </TabsTrigger>
            </TabsList>

            {/* Check Job Tab */}
            <TabsContent value="check">
              <JobChecker userId={user?.id} onAnalysisComplete={fetchUserData} />
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history">
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Prediction History
                </h2>

                {loadingData ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading history...
                  </div>
                ) : predictions.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No predictions yet</p>
                    <p className="text-sm text-muted-foreground">
                      Start by checking a job offer in the Check Job tab
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {predictions.map((prediction) => (
                      <div
                        key={prediction.id}
                        className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {getResultIcon(prediction.result)}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getResultColor(prediction.result)}`}>
                                {prediction.result.toUpperCase()}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {prediction.confidence}% confidence
                              </span>
                            </div>
                            <p className="text-sm text-foreground line-clamp-2 mb-2">
                              {prediction.job_text.substring(0, 150)}...
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {new Date(prediction.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Report Form */}
                <ReportScamForm userId={user?.id} onReportSubmitted={fetchUserData} />

                {/* My Reports */}
                <div className="glass-card rounded-2xl p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    My Reports
                  </h2>

                  {loadingData ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading reports...
                    </div>
                  ) : reports.length === 0 ? (
                    <div className="text-center py-8">
                      <FileWarning className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No reports yet</p>
                      <p className="text-sm text-muted-foreground">
                        Help protect others by reporting scams
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reports.map((report) => (
                        <div
                          key={report.id}
                          className="p-4 rounded-xl border border-border bg-background"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                              {report.status.toUpperCase()}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(report.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-foreground line-clamp-2 mb-2">
                            {report.description}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {report.job_text.substring(0, 100)}...
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
