/*
* We can interact with mongoose in three different ways
* [v] Async (Dùng nếu có trả ra kết quả, return)/await (dùng khi không trả ra kết quả)
*/

// nên sắp xếp tên hàm theo thứ tự alphabel

const Deck = require('../models/Deck')
const User = require('../models/User')

// Validator for parameters:
// Nếu sai định dạng của phương thức GET thì không cho hoạt động
const Joi = require('@hapi/joi')
const idSchema = Joi.object().keys({
    deckID: Joi.string().regex(/^[0-9a-zA-Z]{24}$/).required()
})

const getDeck = async (req, res, next) => {
    const resultValidator = idSchema.validate(req.params)
    
    // console.log('req params ', req.params)
    const { deckID } = req.params

    /*
    Tại sao dùng findOne:
        + findById là hàm có ý nghĩa tìm trường _id
        + findOne -> cũng tìm ra single document nhưng tìm đa dạng hơn
    Cho nên sử dụng hàm đúng mục đích của mình.
    */
    const deck = await Deck.findById(deckID)
    // console.log('user info', user)
    return res.status(200).json({deck})
}

const index = async (req, res, next) => {
    const decks = await Deck.find({})
    return res.status(200).json({decks})
}

const newDeck = async (req, res, next) => {
    // Find owner have deck
    const owner = await User.findById(req.value.body.owner)

    // Create a new deck
    const deck = req.value.body
    delete deck.owner

    deck.owner = owner._id
    const newDeck = new Deck(deck)
    await newDeck.save()

    // Add newly created deck to the actual decks
    owner.decks.push(newDeck._id)
    await owner.save()

    return res.status(201).json({deck: newDeck})
}

module.exports = {
    getDeck,
    newDeck,
    index,
}