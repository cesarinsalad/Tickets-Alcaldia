export default function TimeProgressBar({ deadline, entryDate }) {
    if (!deadline || !entryDate) {
        return null;
    }

    const now = new Date();
    const deadlineDate = new Date(deadline);
    const entry = new Date(entryDate);

    const totalMs = deadlineDate.getTime() - entry.getTime();
    const elapsedMs = now.getTime() - entry.getTime();
    const pct = totalMs > 0 ? Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100)) : 0;

    let barColor = 'bg-verde-exito';
    if (pct >= 100 || now >= deadlineDate) {
        barColor = 'bg-rojo-urgencia';
    } else if (pct >= 70) {
        barColor = 'bg-yellow-500';
    }

    return (
        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mt-1">
            <div
                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                style={{ width: `${pct}%` }}
            />
        </div>
    );
}
