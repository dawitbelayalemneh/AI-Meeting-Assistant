import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { Sparkles, Lightbulb, Gavel, CheckCircle2, Calendar, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Summaries = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ["meetings-with-summaries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .not("ai_summary", "is", null)
        .order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = meetings.filter(
    (m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      (m.ai_summary && m.ai_summary.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-heading font-bold text-foreground">Meeting Summaries</h1>
          </div>
          <Badge variant="secondary" className="ml-auto">{filtered.length} summaries</Badge>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search summaries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground">Loading summaries...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 glass-card">
            <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading font-semibold text-foreground mb-2">
              {search ? "No matching summaries" : "No summaries yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {search ? "Try a different search term" : "Complete meetings with notes to generate AI summaries"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filtered.map((meeting) => {
              const keyPoints = Array.isArray(meeting.ai_key_points) ? meeting.ai_key_points : [];
              const decisions = Array.isArray(meeting.ai_decisions) ? meeting.ai_decisions : [];
              const actionItems = Array.isArray(meeting.ai_action_items) ? meeting.ai_action_items : [];

              return (
                <div key={meeting.id} className="glass-card-elevated p-6 animate-slide-up">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="font-heading font-semibold text-foreground text-xl">{meeting.title}</h2>
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(meeting.date), "MMMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                      {meeting.status}
                    </Badge>
                  </div>

                  {/* Summary */}
                  {meeting.ai_summary && (
                    <div className="mb-5 p-4 rounded-lg bg-primary/5 border border-primary/10">
                      <p className="text-xs font-semibold text-primary mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                        <Sparkles className="w-3.5 h-3.5" /> Executive Summary
                      </p>
                      <p className="text-foreground leading-relaxed">{meeting.ai_summary}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Key Points */}
                    {keyPoints.length > 0 && (
                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                        <p className="text-xs font-semibold text-primary mb-3 flex items-center gap-1.5 uppercase tracking-wide">
                          <Lightbulb className="w-3.5 h-3.5" /> Key Points
                        </p>
                        <ul className="space-y-2">
                          {(keyPoints as string[]).map((item, i) => (
                            <li key={i} className="text-sm text-foreground flex items-start gap-2">
                              <span className="text-primary mt-0.5 shrink-0">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Decisions */}
                    {decisions.length > 0 && (
                      <div className="p-4 rounded-lg bg-warning/5 border border-warning/10">
                        <p className="text-xs font-semibold text-warning mb-3 flex items-center gap-1.5 uppercase tracking-wide">
                          <Gavel className="w-3.5 h-3.5" /> Decisions
                        </p>
                        <ul className="space-y-2">
                          {(decisions as string[]).map((item, i) => (
                            <li key={i} className="text-sm text-foreground flex items-start gap-2">
                              <span className="text-warning mt-0.5 shrink-0">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Action Items */}
                    {actionItems.length > 0 && (
                      <div className="p-4 rounded-lg bg-accent/5 border border-accent/10">
                        <p className="text-xs font-semibold text-accent mb-3 flex items-center gap-1.5 uppercase tracking-wide">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Action Items
                        </p>
                        <ul className="space-y-2">
                          {(actionItems as string[]).map((item, i) => (
                            <li key={i} className="text-sm text-foreground flex items-start gap-2">
                              <span className="text-accent mt-0.5 shrink-0">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Summaries;
