<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Reporte de Tickets</title>
    <style>
        @page { margin: 1.5cm 1.5cm 2.5cm; }
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 8pt; color: #1a1a1a; line-height: 1.4; }
        .header { display: flex; align-items: center; gap: 14px; border-bottom: 3px solid #1e3a5f; padding-bottom: 12px; margin-bottom: 14px; }
        .header-logo svg { width: 40px; height: 40px; }
        .header-text .institution { font-size: 14pt; font-weight: bold; color: #1e3a5f; }
        .header-text .subtitle { font-size: 7pt; color: #666; }
        .header-text .report-type { font-size: 9pt; color: #1e3a5f; font-weight: bold; margin-top: 4px; }
        .filters-bar { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 8px 12px; margin-bottom: 10px; font-size: 7.5pt; color: #555; }
        .filters-bar strong { color: #333; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #1e3a5f; color: #fff; padding: 6px 8px; font-size: 7pt; text-transform: uppercase; text-align: left; }
        td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
        tr:nth-child(even) td { background: #f8fafc; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 6.5pt; font-weight: 600; }
        .badge-sin_definir { background: #e5e7eb; color: #374151; }
        .badge-abierto { background: #dbeafe; color: #1e40af; }
        .badge-en_proceso { background: #ffedd5; color: #9a3412; }
        .badge-pendiente_informacion { background: #fef9c3; color: #854d0e; }
        .badge-resuelto { background: #d1fae5; color: #065f46; }
        .badge-cerrado { background: #e5e7eb; color: #374151; }
        .badge-baja { background: #e5e7eb; color: #374151; }
        .badge-media { background: #fef9c3; color: #854d0e; }
        .badge-alta { background: #ffedd5; color: #9a3412; }
        .badge-critica { background: #fee2e2; color: #991b1b; }
        .footer { position: fixed; bottom: 0; left: 0; right: 0; height: 1.8cm; display: flex; align-items: center; justify-content: space-between; padding: 0 1.5cm; border-top: 1px solid #d0d5dd; font-size: 7pt; color: #999; }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-logo">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 5 L95 25 L95 55 C95 75 75 92 50 98 C25 92 5 75 5 55 L5 25 Z" fill="#1e3a5f"/>
                <path d="M50 15 L85 30 L85 52 C85 68 70 82 50 87 C30 82 15 68 15 52 L15 30 Z" fill="#f8fafc"/>
                <circle cx="50" cy="45" r="12" fill="#1e3a5f"/>
                <circle cx="50" cy="45" r="8" fill="#f8fafc"/>
                <path d="M40 50 L60 50 M50 40 L50 60" stroke="#1e3a5f" stroke-width="2.5" stroke-linecap="round"/>
                <path d="M35 70 Q50 80 65 70" fill="none" stroke="#1e3a5f" stroke-width="2" stroke-linecap="round"/>
            </svg>
        </div>
        <div class="header-text">
            <div class="institution">Alcaldía Municipal</div>
            <div class="subtitle">Isla de Margarita, Estado Nueva Esparta</div>
            <div class="report-type">REPORTE DE TICKETS</div>
        </div>
    </div>

    <div class="filters-bar">
        <strong>Filtros aplicados:</strong>
        @if($filters['status']) Estado: <strong>{{ $filters['status'] }}</strong> &middot; @endif
        @if($filters['priority']) Prioridad: <strong>{{ $filters['priority'] }}</strong> &middot; @endif
        @if($filters['category']) Categoría: <strong>{{ $filters['category_label'] }}</strong> &middot; @endif
        @if($filters['date_from'] || $filters['date_to']) Fecha: <strong>{{ $filters['date_from'] ?? '—' }}</strong> a <strong>{{ $filters['date_to'] ?? '—' }}</strong> &middot; @endif
        @if($filters['search']) Búsqueda: <strong>"{{ $filters['search'] }}"</strong> &middot; @endif
        Total: <strong>{{ $tickets->count() }}</strong> tickets &middot;
        Generado: <strong>{{ now()->format('d/m/Y H:i') }}</strong>
    </div>

    @if($tickets->isEmpty())
        <p style="text-align:center; color:#999; padding: 30px;">No se encontraron tickets con los filtros seleccionados.</p>
    @else
    <table>
        <thead>
            <tr>
                <th>Código</th>
                <th>Título</th>
                <th>Solicitante</th>
                <th>Categoría</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Asignado</th>
                <th>Fecha</th>
            </tr>
        </thead>
        <tbody>
            @foreach($tickets as $t)
            <tr>
                <td style="font-family: monospace; font-size: 7pt;">{{ $t->code }}</td>
                <td style="max-width: 150px; word-wrap: break-word;">{{ $t->title }}</td>
                <td>{{ $t->creator->full_name }}</td>
                <td>{{ $t->category->name ?? 'Sin categoría' }}</td>
                <td><span class="badge badge-{{ $t->priority->value }}">{{ $t->priority->label() }}</span></td>
                <td><span class="badge badge-{{ $t->status->value }}">{{ $t->status->label() }}</span></td>
                <td>{{ $t->assigned->full_name ?? 'Sin asignar' }}</td>
                <td style="white-space: nowrap;">{{ $t->entry_date?->format('d/m/Y H:i') ?? $t->created_at->format('d/m/Y H:i') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    <div class="footer">
        <span>Reporte generado el {{ now()->format('d/m/Y H:i') }}</span>
        <span>Página {PAGE_NUM} de {PAGE_COUNT}</span>
    </div>
</body>
</html>
