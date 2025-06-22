let currentPage = 1;
let totalPages = 1;
let currentCategory = '';
let currentSearch = '';

let scene, camera, renderer, controls;
let currentModel = null;
let modelGroup = null;
let animationId = null;
let isAutoRotating = false;
let isWireframe = false;

const API_BASE = '/api';

async function apiCall(endpoint) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

async function loadAksaraData(page = 1, category = '', search = '') {
    try {
        showLoading();
        
        let endpoint = `/aksara?page=${page}&limit=12`;
        if (category) endpoint += `&kategori=${encodeURIComponent(category)}`;
        
        let data;
        if (search) {
            data = await apiCall(`/aksara/search?q=${encodeURIComponent(search)}&page=${page}&limit=12`);
        } else {
            data = await apiCall(endpoint);
        }
        
        if (data.success) {
            currentPage = data.pagination.page;
            totalPages = data.pagination.totalPages;
            
            renderAksaraData(data.data);
            updateStats(data.pagination);
            renderPagination();
            
            if (data.data.length === 0) {
                showEmptyState(search ? `Tidak ditemukan hasil untuk "${search}"` : 'Tidak ada data dalam kategori ini');
            }
        }
    } catch (error) {
        showEmptyState('Gagal memuat data. Silakan coba lagi.');
        console.error('Load data error:', error);
    }
}

async function loadCategories() {
    try {
        const data = await apiCall('/categories');
        if (data.success) {
            const select = document.getElementById('categoryFilter');
            data.data.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Failed to load categories:', error);
    }
}

function renderAksaraData(data) {
    const grid = document.getElementById('aksaraGrid');
    grid.innerHTML = '';
    
    data.forEach(aksara => {
        const card = document.createElement('div');
        card.className = 'aksara-card';
        card.innerHTML = `
            <div class="aksara-char">${aksara.aksara_bali}</div>
            <div class="aksara-info">
                <h3>${aksara.nama}</h3>
                <div class="aksara-details">
                    <div class="detail-row">
                        <span class="detail-label">Latin:</span>
                        <span class="detail-value">${aksara.latin}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Unicode:</span>
                        <span class="detail-value">${aksara.unicode_aksara}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Kategori:</span>
                        <span class="category-badge">${aksara.kategori}</span>
                    </div>
                </div>
                <button class="view-3d-btn" onclick="show3DModal('${aksara.nama}', '${aksara.aksara_bali}')">
                    🎲 Lihat Model 3D
                </button>
            </div>
        `;
        
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('view-3d-btn')) {
                showAksaraModal(aksara);
            }
        });
        
        grid.appendChild(card);
    });
    
    hideLoading();
    document.getElementById('aksaraGrid').classList.remove('hidden');
}

function showAksaraModal(aksara) {
    const modal = document.getElementById('aksaraModal');
    document.getElementById('modalChar').textContent = aksara.aksara_bali;
    document.getElementById('modalName').textContent = aksara.nama;
    
    const details = document.getElementById('modalDetails');
    details.innerHTML = `
        <div class="modal-detail-row">
            <span class="modal-detail-label">Transliterasi:</span>
            <span class="modal-detail-value">${aksara.latin}</span>
        </div>
        <div class="modal-detail-row">
            <span class="modal-detail-label">Kategori:</span>
            <span class="modal-detail-value">${aksara.kategori}</span>
        </div>
        <div class="modal-detail-row">
            <span class="modal-detail-label">Unicode:</span>
            <span class="modal-detail-value">${aksara.unicode_aksara}</span>
        </div>
        ${aksara.contoh_penggunaan ? `
        <div class="modal-detail-row">
            <span class="modal-detail-label">Contoh:</span>
            <span class="modal-detail-value">${aksara.contoh_penggunaan}</span>
        </div>` : ''}
        ${aksara.deskripsi ? `
        <div class="modal-detail-row">
            <span class="modal-detail-label">Deskripsi:</span>
            <span class="modal-detail-value">${aksara.deskripsi}</span>
        </div>` : ''}
        <div class="modal-detail-row">
            <span class="modal-detail-label">Ditambahkan:</span>
            <span class="modal-detail-value">${new Date(aksara.created_at).toLocaleDateString('id-ID')}</span>
        </div>
        <div class="modal-detail-row" style="grid-column: 1 / -1;">
            <button class="view-3d-btn" onclick="show3DModal('${aksara.nama}', '${aksara.aksara_bali}'); document.getElementById('aksaraModal').style.display = 'none';">
                🎲 Lihat Model 3D
            </button>
        </div>
    `;
    
    modal.style.display = 'block';
}

