const Deck = require('../models/Deck')
const User = require('../models/User')
const Counter = require('../models/Counter')

const nowTime = () => {
    const currentDate = new Date();
    const currentDayOfMonth = currentDate.getDate();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    return `${currentDayOfMonth}/${currentMonth+1}/${currentYear} -- Time: ${currentDate.getTime()}`
}

const checkUserDele = (req, res, next, user) => {
  if ((user == null) || (user == undefined) || (user.is_deleted)) {
    throw new Error("User not Exist")
  };
}

const Joi = require('@hapi/joi');
const { error } = require('@hapi/joi/lib/base');
const idSchema = Joi.object().keys({
    deckID: Joi.string().regex(/^[0-9a-zA-Z]{24}$/).required()
})

const getDeck = async (req, res, next) => {
    const resultValidator = idSchema.validate(req.value.params);
    const deck = await Deck.findById(req.value.params.deckID);
    const checkDele = await checkDeckDele(req, res, next, deck);

    return res.status(200).json({
      deck
    })
}

const index = async (req, res, next) => {
    let decks = await Deck.find({});
    decks = decks.filter(deck => !(deck.is_deleted));

    return res.status(200).json({decks})
}

const newDeck = async (req, res, next) => {
    const owner = await User.findById(req.value.body.owner)
    const checkUser = checkUserDele(req, res, next, owner)
    const deck = req.value.body
    deck.owner = owner._id
    const newDeck = new Deck(deck)
    newDeck.created_at = nowTime()

    const updateSeq = await Counter.findOneAndUpdate({name: "deck"},{"$inc":{seq:1}},{new: true})
    if (updateSeq == null) {
        const initCounter = Counter({name: "deck", seq: 1})
        newDeck._id = initCounter.seq
        await initCounter.save()
    } else {
        newDeck._id = updateSeq.seq
    }
    await newDeck.save()
    owner.decks.push(newDeck._id)
    await owner.save()
    return res.status(201).json({deck: newDeck})
}

const replaceDeck = async (req, res, next) => {
    const { deckID } = req.value.params
    const newDeck = req.value.body
    const deck = await Deck.findById(deckID)
    const checkDele = await checkDeckDele(req, res, next, deck);
    
    const userHaveDeck = await User.findById(deck.owner)
    let index = userHaveDeck.decks.indexOf(deck._id);
    if (index !== -1) {
      userHaveDeck.decks.splice(index, 1);
      await userHaveDeck.save()
    } else {
      await userHaveDeck.save()
    }
    await userHaveDeck.save()

    if (!newDeck.owner) {
      const user = await User.findById(newDeck.owner)
      user.owner.push(newDeck._id)
      await user.save()
    }
    const result = await Deck.findByIdAndUpdate(deckID,newDeck)

    deck.updated_at = nowTime()
    
    await deck.save()
    return res.status(200).json({success: true})
}

const updateDeck = async (req, res, next) => {
    const { deckID } = req.value.params
    const newDeck = req.value.body
    const deck = await Deck.findById(deckID)
    const checkDele = await checkDeckDele(req, res, next, deck);
    const result = await Deck.findByIdAndUpdate(deckID,newDeck)

    deck.updated_at = nowTime()
    await deck.save()

    return res.status(200).json({success: true})
}

const deleteDeck = async (req, res, next) => {
    const deck = await Deck.findById(req.value.params.deckID)
    if (!deck.is_deleted) {
      deck.is_deleted = true
    }
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