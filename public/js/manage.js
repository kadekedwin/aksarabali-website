let currentPage = 1;
let totalPages = 1;
let totalItems = 0;
let itemsPerPage = 10;
let currentCategory = '';
let currentSearch = '';
let aksaraData = [];
let modelFile = null;
let currentAksaraName = '';

const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const resetBtn = document.getElementById('resetBtn');
const addNewBtn = document.getElementById('addNewBtn');
const exportBtn = document.getElementById('exportBtn');
const refreshBtn = document.getElementById('refreshBtn');
const aksaraTable = document.getElementById('aksaraTable');
const aksaraTableBody = document.getElementById('aksaraTableBody');
const paginationElement = document.getElementById('pagination');
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const alertContainer = document.getElementById('alertContainer');

const editModal = document.getElementById('editModal');
const deleteModal = document.getElementById('deleteModal');
const closeEditModal = editModal.querySelector('.close');
const closeDeleteModal = deleteModal.querySelector('.close');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

const modelUploadZone = document.getElementById('modelUploadZone');
const toggleModelUploadBtn = document.getElementById('toggleModelUploadBtn');
const modelFileInput = document.getElementById('modelFileInput');

const API_BASE = '/api';

async function init() {
    updateStats();
    setupEventListeners();
    await loadData();
}

async function loadData(page = 1) {
    try {
        showLoadingState();
        
        let endpoint = `/aksara?page=${page}&limit=${itemsPerPage}`;
        if (currentCategory) endpoint += `&kategori=${encodeURIComponent(currentCategory)}`;
        
        let data;
        if (currentSearch) {
            data = await apiCall(`/aksara/search?q=${encodeURIComponent(currentSearch)}&page=${page}&limit=${itemsPerPage}`);
        } else {
            data = await apiCall(endpoint);
        }
        
        if (data.success) {
            aksaraData = data.data;
            currentPage = data.pagination.page;
            totalPages = data.pagination.totalPages;
            totalItems = data.pagination.total;
            
            renderTable();
            renderPagination();
            
            if (aksaraData.length === 0) {
                showEmptyState();
            }
        }
    } catch (error) {
        console.error('Failed to load data:', error);
        showAlert('error', 'Gagal memuat data. Silakan coba lagi.');
    } finally {
        hideLoadingState();
    }
}

async function apiCall(endpoint) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

function renderTable() {
    aksaraTableBody.innerHTML = '';
    
    if (aksaraData.length === 0) {
        aksaraTable.classList.add('hidden');
        showEmptyState();
        return;
    }
    
    aksaraTable.classList.remove('hidden');
    emptyState.classList.add('hidden');
    
    aksaraData.forEach(aksara => {
        const row = document.createElement('tr');
        
        const updatedDate = new Date(aksara.updated_at || aksara.created_at);
        const formattedDate = updatedDate.toISOString().split('T')[0];
        
        row.innerHTML = `
            <td>${aksara.id}</td>
            <td class="aksara-cell">${aksara.aksara_bali}</td>
            <td>${aksara.nama}</td>
            <td>${aksara.latin}</td>
            <td><span class="category-badge">${aksara.kategori}</span></td>
            <td>${formattedDate}</td>
            <td class="action-cell">
                <button class="btn btn-sm btn-warning" data-action="edit" data-id="${aksara.id}">Edit</button>
                <button class="btn btn-sm btn-danger" data-action="delete" data-id="${aksara.id}">Hapus</button>
            </td>
        `;
        
        aksaraTableBody.appendChild(row);
    });
    
    const actionButtons = aksaraTableBody.querySelectorAll('[data-action]');
    actionButtons.forEach(button => {
        const action = button.getAttribute('data-action');
        const id = button.getAttribute('data-id');
        
        button.addEventListener('click', () => {
            handleAction(action, id);
        });
    });
}

function handleAction(action, id) {
    const aksara = aksaraData.find(item => item.id == id);
    
    if (!aksara) {
        showAlert('error', 'Data aksara tidak ditemukan.');
        return;
    }
    
    switch(action) {
        case 'view':
            window.location.href = `/?id=${id}`;
            break;
            
        case 'edit':
            openEditModal(aksara);
            break;
            
        case 'delete':
            openDeleteModal(aksara);
            break;
    }
}

function openEditModal(aksara) {
    document.getElementById('editId').value = aksara.id;
    document.getElementById('editAksaraBali').value = aksara.aksara_bali;
    document.getElementById('editNama').value = aksara.nama;
    document.getElementById('editLatin').value = aksara.latin;
    document.getElementById('editKategori').value = aksara.kategori;
    document.getElementById('editUnicodeAksara').value = aksara.unicode_aksara || '';
    document.getElementById('editContohPenggunaan').value = aksara.contoh_penggunaan || '';
    document.getElementById('editDeskripsi').value = aksara.deskripsi || '';
    
    currentAksaraName = aksara.nama;
    modelFile = null;
    modelUploadZone.style.display = 'none';
    
    const modelStatus = document.getElementById('modelStatus');
    const viewModelBtn = document.getElementById('viewModelBtn');
    
    if (aksara.has_model) {
        modelStatus.textContent = 'Model 3D tersedia';
        modelStatus.style.color = '#4ade80';
        viewModelBtn.disabled = false;
    } else {
        modelStatus.textContent = 'Tidak ada model 3D';
        modelStatus.style.color = '#999';
        viewModelBtn.disabled = true;
    }
    
    editModal.style.display = 'block';
}

