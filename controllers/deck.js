/*
* We can interact with mongoose in three different ways
* [v] Promises
* [x] Async (Dùng nếu có trả ra kết quả, return)/await (dùng khi không trả ra kết quả)
*/

// nên sắp xếp tên hàm theo thứ tự alphabel

const Deck = require('../models/Deck')
const User = require('../models/User')

// Validator for parameters:
// Nếu sai định dạng của phương thức GET thì không cho hoạt động
const Joi = require('@hapi/joi')
const idSchema = Joi.object().keys({
    userID: Joi.string().regex(/^[0-9a-zA-Z]{24}$/).required()
})

const index = async (req, res, next) => {
    const decks = await Deck.find({})
    return res.status(200).json({decks})
}

const newDeck = async (req, res, next) => {
    // Find owner have deck
    const owner = User.findById(req.body.owner)

    // Create a new deck
    const newDeck = req.body

}

module.exports = {
    newDeck,
    index,
}