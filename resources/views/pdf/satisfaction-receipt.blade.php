<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Constancia de Satisfacción - {{ $ticket->code }}</title>
    <style>
        @page {
            margin: 2.5cm 3cm;
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 12pt;
            color: #1a1a1a;
            line-height: 1.8;
        }

        .header {
            text-align: center;
            border-bottom: 3px solid #1e3a5f;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }

        .header .logo {
            font-size: 18pt;
            font-weight: bold;
            color: #1e3a5f;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        .header .subtitle {
            font-size: 9pt;
            color: #555;
            margin-top: 4px;
        }

        .header .document-type {
            font-size: 11pt;
            color: #1e3a5f;
            margin-top: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .content {
            text-align: justify;
            margin-top: 30px;
        }

        .content p {
            margin-bottom: 16px;
        }

        .ticket-info {
            margin: 30px 0;
            padding: 16px;
            background: #f8f9fa;
            border-radius: 4px;
        }

        .ticket-info table {
            width: 100%;
            border-collapse: collapse;
        }

        .ticket-info td {
            padding: 5px 8px;
        }

        .ticket-info .label {
            font-weight: bold;
            color: #444;
        }

        .signature-section {
            margin-top: 80px;
        }

        .signature-line {
            width: 60%;
            margin: 60px auto 10px auto;
            border-top: 1px solid #1a1a1a;
            text-align: center;
        }

        .signature-label {
            text-align: center;
            font-size: 10pt;
            color: #444;
            margin-top: 4px;
        }

        .date-section {
            margin-top: 40px;
            text-align: right;
        }

        .date-line {
            display: inline-block;
            width: 40%;
            border-top: 1px solid #1a1a1a;
            text-align: center;
            margin-top: 10px;
        }

        .footer {
            margin-top: 60px;
            padding-top: 12px;
            border-top: 1px solid #ccc;
            text-align: center;
            font-size: 8pt;
            color: #888;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">Sistema de Tickets - Alcaldía</div>
        <div class="subtitle">Municipalidad de la Ciudad</div>
        <div class="document-type">Constancia de Satisfacción</div>
    </div>

    <div class="content">
        <p>
            Por medio de la presente, la <strong>Alcaldía Municipal</strong> hace constar que el ticket
            de soporte técnico que se describe a continuación ha sido atendido y resuelto de manera
            satisfactoria.
        </p>

        <div class="ticket-info">
            <table>
                <tr>
                    <td class="label">Código de Ticket:</td>
                    <td><strong>{{ $ticket->code }}</strong></td>
                </tr>
                <tr>
                    <td class="label">Título:</td>
                    <td>{{ $ticket->title }}</td>
                </tr>
                <tr>
                    <td class="label">Solicitante:</td>
                    <td>{{ $ticket->creator->full_name }}</td>
                </tr>
                <tr>
                    <td class="label">Departamento:</td>
                    <td>{{ $ticket->creator->department?->name ?? 'N/A' }}</td>
                </tr>
                <tr>
                    <td class="label">Categoría:</td>
                    <td>{{ $ticket->category->name }}</td>
                </tr>
                <tr>
                    <td class="label">Prioridad:</td>
                    <td>{{ $ticket->priority->label() }}</td>
                </tr>
                <tr>
                    <td class="label">Técnico Asignado:</td>
                    <td>{{ $ticket->assigned?->full_name ?? 'Sin asignar' }}</td>
                </tr>
                <tr>
                    <td class="label">Fecha de Creación:</td>
                    <td>{{ $ticket->entry_date?->format('d/m/Y') ?? $ticket->created_at->format('d/m/Y') }}</td>
                </tr>
                <tr>
                    <td class="label">Fecha de Resolución:</td>
                    <td>{{ $ticket->exit_date?->format('d/m/Y') ?? now()->format('d/m/Y') }}</td>
                </tr>
            </table>
        </div>

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

    <div class="signature-section">
        <div class="date-section">
            Fecha de emisión:
            <div class="date-line">{{ now()->format('d \d\e F \d\e Y') }}</div>
        </div>

        <div class="signature-line"></div>
        <div class="signature-label">{{ $ticket->creator->full_name }}</div>
        <div class="signature-label" style="font-size: 9pt; color: #888;">Solicitante</div>

        <div class="signature-line" style="margin-top: 50px;"></div>
        <div class="signature-label">{{ $ticket->assigned?->full_name ?? '______________________________' }}</div>
        <div class="signature-label" style="font-size: 9pt; color: #888;">Técnico Responsable</div>
    </div>

    <div class="footer">
        Documento generado el {{ now()->format('d/m/Y H:i') }} &mdash; Sistema de Tickets - Alcaldía
    </div>
</body>
</html>
