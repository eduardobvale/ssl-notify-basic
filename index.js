const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const path = require('path')
const moment = require('moment')
const sslChecker = require('ssl-checker')
const nodemailer = require('nodemailer')
const app = express()

/*Middlewares*/

app.use(morgan('dev'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'public'))

/*Routes*/
const options = ["GET", 443]
const hosts = [""]

async function checkSsl() {
  const checkedSsl = await Promise.all(hosts.map(async host => { 
    const verifiedSsl = await sslChecker(host, ...options);
    return {
      host: host,
      valid_to: moment(verifiedSsl.valid_to).format("DD/MM/YYYY HH:mm:ss"),
      valid_from: moment(verifiedSsl.valid_from).format("DD/MM/YYYY HH:mm:ss"),
      days_remaining: verifiedSsl.days_remaining
    }
  }));
  return checkedSsl;
}

async function sendEmail(filtered) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: '',
      pass: ''
    }
  });

  const mailOptions = {
    from: '',
    to: '',
    subject: '',
    html: ''
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err)
    } else {
      console.log(info)
    }
  });
}

async function checkDaysRemain(sslCheckeds) {
 const filtered = sslCheckeds.filter((ck) => ck.days_remaining <= 30);
 sendEmail(filtered);
}

app.get('/all', async (req, res) => {
  const sslChecked = await checkSsl();
  //checkDaysRemain(sslChecked);
  res.render('home', {
      host: sslChecked
  });
  
});

app.listen(4000, () => console.log('Server Listenning on Port 3000'))

