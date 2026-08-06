# 🚀 FlowZone — Modern Chrome Tab & Workspace Manager

![FlowZone Banner](https://raw.githubusercontent.com/hassanshahid-dev/FlowZone/main/tabExtension/icons/icon128.png)

> **FlowZone** is a powerful, high-performance Chrome Extension and Web Application built to reclaim computer RAM memory, organize hundreds of open browser tabs into custom workspaces, and seamlessly sync tabs in real time across all your desktop, mobile, and cloud devices.

---

## ✨ Features

- ⚡ **Instant Workspace Organization**: Group tabs into color-coded workspaces (Indigo, Blue, Green, Amber, Rose).
- 🧠 **Dual-Option RAM Memory Saver (Suspend Flow)**:
  - **Suspend (Close) Selected Browser Tabs**: Safely close open tabs to free RAM memory with a single click (defaults to *Select All*).
  - **Permanently Delete Tabs**: Select unwanted tabs to permanently remove them from your saved workspace record.
- 🔄 **Real-Time Bidirectional Sync**:
  - Actions taken on the **Web Dashboard** automatically trigger real-time actions in your **Chrome Browser** (opening, closing, suspending, and renaming workspaces)!
  - Syncs up to **5 Workspaces on the Free Tier** and **Unlimited Workspaces on Paid/Pro Tiers**.
- 🎨 **Modern Professional UI**: Crisp vector SVG icons, smooth dark glassmorphism, responsive sidebar layout, and zero emoji clutter.
- 🛡️ **Account & Safety Guards**:
  - Logout confirmation prompts on both the Extension Sidebar and Web Dashboard.
  - Automatic filtering out of empty pages, `chrome://newtab`, `about:blank`, and extension internal URLs.
- 📱 **Cross-Device Web Dashboard**: Access and manage all your workspaces from any device, tablet, or smartphone at **[flowzone-dashboard.vercel.app](https://flowzone-dashboard.vercel.app)**.
- 📂 **Backup & Portability**: 1-click JSON export and import for local backups.

---

## 💻 Installation & Usage Instructions

### 📥 Option A: Load Unpacked Extension in Chrome (For Testers & Users)

1. **Download the Extension**:
   - Download the pre-packaged zip file: [`flowzone-extension-v1.3.1.zip`](./flowzone-extension-v1.3.1.zip) or clone this repository.
   - Extract/unzip the contents to a local folder on your computer.

2. **Open Chrome Extensions Manager**:
   - Open Google Chrome and navigate to `chrome://extensions` in your address bar.

3. **Enable Developer Mode**:
   - Toggle on the **Developer mode** switch located in the top-right corner of the Extensions page.

4. **Load the Unpacked Folder**:
   - Click the **Load unpacked** button in the top-left corner.
   - Select the `tabExtension` directory inside the unzipped folder.

5. 🎉 **Start Managing Tabs**:
   - Press `Option + S` (macOS) or click the **FlowZone icon** in your Chrome toolbar to open the Extension Sidebar!

---

## 🌐 Option B: Accessing the Live Web Dashboard

You can access your workspaces anytime from any web browser or mobile device:

👉 **[https://flowzone-dashboard.vercel.app](https://flowzone-dashboard.vercel.app)**

1. **Register / Log In**: Use your FlowZone credentials.
2. **View & Action Workspaces**:
   - Click **Restore** to launch a workspace's saved tabs in your browser.
   - Click **Suspend** to selectively close browser tabs and free RAM memory.
   - Click **Rename** or **Delete** to manage your workspaces live!

---

## 🛠️ Developer Setup & Architecture

FlowZone is built as a three-tier system:

```
                  ┌──────────────────────────────┐
                  │   FlowZone Chrome Extension  │
                  │   (Manifest V3 Background,   │
                  │     Content & Popup Sidebar) │
                  └──────────────┬───────────────┘
                                 │ Real-Time Sync & Events
                                 ▼
┌────────────────────────────────┴────────────────────────────────┐
│                  FlowZone Express.js Backend API                 │
│              (JWT Auth, REST Endpoints, MongoDB Cloud)           │
└────────────────────────────────┬────────────────────────────────┘
                                 │ REST API & postMessage Bridge
                                 ▼
                  ┌──────────────────────────────┐
                  │   FlowZone React Dashboard   │
                  │ (Vite, Tailwind, Vercel Host)│
                  └──────────────────────────────┘
```

### 1. Chrome Extension (`/tabExtension`)
- **`manifest.json`**: Chrome Extension Manifest V3 specification.
- **`background.js`**: Background service worker monitoring active tab updates and executing broadcasted real-time actions.
- **`popup.html` & `ui.js`**: Main Extension Sidebar UI, modal management, and workspace card renderer.
- **`content.js`**: Web page message bridge forwarding events between the Web Dashboard and Chrome Extension.

### 2. Backend REST API (`/tabBackend`)
- **Framework**: Node.js + Express.js + Mongoose (MongoDB Cloud Atlas).
- **Authentication**: JWT token verification (`middleware/auth.js`).
- **Run locally**:
  ```bash
  cd tabBackend
  npm install
  npm start
  ```

### 3. Web Dashboard (`/flowzone-dashboard`)
- **Framework**: Vite + React 18 + Tailwind CSS + Lucide Icons.
- **Run locally**:
  ```bash
  cd flowzone-dashboard
  npm install
  npm run dev
  ```

---

## 📄 License & Attribution

Created by Hassan Shahid. All rights reserved.
