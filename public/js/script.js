
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const status = document.getElementById('status');
const progress = document.getElementById('progress');
const progressBar = document.getElementById('progressBar');
const uploadedList = document.getElementById('uploadedList');

// Drag and drop handlers
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function handleFiles(files) {
    fileList.innerHTML = '';
    Array.from(files).forEach(file => {
        const div = document.createElement('div');
        div.className = 'file-item';
        div.innerHTML = `
            <span class="file-name">${file.name}</span>
            <span class="file-size">${formatFileSize(file.size)}</span>
            `;
        fileList.appendChild(div);
    });

    uploadFiles(files);
}

async function uploadFiles(files) {
    const formData = new FormData();
    Array.from(files).forEach(file => {
        formData.append('files', file);
    });

    progress.style.display = 'block';
    progressBar.style.width = '0%';

    try {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                progressBar.style.width = percentComplete + '%';
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                showStatus('Files uploaded successfully!', 'success');
                fileList.innerHTML = '';
                fileInput.value = '';
                loadUploadedFiles();
                setTimeout(() => {
                    progress.style.display = 'none';
                    progressBar.style.width = '0%';
                }, 1000);
            } else {
                showStatus('Upload failed!', 'error');
                progress.style.display = 'none';
            }
        });

        xhr.addEventListener('error', () => {
            showStatus('Upload failed!', 'error');
            progress.style.display = 'none';
        });

        xhr.open('POST', '/upload');
        xhr.send(formData);
    } catch (error) {
        showStatus('Upload failed: ' + error.message, 'error');
        progress.style.display = 'none';
    }
}

function showStatus(message, type) {
    status.textContent = message;
    status.className = 'status ' + type;
    status.style.display = 'block';
    setTimeout(() => {
        status.style.display = 'none';
    }, 5000);
}

async function loadUploadedFiles() {
    try {
        const response = await fetch('/files');
        const files = await response.json();
        uploadedList.innerHTML = files.map(file => `
            <div class="file-item">
            <span class="file-name">${file.name}</span>
            <div>
            <span class="file-size">${formatFileSize(file.size)}</span>
            <button class="download-btn" onclick="downloadFile('${file.name}')">
            ⬇️ Download
            </button>
            </div>
            </div>
            `).join('');
    } catch (error) {
        console.error('Failed to load files:', error);
    }
}

function downloadFile(filename) {
    window.location.href = '/download/' + encodeURIComponent(filename);
}

// Text buffer
const textInput = document.getElementById('textInput');
const charCount = document.getElementById('charCount');
const textStatus = document.getElementById('textStatus');

textInput.addEventListener('input', () => {
    charCount.textContent = textInput.value.length + ' characters';
});

async function appendText() {
    const text = textInput.value.trim();
    if (!text) {
        showTextStatus('Please enter some text first.', 'error');
        return;
    }
    const appendBtn = document.getElementById('appendBtn');
    appendBtn.disabled = true;
    try {
        const response = await fetch('/append-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        const result = await response.json();
        if (response.ok) {
            showTextStatus('✅ Text appended to notes.txt successfully!', 'success');
            textInput.value = '';
            charCount.textContent = '0 characters';
            loadUploadedFiles();
        } else {
            showTextStatus('Error: ' + result.error, 'error');
        }
    } catch (err) {
        showTextStatus('Failed to append text: ' + err.message, 'error');
    } finally {
        appendBtn.disabled = false;
    }
}

function clearText() {
    textInput.value = '';
    charCount.textContent = '0 characters';
    textStatus.style.display = 'none';
}

function showTextStatus(message, type) {
    textStatus.textContent = message;
    textStatus.className = 'text-status ' + type;
    textStatus.style.display = 'block';
    setTimeout(() => { textStatus.style.display = 'none'; }, 5000);
}

// Load files on page load
loadUploadedFiles();
