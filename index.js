const express = require('express');

const { MongoClient } = require('mongodb');

const cors = require('cors');

require('dotenv').config();

const ObjectId = require('mongodb').ObjectId;

const app = express();

const port = process.env.PORT || 5000;

// // middleware
app.use(cors());

app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b65iy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("exploreCycles");
        const cyclesCollection = database.collection("cycles");
        const orderCollection = database.collection('orders');

        // GET API
        app.get('/cycles', async (req, res) => {
            const cursor = cyclesCollection.find({});
            const cycles = await cursor.toArray();
            res.send(cycles);
        });

        // GET Single Service
         app.get('/cycles/:id', async (req, res) => {
            const id = req.params.id;
            console.log('getting specific service', id);
            const query = { _id: ObjectId(id) };
            const cycle = await cyclesCollection.findOne(query);
            res.json(cycle);
        });

                // Add Orders API
                app.get('/orders', async(req, res) => {
                    let query = {};
                    const email = req.query.email;
                    if(email) {
                        query = {email: email};
                    }
                    const cursor = orderCollection.find(query);
                    const orders = await cursor.toArray();
                    res.json(orders);
                });

                app.post('/orders', async (req, res) => {
                    const order = req.body;
                    order.createdAt = new Date();
                    const result = await orderCollection.insertOne(order);
                    res.json(result);
                });

        // POST API

        app.post('/cycles', async (req, res) => {
            
            const cycle = req.body;
            console.log('hit the post api', cycle);
            const result = await cyclesCollection.insertOne(cycle);
            console.log(result);
            res.json(result)

        });

        app.delete('/cycles/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await cyclesCollection.deleteOne(query);
            res.json(result);
        })


    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('running my niche-website Server');
});

app.listen(port, () => {
    console.log('Running server on port', port);
})