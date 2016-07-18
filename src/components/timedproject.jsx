import {ipcRenderer} from 'electron';
import React from 'react';
import Mousetrap from 'mousetrap';
import TaskList from './tasklist.jsx';

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
    this._editTask = this._editTask.bind(this);
    this._toggleWorking = this._toggleWorking.bind(this);
  }

  render() {
    return (
      <div className="project">
        <h1 className="project-title">
          {this.props.project.title || 'Nuevo proyecto'}
          <button onClick={this._toggleWorking}>
            {this.state.working ? 'Parar' : 'Empezar'}
          </button>
        </h1>
        <TaskList tasks={this.state.tasks} currentId={this.state.current}
          estimatedId={this.state.estimated ? this.state.estimated.id : null}
          onChecked={this._handleCheck}
          onEdited={this._editTask}
          onAddNew={this._newTask}
          onRemoved={this._removeTask}/>
      </div>
    );
  }

  componentDidMount() {
    Mousetrap.bind('p', this._handlePause);
    ipcRenderer.on('pause', this._handlePause);
  }

  componentWillUnmount() {
    clearInterval(this._timer);
    clearInterval(this._persistTimer);
  }

  _toggleWorking() {
    const working = !this.state.working;
    const current = working ? this.state.current : undefined;
    if (working) {
      this._firstTick = Date.now();
      this.props.project.init();
      this._timer = setInterval(this._tick, 500);
      this._persistTimer = setInterval(this._persistTick, 60000);
    } else {
      clearInterval(this._timer);
      clearInterval(this._persistTimer);
    }
    this.setState({working, current});
  }

  _persistTick() {
    this.props.project.save();
  }

  _tick() {
    if (!this.state.working || this.state.tasks.length === 0) return;

    const tack = Date.now();
    const worked = tack - this._firstTick;
    const interval = worked - this.state.worked;

    const [tasks, current] = this.props.project.updateTasks(interval, worked);
    const estimated = this.props.project.getEstimated(worked);

    this.setState({tasks, worked, current, estimated});
  }

  _handleCheck(id, checked) {
    this.props.project.setChecked(id, checked);
    this.setState({tasks: this.state.tasks});
  }

  _removeTask(id) {
    this.props.project.remove(id);
    this.setState({tasks: this.state.tasks});
  }

  _editTask(data) {
    this.props.project.edit(data);
    this.setState({tasks: this.state.tasks});
  }

  _handlePause() {
    this.props.project.pause();
  }

  _newTask(id, type) {
    this.props.project.addNew(id, type);
    this.setState({tasks: this.state.tasks});
  }
}

TimedProject.propTypes = {
  project: React.PropTypes.object.isRequired
};
