document.addEventListener('DOMContentLoaded', function() {
    const dropdowns = document.querySelectorAll('.dropdown');
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
});

function logout() {
    alert('Você foi desconectado.');
}

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
    channel.postMessage({
        type: 'dados_atualizados'
    });
}

const vehicleChannel = new BroadcastChannel('bfm_fleet_channel');
vehicleChannel.onmessage = function(event) {
    if (event.data && event.data.type === 'dados_atualizados') {
        console.log('Dados atualizados por outra aba/janela. Recarregando selects e tabela de veículos...');
        let bfmData = getBFMFleetData();
        vehicles = bfmData.vehicles || [];
        brands = bfmData.brands || [];
        models = bfmData.models || [];
        types = bfmData.customCompartmentTypes || [];
        fuels = bfmData.fuels || [];
        renderAllSelects();
        renderVehiclesTable();
    }
};

const vehicleForm = document.getElementById('vehicleForm');
const vehiclesTableBody = document.getElementById('vehiclesTableBody');
const editVehicleForm = document.getElementById('editVehicleForm');
const editVehicleModal = document.getElementById('editVehicleModal');
const closeEditVehicleModalButton = document.getElementById('closeEditVehicleModal');
const userFeedback = document.getElementById('userFeedback');

const registerModal = document.getElementById('registerModal');
const registerModalTitle = document.getElementById('registerModalTitle');
const registerNameInput = document.getElementById('registerName');
const registerList = document.getElementById('registerList');
const registerForm = document.getElementById('registerForm');

let currentRegisterType = '';
let vehicles = getBFMFleetData().vehicles || [];
let brands = getBFMFleetData().brands || [];
let models = getBFMFleetData().models || [];
let types = getBFMFleetData().customCompartmentTypes || [];
let fuels = getBFMFleetData().fuels || [];

let currentEditingVehicleId = null;
let selectedEditDocuments = [];

function showFeedback(message, type = 'success') {
    userFeedback.textContent = message;
    userFeedback.classList.remove('hidden', 'bg-green-100', 'bg-red-100', 'bg-yellow-100', 'bg-blue-100', 'text-green-800', 'text-red-800', 'text-yellow-800', 'text-blue-800');
    userFeedback.classList.add('p-3', 'rounded-lg', 'mb-4', 'text-center');
    userFeedback.classList.add('show');

    if (type === 'success') {
        userFeedback.classList.add('bg-green-100', 'text-green-800');
    } else if (type === 'error') {
        userFeedback.classList.add('bg-red-100', 'text-red-800');
    } else if (type === 'warning') {
        userFeedback.classList.add('bg-yellow-100', 'text-yellow-800');
    } else if (type === 'info') {
        userFeedback.classList.add('bg-blue-100', 'text-blue-800');
    }

    setTimeout(() => {
        userFeedback.classList.remove('show');
        userFeedback.classList.add('hidden');
    }, 3000);
}

function populateSelect(selectId, dataArray, selectedValue = '') {
    const selectElement = document.getElementById(selectId);
    if (!selectElement) return;

    if ($(selectElement).data('select2')) {
        $(selectElement).select2('destroy');
    }

    let placeholderText = "Selecione um item";
    let enableTags = false;

    if (selectId.includes('marca')) {
        placeholderText = 'Selecione uma Marca ou digite para adicionar';
        enableTags = true;
    } else if (selectId.includes('modelo')) {
        placeholderText = 'Selecione um Modelo ou digite para adicionar';
        enableTags = true;
    } else if (selectId.includes('tipoVeiculo')) {
        placeholderText = 'Selecione o Tipo de Veículo ou digite para adicionar';
        enableTags = true;
    } else if (selectId.includes('combustivel')) {
        placeholderText = 'Selecione o Combustível ou digite para adicionar';
        enableTags = true;
    } else if (selectId.includes('status')) {
        placeholderText = 'Selecione o Status';
        enableTags = false;
    }

    selectElement.innerHTML = `<option value="">${placeholderText}</option>`;

    dataArray.forEach(item => {
        const option = document.createElement('option');
        const value = typeof item === 'object' && item !== null && item.id ? item.id : item;
        const text = typeof item === 'object' && item !== null && item.nome ? item.nome : item;
        option.value = value;
        option.textContent = text;
        selectElement.appendChild(option);
    });

    const select2Options = {
        placeholder: placeholderText,
        allowClear: true,
        dropdownParent: selectElement.closest('.modal-content') || document.body
    };

    if (enableTags) {
        select2Options.tags = true;
        select2Options.createTag = function(params) {
            if (selectId.includes('marca')) {
                return {
                    id: params.term,
                    text: params.term,
                    newOption: true
                };
            } else {
                return {
                    id: params.term,
                    text: params.term,
                    newOption: true
                };
            }
        };
        select2Options.insertTag = function(data, tag) {
            data.unshift(tag);
        };
    } else {
        if (dataArray.length < 10) {
            select2Options.minimumResultsForSearch = Infinity;
        }
    }

    $(selectElement).select2(select2Options);

    if (selectedValue) {
        if (selectId.includes('marca')) {
            const brand = dataArray.find(b => b.id === selectedValue);
            if (brand) {
                $(selectElement).val(brand.id).trigger('change');
            } else if (typeof selectedValue === 'string') {
                $(selectElement).val(selectedValue).trigger('change');
            }
        } else if (enableTags && typeof selectedValue === 'string' && !dataArray.some(item => (typeof item === 'object' ? item.nome : item) === selectedValue)) {
            const newOption = new Option(selectedValue, selectedValue, true, true);
            $(selectElement).append(newOption).trigger('change');
        } else {
            $(selectElement).val(selectedValue).trigger('change');
        }
    }
}

