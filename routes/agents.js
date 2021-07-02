require('dotenv').config()

const express = require('express')
const router = express.Router()
const Agent = require('../models/agent')

//Get all

router.get('/', paginatedResults(Agent), async (req, res) => {
    const username = req.query.username
    const email = req.query.email
    let filterQuery = {}
    if (username){
        filterQuery = {
            username: new RegExp(username, 'i'),
        }       
    } 
    else if (email) {
        filterQuery = {
            email: new RegExp(email, 'i')
        }
    }
    try {
        const agents = await Agent.find(filterQuery)
        if (req.query.page) {
            const pageCount = Math.ceil(agents.length / 10);
            let page = parseInt(req.query.page);
            if (!page) { page = 1;}
            if (page > pageCount) {
                page = pageCount
            }
            res.json({
                "page": page,
                "pageCount": pageCount,
                "agents": agents.slice(page * 10 - 10, page * 10)
            });
        }
        return res.json(agents)
        //res.json(res.paginatedResults) 
        } catch (err) {
        res.status(500).json({message: err.message})
    }
})

function paginatedResults(model) {
    return async (req, res, next) => {
    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)
    
    const startIndex = (page - 1) * limit
    const endIndex = page * limit

    const results = {}

    if (endIndex < await model.countDocuments().exec()) {
        results.next = {
            page: page + 1,
            limit: limit
        }
    }
    if (startIndex > 0) {
        results.previous = {
            page: page - 1,
            limit:limit
        }
    }

    try {
         results.results = await model.find().limit(limit).skip(startIndex).exec()
         next()
    } catch (error) {
        res.status(500).json({message: e.message})
    }
   
    res.paginatedResults = results
}}

//Get One
router.get('/:id', getAgent, (req, res) => {
    res.json(res.agent)
})

//Create one
router.post('/', async (req, res) => {
    const agent = new Agent({
        username: req.body.username,
        email: req.body.email
    })
   console.log(agent.id)
    try {
        const newAgent = await agent.save()
        res.status(201).json(newAgent)
        const sgMail = require("@sendgrid/mail")
        sgMail.setApiKey(process.env.SENDGRID_API_KEY)
        
        const msg = {
            to: agent.email,
            from: "kylel00012@gmail.com",
            subject : "Welcome",
            text: "Dear " + agent.username + "," + "\n\n" +
            "Your member id is " + agent.id + "." + " Hope you enjoy our web services!" + "\n\n" +
            "Best," + "\n" +
            "Antai Global Inc."
        }
        sgMail.send(msg).catch((error) => {
          console.error(error)
        })
    } catch (err) {
        res.status(400).json({message: err.message})
    }   
})

//Update one
router.patch('/:id', getAgent, async (req, res) => {
    if (req.body.username != null) {
        res.agent.username = req.body.username
    }
    if (req.body.email != null) {
        res.agent.email = req.body.email
    }
    try {
        const updatedAgent = await res.agent.save()
        res.json(updatedAgent)
    } catch (err) {
        res.status(400).json({message: err.message})
    }
})

//Delete one
router.delete('/:id', getAgent,  async (req, res) => {
    try {
        await res.agent.remove()
        res.json({message: 'Deleted Agent'})
    } catch (err) {
        res.status(500).json({message: err.message})
    }
})

async function getAgent(req, res, next) {
    let agent
    try {
        agent = await Agent.findById(req.params.id)
        if (agent == null) { 
            return res.status(404).json({message: 'Cannot find agent'})
        }
    } catch (err) {
        return res.status(500).json({message: err.message})
    }
    res.agent = agent
    next()
}


module.exports = router