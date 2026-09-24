/* =========================================================
   SCRIPT.JS — IEEE UDB
   Menú, contadores animados, gráficos (canvas) y tabla.
   DATOS REALES: sociedades IEEE UDB (12) + Rama.
   EDITA EL OBJETO "datos" PARA CAMBIAR LOS NÚMEROS.
   ========================================================= */

"use strict";

/* ---------------------------------------------------------
   1. DATOS (tabla de sociedades — actualiza aquí)
--------------------------------------------------------- */

const datos = {
    // sigla, actividades y miembros por sociedad
    sociedades: [
        { sigla: "AESS",   nombre: "Aerospace & Electronic Systems", actividades: 3,  miembros: 12 },
        { sigla: "CS",     nombre: "Computer Society",               actividades: 4, miembros: 39 },
        { sigla: "COMSOC", nombre: "Communications Society",         actividades: 1,  miembros: 6  },
        { sigla: "CASS",   nombre: "Circuits & Systems Society",     actividades: 1,  miembros: 20 },
        { sigla: "EDS",    nombre: "Electron Devices Society",       actividades: 4, miembros: 46 },
        { sigla: "EMBS",   nombre: "Engineering in Medicine & Biology", actividades: 10, miembros: 39 },
        { sigla: "IAS",    nombre: "Industry Applications Society",  actividades: 7, miembros: 27 },
        { sigla: "PES",    nombre: "Power & Energy Society",         actividades: 2,  miembros: 21 },
        { sigla: "RAS",    nombre: "Robotics & Automation Society",  actividades: 15, miembros: 23 },
        { sigla: "SIGHT",  nombre: "Special Interest Group on Humanitarian Tech", actividades: 9, miembros: 50 },
        { sigla: "TEMS",   nombre: "Technology & Engineering Management", actividades: 1, miembros: 26 },
        { sigla: "WIE",    nombre: "Women in Engineering",           actividades: 11, miembros: 62 }
    ],

    // Fila "Rama" de la tabla original
    rama: { sigla: "Rama", nombre: "Rama estudiantil IEEE UDB", actividades: 2, miembros: 167 },

    // Colaboraciones 2026 detectadas en Instagram, clasificadas por área.
    // Base: barrido de @ieeeudb (65 posts) + 11 capítulos del linktree (220 posts) = 285 posts de 2026.
    // Agrega o quita filas aquí para mantener el dato al día.
    distribucion: [
        { etiqueta: "Energía y ambiente", valor: 4, empresas: "Enerwire · Disseti Green Engineering · Inversiones Energéticas (INEEL) · Quantum (vehículos eléctricos)", color: "#00A3E0" },
        { etiqueta: "Manufactura e industrial", valor: 5, empresas: "ARBEX · Grupo IDSA · PROMAQ · Compres · Ingenio El Ángel", color: "#4DBDFF" },
        { etiqueta: "Aliados estudiantiles", valor: 5, empresas: "ASEA · ASAUDB · ASETEAM · IEEE UCA · Red WIE Latam", color: "#B9EAFF" },
        { etiqueta: "Tecnología y software", valor: 2, empresas: "SVNet · Kreali", color: "#7ED4FF" },
        { etiqueta: "Aeronáutica", valor: 1, empresas: "AEROMAN", color: "#00D4FF" },
        { etiqueta: "Salud biomédica", valor: 1, empresas: "Nipro Medical El Salvador", color: "#CFEDFF" },
        { etiqueta: "Gestión pública", valor: 1, empresas: "COMPRASAL", color: "#0077B6" }
    ],
    tipos: [
        { etiqueta: "Admin.",       valor: 22 },
        { etiqueta: "Humanit.",     valor: 4 },
        { etiqueta: "No téc.",      valor: 8 },
        { etiqueta: "Pre-U STEM",   valor: 1 },
        { etiqueta: "Profes.",      valor: 10 },
        { etiqueta: "Técnicas",     valor: 25 }
    ],
    colaboraciones2026: 19
};

