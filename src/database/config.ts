const { MongoClient, ServerApiVersion } = require('mongodb');

const dotenv = require('dotenv');

dotenv.config();

const MongoDBAtlasConfig = {
    username: encodeURIComponent(process.env.MONGODB_ATLAS_USERNAME),
    password: encodeURIComponent(process.env.MONGODB_ATLAS_PASSWORD)
};          

const MongoDBAtlasURI = `mongodb+srv://${MongoDBAtlasConfig.username}:${MongoDBAtlasConfig.password}` + "@cluster0.gpbvoma.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
export const client = new MongoClient(MongoDBAtlasURI, {
    serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
    }
});