require('./tasklist.scss');

import React from 'react';
import TaskRow from './taskrow.jsx';

export default class TaskList extends React.Component {
  render() {
    return (
      <ul className="task-list">
        { this.props.tasks.map(task => {
          const current = (this.props.currentId === task.id);
          return <TaskRow {...task} key={task.id} id={task.id} current={current}
            onChecked={this.props.onChecked}
            onRemoved={this.props.onRemoved}
            onEdited={this.props.onEdited}
            currentId={this.props.currentId}/>;
        }) }
      </ul>
    );
  }
}

TaskList.propTypes = {
  tasks: React.PropTypes.array.isRequired,
  onChecked: React.PropTypes.func.isRequired,
  onRemoved: React.PropTypes.func.isRequired,
  onEdited: React.PropTypes.func.isRequired,
  currentId: React.PropTypes.string
};
