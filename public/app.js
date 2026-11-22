
// ==========================================
// 1. OBTENER ELEMENTOS DEL HTML
// ==========================================

const formulario = document.getElementById('formulario-calculo');

const mensaje = document.getElementById('mensaje');

// Resultados en centimetros cuadrados
const areaCm = document.getElementById('area-cm');
const reservaCm = document.getElementById('reserva-cm');
const totalCm = document.getElementById('total-cm');

// Resultados en metros cuadrados
const areaM = document.getElementById('area-m');
const reservaM = document.getElementById('reserva-m');
const totalM = document.getElementById('total-m');

// ==========================================
// 2. FORMATEAR RESULTADOS
// ==========================================

function formatearNumero(numero) {

    return new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4
    }).format(numero);

}

// ==========================================
// 3. ESCUCHAR EL ENVIO DEL FORMULARIO
// ==========================================

formulario.addEventListener('submit', async (evento) => {

    // Evitar que la pagina se recargue
    evento.preventDefault();

    // Obtener los valores introducidos
    const largo = Number(document.getElementById('largo').value);

    const ancho = Number(document.getElementById('ancho').value);

    const alto = Number(document.getElementById('alto').value);

    // ======================================
    // 4. VALIDAR LOS DATOS
    // ======================================

    if (
        !Number.isFinite(largo) ||
        !Number.isFinite(ancho) ||
        !Number.isFinite(alto) ||
        largo <= 0 ||
        ancho <= 0 ||
        alto <= 0
    ) {

        mensaje.textContent =
            'Error: introduce dimensiones numéricas mayores que cero.';

        return;
    }

    mensaje.textContent = 'Calculando...';

    try {

        // ==================================
        // 5. ENVIAR DATOS AL SERVIDOR
        // ==================================

        const respuesta = await fetch('/api/calcular', {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                largo,
                ancho,
                alto
            })

        });

        const datos = await respuesta.json();

        // ==================================
        // 6. COMPROBAR LA RESPUESTA
        // ==================================

        if (!respuesta.ok) {

            throw new Error(datos.error || 'No se pudo realizar el calculo.');

        }

        // ==================================
        // 7. MOSTRAR RESULTADOS
        // ==================================

        const resultados = datos.resultados;

        areaCm.textContent =
            `${formatearNumero(resultados.areaCm2)} cm²`;

        reservaCm.textContent =
            `${formatearNumero(resultados.reservaCm2)} cm²`;

        totalCm.textContent =
            `${formatearNumero(resultados.totalCm2)} cm²`;

        areaM.textContent =
            `${formatearNumero(resultados.areaM2)} m²`;

        reservaM.textContent =
            `${formatearNumero(resultados.reservaM2)} m²`;

        totalM.textContent =
            `${formatearNumero(resultados.totalM2)} m²`;

        mensaje.textContent = datos.mensaje;

        mensaje.style.color = '#27623a';

    } catch (error) {

        mensaje.textContent = error.message;

        mensaje.style.color = '#bd3434';

    }

});
