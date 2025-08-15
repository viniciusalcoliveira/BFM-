// operacoes.js

// Chave para os dados no Local Storage
const LOCAL_STORAGE_KEY = 'bfm_fleet_data';

// --- Funções de Utilitário ---

function getBFMFleetData() {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    const defaultData = {
        servicos: [],
        compartimentos: [],
        operacoes: [],
        conjuntos: [],
    };
    try {
        const parsedData = data ? JSON.parse(data) : {};
        return {
            ...defaultData,
            ...parsedData
        };
    } catch (e) {
        console.error("Erro ao parsear dados do localStorage. Usando dados padrão.", e);
        return defaultData;
    }
}

function saveBFMFleetData(data) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
}

// --- Funções de Lógica Geral (Menu, Alertas, Logout) ---

function setupDropdowns() {
    // Busca os menus principais e submenus usando as classes atualizadas do HTML
    const dropdowns = document.querySelectorAll('.relative.dropdown');
    const submenus = document.querySelectorAll('.relative.submenu');

    // Função para fechar todos os menus
    const closeAllMenus = (excludeMenu = null) => {
        document.querySelectorAll('.dropdown-content, .submenu-content').forEach(menu => {
            if (menu !== excludeMenu) {
                menu.classList.add('hidden');
                const button = menu.previousElementSibling;
                if (button && button.tagName === 'BUTTON') {
                    button.setAttribute('aria-expanded', 'false');
                }
            }
        });
    };

    // Adiciona evento de clique para menus principais
    dropdowns.forEach(dropdown => {
        const button = dropdown.querySelector('button');
        const menu = dropdown.querySelector('.dropdown-content');

        if (button && menu) {
            button.addEventListener('click', (event) => {
                event.stopPropagation();
                const isExpanded = button.getAttribute('aria-expanded') === 'true';
                
                // Fecha outros menus abertos, exceto o atual
                closeAllMenus(menu);
                
                // Alterna a visibilidade do menu atual
                const newState = !isExpanded;
                menu.classList.toggle('hidden', !newState);
                button.setAttribute('aria-expanded', newState);
            });
        }
    });

    // Adiciona evento de clique para submenus
    submenus.forEach(submenu => {
        const button = submenu.querySelector('.submenu-trigger');
        const submenuContent = submenu.querySelector('.submenu-content');

        if (button && submenuContent) {
            button.addEventListener('click', (event) => {
                event.stopPropagation();
                const isExpanded = button.getAttribute('aria-expanded') === 'true';

                // Alterna a visibilidade do submenu atual
                submenuContent.classList.toggle('hidden', isExpanded);
                button.setAttribute('aria-expanded', !isExpanded);
            });
        }
    });

    // Fecha todos os menus ao clicar em qualquer lugar da página
    document.addEventListener('click', closeAllMenus);

    // Impede que cliques dentro dos menus fechem o dropdown
    document.querySelectorAll('.dropdown-content, .submenu-content').forEach(menu => {
        menu.addEventListener('click', event => event.stopPropagation());
    });
}

function setupAlerts() {
    const alertBellButton = document.getElementById('alertBellButton');
    const alertDropdown = document.getElementById('alertDropdown');
    const alertCountElement = document.getElementById('alertCount');

    // Função de exemplo para atualizar alertas (substituir por sua lógica real)
    const alerts = []; 
    if (alertCountElement && alertDropdown) {
        if (alerts.length > 0) {
            alertCountElement.textContent = alerts.length;
            alertCountElement.style.display = 'block';
            alertDropdown.querySelector('#alertList').innerHTML = alerts.map(alert => `<div class="p-2 border-b last:border-b-0">${alert.message}</div>`).join('');
        } else {
            alertCountElement.style.display = 'none';
            alertDropdown.querySelector('#alertList').innerHTML = '<p class="text-sm text-gray-500">Nenhum alerta no momento.</p>';
        }

        if (alertBellButton) { // Verificação adicional para garantir que o botão exista
            alertBellButton.addEventListener('click', function(event) {
                event.stopPropagation();
                alertDropdown.classList.toggle('hidden');
                alertBellButton.setAttribute('aria-expanded', !alertDropdown.classList.contains('hidden'));
            });
        }
        alertDropdown.addEventListener('click', event => event.stopPropagation());
    }
}

window.logout = function() {
    localStorage.removeItem('logado');
    window.location.href = 'login.html';
};

// --- Funções de Gerenciamento de Operações ---

const operacaoForm = document.getElementById('operacaoForm');
const nomeOperacaoInput = document.getElementById('nomeOperacao');
const operacoesTableBody = document.getElementById('operacoesTableBody');
const noOperacoesMessage = document.getElementById('no-operacoes-message');

// Modais
const editOperacaoModal = document.getElementById('editOperacaoModal');
const editOperacaoForm = document.getElementById('editOperacaoForm');
const editNomeOperacaoInput = document.getElementById('edit-nomeOperacao');
let currentEditId = null;

const confirmModal = document.getElementById('confirmModal');
const confirmModalYes = document.getElementById('confirmModalYes');
const confirmModalNo = document.getElementById('confirmModalNo');
let currentDeleteId = null;

