import moment from 'moment';

const ONE_HOUR = 3600000;
const ONE_MINUTE = 60000;

const utils = {
  getHHMMFormat(time, withSeconds) {
    let format;
    const sign = time < 0 ? '-' : '';

    if (sign === '-') {
      time = -time;
    }

    if (withSeconds) {
      format = time >= ONE_HOUR ? 'H:mm:ss' : 'mm:ss';
    } else {
      format = time >= ONE_HOUR ? 'H:mm[h]' : 'mm[m]';
    }

    return sign + moment.utc(time).format(format);
  },

  getHHMM(task, duration = false) {
    let time;

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

    if (time) {
      return this.getHHMMFormat(time, !duration && task.current);
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
    const split = text.trim().split(' ');
    const lastToken = split.pop();
    const secondLastToken = split.pop();
    let numCopies;
    let duration;

    numCopies = parseNumCopies(lastToken);
    if (typeof numCopies === 'undefined') {
      numCopies = 1;
      split.push(secondLastToken);
      duration = parseDuration(lastToken);
      if (typeof duration === 'undefined') {
        duration = 0;
        split.push(lastToken);
      }
    } else {
      duration = parseDuration(secondLastToken);
      if (typeof duration === 'undefined') {
        duration = 0;
        split.push(secondLastToken);
      }
    }

    const title = split.join(' ');

    return {id, title, duration, numCopies, editing: false};
  }
};

function parseNumCopies(num) {
  const re = /^(\d+)x$/i;
  const match = re.exec(num);

  if (match) {
    return Number(match[1]);
  }

  return undefined;
}

function parseDuration(duration) {
  const reMinutes = /^(\d+)m$/i;
  const reHours = /^(\d+)h$/i;
  const reHHMM = /^(\d+):(\d\d?)h$/i;
  let match;
  let hours = 0;
  let minutes = 0;

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
        return undefined;
      }
    }
  }

  return ONE_HOUR * hours + ONE_MINUTE * minutes;
}

export default utils;
