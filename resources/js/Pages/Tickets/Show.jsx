import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Clock, AlertTriangle, CheckCircle, ArrowRight, RotateCcw, UserPlus, FileText, Printer } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import { Select } from '@/Components/ui/select';
import InputError from '@/Components/InputError';

const statusColors = {
    abierto: 'default',
    en_proceso: 'warning',
    pendiente_informacion: 'warning',
    resuelto: 'success',
    cerrado: 'secondary',
};

const priorityColors = {
    baja: 'secondary',
    media: 'warning',
    alta: 'danger',
    critica: 'danger',
};

const priorityLabels = {
    baja: 'Baja',
    media: 'Media',
    alta: 'Alta',
    critica: 'Crítica',
};

export default function Show({ ticket, sla, transitions, technicians, canAssign, canChangePriority, canSeeInternalComments, priorityLabels }) {
    const [comment, setComment] = useState('');
    const [isInternal, setIsInternal] = useState(false);
    const [commentErrors, setCommentErrors] = useState({});
    const [assignTo, setAssignTo] = useState(ticket.assigned_id || '');
    const [transitionStatus, setTransitionStatus] = useState('');
    const [reopenReason, setReopenReason] = useState('');
    const [newPriority, setNewPriority] = useState('');
    const [errors, setErrors] = useState({});

    function submitComment(e) {
        e.preventDefault();
        router.post(route('tickets.comments.store', ticket.id), {
            body: comment,
            is_internal: isInternal,
        }, {
            onError: (err) => setCommentErrors(err),
            onSuccess: () => { setComment(''); setCommentErrors({}); },
        });
    }

    function handleAssign() {
        router.post(route('tickets.assign', ticket.id), {
            assigned_id: assignTo,
        }, {
            onError: (err) => setErrors(err),
        });
    }

    function handleTransition(status) {
        const data = { status };
        if (status === 'abierto' && ticket.status === 'cerrado') {
            data.motivo = reopenReason;
        }
        router.post(route('tickets.transition', ticket.id), data, {
            onError: (err) => setErrors(err),
            onSuccess: () => { setTransitionStatus(''); setReopenReason(''); setErrors({}); },
        });
    }

    function handleChangePriority() {
        if (!newPriority) return;
        router.post(route('tickets.change-priority', ticket.id), {
            priority: newPriority,
        }, {
            onError: (err) => setErrors(err),
            onSuccess: () => { setNewPriority(''); setErrors({}); },
        });
    }

    const slaColor = sla.is_overdue ? 'danger' : sla.progress > 75 ? 'warning' : 'success';

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-semibold text-gray-900">{ticket.code}</h2>
                        <Badge variant={statusColors[ticket.status] || 'default'}>{ticket.status_label}</Badge>
                        <Badge variant={priorityColors[ticket.priority] || 'default'}>
                            {priorityLabels[ticket.priority] || ticket.priority}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={route('tickets.report', ticket.id)} target="_blank">
                            <Button variant="outline" size="sm">
                                <FileText className="h-4 w-4" />
                                Reporte
                            </Button>
                        </Link>
                        {ticket.status === 'resuelto' && (
                            <Link href={route('tickets.receipt', ticket.id)} target="_blank">
                                <Button variant="outline" size="sm">
                                    <Printer className="h-4 w-4" />
                                    Constancia
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={`${ticket.code} - ${ticket.title}`} />

            {Object.keys(errors).length > 0 && (
                <div className="mb-4 rounded-md border border-rojo-urgencia-light bg-rojo-urgencia-light p-3 text-sm text-rojo-urgencia">
                    {Object.values(errors).join(', ')}
                        </div>
                    )}

                    {canChangePriority && (
                        <div className="rounded-lg border border-gris-borde bg-white p-6">
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                Cambiar Prioridad
                            </h3>
                            <Select value={newPriority} onChange={e => setNewPriority(e.target.value)}>
                                <option value="">Seleccionar prioridad</option>
                                {Object.entries(priorityLabels).map(([val, desc]) => (
                                    <option key={val} value={val}>
                                        {val.charAt(0).toUpperCase() + val.slice(1)} — {desc}
                                    </option>
                                ))}
                            </Select>
                            <Button size="sm" className="mt-2 w-full" onClick={handleChangePriority} disabled={!newPriority}>
                                Cambiar Prioridad
                            </Button>
                        </div>
                    )}


            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-lg border border-gris-borde bg-white p-6">
                        <h3 className="text-lg font-semibold text-gray-900">{ticket.title}</h3>
                        <p className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                        {ticket.photo_url && (
                            <div className="mt-4">
                                <img src={ticket.photo_url} alt="Evidencia" className="max-h-96 rounded-md border border-gris-borde" />
                            </div>
                        )}
                    </div>

                    <div className="rounded-lg border border-gris-borde bg-white p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Comentarios</h3>
                        {ticket.comments?.length === 0 ? (
                            <p className="text-sm text-gray-500">No hay comentarios aún.</p>
                        ) : (
                            <div className="space-y-4">
                                {ticket.comments?.map(c => (
                                    <div key={c.id} className={`rounded-lg border p-3 ${c.is_internal ? 'border-yellow-200 bg-yellow-50' : 'border-gris-borde bg-gray-50'}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-medium text-gray-900">{c.user?.full_name ?? c.user?.name}</span>
                                            {c.is_internal && <Badge variant="warning" className="text-xs">Nota interna</Badge>}
                                            <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleString('es-VE')}</span>
                                        </div>
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.body}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <form onSubmit={submitComment} className="mt-4 space-y-3">
                            <Textarea
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                placeholder="Escribe un comentario..."
                                rows={3}
                            />
                            <InputError message={commentErrors.body} />
                            <div className="flex items-center gap-3">
                                {canSeeInternalComments && (
                                    <label className="flex items-center gap-2 text-sm text-gray-600">
                                        <input
                                            type="checkbox"
                                            checked={isInternal}
                                            onChange={e => setIsInternal(e.target.checked)}
                                            className="rounded border-gray-300"
                                        />
                                        Nota interna
                                    </label>
                                )}
                                <Button type="submit" size="sm" disabled={!comment.trim()}>
                                    Comentar
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-lg border border-gris-borde bg-white p-6">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Detalles</h3>
                        <dl className="space-y-3 text-sm">
                            <div>
                                <dt className="text-gray-500">Creado por</dt>
                                <dd className="text-gray-900">{ticket.creator?.full_name ?? ticket.creator?.name}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Departamento</dt>
                                <dd className="text-gray-900">{ticket.department?.name || '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Contacto</dt>
                                <dd className="text-gray-900">{ticket.creator?.phone_number || ticket.creator?.email}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Categoría</dt>
                                <dd className="text-gray-900">{ticket.category?.name || '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Asignado a</dt>
                                <dd className="text-gray-900">{(ticket.assigned?.full_name ?? ticket.assigned?.name) || 'Sin asignar'}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Fecha de ingreso</dt>
                                <dd className="text-gray-900">{new Date(ticket.entry_date).toLocaleString('es-VE')}</dd>
                            </div>
                            {ticket.exit_date && (
                                <div>
                                    <dt className="text-gray-500">Fecha de egreso</dt>
                                    <dd className="text-gray-900">{new Date(ticket.exit_date).toLocaleString('es-VE')}</dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    {sla && (
                        <div className="rounded-lg border border-gris-borde bg-white p-6">
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                SLA
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Respuesta</span>
                                    <span className="font-medium">{sla.response_deadline ? new Date(sla.response_deadline).toLocaleString('es-VE') : '—'}</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-400">
                                    <span>Plazo de respuesta</span>
                                    <span>{sla.response_minutes >= 60 ? (sla.response_minutes / 60) + 'h' : sla.response_minutes + 'min'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Resolución</span>
                                    <span className="font-medium">{sla.resolution_deadline ? new Date(sla.resolution_deadline).toLocaleString('es-VE') : '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Horas totales</span>
                                    <span className="font-medium">{sla.total_hours}h</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Progreso</span>
                                    <Badge variant={slaColor}>{sla.progress}%</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Horas restantes</span>
                                    <span className="font-medium">{sla.remaining_hours}h</span>
                                </div>
                                {sla.is_overdue && (
                                    <div className="flex items-center gap-1 text-rojo-urgencia">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span className="text-xs font-medium">SLA de resolución vencido</span>
                                    </div>
                                )}
                                {sla.is_response_overdue && !sla.is_overdue && (
                                    <div className="flex items-center gap-1 text-amarillo-advertencia">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span className="text-xs font-medium">SLA de respuesta vencido</span>
                                    </div>
                                )}
                            </div>
                            <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${
                                        sla.is_overdue ? 'bg-rojo-urgencia' : sla.progress > 75 ? 'bg-yellow-500' : 'bg-verde-exito'
                                    }`}
                                    style={{ width: `${Math.min(sla.progress, 100)}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {canAssign && (
                        <div className="rounded-lg border border-gris-borde bg-white p-6">
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                                <UserPlus className="h-4 w-4" />
                                Asignar Técnico
                            </h3>
                            <Select value={assignTo} onChange={e => setAssignTo(e.target.value)}>
                                <option value="">Seleccionar técnico</option>
                                {technicians?.map(t => (
                                    <option key={t.id} value={t.id}>{t.full_name ?? t.name}</option>
                                ))}
                            </Select>
                            <Button size="sm" className="mt-2 w-full" onClick={handleAssign} disabled={!assignTo}>
                                Asignar
                            </Button>
                        </div>
                    )}

                    {transitions?.length > 0 && (
                        <div className="rounded-lg border border-gris-borde bg-white p-6">
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                                <ArrowRight className="h-4 w-4" />
                                Cambiar Estado
                            </h3>
                            <div className="space-y-2">
                                {transitions.map(t => (
                                    <div key={t.value}>
                                        {t.value === 'abierto' && ticket.status === 'cerrado' ? (
                                            <div className="space-y-2">
                                                <Textarea
                                                    placeholder="Motivo de la reapertura (obligatorio)"
                                                    value={reopenReason}
                                                    onChange={e => setReopenReason(e.target.value)}
                                                    rows={2}
                                                    className="text-sm"
                                                />
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full"
                                                    onClick={() => handleTransition(t.value)}
                                                    disabled={!reopenReason.trim()}
                                                >
                                                    <RotateCcw className="h-4 w-4" />
                                                    Reabrir Ticket
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                key={t.value}
                                                variant="outline"
                                                size="sm"
                                                className="w-full justify-start"
                                                onClick={() => handleTransition(t.value)}
                                            >
                                                {t.value === 'en_proceso' && <Clock className="h-4 w-4" />}
                                                {t.value === 'pendiente_informacion' && <AlertTriangle className="h-4 w-4" />}
                                                {t.value === 'resuelto' && <CheckCircle className="h-4 w-4" />}
                                                {t.value === 'cerrado' && <CheckCircle className="h-4 w-4" />}
                                                {t.label}
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
