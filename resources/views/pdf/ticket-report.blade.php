<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Reporte de Ticket - {{ $ticket->code }}</title>
    <style>
        @page {
            margin: 2cm 2.5cm;
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 11pt;
            color: #1a1a1a;
            line-height: 1.6;
        }

        .header {
            text-align: center;
            border-bottom: 3px solid #1e3a5f;
            padding-bottom: 16px;
            margin-bottom: 24px;
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

        .header .report-type {
            font-size: 10pt;
            color: #1e3a5f;
            margin-top: 8px;
            font-weight: bold;
        }

        h2 {
            font-size: 13pt;
            color: #1e3a5f;
            border-bottom: 1px solid #ccc;
            padding-bottom: 4px;
            margin-top: 24px;
            margin-bottom: 12px;
        }

        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
        }

        .info-table td {
            padding: 6px 10px;
            vertical-align: top;
        }

        .info-table .label {
            font-weight: bold;
            color: #444;
            width: 35%;
        }

        .badge {
            display: inline-block;
            padding: 2px 10px;
            border-radius: 3px;
            font-size: 9pt;
            font-weight: bold;
            color: #fff;
        }

        .badge-blue { background-color: #2563eb; }
        .badge-orange { background-color: #ea580c; }
        .badge-yellow { background-color: #ca8a04; }
        .badge-green { background-color: #16a34a; }
        .badge-gray { background-color: #6b7280; }
        .badge-red { background-color: #dc2626; }

        .comment-block {
            margin-bottom: 16px;
            padding: 10px;
            background: #f8f9fa;
            border-left: 3px solid #1e3a5f;
        }

        .internal-block {
            background: #fff7ed;
            border-left: 3px solid #ea580c;
        }

        .comment-user {
            font-weight: bold;
            font-size: 9pt;
            color: #1e3a5f;
        }

        .comment-date {
            font-size: 8pt;
            color: #888;
        }

        .comment-body {
            margin-top: 6px;
            font-size: 10pt;
        }

        .section-label {
            font-size: 9pt;
            color: #ea580c;
            font-weight: bold;
            margin-bottom: 8px;
        }

        .footer {
            margin-top: 40px;
            padding-top: 12px;
            border-top: 1px solid #ccc;
            text-align: center;
            font-size: 8pt;
            color: #888;
        }

        .description-box {
            background: #f8f9fa;
            padding: 12px;
            border-radius: 4px;
            font-size: 10pt;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">Sistema de Tickets - Alcaldía</div>
        <div class="subtitle">Municipalidad de la Ciudad</div>
        <div class="report-type">REPORTE DETALLADO DE TICKET</div>
    </div>

    <h2>Información del Ticket</h2>

    <table class="info-table">
        <tr>
            <td class="label">Código:</td>
            <td><strong>{{ $ticket->code }}</strong></td>
            <td class="label">Estado:</td>
            <td>
                <span class="badge badge-{{ $ticket->status->color() }}">
                    {{ $ticket->status->label() }}
                </span>
            </td>
        </tr>
        <tr>
            <td class="label">Título:</td>
            <td colspan="3">{{ $ticket->title }}</td>
        </tr>
        <tr>
            <td class="label">Prioridad:</td>
            <td>
                <span class="badge badge-{{ $ticket->priority->color() }}">
                    {{ $ticket->priority->label() }}
                </span>
            </td>
            <td class="label">Categoría:</td>
            <td>{{ $ticket->category->name }}</td>
        </tr>
        <tr>
            <td class="label">Fecha de creación:</td>
            <td>{{ $ticket->entry_date?->format('d/m/Y H:i') ?? $ticket->created_at->format('d/m/Y H:i') }}</td>
            <td class="label">Fecha de cierre:</td>
            <td>{{ $ticket->exit_date?->format('d/m/Y H:i') ?? 'Pendiente' }}</td>
        </tr>
        <tr>
            <td class="label">Fecha de emisión del reporte:</td>
            <td>{{ now()->format('d/m/Y H:i') }}</td>
            <td class="label">Técnico asignado:</td>
            <td>{{ $ticket->assigned?->full_name ?? 'Sin asignar' }}</td>
        </tr>
    </table>

    <h2>Información del Solicitante</h2>

    <table class="info-table">
        <tr>
            <td class="label">Nombre:</td>
            <td>{{ $ticket->creator->full_name }}</td>
            <td class="label">Departamento:</td>
            <td>{{ $ticket->creator->department?->name ?? 'N/A' }}</td>
        </tr>
        <tr>
            <td class="label">Correo electrónico:</td>
            <td>{{ $ticket->creator->email }}</td>
            <td class="label">Teléfono:</td>
            <td>{{ $ticket->creator->phone_number ?? 'N/A' }}</td>
        </tr>
    </table>

    <h2>Descripción</h2>

    <div class="description-box">
        {!! nl2br(e($ticket->description)) !!}
    </div>

    @if ($publicComments->isNotEmpty())
    <h2>Comentarios</h2>

    @foreach ($publicComments as $comment)
    <div class="comment-block">
        <div>
            <span class="comment-user">{{ $comment->user->full_name }}</span>
            <span class="comment-date"> - {{ $comment->created_at->format('d/m/Y H:i') }}</span>
        </div>
        <div class="comment-body">{!! nl2br(e($comment->body)) !!}</div>
    </div>
    @endforeach
    @endif

    @if ($internalComments->isNotEmpty())
    <h2>Notas Internas</h2>
    <div class="section-label">Visible solo para personal autorizado</div>

    @foreach ($internalComments as $comment)
    <div class="comment-block internal-block">
        <div>
            <span class="comment-user">{{ $comment->user->full_name }}</span>
            <span class="comment-date"> - {{ $comment->created_at->format('d/m/Y H:i') }}</span>
        </div>
        <div class="comment-body">{!! nl2br(e($comment->body)) !!}</div>
    </div>
    @endforeach
    @endif

    <div class="footer">
        Reporte generado el {{ now()->format('d/m/Y H:i') }} &mdash; Sistema de Tickets - Alcaldía
    </div>
</body>
</html>
