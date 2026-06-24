<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Informe de Retiro de Equipo - {{ $ticket->code }}</title>
    <style>
        @page {
            margin: 1.5cm;
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 10.5pt;
            color: #1a1a1a;
            line-height: 1.4;
        }

        .header-table {
            width: 100%;
            border-bottom: 3px solid #1e3a5f;
            margin-bottom: 16px;
        }

        .header-table td {
            border: none;
            padding: 0 0 15px 0;
            vertical-align: middle;
        }

        .header-logo {
            height: 90px;
            width: auto;
        }

        .doc-type {
            font-size: 14pt;
            color: #1e3a5f;
            font-weight: bold;
        }

        h2 {
            font-size: 10pt;
            color: #1e3a5f;
            border-bottom: 1px solid #d0d5dd;
            padding-bottom: 3px;
            margin-top: 18px;
            margin-bottom: 8px;
        }

        .grid-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }

        .grid-table td {
            padding: 3px 8px 3px 0;
            vertical-align: top;
            width: 50%;
        }

        .grid-table .label {
            font-size: 8pt;
            color: #888;
            text-transform: uppercase;
            display: block;
            margin-bottom: 1px;
        }

        .grid-table .value {
            font-size: 10pt;
            display: block;
        }

        .spec-table {
            width: 100%;
            border-collapse: collapse;
            margin: 8px 0;
        }

        .spec-table th {
            background: #f1f5f9;
            font-size: 8pt;
            color: #64748b;
            text-transform: uppercase;
            text-align: left;
            padding: 6px 10px;
            border-bottom: 1px solid #d0d5dd;
        }

        .spec-table td {
            font-size: 10pt;
            padding: 6px 10px;
            border-bottom: 1px solid #e5e7eb;
        }

        .spec-table .spec-label {
            font-weight: 600;
            color: #555;
            width: 35%;
        }

        .diagnostic-panel {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 14px;
            font-size: 10pt;
            line-height: 1.6;
            margin: 8px 0;
        }

        .signatures-table {
            width: 100%;
            margin-top: 60px;
        }

        .signature-cell {
            text-align: center;
        }

        .signature-line {
            border-top: 1px solid #1a1a1a;
            margin-bottom: 6px;
            width: 80%;
            margin-left: auto;
            margin-right: auto;
        }

        .signature-name {
            font-weight: 700;
            font-size: 10pt;
            color: #1a1a1a;
        }

        .signature-role {
            font-size: 8pt;
            color: #888;
            margin-top: 2px;
        }

        .footer {
            position: fixed;
            bottom: -1.0cm;
            left: 0;
            right: 0;
            text-align: center;
            padding: 8px 1.5cm;
            border-top: 1px solid #d0d5dd;
            font-size: 7pt;
            color: #999;
        }

        .report-id {
            margin-top: 10px;
            font-size: 7pt;
            color: #999;
            text-align: right;
        }
    </style>
</head>
<body>
    <table class="header-table" width="100%">
        <tr>
            <td width="25%" align="left" valign="middle">
                <img src="{{ public_path('tickets-logo.jpg') }}" class="header-logo" alt="Logo">
            </td>
            <td width="50%" align="center" valign="middle">
                <div class="doc-type">Informe de Retiro de Equipo</div>
            </td>
            <td width="25%">&nbsp;</td>
        </tr>
    </table>

    <h2>Informacion del Ticket</h2>

    <table class="grid-table">
        <tr>
            <td>
                <span class="label">Codigo</span>
                <span class="value"><strong>{{ $ticket->code }}</strong></span>
            </td>
            <td>
                <span class="label">Fecha</span>
                <span class="value">{{ $report->created_at->format('d/m/Y H:i') }}</span>
            </td>
        </tr>
        <tr>
            <td colspan="2">
                <span class="label">Titulo</span>
                <span class="value">{{ $ticket->title }}</span>
            </td>
        </tr>
        <tr>
            <td>
                <span class="label">Solicitante</span>
                <span class="value">{{ $ticket->creator->full_name }}</span>
            </td>
            <td>
                <span class="label">Departamento</span>
                <span class="value">{{ $ticket->creator->department?->name ?? 'N/A' }}</span>
            </td>
        </tr>
        <tr>
            <td>
                <span class="label">Tecnico Asignado</span>
                <span class="value">{{ $ticket->assigned?->full_name ?? 'Sin asignar' }}</span>
            </td>
            <td>
                <span class="label">Categoria</span>
                <span class="value">{{ $ticket->category?->name ?? 'N/A' }}</span>
            </td>
        </tr>
    </table>

    <h2>Especificaciones del Equipo</h2>

    <table class="spec-table">
        <tr>
            <td class="spec-label">Codigo de Bienes (SKU)</td>
            <td><strong>{{ $equipment->sku }}</strong></td>
        </tr>
        <tr>
            <td class="spec-label">Marca</td>
            <td>{{ $equipment->brand ?? '—' }}</td>
        </tr>
        <tr>
            <td class="spec-label">Modelo</td>
            <td>{{ $equipment->model ?? '—' }}</td>
        </tr>
        <tr>
            <td class="spec-label">Procesador</td>
            <td>{{ $equipment->processor ?? '—' }}</td>
        </tr>
        <tr>
            <td class="spec-label">Memoria RAM</td>
            <td>{{ $equipment->ram_memory ?? '—' }}</td>
        </tr>
        <tr>
            <td class="spec-label">Disco de Almacenamiento</td>
            <td>{{ $equipment->storage_disk ?? '—' }}</td>
        </tr>
    </table>

    <h2>Observaciones</h2>

    <div class="diagnostic-panel">
        {!! nl2br(e($report->diagnostic)) !!}
    </div>

    <table class="signatures-table">
        <tr>
            <td class="signature-cell" width="45%" valign="bottom">
                <div class="signature-line"></div>
                <div class="signature-name">{{ $ticket->creator->full_name }}</div>
                <div class="signature-role">Entregado por (Usuario)</div>
            </td>
            <td width="10%">&nbsp;</td>
            <td class="signature-cell" width="45%" valign="bottom">
                <div class="signature-line"></div>
                <div class="signature-name">{{ $ticket->assigned?->full_name ?? '______________________________' }}</div>
                <div class="signature-role">Recibido por (Tecnico Soporte)</div>
            </td>
        </tr>
    </table>

    <div class="report-id">
        Informe #{{ $report->id }} &mdash; {{ $report->created_at->format('d/m/Y H:i') }}
    </div>

    <div class="footer">
        Documento generado el {{ now()->translatedFormat('d \d\e F \d\e Y \a \l\a\s H:i') }}
        &mdash; Sistema de Tickets - Alcaldia
    </div>
</body>
</html>
