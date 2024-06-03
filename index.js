const express=require("express")
const app=express()
const cors=require('cors')
const port =process.env.PORT || 5000
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
  
    const patCollection=client.db('catro').collection('pat')

    app.get('/pat',async (req,res)=>{
        const mySort={date:-1} 
        const result=await patCollection.find().sort(mySort).toArray()
        res.send(result)
    })
    app.get('/pat/:id',async (req,res)=>{
        const id=req.params.id;
        const query = { _id: new ObjectId(id) };
        const result=await patCollection.findOne(query)
        res.send(result)
    })
    app.get('/search', async (req,res)=>{

      let search='';
      if(req.query.q){  
         search=req.query.q 
      }
      console.log(search)
      const mySort={date:-1}
      const result=await patCollection.find({
          title:{$regex:search , $options:'i'}
      }).sort(mySort).toArray()
       
      res.send(result)
})
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
  
  }
}
run().catch(console.dir);


app.get('/', (req,res)=>{
    res.send('CatroPat server is running')
})

app.listen(port,()=>{
   console.log(`it is running on port ${port}`)
})
// BphzlsviGA4chGcS