const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

const app = express();
const PORT = 3000;

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    }
});

// Serve static files
app.use(express.static('public'));
app.use('/uploads', express.static(uploadDir));

// Main page HTML
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Media Upload Server</title>
    <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        padding: 20px;
    }
    .container {
        max-width: 800px;
        margin: 0 auto;
        background: white;
        border-radius: 12px;
        padding: 40px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    h1 {
        color: #333;
        margin-bottom: 10px;
        font-size: 32px;
    }
    .subtitle {
        color: #666;
        margin-bottom: 30px;
        font-size: 14px;
    }
    .upload-area {
        border: 3px dashed #667eea;
        border-radius: 8px;
        padding: 60px 20px;
        text-align: center;
        background: #f8f9ff;
        cursor: pointer;
        transition: all 0.3s;
        margin-bottom: 30px;
    }
    .upload-area:hover {
        border-color: #764ba2;
        background: #f0f1ff;
    }
    .upload-area.dragover {
        border-color: #764ba2;
        background: #e8e9ff;
    }
    .upload-icon {
        font-size: 48px;
        margin-bottom: 15px;
    }
    input[type="file"] { display: none; }
    .btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 12px 30px;
        border-radius: 6px;
        font-size: 16px;
        cursor: pointer;
        transition: transform 0.2s;
    }
    .btn:hover { transform: translateY(-2px); }
    .btn:disabled {
        background: #ccc;
        cursor: not-allowed;
        transform: none;
    }
    .file-list {
        margin-top: 20px;
    }
    .file-item {
        background: #f5f5f5;
        padding: 15px;
        border-radius: 6px;
        margin-bottom: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .file-name {
        font-weight: 500;
        color: #333;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .file-size {
        color: #666;
        font-size: 14px;
        margin-left: 10px;
    }
    .status {
        padding: 10px 20px;
        border-radius: 6px;
        margin-bottom: 20px;
        display: none;
    }
    .status.success {
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
    }
    .status.error {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }
    .progress {
        width: 100%;
        height: 6px;
        background: #e0e0e0;
        border-radius: 3px;
        overflow: hidden;
        margin-top: 10px;
        display: none;
    }
    .progress-bar {
        height: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        width: 0%;
        transition: width 0.3s;
    }
    .uploaded-files {
        margin-top: 40px;
    }
    .uploaded-files h2 {
        color: #333;
        margin-bottom: 20px;
        font-size: 24px;
    }
    </style>
    </head>
    <body>
    <div class="container">
    <h1>📁 Media Upload Server</h1>
    <p class="subtitle">Upload any file to your local server</p>

    <div class="status" id="status"></div>

    <div class="upload-area" id="uploadArea">
    <div class="upload-icon">☁️</div>
    <h3>Drag & Drop Files Here</h3>
    <p style="color: #666; margin: 10px 0;">or</p>
    <button class="btn" onclick="document.getElementById('fileInput').click()">
    Choose Files
    </button>
    <input type="file" id="fileInput" multiple>
    <p style="color: #999; margin-top: 15px; font-size: 14px;">
    Maximum file size: 100MB
    </p>
    </div>

    <div class="progress" id="progress">
    <div class="progress-bar" id="progressBar"></div>
    </div>

    <div class="file-list" id="fileList"></div>

    <div class="uploaded-files">
    <h2>Recently Uploaded</h2>
    <div id="uploadedList"></div>
    </div>
    </div>

    <script>
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
            div.innerHTML = \`
            <span class="file-name">\${file.name}</span>
            <span class="file-size">\${formatFileSize(file.size)}</span>
            \`;
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
            uploadedList.innerHTML = files.map(file => \`
            <div class="file-item">
            <span class="file-name">\${file.name}</span>
            <span class="file-size">\${formatFileSize(file.size)}</span>
            </div>
            \`).join('');
        } catch (error) {
            console.error('Failed to load files:', error);
        }
    }

    // Load files on page load
    loadUploadedFiles();
    </script>
    </body>
    </html>
    `);
});

// File upload endpoint
app.post('/upload', upload.array('files'), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedFiles = req.files.map(file => ({
        originalName: file.originalname,
        filename: file.filename,
        size: file.size,
        path: file.path
    }));

    console.log(`Uploaded ${uploadedFiles.length} file(s)`);
    res.json({
        message: 'Files uploaded successfully',
        files: uploadedFiles
    });
});

// Get list of uploaded files
app.get('/files', (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to read files' });
        }

        const fileDetails = files.map(filename => {
            const filePath = path.join(uploadDir, filename);
            const stats = fs.statSync(filePath);
            return {
                name: filename,
                size: stats.size,
                uploadedAt: stats.mtime
            };
        }).sort((a, b) => b.uploadedAt - a.uploadedAt);

        res.json(fileDetails);
    });
});

// Get network interfaces to display local IP
function getLocalIPAddress() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

// Start server
app.listen(PORT, '0.0.0.0', () => {
    const localIP = getLocalIPAddress();
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║    Media Upload Server Started! 🚀         ║');
    console.log('╠════════════════════════════════════════════╣');
    console.log(`║  Local:   http://localhost:${PORT}           ║`);
    console.log(`║  Network: http://${localIP}:${PORT}      ║`);
    console.log('╠════════════════════════════════════════════╣');
    console.log(`║  Upload folder: ${uploadDir.padEnd(24)} ║`);
    console.log('╚════════════════════════════════════════════╝\n');
});
