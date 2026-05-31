import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#1E3A5F', '#2D5A8E', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE', '#EFF6FF'];

export default function SimpleDonutChart({ data }) {
    const total = data.reduce((sum, d) => sum + d.count, 0);

    return (
        <div className="flex items-center gap-4">
            <ResponsiveContainer width="60%" height={260}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={2}
                    >
                        {data.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value) => [`${value} (${total > 0 ? Math.round((value / total) * 100) : 0}%)`, 'Tickets']}
                        contentStyle={{ borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12 }}
                    />
                </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5 text-sm">
                {data.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-gray-600 truncate flex-1">{d.name}</span>
                        <span className="font-medium text-gray-900">{d.count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
