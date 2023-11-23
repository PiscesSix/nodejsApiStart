/*
* We can interact with mongoose in three different ways
* [v] Async (Dùng nếu có trả ra kết quả, return)/await (dùng khi không trả ra kết quả)
*/

// nên sắp xếp tên hàm theo thứ tự alphabel

const Deck = require('../models/Deck')
const User = require('../models/User')

const nowTime = () => {
    const currentDate = new Date();
    const currentDayOfMonth = currentDate.getDate();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    return `${currentDayOfMonth}/${currentMonth+1}/${currentYear} -- Time: ${currentDate.getTime()}`
}

// Validator for parameters:
// Nếu sai định dạng của phương thức GET thì không cho hoạt động
const Joi = require('@hapi/joi')
const idSchema = Joi.object().keys({
    deckID: Joi.string().regex(/^[0-9a-zA-Z]{24}$/).required()
})

const getDeck = async (req, res, next) => {
    const resultValidator = idSchema.validate(req.value.params)

    // const { deckID } = req.params

    const deck = await Deck.findById(req.value.params.deckID)
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

    // Get time
    newDeck.created_at = nowTime()
    
    await newDeck.save()

    // Add newly created deck to the actual decks
    owner.decks.push(newDeck._id)
    await owner.save()

    return res.status(201).json({deck: newDeck})
}

const replaceDeck = async (req, res, next) => {
    const { deckID } = req.value.params
    const newDeck = req.value.body

    // if put user, remove deck in user's model
    const result = await Deck.findByIdAndUpdate(deckID,newDeck)

    // getTime
    const deck = await Deck.findById(deckID)
    deck.updated_at = nowTime()

    await deck.save()
    return res.status(200).json({success: true})
}

const updateDeck = async (req, res, next) => {
    const { deckID } = req.value.params
    const newDeck = req.value.body

    // if put user, remove deck in user's model
    const result = await Deck.findByIdAndUpdate(deckID,newDeck)
    
    // getTime
    const deck = await Deck.findById(deckID)
    deck.updated_at = nowTime()
    await deck.save()

    return res.status(200).json({success: true})
}

const deleteDeck = async (req, res, next) => {
    // Find is_deleted in deck
    const deck = await Deck.findById(req.value.params.deckID)
    deck.is_deleted = !(deck.is_deleted)
    await deck.save()
    return res.status(200).json({success: true})
}

module.exports = {
    getDeck,
    newDeck,
    index,
    replaceDeck,
    updateDeck,
    deleteDeck
}