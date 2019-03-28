var logger = require('fluent-logger')
var LineByLineReader = require('line-by-line'),
    lr = new LineByLineReader('custom.log');

logger.configure('httpd', {
   host: 'localhost',
   port: 24224,
   timeout: 3.0,
   reconnectInterval: 600000 // 10 minutes
});

lr.on('error', function (err) {
	console.error(err)
});

let i = 0
lr.on('line', function (line) {
// 'line' contains the current line without the trailing newline character.

// send an event record with 'tag.label'
  if (! line.trim()) return

  const ip = line.split(' ')[0]
  const t = line.match(/\[(.*)\]/)[1]

  logger.emit('access', { timestamp: t,  host: ip })
  lr.pause()
  if (i++ > 2) {
    process.exit(1)
  }
  setTimeout( () => lr.resume(), 100 )
});

lr.on('end', function () {
	// All lines are read, file is closed now.
	console.log('end')
	console.log('end')
	console.log('end')
	console.log('end')
	console.log('end')
	console.log('end')
});




