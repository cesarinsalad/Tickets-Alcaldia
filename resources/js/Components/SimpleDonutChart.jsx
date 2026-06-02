import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#2C3E50', '#34495E', '#4A6274', '#5D7B8A', '#7A9BAE', '#4A6741', '#5C7A52', '#6E8F63', '#84A578', '#9BBF8E'];

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
