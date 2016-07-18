require('./tasklist.scss');

import React from 'react';
import Mousetrap from 'mousetrap';
import TaskRow from './taskrow.jsx';

export default class TaskList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: this.props.tasks.length && this.props.tasks[0].id
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
            currentId={this.props.currentId}
            selectedId={this.state.selected}/>;
        }) }
      </ul>
    );
  }

  componentDidMount() {
    Mousetrap.bind('up', () => this._handleMove('UP'));
    Mousetrap.bind('down', () => this._handleMove('DOWN'));
  }

  _handleMove(direction) {
    const selected = this._select(direction);
    if (selected) {
      this.setState({
        selected: selected
      });
    }
  }

  _select(upDown, tasks = this.props.tasks, prev = null, isNext = false) {
    for (let task of tasks) {
      if (isNext) {
        return task.id; // Es el que buscamos: el siguiente al seleccionado
      } else if (task.id === this.state.selected) {
        if (upDown === 'DOWN') {
          isNext = true; // Devolveremos el siguiente
        } else {
          return prev; // Devolvemos el anterior
        }
      } else {
        prev = task.id;
      }
      if (task.subtasks && task.subtasks.length > 0) {
        let selected = this._select(upDown, task.subtasks, prev, isNext);
        if (selected) {
          return selected;
        }
      }
    }
  }
}

TaskList.propTypes = {
  tasks: React.PropTypes.array.isRequired,
  onChecked: React.PropTypes.func.isRequired,
  onRemoved: React.PropTypes.func.isRequired,
  onEdited: React.PropTypes.func.isRequired,
  currentId: React.PropTypes.string,
  estimatedId: React.PropTypes.string
};