// CORREÇÃO: A função renderAllSelects agora busca o ID correspondente ao nome para seleção correta.
function renderAllSelects(selectedVehicle = {}) {
    const bfmData = getBFMFleetData();
    brands = bfmData.brands || [];
    models = bfmData.models || [];
    types = bfmData.customCompartmentTypes || [];
    fuels = bfmData.fuels || [];
    
    // Encontra os IDs dos itens salvos para passar à função populateSelect
    const tipoVeiculoId = types.find(t => t.nome === selectedVehicle.tipoVeiculo)?.id || '';
    const modeloId = models.find(m => m.nome === selectedVehicle.modelo)?.id || '';
    const combustivelId = fuels.find(f => f.nome === selectedVehicle.combustivel)?.id || '';

    // Campos do formulário principal
    populateSelect('marca', brands, selectedVehicle.marcaId);
    populateSelect('modelo', models, modeloId);
    populateSelect('tipoVeiculo', types, tipoVeiculoId);
    populateSelect('combustivel', fuels, combustivelId);
    populateSelect('status', ['ATIVO', 'INATIVO', 'MANUTENÇÃO'], selectedVehicle.status);

    // Campos do modal de edição
    populateSelect('edit-marca', brands, selectedVehicle.marcaId);
    populateSelect('edit-modelo', models, modeloId);
    populateSelect('edit-tipoVeiculo', types, tipoVeiculoId);
    populateSelect('edit-combustivel', fuels, combustivelId);
    populateSelect('edit-status', ['ATIVO', 'INATIVO', 'MANUTENÇÃO'], selectedVehicle.status);

    $('#marca').on('change', function() {
        const selectedBrandId = parseInt($(this).val());
        const filteredModels = models.filter(m => m.brandId === selectedBrandId)
        populateSelect('modelo', filteredModels);
    });

    $('#edit-marca').on('change', function() {
        const selectedBrandId = parseInt($(this).val());
        const filteredModels = models.filter(m => m.brandId === selectedBrandId)
        populateSelect('edit-modelo', filteredModels);
    });
}


renderAllSelects();
renderVehiclesTable();