function openDeleteModal(aksara) {
    document.getElementById('deleteAksaraChar').textContent = aksara.aksara_bali;
    document.getElementById('deleteAksaraName').textContent = aksara.nama;
    
    confirmDeleteBtn.setAttribute('data-id', aksara.id);
    
    deleteModal.style.display = 'block';
}

function renderPagination() {
    if (totalPages <= 1) {
        paginationElement.innerHTML = '';
        return;
    }
    
    let html = '';
    
    html += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">‹</button>`;
    
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
        html += `<button onclick="changePage(1)">1</button>`;
        if (startPage > 2) html += `<span>...</span>`;
    }
    
    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) html += `<span>...</span>`;
        html += `<button onclick="changePage(${totalPages})">${totalPages}</button>`;
    }
    
    html += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">›</button>`;
    
    paginationElement.innerHTML = html;
}

function changePage(page) {
    if (page >= 1 && page <= totalPages) {
        loadData(page);
    }
}

async function updateStats() {
    try {
        const response = await apiCall('/stats');
        
        if (response.success) {
            const stats = response.data;
            document.getElementById('totalAksara').textContent = stats.total || 0;
            document.getElementById('activeAksara').textContent = stats.activeCount || stats.total || 0;
            document.getElementById('categoriesCount').textContent = stats.categories?.length || 0;
            document.getElementById('has3dModels').textContent = stats.modelsCount || 0;
        }
    } catch (error) {
        console.error('Failed to load statistics:', error);
    }
}

function showLoadingState() {
    loadingState.classList.remove('hidden');
    aksaraTable.classList.add('hidden');
    emptyState.classList.add('hidden');
}

function hideLoadingState() {
    loadingState.classList.add('hidden');
}

function showEmptyState() {
    emptyState.classList.remove('hidden');
    aksaraTable.classList.add('hidden');
    
    let message = 'Tidak ada data ditemukan.';
    
    if (currentSearch) {
        message = `Tidak ada hasil untuk "${currentSearch}"`;
    } else if (currentCategory) {
        message = `Tidak ada data dalam kategori "${currentCategory}"`;
    }
    
    document.getElementById('emptyMessage').textContent = message;
}

function showAlert(type, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `
        <div>${message}</div>
        <button class="alert-close">&times;</button>
    `;
    
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alertDiv);
    alertContainer.classList.remove('hidden');
    
    alertDiv.querySelector('.alert-close').addEventListener('click', function() {
        alertContainer.classList.add('hidden');
    });
    
    setTimeout(() => {
        alertContainer.classList.add('hidden');
    }, 5000);
}

function resetModelUploadForm() {
    modelUploadZone.style.display = 'none';
    toggleModelUploadBtn.textContent = 'Ganti Model';
    modelFileInput.value = '';
    modelFile = null;
    modelUploadZone.innerHTML = '<input type="file" id="modelFileInput" accept=".obj"><p>Klik atau jatuhkan file 3D model (.obj) di sini</p>';
}

