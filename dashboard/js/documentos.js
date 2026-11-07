document.addEventListener("DOMContentLoaded", () => {
  inicializarConvocatorias();

  const form = document.getElementById("formConvocatoria");
  if (form) {
    form.addEventListener("submit", guardarConvocatoria);
  }
});

let convocatorias = [];

function inicializarConvocatorias() {
  const guardadas = localStorage.getItem("uabc_convocatorias");
  if (guardadas) {
    convocatorias = JSON.parse(guardadas);
  } else {
    // Datos iniciales de prueba
    convocatorias = [
      {
        id: "1",
        titulo: "Entrega de Avance Programático Parcial 2026-1",
        carrera: "Todas",
        tipo: "Avance Programático",
        apertura: "2026-10-01",
        vencimiento: "2026-11-15",
        instrucciones: "Subir el reporte de avance firmado en formato PDF. Asegúrese de incluir las evidencias fotográficas de trabajo en aula y listas de asistencia.",
        plantilla: "https://drive.google.com"
      },
      {
        id: "2",
        titulo: "Entrega de Exámenes Parciales y Guías de Estudio",
        carrera: "LIN",
        tipo: "Examen Parcial / Final",
        apertura: "2026-10-10",
        vencimiento: "2026-11-20",
        instrucciones: "Adjuntar la clave de respuestas y la rúbrica de evaluación correspondiente al primer examen parcial de Inteligencia de Negocios.",
        plantilla: ""
      }
    ];
    guardarEnStorage();
  }

  renderizarLista();
}

function renderizarLista() {
  const contenedor = document.getElementById("listaConvocatorias");
  if (!contenedor) return;

  if (convocatorias.length === 0) {
    contenedor.innerHTML = `<p style="color:#666; font-size:13px; text-align:center; padding:20px;">No hay solicitudes registradas.</p>`;
    return;
  }

  contenedor.innerHTML = convocatorias.map(item => `
    <div class="convocatoria-item">
      <div class="convocatoria-header">
        <h4 class="convocatoria-title">${item.titulo}</h4>
        <span class="badge-fase">${item.carrera}</span>
      </div>
      
      <div class="convocatoria-meta">
        <span><i class="fa-solid fa-folder"></i> ${item.tipo}</span>
        <span><i class="fa-solid fa-calendar-check"></i> Vence: <strong>${item.vencimiento}</strong></span>
      </div>

      <div class="convocatoria-desc">
        ${item.instrucciones}
      </div>

      ${item.plantilla ? `<div style="margin-bottom:10px;"><a href="${item.plantilla}" target="_blank" style="font-size:12px; color:#00723f; font-weight:bold;"><i class="fa-solid fa-link"></i> Ver Plantilla Oficial</a></div>` : ''}

      <div class="convocatoria-actions">
        <button class="btn-action-sm" onclick="editarConvocatoria('${item.id}')">
          <i class="fa-solid fa-pen-to-square"></i> Editar
        </button>
        <button class="btn-action-sm btn-action-danger" onclick="eliminarConvocatoria('${item.id}')">
          <i class="fa-solid fa-trash"></i> Eliminar
        </button>
      </div>
    </div>
  `).join("");
}

function guardarConvocatoria(e) {
  e.preventDefault();

  const editId = document.getElementById("editId").value;
  const titulo = document.getElementById("inputTitulo").value;
  const carrera = document.getElementById("selectCarreraTarget").value;
  const tipo = document.getElementById("selectTipoDoc").value;
  const apertura = document.getElementById("inputFechaApertura").value;
  const vencimiento = document.getElementById("inputFechaVencimiento").value;
  const instrucciones = document.getElementById("inputInstrucciones").value;
  const plantilla = document.getElementById("inputPlantilla").value;

  if (editId) {
    // Editar existente
    const index = convocatorias.findIndex(c => c.id === editId);
    if (index !== -1) {
      convocatorias[index] = { id: editId, titulo, carrera, tipo, apertura, vencimiento, instrucciones, plantilla };
    }
  } else {
    // Crear nuevo
    const nuevo = {
      id: Date.now().toString(),
      titulo,
      carrera,
      tipo,
      apertura,
      vencimiento,
      instrucciones,
      plantilla
    };
    convocatorias.unshift(nuevo);
  }

  guardarEnStorage();
  renderizarLista();
  limpiarFormulario();
  alert("Solicitud guardada y publicada con éxito.");
}

function editarConvocatoria(id) {
  const item = convocatorias.find(c => c.id === id);
  if (!item) return;

  document.getElementById("editId").value = item.id;
  document.getElementById("inputTitulo").value = item.titulo;
  document.getElementById("selectCarreraTarget").value = item.carrera;
  document.getElementById("selectTipoDoc").value = item.tipo;
  document.getElementById("inputFechaApertura").value = item.apertura;
  document.getElementById("inputFechaVencimiento").value = item.vencimiento;
  document.getElementById("inputInstrucciones").value = item.instrucciones;
  document.getElementById("inputPlantilla").value = item.plantilla || "";

  document.getElementById("formTitle").innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Editando Solicitud`;
  document.getElementById("btnGuardar").innerHTML = `<i class="fa-solid fa-rotate"></i> Actualizar Solicitud`;
}

function eliminarConvocatoria(id) {
  if (confirm("¿Está seguro de eliminar esta solicitud de entrega?")) {
    convocatorias = convocatorias.filter(c => c.id !== id);
    guardarEnStorage();
    renderizarLista();
  }
}

function limpiarFormulario() {
  document.getElementById("formConvocatoria").reset();
  document.getElementById("editId").value = "";
  document.getElementById("formTitle").innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Nueva Solicitud de Entrega`;
  document.getElementById("btnGuardar").innerHTML = `<i class="fa-solid fa-paper-plane"></i> Publicar y Notificar a Docentes`;
}

function guardarEnStorage() {
  localStorage.setItem("uabc_convocatorias", JSON.stringify(convocatorias));
}