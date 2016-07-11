import {dialog} from 'electron';
import uuid from 'node-uuid';
import jsonfile from 'jsonfile';

const PROJECT_FILE = process.env[(process.platform === 'win32') ?
	'USERPROFILE' : 'HOME'] + '/.project.json';

function showWriteErrorBox() {
  dialog.showErrorBox('Error al guardar en disco',
        'No se han podido conservar los datos en el disco');
}

export default class Project {
  constructor() {
    let project;
    try {
      project = jsonfile.readFileSync(PROJECT_FILE);
    } catch (e) {
      project = {tasks: []};
      try {
        jsonfile.writeFileSync(PROJECT_FILE, project);
      } catch (e) {
        showWriteErrorBox();
      }
    }
    this._project = project;
  }

  _save() {
    try {
      jsonfile.writeFileSync(PROJECT_FILE, this._project);
    } catch (e) {
      showWriteErrorBox();
    }
  }

  get title() {
    return this._project.title;
  }

  get tasks() {
    return this._project.tasks;
  }

  updateTasks(interval, worked) {
    const currentTask = this._getCurrent();
    if (!currentTask) return;
    if (currentTask.pause && currentTask.pause.active) {
      currentTask.pause.elapsed += interval;
    } else {
      currentTask.elapsed = (currentTask.elapsed || 0) + interval;
    }
    this._save();
    return [this._project.tasks, currentTask.id];
  }

  _getCurrent(tasks = this._project.tasks) {
    for (let task of tasks) {
      if (!task.done) {
        if (task.subtasks && task.subtasks.length > 0) {
          return this._getCurrent(task.subtasks);
        }
        return task;
      }
    }
  }

  setChecked(id, checked) {
    const task = this._getTaskById(id);
    task.done = checked;
    if (!checked && task.pause && task.pause.active) {
      task.pause.active = false;
    }
    this._propagateCheck();
    this._save();
  }

  _propagateCheck(tasks = this._project.tasks) {
    let result = true;
    tasks.forEach(task => {
      if (task.subtasks && task.subtasks.length > 0) {
        task.done = this._propagateCheck(task.subtasks);
      }
      result = result && task.done;
    });
    return result;
  }

  _getTaskById(id, tasks = this._project.tasks) {
    for (let task of tasks) {
      if (task.id === id) {
        return task;
      } else if (task.subtasks && task.subtasks.length > 0) {
        task = this._getTaskById(id, task.subtasks);
        if (task) {
          return task;
        }
      }
    }
  }

  pause() {
    const currentTask = this._getCurrent();
    if (!currentTask) return;
    if (currentTask.pause) {
      currentTask.pause.active = !currentTask.pause.active;
    } else {
      currentTask.pause = {
        title: 'En pausa…',
        active: true,
        elapsed: 0,
        editing: true
      };
    }
    this._save();
  }

  addNew() {
    this._project.tasks.push({
      id: uuid.v4(),
      title: '',
      done: false,
      editing: true
    });
    this._save();
  }

  edit(data) {
    const task = this._getTaskById(data.id);
    if (task) {
      Object.assign(task, data);
    }
    this._save();
  }

  remove(id, tasks = this._project.tasks) {
    let i;
    let len = tasks.length;

    for (i = 0; i < len; i++) {
      if (tasks[i].id === id) {
        return tasks.splice(i, 1);
      } else if (tasks[i].subtasks && tasks[i].subtasks.length > 0) {
        if (this.remove(id, tasks[i].subtasks)) {
          return true;
        }
      }
    }
    this._save();
    return false;
  }
}
