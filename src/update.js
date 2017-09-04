require('dotenv').config()
const db  = require('./db.js')
const Promise = require('promise')
const nodemailer = require('nodemailer')
const request = require('request-promise-native')
const parse = require('csv-parse/lib/sync')

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD
  }
})

const fetchPadlet = async function (padlet) {
  var data = await request('https://padlet.com/padlets/' + padlet.url + '/exports/list.csv')

  data = parse(data)
  var updatedBoxes = []
  var latestUpdated = 0;
  for (var i=1; i<data.length; i++) {
    let updated = new Date(data[i][5])
    if (updated > new Date(padlet.updated)) {
      if (updated > latestUpdated) latestUpdated = updated;
      updatedBoxes.push(data[i][0])
    }
  }
  if (updatedBoxes.length > 0) {
    await db.query('UPDATE padlets SET updated = $1 WHERE id = $2', [latestUpdated, padlet.id])
    return updatedBoxes
  }
  return null
}

module.exports = async function () {
  const padlets = (await db.query('SELECT * FROM padlets')).rows

  var stats = {
    padlets: { total: 0, updated: 0 },
    boxes: 0,
    emails: 0
  }

  for (var padlet of padlets) {
    var updated = await fetchPadlet(padlet)
    stats.padlets.total++
    if (updated) {
      stats.padlets.updated++
      const emails = (await db.query('SELECT * FROM emails WHERE padlet = $1', [padlet.id])).rows
      for (var email of emails) {
        var html = '<h2>Seuraamasi padletti on päivittynyt!</h2><h3>Seuraaviin laatikoihin on tullut muutoksia:</h3><ul>'
        for (var box of updated) {
          stats.boxes++
          html += '<li>' + box + '</li>'
        }
        html += '</ul><h3>Pääset katsomaan muutoksia alla olevasta linkistä:</h3><a href="https://padlet.com/embed/' + padlet.url + '">https://padlet.com/embed/' + padlet.url + '</a>'
        console.log(html)
        transporter.sendMail(
          {
            from: process.env.EMAIL_FROM,
            to: email.email,
            subject: 'Seuraamasi padletti on päivittynyt',
            html: html
          }, (error, info) => {
            if (error) {
              console.log('[ERROR] Can\'t send email: ' + error)
            }
            console.log('[DEBUG] Message %s sent: %s', info.messageId, info.response)
          }
        )
        stats.emails++
      }
    }
  }

  return stats
}
