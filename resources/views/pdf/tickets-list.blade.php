<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Reporte de Tickets</title>
    <style>
        @page { margin: 1.5cm 1.5cm 2.5cm; }
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 8pt; color: #1a1a1a; line-height: 1.4; }
        .header-table { width: 100%; border-bottom: 3px solid #1e3a5f; margin-bottom: 14px; }
        .header-table td { border: none; padding: 0 0 15px 0; vertical-align: middle; }
        .header-logo { height: 95px; width: auto; }
        .report-type { font-size: 14pt; color: #1e3a5f; font-weight: bold; text-transform: uppercase; }
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
        .footer { position: fixed; bottom: -2.0cm; left: 0; right: 0; height: 1.2cm; border-top: 1px solid #d0d5dd; font-size: 7pt; color: #999; }
    </style>
</head>
<body>
    <table class="header-table" width="100%">
        <tr>
            <td width="25%" align="left" valign="middle">
                <img src="{{ public_path('tickets-logo.png') }}" class="header-logo" alt="Logo">
            </td>
            <td width="50%" align="center" valign="middle">
                <div class="report-type">Reporte de Tickets</div>
            </td>
            <td width="25%">&nbsp;</td>
        </tr>
    </table>

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
                <th style="width: 9%;">Código</th>
                <th style="width: 20%;">Título</th>
                <th style="width: 13%;">Solicitante</th>
                <th style="width: 11%;">Categoría</th>
                <th style="width: 11%;">Prioridad</th>
                <th style="width: 11%;">Estado</th>
                <th style="width: 10%;">Respuesta</th>
                <th style="width: 11%;">Asignado</th>
                <th style="width: 4%;">Fecha</th>
            </tr>
        </thead>
        <tbody>
            @foreach($tickets as $t)
            <tr>
                <td style="font-family: monospace; font-size: 7pt;">{{ $t->code }}</td>
                <td style="word-wrap: break-word;">{{ $t->title }}</td>
                <td style="font-size: 7.5pt;">{{ $t->creator->full_name }}</td>
                <td style="font-size: 7.5pt;">{{ $t->category->name ?? '—' }}</td>
                <td><span class="badge badge-{{ $t->priority->value }}" style="font-size: 6pt; padding: 1px 5px;">{{ $t->priority->label() }}</span></td>
                <td><span class="badge badge-{{ $t->status->value }}" style="font-size: 6pt; padding: 1px 5px;">{{ $t->status->label() }}</span></td>
                <td style="font-size: 7.5pt;">{{ $t->exit_date && $t->sla_resolution_deadline ? ($t->exit_date <= $t->sla_resolution_deadline ? 'A tiempo' : 'Tardío') : '—' }}</td>
                <td style="font-size: 7.5pt;">{{ $t->assigned->full_name ?? '—' }}</td>
                <td style="font-size: 7pt; white-space: nowrap;">{{ $t->entry_date?->format('d/m/Y') ?? $t->created_at->format('d/m/Y') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    <div class="footer">
    </div>

    <script type="text/php">
        if (isset($pdf)) {
            $font = $fontMetrics->getFont("Helvetica", "normal");
            $size = 7;
            $color = array(0.6, 0.6, 0.6);
            $y = $pdf->get_height() - 32;

            // Left text (creation date)
            $leftText = "Reporte generado el " . now()->format('d/m/Y H:i');
            $pdf->page_text(42.5, $y, $leftText, $font, $size, $color);

            // Right text (page numbers)
            $rightText = "Página {PAGE_NUM} de {PAGE_COUNT}";
            $width = $fontMetrics->getTextWidth($rightText, $font, $size);
            $x = $pdf->get_width() - $width - 42.5;
            $pdf->page_text($x, $y, $rightText, $font, $size, $color);
        }
    </script>
</body>
</html>
