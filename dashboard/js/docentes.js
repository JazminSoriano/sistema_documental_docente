document.addEventListener("DOMContentLoaded", () => {
  // 1. Carga inicial de todos los registros en la tabla
  if (typeof mockDashboardData !== "undefined" && mockDashboardData.registros) {
    renderizarTablaDocentes(mockDashboardData.registros);
  } else {
    console.error("No se encontraron los datos en js/data.js");
  }

  // 2. Escuchar cambios en los filtros de la pestaña Docentes
  const selectCarrera = document.getElementById("filterCarreraDocente");
  const selectEstatus = document.getElementById("filterEstatusDocente");
  const inputBuscar = document.getElementById("inputBuscarDocente");

  if (selectCarrera) selectCarrera.addEventListener("change", filtrarDocentes);
  if (selectEstatus) selectEstatus.addEventListener("change", filtrarDocentes);
  if (inputBuscar) inputBuscar.addEventListener("input", filtrarDocentes);
});

function filtrarDocentes() {
  if (typeof mockDashboardData === "undefined" || !mockDashboardData.registros) return;

  const carreraSel = (document.getElementById("filterCarreraDocente")?.value || "Todas").trim().toLowerCase();
  const estatusSel = (document.getElementById("filterEstatusDocente")?.value || "Todos").trim().toLowerCase();
  const busqueda = (document.getElementById("inputBuscarDocente")?.value || "").trim().toLowerCase();

  const filtrados = mockDashboardData.registros.filter(item => {
    const itemCarrera = (item.carrera || item.area || "").trim().toLowerCase();
    const itemEstatus = (item.estatus || "").trim().toLowerCase();
    const itemDocente = (item.docente || "").trim().toLowerCase();
    const itemMateria = (item.materia || "").trim().toLowerCase();
    const itemDocumento = (item.documento || "").trim().toLowerCase();

    const coincideCarrera = (carreraSel === "todas" || carreraSel === "todos") || (itemCarrera === carreraSel);
    const coincideEstatus = (estatusSel === "todos") || (itemEstatus === estatusSel);
    const coincideTexto = !busqueda || itemDocente.includes(busqueda) || itemMateria.includes(busqueda) || itemDocumento.includes(busqueda);

    return coincideCarrera && coincideEstatus && coincideTexto;
  });

  renderizarTablaDocentes(filtrados);
}

function renderizarTablaDocentes(registros) {
  const tbody = document.getElementById("tablaDocentesBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!registros || registros.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; padding: 20px; color: #666;">
          <i class="fa-solid fa-folder-open"></i> No se encontraron entregas para los filtros seleccionados.
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

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${item.docente || 'N/A'}</strong></td>
      <td><span class="carrera-tag">${item.carrera || 'N/A'}</span></td>
      <td>${item.materia || 'N/A'}</td>
      <td>${item.documento || 'N/A'}</td>
      <td><span class="${badgeClass}">${item.estatus || 'Pendiente'}</span></td>
      <td>${item.fechaLimite || '-'}</td>
      <td>${item.fechaEntrega || '-'}</td>
      <td>
        <button class="btn-evaluar" onclick="alert('Evaluando entrega de: ${item.docente}')">
          <i class="fa-solid fa-pen-to-square"></i> Calificar
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}