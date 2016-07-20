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

  save() {
    this._save();
  }

  get title() {
    return this._project.title;
  }

  get tasks() {
    return this._project.tasks;
  }

  init(tasks) {
    if (!tasks) {
      tasks = this._project.tasks;
      this._start = 0;
    }
    for (let task of tasks) {
      if (task.subtasks && task.subtasks.length > 0) {
        if (this.init(task.subtasks)) {
          return true; // Inicialización completada
        }
      } else {
        if (!task.done) {
          this._start += task.elapsed || 0;
          return true; // Inicialización completada
        }
        this._start += task.duration || 0;
      }
    }
  }

  getEstimated(total, tasks) {
    if (!tasks) {
      tasks = this._project.tasks;
      total += this._start;
    }
    for (let task of tasks) {
      if (task.subtasks && task.subtasks.length > 0) {
        let result = this.getEstimated(total, task.subtasks);
        if (typeof result === 'object') {
          return result;
        }
        total = result;
      } else {
        total -= task.duration;
        if (total < 0) {
          // Encontrada la tarea que debería estar haciéndose según la estimación
          return task;
        }
      }
    }

    if (tasks === this._project.tasks) {
      return undefined; // Deberían estar hechas TODAS las tareas
    }
    return total;
  }

  updateTasks(interval) {
    const currentTask = this._getCurrent();
    if (!currentTask) return [this._project.tasks];
    if (currentTask.pause && currentTask.pause.active) {
      currentTask.pause.elapsed += interval;
    } else {
      currentTask.elapsed = (currentTask.elapsed || 0) + interval;
    }
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
    const [task] = this._getTaskById(id);
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
    for (let i = 0, len = tasks.length; i < len; i++) {
      let task = tasks[i];
      if (task.id === id) {
        return [task, tasks, i];
      } else if (task.subtasks && task.subtasks.length > 0) {
        let [subtask, taskList, index] = this._getTaskById(id, task.subtasks);
        if (subtask) {
          return [subtask, taskList, index];
        }
      }
    }
    return [];
  }

  getAdjacentTask(id) {
    const [task, taskList, index] = this._getTaskById(id);
    if (!taskList || taskList.length < 2) {
      return task.parent;
    }
    let adjacentTask = taskList[index + 1] || taskList[index - 1];
    return adjacentTask.id;
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

  addNew(id, type, parent = undefined, tasks = this._project.tasks) {
    let i;
    let len = tasks.length;
    const newTask = {
      id: uuid.v4(),
      title: '',
      done: false,
      editing: true,
      parent: type === 'SUBTASK' ? id : parent
    };

    if (!id) {
      tasks.push(newTask);
      return newTask.id;
    }

    for (i = 0; i < len; i++) {
      if (tasks[i].id === id) {
        if (type === 'TASK') {
          tasks.splice(i + 1, 0, newTask);
        } else if (type === 'SUBTASK') {
          if (!tasks[i].subtasks) {
            tasks[i].subtasks = [];
          }
          tasks[i].subtasks.push(newTask);
        }
        this._save();
        return newTask.id;
      } else if (tasks[i].subtasks && tasks[i].subtasks.length > 0) {
        const newId = this.addNew(id, type, tasks[i].id, tasks[i].subtasks);
        if (newId) {
          return newId;
        }
      }
    }
  }

  editMode(id) {
    const [task] = this._getTaskById(id);
    if (task) {
      task.editing = true;
    }
  }

  edit(data) {
    const [task, taskList, index] = this._getTaskById(data.id);
    let wasNewTask = false;
    let lastId = data.id;
    const numCopies = data.numCopies || 1;

    delete data.numCopies;

    if (task) {
      if (task.title === '') {
        wasNewTask = true;
      }
      Object.assign(task, data);

      // Añade numCopies - 1 copias
      for (let i = 1; i < numCopies; i++) {
        const copy = Object.assign({}, task, {
          id: uuid.v4(),
          elapsed: 0,
          done: false
        });
        delete copy.subtasks;
        taskList.splice(index + i, 0, copy);
        lastId = copy.id;
      }

      this._save();
    }
    return [wasNewTask, lastId];
  }

  remove(id, tasks = this._project.tasks) {
    let i;
    let len = tasks.length;

    for (i = 0; i < len; i++) {
      if (tasks[i].id === id) {
        let result = tasks.splice(i, 1);
        this._save();
        return result;
      } else if (tasks[i].subtasks && tasks[i].subtasks.length > 0) {
        if (this.remove(id, tasks[i].subtasks)) {
          return true;
        }
      }
    }
    return false;
  }
}
