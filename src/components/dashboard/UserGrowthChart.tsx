import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", users: 1200, therapists: 45 },
  { month: "Feb", users: 1450, therapists: 52 },
  { month: "Mar", users: 1680, therapists: 58 },
  { month: "Apr", users: 2100, therapists: 65 },
  { month: "May", users: 2580, therapists: 72 },
  { month: "Jun", users: 3200, therapists: 78 },
  { month: "Jul", users: 3850, therapists: 85 },
  { month: "Aug", users: 4200, therapists: 91 },
  { month: "Sep", users: 4800, therapists: 98 },
  { month: "Oct", users: 5400, therapists: 105 },
  { month: "Nov", users: 6100, therapists: 112 },
  { month: "Dec", users: 6850, therapists: 120 },
];

export function UserGrowthChart() {
  return (
    <div className="bg-card rounded-lg border border-border p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold">User Growth</h3>
          <p className="text-sm text-muted-foreground">Users & therapists over time</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Users</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-muted-foreground">Therapists</span>
          </div>
        </div>
      </div>
      
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              yAxisId="left"
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              yAxisId="right"
              orientation="right"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Line
              type="monotone"
              dataKey="users"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              yAxisId="left"
            />
            <Line
              type="monotone"
              dataKey="therapists"
              stroke="hsl(var(--success))"
              strokeWidth={2}
              dot={false}
              yAxisId="right"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
