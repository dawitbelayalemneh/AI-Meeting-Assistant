import { format, formatDistanceToNow, isBefore, addMinutes } from "date-fns";
import { Calendar, Clock, Trash2, Edit, Sparkles, CheckCircle2, Users, ListChecks, Bell, Lightbulb, Gavel, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { exportMeetingPdf } from "@/lib/exportPdf";

interface Meeting {
  id: string;
  title: string;
  description: string | null;
  date: string;
  duration_minutes: number | null;
  notes: string | null;
  ai_summary: string | null;
  ai_action_items: any;
  ai_key_points: any;
  ai_decisions: any;
  status: string;
  participants: any;
  agenda: any;
  reminder_minutes: number | null;
}

interface MeetingCardProps {
  meeting: Meeting;
  onEdit: (meeting: Meeting) => void;
  onDelete: (id: string) => void;
  onAiProcess: (id: string) => void;
  aiLoading?: boolean;
}

const statusColors: Record<string, string> = {
  scheduled: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-success/10 text-success border-success/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

function getReminderStatus(date: string, reminderMinutes: number | null) {
  if (!reminderMinutes || reminderMinutes === 0) return null;
  const meetingDate = new Date(date);
  const reminderTime = addMinutes(meetingDate, -reminderMinutes);
  const now = new Date();
  if (isBefore(meetingDate, now)) return null;
  if (isBefore(now, reminderTime)) {
    return { label: `Reminder ${formatDistanceToNow(reminderTime, { addSuffix: true })}`, urgent: false };
  }
  return { label: `Starting ${formatDistanceToNow(meetingDate, { addSuffix: true })}`, urgent: true };
}

export function MeetingCard({ meeting, onEdit, onDelete, onAiProcess, aiLoading }: MeetingCardProps) {
  const participants = Array.isArray(meeting.participants) ? meeting.participants : [];
  const agenda = Array.isArray(meeting.agenda) ? meeting.agenda : [];
  const keyPoints = Array.isArray(meeting.ai_key_points) ? meeting.ai_key_points : [];
  const decisions = Array.isArray(meeting.ai_decisions) ? meeting.ai_decisions : [];
  const actionItems = Array.isArray(meeting.ai_action_items) ? meeting.ai_action_items : [];
  const reminder = meeting.status === "scheduled" ? getReminderStatus(meeting.date, meeting.reminder_minutes) : null;
  const hasAiContent = meeting.ai_summary || keyPoints.length > 0 || decisions.length > 0 || actionItems.length > 0;

  return (
    <div className="glass-card p-4 sm:p-5 animate-slide-up hover:shadow-lg transition-shadow">
      {/* Reminder banner */}
      {reminder && (
        <div className={`-mx-4 sm:-mx-5 -mt-4 sm:-mt-5 mb-4 px-4 sm:px-5 py-2 rounded-t-xl flex items-center gap-2 text-xs font-medium ${reminder.urgent ? "bg-warning/15 text-warning" : "bg-primary/5 text-primary"}`}>
          <Bell className="w-3 h-3" />
          {reminder.label}
        </div>
      )}

      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-semibold text-foreground text-base sm:text-lg truncate">{meeting.title}</h3>
          {meeting.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{meeting.description}</p>
          )}
        </div>
        <Badge variant="outline" className={`${statusColors[meeting.status] || ""} shrink-0 text-xs`}>
          {meeting.status}
        </Badge>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-4 flex-wrap">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          {format(new Date(meeting.date), "MMM d, yyyy 'at' h:mm a")}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          {meeting.duration_minutes || 30} min
        </span>
        {participants.length > 0 && (
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            {participants.length}
          </span>
        )}
      </div>

      {/* Participants */}
      {participants.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {(participants as string[]).map((p) => (
            <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
          ))}
        </div>
      )}

      {/* Agenda */}
      {agenda.length > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-secondary/30 border border-border">
          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <ListChecks className="w-3 h-3" /> Agenda
          </p>
          <ol className="space-y-1">
            {(agenda as string[]).map((item, i) => (
              <li key={i} className="text-sm text-foreground flex items-start gap-2">
                <span className="font-medium text-muted-foreground">{i + 1}.</span>
                <span className="break-words">{item}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* AI Summary */}
      {meeting.ai_summary && (
        <div className="mb-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
          <p className="text-xs font-medium text-primary mb-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> AI Summary
          </p>
          <p className="text-sm text-foreground">{meeting.ai_summary}</p>
        </div>
      )}

      {/* Key Points */}
      {keyPoints.length > 0 && (
        <div className="mb-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
          <p className="text-xs font-medium text-primary mb-2 flex items-center gap-1">
            <Lightbulb className="w-3 h-3" /> Key Points
          </p>
          <ul className="space-y-1">
            {(keyPoints as string[]).map((item, i) => (
              <li key={i} className="text-sm text-foreground flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span><span className="break-words">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Decisions */}
      {decisions.length > 0 && (
        <div className="mb-3 p-3 rounded-lg bg-warning/5 border border-warning/10">
          <p className="text-xs font-medium text-warning mb-2 flex items-center gap-1">
            <Gavel className="w-3 h-3" /> Decisions
          </p>
          <ul className="space-y-1">
            {(decisions as string[]).map((item, i) => (
              <li key={i} className="text-sm text-foreground flex items-start gap-2">
                <span className="text-warning mt-0.5">•</span><span className="break-words">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Items */}
      {actionItems.length > 0 && (
        <div className="mb-3 p-3 rounded-lg bg-accent/5 border border-accent/10">
          <p className="text-xs font-medium text-accent mb-2 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Action Items
          </p>
          <ul className="space-y-1">
            {(actionItems as string[]).map((item, i) => (
              <li key={i} className="text-sm text-foreground flex items-start gap-2">
                <span className="text-accent mt-0.5">•</span><span className="break-words">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center gap-1 sm:gap-2 pt-2 border-t border-border flex-wrap">
        <Button variant="ghost" size="sm" onClick={() => onEdit(meeting)}>
          <Edit className="w-4 h-4 mr-1" /> Edit
        </Button>
        {meeting.notes && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAiProcess(meeting.id)}
            className="text-primary"
            disabled={aiLoading}
          >
            <Sparkles className="w-4 h-4 mr-1" />
            {aiLoading ? "Analyzing..." : hasAiContent ? "Re-analyze" : "Analyze"}
          </Button>
        )}
        {hasAiContent && (
          <Button variant="ghost" size="sm" onClick={() => exportMeetingPdf(meeting)} className="text-muted-foreground">
            <Download className="w-4 h-4 mr-1" /> PDF
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={() => onDelete(meeting.id)} className="text-destructive ml-auto">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
