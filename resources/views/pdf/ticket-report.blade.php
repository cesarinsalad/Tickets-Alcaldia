<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Reporte de Ticket - {{ $ticket->code }}</title>
    <style>
        @page {
            margin: 2cm 2cm 3cm;
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 10pt;
            color: #1a1a1a;
            line-height: 1.5;
        }

        .header {
            display: flex;
            align-items: center;
            gap: 16px;
            border-bottom: 3px solid #1e3a5f;
            padding-bottom: 14px;
            margin-bottom: 22px;
        }

        .header-logo {
            flex-shrink: 0;
        }

        .header-logo svg {
            width: 48px;
            height: 48px;
        }

        .header-text {
            flex: 1;
        }

        .header-text .institution {
            font-size: 16pt;
            font-weight: bold;
            color: #1e3a5f;
            letter-spacing: 1.5px;
        }

        .header-text .subtitle {
            font-size: 8pt;
            color: #666;
            margin-top: 2px;
        }

        .header-text .report-type {
            font-size: 9pt;
            color: #1e3a5f;
            margin-top: 6px;
            font-weight: bold;
        }

        h2 {
            font-size: 11pt;
            color: #1e3a5f;
            border-bottom: 1px solid #d0d5dd;
            padding-bottom: 4px;
            margin-top: 20px;
            margin-bottom: 10px;
        }

        .grid-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
        }

        .grid-table td {
            padding: 4px 10px 4px 0;
            vertical-align: top;
            width: 50%;
        }

        .grid-table .label {
            font-size: 8pt;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: block;
            margin-bottom: 1px;
        }

        .grid-table .value {
            font-size: 10pt;
            color: #1a1a1a;
            display: block;
        }

        .badge {
            display: inline-block;
            padding: 3px 12px;
            border-radius: 12px;
            font-size: 8pt;
            font-weight: 600;
        }

        .badge-abierto { background: #dbeafe; color: #1e40af; }
        .badge-en_proceso { background: #ffedd5; color: #9a3412; }
        .badge-pendiente_informacion { background: #fef9c3; color: #854d0e; }
        .badge-resuelto { background: #d1fae5; color: #065f46; }
        .badge-cerrado { background: #e5e7eb; color: #374151; }

        .badge-baja { background: #e5e7eb; color: #374151; }
        .badge-media { background: #fef9c3; color: #854d0e; }
        .badge-alta { background: #ffedd5; color: #9a3412; }
        .badge-critica { background: #fee2e2; color: #991b1b; }

        .description-panel {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 14px;
            font-size: 10pt;
            line-height: 1.6;
        }

        .description-panel .panel-header {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 8px;
            font-size: 8pt;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .comment {
            display: flex;
            gap: 10px;
            margin-bottom: 14px;
            padding: 10px 12px;
            background: #f8fafc;
            border-radius: 6px;
        }

        .comment-internal {
            background: #fffbeb;
        }

        .comment-avatar {
            flex-shrink: 0;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #dbeafe;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .comment-avatar-internal {
            background: #fde68a;
        }

        .comment-body {
            flex: 1;
            min-width: 0;
        }

        .comment-meta {
            display: flex;
            align-items: baseline;
            gap: 8px;
            margin-bottom: 4px;
        }

        .comment-author {
            font-weight: 700;
            font-size: 9pt;
            color: #1e3a5f;
        }

        .comment-date {
            font-size: 7.5pt;
            color: #999;
        }

        .comment-text {
            font-size: 9.5pt;
            line-height: 1.5;
        }

        .internal-label {
            font-size: 8pt;
            color: #d97706;
            font-weight: 600;
            margin-bottom: 8px;
        }

        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 2cm;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 2cm;
            border-top: 1px solid #d0d5dd;
            font-size: 7.5pt;
            color: #999;
        }

        .page-number {
            text-align: right;
        }

        .continuation {
            page-break-before: always;
        }

        .continuation-notice {
            text-align: center;
            font-size: 8pt;
            color: #999;
            font-style: italic;
            margin-bottom: 20px;
            padding: 6px;
            border-top: 1px dashed #d0d5dd;
            border-bottom: 1px dashed #d0d5dd;
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
                <text x="50" y="93" text-anchor="middle" font-size="5" fill="#1e3a5f" font-weight="bold"></text>
            </svg>
        </div>
        <div class="header-text">
            <div class="institution">Alcaldía Municipal</div>
            <div class="subtitle">Isla de Margarita, Estado Nueva Esparta</div>
            <div class="report-type">REPORTE DETALLADO DE TICKET</div>
        </div>
    </div>

    <h2>Información del Ticket</h2>

    <table class="grid-table">
        <tr>
            <td>
                <span class="label">Código</span>
                <span class="value"><strong>{{ $ticket->code }}</strong></span>
            </td>
            <td>
                <span class="label">Estado</span>
                <span class="value">
                    <span class="badge badge-{{ $ticket->status->value }}">
                        {{ $ticket->status->label() }}
                    </span>
                </span>
            </td>
        </tr>
        <tr>
            <td colspan="2">
                <span class="label">Título</span>
                <span class="value">{{ $ticket->title }}</span>
            </td>
        </tr>
        <tr>
            <td>
                <span class="label">Prioridad</span>
                <span class="value">
                    <span class="badge badge-{{ $ticket->priority->value }}">
                        {{ $ticket->priority->label() }}
                    </span>
                </span>
            </td>
            <td>
                <span class="label">Categoría</span>
                <span class="value">{{ $ticket->category->name }}</span>
            </td>
        </tr>
        <tr>
            <td>
                <span class="label">Fecha de creación</span>
                <span class="value">{{ $ticket->entry_date?->format('d/m/Y H:i') ?? $ticket->created_at->format('d/m/Y H:i') }}</span>
            </td>
            <td>
                <span class="label">Fecha de cierre</span>
                <span class="value">{{ $ticket->exit_date?->format('d/m/Y H:i') ?? 'Pendiente' }}</span>
            </td>
        </tr>
        <tr>
            <td>
                <span class="label">Emisión del reporte</span>
                <span class="value">{{ now()->format('d/m/Y H:i') }}</span>
            </td>
            <td>
                <span class="label">Técnico asignado</span>
                <span class="value">{{ $ticket->assigned?->full_name ?? 'Sin asignar' }}</span>
            </td>
        </tr>
    </table>

    <h2>Información del Solicitante</h2>

    <table class="grid-table">
        <tr>
            <td>
                <span class="label">Nombre</span>
                <span class="value">{{ $ticket->creator->full_name }}</span>
            </td>
            <td>
                <span class="label">Departamento</span>
                <span class="value">{{ $ticket->creator->department?->name ?? 'N/A' }}</span>
            </td>
        </tr>
        <tr>
            <td>
                <span class="label">Correo electrónico</span>
                <span class="value">{{ $ticket->creator->email }}</span>
            </td>
            <td>
                <span class="label">Teléfono</span>
                <span class="value">{{ $ticket->creator->phone_number ?? 'N/A' }}</span>
            </td>
        </tr>
    </table>

    <h2>Descripción</h2>

    <div class="description-panel">
        <div class="panel-header">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
            </svg>
            <span>Descripción del problema</span>
        </div>
        {!! nl2br(e($ticket->description)) !!}
    </div>

    @if ($publicComments->isNotEmpty())
    <h2>Comentarios</h2>

    @foreach ($publicComments as $comment)
    <div class="comment">
        <div class="comment-avatar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#1e40af">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 21c0-4 4-7 8-7s8 3 8 7"/>
            </svg>
        </div>
        <div class="comment-body">
            <div class="comment-meta">
                <span class="comment-author">{{ $comment->user->full_name }}</span>
                <span class="comment-date">{{ $comment->created_at->format('d/m/Y H:i') }}</span>
            </div>
            <div class="comment-text">{!! nl2br(e($comment->body)) !!}</div>
        </div>
    </div>
    @endforeach
    @endif

    @if ($internalComments->isNotEmpty())
    <h2>Notas Internas</h2>
    <div class="internal-label">Visible solo para personal autorizado</div>

    @foreach ($internalComments as $comment)
    <div class="comment comment-internal">
        <div class="comment-avatar comment-avatar-internal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#92400e">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 21c0-4 4-7 8-7s8 3 8 7"/>
            </svg>
        </div>
        <div class="comment-body">
            <div class="comment-meta">
                <span class="comment-author">{{ $comment->user->full_name }}</span>
                <span class="comment-date">{{ $comment->created_at->format('d/m/Y H:i') }}</span>
            </div>
            <div class="comment-text">{!! nl2br(e($comment->body)) !!}</div>
        </div>
    </div>
    @endforeach
    @endif

    @if ($publicComments->count() + $internalComments->count() > 5)
    <div class="continuation-notice">Continuación en la siguiente página</div>
    @endif

    <div class="footer">
        <span>Reporte generado el {{ now()->format('d/m/Y H:i') }}</span>
        <span class="page-number">Página {PAGE_NUM} de {PAGE_COUNT}</span>
    </div>
</body>
</html>
