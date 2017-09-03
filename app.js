require('dotenv').config()
const Promise = require('promise')
const express = require('express')
const app = express()
const db  = require('./db.js')
const update = require('./update.js')

/*app.get('/', function (req, res) {
  var data = db.getData("/urls")
  res.json(data)
})*/

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

app.get('/add', function (req, res) {
  console.log(req.query)
  const url = req.query.url
  const email = req.query.email
  console.log(url)
  console.log(email)

  db.query('SELECT id FROM padlets WHERE url = $1', [url])
    .then((searchResult) => {
      if (searchResult.rowCount == 0) { // no padlet in db
        return db.query('INSERT INTO padlets(url) VALUES ($1) RETURNING id', [url])
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
      db.query('INSERT INTO emails(padlet, email) VALUES ($1, $2)', [padletID, email])
        .then((insertResult) => {
          if (insertResult.rowCount == 1) {
            return true
          } else {
            return Promise.reject('ERROR: rowCount = ' + insertResult.rowCount)
          }
        })
    })
    .then(() => {
      res.redirect('/?thankyou')
    })
    .catch((err) => {
      res.status(500).json({
        error: err
      })
    })
})

app.use(express.static('public'))

app.listen(process.env.PORT || 3000, function () {
  console.log('Padlemail listening on port ' + (process.env.PORT || 3000) + '!')
})
