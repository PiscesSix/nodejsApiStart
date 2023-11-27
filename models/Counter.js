const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CounterSchema = new Schema({
    name: {
        type: String
    },
    id: {
        type: String
    },
    seq:{
        type: Number
    },
})

const Counter = mongoose.model('Counter', CounterSchema)
module.exports = Counter
