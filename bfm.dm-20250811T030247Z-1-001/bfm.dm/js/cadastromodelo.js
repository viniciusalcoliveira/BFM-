document.addEventListener('DOMContentLoaded', function() {
    // --- Lógica do Menu de Navegação ---
    const dropdowns = document.querySelectorAll('.dropdown');

    function setActiveMenuLink() {
        document.querySelectorAll('.menu-link').forEach(link => link.classList.remove('active-menu'));
        document.querySelectorAll('.dropdown-item').forEach(item => item.classList.remove('active-menu-dropdown-item'));
        document.querySelectorAll('.submenu-trigger').forEach(trigger => trigger.classList.remove('active-menu-submenu-trigger'));

        const currentPage = window.location.pathname.split('/').pop();

        if (currentPage === 'dashboard.html' || currentPage === '') {
            const dashboardLink = document.querySelector('a[href="dashboard.html"]');
            if (dashboardLink) {
                dashboardLink.classList.add('active-menu');
            }
        } else {
            dropdowns.forEach(dropdown => {
                const dropdownContent = dropdown.querySelector('.dropdown-content');
                const parentButton = dropdown.querySelector('button[aria-haspopup="true"]');

                if (dropdownContent) {
                    const dropdownItems = dropdownContent.querySelectorAll(':scope > a.dropdown-item');
                    dropdownItems.forEach(item => {
                        if (item.getAttribute('href') === currentPage) {
                            item.classList.add('active-menu-dropdown-item');
                            if (parentButton) {
                                parentButton.classList.add('active-menu');
                            }
                        }
                    });

                    const submenuContainers = dropdownContent.querySelectorAll('.relative.group');
                    submenuContainers.forEach(submenuContainer => {
                        const submenuTrigger = submenuContainer.querySelector('.submenu-trigger');
                        const submenuContent = submenuContainer.querySelector('.submenu-content');

                        if (submenuContent && submenuTrigger) {
                            const submenuItems = submenuContent.querySelectorAll('.dropdown-item');
                            submenuItems.forEach(item => {
                                if (item.getAttribute('href') === currentPage) {
                                    item.classList.add('active-menu-dropdown-item');
                                    submenuTrigger.classList.add('active-menu-submenu-trigger');
                                    if (parentButton) {
                                        parentButton.classList.add('active-menu');
                                    }
                                }
                            });
                        }
                    });
                }
            });

            document.querySelectorAll('nav > a.menu-link').forEach(link => {
                if (link.getAttribute('href') === currentPage && !link.closest('.dropdown')) {
                    link.classList.add('active-menu');
                }
            });
        }
    }

    setActiveMenuLink();

    dropdowns.forEach(dropdown => {
        const button = dropdown.querySelector('button[aria-haspopup="true"]');
        const dropdownContent = dropdown.querySelector('.dropdown-content');

        if (button && dropdownContent) {
            button.addEventListener('click', function(event) {
                event.stopPropagation();
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

                dropdownContent.classList.toggle('hidden');
                dropdownContent.classList.toggle('animate-fade-in-down');
                button.setAttribute('aria-expanded', dropdownContent.classList.contains('hidden') ? 'false' : 'true');

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

            dropdownContent.addEventListener('click', function(event) {
                event.stopPropagation();
            });
        }
    });

    document.addEventListener('click', function(event) {
        dropdowns.forEach(dropdown => {
            const dropdownContent = dropdown.querySelector('.dropdown-content');
            const button = dropdown.querySelector('button[aria-haspopup="true"]');
            if (dropdownContent && button && !dropdown.contains(event.target)) {
                dropdownContent.classList.add('hidden');
                dropdownContent.classList.remove('animate-fade-in-down');
                button.setAttribute('aria-expanded', 'false');
            }
        });
    });

    const submenuTriggers = document.querySelectorAll('.submenu-trigger');
    submenuTriggers.forEach(trigger => {
        const submenuContent = trigger.nextElementSibling;
        if (submenuContent && submenuContent.classList.contains('submenu-content')) {
            trigger.addEventListener('click', function(event) {
                event.stopPropagation();

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

                submenuContent.classList.toggle('hidden');
                submenuContent.classList.toggle('animate-fade-in-right');
                trigger.setAttribute('aria-expanded', submenuContent.classList.contains('hidden') ? 'false' : 'true');
            });

            submenuContent.addEventListener('click', function(event) {
                event.stopPropagation();
            });
        }
    });

    const alertBellButton = document.getElementById('alertBellButton');
    const alertDropdown = document.getElementById('alertDropdown');
    if (alertBellButton && alertDropdown) {
        alertBellButton.addEventListener('click', function(event) {
            event.stopPropagation();
            alertDropdown.classList.toggle('hidden');
            alertDropdown.classList.toggle('animate-fade-in-down');
            alertBellButton.setAttribute('aria-expanded', alertDropdown.classList.contains('hidden') ? 'false' : 'true');
        });

        alertDropdown.addEventListener('click', function(event) {
            event.stopPropagation();
        });
    }

    // --- FUNÇÕES DE ARMAZENAMENTO DE DADOS (LocalStorage) ---
    function getBFMFleetData() {
        const data = localStorage.getItem('bfmFleetData');
        return data ? JSON.parse(data) : {
            vehicles: [],
            compartments: [],
            brands: [],
            fuels: [],
            models: [],
            technicians: [],
            suppliers: [],
            periodicities: [],
            workshops: [],
            hodometerHorimeter: [],
            maintenancePlans: [],
            serviceOrders: [],
            customCompartmentTypes: [],
            actions: []
        };
    }

    function saveBFMFleetData(data) {
        localStorage.setItem('bfmFleetData', JSON.stringify(data));
        const channel = new BroadcastChannel('bfm_fleet_channel');
        channel.postMessage({ type: 'dados_atualizados' });
    }

    // --- Lógica de CRUD para Modelos (CORRIGIDA) ---
    let models = [];
    const modelForm = document.getElementById('modelForm');
    const modelNameInput = document.getElementById('modelName');
    const modelsTableBody = document.getElementById('modelsTableBody');
    const noModelsMessage = document.getElementById('noModelsMessage');
    const editModelModal = document.getElementById('editModelModal');
    const editModelForm = document.getElementById('editModelForm');
    const editModelNameInput = document.getElementById('editModelName');
    const editModelIdInput = document.getElementById('editModelId');
    const feedbackMessage = document.getElementById('feedback-message');
    let feedbackTimeout;
    
    // Configura o BroadcastChannel para receber atualizações de outras páginas
    const channel = new BroadcastChannel('bfm_fleet_channel');
    channel.onmessage = function(event) {
        if (event.data.type === 'dados_atualizados') {
            loadModels();
            renderModels();
        }
    };

    function showFeedback(message, type = 'info') {
        feedbackMessage.textContent = message;
        feedbackMessage.className = `feedback-message show ${type}`;
        clearTimeout(feedbackTimeout);
        feedbackTimeout = setTimeout(() => {
            feedbackMessage.classList.remove('show');
            setTimeout(() => {
                feedbackMessage.textContent = '';
                feedbackMessage.className = 'feedback-message';
            }, 300);
        }, 3000);
    }

    function loadModels() {
        const bfmData = getBFMFleetData();
        // AQUI HÁ UMA CORREÇÃO: Converte modelos de string para objeto se necessário
        models = (bfmData.models || []).map(model => {
            if (typeof model === 'string') {
                return { id: Date.now() + Math.random(), nome: model };
            }
            return model;
        });
        // AQUI HÁ UMA CORREÇÃO: Salva os modelos corrigidos de volta no localStorage para consistência
        bfmData.models = models;
        saveBFMFleetData(bfmData);
    }

    function renderModels() {
        modelsTableBody.innerHTML = '';
        if (models.length === 0) {
            noModelsMessage.classList.remove('hidden');
        } else {
            noModelsMessage.classList.add('hidden');
            models.forEach(model => {
                const row = modelsTableBody.insertRow();
                row.className = 'hover:bg-gray-100';

                const nameCell = row.insertCell();
                nameCell.className = 'px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900';
                nameCell.textContent = model.nome;

                const actionsCell = row.insertCell();
                actionsCell.className = 'px-6 py-4 whitespace-nowrap text-right text-sm font-medium';

                const editButton = document.createElement('button');
                editButton.innerHTML = '<i class="ph ph-pencil-simple text-lg"></i>';
                editButton.className = 'btn-warning mr-2';
                editButton.title = 'Editar';
                editButton.onclick = () => openEditModal(model.id);
                actionsCell.appendChild(editButton);

                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = '<i class="ph ph-trash text-lg"></i>';
                deleteButton.className = 'btn-danger';
                deleteButton.title = 'Excluir';
                deleteButton.onclick = () => deleteModel(model.id);
                actionsCell.appendChild(deleteButton);
            });
        }
    }

    function addModel(event) {
        event.preventDefault();
        const modelName = modelNameInput.value.trim().toUpperCase();
        if (modelName) {
            const bfmData = getBFMFleetData();
            if (bfmData.models.some(m => m.nome.toLowerCase() === modelName.toLowerCase())) {
                showFeedback('Este modelo já existe!', 'error');
                return;
            }
            const newModel = {
                id: Date.now(),
                nome: modelName
            };
            bfmData.models.unshift(newModel); // Adiciona no início
            saveBFMFleetData(bfmData);
            loadModels();
            renderModels();
            modelNameInput.value = '';
            showFeedback('Modelo cadastrado com sucesso!', 'success');
        } else {
            showFeedback('Por favor, insira um nome para o modelo.', 'error');
        }
    }

    function openEditModal(id) {
        const model = models.find(m => m.id === id);
        if (model) {
            editModelIdInput.value = model.id;
            editModelNameInput.value = model.nome;
            editModelModal.classList.remove('hidden');
        }
    }

    function closeEditModal() {
        editModelModal.classList.add('hidden');
    }

    function saveEditedModel(event) {
        event.preventDefault();
        const id = parseInt(editModelIdInput.value);
        const newModelName = editModelNameInput.value.trim().toUpperCase();

        if (newModelName && id !== -1) {
            const bfmData = getBFMFleetData();
            if (bfmData.models.some(m => m.nome.toLowerCase() === newModelName.toLowerCase() && m.id !== id)) {
                showFeedback('Este modelo já existe!', 'error');
                return;
            }
            const modelIndex = bfmData.models.findIndex(m => m.id === id);
            if (modelIndex > -1) {
                bfmData.models[modelIndex].nome = newModelName;
                saveBFMFleetData(bfmData);
                loadModels();
                renderModels();
                closeEditModal();
                showFeedback('Modelo atualizado com sucesso!', 'success');
            }
        } else {
            showFeedback('Por favor, insira um nome válido para o modelo.', 'error');
        }
    }

    function deleteModel(id) {
        if (confirm('Tem certeza que deseja excluir este modelo?')) {
            const bfmData = getBFMFleetData();
            const deletedModel = bfmData.models.find(m => m.id === id);

            // Adiciona verificação para ver se o modelo está em uso por algum veículo
            const modeloEmUso = bfmData.vehicles.some(vehicle => vehicle.modelo === deletedModel.nome);

            if (modeloEmUso) {
                showFeedback('Este modelo não pode ser excluído porque está vinculado a um ou mais veículos.', 'error');
                return;
            }

            bfmData.models = bfmData.models.filter(m => m.id !== id);
            saveBFMFleetData(bfmData);
            loadModels();
            renderModels();
            showFeedback(`Modelo "${deletedModel.nome}" excluído.`, 'info');
        }
    }

    // Event Listeners
    if (modelForm) modelForm.addEventListener('submit', addModel);
    if (editModelForm) editModelForm.addEventListener('submit', saveEditedModel);
    const closeModalButton = editModelModal.querySelector('[data-close-modal]');
    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeEditModal);
    }
    const closeEditButton = editModelModal.querySelector('button[type="button"]');
    if (closeEditButton) {
        closeEditButton.addEventListener('click', closeEditModal);
    }

    // Inicialização
    loadModels();
    renderModels();

    // Verificação de login
    (function() {
        if (localStorage.getItem('logado') !== 'true' && window.location.pathname.split('/').pop() !== 'login.html') {
            window.location.replace('login.html');
        }
    })();

    // Função de logout
    window.logout = function() {
        if (confirm('Tem certeza que deseja sair?')) {
            localStorage.removeItem('logado');
            window.location.replace('login.html');
        }
    };
});