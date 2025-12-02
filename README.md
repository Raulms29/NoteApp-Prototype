<p align="center">
  <img src="./docs/resources/images/app.png" alt="Slate Note App Screenshot" width="650">
</p>

<p align="center">
  <img src="./src/assets/app-icon/png/128x128.png" alt="Slate App Icon" width="80">
  <img src="./docs/resources/images/slate-title.svg" alt="Slate" height="80">
</p>

<p align="center"> 
  <a href="https://sonarcloud.io/summary/new_code?id=Raulms29_Slate_NoteApp">
    <img src="https://sonarcloud.io/api/project_badges/measure?project=Raulms29_Slate_NoteApp&metric=alert_status" alt="Quality Gate">
  </a>
  <a href="https://sonarcloud.io/summary/new_code?id=Raulms29_Slate_NoteApp">
    <img src="https://sonarcloud.io/api/project_badges/measure?project=Raulms29_Slate_NoteApp&metric=coverage" alt="Coverage">
  </a>
  
  <a href="https://sonarcloud.io/summary/new_code?id=Raulms29_Slate_NoteApp">
    <img src="https://sonarcloud.io/api/project_badges/measure?project=Raulms29_Slate_NoteApp&metric=security_rating" alt="Coverage">
  </a>
  <br>
  <img src="https://img.shields.io/badge/Node.js-24.11.1+-green" alt="Node">
</p>

<p align="center">
A cross-platform desktop note-taking application for organizing your thoughts and projects.<br>
Developed as a Bachelor's Thesis project at the University of Oviedo.
</p>

<p align="center">
Built with Electron, Vue 3, and TypeScript for Windows, macOS, and Linux.
</p>

---

<p align="center">
  <a href="#-quick-start-guide">Quick Start Guide</a> • 
  <a href="#%EF%B8%8F-running-the-application">Running the Application</a> • 
  <a href="#-testing">Testing</a> • 
  <a href="#-scripts">Scripts</a> • 
  <a href="#-project-structure">Project Structure</a>
</p>

---

## 📥 Quick Start Guide

Clone the repository:
```bash
git clone https://github.com/Raulms29/Slate-Note-App.git
cd Slate-Note-App
```

Then install the dependencies:
```bash
npm ci
```

## ▶️ Running the Application

**Development Mode**

Start the application in development mode with hot-reload:
```bash
npm run dev
```

**Build & Package**

Create production builds and installers:
```bash
npm run build
```

This will:
- Compile the project and package the application
- Create the installer in the `out/make` directory

## 🧪 Testing

**Running Tests**

Run all unit tests:
```bash
npm run test
```

Run end-to-end tests:
```bash
npm run test:e2e
```

Generate coverage report:
```bash
npm run test:coverage
```

Coverage report will be generated in the `coverage` folder.

**Environment Variables**

To enable E2E testing, create a `.env` file in the root directory:
```env
ENABLE_WDIO=false  # Set to 'true' to enable WebDriver integration for E2E testing
```


## 📜 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build production application |
| `npm run package` | Package application (no installer) |
| `npm run test` | Run all unit tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run test:coverage` | Generate coverage report |
| `npm run clean` | Remove build artifacts |
| `npm run lint` | Lint TypeScript files |


## 📁 Project Structure
```
├── src/
│   ├── main.ts              # Electron main process
│   ├── preload.ts           # Preload script for IPC
│   ├── renderer.ts          # Vue app entry point
│   ├── business/            # Business logic layer
│   │   ├── domain/          # Domain models (Note, Workspace, Settings)
│   │   └── service/         # Services (NoteService, WorkspaceService, etc.)
│   ├── components/          # Vue components
│   │   ├── editor/          # Editor components and extensions
│   │   ├── generic/         # Reusable UI components
│   │   ├── sidebar/         # Sidebar navigation
│   │   └── workspace/       # Workspace management
│   ├── persistence/         # Data persistence layer
│   │   └── repository/      # Repository implementations
│   ├── router/              # Vue Router configuration
│   ├── stores/              # Pinia state management
│   ├── styles/              # Global styles and themes
│   ├── utils/               # Utility functions and IPC handlers
│   └── views/               # Main application views
├── test/                    # Test suites
│   ├── unit/                # Unit tests
│   ├── components/          # Component tests
│   └── e2e/                 # End-to-end tests
├── forge.config.ts          # Electron Forge configuration
└── vite.*.config.ts         # Vite configuration files
```