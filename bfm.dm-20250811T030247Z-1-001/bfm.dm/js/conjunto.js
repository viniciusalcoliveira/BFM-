      document.addEventListener('DOMContentLoaded', function() {
            const dropdowns = document.querySelectorAll('.dropdown');
            dropdowns.forEach(dropdown => {
                const button = dropdown.querySelector('button[aria-haspopup="true"]');
                const dropdownContent = dropdown.querySelector('.dropdown-content');

                if (button && dropdownContent) {
                    button.addEventListener('click', function(event) {
                        event.stopPropagation(); // Prevent document click from immediately closing
                        // Close other open dropdowns
                        dropdowns.forEach(otherDropdown => {
                            const otherDropdownContent = otherDropdown.querySelector('.dropdown-content');
                            const otherButton = otherDropdown.querySelector('button[aria-haspopup="true"]');
                            if (otherDropdown !== dropdown && otherDropdownContent && !otherDropdownContent.classList.contains('hidden')) {
                                otherDropdownContent.classList.add('hidden');
                                otherDropdownContent.classList.remove('animate-fade-in-down');
                                if (otherButton) {
                                    otherButton.setAttribute('aria-expanded', 'false');
                                }
                            }
                        });

                        // Toggle current dropdown
                        dropdownContent.classList.toggle('hidden');
                        dropdownContent.classList.toggle('animate-fade-in-down');
                        button.setAttribute('aria-expanded', dropdownContent.classList.contains('hidden') ? 'false' : 'true');

                        // Close any open submenus within this dropdown when its main menu is toggled
                        const openSubmenus = dropdownContent.querySelectorAll('.submenu-content:not(.hidden)');
                        openSubmenus.forEach(submenu => {
                            submenu.classList.add('hidden');
                            submenu.classList.remove('animate-fade-in-right');
                            const submenuTrigger = submenu.previousElementSibling;
                            if (submenuTrigger && submenuTrigger.hasAttribute('aria-expanded')) {
                                submenuTrigger.setAttribute('aria-expanded', 'false');
                            }
                        });
                    });

                    // Prevent clicks inside the dropdown from closing it
                    dropdownContent.addEventListener('click', function(event) {
                        event.stopPropagation();
                    });
                }
            });

            // Close dropdowns when clicking outside
            document.addEventListener('click', function(event) {
                dropdowns.forEach(dropdown => {
                    const dropdownContent = dropdown.querySelector('.dropdown-content');
                    const button = dropdown.querySelector('button[aria-haspopup="true"]');
                    // Check if the click was outside the dropdown button and content
                    if (dropdownContent && button && !dropdown.contains(event.target)) {
                        dropdownContent.classList.add('hidden');
                        dropdownContent.classList.remove('animate-fade-in-down');
                        button.setAttribute('aria-expanded', 'false');
                    }
                });
            });

            // Submenu logic
            const submenuTriggers = document.querySelectorAll('.submenu-trigger');
            submenuTriggers.forEach(trigger => {
                const submenuContent = trigger.nextElementSibling; // The submenu content
                if (submenuContent && submenuContent.classList.contains('submenu-content')) {
                    trigger.addEventListener('click', function(event) {
                        event.stopPropagation(); // Prevent parent dropdown from closing

                        // Close other open submenus within the same parent dropdown
                        const parentDropdownContent = trigger.closest('.dropdown-content');
                        if (parentDropdownContent) {
                            const otherSubmenus = parentDropdownContent.querySelectorAll('.submenu-content:not(.hidden)');
                            otherSubmenus.forEach(otherSubmenu => {
                                const otherTrigger = otherSubmenu.previousElementSibling;
                                if (otherSubmenu !== submenuContent && otherTrigger) {
                                    otherSubmenu.classList.add('hidden');
                                    otherSubmenu.classList.remove('animate-fade-in-right');
                                    otherTrigger.setAttribute('aria-expanded', 'false');
                                }
                            });
                        }

                        // Toggle current submenu
                        submenuContent.classList.toggle('hidden');
                        submenuContent.classList.toggle('animate-fade-in-right');
                        trigger.setAttribute('aria-expanded', submenuContent.classList.contains('hidden') ? 'false' : 'true');
                    });

                    // Prevent clicks inside submenu from closing it
                    submenuContent.addEventListener('click', function(event) {
                        event.stopPropagation();
                    });
                }
            });

            // Alert Bell Button Logic
            const alertBellButton = document.getElementById('alertBellButton');
            const alertDropdown = document.getElementById('alertDropdown');
            if (alertBellButton && alertDropdown) {
                alertBellButton.addEventListener('click', function(event) {
                    event.stopPropagation(); // Prevents this click from bubbling up to document
                    alertDropdown.classList.toggle('hidden');
                    alertDropdown.classList.toggle('animate-fade-in-down');
                    alertBellButton.setAttribute('aria-expanded', alertDropdown.classList.contains('hidden') ? 'false' : 'true');
                });

                alertDropdown.addEventListener('click', function(event) {
                    event.stopPropagation(); // Prevents clicks inside the dropdown from closing it
                });
            }
        });

        function logout() {
            alert('Você foi desconectado.'); // Placeholder for logout logic
            // window.location.href = 'login.html'; // Redirect to login page
        }
    //Final do Header
