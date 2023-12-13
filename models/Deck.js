const mongoose = require('mongoose')
const Schema = mongoose.Schema

const DeckSchema = new Schema({
    _id: {
        type: Number
    },
    name: {
        type: String
    },
    description: {
        type: String
    },
    is_deleted: {
        type: Boolean,
        default: false
    },
    updated_at: {
        type: String
    },
    created_at: {
        type: String
    },
    owner: {
        type: Schema.Types.Number,
        ref: 'User'
    }
},
{
    _id: false
}
)

const Deck = mongoose.model('Deck', DeckSchema)
module.exports = Deck
