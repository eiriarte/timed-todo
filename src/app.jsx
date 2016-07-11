require("./app.scss");

import React from 'react';
import {render} from 'react-dom';
import Project from './project';
import TimedProject from './components/timedproject.jsx';

const project = new Project();

render(<TimedProject project={project}/>, document.getElementById('app'));
