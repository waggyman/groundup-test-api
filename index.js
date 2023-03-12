require('dotenv').config()
const express = require('express')
const app = express()
const port = 8080
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const { ObjectId } = require('mongodb');
const cors = require('cors')

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT']
}))
app.use(bodyParser.json())
app.use(bodyParser.raw({ type: 'application/vnd.custom-type' }))
app.use(bodyParser.text({ type: 'text/html' }))
app.get('/', async (req, res) => {
  res.send('Hello World!')
})

app.get('/anomalies', async (req, res) => {
    try {
        const connection = await MongoClient.connect(`${process.env.MONGO_URL}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        const db = connection.db('groundup_test')
        const collection = db.collection('anomalies')
        const cursor = collection.find({});
        const anomalies = []
        await cursor.forEach((data) => {
            anomalies.push(data)
        })
        connection.close()
        res.send(anomalies)
    } catch (error) {
        console.log("ERROR ON GETTING ANOMALIES", error)
        return res.send("ERROR!")
    }
})

app.get('/audio/:name', (req, res) => {
    const filename = req.params.name
    console.log("ASDSAD", filename, `/audio/${filename}`, __dirname, `/audio/${filename}`);
    res.sendFile(__dirname + `/audio/${filename}`)
})

app.post('/anomalies/:id', async (req, res) => {
    const connection = await MongoClient.connect(`${process.env.MONGO_URL}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    const db = connection.db('groundup_test')
    const collection = db.collection('anomalies')
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
        connection.close()
        res.send("Update")
    } catch (error) {
        throw error
    }
})

app.listen(port, () => {
    console.log('Example app listenig to port:' + port)
})

module.exports = app;