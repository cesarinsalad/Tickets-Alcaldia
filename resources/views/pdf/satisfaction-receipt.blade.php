<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Constancia de Satisfacción - {{ $ticket->code }}</title>
    <style>
        @page {
            margin: 1.5cm;
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 10.5pt;
            color: #1a1a1a;
            line-height: 1.3;
        }

        .header {
            display: flex;
            align-items: center;
            gap: 14px;
            border-bottom: 3px solid #1e3a5f;
            padding-bottom: 12px;
            margin-bottom: 16px;
        }

        .header-logo {
            flex-shrink: 0;
        }

        .header-logo svg {
            width: 44px;
            height: 44px;
        }

        .header-text {
            flex: 1;
        }

        .header-text .institution {
            font-size: 15pt;
            font-weight: bold;
            color: #1e3a5f;
            letter-spacing: 1.5px;
        }

        .header-text .subtitle {
            font-size: 7.5pt;
            color: #666;
            margin-top: 1px;
        }

        .header-text .doc-type {
            font-size: 9pt;
            color: #1e3a5f;
            margin-top: 5px;
            font-weight: bold;
        }

        .content {
            text-align: justify;
        }

        .content p {
            margin-bottom: 8px;
        }

        .ticket-table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
        }

        .ticket-table tr {
            border-bottom: 1px solid #e5e7eb;
        }

        .ticket-table tr:last-child {
            border-bottom: none;
        }

        .ticket-table td {
            padding: 4px 0;
            vertical-align: top;
        }

        .ticket-table .label {
            font-weight: 600;
            color: #555;
            width: 32%;
            font-size: 9pt;
        }

        .ticket-table .value {
            font-size: 10pt;
        }

        .date-row {
            text-align: right;
            margin-bottom: 24px;
        }

        .date-row .date-label {
            font-size: 8pt;
            color: #888;
        }

        .date-row .date-value {
            font-size: 10pt;
            font-weight: 600;
            color: #1a1a1a;
            border-top: 1px solid #1a1a1a;
            display: inline-block;
            padding-top: 3px;
            min-width: 180px;
            text-align: center;
        }

        .signatures {
            display: flex;
            justify-content: space-between;
            gap: 30px;
            margin-top: 40px;
        }

        .signature-box {
            flex: 1;
            text-align: center;
        }

        .signature-line {
            border-top: 1px solid #1a1a1a;
            margin-bottom: 6px;
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
            bottom: 0;
            left: 0;
            right: 0;
            text-align: center;
            padding: 8px 1.5cm;
            border-top: 1px solid #d0d5dd;
            font-size: 7pt;
            color: #999;
        }
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
            <div class="doc-type">CONSTANCIA DE SATISFACCIÓN</div>
        </div>
    </div>

    <div class="content">
        <p>
            Por medio de la presente, la <strong>Alcaldía Municipal</strong> hace constar que el ticket
            de soporte técnico que se describe a continuación ha sido atendido y resuelto de manera
            satisfactoria.
        </p>

        <table class="ticket-table">
            <tr>
                <td class="label">Código de Ticket:</td>
                <td class="value"><strong>{{ $ticket->code }}</strong></td>
            </tr>
            <tr>
                <td class="label">Título:</td>
                <td class="value">{{ ucfirst($ticket->title) }}</td>
            </tr>
            <tr>
                <td class="label">Solicitante:</td>
                <td class="value">{{ $ticket->creator->full_name }}</td>
            </tr>
            <tr>
                <td class="label">Departamento:</td>
                <td class="value">{{ $ticket->creator->department?->name ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td class="label">Categoría:</td>
                <td class="value">{{ $ticket->category->name }}</td>
            </tr>
            <tr>
                <td class="label">Prioridad:</td>
                <td class="value">{{ $ticket->priority->label() }}</td>
            </tr>
            <tr>
                <td class="label">Técnico Asignado:</td>
                <td class="value">{{ $ticket->assigned?->full_name ?? 'Sin asignar' }}</td>
            </tr>
            <tr>
                <td class="label">Fecha de Creación:</td>
                <td class="value">{{ $ticket->entry_date?->translatedFormat('d \d\e F \d\e Y') ?? $ticket->created_at->translatedFormat('d \d\e F \d\e Y') }}</td>
            </tr>
            <tr>
                <td class="label">Fecha de Resolución:</td>
                <td class="value">{{ $ticket->exit_date?->translatedFormat('d \d\e F \d\e Y') ?? now()->translatedFormat('d \d\e F \d\e Y') }}</td>
            </tr>
        </table>

        <p>
            Se certifica que el usuario <strong>{{ $ticket->creator->full_name }}</strong>,
            perteneciente al departamento de <strong>{{ $ticket->creator->department?->name ?? 'N/A' }}</strong>,
            ha manifestado su conformidad con la solución brindada al ticket
            <strong>{{ $ticket->code }}</strong>, declarándose satisfecho(a) con el servicio
            prestado por el equipo de soporte técnico de la Alcaldía Municipal.
        </p>

        <p>
            Esta constancia se emite a solicitud del interesado para los fines que estime convenientes.
        </p>
    </div>

    <div class="date-row">
        <div class="date-label">Fecha de emisión</div>
        <div class="date-value">{{ now()->translatedFormat('d \d\e F \d\e Y') }}</div>
    </div>

    <div class="signatures">
        <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-name">{{ $ticket->creator->full_name }}</div>
            <div class="signature-role">Solicitante</div>
        </div>
        <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-name">{{ $ticket->assigned?->full_name ?? '______________________________' }}</div>
            <div class="signature-role">Técnico Responsable</div>
        </div>
    </div>

    <div class="footer">
        Documento generado el {{ now()->translatedFormat('d \d\e F \d\e Y \a \l\a\s H:i') }}
        &mdash; Sistema de Tickets - Alcaldía
    </div>
</body>
</html>
