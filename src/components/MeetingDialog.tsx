import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Users, ListChecks, Bell } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MeetingFormData {
  title: string;
  description: string;
  date: string;
  duration_minutes: number;
  notes: string;
  status: string;
  participants: string[];
  agenda: string[];
  reminder_minutes: number;
}

interface MeetingDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: MeetingFormData) => void;
  initialData?: Partial<MeetingFormData> | null;
  loading?: boolean;
}

export function MeetingDialog({ open, onClose, onSave, initialData, loading }: MeetingDialogProps) {
  const [form, setForm] = useState<MeetingFormData>({
    title: "",
    description: "",
    date: new Date().toISOString().slice(0, 16),
    duration_minutes: 30,
    notes: "",
    status: "scheduled",
    participants: [],
    agenda: [],
    reminder_minutes: 15,
  });
  const [participantInput, setParticipantInput] = useState("");
  const [agendaInput, setAgendaInput] = useState("");

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "",
        description: initialData.description || "",
        date: initialData.date ? new Date(initialData.date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
        duration_minutes: initialData.duration_minutes || 30,
        notes: initialData.notes || "",
        status: initialData.status || "scheduled",
        participants: Array.isArray(initialData.participants) ? initialData.participants : [],
        agenda: Array.isArray(initialData.agenda) ? initialData.agenda : [],
        reminder_minutes: initialData.reminder_minutes ?? 15,
      });
    } else {
      setForm({
        title: "",
        description: "",
        date: new Date().toISOString().slice(0, 16),
        duration_minutes: 30,
        notes: "",
        status: "scheduled",
        participants: [],
        agenda: [],
        reminder_minutes: 15,
      });
    }
    setParticipantInput("");
    setAgendaInput("");
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const addParticipant = () => {
    const email = participantInput.trim();
    if (email && !form.participants.includes(email)) {
      setForm({ ...form, participants: [...form.participants, email] });
      setParticipantInput("");
    }
  };

  const removeParticipant = (email: string) => {
    setForm({ ...form, participants: form.participants.filter((p) => p !== email) });
  };

  const addAgendaItem = () => {
    const item = agendaInput.trim();
    if (item) {
      setForm({ ...form, agenda: [...form.agenda, item] });
      setAgendaInput("");
    }
  };

  const removeAgendaItem = (index: number) => {
    setForm({ ...form, agenda: form.agenda.filter((_, i) => i !== index) });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="font-heading">{initialData ? "Edit Meeting" : "New Meeting"}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Meeting title" />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description" />
            </div>

            {/* Date, Duration, Reminder — stack on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="date">Date & Time</Label>
                <Input id="date" type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Select value={String(form.duration_minutes)} onValueChange={(v) => setForm({ ...form, duration_minutes: parseInt(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reminder" className="flex items-center gap-1">
                  <Bell className="w-3 h-3" /> Reminder
                </Label>
                <Select value={String(form.reminder_minutes)} onValueChange={(v) => setForm({ ...form, reminder_minutes: parseInt(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">None</SelectItem>
                    <SelectItem value="5">5 min before</SelectItem>
                    <SelectItem value="15">15 min before</SelectItem>
                    <SelectItem value="30">30 min before</SelectItem>
                    <SelectItem value="60">1 hour before</SelectItem>
                    <SelectItem value="1440">1 day before</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Participants */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Participants</Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Add participant email"
                  value={participantInput}
                  onChange={(e) => setParticipantInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addParticipant(); } }}
                />
                <Button type="button" variant="outline" size="icon" onClick={addParticipant}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {form.participants.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.participants.map((p) => (
                    <Badge key={p} variant="secondary" className="pr-1 gap-1 text-xs">
                      <span className="truncate max-w-[140px]">{p}</span>
                      <button type="button" onClick={() => removeParticipant(p)} className="ml-0.5 hover:bg-muted rounded-full p-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Agenda */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><ListChecks className="w-3.5 h-3.5" /> Agenda</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add agenda item"
                  value={agendaInput}
                  onChange={(e) => setAgendaInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAgendaItem(); } }}
                />
                <Button type="button" variant="outline" size="icon" onClick={addAgendaItem}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {form.agenda.length > 0 && (
                <ol className="mt-2 space-y-1.5">
                  {form.agenda.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm bg-secondary/50 rounded-lg px-3 py-2">
                      <span className="font-medium text-muted-foreground min-w-[1.5rem]">{i + 1}.</span>
                      <span className="flex-1 text-foreground truncate">{item}</span>
                      <button type="button" onClick={() => removeAgendaItem(i)} className="text-muted-foreground hover:text-destructive shrink-0">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Meeting notes (used for AI analysis)" rows={3} />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
