const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const QRcode = require('qrcode');

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
app.use(express.json());

// Main page HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "views/home.html"));
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




// Append text to notes.txt with datetime stamp
app.post('/append-text', (req, res) => {
    const { text } = req.body;
    if (!text || !text.trim()) {
        return res.status(400).json({ error: 'No text provided' });
    }

    const notesFile = path.join(uploadDir, 'appendedText.txt');
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').replace('Z', ' UTC');
    const entry = `\n--- ${timestamp} ---\n${text.trim()}\n`;

    fs.appendFile(notesFile, entry, 'utf8', (err) => {
        if (err) {
            console.error('Failed to append text:', err);
            return res.status(500).json({ error: 'Failed to write to notes.txt' });
        }
        console.log(`Text appended to notes.txt (${text.length} chars)`);
        res.json({ message: 'Text appended successfully', file: 'notes.txt' });
    });
});

// Download file endpoint
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);
    console.log(`${req.ip} requested ${filename}`);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
    }

    // Send file for download
    res.download(filePath, filename, (err) => {
        if (err) {
            console.error('Download error:', err);
            return res.status(500).json({ error: 'Failed to download file' });
        }
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
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║    Media Upload Server Started! 🚀  \t       \t\t ║');
    console.log('╠════════════════════════════════════════════════════════╣');
    console.log(`║  Local:   http://localhost:${PORT}    \t\t         ║`);
    console.log(`║  Network: http://${localIP}:${PORT}     \t\t ║`);
    console.log('╠════════════════════════════════════════════════════════╣');
    console.log(`║  Upload folder: ${uploadDir.padEnd(24)} ║`);
    console.log('╚════════════════════════════════════════════════════════╝\n');
    QRcode.toString(`http://${localIP}:3000`, 
                    {
                        type:'terminal',
                        small: true,
                        margin: 1, 
                        version: 2
                    }, 
                    (err, url)=>{
                        if(err) throw(err);
                        console.log(url)
                    });
});
