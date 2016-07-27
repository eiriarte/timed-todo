require('./app.html');

import electron from 'electron';
import {menuTemplate} from './menu';

const app = electron.app;
const Menu = electron.Menu;

// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

// prevent window being garbage collected
let mainWindow;

function onClosed() {
  // dereference the window
  // for multiple windows store them in an array
  mainWindow = null;
}

function createMainWindow() {
  const win = new electron.BrowserWindow({
    width: 350,
    height: 700,
    x: 1570,
    y: 0
  });

  win.loadURL(`file://${__dirname}/app.html`);
  win.on('closed', onClosed);

  return win;
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (!mainWindow) {
    mainWindow = createMainWindow();
  }
});

app.on('ready', () => {
  // let reactDevTools = '/Users/eduardo/Library/Application Support/Google/';
  // reactDevTools += 'Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi';
  // reactDevTools += '/0.15.0_0';
  // electron.BrowserWindow.addDevToolsExtension(reactDevTools);

  mainWindow = createMainWindow();

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
});
