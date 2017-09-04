# padlemail

Node.js application for monitoring a padlet, and sending email notifications about updates.

## Demo

https://padlemail.herokuapp.com

## Background
My teacher started to use https://padlet.com for announcements, but I didn't want to continously check it for updates. Solution: create a bot for it!

## Technical details
- Coded in Node.js
- `npm start` starts the UI
- `npm run update` starts the update worker
- Currently hosted on Heroku
- Sends emails via specified SMTP server

## Configuration
Put these in a .env file or to Config Variables in Heroku

#### DATABASE_URL
The location and credentials of a PostgreSQL database

#### SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USERNAME, SMTP_PASSWORD
Details about the SMTP server for sending emails

#### EMAIL_FROM
The `from` field in the sent emails. For example: `"Padlemail" <padlemail@example.com>`

#### UPDATE_INTERVAL
The delay between checks for updates. In minutes.

## License
The code in this project is licensed under MIT license.
