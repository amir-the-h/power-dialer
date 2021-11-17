// credits https://gist.github.com/sergiodxa/dc9bd0bcfaf024855571a154d32f73fa

const messages = {
  year: { singular: 'year', plural: 'years', denominator: 365, inSeconds: 31536000 },
  day: { singular: 'day', plural: 'days', denominator: 24, inSeconds: 86400 },
  hour: { singular: 'hour', plural: 'hours', denominator: 60, inSeconds: 3600 },
  minute: { singular: 'minute', plural: 'minutes', denominator: 60, inSeconds: 60 },
  second: { singular: 'second', plural: 'seconds', inSeconds: 1 }
}

function pluralize(value, unit) {
  if (value === 1) return messages[unit].singular;
  return messages[unit].plural;
}

function isFloat(value) {
  return value % 1 !== 0;
}

function format(value, unit) {
  return `${parseInt(value, 10)} ${pluralize(parseInt(value, 10), unit)}`
}

function remainings(seconds, value, unit) {
  return isFloat(value)
    ? (seconds - parseInt(value, 10) * messages[unit].inSeconds)
    : 0
}

function getTimeFromSeconds(seconds, unit) {
  const quantity = seconds / messages[unit].inSeconds;
  const remaining = remainings(seconds, quantity, unit)
  return { quantity: parseInt(quantity), remaining };
}

function formatDuration(_seconds) {
  if (_seconds === 0) return 'now';
  if (_seconds === 1) return `1 ${messages.second.singular}`;
  if (_seconds < 60) return `${_seconds} ${messages.second.plural}`;

  const message = [];

  let year = getTimeFromSeconds(_seconds, 'year')
  let day = getTimeFromSeconds(year.remaining, 'day')
  let hours = getTimeFromSeconds(day.remaining, 'hour')
  let minutes = getTimeFromSeconds(hours.remaining, 'minute')
  let seconds = minutes.remaining
  
  if (year.quantity > 0) {
    message.push(format(year.quantity, 'year'));
  }
  
  if (day.quantity > 0) {
    message.push(format(day.quantity, 'day'));
  }
  
  if (hours.quantity > 0) {
    message.push(format(hours.quantity, 'hour'));
  }
  
  if (minutes.quantity > 0) {
    message.push(format(minutes.quantity, 'minute'));
  }
  
  if (seconds > 0) {
    message.push(format(seconds, 'second'));
  }
  return message.length > 2
    ? message.slice(0, message.length - 1).join(', ') + " and " + message[message.length - 1]
    : message.join(' and ');
}

module.exports = formatDuration;