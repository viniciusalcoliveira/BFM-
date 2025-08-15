// --- LOCAL STORAGE KEY (mantendo o seu padrão) ---
const LOCAL_STORAGE_KEY = 'bfm_fleet_data';

// --- Variável para controle de edição ---
let editingCompartmentId = null;

// --- Elementos do DOM ---
const form = document.getElementById('formCompartimento');
const formTitle = document.getElementById('formTitle');
const btnCadastrar = document.getElementById('btnCadastrarCompartimento');
const alertDiv = document.getElementById('alertMessage');
const compartmentsListDiv = document.getElementById('compartmentsList');

// Main input for compartment name/type
const compartmentNameInput = document.getElementById('compartmentNameInput');

// --- Modal de Edição de Compartimento ---
const editCompartmentModal = document.getElementById('editCompartmentModal');
const editCompartmentForm = document.getElementById('editCompartmentForm');
const editCompartmentIdInput = document.getElementById('editCompartmentId');
const editCompartmentNameInput = document.getElementById('editCompartmentNameInput');
const saveEditCompartmentBtn = document.getElementById('saveEditCompartment');
const cancelEditCompartmentBtn = document.getElementById('cancelEditCompartment');
const editModalAlertMessage = document.getElementById('editModalAlertMessage');

// --- Funções de Leitura/Escrita no Local Storage ---
function getBFMFleetData() {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    const defaultData = {
        servicos: [],
        compartimentos: [], // A chave CORRETA é 'compartimentos'
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

// --- Funções de Ajuda ---
function showAlert(message, type, targetAlertDiv = alertDiv) {
    targetAlertDiv.textContent = message;
    targetAlertDiv.className = `alert ${type}`; // Apply type class (success or error)
    targetAlertDiv.style.display = 'flex';
    setTimeout(() => {
        targetAlertDiv.style.display = 'none';
    }, 3000);
}

// --- Lógica do Formulário de Cadastro de Compartimentos ---

// Função para resetar o formulário para uma nova entrada
function resetFormForNewEntry() {
    form.reset();
    editingCompartmentId = null;
    formTitle.innerHTML = '<i class="ph ph-cube"></i> Cadastro de Conjunto/Sistema';
    btnCadastrar.innerHTML = '<i class="ph ph-plus-circle"></i> Cadastrar';
    compartmentNameInput.value = ''; // Clear input
}

// Lidar com o envio do formulário (Cadastro)
if (form) {
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const compartmentName = compartmentNameInput.value.trim();

        if (!compartmentName) {
            showAlert('Por favor, insira o nome do Conjunto/Sistema.', 'error');
            return;
        }

        let currentBFMData = getBFMFleetData();

        // Verifica duplicatas no array 'compartimentos'
        const isDuplicate = currentBFMData.compartimentos.some(
            comp => comp.nomeCompartimento && comp.nomeCompartimento.toLowerCase() === compartmentName.toLowerCase()
        );

        if (isDuplicate) {
            showAlert('Já existe um Conjunto/Sistema com este nome.', 'error');
            return;
        }

        // Generate sequential ID
        const nextId = currentBFMData.compartimentos.length > 0
            ? Math.max(...currentBFMData.compartimentos.map(c => c.id)) + 1
            : 1;

        const compartmentData = {
            id: nextId,
            nomeCompartimento: compartmentName, // A propriedade CORRETA é 'nomeCompartimento'
        };
        
        currentBFMData.compartimentos.push(compartmentData);
        saveBFMFleetData(currentBFMData);
        showAlert('Conjunto/Sistema cadastrado com sucesso!', 'success');

        resetFormForNewEntry();
        displayCompartments(document.getElementById('filterCompartments').value);
    });
}


