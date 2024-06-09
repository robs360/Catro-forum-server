const express = require("express")
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken');
const stripe = require("stripe")('sk_test_51PM2J8EJ4sCmNGOlOrilnBC6h4FDLil1YexvOYtxhLNNP6zot1QG6atrB6DIV7YUg0KXqhAqE4o5zwL5eneckCvN000419BKJj');
const port = process.env.PORT || 5000
require('dotenv').config()
app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tju8r4h.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const userCollection = client.db('catro').collection('users')
    const patCollection = client.db('catro').collection('pat')
    const adoptCollection = client.db('catro').collection('adopted')
    const campaigntCollection = client.db('catro').collection('campaign')
    const donatorstCollection = client.db('catro').collection('donators')
    const verifyToken = (req, res, next) => {

      //  console.log("it is content of headers",req.headers.authorization)
      if (!req.headers.authorization) {
        console.log("is it undefined", req.headers.authorization)
        return res.status(401).send({ message: "Forbidden access" })
      }
      const token = req.headers.authorization.split(' ')[1];

      jwt.verify(token, process.env.DB_TOKEN, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: "Unauthorize access" })
        }
        req.decoded = decoded;
        next()
      })
    }

    app.post('/donators', async (req, res) => {
      const info = req.body;
      const result = await donatorstCollection.insertOne(info)
      res.send(result)
    })
    app.get('/donators', verifyToken, async (req, res) => {
      const result = await donatorstCollection.find().toArray()
      res.send(result)
    })
    app.delete('/donators/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await donatorstCollection.deleteOne(query)
      res.send(result)
    })
    app.get('/pat', async (req, res) => {
      const mySort = { date: -1 }
      const result = await patCollection.find().sort(mySort).toArray()
      res.send(result)
    })

    app.delete('/petdelete/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await patCollection.deleteOne(query)
      res.send(result)
    })
    app.get('/pet', verifyToken, async (req, res) => {
      const mySort = { date: -1 }
      const result = await patCollection.find().sort(mySort).toArray()
      res.send(result)
    })
    app.get('/pat/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await patCollection.findOne(query)
      res.send(result)
    })
    app.put('/updatepet/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const update = req.body;

      const query = { _id: new ObjectId(id) }
      const options = { upsert: true }
      const updateUser = {
        $set: {
          name: update.petName,
          category: update.petCategory,
          age: update.petAge,
          date: update.date,
          location: update.location,
          image: update.image,
          email: update.email,
          title: update.shortDes,
          description: update.description,
        }
      }
      const result = await patCollection.updateOne(query, updateUser, options)
      res.send(result)
    })

    app.post('/createcamp', async (req, res) => {
      const info = req.body;
      const result = await campaigntCollection.insertOne(info)
      res.send(result)
    })
    app.put('/updatecampaign/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const update = req.body;

      const query = { _id: new ObjectId(id) }
      const options = { upsert: true }
      const updateUser = {
        $set: {
          category: update.category,
          email: update.email,
          pet_image: update.image,
          maximum_donation: update.max_donation,
          last_date_of_donation: update.last_date,
          short_description: update.shorts_des,
        }
      }
      const result = await campaigntCollection.updateOne(query, updateUser, options)
      res.send(result)
    })
    app.patch('/update/status/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const options = { upsert: true }
      const updateStatus = {
        $set: {
          status: 'Adopted',
        }
      }
      const result = await patCollection.updateOne(query, updateStatus, options)
      res.send(result)
    })
    app.put('/update/campaign/status/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const options = { upsert: true }
      const info = await campaigntCollection.findOne(query)
      let stat = '';
      if (info.status === 'unpause') {
        stat = 'pause'
      }
      else {
        stat = 'unpause'
      }
      const updateStatus = {
        $set: {
          status: stat,
        }
      }
      const result = await campaigntCollection.updateOne(query, updateStatus, options)
      res.send(result)
    })
    app.post('/addpet', async (req, res) => {
      const info = req.body;
      console.log(info)
      const result = await patCollection.insertOne(info)
      res.send(result)
    })
    app.post('/users', async (req, res) => {
      // user create here when register and check is user exist or not
      const user = req.body;
      const email = req.body.email;
      const query = { email: email }
      const exist = await userCollection.findOne(query)
      if (exist) {
        return res.status(401).send({ message: "User already exists" });
      }
      const result = await userCollection.insertOne(user)
      res.send(result)
    })

    app.get('/search', async (req, res) => {

      let search = '';
      if (req.query.q) {
        search = req.query.q
      }

      const mySort = { date: -1 }
      const result = await patCollection.find({
        title: { $regex: search, $options: 'i' }
      }).sort(mySort).toArray()

      res.send(result)
    })

    app.post('/adopt', async (req, res) => {
      const info = req.body
      console.log(info)
      const result = await adoptCollection.insertOne(info)
      res.send(result)
    })

    app.get('/campaign', async (req, res) => {
      const result = await campaigntCollection.find().toArray()
      res.send(result)
    })
    app.get('/protected_campaign',verifyToken, async (req, res) => {
      const result = await campaigntCollection.find().toArray()
      res.send(result)
    })
    app.get('/campaign/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) };
      const result = await campaigntCollection.findOne(query)
      res.send(result)
    })

    app.get('/adoption_data', verifyToken, async (req, res) => {
      const result = await adoptCollection.find().toArray()
      res.send(result)
    })
    app.delete('/adoption_data/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await adoptCollection.deleteOne(query)
      res.send(result)
    })
    app.get('/adoption_data/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await adoptCollection.findOne(query)
      res.send(result)
    })
    app.get('/mycampaign', verifyToken, async (req, res) => {
      const result = await campaigntCollection.find().toArray()
      res.send(result)
    })
    app.delete('/admin/campaign/:id',async (req,res)=>{
      const id=req.params.id;
      const query={_id:new ObjectId(id)}
      const result=await campaigntCollection.deleteOne(query)
      res.send(result)
    })
    app.post("/create-payment-intent", async (req, res) => {
      const price = req.body;

      const int1 = price.sum
      const amount = parseInt(int1 * 100);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        payment_method_types: ['card']
      });

      res.send({
        clientSecret: paymentIntent.client_secret
      })
    })

    // Jwt api
    app.post('/jwt', async (req, res) => {
      // token provider api
      const user = req.body;

      const token = jwt.sign(user, process.env.DB_TOKEN, { expiresIn: '2h' });
      res.send({ token })
    })
    app.get('/users', verifyToken, async (req, res) => {
      const result = await userCollection.find().toArray()
      res.send(result)
    })
    app.get('/isadmin/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      const query = { email: email }
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: "Unauthorize access" })
      }
      const user = await userCollection.findOne(query)
      let admin = false;
      if (user?.role) {
        admin = true
      }
      else {
        admin = false
      }
      res.send({ admin })
    })

    app.patch('/make_admin/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const updateDoc = {
        $set: {
          role: "admin"
        }
      }
      const result =await userCollection.updateOne(filter,updateDoc)
      res.send(result)
    })
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('CatroPat server is running')
})

app.listen(port, () => {
  console.log(`it is running on port ${port}`)
})
// BphzlsviGA4chGcS