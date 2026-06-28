import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function StackedBarChart({ data, onBarClick }) {
    if (!data || data.length === 0) {
        return <p className="text-sm text-gray-500 text-center py-10">Sin datos</p>;
    }

    return (
        <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                />
                <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Legend
                    wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                    iconType="rect"
                    iconSize={8}
                />
                <Bar
                    dataKey="on_time"
                    stackId="a"
                    fill="#166534"
                    name="A tiempo"
                    cursor="pointer"
                    onClick={(entry) => onBarClick?.(entry)}
                />
                <Bar
                    dataKey="overdue"
                    stackId="a"
                    fill="#991B1B"
                    name="Vencidos"
                    radius={[4, 4, 0, 0]}
                    cursor="pointer"
                    onClick={(entry) => onBarClick?.(entry)}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
