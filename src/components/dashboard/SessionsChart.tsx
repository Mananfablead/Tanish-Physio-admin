import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
  { day: "Mon", completed: 45, cancelled: 3, noShow: 2 },
  { day: "Tue", completed: 52, cancelled: 4, noShow: 1 },
  { day: "Wed", completed: 48, cancelled: 2, noShow: 3 },
  { day: "Thu", completed: 61, cancelled: 5, noShow: 2 },
  { day: "Fri", completed: 55, cancelled: 3, noShow: 4 },
  { day: "Sat", completed: 32, cancelled: 2, noShow: 1 },
  { day: "Sun", completed: 18, cancelled: 1, noShow: 0 },
];

export function SessionsChart() {
  return (
    <div className="bg-card rounded-lg border border-border p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold">Session Volume</h3>
          <p className="text-sm text-muted-foreground">Weekly session breakdown</p>
        </div>
      </div>
      
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: "12px" }}
              iconType="circle"
              iconSize={8}
            />
            <Bar dataKey="completed" name="Completed" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="cancelled" name="Cancelled" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="noShow" name="No-show" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