function displayCompartments(filterText = '') {
    const currentBFMData = getBFMFleetData();
    // Usa a chave correta: 'compartimentos'
    const compartments = currentBFMData.compartimentos || [];
    if (compartmentsListDiv) {
        compartmentsListDiv.innerHTML = '';
    }
    const normalizedFilter = filterText.toLowerCase().trim();

    const filteredCompartments = compartments.filter(compartment => {
        if (normalizedFilter === '') return true;
        
        const typeMatch = compartment.nomeCompartimento && compartment.nomeCompartimento.toLowerCase().includes(normalizedFilter);
        const idMatch = compartment.id && String(compartment.id).includes(normalizedFilter);
        
        return typeMatch || idMatch;
    });


    if (filteredCompartments.length === 0) {
        if (compartmentsListDiv) {
            compartmentsListDiv.innerHTML = `<p class="empty-state">${compartments.length === 0 ? 'Nenhum Conjunto/Sistema cadastrado ainda.' : 'Nenhum Conjunto/Sistema encontrado com o filtro aplicado.'}</p>`;
        }
        return;
    }

    filteredCompartments.forEach(compartment => {
        const compartmentItem = document.createElement('div');
        compartmentItem.classList.add('compartment-item');
        compartmentItem.setAttribute('data-id', compartment.id);

        compartmentItem.innerHTML = `
            <h3>
                <i class="ph ph-cube"></i> ${compartment.nomeCompartimento} 
                <span class="text-base font-normal text-gray-500">(ID: ${compartment.id})</span>
            </h3>
            <div class="actions">
                <button class="edit-btn" onclick="openEditModal(${compartment.id})">
                    <i class="ph ph-pencil"></i> Editar
                </button>
                <button class="delete-btn" onclick="deleteCompartment(${compartment.id})">
                    <i class="ph ph-trash"></i> Excluir
                </button>
            </div>
        `;
        if (compartmentsListDiv) {
            compartmentsListDiv.appendChild(compartmentItem);
        }
    });
}

function deleteCompartment(id) {
    if (confirm('Tem certeza que deseja excluir este Conjunto/Sistema?')) {
        let currentBFMData = getBFMFleetData();
        // Usa a chave correta: 'compartimentos'
        currentBFMData.compartimentos = currentBFMData.compartimentos.filter(comp => comp.id !== id);
        saveBFMFleetData(currentBFMData);
        showAlert('Conjunto/Sistema excluído com sucesso!', 'success');
        displayCompartments(document.getElementById('filterCompartments').value);
        resetFormForNewEntry();
    }
}

// --- Funções do Modal de Edição ---
function openEditModal(id) {
    let currentBFMData = getBFMFleetData();
    // Usa a chave correta: 'compartimentos'
    const compartmentToEdit = currentBFMData.compartimentos.find(comp => comp.id === id);

    if (compartmentToEdit) {
        editingCompartmentId = id;
        if (editCompartmentIdInput && editCompartmentNameInput) {
            editCompartmentIdInput.value = id;
            editCompartmentNameInput.value = compartmentToEdit.nomeCompartimento || '';
        }
        if (editModalAlertMessage) {
            editModalAlertMessage.style.display = 'none'; // Hide previous alerts
        }
        if (editCompartmentModal) {
            editCompartmentModal.classList.add('active'); // Show the modal
        }
    } else {
        showAlert('Conjunto/Sistema não encontrado para edição.', 'error');
    }
}

function closeEditModal() {
    if (editCompartmentModal) {
        editCompartmentModal.classList.remove('active');
    }
    editingCompartmentId = null; // Clear editing state
}

if (editCompartmentForm) {
    editCompartmentForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const idToUpdate = parseInt(editCompartmentIdInput.value);
        const newCompartmentName = editCompartmentNameInput.value.trim(); 

        if (!newCompartmentName) {
            showAlert('Por favor, insira o nome do Conjunto/Sistema.', 'error', editModalAlertMessage);
            return;
        }

        let currentBFMData = getBFMFleetData();

        // Verifica duplicatas no array 'compartimentos'
        const isDuplicate = currentBFMData.compartimentos.some(
            comp => comp.id !== idToUpdate && comp.nomeCompartimento && comp.nomeCompartimento.toLowerCase() === newCompartmentName.toLowerCase()
        );

        if (isDuplicate) {
            showAlert('Já existe outro Conjunto/Sistema com este nome.', 'error', editModalAlertMessage);
            return;
        }

        const index = currentBFMData.compartimentos.findIndex(comp => comp.id === idToUpdate);

        if (index !== -1) {
            // A propriedade CORRETA é 'nomeCompartimento'
            currentBFMData.compartimentos[index].nomeCompartimento = newCompartmentName; 
            
            saveBFMFleetData(currentBFMData);
            showAlert('Conjunto/Sistema atualizado com sucesso!', 'success', editModalAlertMessage);
            displayCompartments(document.getElementById('filterCompartments').value);
            setTimeout(closeEditModal, 1000);
        } else {
            showAlert('Erro: Conjunto/Sistema não encontrado para atualização.', 'error', editModalAlertMessage);
        }
    });
}

