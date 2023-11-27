const mongoose = require('mongoose')

// schema là một lớp định hình xem connection của một user gồm có những field nào
const Schema = mongoose.Schema

// Tìm hiểu thêm về schema và decks
const UserSchema = new Schema({
    _id: {
        type: Number
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    email: {
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
    decks: [{
        type: Schema.Types.Number,
        ref: 'Deck'
    }]
},
{
    _id: false
})

const User = mongoose.model('User', UserSchema)
module.exports = User
