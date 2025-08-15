// O arquivo de script para a página de cadastro_tipo_veiculo.html
// Este script gerencia a adição, edição, remoção e listagem de tipos de veículos
// utilizando o localStorage para persistência de dados.

// Constantes e referências a elementos do DOM
const tipoVeiculoForm = document.getElementById('tipoVeiculoForm');
const tiposVeiculoTableBody = document.getElementById('tiposVeiculoTableBody');
const editTipoVeiculoModal = document.getElementById('editTipoVeiculoModal');
const editTipoVeiculoForm = document.getElementById('editTipoVeiculoForm');
const nomeTipoVeiculoInput = document.getElementById('nomeTipoVeiculo');
const editNomeTipoVeiculoInput = document.getElementById('edit-nomeTipoVeiculo');
const userFeedback = document.getElementById('userFeedback');

let currentEditingTipoId = null;

// Funções utilitárias
function getBFMFleetData() {
    const data = localStorage.getItem('bfmFleetData');
    return data ? JSON.parse(data) : {
        vehicles: [],
        brands: [],
        models: [],
        fuels: [],
        customCompartmentTypes: [], // Array para tipos de veículos personalizados
    };
}

function saveBFMFleetData(data) {
    localStorage.setItem('bfmFleetData', JSON.stringify(data));
}

function showFeedback(message, type) {
    userFeedback.textContent = message;
    userFeedback.className = `p-4 mt-4 text-sm font-bold rounded-lg ${
        type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
    }`;
    userFeedback.style.display = 'block';
    setTimeout(() => {
        userFeedback.style.display = 'none';
    }, 5000);
}

// Funções do Modal
function openEditTipoVeiculoModal(id) {
    const bfmData = getBFMFleetData();
    const tipo = bfmData.customCompartmentTypes.find(t => t.id === id);
    if (tipo) {
        currentEditingTipoId = id;
        editNomeTipoVeiculoInput.value = tipo.nome;
        editTipoVeiculoModal.classList.remove('hidden');
        editTipoVeiculoModal.classList.add('flex');
    }
}

function closeEditTipoVeiculoModal() {
    editTipoVeiculoModal.classList.add('hidden');
    editTipoVeiculoModal.classList.remove('flex');
    currentEditingTipoId = null;
}

// Lógica principal
function renderTiposVeiculoTable() {
    const bfmData = getBFMFleetData();
    const tipos = bfmData.customCompartmentTypes;
    tiposVeiculoTableBody.innerHTML = '';

    if (tipos.length === 0) {
        tiposVeiculoTableBody.innerHTML = `<tr><td colspan="3" class="px-6 py-4 text-center text-gray-500">Nenhum tipo de veículo cadastrado.</td></tr>`;
        return;
    }

    tipos.forEach(tipo => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${tipo.id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${tipo.nome}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onclick="openEditTipoVeiculoModal(${tipo.id})" class="text-indigo-600 hover:text-indigo-900 mx-2" aria-label="Editar ${tipo.nome}">
                    <i class="ph ph-pencil-simple text-xl"></i>
                </button>
                <button onclick="deleteTipoVeiculo(${tipo.id})" class="text-red-600 hover:text-red-900 mx-2" aria-label="Excluir ${tipo.nome}">
                    <i class="ph ph-trash text-xl"></i>
                </button>
            </td>
        `;
        tiposVeiculoTableBody.appendChild(row);
    });
}

function deleteTipoVeiculo(id) {
    if (confirm('Tem certeza que deseja excluir este tipo de veículo?')) {
        let bfmData = getBFMFleetData();
        const tipo = bfmData.customCompartmentTypes.find(t => t.id === id);

        // Verifica se existem veículos usando este tipo antes de excluir
        const isUsed = bfmData.vehicles.some(v => v.tipoVeiculo === tipo.nome);
        if (isUsed) {
            showFeedback('Não é possível excluir um tipo de veículo que está sendo usado.', 'error');
            return;
        }

        bfmData.customCompartmentTypes = bfmData.customCompartmentTypes.filter(t => t.id !== id);
        saveBFMFleetData(bfmData);
        showFeedback('Tipo de veículo excluído com sucesso!', 'success');
        renderTiposVeiculoTable();
    }
}

// Event Listeners
tipoVeiculoForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const nome = nomeTipoVeiculoInput.value.trim();

    if (nome) {
        let bfmData = getBFMFleetData();
        const exists = bfmData.customCompartmentTypes.some(t => t.nome.toLowerCase() === nome.toLowerCase());

        if (exists) {
            showFeedback('Erro: Já existe um tipo de veículo com este nome.', 'error');
        } else {
            const newTipo = {
                id: Date.now(),
                nome: nome,
            };
            bfmData.customCompartmentTypes.push(newTipo);
            saveBFMFleetData(bfmData);
            showFeedback('Tipo de veículo cadastrado com sucesso!', 'success');
            nomeTipoVeiculoInput.value = '';
            renderTiposVeiculoTable();
        }
    }
});

editTipoVeiculoForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const nome = editNomeTipoVeiculoInput.value.trim();

    if (currentEditingTipoId && nome) {
        let bfmData = getBFMFleetData();
        const tipoIndex = bfmData.customCompartmentTypes.findIndex(t => t.id === currentEditingTipoId);

        if (tipoIndex > -1) {
            // Verificar se o novo nome já existe e não é o mesmo tipo que está sendo editado
            const exists = bfmData.customCompartmentTypes.some(t => t.nome.toLowerCase() === nome.toLowerCase() && t.id !== currentEditingTipoId);
            if (exists) {
                showFeedback('Erro: Já existe um tipo de veículo com este nome.', 'error');
                return;
            }

            // Atualiza o nome do tipo na lista principal
            bfmData.customCompartmentTypes[tipoIndex].nome = nome;

            // Encontra e atualiza o nome do tipo em todos os veículos que o utilizam
            bfmData.vehicles.forEach(vehicle => {
                if (vehicle.tipoVeiculoId === currentEditingTipoId) {
                    vehicle.tipoVeiculo = nome;
                }
            });

            saveBFMFleetData(bfmData);
            showFeedback('Tipo de veículo atualizado com sucesso!', 'success');
            renderTiposVeiculoTable();
            closeEditTipoVeiculoModal();
        } else {
            showFeedback('Erro: Tipo de veículo não encontrado para edição.', 'error');
        }
    }
});

// Ações de inicialização
document.addEventListener('DOMContentLoaded', () => {
    renderTiposVeiculoTable();
});

// Expondo funções globais para uso no HTML (onclick)
window.openEditTipoVeiculoModal = openEditTipoVeiculoModal;
window.deleteTipoVeiculo = deleteTipoVeiculo;
window.closeEditTipoVeiculoModal = closeEditTipoVeiculoModal;