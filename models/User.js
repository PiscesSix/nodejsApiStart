const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const SALT_WORK_FACTOR = 10
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
  if (!this.isModified('password')) return next()
  try {
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    this.password = await bcrypt.hash(this.password, salt)
    return next()
  } catch (error) {
    return next(error)
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