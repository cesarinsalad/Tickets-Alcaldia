import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Clock, AlertTriangle, CheckCircle, ArrowRight, RotateCcw, UserPlus, FileText, Printer, FolderTree, HelpCircle, Wrench } from 'lucide-react';
import RelativeTime from '@/Components/RelativeTime';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import { Select } from '@/Components/ui/select';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/Components/ui/tooltip';
import GenerateReportModal from '@/Components/GenerateReportModal';
import InputError from '@/Components/InputError';

const statusColors = {
    abierto: 'default',
    en_proceso: 'warning',
    pendiente_informacion: 'warning',
    resuelto: 'success',
    cerrado: 'secondary',
};

const priorityColors = {
    sin_definir: 'gray',
    baja: 'secondary',
    media: 'warning',
    alta: 'danger',
    critica: 'danger',
};

const priorityLabels = {
    sin_definir: 'Sin definir',
    baja: 'Baja',
    media: 'Media',
    alta: 'Alta',
    critica: 'Crítica',
};

export default function Show({ ticket, sla, transitions, technicians, canAssign, canChangePriority, canChangeCategory, canUploadPhoto, canSeeInternalComments, canGenerateReport, categories, priorityLabels }) {
    const [comment, setComment] = useState('');
    const [commentPhoto, setCommentPhoto] = useState(null);
    const [commentPhotoPreview, setCommentPhotoPreview] = useState(null);
    const [isInternal, setIsInternal] = useState(false);
    const [commentErrors, setCommentErrors] = useState({});
    const [assignTo, setAssignTo] = useState(ticket.assigned_id || '');
    const [transitionStatus, setTransitionStatus] = useState('');
    const [reopenReason, setReopenReason] = useState('');
    const [newPriority, setNewPriority] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [errors, setErrors] = useState({});
    const [showInterventionModal, setShowInterventionModal] = useState(false);

    function submitComment(e) {
        e.preventDefault();
        const formData = new FormData();
        formData.append('body', comment);
        formData.append('is_internal', isInternal ? '1' : '0');
        if (commentPhoto) formData.append('photo', commentPhoto);

        router.post(route('tickets.comments.store', ticket.id), formData, {
            onError: (err) => setCommentErrors(err),
            onSuccess: () => { setComment(''); setCommentPhoto(null); setCommentPhotoPreview(null); setCommentErrors({}); },
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

    function handleChangeCategory() {
        if (!newCategory) return;
        router.post(route('tickets.change-category', ticket.id), {
            category_id: newCategory,
        }, {
            onError: (err) => setErrors(err),
            onSuccess: () => { setNewCategory(''); setErrors({}); },
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
                    {canGenerateReport && (
                    <div className="flex items-center gap-2">
                        <a href={route('tickets.report', ticket.id)} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm">
                                <FileText className="h-4 w-4" />
                                Reporte
                            </Button>
                        </a>
                        {['resuelto', 'cerrado'].includes(ticket.status) && (
                            <a href={route('tickets.receipt', ticket.id)} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="sm">
                                    <Printer className="h-4 w-4" />
                                    Constancia
                                </Button>
                            </a>
                        )}
                        <Button variant="outline" size="sm" onClick={() => setShowInterventionModal(true)}>
                            <Wrench className="h-4 w-4" />
                            Retiro de Equipo
                        </Button>
                    </div>
                    )}
                </div>
            }
        >
            <Head title={`${ticket.code} - ${ticket.title}`} />

            {Object.keys(errors).length > 0 && (
                <div className="mb-4 rounded-md border border-rojo-urgencia-light bg-rojo-urgencia-light p-3 text-sm text-rojo-urgencia">
                    {Object.values(errors).join(', ')}
                        </div>
                    )}

                    {(canChangePriority || canChangeCategory) && (
                        <div className="rounded-lg border border-gris-borde bg-white p-6 mb-6">
                            <div className={`grid ${canChangePriority && canChangeCategory ? 'grid-cols-1 sm:grid-cols-2 gap-4' : 'grid-cols-1'}`}>
                                {canChangePriority && (
                                    <div>
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
                                {canChangeCategory && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                                            <FolderTree className="h-4 w-4" />
                                            Cambiar Categoría
                                        </h3>
                                        <Select value={newCategory} onChange={e => setNewCategory(e.target.value)}>
                                            <option value="">Seleccionar categoría</option>
                                            {categories?.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </Select>
                                        <Button size="sm" className="mt-2 w-full" onClick={handleChangeCategory} disabled={!newCategory}>
                                            Cambiar Categoría
                                        </Button>
                                    </div>
                                )}
                            </div>
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
                                        {c.photo_url && (
                                            <img src={c.photo_url} alt="Evidencia adjunta" className="mt-2 max-h-64 rounded-md border border-gris-borde" />
                                        )}
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
                            {canUploadPhoto && (
                                <div>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={e => {
                                            const file = e.target.files?.[0];
                                            setCommentPhoto(file || null);
                                            setCommentPhotoPreview(file ? URL.createObjectURL(file) : null);
                                        }}
                                        className="text-sm text-gray-600 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                                    />
                                    {commentPhotoPreview && (
                                        <img src={commentPhotoPreview} alt="Vista previa" className="mt-2 max-h-32 rounded-md border border-gris-borde" />
                                    )}
                                    <InputError message={commentErrors.photo} />
                                </div>
                            )}
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
                                <Button type="submit" size="sm" disabled={!comment.trim() && !commentPhoto}>
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
                                <dd className="text-gray-900">{ticket.category?.name || 'Sin categoría'}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Asignado a</dt>
                                <dd className="text-gray-900">{(ticket.assigned?.full_name ?? ticket.assigned?.name) || 'Sin asignar'}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500 inline-flex items-center gap-1">
                                    Fecha de creación
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <HelpCircle className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Momento en que el solicitante registró el ticket en el sistema.
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </dt>
                                <dd className="text-gray-900">{new Date(ticket.entry_date).toLocaleString('es-VE')}</dd>
                            </div>
                            {ticket.responded_at && (
                                <div>
                                    <dt className="text-gray-500 inline-flex items-center gap-1">
                                        Fecha de respuesta
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    Momento en que un administrador asignó el ticket a un técnico.
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </dt>
                                    <dd className="text-gray-900">{new Date(ticket.responded_at).toLocaleString('es-VE')}</dd>
                                </div>
                            )}
                            {ticket.in_progress_at && (
                                <div>
                                    <dt className="text-gray-500 inline-flex items-center gap-1">
                                        Inicio de atención
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    Momento en que el técnico comenzó a trabajar en la solución.
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </dt>
                                    <dd className="text-gray-900">{new Date(ticket.in_progress_at).toLocaleString('es-VE')}</dd>
                                </div>
                            )}
                            {ticket.resolved_at && (
                                <div>
                                    <dt className="text-gray-500 inline-flex items-center gap-1">
                                        Fecha de resolución
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    Momento en que el técnico marcó el ticket como resuelto.
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </dt>
                                    <dd className="text-gray-900">{new Date(ticket.resolved_at).toLocaleString('es-VE')}</dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    {sla && (
                        <div className="rounded-lg border border-gris-borde bg-white p-6">
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Tiempos de atención
                            </h3>
                            <div className="space-y-4 text-sm">
                                <div className="mb-3">
                                    {ticket.status === 'resuelto' || ticket.status === 'cerrado' ? (
                                        <div className="flex items-start gap-3">
                                            <label className="text-sm text-gray-400 shrink-0">Responder antes de:</label>
                                            {sla.response_deadline && ticket.exit_date ? (
                                                new Date(ticket.exit_date) <= new Date(sla.response_deadline) ? (
                                                    <span className="inline-flex items-center gap-1 text-sm text-green-700 font-medium">
                                                        <CheckCircle className="h-3.5 w-3.5" /> A tiempo
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-sm text-amber-600 font-medium">
                                                        <AlertTriangle className="h-3.5 w-3.5" /> Tardío
                                                    </span>
                                                )
                                            ) : (
                                                <span className="text-sm text-gray-400">—</span>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-start gap-3">
                                            <span className="text-sm text-gray-400 shrink-0">Responder antes de:</span>
                                            <RelativeTime
                                                deadline={sla.response_deadline}
                                                entryDate={ticket.entry_date}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    {ticket.status === 'resuelto' || ticket.status === 'cerrado' ? (
                                        <div className="flex items-start gap-3">
                                            <label className="text-sm text-gray-400 shrink-0">Resolución esperada:</label>
                                            {sla.resolution_deadline && ticket.exit_date ? (
                                                new Date(ticket.exit_date) <= new Date(sla.resolution_deadline) ? (
                                                    <span className="inline-flex items-center gap-1 text-sm text-green-700 font-medium">
                                                        <CheckCircle className="h-3.5 w-3.5" /> A tiempo
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-sm text-amber-600 font-medium">
                                                        <AlertTriangle className="h-3.5 w-3.5" /> Tardío
                                                    </span>
                                                )
                                            ) : (
                                                <span className="text-sm text-gray-400">—</span>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-start gap-3">
                                            <span className="text-sm text-gray-400 shrink-0">Resolución esperada:</span>
                                            <RelativeTime
                                                deadline={sla.resolution_deadline}
                                                entryDate={ticket.entry_date}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Tiempo máximo asignado</span>
                                    <span className="font-medium">{sla.total_hours}h</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Avance</span>
                                    <Badge variant={slaColor}>{sla.progress}%</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Tiempo restante</span>
                                    <span className="font-medium">{sla.remaining_hours}h</span>
                                </div>
                                {sla.is_overdue && (
                                    <div className="flex items-center gap-1 text-rojo-urgencia">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span className="text-xs font-medium">Tiempo de solución vencido</span>
                                    </div>
                                )}
                                {sla.is_response_overdue && !sla.is_overdue && (
                                    <div className="flex items-center gap-1 text-amarillo-advertencia">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span className="text-xs font-medium">Tiempo de respuesta vencido</span>
                                    </div>
                                )}
                            </div>
                            <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${
                                        sla.is_overdue ? 'bg-rojo-urgencia' : sla.progress > 70 ? 'bg-yellow-500' : 'bg-verde-exito'
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
            {showInterventionModal && (
                <GenerateReportModal
                    ticket={ticket}
                    onClose={() => setShowInterventionModal(false)}
                />
            )}
        </AuthenticatedLayout>
    );
}
