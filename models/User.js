const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

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
        type: String,
        require: true, // Yêu cầu luôn phải có email
        unique: true, // Yêu cầu email luôn là duy nhất => Trước khi thử tính năng này, remove all documents from the users collection.
        lowercase: true
    },
    password: {
        type: String,
        require: true
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


// Xử lý trước khi lưu
UserSchema.pre('save', async function(next) {
  try {
    console.log('password ',this.password)
    // Generate a salt
    const salt = await bcrypt.genSalt(10)
    console.log('salt ', salt)
    // Generate a password hash (salt + hash)
    const passwordHased = bcrypt.hash(this.password, salt)
    console.log('password hashed ', passwordHased)
    // Re-assign password hashed
    this.password = passwordHased
    next()
  } catch (error) {
    next(error)
  }
})

UserSchema.methods.isValiedPassword = async function(newPassword) {
  try {
    return await bcrypt.compare(newPassword,this.password)
  } catch (error) {
    throw new Error(error)
  }
}

const User = mongoose.model('User', UserSchema)
module.exports = User