function show3DModal(nama, char) {
    const modal = document.getElementById('modal3D');
    document.getElementById('modal3DTitle').textContent = `${nama} - Model 3D`;
    document.getElementById('modal3DSubtitle').textContent = `Aksara: ${char}`;
    
    modal.style.display = 'block';
    
    setTimeout(() => {
        init3DViewer();
        load3DModel(nama);
    }, 100);
}

function init3DViewer() {
    const container = document.getElementById('threeContainer');
    const loading = document.getElementById('threeLoading');
    const error = document.getElementById('threeError');
    
    loading.classList.remove('hidden');
    error.classList.add('hidden');
    
    if (renderer) {
        container.removeChild(renderer.domElement);
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    }
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 20;
    controls.maxPolarAngle = Math.PI;
    
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0x4f46e5, 0.5, 100);
    pointLight.position.set(-5, 5, 5);
    scene.add(pointLight);
    
    const gridHelper = new THREE.GridHelper(10, 10, 0x333333, 0x222222);
    scene.add(gridHelper);
    
    modelGroup = new THREE.Group();
    scene.add(modelGroup);
    
    animate();
    
    window.addEventListener('resize', onWindowResize);
}

async function load3DModel(nama) {
    const loading = document.getElementById('threeLoading');
    const error = document.getElementById('threeError');
    
    try {
        if (currentModel) {
            modelGroup.remove(currentModel);
            currentModel = null;
        }
        
        const loader = new THREE.OBJLoader();
        const modelPath = `3d/${nama}.obj`;
        
        loader.load(
            modelPath,
            function (object) {
                currentModel = object;
                
                const box = new THREE.Box3().setFromObject(object);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                
                const maxDimension = Math.max(size.x, size.y, size.z);
                const scale = 3 / maxDimension;
                object.scale.setScalar(scale);
                
                object.position.x = -center.x * scale;
                object.position.y = -center.y * scale;
                object.position.z = -center.z * scale;
                
                object.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {
                        child.material = new THREE.MeshPhongMaterial({
                            color: 0xffffff,
                            shininess: 100,
                            side: THREE.DoubleSide
                        });
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                modelGroup.add(object);
                loading.classList.add('hidden');
                
                resetCameraPosition();
            },
            function (progress) {
                console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
            },
            function (err) {
                console.error('Failed to load 3D model:', err);
                loading.classList.add('hidden');
                error.classList.remove('hidden');
            }
        );
        
    } catch (err) {
        console.error('3D model loading error:', err);
        loading.classList.add('hidden');
        error.classList.remove('hidden');
    }
}

function animate() {
    animationId = requestAnimationFrame(animate);
    
    if (controls) {
        controls.update();
    }
    
    if (isAutoRotating && modelGroup) {
        modelGroup.rotation.y += 0.01;
    }
    
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

function onWindowResize() {
    if (!camera || !renderer) return;
    
    const container = document.getElementById('threeContainer');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function resetCameraPosition() {
    if (!camera || !controls) return;
    
    camera.position.set(0, 0, 5);
    controls.reset();
}

function toggleAutoRotate() {
    isAutoRotating = !isAutoRotating;
    const btn = document.getElementById('autoRotate');
    btn.classList.toggle('active', isAutoRotating);
}

function toggleWireframe() {
    if (!currentModel) return;
    
    isWireframe = !isWireframe;
    currentModel.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
            child.material.wireframe = isWireframe;
        }
    });
    
    const btn = document.getElementById('wireframe');
    btn.classList.toggle('active', isWireframe);
}

