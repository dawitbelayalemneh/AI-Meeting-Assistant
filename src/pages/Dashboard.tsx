import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MeetingCard } from "@/components/MeetingCard";
import { MeetingDialog } from "@/components/MeetingDialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, Calendar, LogOut, Sparkles } from "lucide-react";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<any>(null);

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

  const saveMutation = useMutation({
    mutationFn: async (formData: any) => {
      if (editingMeeting) {
        const { error } = await supabase
          .from("meetings")
          .update({
            title: formData.title,
            description: formData.description,
            date: new Date(formData.date).toISOString(),
            duration_minutes: formData.duration_minutes,
            notes: formData.notes,
            status: formData.status,
          })
          .eq("id", editingMeeting.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("meetings").insert({
          user_id: user!.id,
          title: formData.title,
          description: formData.description,
          date: new Date(formData.date).toISOString(),
          duration_minutes: formData.duration_minutes,
          notes: formData.notes,
          status: formData.status,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      setDialogOpen(false);
      setEditingMeeting(null);
      toast.success(editingMeeting ? "Meeting updated" : "Meeting created");
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
      const meeting = meetings.find((m) => m.id === meetingId);
      if (!meeting?.notes) throw new Error("No notes to analyze");

      const { data, error } = await supabase.functions.invoke("analyze-meeting", {
        body: { meetingId, notes: meeting.notes, title: meeting.title },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      toast.success("AI analysis complete!");
    },
    onError: (err: any) => toast.error(err.message),
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
          <div className="flex items-center gap-3">
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-5">
            <p className="text-sm text-muted-foreground">Total Meetings</p>
            <p className="text-3xl font-heading font-bold text-foreground mt-1">{meetings.length}</p>
          </div>
          <div className="glass-card p-5">
            <p className="text-sm text-muted-foreground">Upcoming</p>
            <p className="text-3xl font-heading font-bold text-primary mt-1">{scheduled.length}</p>
          </div>
          <div className="glass-card p-5">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> AI Analyzed
            </p>
            <p className="text-3xl font-heading font-bold text-accent mt-1">
              {meetings.filter((m) => m.ai_summary).length}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-heading font-semibold text-foreground">Your Meetings</h2>
          <Button onClick={handleNew}>
            <Plus className="w-4 h-4 mr-1" /> New Meeting
          </Button>
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
