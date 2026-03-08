import { format } from "date-fns";
import { CheckCircle2, Calendar, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Meeting {
  id: string;
  title: string;
  date: string;
  status: string;
  ai_action_items: any;
  ai_summary: string | null;
}

interface ActionItemsPanelProps {
  meetings: Meeting[];
}

export function ActionItemsPanel({ meetings }: ActionItemsPanelProps) {
  const meetingsWithActions = meetings.filter(
    (m) => Array.isArray(m.ai_action_items) && m.ai_action_items.length > 0
  );

  if (meetingsWithActions.length === 0) {
    return (
      <div className="glass-card p-5">
        <h3 className="font-heading font-semibold text-foreground text-sm mb-4 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-accent" /> All Action Items
        </h3>
        <div className="py-8 text-center text-muted-foreground text-sm">
          No action items yet. Complete meetings with notes to generate them.
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-5">
      <h3 className="font-heading font-semibold text-foreground text-sm mb-4 flex items-center gap-1.5">
        <CheckCircle2 className="w-4 h-4 text-accent" /> All Action Items
      </h3>
      <ScrollArea className="max-h-72">
        <div className="space-y-4">
          {meetingsWithActions.map((meeting) => (
            <div key={meeting.id}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(meeting.date), "MMM d")}
                </span>
                <span className="text-xs font-semibold text-foreground truncate">{meeting.title}</span>
                <Badge variant="outline" className="text-[10px] h-4 ml-auto shrink-0 bg-success/10 text-success border-success/20">
                  {meeting.status}
                </Badge>
              </div>
              <ul className="space-y-1 pl-4">
                {(meeting.ai_action_items as string[]).map((item, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2">
                    <span className="text-accent mt-0.5 shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

interface CompletedSummariesPanelProps {
  meetings: Meeting[];
}

export function CompletedSummariesPanel({ meetings }: CompletedSummariesPanelProps) {
  const completed = meetings.filter((m) => m.status === "completed" && m.ai_summary);

  if (completed.length === 0) {
    return (
      <div className="glass-card p-5">
        <h3 className="font-heading font-semibold text-foreground text-sm mb-4 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-primary" /> Completed with Summaries
        </h3>
        <div className="py-8 text-center text-muted-foreground text-sm">
          No completed meetings with summaries yet.
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-5">
      <h3 className="font-heading font-semibold text-foreground text-sm mb-4 flex items-center gap-1.5">
        <Sparkles className="w-4 h-4 text-primary" /> Completed with Summaries
      </h3>
      <ScrollArea className="max-h-72">
        <div className="space-y-3">
          {completed.slice(0, 5).map((m) => (
            <div key={m.id} className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground truncate">{m.title}</span>
                <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                  {format(new Date(m.date), "MMM d")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{m.ai_summary}</p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
