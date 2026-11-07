document.addEventListener("DOMContentLoaded", () => {
  // 1. Escuchar eventos de cambio en filtros
  const selectSemestre = document.getElementById("filterSemestre");
  const selectCarrera = document.getElementById("filterCarrera") || document.getElementById("filterArea");
  const selectTurno = document.getElementById("filterTurno");
  const selectEstatus = document.getElementById("filterEstatus");
  const inputSearch = document.getElementById("inputTableSearch");

  if (selectSemestre) selectSemestre.addEventListener("change", aplicarFiltrosGlobales);
  if (selectCarrera) selectCarrera.addEventListener("change", aplicarFiltrosGlobales);
  if (selectTurno) selectTurno.addEventListener("change", aplicarFiltrosGlobales);
  if (selectEstatus) selectEstatus.addEventListener("change", aplicarFiltrosGlobales);
  if (inputSearch) inputSearch.addEventListener("input", aplicarFiltrosGlobales);

  // 2. Primera carga al iniciar
  aplicarFiltrosGlobales();
});

function aplicarFiltrosGlobales() {
  if (typeof mockDashboardData === "undefined" || !mockDashboardData.registros) {
    console.error("No se encontraron los datos de mockDashboardData en js/data.js");
    return;
  }

  // Leer valores seleccionados
  const semestreSel = (document.getElementById("filterSemestre")?.value || "Todos").trim().toLowerCase();
  const carreraSel = (document.getElementById("filterCarrera")?.value || document.getElementById("filterArea")?.value || "Todas").trim().toLowerCase();
  const turnoSel = (document.getElementById("filterTurno")?.value || "Todos").trim().toLowerCase();
  const estatusSel = (document.getElementById("filterEstatus")?.value || "Todos").trim().toLowerCase();
  const textoBusqueda = (document.getElementById("inputTableSearch")?.value || "").trim().toLowerCase();

  // Filtrado flexible sobre los 30 registros
  const registrosFiltrados = mockDashboardData.registros.filter(item => {
    const itemCarrera = (item.carrera || item.area || "").trim().toLowerCase();
    const itemSemestre = (item.semestre || "").trim().toLowerCase();
    const itemTurno = (item.turno || "").trim().toLowerCase();
    const itemEstatus = (item.estatus || "").trim().toLowerCase();
    const itemDocente = (item.docente || "").trim().toLowerCase();
    const itemMateria = (item.materia || "").trim().toLowerCase();
    const itemDocumento = (item.documento || "").trim().toLowerCase();

    const coincideCarrera = (carreraSel === "todas" || carreraSel === "todos") || (itemCarrera === carreraSel);
    const coincideSemestre = (semestreSel === "todos") || (itemSemestre === semestreSel);
    const coincideTurno = (turnoSel === "todos") || (itemTurno === turnoSel);
    const coincideEstatus = (estatusSel === "todos") || (itemEstatus === estatusSel);
    const coincideTexto = !textoBusqueda || itemDocente.includes(textoBusqueda) || itemMateria.includes(textoBusqueda) || itemDocumento.includes(textoBusqueda);

    return coincideCarrera && coincideSemestre && coincideTurno && coincideEstatus && coincideTexto;
  });

  // Renderizado dinámico de la interfaz
  renderizarTabla(registrosFiltrados);
  actualizarKPIs(registrosFiltrados);

  if (typeof actualizarGraficos === "function") {
    actualizarGraficos(registrosFiltrados);
  }
}

function renderizarTabla(registros) {
  const tbody = document.getElementById("tableBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!registros || registros.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; padding: 24px; color: #666;">
          <i class="fa-solid fa-folder-open"></i> No se encontraron registros que coincidan con los filtros seleccionados.
        </td>
      </tr>`;
    return;
  }

  registros.forEach(item => {
    let badgeClass = "status-badge";
    const st = (item.estatus || "").toLowerCase();

    if (st === "completo") badgeClass += " status-complete";
    else if (st === "en progreso") badgeClass += " status-progress";
    else badgeClass += " status-pending";

    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td><input type="checkbox" value="${item.id}"></td>
      <td><strong>${item.docente || 'N/A'}</strong></td>
      <td>${item.materia || 'N/A'}</td>
      <td>${item.documento || 'N/A'}</td>
      <td><span class="${badgeClass}">${item.estatus || 'Pendiente'}</span></td>
      <td>${item.fechaLimite || '-'}</td>
      <td>${item.fechaEntrega || '-'}</td>
      <td>
        <a href="#" class="action-link" onclick="alert('Recordatorio enviado a ${item.docente}')"><i class="fa-solid fa-paper-plane"></i> Recordatorio</a>
        <a href="#" class="action-link" onclick="console.log('Ver detalles:', ${item.id})"><i class="fa-solid fa-file-lines"></i> Detalles</a>
      </td>
    `;
    tbody.appendChild(fila);
  });
}

function actualizarKPIs(registros) {
  if (!registros) return;

  const total = registros.length;
  const completos = registros.filter(r => (r.estatus || "").trim().toLowerCase() === "completo").length;
  const pendientes = registros.filter(r => {
    const st = (r.estatus || "").trim().toLowerCase();
    return st === "pendiente" || st === "en progreso";
  }).length;

  const porcentaje = total > 0 ? Math.round((completos / total) * 100) : 0;

  const elemDocentes = document.getElementById("kpiDocentes");
  const elemCumplimiento = document.getElementById("kpiCumplimiento");
  const elemPendientes = document.getElementById("kpiPendientes");
  const elemEntregas = document.getElementById("kpiEntregas");

  if (elemDocentes) elemDocentes.textContent = total;
  if (elemCumplimiento) elemCumplimiento.textContent = porcentaje + "%";
  if (elemPendientes) elemPendientes.textContent = pendientes;
  if (elemEntregas) elemEntregas.textContent = completos;

  const radialSpan = document.querySelector(".radial-progress span");
  if (radialSpan) radialSpan.textContent = porcentaje + "%";
}


