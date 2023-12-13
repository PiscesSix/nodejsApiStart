const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const SALT_WORK_FACTOR = 10
const Schema = mongoose.Schema

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
        require: true,
        unique: true,
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