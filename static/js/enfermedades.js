const SLUG_MAP = {
    Dengue: 'dengue',
    Malaria: 'malaria',
    Zika: 'zika',
    Chikungunya: 'chikungunya',
};

function renderFicha(e) {
    const slug = SLUG_MAP[e.nombre] || 'dengue';
    const article = document.createElement('article');
    article.className = 'disease-ficha';
    article.innerHTML = `
        <header class="disease-ficha-header ${slug}">
            <h2>${e.nombre}</h2>
        </header>
        <p class="desc">${e.descripcion}</p>
        <div class="disease-ficha-body">
            <div class="disease-block">
                <h4>Síntomas</h4>
                <p>${e.sintomas}</p>
            </div>
            <div class="disease-block">
                <h4>Transmisión</h4>
                <p>${e.transmision}</p>
            </div>
            <div class="disease-block">
                <h4>Prevención</h4>
                <p>${e.prevencion}</p>
            </div>
        </div>
    `;
    return article;
}

async function init() {
    const list = document.getElementById('enfermedades-list');
    const loading = document.getElementById('enfermedades-loading');
    const errorEl = document.getElementById('enfermedades-error');

    try {
        const enfermedades = await getEnfermedades();
        loading.style.display = 'none';
        list.innerHTML = '';
        enfermedades.forEach((e) => list.appendChild(renderFicha(e)));
    } catch (err) {
        loading.style.display = 'none';
        errorEl.style.display = 'block';
        errorEl.textContent = `Error al cargar fichas: ${err.message}`;
    }
}

document.addEventListener('DOMContentLoaded', init);