function displayOperacoes() {
    const bfmData = getBFMFleetData();
    const { operacoes } = bfmData;
    if (!operacoesTableBody || !noOperacoesMessage) return;

    operacoesTableBody.innerHTML = '';
    if (operacoes.length === 0) {
        noOperacoesMessage.classList.remove('hidden');
    } else {
        noOperacoesMessage.classList.add('hidden');
    }

    operacoes.forEach(operacao => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${operacao.id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${operacao.nomeOperacao}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onclick="editOperacao(${operacao.id})" class="text-indigo-600 hover:text-indigo-900 mr-4">
                    <i class="ph ph-pencil"></i> Editar
                </button>
                <button onclick="confirmDelete(${operacao.id})" class="text-red-600 hover:text-red-900">
                    <i class="ph ph-trash"></i> Excluir
                </button>
            </td>
        `;
        operacoesTableBody.appendChild(row);
    });
}

function addOperacao(event) {
    event.preventDefault();
    const bfmData = getBFMFleetData();
    const nomeOperacao = nomeOperacaoInput.value.trim();

    if (!nomeOperacao) {
        alert('O nome da operação não pode ser vazio.');
        return;
    }
    const isDuplicate = bfmData.operacoes.some(o => o.nomeOperacao.toLowerCase() === nomeOperacao.toLowerCase());
    if (isDuplicate) {
        alert('Esta Operação já foi cadastrada.');
        return;
    }

    const newId = bfmData.operacoes.length > 0 ? Math.max(...bfmData.operacoes.map(o => o.id)) + 1 : 1;
    bfmData.operacoes.push({ id: newId, nomeOperacao: nomeOperacao });
    saveBFMFleetData(bfmData);

    alert('Operação cadastrada com sucesso!');
    operacaoForm.reset();
    displayOperacoes();
}

window.editOperacao = function(id) {
    const bfmData = getBFMFleetData();
    const operacaoToEdit = bfmData.operacoes.find(o => o.id === id);

    if (operacaoToEdit) {
        currentEditId = operacaoToEdit.id;
        editNomeOperacaoInput.value = operacaoToEdit.nomeOperacao;
        editOperacaoModal.classList.remove('hidden');
        editOperacaoModal.classList.add('flex');
    } else {
        alert('Operação não encontrada.');
    }
}

window.closeEditOperacaoModal = function() {
    editOperacaoModal.classList.add('hidden');
    editOperacaoModal.classList.remove('flex');
    currentEditId = null;
}

function saveEditedOperacao(event) {
    event.preventDefault();
    const bfmData = getBFMFleetData();
    const novoNome = editNomeOperacaoInput.value.trim();

    if (!novoNome) {
        alert('O nome da operação não pode ser vazio.');
        return;
    }

    const isDuplicate = bfmData.operacoes.some(o => o.id !== currentEditId && o.nomeOperacao.toLowerCase() === novoNome.toLowerCase());
    if (isDuplicate) {
        alert('Já existe uma operação com este nome.');
        return;
    }

    const operacaoIndex = bfmData.operacoes.findIndex(o => o.id === currentEditId);
    if (operacaoIndex !== -1) {
        bfmData.operacoes[operacaoIndex].nomeOperacao = novoNome;
        saveBFMFleetData(bfmData);
        alert('Operação atualizada com sucesso!');
        closeEditOperacaoModal();
        displayOperacoes();
    }
}

window.confirmDelete = function(id) {
    currentDeleteId = id;
    confirmModal.classList.remove('hidden');
    confirmModal.classList.add('flex');
};

function deleteOperacao() {
    if (currentDeleteId !== null) {
        const bfmData = getBFMFleetData();
        bfmData.operacoes = bfmData.operacoes.filter(o => o.id !== currentDeleteId);
        saveBFMFleetData(bfmData);
        alert('Item excluído com sucesso!');
        closeConfirmModal();
        displayOperacoes();
    }
}

function closeConfirmModal() {
    confirmModal.classList.add('hidden');
    confirmModal.classList.remove('flex');
    currentDeleteId = null;
}


// --- Inicialização da Aplicação ---

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('logado') !== 'true' && !window.location.pathname.includes('login.html')) {
        window.location.replace('login.html');
        return;
    }

    setupDropdowns();
    setupAlerts();
    
    if (operacaoForm) {
        displayOperacoes();
        operacaoForm.addEventListener('submit', addOperacao);
    }

    if (editOperacaoForm) {
        editOperacaoForm.addEventListener('submit', saveEditedOperacao);
    }
    
    if (confirmModalYes) {
        confirmModalYes.addEventListener('click', deleteOperacao);
    }

    if (confirmModalNo) {
        confirmModalNo.addEventListener('click', closeConfirmModal);
    }

    // Fecha modais ao clicar fora
    if (editOperacaoModal) {
        editOperacaoModal.addEventListener('click', (e) => {
            if (e.target === editOperacaoModal) {
                closeEditOperacaoModal();
            }
        });
    }
    if (confirmModal) {
        confirmModal.addEventListener('click', (e) => {
            if (e.target === confirmModal) {
                closeConfirmModal();
            }
        });
    }
});