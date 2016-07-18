require('./tasklist.scss');

import {ipcRenderer} from 'electron';
import React from 'react';
import Mousetrap from 'mousetrap';
import TaskRow from './taskrow.jsx';

export default class TaskList extends React.Component {
  constructor(props) {
    super(props);
    this._newTask = this._newTask.bind(this);
    this._selectTask = this._selectTask.bind(this);
    this.state = {
      selected: this.props.tasks.length ? this.props.tasks[0].id : ''
    };
  }
  render() {
    return (
      <ul className="task-list">
        { this.props.tasks.map(task => {
          const current = (this.props.currentId === task.id);
          const estimated = (this.props.estimatedId === task.id);
          const selected = (this.state.selected === task.id);
          return <TaskRow {...task} key={task.id} id={task.id}
            current={current} estimated={estimated} selected={selected}
            onChecked={this.props.onChecked}
            onRemoved={this.props.onRemoved}
            onEdited={this.props.onEdited}
            onSelected={this._selectTask}
            currentId={this.props.currentId}
            selectedId={this.state.selected}/>;
        }) }
      </ul>
    );
  }

  componentDidMount() {
    Mousetrap.bind('up', () => this._handleMove('UP'));
    Mousetrap.bind('down', () => this._handleMove('DOWN'));
    ipcRenderer.on('new', () => this._newTask('TASK'));
    ipcRenderer.on('newsub', () => this._newTask('SUBTASK'));
  }

  _newTask(type) {
    this.props.onAddNew(this.state.selected, type);
  }

  _selectTask(taskId) {
    if (taskId) {
      this.setState({
        selected: taskId
      });
    }
  }

  _handleMove(direction) {
    const [selected] = this._select(direction);
    if (selected) {
      this.setState({
        selected: selected
      });
    }
  }

  _select(upDown, tasks = this.props.tasks, prev = null, isNext = false) {
    for (let task of tasks) {
      if (isNext) {
        return [task.id, prev, isNext]; // Es el que buscamos: el siguiente al seleccionado
      } else if (task.id === this.state.selected) {
        if (upDown === 'DOWN') {
          isNext = true; // Devolveremos el siguiente
        } else if (upDown === 'UP') {
          return [prev, null, isNext]; // Devolvemos el anterior
        }
      } else {
        prev = task.id;
      }
      if (task.subtasks && task.subtasks.length > 0) {
        let selected;
        [selected, prev, isNext] =
          this._select(upDown, task.subtasks, prev, isNext);
        if (selected) {
          return [selected, prev, isNext];
        }
      }
    }

    return [null, prev, isNext];
  }
}

TaskList.propTypes = {
  tasks: React.PropTypes.array.isRequired,
  onChecked: React.PropTypes.func.isRequired,
  onRemoved: React.PropTypes.func.isRequired,
  onEdited: React.PropTypes.func.isRequired,
  onAddNew: React.PropTypes.func.isRequired,
  currentId: React.PropTypes.string,
  estimatedId: React.PropTypes.string
};
