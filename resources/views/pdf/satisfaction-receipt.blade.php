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
            height: 95px;
            width: auto;
        }

        .doc-type {
            font-size: 14pt;
            color: #1e3a5f;
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



        .signatures-table {
            width: 100%;
            margin-top: 80px;
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
    </style>
</head>
<body>
    <table class="header-table" width="100%">
        <tr>
            <td width="25%" align="left" valign="middle">
                <img src="{{ public_path('tickets-logo.jpg') }}" class="header-logo" alt="Logo">
            </td>
            <td width="50%" align="center" valign="middle">
                <div class="doc-type">Constancia de Satisfacción</div>
            </td>
            <td width="25%">&nbsp;</td>
        </tr>
    </table>

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

    <table class="signatures-table">
        <tr>
            <td class="signature-cell" width="45%" valign="bottom">
                <div class="signature-line"></div>
                <div class="signature-name">{{ $ticket->creator->full_name }}</div>
                <div class="signature-role">Solicitante</div>
            </td>
            <td width="10%">&nbsp;</td>
            <td class="signature-cell" width="45%" valign="bottom">
                <div class="signature-line"></div>
                <div class="signature-name">{{ $ticket->assigned?->full_name ?? '______________________________' }}</div>
                <div class="signature-role">Técnico Responsable</div>
            </td>
        </tr>
    </table>

    <div class="footer">
        Documento generado el {{ now()->translatedFormat('d \d\e F \d\e Y \a \l\a\s H:i') }}
        &mdash; Sistema de Tickets - Alcaldía
    </div>
</body>
</html>
