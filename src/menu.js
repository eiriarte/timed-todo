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
        label: 'Add subtask',
        accelerator: 'CmdOrCtrl+Shift+N',
        click: function(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.webContents.send('newsub');
          }
        }
      },
      {
        label: 'Delete task',
        accelerator: 'CmdOrCtrl+Backspace',
        click: function(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.webContents.send('del');
          }
        }
      },
      {
        label: 'Pause',
        accelerator: 'CmdOrCtrl+P',
        click: function(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.webContents.send('pause');
          }
        }
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      {
        role: 'cut'
      },
      {
        role: 'copy'
      },
      {
        role: 'paste'
      }
    ]
  }];

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
      label: `Hide ${name}`,
      accelerator: 'Command+H',
      role: 'hide'
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
