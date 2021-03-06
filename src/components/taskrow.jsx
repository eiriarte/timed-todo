require('./taskrow.scss');

import React from 'react';
import utils from '../utils';

export default class TaskRow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editing: Boolean(this.props.editing),
      editingPause: Boolean(this.props.pause && this.props.pause.editing)
    };
    this._handleChange = this._handleChange.bind(this);
    this._handleSelect = this._handleSelect.bind(this);
    this._handleEdit = this._handleEdit.bind(this);
    this._handleInputKeys = this._handleInputKeys.bind(this);
    this._finishEdit = this._finishEdit.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.editing !== this.props.editing) {
      this.setState({
        editing: Boolean(nextProps.editing)
      });
    }
  }

  _handleChange(event) {
    this.props.onChecked(this.props.id, event.target.checked);
  }

  _handleSelect() {
    this.props.onSelected(this.props.id);
  }

  _handleEdit() {
    this.setState({editing: true});
  }

  _finishEdit() {
    if (this.props.title) {
      this.setState({editing: false});
    } else {
      this.props.onRemoved(this.props.id);
    }
  }

  _handleInputKeys(event) {
    switch (event.key) {
      case 'Enter':
        this.props.onEdited(utils.newTask(this.props.id, event.target.value));
        this.setState({editing: false});
        break;
      case 'Escape':
        this._finishEdit();
        break;
      default:
        // Tratamiento por defecto
    }
  }

  render() {
    let subtasks;
    let pause = '';
    let className = 'task-row' +
      (this.props.done ? ' done' : '') +
      (this.props.current ? ' current' : '') +
      (this.props.selected ? ' selected' : '') +
      (this.props.estimated ? ' estimated' : '');

    if (this.props.subtasks && this.props.subtasks.length > 0) {
      subtasks = <ul className="subtask-list">
        { this.props.subtasks.map(task => {
          const current = (this.props.currentId === task.id);
          const estimated = (this.props.estimatedId === task.id);
          const selected = (this.props.selectedId === task.id);
          return <TaskRow {...task} key={task.id} id={task.id}
            current={current} estimated={estimated} selected={selected}
            onChecked={this.props.onChecked}
            onRemoved={this.props.onRemoved}
            onEdited={this.props.onEdited}
            onSelected={this.props.onSelected}
            currentId={this.props.currentId}
            estimatedId={this.props.estimatedId}
            selectedId={this.props.selectedId}/>;
        }) }
      </ul>;
    }

    if (this.props.pause) {
      pause = <div className="pause">
        <span className="pause-title">{ this.props.pause.title }</span>
        <span className="pause-duration">
          { utils.getPauseHHMM(this.props.pause) }
        </span>
      </div>;
    }

    if (this.state.editing) {
      return (
        <li className={className}>
          <input type="checkbox" checked={this.props.done}
            onChange={this._handleChange}/>
          <input className="task-input" type="text" autoFocus
            defaultValue={utils.getSyntax(this.props)}
            placeholder="Write blog post… 1:30h"
            onBlur={this._finishEdit}
            onKeyDown={this._handleInputKeys}/>
          { pause }
        </li>
      );
    }

    return (
      <li className={className}>
        <input type="checkbox" checked={this.props.done}
          onChange={this._handleChange}/>
        <span className="task-title" onDoubleClick={this._handleEdit}
          onClick={this._handleSelect}>
          {this.props.title}
        </span>
        <span className="task-duration">
          {utils.getHHMM(this.props)}
        </span>
        { subtasks }
        { pause }
      </li>
    );
  }
}

TaskRow.propTypes = {
  title: React.PropTypes.string.isRequired,
  id: React.PropTypes.string.isRequired,
  done: React.PropTypes.bool.isRequired,
  onChecked: React.PropTypes.func.isRequired,
  onRemoved: React.PropTypes.func.isRequired,
  onEdited: React.PropTypes.func.isRequired,
  onSelected: React.PropTypes.func.isRequired,
  elapsed: React.PropTypes.number,
  duration: React.PropTypes.number,
  pause: React.PropTypes.object,
  subtasks: React.PropTypes.array,
  currentId: React.PropTypes.string,
  selectedId: React.PropTypes.string,
  estimatedId: React.PropTypes.string,
  current: React.PropTypes.bool,
  selected: React.PropTypes.bool,
  estimated: React.PropTypes.bool,
  editing: React.PropTypes.bool
};

TaskRow.defaultProps = {
  elapsed: 0
};
