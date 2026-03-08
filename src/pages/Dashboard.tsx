import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MeetingCard } from "@/components/MeetingCard";
import { MeetingDialog } from "@/components/MeetingDialog";
import { NotificationCenter } from "@/components/NotificationCenter";
import { MeetingsPerWeekChart, TaskStatusChart } from "@/components/DashboardCharts";
import { ActionItemsPanel, CompletedSummariesPanel } from "@/components/DashboardPanels";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Calendar, LogOut, Sparkles, Bell, FileText, Clock, CheckCircle } from "lucide-react";
import { isBefore, addMinutes, formatDistanceToNow, format } from "date-fns";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<any>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const firedReminders = useRef<Set<string>>(new Set());

  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ["meetings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Multi-tier reminder system
  useEffect(() => {
    if (meetings.length === 0) return;

    const checkReminders = () => {
      const now = new Date();
      meetings.forEach((m) => {
        if (m.status !== "scheduled") return;
        const meetingDate = new Date(m.date);
        if (isBefore(meetingDate, now)) return;

        const reminderMin = m.reminder_minutes || 15;
        // Check configured reminder
        const reminderTime = addMinutes(meetingDate, -reminderMin);
        const reminderKey = `${m.id}-${reminderMin}`;
        const diffReminder = Math.abs(now.getTime() - reminderTime.getTime());

        if (diffReminder < 30000 && !firedReminders.current.has(reminderKey)) {
          firedReminders.current.add(reminderKey);
          const timeLabel = reminderMin >= 60 ? `${reminderMin / 60} hour${reminderMin >= 120 ? "s" : ""}` : `${reminderMin} minutes`;
          addNotification({
            type: "reminder",
            title: `Meeting in ${timeLabel}`,
            message: `"${m.title}" starts ${formatDistanceToNow(meetingDate, { addSuffix: true })}`,
            meetingId: m.id,
          });
          toast.warning(`⏰ "${m.title}" starts in ${timeLabel}!`, {
            id: reminderKey,
            duration: 15000,
          });
        }

        // Also fire a "starting now" alert at 1 min before
        const startingSoonKey = `${m.id}-starting`;
        const diffStart = meetingDate.getTime() - now.getTime();
        if (diffStart > 0 && diffStart < 60000 && !firedReminders.current.has(startingSoonKey)) {
          firedReminders.current.add(startingSoonKey);
          addNotification({
            type: "reminder",
            title: "Meeting starting now!",
            message: `"${m.title}" is about to begin`,
            meetingId: m.id,
          });
          toast.warning(`🔴 "${m.title}" is starting now!`, {
            id: startingSoonKey,
            duration: 20000,
          });
        }
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 15000);
    return () => clearInterval(interval);
  }, [meetings, addNotification]);

  const saveMutation = useMutation({
    mutationFn: async (formData: any) => {
      const payload = {
        title: formData.title,
        description: formData.description,
        date: new Date(formData.date).toISOString(),
        duration_minutes: formData.duration_minutes,
        notes: formData.notes,
        status: formData.status,
        participants: formData.participants,
        agenda: formData.agenda,
        reminder_minutes: formData.reminder_minutes,
      };
      let savedMeeting: any = null;
      if (editingMeeting) {
        const { data, error } = await supabase.from("meetings").update(payload).eq("id", editingMeeting.id).select().single();
        if (error) throw error;
        savedMeeting = data;
      } else {
        const { data, error } = await supabase.from("meetings").insert({ ...payload, user_id: user!.id }).select().single();
        if (error) throw error;
        savedMeeting = data;
      }
      return savedMeeting;
    },
    onSuccess: (savedMeeting) => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      setDialogOpen(false);
      const wasEditing = !!editingMeeting;
      setEditingMeeting(null);
      toast.success(wasEditing ? "Meeting updated" : "Meeting created");

      if (savedMeeting.status === "completed" && savedMeeting.notes && !savedMeeting.ai_summary) {
        toast.info("Generating AI summary...");
        addNotification({
          type: "info",
          title: "AI analysis started",
          message: `Analyzing "${savedMeeting.title}"...`,
          meetingId: savedMeeting.id,
        });
        aiMutation.mutate(savedMeeting.id);
      }
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("meetings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      toast.success("Meeting deleted");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const aiMutation = useMutation({
    mutationFn: async (meetingId: string) => {
      setAnalyzingId(meetingId);
      const meeting = meetings.find((m) => m.id === meetingId);
      if (!meeting?.notes) throw new Error("No notes to analyze");
      const { data, error } = await supabase.functions.invoke("analyze-meeting", {
        body: { meetingId, notes: meeting.notes, title: meeting.title, agenda: meeting.agenda },
      });
      if (error) throw error;
      return { data, title: meeting.title, meetingId };
    },
    onSuccess: ({ title, meetingId }) => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      toast.success("AI analysis complete!");
      addNotification({
        type: "ai_ready",
        title: "AI Summary Ready",
        message: `Summary for "${title}" is now available with key points, decisions, and action items.`,
        meetingId,
      });
      setAnalyzingId(null);
    },
    onError: (err: any) => {
      toast.error(err.message);
      setAnalyzingId(null);
    },
  });

  const handleEdit = (meeting: any) => {
    setEditingMeeting(meeting);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditingMeeting(null);
    setDialogOpen(true);
  };

  const scheduled = meetings.filter((m) => m.status === "scheduled");
  const completed = meetings.filter((m) => m.status === "completed");
  const upcoming = useMemo(() => {
    const now = new Date();
    return meetings
      .filter((m) => m.status === "scheduled" && isBefore(now, new Date(m.date)))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [meetings]);
  const upcomingSoon = upcoming.filter((m) => {
    const meetingDate = new Date(m.date);
    const now = new Date();
    return meetingDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000;
  });
  const allActionItems = useMemo(() => {
    return meetings.reduce((total, m) => {
      return total + (Array.isArray(m.ai_action_items) ? m.ai_action_items.length : 0);
    }, 0);
  }, [meetings]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Calendar className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-heading font-bold text-foreground">MeetingAI</h1>
          </div>
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-5">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-3xl font-heading font-bold text-foreground mt-1">{meetings.length}</p>
          </div>
          <div className="glass-card p-5">
            <p className="text-sm text-muted-foreground">Upcoming</p>
            <p className="text-3xl font-heading font-bold text-primary mt-1">{scheduled.length}</p>
          </div>
          <div className="glass-card p-5">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Bell className="w-3.5 h-3.5" /> Today
            </p>
            <p className="text-3xl font-heading font-bold text-warning mt-1">{upcomingSoon.length}</p>
          </div>
          <div className="glass-card p-5">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Analyzed
            </p>
            <p className="text-3xl font-heading font-bold text-accent mt-1">
              {meetings.filter((m) => m.ai_summary).length}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-heading font-semibold text-foreground">Your Meetings</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/summaries")}>
              <FileText className="w-4 h-4 mr-1" /> Summaries
            </Button>
            <Button onClick={handleNew}>
              <Plus className="w-4 h-4 mr-1" /> New Meeting
            </Button>
          </div>
        </div>

        {/* Meeting List */}
        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground">Loading meetings...</div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-16 glass-card">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading font-semibold text-foreground mb-2">No meetings yet</h3>
            <p className="text-muted-foreground mb-4">Create your first meeting to get started</p>
            <Button onClick={handleNew}>
              <Plus className="w-4 h-4 mr-1" /> Create Meeting
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {meetings.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                onEdit={handleEdit}
                onDelete={(id) => deleteMutation.mutate(id)}
                onAiProcess={(id) => aiMutation.mutate(id)}
                aiLoading={analyzingId === meeting.id}
              />
            ))}
          </div>
        )}
      </main>

      <MeetingDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingMeeting(null);
        }}
        onSave={(data) => saveMutation.mutate(data)}
        initialData={editingMeeting}
        loading={saveMutation.isPending}
      />
    </div>
  );
};

export default Dashboard;
