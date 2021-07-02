//require('dotenv').config()

const sgMail = require("@sendgrid/mail")
//sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const msg = {
    to: 'kylel00012@gmail.com',
    from: "kylel00012@gmail.com",
    subject : "hey",
    text: "hey",
    html: '<strong>hey<strong>'
}
sgMail.send(msg)