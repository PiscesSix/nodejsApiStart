const mongoose = require('mongoose')

// schema là một lớp định hình xem connection của một user gồm có những field nào
const Schema = mongoose.Schema

// Tìm hiểu thêm về schema và decks
const DeckSchema = new Schema({
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
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

const Deck = mongoose.model('Deck', DeckSchema)
module.exports = Deck