// CORREÇÃO: Lógica de submissão do formulário de cadastro para salvar os IDs e Nomes corretamente
vehicleForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const currentKm = parseInt(document.getElementById('quilometragemAtual').value, 10) || 0;
    const currentHr = parseInt(document.getElementById('horimetroAtual').value, 10) || 0;
    const lastRevKm = parseInt(document.getElementById('quilometragemRevisao').value, 10) || 0;
    const lastRevHr = parseInt(document.getElementById('horimetroRevisao').value, 10) || 0;

    if (lastRevKm > currentKm) {
        showFeedback('Quilometragem da última revisão não pode ser maior que a quilometragem atual.', 'error');
        return;
    }
    if (lastRevHr > currentHr) {
        showFeedback('Horímetro da última revisão não pode ser maior que o horímetro atual.', 'error');
        return;
    }

    const rawMarcaValue = document.getElementById('marca').value;
    let selectedMarcaId;
    let selectedMarcaNome;

    const existingBrandById = brands.find(b => b.id == rawMarcaValue);
    const existingBrandByName = brands.find(b => b.nome.toLowerCase() === rawMarcaValue.toLowerCase());

    if (existingBrandById) {
        selectedMarcaId = existingBrandById.id;
        selectedMarcaNome = existingBrandById.nome;
    } else if (existingBrandByName) {
        selectedMarcaId = existingBrandByName.id;
        selectedMarcaNome = existingBrandByName.nome;
    } else {
        selectedMarcaId = Date.now();
        selectedMarcaNome = rawMarcaValue;

        let bfmDataTemp = getBFMFleetData();
        if (!bfmDataTemp.brands.some(b => b.nome.toLowerCase() === selectedMarcaNome.toLowerCase())) {
            bfmDataTemp.brands.push({ id: selectedMarcaId, nome: selectedMarcaNome });
            saveBFMFleetData(bfmDataTemp);
            brands = bfmDataTemp.brands;
        } else {
            const existing = bfmDataTemp.brands.find(b => b.nome.toLowerCase() === selectedMarcaNome.toLowerCase());
            selectedMarcaId = existing.id;
        }
    }

    const selectedModeloNome = document.getElementById('modelo').value;
    const selectedTipoVeiculoNome = document.getElementById('tipoVeiculo').value;
    const selectedCombustivelNome = document.getElementById('combustivel').value;
    const modeloId = models.find(m => m.nome === selectedModeloNome)?.id || Date.now();
    const tipoVeiculoId = types.find(t => t.nome === selectedTipoVeiculoNome)?.id || Date.now();
    const combustivelId = fuels.find(f => f.nome === selectedCombustivelNome)?.id || Date.now();

    const newVehicle = {
        id: Date.now(),
        registrationDate: new Date().toISOString().slice(0, 10),
        Nome: document.getElementById('Nome').value,
        placa: document.getElementById('placa').value.toUpperCase(),
        chassi: document.getElementById('chassi').value.toUpperCase(),
        marcaId: selectedMarcaId,
        marca: selectedMarcaNome,
        modeloId: modeloId,
        modelo: selectedModeloNome,
        anoFabricacao: document.getElementById('anoFabricacao').value,
        tipoVeiculoId: tipoVeiculoId,
        tipoVeiculo: selectedTipoVeiculoNome,
        combustivelId: combustivelId,
        combustivel: selectedCombustivelNome,
        cor: document.getElementById('cor').value,
        renavam: document.getElementById('renavam').value,
        quilometragemAtual: currentKm,
        horimetroAtual: currentHr,
        status: document.getElementById('status').value,
        ultimaRevisao: document.getElementById('ultimaRevisao').value,
        quilometragemRevisao: lastRevKm,
        horimetroRevisao: lastRevHr,
        hasPMP: document.getElementById('hasPMP').checked,
        hasPL: document.getElementById('hasPL').checked,
        documents: [],
    };

    const documentUploadInput = document.getElementById('documentUpload');
    if (documentUploadInput && documentUploadInput.files.length > 0) {
        Array.from(documentUploadInput.files).forEach(file => {
            newVehicle.documents.push(file.name);
        });
    }

    let bfmData = getBFMFleetData();
    bfmData.vehicles.push(newVehicle);

    if (selectedModeloNome && !bfmData.models.some(m => m.nome.toLowerCase() === selectedModeloNome.toLowerCase())) {
        bfmData.models.push({ id: modeloId, nome: selectedModeloNome, brandId: selectedMarcaId });
    }
    if (selectedTipoVeiculoNome && !bfmData.customCompartmentTypes.some(t => t.nome.toLowerCase() === selectedTipoVeiculoNome.toLowerCase())) {
        bfmData.customCompartmentTypes.push({ id: tipoVeiculoId, nome: selectedTipoVeiculoNome });
    }
    if (selectedCombustivelNome && !bfmData.fuels.some(f => f.nome.toLowerCase() === selectedCombustivelNome.toLowerCase())) {
        bfmData.fuels.push({ id: combustivelId, nome: selectedCombustivelNome });
    }

    saveBFMFleetData(bfmData);
    vehicles = bfmData.vehicles;
    brands = bfmData.brands;
    models = bfmData.models;
    types = bfmData.customCompartmentTypes;
    fuels = bfmData.fuels;

    showFeedback('Veículo cadastrado com sucesso!', 'success');
    vehicleForm.reset();
    renderAllSelects();
    renderVehiclesTable();

    if (documentUploadInput) {
        documentUploadInput.value = '';
        const fileNameSpan = document.getElementById('file-name');
        if (fileNameSpan) fileNameSpan.textContent = 'Nenhum arquivo selecionado.';
    }
});


