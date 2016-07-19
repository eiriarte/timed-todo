import moment from 'moment';

const ONE_HOUR = 3600000;
const ONE_MINUTE = 60000;

const utils = {
  getHHMM(task, duration = false) {
    let format;
    let time;
    let sign;

    if (duration) {
      time = task.duration || '';
    } else if (task.current && task.duration) {
      time = task.duration - (task.elapsed || 0);
    } else if (!task.current && !task.done) {
      if (!task.duration) {
        return '';
      }
      time = task.duration - (task.elapsed || 0);
    } else {
      time = task.elapsed || 0;
    }

    sign = time < 0 ? '-' : '';
    if (sign === '-') {
      time = -time;
    }

    if (!duration && task.current) {
      format = time >= ONE_HOUR ? 'H:mm:ss' : 'mm:ss';
    } else {
      format = time >= ONE_HOUR ? 'H:mm[h]' : 'mm[m]';
    }

    if (time) {
      return sign + moment.utc(time).format(format);
    }
    return '';
  },

  getPauseHHMM(pause) {
    let format;

    if (pause.active) {
      format = pause.elapsed >= ONE_HOUR ? 'H:mm:ss' : 'mm:ss';
    } else {
      format = pause.elapsed >= ONE_HOUR ? 'H:mm[h]' : 'mm[m]';
    }

    return moment.utc(pause.elapsed).format(format);
  },

  getSyntax(task) {
    return task.title + ' ' + this.getHHMM(task, true);
  },

  newTask(id, text) {
    const reMinutes = /^(\d+)m$/i;
    const reHours = /^(\d+)h$/i;
    const reHHMM = /^(\d+):(\d\d?)h$/i;
    const split = text.trim().split(' ');
    const duration = split.pop();
    let match;
    let hours = 0;
    let minutes = 0;
    let title = split.join(' ');

    match = reMinutes.exec(duration);
    if (match) {
      minutes = Number(match[1]);
    } else {
      match = reHours.exec(duration);
      if (match) {
        hours = Number(match[1]);
      } else {
        match = reHHMM.exec(duration);
        if (match) {
          hours = Number(match[1]);
          minutes = Number(match[2]);
        } else {
          title += ' ' + duration;
        }
      }
    }

    return {
      id: id,
      title: title,
      duration: ONE_HOUR * hours + ONE_MINUTE * minutes,
      editing: false
    };
  }
};

export default utils;
