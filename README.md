# Local Network File & Text Sharing Server

A lightweight Node.js server for sharing files and text content across devices on the same local network. Because apparently emailing yourself files in 2026 still counts as a workflow for many people.

This server allows users on the same WiFi or LAN to:

* Upload files up to 100 MB
* Download uploaded files
* Share temporary text snippets between devices
* Access the server through a browser on phones, laptops, desktops, or tablets
* Use a clean frontend separated into HTML, CSS, and JavaScript files

---

# Project Structure

```txt
project-folder/
├── server.js
├── package.json
├── uploads/
├── views/
│   └── home.html
├── public/
│   ├── css/
│   │   └── styles.css
│   └── js/
│       └── script.js
└── README.md
```

---

# Features

## File Uploads

* Drag and drop support
* Multi file upload
* 100 MB file size limit
* Automatically stores uploads in the `uploads/` directory

## File Downloads

* Download uploaded files directly from the browser
* Files remain available until manually deleted

## Shared Text Buffer

* Share copied text between devices
* Useful for links, commands, notes, code snippets, and random things humans forget five seconds after copying

## Local Network Access

* Accessible from other devices connected to the same network
* Works on Windows, Linux, Android, macOS, iPhone, tablets, and basically anything with a browser

---

# Requirements

Before running the server, install:

* Node.js
* npm

Recommended:

* Node.js 18 or newer

Check installed versions:

```bash
node -v
npm -v
```

---

# Setup Instructions

## 1. Clone or Extract the Project

```bash
git clone https://github.com/singhanshuman01/media_upload_server
cd media_upload_server
```

Or simply extract the ZIP file if downloaded manually.

---

# Linux Setup

## Debian / Ubuntu / Linux Mint (APT Based)

### Install Node.js and npm

```bash
sudo apt update
sudo apt install nodejs npm -y
```

Verify installation:

```bash
node -v
npm -v
```

---

## Fedora / RHEL / Nobara (DNF Based)

### Install Node.js and npm

```bash
sudo dnf install nodejs npm -y
```

Verify installation:

```bash
node -v
npm -v
```

---

# Windows Setup

## Install Node.js

1. Download Node.js from:

```txt
https://nodejs.org
```

2. Install the LTS version
3. During installation:

   * Keep "Add to PATH" enabled
   * Keep npm installation enabled

Verify installation in Command Prompt or PowerShell:

```powershell
node -v
npm -v
```

Human civilization remains deeply dependent on installers with fifteen "Next" buttons. Miraculous species.

---

# Install Project Dependencies

Inside the project folder:

```bash
npm install
```

---

# Running the Server

Start the server:

```bash
node server.js
```

You should see output similar to:

```txt
Server running on:
http://localhost:3000
http://192.168.x.x:3000
```

---

# Accessing the Server

## On the Host Machine

Open:

```txt
http://localhost:3000
```

---

## From Other Devices on the Same Network

Open the local IP address shown in the terminal:

```txt
http://192.168.x.x:3000
```

Example:

```txt
http://192.168.1.5:3000
```

Make sure:

* All devices are connected to the same WiFi or LAN
* Firewall allows port `3000`
* The server machine stays powered on

Tiny details. Humanity's greatest enemy.

---

# Firewall Configuration

## Linux UFW Example

```bash
sudo ufw allow 3000/tcp
```
## Linux firewalld Example

```bash
sudo firewall-cmd --add-port=3000/tcp --permanent
```

---

## Windows Firewall

When Windows prompts:

```txt
Windows Defender Firewall has blocked some features...
```

Click:

```txt
Allow Access
```

Preferably for:

* Private Networks

---

# Upload Directory

Uploaded files are stored in:

```txt
uploads/
```

The folder is automatically created if it does not exist.

---

# API Endpoints

## GET /

Serves the main frontend page.

---

## POST /upload

Upload one or more files.

### Form Field

```txt
files
```

---

## GET /files

Returns the uploaded file list.

---

## GET /download/:filename

Downloads a specific uploaded file.

Example:

```txt
/download/example.pdf
```

---

## POST /append-text

Stores shared text content.

Useful for:

* Clipboard sharing
* Notes
* URLs
* Commands
* Quick snippets

---

# Frontend Structure

## HTML

```txt
views/home.html
```

Contains:

* Main UI layout
* Upload section
* Shared text area

---

## CSS

```txt
public/css/styles.css
```

Contains:

* Styling
* Responsive layout
* Upload animations
* UI appearance

---

## JavaScript

```txt
public/js/script.js
```

Handles:

* File uploads
* Drag and drop
* Fetch API requests
* File list refresh
* Shared text sync
* Progress updates

---

# Example Workflow

1. Start the server on your PC
2. Open the shown local IP on your phone
3. Upload files from phone to PC
4. Download files on another device
5. Share text snippets instantly across devices

Basically a private LAN dropbox without subscriptions, accounts, ads, trackers, or motivational productivity slogans.

---

# Security Notes

This project is intended for local network usage only.

Current limitations:

* No authentication
* No encryption
* No user accounts
* No file access restrictions

Do NOT expose this server directly to the internet unless you add:

* Authentication
* HTTPS
* Rate limiting
* Validation and sanitization
* Reverse proxy protection

Because the internet treats open ports like raccoons treat unlocked trash cans.

---

# Recommended Improvements

Possible future upgrades:

* File delete support
* Password protection
* Upload progress bars
* Mobile optimized UI
* Dark mode
* SQLite or database storage
* Automatic cleanup of old uploads
* QR code for quick mobile access
* WebSocket based real time sync

---

# Troubleshooting

## Cannot Access From Another Device

Check:

* Same network connection
* Firewall settings
* Correct local IP address
* Server is still running

---

## Port Already In Use

Change the port in `server.js`:

```js
const PORT = 3000;
```

Example:

```js
const PORT = 8080;
```

Then restart the server.

---

## npm Command Not Found

Node.js is either:

* Not installed
* Not added to PATH
* Installed incorrectly

Reinstall Node.js.

---

# License

MIT License

Use it, modify it, break it, improve it. Standard software lifecycle.
