const estadosSelect = document.getElementById('estados');
const municipiosSelect = document.getElementById('municipios');
const verSVGButton = document.getElementById('verSVG');
const svgContainer = document.getElementById('svgContainer');

// Carregar estados
async function carregarEstados() {
    const response = await fetch('http://localhost:3000/api/estados');
    const estados = await response.json();
    estadosSelect.innerHTML = '<option value="">Selecione um estado</option>';
    estados.forEach(estado => {
        const option = document.createElement('option');
        option.value = estado.id;
        option.textContent = estado.nome;
        estadosSelect.appendChild(option);
    });
}

// Carregar municípios ao selecionar um estado
estadosSelect.addEventListener('change', async () => {
    const estadoId = estadosSelect.value;
    if (!estadoId) return;
    municipiosSelect.disabled = true;
    const response = await fetch(`http://localhost:3000/api/municipios/${estadoId}`);
    const municipios = await response.json();
    municipiosSelect.innerHTML = '<option value="">Selecione um município</option>';
    municipios.forEach(municipio => {
        const option = document.createElement('option');
        option.value = municipio.nome;
        option.textContent = municipio.nome;
        municipiosSelect.appendChild(option);
    });
    municipiosSelect.disabled = false;
    verSVGButton.disabled = false;
});

// Buscar SVG ao clicar no botão
verSVGButton.addEventListener('click', async () => {
    const estadoNome = estadosSelect.options[estadosSelect.selectedIndex].text;
    const municipioNome = municipiosSelect.value;
    if (!estadoNome || !municipioNome) return;

    const response = await fetch(`http://localhost:3000/api/svg/${estadoNome}/${municipioNome}`);
    const data = await response.json();

    if (data.pathEstado && data.pathMunicipio && data.viewBox) {
        svgContainer.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="${data.viewBox}">
                <path d="${data.pathEstado}" fill="#ccc" />
                <path d="${data.pathMunicipio}" fill="#ff0000" />
            </svg>
        `;
    } else {
        svgContainer.innerHTML = '<p>Erro ao carregar SVG.</p>';
    }
});

// Inicializar
carregarEstados();
