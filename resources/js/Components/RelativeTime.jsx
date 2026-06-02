import { Clock, AlertTriangle } from 'lucide-react';

export default function RelativeTime({ deadline, entryDate, label, compact = false }) {
    if (!deadline) {
        return <span className="text-gray-400">—</span>;
    }

    const now = new Date();
    const deadlineDate = new Date(deadline);
    const entry = entryDate ? new Date(entryDate) : null;

    const diffMs = deadlineDate.getTime() - now.getTime();
    const diffMinutes = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    let text = '';
    let colorClass = '';
    let icon = null;

    if (diffMs < 0) {
        const absMinutes = Math.abs(diffMinutes);
        const absHours = Math.abs(diffMs / 3600000);

        if (absMinutes < 60) {
            text = `Vencido hace ${absMinutes} min`;
        } else if (absHours < 24) {
            text = `Vencido hace ${Math.floor(absHours)}h ${absMinutes % 60}min`;
        } else {
            const days = Math.floor(absHours / 24);
            text = `Vencido hace ${days}d`;
        }
        colorClass = 'text-rojo-urgencia font-bold';
        icon = <AlertTriangle className="h-3.5 w-3.5 shrink-0" />;
    } else {
        let consumedPct = 0;
        if (entry) {
            const totalMs = deadlineDate.getTime() - entry.getTime();
            const elapsedMs = now.getTime() - entry.getTime();
            consumedPct = totalMs > 0 ? Math.min(100, (elapsedMs / totalMs) * 100) : 0;
        }

        if (diffMinutes < 60) {
            text = `Quedan ${diffMinutes} min`;
        } else if (diffHours < 24) {
            text = `Quedan ${diffHours}h`;
        } else if (diffDays === 1) {
            text = 'Vence mañana';
        } else if (diffDays < 7) {
            text = `Vence en ${diffDays} días`;
        } else {
            text = deadlineDate.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        }

        if (consumedPct >= 70) {
            colorClass = 'text-yellow-600 font-medium';
            icon = <Clock className="h-3.5 w-3.5 shrink-0" />;
        } else {
            colorClass = 'text-gray-500';
        }
    }

    if (compact) {
        return (
            <span className={`inline-flex items-center gap-1 ${colorClass}`}>
                {icon}
                {text}
            </span>
        );
    }

    return (
        <div className="space-y-1">
            {label && <span className="text-xs text-gray-400">{label}</span>}
            <span className={`inline-flex items-center gap-1.5 text-sm ${colorClass}`}>
                {icon}
                {text}
            </span>
        </div>
    );
}
