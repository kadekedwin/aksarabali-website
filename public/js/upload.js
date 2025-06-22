const uploadForm = document.getElementById('uploadForm');
const previewBtn = document.getElementById('previewBtn');
const closePreviewBtn = document.getElementById('closePreviewBtn');
const previewSection = document.getElementById('previewSection');
const modelFile = document.getElementById('modelFile');
const fileNameLabel = document.getElementById('fileNameLabel');
const alertContainer = document.getElementById('alertContainer');
const resetBtn = document.getElementById('resetBtn');

const currentUser = 'kadekedwin';
document.getElementById('timestamp').textContent = 'Terakhir diperbarui: 21 Juni 2025, 09:52:10 UTC';

modelFile.addEventListener('change', function() {
    if (this.files && this.files.length > 0) {
        fileNameLabel.textContent = this.files[0].name;
    } else {
        fileNameLabel.textContent = 'Pilih file model 3D';
    }
});

previewBtn.addEventListener('click', function(e) {
    e.preventDefault();
    
    const aksaraBali = document.getElementById('aksaraBali').value;
    const nama = document.getElementById('nama').value;
    const latin = document.getElementById('latin').value;
    const kategori = document.getElementById('kategori').value;
    const unicode = document.getElementById('unicodeAksara').value;
    const contoh = document.getElementById('contohPenggunaan').value;
    const deskripsi = document.getElementById('deskripsi').value;
    
    document.getElementById('previewChar').textContent = aksaraBali || 'ᬓ';
    document.getElementById('previewName').textContent = nama || 'Nama Aksara';
    document.getElementById('previewLatin').textContent = latin || '-';
    document.getElementById('previewKategori').textContent = kategori || '-';
    document.getElementById('previewUnicode').textContent = unicode || '-';
    document.getElementById('previewContoh').textContent = contoh || '-';
    document.getElementById('previewDeskripsi').textContent = deskripsi || '-';
    
    previewSection.classList.remove('hidden');
});

closePreviewBtn.addEventListener('click', function() {
    previewSection.classList.add('hidden');
});

uploadForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    formData.append('uploaded_by', currentUser);
    formData.append('upload_date', new Date().toISOString());
    
    try {
        document.getElementById('submitBtn').textContent = 'Mengunggah...';
        document.getElementById('submitBtn').disabled = true;
        
        const response = await fetch('/api/aksara', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('success', 'Aksara berhasil diunggah!');
            resetForm();
        } else {
            showAlert('error', `Gagal: ${result.message}`);
        }
    } catch (error) {
        showAlert('error', 'Gagal mengunggah aksara. Silakan coba lagi.');
        console.error('Upload error:', error);
    } finally {
        document.getElementById('submitBtn').textContent = 'Upload Aksara';
        document.getElementById('submitBtn').disabled = false;
    }
});

resetBtn.addEventListener('click', function() {
    resetForm();
});

function resetForm() {
    uploadForm.reset();
    fileNameLabel.textContent = 'Pilih file model 3D';
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

document.addEventListener('DOMContentLoaded', function() {
    resetForm();
});