const RIESGO_COLORS = {
    bajo: 'var(--riesgo-bajo)',
    medio: 'var(--riesgo-medio)',
    alto: 'var(--riesgo-alto)',
    critico: 'var(--riesgo-critico)',
};

function nivelLabel(nivel) {
    const labels = { bajo: 'Bajo', medio: 'Medio', alto: 'Alto', critico: 'Crítico' };
    return labels[nivel] || nivel;
}

function updateGauge(promedio, nivelDominante) {
    const circumference = 2 * Math.PI * 52;
    const offset = circumference - (promedio / 100) * circumference;
    const ring = document.getElementById('gauge-ring');
    const pct = document.getElementById('gauge-pct');
    const level = document.getElementById('gauge-level');

    if (ring) {
        ring.style.strokeDashoffset = offset;
        ring.style.stroke = RIESGO_COLORS[nivelDominante] || 'var(--red)';
    }
    if (pct) pct.textContent = `${promedio.toFixed(1)}%`;
    if (level) {
        level.textContent = nivelLabel(nivelDominante);
        level.style.color = RIESGO_COLORS[nivelDominante];
    }
}

function renderRiskCards(predicciones) {
    const container = document.getElementById('risk-cards');
    if (!container) return;
    container.innerHTML = '';

    predicciones.forEach((p) => {
        const card = document.createElement('article');
        card.className = `risk-card nivel-${p.nivel_riesgo}`;
        const color = RIESGO_COLORS[p.nivel_riesgo] || 'var(--text-muted)';
        card.innerHTML = `
            <h3>${p.enfermedad}</h3>
            <div class="risk-bar">
                <div class="risk-bar-fill" style="width: ${p.probabilidad}%; background: ${color};"></div>
            </div>
            <div class="risk-meta">
                <span>Probabilidad</span>
                <span><strong>${p.probabilidad}%</strong> · ${nivelLabel(p.nivel_riesgo)}</span>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderClima(registros) {
    const grid = document.getElementById('clima-grid');
    if (!grid || !registros.length) {
        if (grid) grid.innerHTML = '<p class="loading">Sin datos climáticos</p>';
        return;
    }

    const ultimo = registros[0];
    const promTemp = registros.reduce((s, r) => s + r.temperatura, 0) / registros.length;
    const promHum = registros.reduce((s, r) => s + r.humedad, 0) / registros.length;
    const sumPrecip = registros.reduce((s, r) => s + r.precipitacion, 0);

    grid.innerHTML = `
        <div class="clima-stat">
            <div class="num">${ultimo.temperatura}°</div>
            <div class="unit">Temp. hoy</div>
        </div>
        <div class="clima-stat">
            <div class="num">${ultimo.humedad}%</div>
            <div class="unit">Humedad hoy</div>
        </div>
        <div class="clima-stat">
            <div class="num">${ultimo.precipitacion}</div>
            <div class="unit">mm hoy</div>
        </div>
        <div class="clima-stat">
            <div class="num">${promTemp.toFixed(1)}°</div>
            <div class="unit">Temp. promedio (7d)</div>
        </div>
        <div class="clima-stat">
            <div class="num">${promHum.toFixed(0)}%</div>
            <div class="unit">Humedad promedio</div>
        </div>
        <div class="clima-stat">
            <div class="num">${sumPrecip.toFixed(1)}</div>
            <div class="unit">mm acumulados (7d)</div>
        </div>
    `;
}

function nivelScore(nivel) {
    return { bajo: 1, medio: 2, alto: 3, critico: 4 }[nivel] || 1;
}

async function loadPrediccion(municipioId) {
    const loading = document.getElementById('prediccion-loading');
    const errorEl = document.getElementById('prediccion-error');
    const content = document.getElementById('prediccion-content');

    loading.style.display = 'block';
    errorEl.style.display = 'none';
    content.style.display = 'none';

    try {
        const [predData, clima] = await Promise.all([
            getPrediccion(municipioId),
            getClima(municipioId),
        ]);

        const preds = predData.predicciones || [];
        if (!preds.length) throw new Error('Sin predicciones');

        const promedio = preds.reduce((s, p) => s + p.probabilidad, 0) / preds.length;
        const nivelDominante = preds.reduce((best, p) =>
            nivelScore(p.nivel_riesgo) > nivelScore(best) ? p.nivel_riesgo : best,
        preds[0].nivel_riesgo);

        document.getElementById('gauge-municipio').textContent =
            `${preds[0].municipio} · ${preds[0].fecha_prediccion}`;

        updateGauge(promedio, nivelDominante);
        renderRiskCards(preds);
        renderClima(clima);

        loading.style.display = 'none';
        content.style.display = 'block';
    } catch (e) {
        loading.style.display = 'none';
        errorEl.style.display = 'block';
        errorEl.textContent = `No se pudieron cargar las predicciones: ${e.message}`;
    }
}

async function init() {
    const select = document.getElementById('municipio-select');
    try {
        const municipios = await getMunicipios();
        municipios.forEach((m, i) => {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = m.nombre;
            select.appendChild(opt);
            if (i === 0) select.value = m.id;
        });
        select.addEventListener('change', () => loadPrediccion(select.value));
        loadPrediccion(select.value);
    } catch (e) {
        document.getElementById('prediccion-loading').textContent = `Error: ${e.message}`;
    }
}

document.addEventListener('DOMContentLoaded', init);
