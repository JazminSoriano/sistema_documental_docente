document.addEventListener("DOMContentLoaded", () => {
  // Carga inicial
  cargarMapaCurricular("LIN");
});

function seleccionarCarrera(codigo, elemento) {
  document.querySelectorAll("#listaCarrerasMenu li").forEach(li => li.classList.remove("active"));
  if (elemento) elemento.classList.add("active");
  cargarMapaCurricular(codigo);
}

async function cargarMapaCurricular(codigo) {
  const container = document.getElementById("reticulaContainer");
  const footer = document.getElementById("mapaFooter");
  const titulo = document.getElementById("tituloCarreraMap");
  const subtitulo = document.getElementById("subtituloCarreraMap");

  if (!container) return;

  container.innerHTML = `<p style="padding: 30px;"><i class="fa-solid fa-spinner fa-spin"></i> Cargando Malla Curricular ${codigo}...</p>`;

  try {
    const response = await fetch(`${codigo}.json`);
    if (!response.ok) throw new Error("No se encontró " + codigo + ".json");
    const data = await response.json();

    if (titulo) titulo.textContent = `MAPA CURRICULAR`;
    if (subtitulo) subtitulo.textContent = `${data.nombreCarrera} | ${data.plan || 'PLAN 2021-2'}`;

    renderizarReticula(data, container, footer);
  } catch (err) {
    console.error(err);
    container.innerHTML = `
      <div style="background:#f8d7da; color:#721c24; padding:20px; border-radius:8px; margin:20px; width:100%;">
        <i class="fa-solid fa-circle-exclamation"></i> El plan de estudios para <strong>${codigo}</strong> está en preparación. Coloque el archivo <code>${codigo}.json</code> en la raíz.
      </div>`;
    if (footer) footer.innerHTML = "";
  }
}

function renderizarReticula(data, container, footer) {
  container.innerHTML = "";

  // 1. Dibujar Etapas
  data.etapas.forEach(etapa => {
    const etapaDiv = document.createElement("div");
    etapaDiv.className = `etapa-bloque ${etapa.clase || ''}`;

    let semestresHTML = "";

    etapa.semestres.forEach(sem => {
      let materiasHTML = "";

      sem.materias.forEach(mat => {
        materiasHTML += `
          <div class="materia-card-uabc area-${mat.area || 'default'}" title="${mat.nombre}">
            <div class="materia-title">${mat.nombre}</div>
            <div class="materia-grid-hours">
              <div class="grid-header">HC</div>
              <div class="grid-header">HL</div>
              <div class="grid-header">HT</div>
              <div class="grid-header">HPC</div>
              <div class="grid-header">CR</div>
              <div class="grid-val">${mat.hc || '--'}</div>
              <div class="grid-val">${mat.hl || '--'}</div>
              <div class="grid-val">${mat.ht || '--'}</div>
              <div class="grid-val">${mat.hpc || '--'}</div>
              <div class="grid-val cr-val">${mat.cr || '--'}</div>
            </div>
          </div>
        `;
      });

      semestresHTML += `
        <div class="columna-semestre">
          <div class="semestre-badge">${sem.romano || sem.numero}</div>
          <div class="materias-stack">${materiasHTML}</div>
        </div>
      `;
    });

    etapaDiv.innerHTML = `
      <div class="etapa-banner">${etapa.nombre}</div>
      <div class="etapa-semestres">${semestresHTML}</div>
    `;

    container.appendChild(etapaDiv);
  });

  // 2. Dibujar Footer con Leyendas y Descargas
  const creds = data.creditos || { obligatorios: 298, optativos: 52, total: 350 };
  
  footer.innerHTML = `
    <div class="footer-grid-uabc">
      <!-- Áreas de conocimiento -->
      <div class="footer-box areas-box">
        <h4>ÁREAS DE CONOCIMIENTO</h4>
        <div class="areas-pills">
          <span class="pill area-innovacion">INNOVACIÓN</span>
          <span class="pill area-economico">ECONÓMICO-ADMINISTRATIVAS</span>
          <span class="pill area-social">SOCIAL-HUMANISTA</span>
          <span class="pill area-ti">INFRAESTRUCTURA DE TECNOLOGÍA</span>
          <span class="pill area-datos">CIENCIA DE DATOS</span>
        </div>
      </div>

      <!-- Resumen Créditos -->
      <div class="footer-box creditos-box">
        <h4>TOTAL DE CRÉDITOS</h4>
        <p><strong>Obligatorios:</strong> ${creds.obligatorios} créditos *</p>
        <p><strong>Optativos:</strong> ${creds.optativos} créditos</p>
        <p><strong>Total:</strong> ${creds.total} créditos</p>
        <small>${creds.nota || '*Incluye prácticas profesionales'}</small>
      </div>

      <!-- Simbología -->
      <div class="footer-box simbologia-box">
        <h4>SIMBOLOGÍA</h4>
        <p><strong>HC</strong>= Horas Clase | <strong>HL</strong>= Horas Lab</p>
        <p><strong>HT</strong>= Horas Taller | <strong>HPC</strong>= Horas Práctica</p>
        <p><strong>CR</strong>= Créditos Totales</p>
      </div>
    </div>

    <!-- Botón descarga cartas descriptivas -->
    <div class="download-section">
      <button class="btn-download-pdf" onclick="alert('Descargando Cartas Descriptivas para ${data.carrera}...')">
        <i class="fa-solid fa-file-pdf"></i> Download Descriptive Letters for ${data.carrera} 2021
      </button>
    </div>
  `;
}