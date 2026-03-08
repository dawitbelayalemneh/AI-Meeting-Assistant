import { useMemo } from "react";
import { format, startOfWeek, endOfWeek, eachWeekOfInterval, subWeeks, isWithinInterval } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface Meeting {
  id: string;
  date: string;
  status: string;
  ai_action_items: any;
  ai_summary: string | null;
}

interface DashboardChartsProps {
  meetings: Meeting[];
}

const CHART_COLORS = {
  scheduled: "hsl(220, 70%, 50%)",
  completed: "hsl(152, 60%, 40%)",
  cancelled: "hsl(0, 72%, 51%)",
};

export function MeetingsPerWeekChart({ meetings }: DashboardChartsProps) {
  const data = useMemo(() => {
    const now = new Date();
    const weeks = eachWeekOfInterval({
      start: subWeeks(now, 7),
      end: now,
    }, { weekStartsOn: 1 });

    return weeks.map((weekStart) => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const weekMeetings = meetings.filter((m) =>
        isWithinInterval(new Date(m.date), { start: weekStart, end: weekEnd })
      );
      return {
        week: format(weekStart, "MMM d"),
        scheduled: weekMeetings.filter((m) => m.status === "scheduled").length,
        completed: weekMeetings.filter((m) => m.status === "completed").length,
        total: weekMeetings.length,
      };
    });
  }, [meetings]);

  return (
    <div className="glass-card p-5">
      <h3 className="font-heading font-semibold text-foreground text-sm mb-4">Meetings per Week</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={2}>
            <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} allowDecimals={false} width={24} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="completed" stackId="a" fill={CHART_COLORS.completed} radius={[0, 0, 0, 0]} name="Completed" />
            <Bar dataKey="scheduled" stackId="a" fill={CHART_COLORS.scheduled} radius={[4, 4, 0, 0]} name="Scheduled" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function TaskStatusChart({ meetings }: DashboardChartsProps) {
  const data = useMemo(() => {
    let totalItems = 0;
    let completedMeetingItems = 0;
    let pendingItems = 0;

    meetings.forEach((m) => {
      const items = Array.isArray(m.ai_action_items) ? m.ai_action_items.length : 0;
      totalItems += items;
      if (m.status === "completed") {
        completedMeetingItems += items;
      } else {
        pendingItems += items;
      }
    });

    if (totalItems === 0) return [];

    return [
      { name: "From completed", value: completedMeetingItems, color: CHART_COLORS.completed },
      { name: "Pending", value: pendingItems, color: CHART_COLORS.scheduled },
    ].filter((d) => d.value > 0);
  }, [meetings]);

  if (data.length === 0) {
    return (
      <div className="glass-card p-5">
        <h3 className="font-heading font-semibold text-foreground text-sm mb-4">Action Items</h3>
        <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
          No action items yet
        </div>
      </div>
    );
  }

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="glass-card p-5">
      <h3 className="font-heading font-semibold text-foreground text-sm mb-4">Action Items Breakdown</h3>
      <div className="h-48 flex items-center">
        <ResponsiveContainer width="50%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={60}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-2">
          {data.map((d, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: d.color }} />
              <span className="text-muted-foreground">{d.name}</span>
              <span className="font-semibold text-foreground ml-auto">{d.value}</span>
            </div>
          ))}
          <div className="pt-1 border-t border-border text-sm">
            <span className="text-muted-foreground">Total</span>
            <span className="font-bold text-foreground ml-auto float-right">{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
