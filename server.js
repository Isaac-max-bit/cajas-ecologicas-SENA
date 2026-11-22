
// ==========================================
// 1. IMPORTAR MODULOS NATIVOS DE NODE.JS
// ==========================================

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

// ==========================================
// 2. CONFIGURACION DEL SERVIDOR
// ==========================================

const PORT = 3000;

const carpetaPublica = path.join(__dirname, 'public');

// Archivos que nuestro servidor puede entregar
const archivos = {
    '/': {
        nombre: 'index.html',
        tipo: 'text/html; charset=utf-8'
    },
    '/styles.css': {
        nombre: 'styles.css',
        tipo: 'text/css; charset=utf-8'
    },
    '/app.js': {
        nombre: 'app.js',
        tipo: 'application/javascript; charset=utf-8'
    }
};

// ==========================================
// 3. FUNCION PARA CALCULAR EL AREA
// ==========================================

function calcularArea(largo, ancho, alto) {

    const area =
        2 * (
            largo * ancho +
            largo * alto +
            ancho * alto
        );

    const reserva = area * 0.10;

    const total = area + reserva;

    return {
        areaCm2: area,
        reservaCm2: reserva,
        totalCm2: total,

        areaM2: area / 10000,
        reservaM2: reserva / 10000,
        totalM2: total / 10000
    };
}

// ==========================================
// 4. FUNCION PARA ENVIAR RESPUESTAS JSON
// ==========================================

function responderJSON(res, codigo, datos) {

    res.writeHead(codigo, {
        'Content-Type': 'application/json; charset=utf-8'
    });

    res.end(JSON.stringify(datos));
}

// ==========================================
// 5. CREAR SERVIDOR
// ==========================================

const servidor = http.createServer((req, res) => {

    const url = new URL(req.url, `http://${req.headers.host}`);

    // --------------------------------------
    // RUTA PARA CALCULAR EL AREA
    // --------------------------------------

    if (req.method === 'POST' && url.pathname === '/api/calcular') {

        let cuerpo = '';

        req.on('data', (fragmento) => {

            cuerpo += fragmento;

            if (cuerpo.length > 10000) {
                responderJSON(res, 413, {
                    error: 'Los datos enviados son demasiado grandes.'
                });

                req.destroy();
            }
        });

        req.on('end', () => {

            try {

                const datos = JSON.parse(cuerpo);

                const largo = datos.largo;
                const ancho = datos.ancho;
                const alto = datos.alto;

                // Validar que sean numeros positivos

                const dimensiones = [largo, ancho, alto];

                const valoresValidos = dimensiones.every(valor =>
                    typeof valor === 'number' &&
                    Number.isFinite(valor) &&
                    valor > 0
                );

                if (!valoresValidos) {

                    return responderJSON(res, 400, {
                        error: 'Las dimensiones deben ser numeros positivos.'
                    });
                }

                // Ejecutar el calculo

                const resultados = calcularArea(
                    largo,
                    ancho,
                    alto
                );

                responderJSON(res, 200, {
                    mensaje: 'Calculo realizado correctamente.',
                    dimensiones: {
                        largo,
                        ancho,
                        alto
                    },
                    resultados
                });

            } catch (error) {

                responderJSON(res, 400, {
                    error: 'Los datos enviados no tienen un formato JSON valido.'
                });
            }
        });

        return;
    }

    // --------------------------------------
    // MOSTRAR LOS ARCHIVOS DEL SITIO WEB
    // --------------------------------------

    if (req.method === 'GET' && archivos[url.pathname]) {

        const archivo = archivos[url.pathname];

        const rutaArchivo = path.join(
            carpetaPublica,
            archivo.nombre
        );

        fs.readFile(rutaArchivo, (error, contenido) => {

            if (error) {

                res.writeHead(500, {
                    'Content-Type': 'text/plain; charset=utf-8'
                });

                return res.end('Error al cargar el archivo.');
            }

            res.writeHead(200, {
                'Content-Type': archivo.tipo
            });

            res.end(contenido);
        });

        return;
    }

    // --------------------------------------
    // RUTA NO ENCONTRADA
    // --------------------------------------

    res.writeHead(404, {
        'Content-Type': 'text/plain; charset=utf-8'
    });

    res.end('Pagina no encontrada.');

});

// ==========================================
// 6. INICIAR SERVIDOR
// ==========================================

servidor.listen(PORT, () => {

    console.log('================================');
    console.log('CALCULADORA ECOLOGICA');
    console.log('================================');
    console.log(`Servidor activo en http://localhost:${PORT}`);

});