/* Totales calculados */
const TOTAL_ACTIVIDADES = datos.sociedades.reduce((s, d) => s + d.actividades, 0) + (datos.rama.actividades || 0);   // 68 capitulos + 2 rama = 70

/* ---------------------------------------------------------
   2. MENÚ MÓVIL
--------------------------------------------------------- */

const nav = document.getElementById("nav");
const navBoton = document.getElementById("navBoton");

navBoton.addEventListener("click", () => {
    const abierto = nav.classList.toggle("abierto");
    navBoton.setAttribute("aria-expanded", String(abierto));
});

nav.querySelectorAll(".nav-enlace").forEach(enlace => {
    enlace.addEventListener("click", () => {
        nav.classList.remove("abierto");
        navBoton.setAttribute("aria-expanded", "false");
    });
});

/* ---------------------------------------------------------
   3. ENLACE ACTIVO SEGÚN SECCIÓN VISIBLE
--------------------------------------------------------- */

const secciones = [...document.querySelectorAll("main section[id]")];
const enlaces = [...document.querySelectorAll(".nav-enlace")];

const observadorSecciones = new IntersectionObserver(
    entradas => {
        entradas.forEach(entrada => {
            if (!entrada.isIntersecting) return;
            const id = entrada.target.id;
            enlaces.forEach(enlace => {
                enlace.classList.toggle("activo", enlace.getAttribute("href") === "#" + id);
            });
        });
    },
    { rootMargin: "-45% 0px -50% 0px" }
);

secciones.forEach(seccion => observadorSecciones.observe(seccion));

/* ---------------------------------------------------------
   4. CONTADORES ANIMADOS
--------------------------------------------------------- */

function animarContador(elemento) {
    const destino = Number(elemento.dataset.contador) || 0;
    const duracion = 1200;
    const inicio = performance.now();

    function paso(ahora) {
        const progreso = Math.min((ahora - inicio) / duracion, 1);
        const suave = 1 - Math.pow(1 - progreso, 3); // easeOutCubic
        elemento.textContent = Math.round(destino * suave).toLocaleString("es");
        if (progreso < 1) requestAnimationFrame(paso);
    }

    requestAnimationFrame(paso);
}

const observadorContadores = new IntersectionObserver(
    entradas => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                animarContador(entrada.target);
                observadorContadores.unobserve(entrada.target);
            }
        });
    },
    { threshold: 0.6 }
);

document.querySelectorAll("[data-contador]").forEach(el => observadorContadores.observe(el));

/* ---------------------------------------------------------
   5. UTILIDADES DE CANVAS
--------------------------------------------------------- */

function prepararCanvas(canvas) {
    const ratio = window.devicePixelRatio || 1;
    const anchoCSS = canvas.clientWidth || canvas.width;
    const altoCSS = canvas.clientHeight || (canvas.getAttribute("height") ? Number(canvas.getAttribute("height")) : 240);

    canvas.width = anchoCSS * ratio;
    canvas.height = altoCSS * ratio;
    canvas.style.height = altoCSS + "px";

    const ctx = canvas.getContext("2d");
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, anchoCSS, altoCSS);

    return { ctx, ancho: anchoCSS, alto: altoCSS };
}

function dibujarRejilla(ctx, ancho, alto, margen, maximo, divisiones) {
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "11px Segoe UI, sans-serif";
    ctx.lineWidth = 1;

    for (let i = 0; i <= divisiones; i++) {
        const y = margen + ((alto - 2 * margen) / divisiones) * i;
        const valor = Math.round(maximo - (maximo / divisiones) * i);

        ctx.beginPath();
        ctx.moveTo(margen, y);
        ctx.lineTo(ancho, y);
        ctx.stroke();

        ctx.textAlign = "right";
        ctx.fillText(String(valor), margen - 8, y + 4);
    }
}

