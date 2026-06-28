<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
        @page { margin: 1.5cm 1.5cm 2.5cm; }
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 8pt; color: #1a1a1a; line-height: 1.4; }
        .header-table { width: 100%; border-bottom: 3px solid #1e3a5f; margin-bottom: 10px; }
        .header-table td { border: none; padding: 0 0 12px 0; vertical-align: middle; }
        .header-logo { height: 80px; width: auto; }
        .header-title { font-size: 13pt; color: #1e3a5f; font-weight: bold; text-transform: uppercase; }
        .header-subtitle { font-size: 7pt; color: #64748b; margin-top: 2px; }
        .filters-bar { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 8px 12px; margin-bottom: 12px; font-size: 7.5pt; color: #555; }
        .filters-bar strong { color: #333; }
        .metadata-table { width: 100%; margin-bottom: 14px; font-size: 7.5pt; color: #555; }
        .metadata-table td { padding: 2px 0; }
        .metadata-table .meta-label { color: #999; text-transform: uppercase; font-size: 6.5pt; letter-spacing: 0.5px; }
        .metadata-table .meta-value { color: #1a1a1a; }
        table.data { width: 100%; border-collapse: collapse; }
        table.data th { background: #1e3a5f; color: #fff; padding: 6px 8px; font-size: 7pt; text-transform: uppercase; text-align: left; }
        table.data td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; vertical-align: top; font-size: 7.5pt; }
        table.data tr:nth-child(even) td { background: #f8fafc; }
        .footer { position: fixed; bottom: -2.0cm; left: 0; right: 0; height: 1.2cm; border-top: 1px solid #d0d5dd; font-size: 7pt; color: #999; }
    </style>
</head>
<body>
    <table class="header-table" width="100%">
        <tr>
            <td width="20%" align="left" valign="middle">
                <img src="{{ public_path('tickets-logo.jpg') }}" class="header-logo" alt="IAMENE">
            </td>
            <td width="55%" align="left" valign="middle">
                <div class="header-title">{{ $title }}</div>
                <div class="header-subtitle">Instituto Autónomo Municipal para el Ecosocialismo y el Nuevo Estado (IAMENE)</div>
            </td>
            <td width="25%" align="right" valign="top" style="font-size: 7pt; color: #64748b; line-height: 1.6;">
                Generado: {{ now()->format('d/m/Y H:i') }}<br>
                Por: {{ $generatedBy }}<br>
                Pág. de {{ $totalPages ?? '...' }}
            </td>
        </tr>
    </table>

    @if(!empty($filtersSummary))
    <div class="filters-bar">
        <strong>Filtros aplicados:</strong> {!! $filtersSummary !!} &middot;
        Total: <strong>{{ number_format($totalRows) }}</strong> registros
    </div>
    @endif

    @if(empty($rows))
        <p style="text-align:center; color:#999; padding: 30px;">No se encontraron registros con los filtros seleccionados.</p>
    @else
    @php
        $isGrouped = isset($groupBy) && $groupBy !== 'none' && $groupBy !== null;
    @endphp
    <table class="data">
        <thead>
            <tr>
                @foreach($columns as $col)
                    <th>{{ $col['label'] }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @foreach($rows as $row)
                @php
                    $rowType = data_get($row, '_type', 'ticket');
                @endphp
                @if($rowType === 'group_header')
                    <tr style="background: #1E3A5F; color: #fff;">
                        <td colspan="{{ count($columns) }}" style="padding: 6px 10px;">
                            <strong style="font-size: 8.5pt;">{{ data_get($row, 'group_label', '—') }}</strong>
                            <span style="opacity: 0.85; font-weight: normal; margin-left: 4px;">
                                ({{ data_get($row, 'group_total', 0) }} ticket{{ data_get($row, 'group_total', 0) == 1 ? '' : 's' }})
                            </span>
                        </td>
                    </tr>
                @elseif($rowType === 'subtotal')
                    <tr style="background: #f1f5f9;">
                        <td colspan="{{ count($columns) }}" style="padding: 4px 10px; font-style: italic; font-size: 7.5pt; color: #475569;">
                            <strong>Subtotal {{ data_get($row, 'group_label', '—') }}:</strong>
                            <span style="margin-left: 4px;">{{ data_get($row, 'total', 0) }} ticket(s)</span>
                            @if(data_get($row, 'on_time', 0) > 0)
                                <span style="color: #166534; margin-left: 6px;">{{ data_get($row, 'on_time') }} a tiempo</span>
                            @endif
                            @if(data_get($row, 'overdue', 0) > 0)
                                <span style="color: #991b1b; margin-left: 6px;">{{ data_get($row, 'overdue') }} vencidos</span>
                            @endif
                            @if(data_get($row, 'pending', 0) > 0)
                                <span style="color: #475569; margin-left: 6px;">{{ data_get($row, 'pending') }} pendientes</span>
                            @endif
                        </td>
                    </tr>
                @elseif($rowType === 'group_spacer')
                    <tr><td colspan="{{ count($columns) }}" style="padding: 2px;"></td></tr>
                @else
                    <tr>
                        @foreach($columns as $col)
                            @php
                                $value = data_get($row, $col['key'], '—');
                                if ($value instanceof \DateTimeInterface) {
                                    $value = $value->format('d/m/Y H:i');
                                } elseif (is_bool($value)) {
                                    $value = $value ? 'Sí' : 'No';
                                }
                            @endphp
                            <td>{{ $value ?? '—' }}</td>
                        @endforeach
                    </tr>
                @endif
            @endforeach
        </tbody>
    </table>
    @endif

    <div class="footer"></div>

    <script type="text/php">
        if (isset($pdf)) {
            $font = $fontMetrics->getFont("Helvetica", "normal");
            $size = 7;
            $color = array(0.6, 0.6, 0.6);
            $y = $pdf->get_height() - 32;

            $leftText = "Reporte generado el " . date('d/m/Y H:i');
            $pdf->page_text(42.5, $y, $leftText, $font, $size, $color);

            $rightText = "Página {PAGE_NUM} de {PAGE_COUNT}";
            $width = $fontMetrics->getTextWidth($rightText, $font, $size);
            $x = $pdf->get_width() - $width - 42.5;
            $pdf->page_text($x, $y, $rightText, $font, $size, $color);
        }
    </script>
</body>
</html>
