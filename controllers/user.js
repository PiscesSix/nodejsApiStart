/*
* We can interact with mongoose in three different ways
* [v] Promises
* [v] Async (Dùng nếu có trả ra kết quả, return)/await (dùng khi không trả ra kết quả)
*/

// nên sắp xếp tên hàm theo thứ tự alphabel

const Deck = require('../models/Deck')
const User = require('../models/User')
const Counter = require('../models/Counter')

// encode
const { JWT_SECRET } = require('../configs/index')
const JWT = require('jsonwebtoken')

const encodedToken = (userID) => {
  return JWT.sign({
    iss: 'Minh Chi',   // Nguoi phat hanh
    sub: userID, // Chứa thông tin mình muốn để định danh cho user đó, thông tin này nên là duy nhất
    iat: new Date().getTime(),
    exp: new Date().setDate(new Date().getDate() + 3) // Hết hạn trong 3 ngày
  }, JWT_SECRET)
};

const nowTime = () => {
    const currentDate = new Date();
    const currentDayOfMonth = currentDate.getDate();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    return `${currentDayOfMonth}/${currentMonth+1}/${currentYear} -- Time: ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`
};

// Validator for parameters:
// Nếu sai định dạng của phương thức GET thì không cho hoạt động
const Joi = require('@hapi/joi')
const idSchema = Joi.object().keys({
    userID: Joi.string().regex(/^[0-9a-zA-Z]{24}$/).required()
});

// Promise way
// const index = (req, res, next) => {
//     // Vào trong collections User tìm tất cả records
//     User.find({}).then(users => {
//         console.log('Found users', users);
//         return res.status(200).json({users})
//     })
//     .catch(err => {
//         next(err)
//     });

//     // return res.status(200).json({
//     //     message: 'You requested to user handle'
//     // })
// }

// Async/await
// const index = async function(req, res, next) {

// }

const getUser = async (req, res, next) => {
    const resultValidator = idSchema.validate(req.params)
    console.log(resultValidator)
    
    // console.log('req params ', req.params)
    const { userID } = req.params

    /*
    Tại sao dùng findOne:
        + findById là hàm có ý nghĩa tìm trường _id
        + findOne -> cũng tìm ra single document nhưng tìm đa dạng hơn
    Cho nên sử dụng hàm đúng mục đích của mình.
    */
    const user = await User.findById(userID)
    // console.log('user info', user)
    return res.status(200).json({user})
};

const getUserDecks = async (req, res, next) => {
    const { userID } = req.value.params

    // Get user - populate(name field want to join)
    const user = await User.findById(userID).populate('decks')

    return res.status(200).json({decks: user.decks}) 
};

const index = async (req, res, next) => {
    // viết try-catch để bắt lỗi
    try {
        const users = await User.find({})

        // throw new Error('Random error!') // tạo lỗi để kiểm tra catch(error) có thực sự hoạt động

        return res.status(200).json({users})
    } catch (error) {
        next(error)
    }
};

/* Ta tiến hành tạo một user mới, và thông qua phương thức post để đẩy thông tin user lên, 
tuy nhiên, kết quả sẽ là undefined vì không có config để nodejs nhận được (thông tin json) 
thông qua POST từ sever của chúng ta. Vì vậy mới cần dùng body-parser.
*/

// promist method
// const newUser = (req, res, next) => {
//     console.log('reg.body content', req.body) // In ra

//     // create object model
//     const newUser = new User(req.body)
//     console.log('newUser ', newUser)
//     newUser.save().then(user => {
//         console.log('User saved', user)
//         // res tra ve ngay POST
//         return res.status(201).json({user})
//     }).catch(err => {
//         console.error('Error', err)
//     });
// }

const newUser = async (req, res, next) => {
    const newUser = new User(req.value.body)
    newUser.created_at = nowTime()
    const updateSeq = await Counter.findOneAndUpdate({name: "user"},{"$inc":{seq:1}},{new: true})
    
    if (updateSeq == null) {
        const initCounter = Counter({name: "user", seq: 1})
        newUser._id = 1
        await initCounter.save()
    } else {
        newUser._id = updateSeq.seq
    }
    await newUser.save()
    return res.status(201).json({user: newUser})
};

const newUserDeck = async (req, res, next) => {
    const { userID } = req.value.params
    // Create a new deck
    const newDeck = new Deck(req.value.body)
    console.log(typeof userID)
    // Get user
    const user = await User.findById(userID)

    // Assign user as a decks owner
    /*
        Sau quá trình newDeck ở trên, thì object đã trở thành object
        của mongoDB rồi, nên việc tạo thêm trường mới phải là một trong các
        trường trong Desk -> Dù có tạo trường khác đi nữa cũng không có tác dụng gì 
    */

    newDeck.owner = parseInt(userID)

    // getTimeDeck
    newDeck.created_at = nowTime()

    const updateSeq = await Counter.findOneAndUpdate({name: "deck"},{"$inc":{seq:1}},{new: true})
    if (updateSeq == null) {
        const initCounter = Counter({name: "deck", seq: 1})
        newDeck._id = 1
        await initCounter.save()
    } else {
        newDeck._id = updateSeq.seq
    }

    // add deck to user's deck array ('decks')
    user.decks.push(newDeck)

    // getTimeUser
    user.updated_at = nowTime()

    // Save the user, nguyên nhân lưu lại vì ta mới push một giá trị mới vào -> để mongo có thể biết được
    await user.save()

    // Save the deck
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
    // Nên lấy từng thành phần để tránh lỗi sau này không đáng có
    const { firstName, lastName, email, password } = req.value.body

    // Check if the user has same email
    const foundUser = await User.findOne({ email })
    if (foundUser) return res.status(403).json( {error: { message: "Email is already in usee." }})

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
    return res.status(201).json({user: newUser}) // Không nên trả token vào json -> Làm vậy thì quá nổi bật
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
    getUser,
    getUserDecks,
    index,
    newUser,
    newUserDeck,
    replaceUser,
    secret,
    signUp,
    signIn,
    updateUser,
}