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


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({ message: 'UnAuthorized access' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next();
    });
}


async function run() {

    try {
        await client.connect();
        console.log("DataBase Connected!")
        const partsCollection = client.db('truck_parts').collection('parts')
        const usersCollection = client.db('truck_parts').collection('users')
        const ordersCollection = client.db('truck_parts').collection('orders')
        const reviewsCollection = client.db('truck_parts').collection('reviews')

        const verifyAdmin = async (req, res, next) => {
            const requester = req.decoded.email;
            const requesterAccount = await usersCollection.findOne({ email: requester });
            // sercure admin page for not access by url
            if (requesterAccount.role === 'admin') {
                next();
            }
            else {
                return res.status(403).send({ message: 'forbidden access' });
            }

        }

        //for secure admin
        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await usersCollection.findOne({ email: email });
            const isAdmin = user.role === 'admin'; // get boolen value true or false
            res.send({ admin: isAdmin })
        })

        //for make admin
        app.put('/user/admin/:email', verifyJWT, verifyAdmin, async (req, res) => {
            const email = req.params.email;

            const filter = { email: email };
            const updateDoc = {
                $set: { role: 'admin' },
            };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        //verifyJWT to make user varified
        app.get('/user', verifyJWT, async (req, res) => {
            const users = await usersCollection.find().toArray();
            res.send(users);
        })



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

        // app.get('/allparts', async (req, res) => {
        //     const query = {};
        //     const cursor = partsCollection.find(query);
        //     const allparts = await cursor.toArray();
        //     res.send(allparts)
        // })

        //get single purchase details
        app.get('/purchase/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await partsCollection.findOne(query);
            res.send(result);
        })

        //load all user orders by email in Dashboard in Myorders page

        app.get('/userOrders', verifyJWT, async (req, res) => {
            const useremail = req.query.email;
            const decodedEmail = req.decoded.email
            if (useremail === decodedEmail) {
                const query = { userEmail: useremail }
                const userorders = await ordersCollection.find(query).toArray();
                return res.send(userorders)
            }
            else {
                return res.status(403).send({ message: 'forbidden access' });
            }
        })

        //load single user for my profile
        /* app.get('/singleuser', verifyJWT, async (req, res) => {
             const useremail = req.query.email;
             // console.log(useremail);
             const decodedEmail = req.decoded.email
             if (useremail === decodedEmail) {
                 const query = { email: useremail }
                 const singleuser = await usersCollection.find(query).toArray();
                 return res.send(singleuser)
             }
             else {
                 return res.status(403).send({ message: 'forbidden access' });
             }
 
         })*/

        // Update single user
        app.put('/updateuser/:email', async (req, res) => {
            const email = req.params.email
            const updateUser = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    email: updateUser.email,
                    username: updateUser.name,
                    loaction: updateUser.loaction,
                    phone: updateUser.phone
                }
            };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })




        //Load All reviews

        app.get('/showReview', async (req, res) => {
            const query = {};
            const cursor = reviewsCollection.find(query);
            const allreviews = await cursor.toArray();
            res.send(allreviews)
        })


        //order product from purchaseparts page 

        app.post('/orderparts', async (req, res) => {
            const newOrder = req.body;
            const result = await ordersCollection.insertOne(newOrder);
            res.send(result);
        })

        //Delete Orders
        app.delete('/myorders/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(filter);
            res.send(result)
        })

        //Delete single products from all parts

        app.delete('/singleproduct/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await partsCollection.deleteOne(filter);
            res.send(result)
        })

        //Add Reviews

        app.post('/addreview', verifyJWT, async (req, res) => {
            const newReview = req.body;
            const result = await reviewsCollection.insertOne(newReview)
            res.send(result)
        })

        app.post('/addparts', verifyJWT, async (req, res) => {
            const addparts = req.body;
            const result = await partsCollection.insertOne(addparts)
            res.send(result)
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