// --- LOCAL STORAGE KEY (Chave principal unificada) ---
const LOCAL_STORAGE_KEY = 'bfm_fleet_data';

// --- Elementos do DOM (Cadastro de Conjunto) ---
const conjuntoForm = document.getElementById('conjuntoForm');
const componenteDoSistemaSelect = document.getElementById('componenteDoSistema');
const nomeDoConjuntoInput = document.getElementById('nomeDoConjunto');
const conjuntosTableBody = document.getElementById('conjuntosTableBody');
const userFeedbackDiv = document.getElementById('userFeedback');

// --- Modal de Edição ---
const editConjuntoModal = document.getElementById('editConjuntoModal');
const editConjuntoForm = document.getElementById('editConjuntoForm');
const editComponenteDoSistemaSelect = document.getElementById('edit-componenteDoSistema');
const editNomeDoConjuntoInput = document.getElementById('edit-nomeDoConjunto');

// --- Modal de Confirmação de Exclusão ---
const confirmModal = document.getElementById('confirmModal');
const confirmModalYes = document.getElementById('confirmModalYes');
const confirmModalNo = document.getElementById('confirmModalNo');
const closeConfirmModalBtn = document.getElementById('closeConfirmModalBtn');
let idToDelete = null;
let editingConjuntoId = null;


