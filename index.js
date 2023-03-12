require('dotenv').config()
const express = require('express')
const app = express()
const port = 8080
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const { ObjectId } = require('mongodb');
app.use(bodyParser.json())
app.use(bodyParser.raw({ type: 'application/vnd.custom-type' }))
app.use(bodyParser.text({ type: 'text/html' }))
let connection, collection

(async () => {
    try {
        connection = await MongoClient.connect(process.env.MONGO_URL)
        const db = connection.db('groundup_test')
        collection = db.collection('anomalies')
        console.log("CONNECTED")
    } catch (error) {
        throw error
    }
})()

app.get('/', async (req, res) => {
  res.send('Hello World!')
})

app.get('/anomalies', async (req, res) => {
    const cursor = collection.find({});
    const anomalies = []
    await cursor.forEach((data) => {
        anomalies.push(data)
    })

    res.send(anomalies)
})

app.get('/audio/:name', (req, res) => {
    const filename = req.params.name
    console.log("ASDSAD", filename, `/audio/${filename}`, __dirname, `/audio/${filename}`);
    res.sendFile(__dirname + `/audio/${filename}`)
})

app.post('/anomalies', async (req, res) => {
    console.log(req.body)
    res.send("TEST")
})

app.patch('/anomalies/:id', async (req, res) => {
    const {suspectedReason, action, comment} = req.body
    const found = await collection.findOne({_id: new ObjectId(req.params.id)})
    if (!found) throw Error("Cannot found")
    try {
        const updateAnomaly = await collection.updateOne({_id: new ObjectId(req.params.id)}, {
            $set: {
                suspectedReason,
                action,
                comment
            }
        })
        res.send("Update")
    } catch (error) {
        throw error
    }
})

app.listen(port, () => {
    console.log('Example app listenig to port:' + port)
})

module.exports = app;