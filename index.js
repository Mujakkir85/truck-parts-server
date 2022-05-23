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
        //const Collection = client.db('truck_parts').collection('parts')

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