function renderVehiclesTable() {
    const vehiclesTableBody = document.getElementById('vehiclesTableBody');
    if (!vehiclesTableBody) {
        console.error('Elemento com id "vehiclesTableBody" não encontrado. Certifique-se de que o HTML possui a tag <tbody id="vehiclesTableBody">');
        return;
    }

    vehiclesTableBody.innerHTML = '';
    vehicles = getBFMFleetData().vehicles || [];
    brands = getBFMFleetData().brands || [];
    types = getBFMFleetData().customCompartmentTypes || [];
    fuels = getBFMFleetData().fuels || [];

    if (vehicles.length === 0) {
        const row = vehiclesTableBody.insertRow();
        row.innerHTML = `<td colspan="15" class="px-6 py-4 whitespace-nowrap text-center text-gray-500">Nenhum veículo cadastrado.</td>`;
        return;
    }

    vehicles.forEach(vehicle => {
        const row = vehiclesTableBody.insertRow();
        const documentCount = (vehicle.documents && vehicle.documents.length > 0) ? vehicle.documents.length : 0;
        const marcaNome = brands.find(b => b.id === vehicle.marcaId)?.nome || vehicle.marca || 'Desconhecida';
        const tipoVeiculoNome = types.find(t => t.nome === vehicle.tipoVeiculo)?.nome || vehicle.tipoVeiculo || 'Desconhecido';
        const modeloNome = models.find(m => m.nome === vehicle.modelo)?.nome || vehicle.modelo || 'Desconhecido';
        const combustivelNome = fuels.find(f => f.nome === vehicle.combustivel)?.nome || vehicle.combustivel || 'Desconhecido';
        const formattedUltimaRevisao = vehicle.ultimaRevisao || 'N/A';

        const registrationDate = new Date(vehicle.registrationDate);
        const formattedRegistrationDate = !isNaN(registrationDate) ? registrationDate.toLocaleDateString('pt-BR') : 'N/A';

        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${formattedRegistrationDate || ''}</td>
            <td class="px-6 py-4 whitespace-nowrap">${vehicle.Nome || 'ID: ' + vehicle.id}</td>
            <td class="px-6 py-4 whitespace-nowrap">${vehicle.placa || ''}</td>
            <td class="px-6 py-4 whitespace-nowrap">${modeloNome || 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap">${marcaNome || 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap">${vehicle.anoFabricacao || ''}</td>
            <td class="px-6 py-4 whitespace-nowrap">${tipoVeiculoNome || 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap">${vehicle.quilometragemAtual || '0'} KM</td>
            <td class="px-6 py-4 whitespace-nowrap">${vehicle.horimetroAtual || '0'} HR</td>
            <td class="px-6 py-4 whitespace-nowrap">${vehicle.renavam || ''}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${vehicle.hasPMP ? '<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 mr-1">PMP</span>' : ''}
                ${vehicle.hasPL ? '<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">PL</span>' : ''}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${vehicle.status === 'ATIVO' ? 'bg-green-100 text-green-800' : vehicle.status === 'MANUTENÇÃO' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}">
                    ${vehicle.status || ''}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">${formattedUltimaRevisao || 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap">${vehicle.quilometragemRevisao || 'N/A'} KM</td>
            <td class="px-6 py-4 whitespace-nowrap">${vehicle.horimetroRevisao || 'N/A'} HR</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col items-start space-y-2">
                    ${documentCount > 0 ?
                        `<button onclick="viewDocuments(${vehicle.id})" class="btn-info text-left">
                            <i class="ph ph-file-text"></i>
                            Doc. ${documentCount}
                        </button>` :
                        `<span class="text-gray-400 text-sm">0 Docs.</span>`
                    }
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col items-start space-y-2">
                    <button onclick="openEditVehicleModal(${vehicle.id})" class="btn-edit text-left">
                        <i class="ph ph-pencil"></i>
                        Editar
                    </button>
                    <button onclick="deleteVehicle(${vehicle.id})" class="btn-delete text-left">
                        <i class="ph ph-trash"></i>
                        Excluir
                    </button>
                </div>
            </td>
        `;
        vehiclesTableBody.appendChild(row);
    });
}

const viewDocumentsModal = document.getElementById('viewDocumentsModal');
const viewDocumentsList = document.getElementById('viewDocumentsList');
const closeViewDocumentsModal = document.getElementById('closeViewDocumentsModal');

window.viewDocuments = function(vehicleId) {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle && vehicle.documents && vehicle.documents.length > 0) {
        viewDocumentsList.innerHTML = '';
        vehicle.documents.forEach(docName => {
            const li = document.createElement('li');
            li.className = 'flex items-center justify-between p-2 border-b border-gray-200 last:border-b-0';
            li.innerHTML = `
                <span>${docName}</span>
                <a href="#" class="text-blue-500 hover:text-blue-700" download="${docName}">
                    <i class="ph ph-download-simple"></i>
                </a>
            `;
            viewDocumentsList.appendChild(li);
        });
        viewDocumentsModal.classList.add('active', 'flex');
        viewDocumentsModal.classList.remove('hidden');
    } else {
        showFeedback('Nenhum documento encontrado para este veículo.', 'info');
    }
};

if (closeViewDocumentsModal) {
    closeViewDocumentsModal.addEventListener('click', () => {
        viewDocumentsModal.classList.add('hidden');
        viewDocumentsModal.classList.remove('active', 'flex');
    });
}

window.openEditVehicleModal = function(id) {
    currentEditingVehicleId = id;
    const vehicleToEdit = vehicles.find(v => v.id === id);

    if (vehicleToEdit) {
        document.getElementById('edit-Nome').value = vehicleToEdit.Nome || '';
        document.getElementById('edit-placa').value = vehicleToEdit.placa;
        document.getElementById('edit-chassi').value = vehicleToEdit.chassi;
        document.getElementById('edit-anoFabricacao').value = vehicleToEdit.anoFabricacao;
        document.getElementById('edit-cor').value = vehicleToEdit.cor;
        document.getElementById('edit-renavam').value = vehicleToEdit.renavam;
        document.getElementById('edit-quilometragemAtual').value = vehicleToEdit.quilometragemAtual || '';
        document.getElementById('edit-horimetroAtual').value = vehicleToEdit.horimetroAtual || '';
        document.getElementById('edit-status').value = vehicleToEdit.status;
        document.getElementById('edit-ultimaRevisao').value = vehicleToEdit.ultimaRevisao;
        document.getElementById('edit-quilometragemRevisao').value = vehicleToEdit.quilometragemRevisao || '';
        document.getElementById('edit-horimetroRevisao').value = vehicleToEdit.horimetroRevisao || '';
        document.getElementById('edit-hasPMP').checked = vehicleToEdit.hasPMP;
        document.getElementById('edit-hasPL').checked = vehicleToEdit.hasPL;

        selectedEditDocuments = [...(vehicleToEdit.documents || [])];
        renderEditDocumentList(selectedEditDocuments);

        renderAllSelects({
            ...vehicleToEdit,
            marcaId: vehicleToEdit.marcaId,
            tipoVeiculo: vehicleToEdit.tipoVeiculo,
            modelo: vehicleToEdit.modelo,
            combustivel: vehicleToEdit.combustivel
        });

        editVehicleModal.classList.add('active', 'flex');
        editVehicleModal.classList.remove('hidden');
    } else {
        showFeedback('Veículo não encontrado para edição.', 'error');
    }
};

window.closeEditVehicleModal = function() {
    editVehicleModal.classList.remove('active', 'flex');
    editVehicleModal.classList.add('hidden');
    userFeedback.classList.add('hidden');
    userFeedback.classList.remove('show');
};

if (closeEditVehicleModalButton) {
    closeEditVehicleModalButton.addEventListener('click', window.closeEditVehicleModal);
}

editVehicleModal.addEventListener('click', function(event) {
    if (event.target === editVehicleModal) {
        window.closeEditVehicleModal();
    }
});

function renderEditDocumentList(documentNames) {
    const editDocumentList = document.getElementById('edit-documentList');
    if (!editDocumentList) return;

    editDocumentList.innerHTML = '';
    if (documentNames.length === 0) {
        editDocumentList.innerHTML = '<p class="text-gray-500 text-sm">Nenhum documento anexado.</p>';
        return;
    }
    documentNames.forEach((docName, index) => {
        const li = document.createElement('li');
        li.className = 'flex items-center justify-between p-2 border-b border-gray-200 last:border-b-0 text-sm';
        li.innerHTML = `
            <span>${docName}</span>
            <div class="flex items-center">
                <button type="button" onclick="removeEditDocument(${index})" class="text-red-500 hover:text-red-700 ml-2 p-1 rounded-full hover:bg-red-100 transition-colors" title="Remover documento">
                    <i class="ph ph-x-circle text-lg"></i>
                </button>
            </div>
        `;
        editDocumentList.appendChild(li);
    });
}

window.removeEditDocument = function(indexToRemove) {
    if (selectedEditDocuments.length > indexToRemove) {
        selectedEditDocuments.splice(indexToRemove, 1);
        renderEditDocumentList(selectedEditDocuments);
    }
};

document.getElementById('edit-documentUpload').addEventListener('change', function(event) {
    const files = event.target.files;
    if (files.length > 0) {
        Array.from(files).forEach(file => {
            if (!selectedEditDocuments.includes(file.name)) {
                selectedEditDocuments.push(file.name);
            } else {
                showFeedback(`O arquivo "${file.name}" já foi adicionado.`, 'warning');
            }
        });
        renderEditDocumentList(selectedEditDocuments);
        event.target.value = '';
    }
});


// CORREÇÃO: Lógica de submissão do formulário de edição para salvar os IDs e Nomes corretamente.
editVehicleForm.addEventListener('submit', function(event) {
    event.preventDefault();

    if (!currentEditingVehicleId) return;

    const vehicleIndex = vehicles.findIndex(v => v.id === currentEditingVehicleId);
    if (vehicleIndex > -1) {
        const currentKm = parseInt(document.getElementById('edit-quilometragemAtual').value, 10) || 0;
        const currentHr = parseInt(document.getElementById('edit-horimetroAtual').value, 10) || 0;
        const lastRevKm = parseInt(document.getElementById('edit-quilometragemRevisao').value, 10) || 0;
        const lastRevHr = parseInt(document.getElementById('edit-horimetroRevisao').value, 10) || 0;

        if (lastRevKm > currentKm) {
            showFeedback('Quilometragem da última revisão não pode ser maior que a quilometragem atual.', 'error');
            return;
        }
        if (lastRevHr > currentHr) {
            showFeedback('Horímetro da última revisão não pode ser maior que o horímetro atual.', 'error');
            return;
        }

        const rawEditedMarcaValue = document.getElementById('edit-marca').value;
        let editedMarcaId;
        let editedMarcaNome;
        const existingEditedBrandById = brands.find(b => b.id == rawEditedMarcaValue);
        const existingEditedBrandByName = brands.find(b => b.nome.toLowerCase() === rawEditedMarcaValue.toLowerCase());

        if (existingEditedBrandById) {
            editedMarcaId = existingEditedBrandById.id;
            editedMarcaNome = existingEditedBrandById.nome;
        } else if (existingEditedBrandByName) {
            editedMarcaId = existingEditedBrandByName.id;
            editedMarcaNome = existingEditedBrandByName.nome;
        } else {
            editedMarcaId = Date.now();
            editedMarcaNome = rawEditedMarcaValue;
            let bfmDataTemp = getBFMFleetData();
            if (!bfmDataTemp.brands.some(b => b.nome.toLowerCase() === editedMarcaNome.toLowerCase())) {
                bfmDataTemp.brands.push({ id: editedMarcaId, nome: editedMarcaNome });
                saveBFMFleetData(bfmDataTemp);
                brands = bfmDataTemp.brands;
            } else {
                const existing = bfmDataTemp.brands.find(b => b.nome.toLowerCase() === editedMarcaNome.toLowerCase());
                editedMarcaId = existing.id;
            }
        }
        
        const editedModeloNome = document.getElementById('edit-modelo').value;
        const editedTipoVeiculoNome = document.getElementById('edit-tipoVeiculo').value;
        const editedCombustivelNome = document.getElementById('edit-combustivel').value;
        
        const editedModeloId = models.find(m => m.nome === editedModeloNome)?.id || Date.now();
        const editedTipoVeiculoId = types.find(t => t.nome === editedTipoVeiculoNome)?.id || Date.now();
        const editedCombustivelId = fuels.find(f => f.nome === editedCombustivelNome)?.id || Date.now();

        vehicles[vehicleIndex] = {
            ...vehicles[vehicleIndex],
            Nome: document.getElementById('edit-Nome').value,
            placa: document.getElementById('edit-placa').value.toUpperCase(),
            chassi: document.getElementById('edit-chassi').value.toUpperCase(),
            marcaId: editedMarcaId,
            marca: editedMarcaNome,
            modeloId: editedModeloId,
            modelo: editedModeloNome,
            anoFabricacao: document.getElementById('edit-anoFabricacao').value,
            tipoVeiculoId: editedTipoVeiculoId,
            tipoVeiculo: editedTipoVeiculoNome,
            combustivelId: editedCombustivelId,
            combustivel: editedCombustivelNome,
            cor: document.getElementById('edit-cor').value,
            renavam: document.getElementById('edit-renavam').value,
            quilometragemAtual: currentKm,
            horimetroAtual: currentHr,
            status: document.getElementById('edit-status').value,
            ultimaRevisao: document.getElementById('edit-ultimaRevisao').value,
            quilometragemRevisao: lastRevKm,
            horimetroRevisao: lastRevHr,
            hasPMP: document.getElementById('edit-hasPMP').checked,
            hasPL: document.getElementById('edit-hasPL').checked,
            documents: selectedEditDocuments,
        };

        let bfmData = getBFMFleetData();
        bfmData.vehicles = vehicles;

        if (editedModeloNome && !bfmData.models.some(m => m.nome.toLowerCase() === editedModeloNome.toLowerCase())) {
            bfmData.models.push({ id: editedModeloId, nome: editedModeloNome, brandId: editedMarcaId });
        }
        if (editedTipoVeiculoNome && !bfmData.customCompartmentTypes.some(t => t.nome.toLowerCase() === editedTipoVeiculoNome.toLowerCase())) {
            bfmData.customCompartmentTypes.push({ id: editedTipoVeiculoId, nome: editedTipoVeiculoNome });
        }
        if (editedCombustivelNome && !bfmData.fuels.some(f => f.nome.toLowerCase() === editedCombustivelNome.toLowerCase())) {
            bfmData.fuels.push({ id: editedCombustivelId, nome: editedCombustivelNome });
        }
        saveBFMFleetData(bfmData);
        showFeedback('Veículo atualizado com sucesso!', 'success');
        renderVehiclesTable();
        closeEditVehicleModal();
    } else {
        showFeedback('Erro ao atualizar veículo.', 'error');
    }
});


window.deleteVehicle = function(id) {
    if (confirm('Tem certeza que deseja excluir este veículo? Esta ação é irreversível.')) {
        let bfmData = getBFMFleetData();
        bfmData.vehicles = bfmData.vehicles.filter(v => v.id !== id);
        saveBFMFleetData(bfmData);
        vehicles = bfmData.vehicles;
        renderVehiclesTable();
        showFeedback('Veículo excluído com sucesso!', 'info');
    }
};

window.openRegisterModal = function(type) {
    currentRegisterType = type;
    let title = 'Novo Item';
    let placeholder = 'Digite o nome';
    if (type === 'marca') {
        title = 'Cadastrar Nova Marca';
        placeholder = 'Digite o nome da Marca';
    } else if (type === 'modelo') {
        title = 'Cadastrar Novo Modelo';
        placeholder = 'Digite o nome do Modelo';
    } else if (type === 'tipo') {
        title = 'Cadastrar Novo Tipo';
        placeholder = 'Digite o nome do Tipo';
    } else if (type === 'combustivel') {
        title = 'Cadastrar Novo Combustível';
        placeholder = 'Digite o nome do Combustível';
    }

    if (registerModalTitle && registerNameInput && registerModal) {
        registerModalTitle.textContent = title;
        registerNameInput.placeholder = placeholder;
        registerNameInput.value = '';
        populateRegisterList(type);
        registerModal.classList.add('active', 'flex');
        registerModal.classList.remove('hidden');
    } else {
        console.error('Um ou mais elementos do modal de registro não foram encontrados.');
    }
};

window.closeRegisterModal = function() {
    if (registerModal) {
        registerModal.classList.remove('active', 'flex');
        registerModal.classList.add('hidden');
        registerNameInput.value = '';
        userFeedback.classList.add('hidden');
        userFeedback.classList.remove('show');
    }
};

if (registerModal) {
    registerModal.addEventListener('click', function(event) {
        if (event.target === registerModal) {
            window.closeRegisterModal();
        }
    });
}

if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const nome = registerNameInput.value.trim();

        if (!nome) {
            showFeedback('Por favor, insira um nome.', 'error');
            return;
        }

        let bfmData = getBFMFleetData();
        let currentArray = [];
        let itemExists = false;

        if (currentRegisterType === 'marca') {
            currentArray = bfmData.brands;
            itemExists = currentArray.some(item => item.nome.toLowerCase() === nome.toLowerCase());
        } else if (currentRegisterType === 'modelo') {
            currentArray = bfmData.models;
            itemExists = currentArray.some(item => item.nome.toLowerCase() === nome.toLowerCase());
        } else if (currentRegisterType === 'tipo') {
            currentArray = bfmData.customCompartmentTypes;
            itemExists = currentArray.some(item => item.nome.toLowerCase() === nome.toLowerCase());
        } else if (currentRegisterType === 'combustivel') {
            currentArray = bfmData.fuels;
            itemExists = currentArray.some(item => item.nome.toLowerCase() === nome.toLowerCase());
        }

        if (itemExists) {
            showFeedback(`${nome} já está cadastrado como ${currentRegisterType}.`, 'warning');
            return;
        }

        const newItem = {
            id: Date.now(),
            nome: nome
        };
        currentArray.push(newItem);

        if (currentRegisterType === 'marca') {
            bfmData.brands = currentArray;
        } else if (currentRegisterType === 'modelo') {
            bfmData.models = currentArray;
        } else if (currentRegisterType === 'tipo') {
            bfmData.customCompartmentTypes = currentArray;
        } else if (currentRegisterType === 'combustivel') {
            bfmData.fuels = currentArray;
        }

        saveBFMFleetData(bfmData);
        showFeedback(`${nome} adicionado com sucesso!`, 'success');
        registerNameInput.value = '';
        populateRegisterList(currentRegisterType);
        renderAllSelects();
    });
}

function populateRegisterList(type) {
    let itemsArray = [];
    const bfmData = getBFMFleetData();

    if (type === 'marca') {
        itemsArray = bfmData.brands;
    } else if (type === 'modelo') {
        itemsArray = bfmData.models;
    } else if (type === 'tipo') {
        itemsArray = bfmData.customCompartmentTypes;
    } else if (type === 'combustivel') {
        itemsArray = bfmData.fuels;
    }

    if (registerList) {
        registerList.innerHTML = '';

        if (itemsArray.length === 0) {
            registerList.innerHTML = '<p class="text-gray-500">Nenhum item cadastrado.</p>';
            return;
        }

        itemsArray.forEach(item => {
            const listItem = document.createElement('li');
            listItem.className = 'flex items-center justify-between p-2 hover:bg-gray-50 rounded-md';
            listItem.innerHTML = `
                <span>${item.nome}</span>
                <button type="button" onclick="deleteRegisterItem('${type}', ${item.id})" class="text-red-500 hover:text-red-700 ml-2">
                    <i class="ph ph-trash"></i>
                </button>
            `;
            registerList.appendChild(listItem);
        });
    }
}

window.deleteRegisterItem = function(type, idToDelete) {
    let bfmData = getBFMFleetData();
    let currentArray;
    let relatedVehiclesExist = false;
    let itemName = '';

    if (type === 'marca') {
        currentArray = bfmData.brands;
        const marca = currentArray.find(item => item.id === idToDelete);
        itemName = marca ? marca.nome : 'Marca desconhecida';
        relatedVehiclesExist = bfmData.vehicles.some(v => v.marcaId === idToDelete);
    } else if (type === 'modelo') {
        currentArray = bfmData.models;
        const modelo = currentArray.find(item => item.id === idToDelete);
        itemName = modelo ? modelo.nome : 'Modelo desconhecido';
        relatedVehiclesExist = bfmData.vehicles.some(v => v.modelo === modelo?.nome);
    } else if (type === 'tipo') {
        currentArray = bfmData.customCompartmentTypes;
        const tipo = currentArray.find(item => item.id === idToDelete);
        itemName = tipo ? tipo.nome : 'Tipo desconhecido';
        relatedVehiclesExist = bfmData.vehicles.some(v => v.tipoVeiculo === tipo?.nome);
    } else if (type === 'combustivel') {
        currentArray = bfmData.fuels;
        const combustivel = currentArray.find(item => item.id === idToDelete);
        itemName = combustivel ? combustivel.nome : 'Combustível desconhecido';
        relatedVehiclesExist = bfmData.vehicles.some(v => v.combustivel === combustivel?.nome);
    }

    if (relatedVehiclesExist) {
        showFeedback(`Não é possível excluir "${itemName}" porque está sendo utilizado por um ou mais veículos.`, 'error');
        return;
    }

    if (confirm(`Tem certeza que deseja excluir "${itemName}"?`)) {
        const updatedArray = currentArray.filter(item => item.id !== idToDelete);

        if (type === 'marca') {
            bfmData.brands = updatedArray;
        } else if (type === 'modelo') {
            bfmData.models = updatedArray;
        } else if (type === 'tipo') {
            bfmData.customCompartmentTypes = updatedArray;
        } else if (type === 'combustivel') {
            bfmData.fuels = updatedArray;
        }

        saveBFMFleetData(bfmData);
        showFeedback(`${itemName} excluído com sucesso!`, 'info');
        populateRegisterList(type);
        renderAllSelects();
    }
};