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

  db.query('SELECT id FROM padlets WHERE url = $1', [req.params.url])
    .then((searchResult) => {
      if (searchResult.rowCount == 0) { // no padlet in db
        return db.query('INSERT INTO padlets(url) VALUES ($1) RETURNING id', [req.params.url])
          .then((insertResult) => {
            if (insertResult.rowCount == 1) {
              return insertResult.rows[0].id
            } else {
              return Promise.reject('ERROR: rowCount = ' + insertResult.rowCount)
            }
          })
      }
      return searchResult.rows[0].id
    })
    .then((padletID) => {
      db.query('INSERT INTO emails(padlet, email) VALUES ($1, $2)', [padletID, req.params.email])
        .then((insertResult) => {
          if (insertResult.rowCount == 1) {
            return true
          } else {
            return Promise.reject('ERROR: rowCount = ' + insertResult.rowCount)
          }
        })
    })
    .then(() => {
      res.send('OK')
    })
    .catch((err) => {
      res.status(500).json({
        error: err
      })
    })
})

app.listen(process.env.PORT || 3000, function () {
  console.log('Padlemail listening on port ' + (process.env.PORT || 3000) + '!')
})
