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

const fetchPadlet = function (url, details) {
  return request('https://padlet.com/padlets/' + url + '/exports/list.csv')
    .then(function (data) {
      data = parse(data)
      var updatedBoxes = []
      var latestUpdated = 0;
      for (var i=1; i<data.length; i++) {
        let updated = new Date(data[i][5])
        if (updated > new Date(details.lastUpdated)) {
          if (updated > latestUpdated) latestUpdated = updated;
          updatedBoxes.push(data[i][0])
        }
      }
      if (updatedBoxes.length > 0) {
        db.push("/urls/" + url + "/lastUpdated", latestUpdated);
        return {
          url: url,
          emails: details.emails,
          boxes: updatedBoxes
        }
      }
      return null
    })
    .catch(function (err) {
      console.log('[ERR] Can\'t fetch padlet ' + url)
      console.log(err)
    })
}

module.exports = function () {
  var urls = db.getData("/urls")

  var stats = {
    urls: { total: 0, updated: 0 },
    boxes: 0,
    emails: 0
  }

  var promiseArray = [];
  for (var url in urls) {
    promiseArray.push(fetchPadlet(url, urls[url]))
    stats.urls.total++
  }

  return Promise.all(promiseArray)
    .then(function (results) {
      for (var result of results) {
        if (result) {
          stats.urls.updated++
          for (var email of result.emails) {

            var html = '<h2>Seuraamasi padletti on päivittynyt!</h2><h3>Seuraaviin laatikoihin on tullut muutoksia:</h3><ul>'
            for (var box of result.boxes) {
              stats.boxes++
              html += '<li>' + box + '</li>'
            }
            html += '</ul><h3>Pääset katsomaan muutoksia alla olevasta linkistä:</h3><a href="https://padlet.com/embed/' + result.url + '">https://padlet.com/embed/' + result.url + '</a>'
            console.log(html)
            transporter.sendMail(
              {
                from: process.env.EMAIL_FROM,
                to: email,
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
    })
}
