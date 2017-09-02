const update = require('./update.js')
console.log('> STARTED update')
update()
  .then((stats) => {
    console.log('Update successful')
    console.log(' Total padlets:    ' + stats.urls.total);
    console.log(' Updated padlets:  ' + stats.urls.updated);
    console.log(' Updated boxes:    ' + stats.boxes);
    console.log(' Sent emails:      ' + stats.emails);
  })
  .catch((err) => {
    console.log('ERROR:')
    console.log(err)
  })
  .then(() => {
    console.log('> FINISHED update')
  })
