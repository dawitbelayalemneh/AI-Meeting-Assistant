import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Plus, Edit, Sparkles, FileText, Bell, MessageSquare, Download, Trash2, Users, ListChecks, Search, LogOut, CheckCircle2 } from "lucide-react";

const Documentation = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <Calendar className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-heading font-bold text-foreground">MeetingAI — Documentation</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* Overview */}
        <section>
          <h2 className="text-2xl font-heading font-bold text-foreground mb-3">What is MeetingAI?</h2>
          <p className="text-muted-foreground leading-relaxed">
            MeetingAI is an intelligent meeting management app that helps you schedule, track, and analyze your meetings using AI. 
            It automatically generates summaries, extracts key decisions, identifies action items, and lets you chat with an AI assistant about your meeting history — all in one place.
          </p>
        </section>

        {/* Key Features */}
        <section>
          <h2 className="text-2xl font-heading font-bold text-foreground mb-4">Key Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: Calendar, title: "Meeting Scheduling", desc: "Create meetings with date, time, duration, participants, and agenda items." },
              { icon: Sparkles, title: "AI Analysis", desc: "Get auto-generated summaries, key points, decisions, and action items from your notes." },
              { icon: Bell, title: "Smart Reminders", desc: "Configurable reminders that alert you before meetings start." },
              { icon: MessageSquare, title: "AI Chat Assistant", desc: "Ask questions about your meetings — pending actions, recent decisions, and more." },
              { icon: FileText, title: "Summaries Page", desc: "Browse and search all AI-analyzed meetings with full summaries." },
              { icon: Download, title: "PDF Export", desc: "Download meeting summaries as PDF documents." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass-card p-4 flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{title}</h3>
                  <p className="text-muted-foreground text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Step-by-step Guide */}
        <section>
          <h2 className="text-2xl font-heading font-bold text-foreground mb-4">Step-by-Step Guide</h2>

          {/* 1. Sign Up */}
          <Step number={1} title="Sign Up / Log In" icon={Users}>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-sm">
              <li>Go to the <strong className="text-foreground">Login</strong> page.</li>
              <li>If you're new, click <strong className="text-foreground">"Create an account"</strong>.</li>
              <li>Enter your <strong className="text-foreground">name</strong>, <strong className="text-foreground">email</strong>, and <strong className="text-foreground">password</strong>.</li>
              <li>Click <strong className="text-foreground">"Sign Up"</strong>.</li>
              <li>Check your email for a confirmation link and click it.</li>
              <li>Come back and <strong className="text-foreground">log in</strong> with your credentials.</li>
            </ol>
          </Step>

          {/* 2. Create Meeting */}
          <Step number={2} title="Create a New Meeting" icon={Plus}>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-sm">
              <li>On the Dashboard, click the <strong className="text-foreground">"+ New Meeting"</strong> button (top right of the meeting list).</li>
              <li>Fill in the <strong className="text-foreground">Title</strong> (e.g., "Weekly Standup").</li>
              <li>Add a <strong className="text-foreground">Description</strong> (optional).</li>
              <li>Set the <strong className="text-foreground">Date & Time</strong> using the date picker.</li>
              <li>Set the <strong className="text-foreground">Duration</strong> in minutes (default: 30).</li>
              <li>Add <strong className="text-foreground">Participants</strong>: type a name and press Enter or click <Plus className="w-3 h-3 inline" />.</li>
              <li>Add <strong className="text-foreground">Agenda Items</strong>: type each item and press Enter or click <Plus className="w-3 h-3 inline" />.</li>
              <li>Set a <strong className="text-foreground">Reminder</strong> (e.g., 15 min, 30 min, 1 hour before).</li>
              <li>Leave Status as <strong className="text-foreground">"Scheduled"</strong>.</li>
              <li>Click <strong className="text-foreground">"Save"</strong>.</li>
            </ol>
          </Step>

          {/* 3. Edit Meeting */}
          <Step number={3} title="Edit a Meeting & Add Notes" icon={Edit}>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-sm">
              <li>Find your meeting in the <strong className="text-foreground">All Meetings</strong> tab on the Dashboard.</li>
              <li>Click the <strong className="text-foreground">pencil icon (Edit)</strong> on the meeting card.</li>
              <li>The meeting form opens with all existing data pre-filled.</li>
              <li>After the meeting is over, paste or type your <strong className="text-foreground">meeting notes</strong> in the Notes field.</li>
              <li>Change the <strong className="text-foreground">Status</strong> dropdown from "Scheduled" to <strong className="text-foreground">"Completed"</strong>.</li>
              <li>Click <strong className="text-foreground">"Save"</strong>.</li>
            </ol>
          </Step>

          {/* 4. AI Analysis */}
          <Step number={4} title="Run AI Analysis" icon={Sparkles}>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-sm">
              <li>Once a meeting is saved as <strong className="text-foreground">"Completed"</strong> with notes, the AI may auto-analyze it.</li>
              <li>Or, click the <strong className="text-foreground">✨ Analyze</strong> button on the meeting card.</li>
              <li>Wait a few seconds — the AI will generate:</li>
              <ul className="list-disc list-inside ml-4 space-y-0.5">
                <li><strong className="text-foreground">Summary</strong> — A concise overview of the meeting.</li>
                <li><strong className="text-foreground">Key Points</strong> — The most important topics discussed.</li>
                <li><strong className="text-foreground">Decisions</strong> — Decisions that were made.</li>
                <li><strong className="text-foreground">Action Items</strong> — Tasks assigned to people.</li>
              </ul>
              <li>These appear directly on the meeting card once ready.</li>
            </ol>
          </Step>

          {/* 5. View Summaries */}
          <Step number={5} title="Browse AI Summaries" icon={FileText}>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-sm">
              <li>Click the <strong className="text-foreground">"Summaries"</strong> button on the Dashboard (or in the mobile menu).</li>
              <li>You'll see all meetings that have been analyzed by AI.</li>
              <li>Use the <strong className="text-foreground">search bar</strong> to filter by title or summary content.</li>
              <li>Each card shows the full summary, key points, decisions, and action items.</li>
            </ol>
          </Step>

          {/* 6. Export PDF */}
          <Step number={6} title="Export as PDF" icon={Download}>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-sm">
              <li>On any meeting card with an AI summary, click the <strong className="text-foreground">download icon</strong> (<Download className="w-3 h-3 inline" />).</li>
              <li>A PDF will be generated and downloaded containing the meeting title, date, summary, key points, decisions, and action items.</li>
            </ol>
          </Step>

          {/* 7. AI Chat */}
          <Step number={7} title="Chat with AI Assistant" icon={MessageSquare}>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-sm">
              <li>Click the <strong className="text-foreground">floating chat bubble</strong> (<MessageSquare className="w-3 h-3 inline" />) in the bottom-right corner of the Dashboard.</li>
              <li>The chat panel opens with <strong className="text-foreground">suggested questions</strong> like:</li>
              <ul className="list-disc list-inside ml-4 space-y-0.5">
                <li>"What action items are still pending?"</li>
                <li>"Summarize my last completed meeting"</li>
                <li>"What decisions were made this week?"</li>
                <li>"List all upcoming meetings"</li>
              </ul>
              <li>Click a suggestion or type your own question.</li>
              <li>The AI responds based on your actual meeting data.</li>
            </ol>
          </Step>

          {/* 8. Delete */}
          <Step number={8} title="Delete a Meeting" icon={Trash2}>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-sm">
              <li>On any meeting card, click the <strong className="text-foreground">trash icon</strong> (<Trash2 className="w-3 h-3 inline" />).</li>
              <li>The meeting is permanently deleted.</li>
            </ol>
          </Step>

          {/* 9. Notifications */}
          <Step number={9} title="Notifications & Reminders" icon={Bell}>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-sm">
              <li>Click the <strong className="text-foreground">bell icon</strong> (<Bell className="w-3 h-3 inline" />) in the top navigation bar.</li>
              <li>View all notifications — reminders, AI analysis completions, and more.</li>
              <li>Reminders fire automatically based on the time you set when creating the meeting.</li>
              <li>A toast notification also appears on screen when a reminder fires.</li>
            </ol>
          </Step>

          {/* 10. Sign Out */}
          <Step number={10} title="Sign Out" icon={LogOut}>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-sm">
              <li><strong className="text-foreground">Desktop:</strong> Click the <strong className="text-foreground">logout icon</strong> in the top-right corner.</li>
              <li><strong className="text-foreground">Mobile:</strong> Tap the <strong className="text-foreground">hamburger menu</strong> (<strong>☰</strong>), then tap <strong className="text-foreground">"Sign Out"</strong>.</li>
            </ol>
          </Step>
        </section>

        {/* Dashboard Overview */}
        <section>
          <h2 className="text-2xl font-heading font-bold text-foreground mb-3">Dashboard Overview</h2>
          <p className="text-muted-foreground text-sm mb-4">The dashboard gives you a bird's-eye view of everything:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" /> <span><strong className="text-foreground">Stats Cards</strong> — Total meetings, upcoming, today, completed, and action items at a glance.</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" /> <span><strong className="text-foreground">Charts</strong> — Meetings per week and task status breakdown visualized.</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" /> <span><strong className="text-foreground">Upcoming Meetings Panel</strong> — Quick list of your next meetings with countdown.</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" /> <span><strong className="text-foreground">Completed Summaries Panel</strong> — Recently analyzed meetings.</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" /> <span><strong className="text-foreground">Action Items Panel</strong> — All pending action items across meetings.</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" /> <span><strong className="text-foreground">Tabs</strong> — Filter meetings by All, Upcoming, or Completed.</span></li>
          </ul>
        </section>

        <div className="border-t border-border pt-6 text-center">
          <p className="text-xs text-muted-foreground">MeetingAI — Your intelligent meeting companion ✨</p>
        </div>
      </main>
    </div>
  );
};

function Step({ number, title, icon: Icon, children }: { number: number; title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="mb-6 glass-card p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
          {number}
        </div>
        <Icon className="w-4 h-4 text-primary" />
        <h3 className="font-heading font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default Documentation;
