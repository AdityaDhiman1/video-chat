const mongoose = require('mongoose');


let signupSchema = new mongoose.Schema({
    username: { type: String },
    e_mail: { type: String, unique: true },
    password: { type: String },
})
let Signup = new mongoose.model("Signup", signupSchema, "Signup");


module.exports = Signup;