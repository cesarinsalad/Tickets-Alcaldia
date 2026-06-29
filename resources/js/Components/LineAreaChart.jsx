import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const GRANULARITY_OPTIONS = [
    { value: 'days', label: 'Días' },
    { value: 'weeks', label: 'Semanas' },
    { value: 'months', label: 'Meses' },
];

export default function LineAreaChart({ data, granularity, onGranularityChange }) {
    if (!data || data.length === 0) {
        return (
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Tendencia Creados vs Resueltos</h3>
                    <select
                        value={granularity || 'weeks'}
                        onChange={(e) => onGranularityChange?.(e.target.value)}
                        className="text-xs border border-gris-borde rounded px-2 py-1 bg-white text-gray-600 cursor-pointer"
                    >
                        {GRANULARITY_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                <p className="text-sm text-gray-500 text-center py-10">Sin datos</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Tendencia Creados vs Resueltos</h3>
                <select
                    value={granularity || 'weeks'}
                    onChange={(e) => onGranularityChange?.(e.target.value)}
                    className="text-xs border border-gris-borde rounded px-2 py-1 bg-white text-gray-600 cursor-pointer"
                >
                    {GRANULARITY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
            <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <XAxis
                        dataKey="date"
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
                        dataKey="created"
                        fill="#1E3A5F"
                        name="Creados"
                        radius={[4, 4, 0, 0]}
                    />
                    <Bar
                        dataKey="resolved"
                        fill="#166534"
                        name="Resueltos"
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
