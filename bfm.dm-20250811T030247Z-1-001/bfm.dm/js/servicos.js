document.addEventListener('DOMContentLoaded', function() {

    // ==========================================================
    // SEÇÃO 1: LÓGICA DO HEADER (DROPDOWNS, SUBMENUS E ALERTA)
    // ==========================================================
    
    // --- Lógica de Dropdowns e Submenus do Header ---
    const dropdowns = document.querySelectorAll('.dropdown');

    // Função auxiliar para fechar todos os dropdowns abertos, exceto um específico.
    function closeAllOtherMenus(currentDropdown = null) {
        document.querySelectorAll('.dropdown').forEach(dropdown => {
            if (dropdown !== currentDropdown) {
                const menu = dropdown.querySelector('.dropdown-content');
                const button = dropdown.querySelector('button[aria-haspopup="true"]');
                if (menu && button && !menu.classList.contains('hidden')) {
                    menu.classList.add('hidden');
                    menu.classList.remove('animate-fade-in-down', 'flex');
                    button.setAttribute('aria-expanded', 'false');
                    dropdown.classList.remove('active');

                    // Fecha todos os submenus dentro deste dropdown
                    const submenus = dropdown.querySelectorAll('.submenu-content');
                    submenus.forEach(submenu => {
                        submenu.classList.add('hidden');
                        submenu.classList.remove('animate-fade-in-right', 'flex');
                        const submenuTrigger = submenu.previousElementSibling;
                        if(submenuTrigger && submenuTrigger.classList.contains('submenu-trigger')) {
                            submenuTrigger.setAttribute('aria-expanded', 'false');
                        }
                    });
                }
            }
        });
    }

    // Configura os listeners para cada dropdown principal
    dropdowns.forEach(dropdown => {
        const button = dropdown.querySelector('button[aria-haspopup="true"]');
        const dropdownContent = dropdown.querySelector('.dropdown-content');

        if (button && dropdownContent) {
            let timeoutId;

            const openMenu = () => {
                clearTimeout(timeoutId);
                closeAllOtherMenus(dropdown);
                dropdownContent.classList.remove('hidden');
                dropdownContent.classList.add('animate-fade-in-down', 'flex');
                button.setAttribute('aria-expanded', 'true');
                dropdown.classList.add('active');
            };

            const closeMenu = () => {
                timeoutId = setTimeout(() => {
                    dropdownContent.classList.remove('animate-fade-in-down', 'flex');
                    dropdownContent.classList.add('hidden');
                    button.setAttribute('aria-expanded', 'false');
                    dropdown.classList.remove('active');
                }, 100);
            };

            button.addEventListener('mouseenter', openMenu);
            dropdown.addEventListener('mouseleave', closeMenu);
            dropdownContent.addEventListener('mouseenter', () => clearTimeout(timeoutId));

            // Lógica para submenus aninhados
            const submenuTriggers = dropdown.querySelectorAll('.submenu-trigger');
            submenuTriggers.forEach(submenuTrigger => {
                const submenuContent = submenuTrigger.nextElementSibling;

                if (submenuContent && submenuContent.classList.contains('submenu-content')) {
                    let submenuTimeoutId;

                    const openSubmenu = () => {
                        clearTimeout(submenuTimeoutId);
                        if (window.innerWidth >= 768) {
                            submenuContent.classList.remove('hidden');
                            submenuContent.classList.add('animate-fade-in-right', 'flex');
                            submenuTrigger.setAttribute('aria-expanded', 'true');
                        }
                    };

                    const closeSubmenu = () => {
                        submenuTimeoutId = setTimeout(() => {
                            if (window.innerWidth >= 768) {
                                submenuContent.classList.remove('animate-fade-in-right', 'flex');
                                submenuContent.classList.add('hidden');
                                submenuTrigger.setAttribute('aria-expanded', 'false');
                            }
                        }, 50);
                    };

                    // Desktop: Hover para submenus
                    if (window.innerWidth >= 768) {
                        submenuTrigger.addEventListener('mouseenter', openSubmenu);
                        submenuTrigger.parentElement.addEventListener('mouseleave', closeSubmenu);
                        submenuContent.addEventListener('mouseenter', () => clearTimeout(submenuTimeoutId));
                    }

                    // Mobile: Clique para alternar submenus
                    submenuTrigger.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (window.innerWidth < 768) {
                            submenuContent.classList.toggle('hidden');
                            submenuContent.classList.toggle('flex');
                            const isExpanded = submenuTrigger.getAttribute('aria-expanded') === 'true';
                            submenuTrigger.setAttribute('aria-expanded', !isExpanded);
                        }
                    });
                }
            });
        }
    });

    // Fecha todos os dropdowns ao clicar em qualquer outro lugar do documento
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            closeAllOtherMenus();
        }
    });
    
    // --- Lógica de Destaque de Menu Ativo ---
    const currentPath = window.location.pathname.split('/').pop();
    document.querySelectorAll('.menu-link, .dropdown-item').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active-menu');
            let parentDropdownButton = link.closest('.dropdown')?.querySelector('button[aria-haspopup="true"]');
            if (parentDropdownButton) {
                parentDropdownButton.classList.add('active-menu');
            }
            let parentSubmenuTrigger = link.closest('.submenu-content')?.previousElementSibling;
            if (parentSubmenuTrigger && parentSubmenuTrigger.classList.contains('submenu-trigger')) {
                parentSubmenuTrigger.classList.add('active-menu');
            }
        } else {
            link.classList.remove('active-menu');
        }
    });

    // --- Lógica do Alerta (Exemplo Básico) ---
    const alertBellButton = document.getElementById('alertBellButton');
    const alertDropdown = document.getElementById('alertDropdown');
    const alertList = document.getElementById('alertList');
    const alertCountSpan = document.getElementById('alertCount');
    let alerts = [];

    function updateAlertsDisplay() {
        alertList.innerHTML = '';
        if (alerts.length === 0) {
            alertList.innerHTML = '<p class="text-sm text-gray-500">Nenhum alerta no momento.</p>';
            alertCountSpan.style.display = 'none';
        } else {
            alerts.forEach((alert, index) => {
                const alertItem = document.createElement('div');
                alertItem.className = 'flex items-center justify-between p-2 hover:bg-gray-50 rounded-md';
                alertItem.innerHTML = `
                    <p class="text-sm text-gray-700">${alert.message}</p>
                    <button class="text-gray-400 hover:text-gray-700 ml-2" onclick="removeAlert(${index})">
                        <i class="ph ph-x"></i>
                    </button>
                `;
                alertList.appendChild(alertItem);
            });
            alertCountSpan.textContent = alerts.length;
            alertCountSpan.style.display = 'block';
        }
    }

    window.removeAlert = function(index) {
        alerts.splice(index, 1);
        updateAlertsDisplay();
    };

    if (alertBellButton && alertDropdown) {
        alertBellButton.addEventListener('click', (e) => {
            e.stopPropagation();
            alertDropdown.classList.toggle('hidden');
            alertDropdown.classList.toggle('flex');
        });
        document.addEventListener('click', (e) => {
            if (!alertBellButton.contains(e.target) && !alertDropdown.contains(e.target)) {
                alertDropdown.classList.add('hidden');
                alertDropdown.classList.remove('flex');
            }
        });
    }


    // ==========================================================
    // SEÇÃO 2: LÓGICA DA APLICAÇÃO (GERENCIAMENTO DE SERVIÇOS)
    // ==========================================================
    
    // --- Lógica de Verificação de Login e Logout ---
    function checkLogin() {
        if (localStorage.getItem('logado') !== 'true') {
            window.location.replace('login.html');
            return;
        }
    }
    checkLogin();

    window.logout = function () {
        localStorage.removeItem('logado');
        window.location.href = 'login.html';
    };

    // --- Constantes e Variáveis de Estado ---
    const LOCAL_STORAGE_KEY = 'bfm_fleet_data';
    const servicoForm = document.getElementById('servicoForm');
    const nomeServicoInput = document.getElementById('nomeServico');
    const conjuntoSistemaSelect = document.getElementById('conjuntoSistema');
    const operacaoExecutadaSelect = document.getElementById('operacaoExecutada');
    const componenteConjuntoSelect = document.getElementById('componenteConjunto');
    const servicosTableBody = document.getElementById('servicosTableBody');
    const noServicesMessage = document.getElementById('no-services-message');
    const addItemModal = document.getElementById('addItemModal');
    const addItemForm = document.getElementById('addItemForm');
    const editServicoModal = document.getElementById('editServicoModal');
    const editServicoForm = document.getElementById('editServicoForm');
    const editNomeServicoInput = document.getElementById('edit-nomeServico');
    const editConjuntoSistemaSelect = document.getElementById('edit-conjuntoSistema');
    const editOperacaoExecutadaSelect = document.getElementById('edit-operacaoExecutada');
    const editComponenteConjuntoSelect = document.getElementById('edit-componenteConjunto');
    const confirmModal = document.getElementById('confirmModal');
    const confirmModalYes = document.getElementById('confirmModalYes');
    const confirmModalNo = document.getElementById('confirmModalNo');

    let editingServicoId = null;
    let deleteServicoId = null;

    // --- Funções de Manipulação de Dados e UI ---

    function getBFMFleetData() {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY);
        const defaultData = {
            servicos: [],
            compartimentos: [],
            operacoes: [],
            conjuntos: [],
        };
        try {
            return { ...defaultData, ...(data ? JSON.parse(data) : {}) };
        } catch (e) {
            console.error("Erro ao analisar os dados do localStorage", e);
            return defaultData;
        }
    }

    function saveBFMFleetData(data) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    }

    function ensureDefaultData() {
        const data = getBFMFleetData();
        if (
            data.compartimentos.length === 0 &&
            data.operacoes.length === 0 &&
            data.conjuntos.length === 0
        ) {
            data.compartimentos = [{ id: 1, nomeCompartimento: 'Motor' }];
            data.operacoes = [{ id: 1, nomeOperacao: 'Troca de Óleo' }];
            data.conjuntos = [{ id: 1, nomeConjunto: 'Filtro de Óleo' }];
            saveBFMFleetData(data);
        }
    }

    function populateDropdowns() {
        const bfmData = getBFMFleetData();
        const { compartimentos, operacoes, conjuntos } = bfmData;

        function populate(selectElement, items, textKey) {
            if (!selectElement) return;
            selectElement.innerHTML = '<option value="">Selecione...</option>';
            items.forEach(item => {
                const option = document.createElement('option');
                option.value = item.id;
                option.textContent = item[textKey];
                selectElement.appendChild(option);
            });
        }

        populate(conjuntoSistemaSelect, compartimentos, 'nomeCompartimento');
        populate(operacaoExecutadaSelect, operacoes, 'nomeOperacao');
        populate(componenteConjuntoSelect, conjuntos, 'nomeConjunto');
        populate(editConjuntoSistemaSelect, compartimentos, 'nomeCompartimento');
        populate(editOperacaoExecutadaSelect, operacoes, 'nomeOperacao');
        populate(editComponenteConjuntoSelect, conjuntos, 'nomeConjunto');
    }

    function displayServicos() {
        const bfmData = getBFMFleetData();
        const { servicos, compartimentos, operacoes, conjuntos } = bfmData;

        if (!servicosTableBody) return;
        servicosTableBody.innerHTML = '';
        noServicesMessage?.classList.toggle('hidden', servicos.length > 0);

        servicos.forEach(servico => {
            const conjunto = compartimentos.find(c => c.id === parseInt(servico.conjuntoSistemaId)) || { nomeCompartimento: 'N/A' };
            const operacao = operacoes.find(o => o.id === parseInt(servico.operacaoExecutadaId)) || { nomeOperacao: 'N/A' };
            const componente = conjuntos.find(c => c.id === parseInt(servico.componenteConjuntoId)) || { nomeConjunto: 'N/A' };

            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${servico.id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${servico.nomeServico}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${conjunto.nomeCompartimento}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${operacao.nomeOperacao}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${componente.nomeConjunto}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="edit-btn text-green-600 hover:text-green-900 mr-4" data-id="${servico.id}">Editar</button>
                    <button class="delete-btn text-red-600 hover:text-red-900" data-id="${servico.id}">Excluir</button>
                </td>`;
            servicosTableBody.appendChild(row);
        });

        addEditDeleteListeners();
    }

    function handleTableClick(event) {
        const target = event.target.closest('button');
        if (!target) return;
        
        const id = parseInt(target.dataset.id);
        if (target.classList.contains('edit-btn')) {
            openEditServicoModal(id);
        } else if (target.classList.contains('delete-btn')) {
            openConfirmModal(id);
        }
    }

    function addEditDeleteListeners() {
        if (!servicosTableBody) return;
        servicosTableBody.removeEventListener('click', handleTableClick);
        servicosTableBody.addEventListener('click', handleTableClick);
    }
    
    function openEditServicoModal(id) {
        const bfmData = getBFMFleetData();
        const servico = bfmData.servicos.find(s => s.id === id);
        if (!servico) return;

        editingServicoId = id;
        editNomeServicoInput.value = servico.nomeServico;
        populateDropdowns(); 
        editConjuntoSistemaSelect.value = servico.conjuntoSistemaId;
        editOperacaoExecutadaSelect.value = servico.operacaoExecutadaId;
        editComponenteConjuntoSelect.value = servico.componenteConjuntoId;
        editServicoModal.classList.remove('hidden');
    }

    function openConfirmModal(id) {
        deleteServicoId = id;
        confirmModal.classList.remove('hidden');
    }

    // --- Listeners de Eventos Globais e de Formulários ---

    if (servicoForm) {
        servicoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const bfmData = getBFMFleetData();
            const nomeServico = nomeServicoInput.value.trim();
            
            if (!nomeServico || !conjuntoSistemaSelect.value || !operacaoExecutadaSelect.value || !componenteConjuntoSelect.value) {
                alert('Preencha todos os campos.');
                return;
            }
            
            const isDuplicate = bfmData.servicos.some(s => s.nomeServico.toLowerCase() === nomeServico.toLowerCase());
            if (isDuplicate) {
                alert('Nome de serviço duplicado. Escolha outro nome.');
                return;
            }
            
            const novoServico = {
                id: bfmData.servicos.length > 0 ? Math.max(...bfmData.servicos.map(s => s.id)) + 1 : 1,
                nomeServico,
                conjuntoSistemaId: parseInt(conjuntoSistemaSelect.value),
                operacaoExecutadaId: parseInt(operacaoExecutadaSelect.value),
                componenteConjuntoId: parseInt(componenteConjuntoSelect.value)
            };
            
            bfmData.servicos.push(novoServico);
            saveBFMFleetData(bfmData);
            alert('Serviço cadastrado com sucesso!');
            servicoForm.reset();
            displayServicos();
        });
    }

    if (addItemForm) {
        addItemForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const bfmData = getBFMFleetData();
            const newItemName = event.target.elements.newItemName.value.trim();

            if (!newItemName) {
                alert('O nome do item não pode ser vazio.');
                return;
            }

            let itemAdded = false;
            let newId;

            if (window.currentAddItemType === 'compartimentos') {
                if (bfmData.compartimentos.some(c => c.nomeCompartimento.toLowerCase() === newItemName.toLowerCase())) {
                    alert('Conjunto/Sistema já existe.');
                    return;
                }
                newId = bfmData.compartimentos.length ? Math.max(...bfmData.compartimentos.map(c => c.id)) + 1 : 1;
                bfmData.compartimentos.push({ id: newId, nomeCompartimento: newItemName });
                itemAdded = true;
            } else if (window.currentAddItemType === 'acoes') {
                if (bfmData.operacoes.some(o => o.nomeOperacao.toLowerCase() === newItemName.toLowerCase())) {
                    alert('Operação já existe.');
                    return;
                }
                newId = bfmData.operacoes.length ? Math.max(...bfmData.operacoes.map(o => o.id)) + 1 : 1;
                bfmData.operacoes.push({ id: newId, nomeOperacao: newItemName });
                itemAdded = true;
            } else if (window.currentAddItemType === 'conjuntos') {
                if (bfmData.conjuntos.some(c => c.nomeConjunto.toLowerCase() === newItemName.toLowerCase())) {
                    alert('Componente já existe.');
                    return;
                }
                newId = bfmData.conjuntos.length ? Math.max(...bfmData.conjuntos.map(c => c.id)) + 1 : 1;
                bfmData.conjuntos.push({ id: newId, nomeConjunto: newItemName });
                itemAdded = true;
            }

            if (itemAdded) {
                saveBFMFleetData(bfmData);
                alert('Item adicionado com sucesso!');
                window.closeAddItemModal();
                populateDropdowns();
                displayServicos();
            }
        });
    }

    if (editServicoForm) {
        editServicoForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const bfmData = getBFMFleetData();
            const index = bfmData.servicos.findIndex(s => s.id === editingServicoId);
            if (index === -1) return;

            const updatedServico = {
                id: editingServicoId,
                nomeServico: editNomeServicoInput.value.trim(),
                conjuntoSistemaId: parseInt(editConjuntoSistemaSelect.value),
                operacaoExecutadaId: parseInt(editOperacaoExecutadaSelect.value),
                componenteConjuntoId: parseInt(editComponenteConjuntoSelect.value)
            };
            
            const isDuplicate = bfmData.servicos.some((s, i) => i !== index && s.nomeServico.toLowerCase() === updatedServico.nomeServico.toLowerCase());
            if (isDuplicate) {
                alert('Nome de serviço já existe.');
                return;
            }

            bfmData.servicos[index] = updatedServico;
            saveBFMFleetData(bfmData);
            alert('Serviço editado com sucesso!');
            window.closeEditServicoModal();
            displayServicos();
        });
    }

    if (confirmModalNo) confirmModalNo.addEventListener('click', () => window.closeConfirmModal());
    if (confirmModalYes) {
        confirmModalYes.addEventListener('click', () => {
            const bfmData = getBFMFleetData();
            bfmData.servicos = bfmData.servicos.filter(s => s.id !== deleteServicoId);
            saveBFMFleetData(bfmData);
            alert('Serviço excluído!');
            displayServicos();
            window.closeConfirmModal();
        });
    }
    
    // Funções de modal no escopo global para acesso pelo HTML
    window.openAddModal = function(type) {
        const addItemModalTitle = document.getElementById('addItemModalTitle');
        const newItemLabel = document.getElementById('newItemLabel');
        const newItemNameInput = document.getElementById('newItemName');

        window.currentAddItemType = type;

        if (type === 'compartimentos') {
            addItemModalTitle.textContent = 'Adicionar Novo Conjunto/Sistema';
            newItemLabel.textContent = 'Nome do Conjunto/Sistema:';
            newItemNameInput.placeholder = 'Ex: Motor, Suspensão';
        } else if (type === 'acoes') {
            addItemModalTitle.textContent = 'Adicionar Nova Operação Executada';
            newItemLabel.textContent = 'Nome da Operação:';
            newItemNameInput.placeholder = 'Ex: Troca de Óleo';
        } else if (type === 'conjuntos') {
            addItemModalTitle.textContent = 'Adicionar Novo Componente do Conjunto';
            newItemLabel.textContent = 'Nome do Componente:';
            newItemNameInput.placeholder = 'Ex: Filtro';
        }
        addItemModal?.classList.remove('hidden');
    };

    window.closeAddItemModal = function() {
        addItemModal?.classList.add('hidden');
        addItemForm?.reset();
    };

    window.closeEditServicoModal = function() {
        editServicoModal?.classList.add('hidden');
        editServicoForm?.reset();
    };

    window.closeConfirmModal = function() {
        confirmModal?.classList.add('hidden');
    };

    // Fechando os modais ao clicar fora deles
    addItemModal?.addEventListener('click', (e) => { if (e.target === addItemModal) closeAddItemModal(); });
    editServicoModal?.addEventListener('click', (e) => { if (e.target === editServicoModal) closeEditServicoModal(); });
    confirmModal?.addEventListener('click', (e) => { if (e.target === confirmModal) closeConfirmModal(); });
    
    // ==========================================================
    // SEÇÃO 3: INICIALIZAÇÃO
    // ==========================================================
    
    // Inicia a aplicação após o carregamento do DOM
    ensureDefaultData();
    populateDropdowns();
    displayServicos();

});