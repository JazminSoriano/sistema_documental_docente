document.addEventListener("DOMContentLoaded", () => {
  cargarDocentes();

  const inputBuscar = document.getElementById("buscarDocenteInput");
  const selectCarrera = document.getElementById("filterCarreraPerfil");

  if (inputBuscar) inputBuscar.addEventListener("input", filtrarDocentes);
  if (selectCarrera) selectCarrera.addEventListener("change", filtrarDocentes);
});

let listaDocentes = [];

async function cargarDocentes() {
  const container = document.getElementById("docentesCardsContainer");
  if (!container) return;

  container.innerHTML = `<p style="grid-column: 1/-1; padding:20px; color:#666;"><i class="fa-solid fa-spinner fa-spin"></i> Cargando perfiles docentes...</p>`;

  try {
    const res = await fetch("data_maestros.json");
    if (!res.ok) throw new Error("No se pudo cargar data_maestros.json");
    listaDocentes = await res.json();
    
    renderizarDocentes(listaDocentes);
    generarTablaRecomendados(listaDocentes);
  } catch (err) {
    console.error(err);
    container.innerHTML = `<p style="grid-column: 1/-1; color:#c53030;">Error al cargar los datos del personal docente.</p>`;
  }
}

function renderizarDocentes(docentes) {
  const container = document.getElementById("docentesCardsContainer");
  if (!container) return;

  if (docentes.length === 0) {
    container.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding:30px; color:#666;"><i class="fa-solid fa-user-slash"></i> No se encontraron docentes para el filtro seleccionado.</p>`;
    return;
  }

  container.innerHTML = docentes.map(doc => {
    const materiasBadges = doc.materiasImparte.map(m => `<span class="materia-chip">${m}</span>`).join("");

    return `
      <div class="docente-profile-card">
        <div class="card-header-profile">
          <img src="${doc.foto}" alt="Foto ${doc.nombre}">
          <div>
            <h3>${doc.nombre} ${doc.apellidoPaterno} ${doc.apellidoMaterno}</h3>
            <span class="num-empleado"><i class="fa-solid fa-id-card"></i> No. Empleado: ${doc.numEmpleado}</span>
            <span class="carrera-badge">${doc.carrera}</span>
          </div>
        </div>

        <div class="card-body-profile">
          <p><i class="fa-solid fa-graduation-cap"></i> <strong>Escolaridad:</strong> ${doc.escolaridad}</p>
          <p><i class="fa-solid fa-building-columns"></i> <strong>Alma Máter:</strong> ${doc.universidadOrigen}</p>
          <p><i class="fa-solid fa-briefcase"></i> <strong>Contratación:</strong> ${doc.tipoContratación}</p>
          <p><i class="fa-solid fa-calendar-day"></i> <strong>Ingreso:</strong> ${doc.fechaContratacion} (${doc.experienciaAnos} años exp.)</p>
          <p><i class="fa-solid fa-envelope"></i> <strong>Correo:</strong> <a href="mailto:${doc.correo}">${doc.correo}</a></p>

          <div class="materias-section">
            <strong>Asignaturas imparte:</strong>
            <div class="chips-container">${materiasBadges}</div>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function generarTablaRecomendados(docentes) {
  const tbody = document.getElementById("tablaRecomendadosBody");
  if (!tbody) return;

  // Seleccionar 10 elementos aleatorios (o los que existan)
  const mezclados = [...docentes].sort(() => 0.5 - Math.random());
  const seleccionados = mezclados.slice(0, 10);

  let html = "";

  seleccionados.forEach((doc, index) => {
    const rowId = `details-row-${index}`;
    const materiasBadges = doc.materiasImparte.map(m => `<span class="materia-chip">${m}</span>`).join("");

    html += `
      <tr class="main-row" onclick="toggleProfileDetails('${rowId}', this)">
        <td style="text-align: center;"><i class="fa-solid fa-chevron-right toggle-icon"></i></td>
        <td><strong>${doc.numEmpleado}</strong></td>
        <td>${doc.nombre} ${doc.apellidoPaterno} ${doc.apellidoMaterno}</td>
        <td><span class="carrera-badge">${doc.carrera}</span></td>
        <td>${doc.tipoContratación}</td>
        <td>${doc.areaEspecialidad}</td>
        <td>
          <button class="btn-ver-perfil">
            <i class="fa-solid fa-id-badge"></i> Ver Ficha
          </button>
        </td>
      </tr>
      <tr id="${rowId}" class="details-row" style="display: none;">
        <td colspan="7">
          <div class="details-expanded-panel">
            <div class="expanded-avatar">
              <img src="${doc.foto}" alt="Avatar">
            </div>
            <div class="expanded-info">
              <h4>${doc.nombre} ${doc.apellidoPaterno} ${doc.apellidoMaterno}</h4>
              <p><strong>Escolaridad:</strong> ${doc.escolaridad} — <em>${doc.universidadOrigen}</em></p>
              <p><strong>Especialidad:</strong> ${doc.areaEspecialidad} (${doc.experienciaAnos} años de trayectoria)</p>
              <p><strong>Fecha de Contratación:</strong> ${doc.fechaContratacion} | <strong>Estatus:</strong> ${doc.estatus}</p>
              <p><strong>Contacto Oficial:</strong> <a href="mailto:${doc.correo}">${doc.correo}</a></p>
              <div class="materias-section" style="margin-top: 8px;">
                <strong>Asignaturas Asignadas:</strong>
                <div class="chips-container">${materiasBadges}</div>
              </div>
            </div>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

function toggleProfileDetails(rowId, triggerRow) {
  const detailsRow = document.getElementById(rowId);
  const icon = triggerRow.querySelector(".toggle-icon");

  if (!detailsRow) return;

  if (detailsRow.style.display === "none" || detailsRow.style.display === "") {
    detailsRow.style.display = "table-row";
    triggerRow.classList.add("row-active");
    if (icon) icon.className = "fa-solid fa-chevron-down toggle-icon";
  } else {
    detailsRow.style.display = "none";
    triggerRow.classList.remove("row-active");
    if (icon) icon.className = "fa-solid fa-chevron-right toggle-icon";
  }
}

function filtrarDocentes() {
  const texto = (document.getElementById("buscarDocenteInput")?.value || "").toLowerCase().trim();
  const carrera = document.getElementById("filterCarreraPerfil")?.value || "Todas";

  const filtrados = listaDocentes.filter(doc => {
    const nombreCompleto = `${doc.nombre} ${doc.apellidoPaterno} ${doc.apellidoMaterno}`.toLowerCase();
    const materias = doc.materiasImparte.join(" ").toLowerCase();

    const coincideTexto = !texto || nombreCompleto.includes(texto) || materias.includes(texto) || doc.numEmpleado.includes(texto);
    const coincideCarrera = carrera === "Todas" || doc.carrera === carrera;

    return coincideTexto && coincideCarrera;
  });

  renderizarDocentes(filtrados);
}