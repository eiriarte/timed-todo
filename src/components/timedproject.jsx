require('./timedproject.scss');

import {ipcRenderer} from 'electron';
import React from 'react';
import TaskList from './tasklist.jsx';
import utils from '../utils';

export default class TimedProject extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      working: false,
      worked: 0,
      tasks: this.props.project.tasks
    };

    this._tick = this._tick.bind(this);
    this._persistTick = this._persistTick.bind(this);
    this._handleCheck = this._handleCheck.bind(this);
    this._handlePause = this._handlePause.bind(this);
    this._removeTask = this._removeTask.bind(this);
    this._newTask = this._newTask.bind(this);
    this._taskEditMode = this._taskEditMode.bind(this);
    this._editTask = this._editTask.bind(this);
    this._toggleWorking = this._toggleWorking.bind(this);
  }

  render() {
    let [totalDuration, totalDeviation] = this.props.project.getTotalDuration();
    let htmlDeviation = '';

    if (totalDeviation !== 0 && Math.abs(totalDeviation > 6000)) {
      htmlDeviation =
        <span className={ totalDeviation > 0 ? 'positive' : 'negative' }>
          { utils.getHHMMFormat(totalDeviation, false) }
        </span>;
    }

    return (
      <div className="project">
        <header className="project-title">
          {this.props.project.title || 'TODO Today'}
          <button onClick={this._toggleWorking}>
            {this.state.working ? 'Parar' : 'Empezar'}
          </button>
        </header>
        <TaskList tasks={this.state.tasks} currentId={this.state.current}
          estimatedId={this.state.estimated ? this.state.estimated.id : null}
          onChecked={this._handleCheck}
          onEdited={this._editTask}
          onEditMode={this._taskEditMode}
          onAddNew={this._newTask}
          onRemoved={this._removeTask}/>
        <footer className="project-footer">
          <div className="total-duration">
            {utils.getHHMMFormat(totalDuration, false)}
            {htmlDeviation}
          </div>
          <div className="total-worked">
            {utils.getHHMMFormat(this.state.worked, true)}
          </div>
        </footer>
      </div>
    );
  }

  componentDidMount() {
    ipcRenderer.on('pause', this._handlePause);
  }

  componentWillUnmount() {
    clearInterval(this._timer);
    clearInterval(this._persistTimer);
  }

  _toggleWorking() {
    const working = !this.state.working;
    const current = working ? this.state.current : undefined;
    let worked = this.state.worked;
    let elapsed = this.state.elapsed;
    if (working) {
      this._firstTick = Date.now();
      this.props.project.init();
      this._timer = setInterval(this._tick, 500);
      this._persistTimer = setInterval(this._persistTick, 60000);
      worked = elapsed = 0;
    } else {
      clearInterval(this._timer);
      clearInterval(this._persistTimer);
    }
    this.setState({working, current, elapsed, worked});
  }

  _persistTick() {
    this.props.project.save();
  }

  _tick() {
    if (!this.state.working ||
      (this.state.tasks && this.state.tasks.length === 0)) return;

    const tack = Date.now();
    const elapsed = tack - this._firstTick;
    const interval = elapsed - (this.state.elapsed || 0);
    let worked = this.state.worked || 0;

    if (!this.props.project.isPaused()) {
      worked += interval;
    }

    const [tasks, current] = this.props.project.updateTasks(interval);
    const estimated = this.props.project.getEstimated(worked);
    const working = Boolean(current);

    if (!working) {
      clearInterval(this._timer);
      clearInterval(this._persistTimer);
    }

    this.setState({tasks, elapsed, worked, working, current, estimated});
  }

  _handleCheck(id, checked) {
    this.props.project.setChecked(id, checked);
    this.setState({tasks: this.state.tasks});
  }

  _removeTask(id) {
    const nextId = this.props.project.getAdjacentTask(id);
    this.props.project.remove(id);
    this.setState({tasks: this.state.tasks});
    return nextId;
  }

  _taskEditMode(id) {
    this.props.project.editMode(id);
    this.setState({tasks: this.state.tasks});
  }

  _editTask(data) {
    const [wasNewTask, lastId] = this.props.project.edit(data);
    let selectedId = lastId;

    if (wasNewTask) {
      selectedId = this._newTask(lastId, 'TASK');
    }
    this.setState({tasks: this.state.tasks});
    return selectedId;
  }

  _handlePause() {
    this.props.project.pause();
    this.setState({tasks: this.state.tasks});
  }

  _newTask(id, type) {
    const newId = this.props.project.addNew(id, type);
    this.setState({tasks: this.state.tasks});
    return newId;
  }
}

TimedProject.propTypes = {
  project: React.PropTypes.object.isRequired
};
