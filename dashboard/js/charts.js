let chartEstatusInstance = null;
let chartMesInstance = null;
let modoMatrizActual = 'materia'; // Estado inicial: 'materia', 'docente' o 'carrera'

function actualizarGraficos(registros) {
  if (!registros) return;

  // 1. Gráfico de barras por Carrera
  const carreras = ["LIN", "LAE", "LC", "LNI"];

  const datosCompleto = carreras.map(carrera => 
    registros.filter(r => (r.carrera || r.area) === carrera && (r.estatus || "").toLowerCase() === "completo").length
  );
  const datosProgreso = carreras.map(carrera => 
    registros.filter(r => (r.carrera || r.area) === carrera && (r.estatus || "").toLowerCase() === "en progreso").length
  );
  const datosPendiente = carreras.map(carrera => 
    registros.filter(r => (r.carrera || r.area) === carrera && (r.estatus || "").toLowerCase() === "pendiente").length
  );

  if (chartEstatusInstance) {
    chartEstatusInstance.destroy();
  }

  const ctxEstatus = document.getElementById("barChartEstatus")?.getContext("2d");
  if (ctxEstatus) {
    chartEstatusInstance = new Chart(ctxEstatus, {
      type: "bar",
      data: {
        labels: carreras,
        datasets: [
          { label: "Completo", data: datosCompleto, backgroundColor: "#00723F" },
          { label: "En progreso", data: datosProgreso, backgroundColor: "#DD971A" },
          { label: "Pendiente", data: datosPendiente, backgroundColor: "#D9534F" }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "top" } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
      }
    });
  }

  // 2. Gráfico de Carga Documental por Mes
  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const conteoMeses = meses.map((mes, index) => {
    return registros.filter(r => {
      if (!r.fechaEntrega || r.fechaEntrega === "-") return false;
      const partes = r.fechaEntrega.split("/");
      return parseInt(partes[1], 10) === (index + 1);
    }).length;
  });

  if (chartMesInstance) {
    chartMesInstance.destroy();
  }

  const ctxMes = document.getElementById("barChartMes")?.getContext("2d");
  if (ctxMes) {
    chartMesInstance = new Chart(ctxMes, {
      type: "bar",
      data: {
        labels: meses,
        datasets: [{
          label: "Documentos Entregados",
          data: conteoMeses,
          backgroundColor: "#00723F"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
      }
    });
  }

  // 3. Generar la Matriz de Cumplimiento
  renderizarHeatmap(registros);
  configurarEventosTabsMatriz(registros);
}

function renderizarHeatmap(registros) {
  const tabla = document.getElementById("heatmapTable");
  if (!tabla) return;

  if (!registros || registros.length === 0) {
    tabla.innerHTML = `
      <tr>
        <td style="text-align:center; padding: 20px; color: #666;">
          Sin registros para mostrar en la matriz.
        </td>
      </tr>`;
    return;
  }

  let htmlHeader = "";
  let htmlBody = "";

  if (modoMatrizActual === 'materia') {
    htmlHeader = `
      <thead>
        <tr>
          <th>Materia</th>
          <th>Docente</th>
          <th>Carrera</th>
          <th style="text-align: center;">Estatus</th>
        </tr>
      </thead>`;

    htmlBody = registros.map(r => {
      const stClass = getBadgeClass(r.estatus);
      return `
        <tr>
          <td><strong>${r.materia || 'N/A'}</strong></td>
          <td>${r.docente || 'N/A'}</td>
          <td><span class="carrera-tag">${r.carrera || 'N/A'}</span></td>
          <td style="text-align: center;"><span class="status-badge ${stClass}">${r.estatus}</span></td>
        </tr>`;
    }).join("");

  } else if (modoMatrizActual === 'docente') {
    // Agrupar por docente
    const docentesMap = {};
    registros.forEach(r => {
      const doc = r.docente || 'Sin Asignar';
      if (!docentesMap[doc]) docentesMap[doc] = { total: 0, completos: 0, carrera: r.carrera };
      docentesMap[doc].total++;
      if ((r.estatus || "").toLowerCase() === "completo") docentesMap[doc].completos++;
    });

    htmlHeader = `
      <thead>
        <tr>
          <th>Docente</th>
          <th>Carrera</th>
          <th>Progreso</th>
          <th style="text-align: center;">Cumplimiento</th>
        </tr>
      </thead>`;

    htmlBody = Object.keys(docentesMap).map(doc => {
      const item = docentesMap[doc];
      const porcentaje = Math.round((item.completos / item.total) * 100);
      let colorPill = porcentaje === 100 ? 'status-complete' : (porcentaje >= 50 ? 'status-progress' : 'status-pending');

      return `
        <tr>
          <td><strong>${doc}</strong></td>
          <td><span class="carrera-tag">${item.carrera || 'N/A'}</span></td>
          <td>
            <div class="matrix-progress-bar">
              <div class="matrix-progress-fill" style="width: ${porcentaje}%;"></div>
            </div>
          </td>
          <td style="text-align: center;"><span class="status-badge ${colorPill}">${porcentaje}% (${item.completos}/${item.total})</span></td>
        </tr>`;
    }).join("");

  } else if (modoMatrizActual === 'carrera') {
    // Agrupar por carrera
    const carrerasMap = {};
    registros.forEach(r => {
      const car = r.carrera || 'General';
      if (!carrerasMap[car]) carrerasMap[car] = { total: 0, completos: 0 };
      carrerasMap[car].total++;
      if ((r.estatus || "").toLowerCase() === "completo") carrerasMap[car].completos++;
    });

    htmlHeader = `
      <thead>
        <tr>
          <th>Carrera</th>
          <th>Total Documentos</th>
          <th>Entregados</th>
          <th style="text-align: center;">% Cumplimiento</th>
        </tr>
      </thead>`;

    htmlBody = Object.keys(carrerasMap).map(car => {
      const item = carrerasMap[car];
      const porcentaje = Math.round((item.completos / item.total) * 100);
      let colorPill = porcentaje === 100 ? 'status-complete' : (porcentaje >= 50 ? 'status-progress' : 'status-pending');

      return `
        <tr>
          <td><strong>${car}</strong></td>
          <td>${item.total}</td>
          <td>${item.completos}</td>
          <td style="text-align: center;"><span class="status-badge ${colorPill}">${porcentaje}%</span></td>
        </tr>`;
    }).join("");
  }

  tabla.innerHTML = htmlHeader + `<tbody>${htmlBody}</tbody>`;
}

function getBadgeClass(estatus) {
  const st = (estatus || "").toLowerCase();
  if (st === "completo") return "status-complete";
  if (st === "en progreso") return "status-progress";
  return "status-pending";
}

function configurarEventosTabsMatriz(registros) {
  const tabs = document.querySelectorAll(".matrix-card .btn-tab");
  tabs.forEach(tab => {
    tab.onclick = function() {
      tabs.forEach(t => t.classList.remove("active"));
      this.classList.add("active");

      const texto = this.textContent.trim().toLowerCase();
      modoMatrizActual = texto;
      renderizarHeatmap(registros);
    };
  });
}