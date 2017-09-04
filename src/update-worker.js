#!/usr/bin/env node
const update = require('./update.js')

var TIMEOUT = -1
if (process.env.UPDATE_INTERVAL > 0) {
  TIMEOUT = process.env.UPDATE_INTERVAL * 60 * 1000
}

function loop() {
  console.log('> STARTED update')
  update()
    .then((stats) => {
      console.log('Update successful')
      console.log(' Total padlets:    ' + stats.padlets.total);
      console.log(' Updated padlets:  ' + stats.padlets.updated);
      console.log(' Updated boxes:    ' + stats.boxes);
      console.log(' Sent emails:      ' + stats.emails);
    })
    .catch((err) => {
      console.log('ERROR:')
      console.log(err)
    })
    .then(() => {
      console.log('> FINISHED update')
      if (TIMEOUT > 0)
        setTimeout(loop, TIMEOUT)
    })
}

loop()