// --- Funções de Leitura/Escrita no Local Storage ---
function getBFMFleetData() {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    const defaultData = {
        servicos: [],
        compartimentos: [],
        conjuntos: [],
        acoes: []
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

function showAlert(message, type = 'success') {
    userFeedbackDiv.textContent = message;
    userFeedbackDiv.className = `alert ${type} visible`;
    userFeedbackDiv.style.display = 'block';
    setTimeout(() => {
        userFeedbackDiv.style.display = 'none';
    }, 3000);
}


function populateComponenteDoSistemaDropdown() {
    const bfmData = getBFMFleetData();
    const compartimentos = bfmData.compartimentos || [];
    
    // Limpar os selects
    componenteDoSistemaSelect.innerHTML = '<option value="" disabled selected>Selecione o Conjunto/Sistema</option>';
    editComponenteDoSistemaSelect.innerHTML = '<option value="" disabled selected>Selecione o Conjunto/Sistema</option>';

    if (compartimentos.length === 0) {
        userFeedbackDiv.innerHTML = 'Nenhum Conjunto/Sistema cadastrado. Por favor, cadastre um para continuar.';
        userFeedbackDiv.classList.remove('hidden');
        if(conjuntoForm) conjuntoForm.style.display = 'none';
    } else {
        userFeedbackDiv.innerHTML = '';
        userFeedbackDiv.classList.add('hidden');
        if(conjuntoForm) conjuntoForm.style.display = 'grid';

        compartimentos.forEach(compartimento => {
            const option = document.createElement('option');
            option.value = compartimento.id;
            option.textContent = compartimento.nomeCompartimento;
            componenteDoSistemaSelect.appendChild(option);

            const editOption = option.cloneNode(true);
            editComponenteDoSistemaSelect.appendChild(editOption);
        });
    }
}

function displayConjuntos() {
    const bfmData = getBFMFleetData();
    const conjuntos = bfmData.conjuntos || [];
    const compartimentos = bfmData.compartimentos || [];
    
    conjuntosTableBody.innerHTML = '';

    if (conjuntos.length === 0) {
        conjuntosTableBody.innerHTML = '<tr><td colspan="4" class="text-center text-gray-500 py-4">Nenhum componente do conjunto cadastrado ainda.</td></tr>';
        return;
    }

    conjuntos.forEach(conjunto => {
        if (!conjunto || !conjunto.nomeConjunto || conjunto.componenteId === undefined) {
            console.error('Item de conjunto inválido encontrado e ignorado:', conjunto);
            return; 
        }
        
        const compartimento = compartimentos.find(c => c.id === parseInt(conjunto.componenteId));
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${conjunto.id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${conjunto.nomeConjunto}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${compartimento ? compartimento.nomeCompartimento : 'Não encontrado'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onclick="openEditConjuntoModal(${conjunto.id})" class="text-indigo-600 hover:text-indigo-900 mr-4">
                    <i class="ph ph-pencil"></i> Editar
                </button>
                <button onclick="confirmDelete(${conjunto.id})" class="text-red-600 hover:text-red-900">
                    <i class="ph ph-trash"></i> Excluir
                </button>
            </td>
        `;
        conjuntosTableBody.appendChild(row);
    });
}

// Evento de envio do formulário de cadastro
if (conjuntoForm) {
    conjuntoForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const bfmData = getBFMFleetData();
        const nomeConjunto = nomeDoConjuntoInput.value.trim();
        const componenteId = parseInt(componenteDoSistemaSelect.value);
        
        if (!nomeConjunto || isNaN(componenteId)) {
            showAlert('Por favor, preencha todos os campos.', 'error');
            return;
        }
        
        const isDuplicate = bfmData.conjuntos.some(conj => 
            conj.nomeConjunto.toLowerCase() === nomeConjunto.toLowerCase() && 
            parseInt(conj.componenteId) === componenteId
        );

        if (isDuplicate) {
            showAlert('Já existe um componente com este nome para este sistema.', 'error');
            return;
        }

        const nextId = bfmData.conjuntos.length > 0 ? Math.max(...bfmData.conjuntos.map(c => c.id)) + 1 : 1;

        const novoConjunto = {
            id: nextId,
            componenteId: componenteId,
            nomeConjunto: nomeConjunto
        };

        bfmData.conjuntos.push(novoConjunto);
        saveBFMFleetData(bfmData);
        showAlert('Componente do conjunto cadastrado com sucesso!', 'success');
        conjuntoForm.reset();
        displayConjuntos();
    });
}

// Função para abrir o modal de edição
window.openEditConjuntoModal = function(id) {
    const numericId = parseInt(id); 
    if (isNaN(numericId)) {
        console.error('ID inválido para edição:', id);
        return;
    }

    const bfmData = getBFMFleetData();
    const conjuntoToEdit = bfmData.conjuntos.find(c => parseInt(c.id) === numericId); 
    
    if (conjuntoToEdit) {
        editingConjuntoId = numericId;
        populateComponenteDoSistemaDropdown(); // Garante que a lista de sistemas está atualizada
        editComponenteDoSistemaSelect.value = conjuntoToEdit.componenteId.toString();
        editNomeDoConjuntoInput.value = conjuntoToEdit.nomeConjunto;
        editConjuntoModal.classList.remove('hidden');
        editConjuntoModal.classList.add('flex');
    } else {
        showAlert('Componente não encontrado.', 'error');
    }
}

// Função para fechar o modal de edição
window.closeEditConjuntoModal = function() {
    editConjuntoModal.classList.remove('flex');
    editConjuntoModal.classList.add('hidden');
    editingConjuntoId = null;
}

// Evento de envio do formulário de edição
if (editConjuntoForm) {
    editConjuntoForm.addEventListener('submit', function(event) {
        event.preventDefault();

        if (editingConjuntoId === null) {
            showAlert('Erro: ID do conjunto não encontrado para edição.', 'error');
            return;
        }
        
        const bfmData = getBFMFleetData();
        const updatedNome = editNomeDoConjuntoInput.value.trim();
        const updatedComponenteId = parseInt(editComponenteDoSistemaSelect.value);

        if (!updatedNome || isNaN(updatedComponenteId)) {
            showAlert('Por favor, preencha todos os campos.', 'error');
            return;
        }
        
        const index = bfmData.conjuntos.findIndex(c => parseInt(c.id) === editingConjuntoId);
        if (index !== -1) {
            const isDuplicate = bfmData.conjuntos.some((conj, i) => 
                i !== index && 
                conj.nomeConjunto.toLowerCase() === updatedNome.toLowerCase() && 
                parseInt(conj.componenteId) === updatedComponenteId
            );

            if (isDuplicate) {
                showAlert('Já existe um componente com este nome para este sistema.', 'error');
                return;
            }

            bfmData.conjuntos[index].nomeConjunto = updatedNome;
            bfmData.conjuntos[index].componenteId = updatedComponenteId;
            saveBFMFleetData(bfmData);
            showAlert('Componente do conjunto atualizado com sucesso!', 'success');
            closeEditConjuntoModal();
            displayConjuntos();
        } else {
            showAlert('Erro ao atualizar. Componente não encontrado.', 'error');
        }
    });
}

// --- Lógica de Exclusão Corrigida e com Modal Novo ---

// Função para fechar o modal de confirmação
window.closeConfirmModal = function() {
    if (confirmModal) {
        confirmModal.classList.remove('flex');
        confirmModal.classList.add('hidden');
        idToDelete = null;
    }
}

// A função `confirmDelete` apenas abre o modal
window.confirmDelete = function(id) {
    idToDelete = parseInt(id); 
    if (isNaN(idToDelete)) {
        console.error('ID inválido para exclusão:', id);
        return;
    }
    if (confirmModal) {
        confirmModal.classList.remove('hidden');
        confirmModal.classList.add('flex');
    }
}

// Lidar com o clique no botão "Excluir" do modal de confirmação
if (confirmModalYes) {
    confirmModalYes.addEventListener('click', () => {
        if (idToDelete) {
            let bfmData = getBFMFleetData();
            bfmData.conjuntos = bfmData.conjuntos.filter(c => parseInt(c.id) !== idToDelete); 
            saveBFMFleetData(bfmData);
            showAlert('Componente do conjunto excluído com sucesso!', 'success');
            displayConjuntos();
        }
        closeConfirmModal();
    });
}

// Lidar com o clique no botão "Cancelar" do modal de confirmação
if (confirmModalNo) {
    confirmModalNo.addEventListener('click', () => {
        closeConfirmModal();
    });
}

// Lidar com o clique no botão de fechar (X) do modal de confirmação
if (closeConfirmModalBtn) {
    closeConfirmModalBtn.addEventListener('click', () => {
        closeConfirmModal();
    });
}

// Lidar com o clique na área escura do modal para fechar
if (confirmModal) {
    confirmModal.addEventListener('click', (event) => {
        if (event.target === confirmModal) {
            closeConfirmModal();
        }
    });
}

// --- Lógica de Inicialização ---
document.addEventListener('DOMContentLoaded', () => {
    // Verificação de login
    if (localStorage.getItem('logado') !== 'true') {
        window.location.replace('login.html');
        return;
    }
    
    populateComponenteDoSistemaDropdown();
    displayConjuntos();

    // A lógica do menu do cabeçalho pode ser movida para um arquivo separado
    // ou mantida aqui, dependendo da sua preferência. Apenas garanta que a
    // lógica de login e inicialização seja executada primeiro.
});