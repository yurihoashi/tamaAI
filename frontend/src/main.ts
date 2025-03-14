import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

let mainWindow: BrowserWindow | null = null;
let petWindow: BrowserWindow | null = null;

const createMainWindow = (): void => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    // Load the index.html file.
    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    // Open the DevTools in development.
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }
};

const createPetWindow = (): void => {
    // Create a transparent, frameless window for the pet
    petWindow = new BrowserWindow({
        width: 200,
        height: 200,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    petWindow.loadFile(path.join(__dirname, 'pet.html'));
    petWindow.setIgnoreMouseEvents(false);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', () => {
    createMainWindow();
    createPetWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
        createPetWindow();
    }
});

// Handle pet window dragging
ipcMain.on('pet-window-drag', (_, { mouseX, mouseY }) => {
    if (petWindow) {
        const [x, y] = petWindow.getPosition();
        petWindow.setPosition(x + mouseX, y + mouseY);
    }
}); 