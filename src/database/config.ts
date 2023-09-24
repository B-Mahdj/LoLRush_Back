const { MongoClient, ServerApiVersion } = require('mongodb');

const dotenv = require('dotenv');

dotenv.config();
const MongoDBDigitalOceanConfig = {
    username: encodeURIComponent(process.env.MONGODB_DIGITALOCEAN_USERNAME),
    password: encodeURIComponent(process.env.MONGODB_DIGITALOCEAN_PASSWORD)
};

const MongoDBUri = `mongodb+srv://${MongoDBDigitalOceanConfig.username}:${MongoDBDigitalOceanConfig.password}` + "@db-mongodb-lon1-lol-rush-0436540d.mongo.ondigitalocean.com/admin?tls=true&authSource=admin";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
export const client = new MongoClient(MongoDBUri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
/*

const MongoDBAtlasConfig = {
    username: encodeURIComponent(process.env.MONGODB_ATLAS_USERNAME),
    password: encodeURIComponent(process.env.MONGODB_ATLAS_PASSWORD)
};          

const MongoDBAtlasURI = `mongodb+srv://${MongoDBAtlasConfig.username}:${MongoDBAtlasConfig.password}` + "@cluster0.gpbvoma.mongodb.net/?retryWrites=true&w=majority";


export const clientMongoDbAtlas = new MongoClient(MongoDBAtlasURI, {
    serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
    }
});
*/