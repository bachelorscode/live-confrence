const mongoose = require('mongoose');

const idManagerSchema = new mongoose.Schema({
    id:{
        type:String,
        unique:true,
        required:true
    },
    title:{
        type:String
    }
},{
    timestamps:true
});

const IDMANAGER = mongoose.model('IDMANAGER',idManagerSchema);

module.exports = {
    IDMANAGER
}