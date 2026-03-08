import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MeetingFormData {
  title: string;
  description: string;
  date: string;
  duration_minutes: number;
  notes: string;
  status: string;
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
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "",
        description: initialData.description || "",
        date: initialData.date ? new Date(initialData.date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
        duration_minutes: initialData.duration_minutes || 30,
        notes: initialData.notes || "",
        status: initialData.status || "scheduled",
      });
    } else {
      setForm({
        title: "",
        description: "",
        date: new Date().toISOString().slice(0, 16),
        duration_minutes: 30,
        notes: "",
        status: "scheduled",
      });
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">{initialData ? "Edit Meeting" : "New Meeting"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Meeting title" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date & Time</Label>
              <Input id="date" type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (min)</Label>
              <Input id="duration" type="number" min={5} max={480} value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 30 })} />
            </div>
          </div>
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
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Meeting notes (used for AI analysis)" rows={4} />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
