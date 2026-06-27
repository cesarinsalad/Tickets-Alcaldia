import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const FIELD_LABELS = {
    title: 'Título',
    description: 'Descripción',
    body: 'Comentario',
    priority: 'Prioridad',
    category_id: 'Categoría',
    photo: 'Evidencia fotográfica',
    name: 'Nombre',
    last_name: 'Apellido',
    position: 'Cargo',
    phone_number: 'Número de teléfono',
    email: 'Correo electrónico',
    password: 'Contraseña',
    department_id: 'Departamento',
    role: 'Rol',
    physical_address: 'Dirección física',
    head_of_area_id: 'Jefe de área',
    permissions: 'Permisos',
    dashboard_template: 'Plantilla de dashboard',
    sku: 'SKU / Etiqueta municipal',
    brand: 'Marca',
    model: 'Modelo',
    processor: 'Procesador',
    ram_memory: 'Memoria RAM',
    storage_disk: 'Disco de almacenamiento',
    diagnostic: 'Diagnóstico',
    categories: 'Categorías',
    content: 'Contenido',
    attachments: 'Archivos adjuntos',
    confirmed: 'Confirmación',
    current_password: 'Contraseña actual',
};

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 4000,
    timerProgressBar: true,
    customClass: {
        popup: 'swal2-toast-custom',
    },
});

export function toastSuccess(message) {
    Toast.fire({
        icon: 'success',
        title: message,
        background: '#DCFCE7',
        iconColor: '#166534',
    });
}

export function toastError(message) {
    Toast.fire({
        icon: 'error',
        title: message,
        background: '#FEE2E2',
        iconColor: '#991B1B',
    });
}

function translateField(field) {
    return FIELD_LABELS[field] || field;
}

function simplifyMessage(message, field) {
    const label = translateField(field);
    return message
        .replace('The ' + field + ' field is required.', `El campo ${label} es obligatorio.`)
        .replace('The ' + field + ' must be a string.', `El campo ${label} debe ser texto.`)
        .replace('The ' + field + ' must be at least', `El campo ${label} debe tener al menos`)
        .replace('The ' + field + ' must not be greater than', `El campo ${label} no debe exceder`)
        .replace('The ' + field + ' has already been taken.', `El ${label} ya está en uso.`)
        .replace('The ' + field + ' field must be true.', `Debes aceptar ${label}.`)
        .replace('The ' + field + ' field confirmation does not match.', `La confirmación de ${label} no coincide.`)
        .replace('The ' + field + ' field format is invalid.', `El formato de ${label} no es válido.`)
        .replace('The ' + field + ' field', `El campo ${label}`)
        .replace('.', '');
}

export function showValidationErrors(errors) {
    if (!errors || Object.keys(errors).length === 0) return;

    const items = Object.entries(errors)
        .flatMap(([field, messages]) => {
            const label = translateField(field);
            const msgs = Array.isArray(messages) ? messages : [messages];
            return msgs.map((msg) => ({
                label,
                message: simplifyMessage(String(msg), field),
            }));
        });

    if (items.length === 0) return;

    let html = '<ul style="text-align:left;padding-left:1.2rem;margin:0;">';
    items.forEach((item) => {
        html += `<li style="margin-bottom:0.4rem;"><strong>${item.label}:</strong> ${item.message}</li>`;
    });
    html += '</ul>';

    Swal.fire({
        icon: 'warning',
        title: 'Revisa los siguientes campos',
        html,
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#1E3A5F',
        customClass: {
            popup: 'swal2-popup-custom',
        },
    });
}

export function showPasswordAlert(password) {
    Swal.fire({
        icon: 'info',
        title: 'Contraseña generada',
        html: `<p>La contraseña temporal del usuario es:</p>
               <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:6px;padding:12px;margin:12px 0;font-size:1.2rem;font-family:monospace;letter-spacing:1px;">
                 ${password}
               </div>
               <p style="font-size:0.85rem;color:#666;">Copia esta contraseña. No se volverá a mostrar.</p>`,
        confirmButtonText: 'Copiar y cerrar',
        confirmButtonColor: '#1E3A5F',
        didOpen: () => {
            const confirmBtn = Swal.getConfirmButton();
            if (confirmBtn) {
                confirmBtn.addEventListener('click', () => {
                    navigator.clipboard.writeText(password).catch(() => {});
                });
            }
        },
    });
}

export function confirmAction({ title, text, icon = 'warning', confirmText = 'Sí, continuar', cancelText = 'Cancelar' }) {
    return Swal.fire({
        icon,
        title,
        text,
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        confirmButtonColor: icon === 'warning' ? '#991B1B' : '#1E3A5F',
        cancelButtonColor: '#6B7280',
        reverseButtons: true,
    });
}