/* Barras genéricas: recibe [{etiqueta, valor}] */
function dibujarBarras(canvasId, serie, opciones = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const { ctx, ancho, alto } = prepararCanvas(canvas);
    const margen = 34;
    const maximo = Math.max(...serie.map(d => d.valor)) * 1.1 || 1;

    dibujarRejilla(ctx, ancho, alto, margen, maximo, 4);

    const areaGrafica = ancho - margen;
    const separacion = areaGrafica / serie.length;
    const anchoBarra = separacion * 0.62;

    serie.forEach((d, i) => {
        const altura = ((alto - 2 * margen) / maximo) * d.valor;
        const x = margen + separacion * i + (separacion - anchoBarra) / 2;
        const y = alto - margen - altura;

        const gradiente = ctx.createLinearGradient(0, y, 0, alto - margen);
        gradiente.addColorStop(0, opciones.colorInicio || "#4DBDFF");
        gradiente.addColorStop(1, opciones.colorFin || "#00A3E0");

        ctx.fillStyle = gradiente;
        ctx.beginPath();
        const r = Math.min(6, anchoBarra / 2);
        ctx.moveTo(x, alto - margen);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.lineTo(x + anchoBarra - r, y);
        ctx.quadraticCurveTo(x + anchoBarra, y, x + anchoBarra, y + r);
        ctx.lineTo(x + anchoBarra, alto - margen);
        ctx.closePath();
        ctx.fill();

        // Valor encima de la barra
        if (opciones.mostrarValor) {
            ctx.fillStyle = "rgba(255,255,255,0.85)";
            ctx.font = "600 10px Segoe UI, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(String(d.valor), x + anchoBarra / 2, y - 6);
        }

        // Etiqueta del eje X
        ctx.fillStyle = "rgba(255,255,255,0.65)";
        ctx.font = "10.5px Segoe UI, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(d.etiqueta, x + anchoBarra / 2, alto - margen + 16);
    });
}

/* ---------------------------------------------------------
   6. GRÁFICO — actividades por sociedad
--------------------------------------------------------- */

function graficoActividades() {
    dibujarBarras(
        "graficoBarras",
        datos.sociedades.concat([{ sigla: "Rama", actividades: datos.rama.actividades }]).map(s => ({ etiqueta: s.sigla, valor: s.actividades })),
        { mostrarValor: true, colorInicio: "#4DBDFF", colorFin: "#00A3E0" }
    );
}

/* ---------------------------------------------------------
   7. GRÁFICO — miembros por sociedad
--------------------------------------------------------- */

function graficoMiembros() {
    dibujarBarras(
        "graficoLinea",
        datos.sociedades.map(s => ({ etiqueta: s.sigla, valor: s.miembros })),
        { mostrarValor: true, colorInicio: "#7ED4FF", colorFin: "#00629B" }
    );
}

/* ---------------------------------------------------------
   7b. GRÁFICO — actividades por tipo
--------------------------------------------------------- */

function graficoTipos() {
    dibujarBarras(
        "graficoTipos",
        datos.tipos,
        { mostrarValor: true, colorInicio: "#00A3E0", colorFin: "#003A66" }
    );
}

/* ---------------------------------------------------------
   8. GRÁFICO DE DONA — rama vs. sociedades
--------------------------------------------------------- */

