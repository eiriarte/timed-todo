import electron from 'electron';
const app = electron.app;

const menuTemplate = [
  {
    label: 'Task',
    submenu: [
      {
        label: 'Add task',
        accelerator: 'CmdOrCtrl+N',
        click: function(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.webContents.send('new');
          }
        }
      },
      {
        label: 'Pause',
        accelerator: 'P',
        click: function(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.webContents.send('pause');
          }
        }
      }
    ]
  }
];

if (process.platform === 'darwin') {
  // const name = app.getName();
  const name = 'Timed';
  menuTemplate.unshift({
    label: name,
    submenu: [{
      label: `About ${name}`,
      role: 'about'
    }, {
      type: 'separator'
    }, {
      label: 'Services',
      role: 'services',
      submenu: []
    }, {
      type: 'separator'
    }, {
      label: `Hide ${name}`
      // accelerator: 'Command+H',
      // role: 'hide'
    }, {
      label: 'Hide Others',
      accelerator: 'Command+Alt+H',
      role: 'hideothers'
    }, {
      label: 'Show All',
      role: 'unhide'
    }, {
      type: 'separator'
    }, {
      label: 'Quit',
      accelerator: 'Command+Q',
      click: function() {
        app.quit();
      }
    }]
  });
}

export {menuTemplate};
