const mongoose = require("mongoose");
const connect = mongoose.connect("mongodb://localhost:27017/Login-tut");

//check database connected or not
connect.then(()=> {
    console.log("Database connected Succesfully");
})
.catch(() => {
    console.log("Database cannot be connected");
});

//Create a schemma
const LoginSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    profilePic: {
    type: String, // Guardará o caminho da imagem
    default: null
},
biography: {
    type: String, // Campo para a biografia
    default: null
}
    
});

//collection Part
const collection = new mongoose.model("users", LoginSchema);

module.exports = collection;
