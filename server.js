require('dotenv').config()

var PORT = process.env.PORT || 3000

const express = require('express')
const app = express()
const mongoose = require('mongoose')
const Agent = require('./models/agent')

app.get("/", function(req, res){
    res.send("Hello World!")
})

mongoose.connect(process.env.DATABASE_URL || "mongodb://localhost/AntaiDataBase", {useNewUrlParser: true, useUnifiedTopology: true}).catch((err) => console.log(err))
console.log(process.env.DATABASE_URL)
const db = mongoose.connection
db.once('open', () => console.log('Connectedd to Database'))

app.use(express.json())

const agentRouter = require('./routes/agents')
app.use('/agents', agentRouter)

app.listen(PORT, () => console.log('Server Started'))