if (cancelEditCompartmentBtn) {
    cancelEditCompartmentBtn.addEventListener('click', closeEditModal);
}

if (editCompartmentModal) {
    editCompartmentModal.addEventListener('click', (event) => {
        if (event.target === editCompartmentModal) { // Clicked on overlay, not content
            closeEditModal();
        }
    });
}

// --- Lógica do Filtro ---
const filterInput = document.getElementById('filterCompartments');
if (filterInput) {
    filterInput.addEventListener('keyup', () => {
        displayCompartments(filterInput.value);
    });
}

// --- Script para Dropdowns do Header ---
document.addEventListener('DOMContentLoaded', function() {
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        const button = dropdown.querySelector('button[aria-haspopup="true"]');
        const dropdownContent = dropdown.querySelector('.dropdown-content');

        if (button && dropdownContent) {
            button.addEventListener('click', function(event) {
                event.stopPropagation();
                
                // Fecha outros dropdowns abertos
                dropdowns.forEach(otherDropdown => {
                    const otherDropdownContent = otherDropdown.querySelector('.dropdown-content');
                    const otherButton = otherDropdown.querySelector('button[aria-haspopup="true"]');
                    if (otherDropdown !== dropdown && otherDropdownContent && !otherDropdownContent.classList.contains('hidden')) {
                        otherDropdownContent.classList.add('hidden');
                        if (otherButton) {
                            otherButton.setAttribute('aria-expanded', 'false');
                        }
                    }
                });

                // Alterna o dropdown atual
                const isHidden = dropdownContent.classList.toggle('hidden');
                button.setAttribute('aria-expanded', isHidden ? 'false' : 'true');
            });

            // Previne que cliques dentro do menu o fechem
            dropdownContent.addEventListener('click', function(event) {
                event.stopPropagation();
            });
        }
    });

    // Fecha dropdowns ao clicar fora
    document.addEventListener('click', function(event) {
        dropdowns.forEach(dropdown => {
            const dropdownContent = dropdown.querySelector('.dropdown-content');
            const button = dropdown.querySelector('button[aria-haspopup="true"]');
            if (dropdownContent && button && !dropdown.contains(event.target)) {
                dropdownContent.classList.add('hidden');
                button.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // Lógica para submenus do header (corrigida)
    const submenuTriggers = document.querySelectorAll('.submenu-trigger');
    submenuTriggers.forEach(trigger => {
        const submenuContent = trigger.nextElementSibling;
        if (submenuContent && submenuContent.classList.contains('submenu-content')) {
            trigger.addEventListener('click', function(event) {
                event.stopPropagation();
                // Fecha outros submenus no mesmo nível
                const parentDropdownContent = trigger.closest('.dropdown-content');
                if (parentDropdownContent) {
                    const openSubmenus = parentDropdownContent.querySelectorAll('.submenu-content:not(.hidden)');
                    openSubmenus.forEach(otherSubmenu => {
                        const otherTrigger = otherSubmenu.previousElementSibling;
                        if (otherSubmenu !== submenuContent && otherTrigger) {
                            otherSubmenu.classList.add('hidden');
                            otherTrigger.setAttribute('aria-expanded', 'false');
                        }
                    });
                }
                // Alterna o submenu atual
                const isHidden = submenuContent.classList.toggle('hidden');
                trigger.setAttribute('aria-expanded', isHidden ? 'false' : 'true');
            });

            // Previne cliques dentro do submenu de fechá-lo
            submenuContent.addEventListener('click', function(event) {
                event.stopPropagation();
            });
        }
    });
});

function logout() {
    localStorage.removeItem('logado');
    window.location.replace('login.html');
}

// --- INITIAL LOAD AND SETUP ---
document.addEventListener('DOMContentLoaded', () => {
    // Check login status
    if (localStorage.getItem('logado') !== 'true') {
        window.location.replace('login.html');
        return;
    }
    
    // Display existing compartments
    displayCompartments(); 
});