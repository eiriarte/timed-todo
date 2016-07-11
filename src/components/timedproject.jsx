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
          onChecked={this._handleCheck}
          onEdited={this._editTask}
          onRemoved={this._removeTask}/>
      </div>
    );
  }

  componentDidMount() {
    Mousetrap.bind('p', this._handlePause);

    ipcRenderer.on('pause', this._handlePause);
    ipcRenderer.on('new', this._newTask);
  }

  componentWillUnmount() {
    clearInterval(this._timer);
  }

  _toggleWorking() {
    const working = !this.state.working;
    const current = working ? this.state.current : undefined;
    if (working) {
      this._firstTick = Date.now();
      this._timer = setInterval(this._tick, 500);
    } else {
      clearInterval(this._timer);
    }
    this.setState({working, current});
  }

  _tick() {
    if (!this.state.working || this.state.tasks.length === 0) return;

    const tack = Date.now();
    const worked = tack - this._firstTick;
    const interval = worked - this.state.worked;

    const [tasks, current] = this.props.project.updateTasks(interval, worked);

    this.setState({tasks, worked, current});
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

  _newTask() {
    this.props.project.addNew();
  }
}

TimedProject.propTypes = {
  project: React.PropTypes.object.isRequired
};