function setupEventListeners() {
    document.getElementById('searchBtn').addEventListener('click', () => {
        const searchTerm = searchInput.value.trim();
        currentSearch = searchTerm;
        currentPage = 1;
        loadData();
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const searchTerm = searchInput.value.trim();
            currentSearch = searchTerm;
            currentPage = 1;
            loadData();
        }
    });
    
    categoryFilter.addEventListener('change', () => {
        currentCategory = categoryFilter.value;
        currentPage = 1;
        loadData();
    });
    
    resetBtn.addEventListener('click', () => {
        searchInput.value = '';
        categoryFilter.value = '';
        currentSearch = '';
        currentCategory = '';
        currentPage = 1;
        loadData();
    });
    
    addNewBtn.addEventListener('click', () => {
        window.location.href = '/upload';
    });
    
    exportBtn.addEventListener('click', () => {
        showAlert('warning', 'Fitur export data sedang dalam pengembangan.');
    });
    
    refreshBtn.addEventListener('click', () => {
        loadData(currentPage);
        updateStats();
    });
    
    closeEditModal.addEventListener('click', () => {
        editModal.style.display = 'none';
        resetModelUploadForm();
    });
    
    closeDeleteModal.addEventListener('click', () => {
        deleteModal.style.display = 'none';
    });
    
    cancelEditBtn.addEventListener('click', () => {
        editModal.style.display = 'none';
        resetModelUploadForm();
    });
    
    cancelDeleteBtn.addEventListener('click', () => {
        deleteModal.style.display = 'none';
    });
    
    toggleModelUploadBtn.addEventListener('click', () => {
        if (modelUploadZone.style.display === 'block') {
            resetModelUploadForm();
        } else {
            modelUploadZone.style.display = 'block';
            toggleModelUploadBtn.textContent = 'Batalkan';
        }
    });
    
    modelUploadZone.addEventListener('click', () => {   
        modelFileInput.click();
    });
    
    modelFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            modelFile = e.target.files[0];
            modelUploadZone.innerHTML = `<p>File dipilih: ${modelFile.name}</p>`;
        }
    });
    
    modelUploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        modelUploadZone.style.borderColor = '#4f46e5';
    });
    
    modelUploadZone.addEventListener('dragleave', () => {
        modelUploadZone.style.borderColor = '#333';
    });
    
    modelUploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        modelUploadZone.style.borderColor = '#333';
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            modelFile = e.dataTransfer.files[0];
            modelUploadZone.innerHTML = `<p>File dipilih: ${modelFile.name}</p>`;
        }
    });
    
    document.getElementById('editForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const saveBtn = document.getElementById('saveBtn');
        saveBtn.textContent = 'Menyimpan...';
        saveBtn.disabled = true;
        
        const formData = new FormData(e.target);
        const id = formData.get('id');
        const newName = formData.get('nama');
        
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });
        
        try {
            // First update the aksara data
            const response = await fetch(`${API_BASE}/aksara/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                // If a new model file was uploaded
                if (modelFile) {
                    const modelFormData = new FormData();
                    
                    // Create a new File object with the name matching the aksara name
                    const cleanName = newName.replace(/[^a-zA-Z0-9]/g, '_');
                    const newFile = new File([modelFile], `${cleanName}.obj`, {
                        type: modelFile.type
                    });
                    
                    // Append the renamed file to form data
                    modelFormData.append('model_file', newFile);
                    modelFormData.append('nama', newName);
                    
                    try {
                        const modelResponse = await fetch(`${API_BASE}/aksara/${id}/model`, {
                            method: 'POST',
                            body: modelFormData
                        });
                        
                        const modelResult = await modelResponse.json();
                        
                        if (modelResult.success) {
                            showAlert('success', 'Aksara dan model 3D berhasil diperbarui!');
                        } else {
                            showAlert('warning', 'Aksara diperbarui tetapi gagal mengunggah model 3D.');
                        }
                    } catch (modelError) {
                        console.error('Model upload failed:', modelError);
                        showAlert('warning', 'Aksara diperbarui tetapi gagal mengunggah model 3D.');
                    }
                } else {
                    // If no new model, but name was changed, we need to rename the existing model file
                    if (currentAksaraName !== newName) {
                        try {
                            // Call a special endpoint to rename the model file
                            await fetch(`${API_BASE}/aksara/${id}/rename-model`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    oldName: currentAksaraName,
                                    newName: newName
                                })
                            });
                        } catch (renameError) {
                            console.error('Model rename failed:', renameError);
                        }
                    }
                    showAlert('success', 'Aksara berhasil diperbarui!');
                }
                
                editModal.style.display = 'none';
                loadData(currentPage);
            } else {
                showAlert('error', `Gagal: ${result.message}`);
            }
        } catch (error) {
            console.error('Update failed:', error);
            showAlert('error', 'Gagal memperbarui aksara. Silakan coba lagi.');
        } finally {
            saveBtn.textContent = 'Simpan Perubahan';
            saveBtn.disabled = false;
        }
    });
    
    confirmDeleteBtn.addEventListener('click', async () => {
        const id = confirmDeleteBtn.getAttribute('data-id');
        confirmDeleteBtn.textContent = 'Menghapus...';
        confirmDeleteBtn.disabled = true;
        
        try {
            const response = await fetch(`${API_BASE}/aksara/${id}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (result.success) {
                showAlert('success', 'Aksara berhasil dihapus!');
                deleteModal.style.display = 'none';
                loadData(currentPage);
                updateStats();
            } else {
                showAlert('error', `Gagal: ${result.message}`);
            }
        } catch (error) {
            console.error('Delete failed:', error);
            showAlert('error', 'Gagal menghapus aksara. Silakan coba lagi.');
        } finally {
            confirmDeleteBtn.textContent = 'Ya, Hapus';
            confirmDeleteBtn.disabled = false;
        }
    });
    
    document.getElementById('viewModelBtn').addEventListener('click', () => {
        const id = document.getElementById('editId').value;
        window.open(`/?view=3d&id=${id}`, '_blank');
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === editModal) {
            editModal.style.display = 'none';
            resetModelUploadForm();
        } else if (e.target === deleteModal) {
            deleteModal.style.display = 'none';
        }
    });
}

window.changePage = changePage;

document.addEventListener('DOMContentLoaded', init);