const mongoose = require('mongoose')
 
const connectDB = (uri) => {
    return mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log('Connected to MongoDB......')
    }).catch((error) => {
        console.log('not connected',error.message)
    })
}
module.exports = connectDB