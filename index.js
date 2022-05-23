const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();


app.use(cors());
app.use(express.json());



run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello Truck parts !')
})

app.listen(port, () => {
    console.log(`Truck parts app listening on port ${port}`)
})


