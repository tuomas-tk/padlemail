require('dotenv').config()
const Promise = require('promise')
const express = require('express')
const app = express()
const db  = require('./db.js')
const update = require('./update.js')

app.get('/', function (req, res) {
  var data = db.getData("/urls")
  res.json(data)
})

app.get('/update', function (req, res) {
  update()
    .then((stats) => {
      res.json({
        updated: true,
        stats: stats
      })
    })
    .catch((err) => {
      console.log(err)
      res.status(500).json({
        updated: false,
        error: err
      })
    })
})

app.get('/add/:url/:email', function (req, res) {
  console.log(req.params.url)
  console.log(req.params.email)

  db.push("/urls/" + req.params.url + "/emails[]", req.params.email);
  db.push("/urls/" + req.params.url + "/lastUpdated", new Date())

  res.send('OK')
})

app.listen(3000, function () {
  console.log('Padlemail listening on port 3000!')
})
