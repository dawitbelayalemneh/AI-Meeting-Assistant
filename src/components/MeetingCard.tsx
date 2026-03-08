import { format } from "date-fns";
import { Calendar, Clock, Trash2, Edit, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Meeting {
  id: string;
  title: string;
  description: string | null;
  date: string;
  duration_minutes: number | null;
  notes: string | null;
  ai_summary: string | null;
  ai_action_items: any;
  status: string;
}

interface MeetingCardProps {
  meeting: Meeting;
  onEdit: (meeting: Meeting) => void;
  onDelete: (id: string) => void;
  onAiProcess: (id: string) => void;
}

const statusColors: Record<string, string> = {
  scheduled: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-success/10 text-success border-success/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

export function MeetingCard({ meeting, onEdit, onDelete, onAiProcess }: MeetingCardProps) {
  return (
    <div className="glass-card p-5 animate-slide-up hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-heading font-semibold text-foreground text-lg">{meeting.title}</h3>
          {meeting.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{meeting.description}</p>
          )}
        </div>
        <Badge variant="outline" className={statusColors[meeting.status] || ""}>
          {meeting.status}
        </Badge>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {format(new Date(meeting.date), "MMM d, yyyy")}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {meeting.duration_minutes || 30} min
        </span>
      </div>

      {meeting.ai_summary && (
        <div className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
          <p className="text-xs font-medium text-primary mb-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> AI Summary
          </p>
          <p className="text-sm text-foreground">{meeting.ai_summary}</p>
        </div>
      )}

      {meeting.ai_action_items && Array.isArray(meeting.ai_action_items) && meeting.ai_action_items.length > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-accent/5 border border-accent/10">
          <p className="text-xs font-medium text-accent mb-2 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Action Items
          </p>
          <ul className="space-y-1">
            {(meeting.ai_action_items as string[]).map((item, i) => (
              <li key={i} className="text-sm text-foreground flex items-start gap-2">
                <span className="text-accent mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center gap-2 pt-2 border-t border-border">
        <Button variant="ghost" size="sm" onClick={() => onEdit(meeting)}>
          <Edit className="w-4 h-4 mr-1" /> Edit
        </Button>
        {meeting.notes && !meeting.ai_summary && (
          <Button variant="ghost" size="sm" onClick={() => onAiProcess(meeting.id)} className="text-primary">
            <Sparkles className="w-4 h-4 mr-1" /> Analyze
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={() => onDelete(meeting.id)} className="text-destructive ml-auto">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
