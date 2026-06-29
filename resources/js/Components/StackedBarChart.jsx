import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const GRANULARITY_OPTIONS = [
    { value: 'last_week', label: 'Última semana' },
    { value: 'last_month', label: 'Último mes' },
    { value: 'last_3_months', label: 'Últimos 3 meses' },
    { value: 'last_year', label: 'Último año' },
];

export default function StackedBarChart({ data, bars, xKey = 'name', granularity, onGranularityChange }) {
    if (!data || data.length === 0) {
        return (
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Distribución por Estado</h3>
                    {granularity && (
                        <select
                            value={granularity}
                            onChange={(e) => onGranularityChange?.(e.target.value)}
                            className="text-xs border border-gris-borde rounded px-2 py-1 bg-white text-gray-600 cursor-pointer"
                        >
                            {GRANULARITY_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    )}
                </div>
                <p className="text-sm text-gray-500 text-center py-10">Sin datos</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Distribución por Estado</h3>
                {granularity && (
                    <select
                        value={granularity}
                        onChange={(e) => onGranularityChange?.(e.target.value)}
                        className="text-xs border border-gris-borde rounded px-2 py-1 bg-white text-gray-600 cursor-pointer"
                    >
                        {GRANULARITY_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                )}
            </div>
            <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <XAxis
                        dataKey={xKey}
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
                    {bars.map((bar, idx) => (
                        <Bar
                            key={bar.dataKey}
                            dataKey={bar.dataKey}
                            stackId="stack"
                            fill={bar.fill}
                            name={bar.name}
                            radius={idx === bars.length - 1 ? [4, 4, 0, 0] : undefined}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