function graficoDonut() {
    const canvas = document.getElementById("graficoDonut");
    if (!canvas) return;

    const { ctx } = prepararCanvas(canvas);
    const centro = canvas.clientWidth / 2;
    const radio = centro - 14;
    const grosor = 26;
    const total = datos.distribucion.reduce((suma, d) => suma + d.valor, 0) || 1;

    let angulo = -Math.PI / 2;

    datos.distribucion.forEach(d => {
        const franja = (d.valor / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(centro, centro, radio, angulo, angulo + franja);
        ctx.strokeStyle = d.color;
        ctx.lineWidth = grosor;
        ctx.lineCap = "butt";
        ctx.stroke();
        angulo += franja;
    });

    // Centro
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.font = "800 26px Segoe UI, sans-serif";
    ctx.fillText(String(total), centro, centro + 2);
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "10px Segoe UI, sans-serif";
    ctx.fillText("colaboraciones 2026", centro, centro + 20);

    // Leyenda (área + empresa)
    const leyenda = document.getElementById("leyendaDonut");
    leyenda.innerHTML = datos.distribucion
        .map(
            d => `
            <li>
                <span class="punto-leyenda" style="background:${d.color}"></span>
                <span class="leyenda-texto">
                    <span class="leyenda-nombre">${d.etiqueta}</span>
                    <small>${d.empresas || ""}</small>
                </span>
                <span class="valor">${d.valor}</span>
            </li>`
        )
        .join("");
}

/* ---------------------------------------------------------
   9. TABLA — detalle por sociedad
--------------------------------------------------------- */

function pintarTabla() {
    const cuerpo = document.querySelector("#tablaActividades tbody");
    if (!cuerpo) return;

    const filas = datos.sociedades.map(
        s => `
            <tr>
                <td title="${s.nombre}">${s.sigla}</td>
                <td>${s.actividades}</td>
                <td>${s.miembros}</td>
            </tr>`
    );

    // Fila de la rama + totales
    filas.push(`
        <tr>
            <td><strong>${datos.rama.sigla}</strong></td>
            <td>${datos.rama.actividades}</td>
            <td>${datos.rama.miembros}</td>
        </tr>`);

    filas.push(`
        <tr class="total">
            <td><strong>Total</strong></td>
            <td><strong>${TOTAL_ACTIVIDADES}</strong></td>
            <td>—</td>
        </tr>`);

    cuerpo.innerHTML = filas.join("");
}

/* ---------------------------------------------------------
   10. CARRUSEL DE ACTIVIDADES
--------------------------------------------------------- */

function montarCarrusel(id) {
    const cont = document.getElementById(id);
    if (!cont) return;

    const pista = cont.querySelector(".carrusel-pista");
    const puntos = cont.querySelector(".carrusel-puntos");
    const total = pista.children.length;
    let indice = 0;
    let temporizador;

    for (let n = 0; n < total; n++) {
        const punto = document.createElement("button");
        punto.type = "button";
        punto.className = "punto";
        punto.setAttribute("aria-label", "Ir a la actividad " + (n + 1));
        punto.addEventListener("click", () => { irA(n); reiniciar(); });
        puntos.appendChild(punto);
    }

    function irA(n) {
        indice = (n + total) % total;
        pista.style.transform = "translateX(-" + indice * 100 + "%)";
        [...puntos.children].forEach((p, k) => p.classList.toggle("activo", k === indice));
    }

    function reiniciar() {
        clearInterval(temporizador);
        temporizador = setInterval(() => irA(indice + 1), 5000);
    }

    cont.querySelector(".anterior").addEventListener("click", () => { irA(indice - 1); reiniciar(); });
    cont.querySelector(".siguiente").addEventListener("click", () => { irA(indice + 1); reiniciar(); });
    cont.addEventListener("mouseenter", () => clearInterval(temporizador));
    cont.addEventListener("mouseleave", reiniciar);

    irA(0);
    reiniciar();
}

["carruselActividades", "carruselEvento"].forEach(montarCarrusel);

/* ---------------------------------------------------------
   12. INICIO
--------------------------------------------------------- */

const anioEl = document.getElementById("anio");
if (anioEl) anioEl.textContent = new Date().getFullYear();

function dibujarTodo() {
    graficoActividades();
    graficoMiembros();
    graficoTipos();
    graficoDonut();
}

dibujarTodo();
pintarTabla();

let redimension;
window.addEventListener("resize", () => {
    clearTimeout(redimension);
    redimension = setTimeout(dibujarTodo, 180);
});