function toggleFullscreen() {
    const modal = document.getElementById('modal3D');
    
    if (!document.fullscreenElement) {
        modal.requestFullscreen().catch(err => {
            console.error('Failed to enter fullscreen:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

function renderPagination() {
    const paginationHTML = generatePaginationHTML();
    document.getElementById('paginationTop').innerHTML = paginationHTML;
    document.getElementById('paginationBottom').innerHTML = paginationHTML;
    
    if (totalPages > 1) {
        document.getElementById('paginationTop').classList.remove('hidden');
        document.getElementById('paginationBottom').classList.remove('hidden');
    } else {
        document.getElementById('paginationTop').classList.add('hidden');
        document.getElementById('paginationBottom').classList.add('hidden');
    }
}

function generatePaginationHTML() {
    let html = '';
    
    html += `<button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>‹ Prev</button>`;
    
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
        html += `<button onclick="changePage(1)">1</button>`;
        if (startPage > 2) html += `<span>...</span>`;
    }
    
    for (let i = startPage; i <= endPage; i++) {
        html += `<button onclick="changePage(${i})" class="${i === currentPage ? 'active' : ''}">${i}</button>`;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) html += `<span>...</span>`;
        html += `<button onclick="changePage(${totalPages})">${totalPages}</button>`;
    }
    
    html += `<button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Next ›</button>`;
    
    return html;
}

function changePage(page) {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
        loadAksaraData(page, currentCategory, currentSearch);
    }
}

function updateStats(pagination) {
    document.getElementById('totalAksara').textContent = pagination.total;
    document.getElementById('currentPage').textContent = pagination.page;
    document.getElementById('totalPages').textContent = pagination.totalPages;
    document.getElementById('currentCategory').textContent = currentCategory || 'Semua';
}

function showLoading() {
    document.getElementById('loadingState').classList.remove('hidden');
    document.getElementById('emptyState').classList.add('hidden');
    document.getElementById('aksaraGrid').classList.add('hidden');
}

function hideLoading() {
    document.getElementById('loadingState').classList.add('hidden');
}

function showEmptyState(message) {
    document.getElementById('emptyMessage').textContent = message;
    document.getElementById('emptyState').classList.remove('hidden');
    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('aksaraGrid').classList.add('hidden');
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    searchInput.addEventListener('input', debounce((e) => {
        const query = e.target.value.trim();
        if (query.length >= 2) {
            currentSearch = query;
            currentPage = 1;
            loadAksaraData(currentPage, currentCategory, currentSearch);
        } else if (query.length === 0) {
            currentSearch = '';
            currentPage = 1;
            loadAksaraData(currentPage, currentCategory);
        }
    }, 500));
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = e.target.value.trim();
            currentSearch = query;
            currentPage = 1;
            loadAksaraData(currentPage, currentCategory, currentSearch);
        }
    });
    
    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim();
        currentSearch = query;
        currentPage = 1;
        loadAksaraData(currentPage, currentCategory, currentSearch);
    });
    
    document.getElementById('categoryFilter').addEventListener('change', (e) => {
        currentCategory = e.target.value;
        currentPage = 1;
        loadAksaraData(currentPage, currentCategory, currentSearch);
    });
    
    document.getElementById('resetBtn').addEventListener('click', () => {
        currentSearch = '';
        currentCategory = '';
        currentPage = 1;
        document.getElementById('searchInput').value = '';
        document.getElementById('categoryFilter').value = '';
        loadAksaraData();
    });
    
    const modal = document.getElementById('aksaraModal');
    const closeBtn = document.querySelector('.close');
    const modal3D = document.getElementById('modal3D');
    const close3DBtn = document.querySelector('.close-3d');
    
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    close3DBtn.addEventListener('click', () => {
        modal3D.style.display = 'none';
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        } else if (e.target === modal3D) {
            modal3D.style.display = 'none';
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        }
    });
    
    document.getElementById('resetCamera').addEventListener('click', resetCameraPosition);
    document.getElementById('autoRotate').addEventListener('click', toggleAutoRotate);
    document.getElementById('wireframe').addEventListener('click', toggleWireframe);
    document.getElementById('fullscreen').addEventListener('click', toggleFullscreen);
    
    document.addEventListener('keydown', (e) => {
        if (modal3D.style.display === 'block') {
            switch(e.key) {
                case 'Escape':
                    modal3D.style.display = 'none';
                    if (animationId) {
                        cancelAnimationFrame(animationId);
                    }
                    break;
                case 'r':
                case 'R':
                    resetCameraPosition();
                    break;
                case 'a':
                case 'A':
                    toggleAutoRotate();
                    break;
                case 'w':
                case 'W':
                    toggleWireframe();
                    break;
                case 'f':
                case 'F':
                    toggleFullscreen();
                    break;
            }
        }
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

async function initApp() {
    try {
        setupEventListeners();
        await loadCategories();
        await loadAksaraData();
    } catch (error) {
        console.error('Init error:', error);
        showEmptyState('Gagal menginisialisasi aplikasi');
    }
}

document.addEventListener('DOMContentLoaded', initApp);