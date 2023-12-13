const Deck = require('../models/Deck')
const User = require('../models/User')
const Counter = require('../models/Counter')

const { JWT_SECRET } = require('../configs/index')
const JWT = require('jsonwebtoken')

const encodedToken = (userID) => {
  return JWT.sign({
    iss: 'critdog',
    sub: userID,
    iat: new Date().getTime(),
    exp: new Date().setDate(new Date().getDate() + 3)
  }, JWT_SECRET)
};

const checkUserDele = (req, res, next, user) => {
  if ((user == null) || (user == undefined) || (user.is_deleted)) {
    throw new Error("User not Exist")
  };
}

const nowTime = () => {
    const currentDate = new Date();
    return `${currentDate.getDate()}/${currentDate.getMonth()+1}/${currentDate.getFullYear()} -- Time: ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`
};

const Joi = require('@hapi/joi')
const idSchema = Joi.object().keys({
    userID: Joi.string().regex(/^[0-9a-zA-Z]{24}$/).required()
});

const deleteUser = async (req, res, next) => {
    const user = await User.findById(req.value.params.userID)
    const userDele = checkUserDele(req, res, next, user)
    user.is_deleted = true

    // const listDecks = user.decks
    // for (const deckID in listDecks) {
    //   const deck = await Deck.findById(deckID)
      
    // }

    await user.save()

    return res.status(200).json({success: true})
};

const getUser = async (req, res, next) => {
    const user = await User.findById(req.value.params)
    const checkUserDele = async (req, res, next, user)
    return res.status(200).json({user})
};

const getUserList = async (req, res, next) => {
    const { userListID } = req.params
    //  userListID.id 
}

const getUserDecks = async (req, res, next) => {
    const { userID } = req.value.params
    if (userID.is_deleted){
      return res.status(403).json({
        error: {
          message: "User isn't exist"
        }
      })
    }
    const user = await User.findById(userID).populate('decks')

    return res.status(200).json({decks: user.decks}) 
};

const index = async (req, res, next) => {
    const users = await User.find({is_deleted: false})
    return res.status(200).json({users})
};

const newUser = async (req, res, next) => {
    const { firstName, lastName, email, password } = req.value.body
    const foundUser = await User.findOne({ email })
    if (foundUser) return res.status(403).json(
      {error: 
        { message: "Email is already in use." }
      }
    )

    const newUser = new User(req.value.body)
    newUser.created_at = nowTime()
    const updateSeq = await Counter.findOneAndUpdate({name: "user"},{"$inc":{seq:1}},{new: true})
    
    if (updateSeq == null) {
        const initCounter = Counter({name: "user", seq: 1})
        newUser._id = initCounter.seq
        await initCounter.save()
    } else {
        newUser._id = updateSeq.seq
    }
    await newUser.save()

    const token = encodedToken(newUser._id)
    res.setHeader('Author', token)

    return res.status(201).json({user: newUser})
};

const newUserDeck = async (req, res, next) => {
    const { userID } = req.value.params
    const newDeck = new Deck(req.value.body)
    const user = await User.findById(userID)
    newDeck.owner = userID

    newDeck.created_at = nowTime()

    const updateSeq = await Counter.findOneAndUpdate({name: "deck"},{"$inc":{seq:1}},{new: true})
    if (updateSeq == null) {
        const initCounter = Counter({name: "deck", seq: 1})
        newDeck._id = 1
        await initCounter.save()
    } else {
        newDeck._id = updateSeq.seq
    }

    user.decks.push(newDeck)
    user.updated_at = nowTime()
    await user.save()
    await newDeck.save()
    return res.status(201).json({deck: newDeck})
};

const replaceUser = async (req, res, next) => {
    // Thay thế toàn bộ thông tin của user đó (enforce new user to old user)
    const { userID } = req.value.params
    const newUser = req.value.body

    const result = await User.findByIdAndUpdate(userID,newUser)
    
    // getTime
    const user = await User.findById(userID)
    user.updated_at = nowTime()

    await user.save()
    // console.log(result)
    return res.status(200).json({success: true})
};

const secret = async (req, res, next) => {
  return res.status(200).json({ resources: true })
};

const signUp = async (req, res, next) => {    
    const { firstName, lastName, email, password } = req.value.body
    const foundUser = await User.findOne({ email })
    
    if (foundUser) return res.status(403).json({error: { message: "Email is already in use." }})

    const newUser = User({ firstName, lastName, email, password })
    const updateSeq = await Counter.findOneAndUpdate({name: "user"},{"$inc":{seq:1}},{new: true})
    
    if (updateSeq == null) {
        const initCounter = Counter({name: "user", seq: 1})
        newUser._id = 1
        await initCounter.save()
    } else {
        newUser._id = updateSeq.seq
    }

    await newUser.save()

    const token = encodedToken(newUser._id)
    res.setHeader('Author', token)
    
    return res.status(201).json({user: newUser})
};

const signIn = async (req, res, next) => {
  const token = encodedToken(req.user._id)
  res.setHeader('Authorization', token)
  return res.status(200).json({ success: true })
};

const updateUser = async (req, res, next) => {
    // Update một trong các trường (number of fields)
    const { userID } = req.value.params
    const newUser = req.value.body

    const result = await User.findByIdAndUpdate(userID,newUser)
    
    // getTime
    const user = await User.findById(userID)
    user.updated_at = nowTime()
   
    await user.save()

    // console.log(result)
    return res.status(200).json({success: true})
};

module.exports = {
    checkUserDele,
    deleteUser,
    getUser,
    getUserDecks,
    getUserList,
    index,
    newUser,
    newUserDeck,
    replaceUser,
    secret,
    signUp,
    signIn,
    updateUser,
}