const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1buel.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {

    try {
        await client.connect();
        console.log("DataBase Connected!")
        const partsCollection = client.db('truck_parts').collection('parts')
        const usersCollection = client.db('truck_parts').collection('users')
        const ordersCollection = client.db('truck_parts').collection('orders')

        //make users
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const username = req.body.username;
            //console.log(user);
            const filter = { email: email, username: username };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            }
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '2h' })
            res.send({ result, token });

        })

        //get all parts show in home page
        app.get('/parts', async (req, res) => {
            const query = {};
            const cursor = partsCollection.find(query);
            const allparts = await cursor.toArray();
            res.send(allparts)
        })

        //get single purchase details
        app.get('/purchase/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await partsCollection.findOne(query);
            res.send(result);
        })

        //order product from purchaseparts page 

        app.post('/orderparts', async (req, res) => {
            const newOrder = req.body;
            const result = await ordersCollection.insertOne(newOrder);
            res.send(result);
        })

    }
    finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello Truck parts !')
})

app.listen(port, () => {
    console.log(`Truck parts app listening on port ${port}`)
})


