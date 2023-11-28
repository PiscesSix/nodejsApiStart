const express = require('express')
// const router = express.Router()

/* thay vì dùng express thì dùng gói này, 
    gói này có thể giúp chúng ta bỏ đi try - catch mà code
    vẫn hoạt động giống như có try-catch
*/
const router = require('express-promise-router')() 

const UserController = require('../controllers/user')

const { validateBody, validateParam, schemas } = require('../helpers/routerHelpers')

router.route('/')
    .get(UserController.index)
    .post(validateBody(schemas.userSchema), UserController.newUser)
    // .patch()
    // .put()
    // .delete()

// Lấy thông tin của một user -> param nên có dấu ":" 

/*
    Có hai phương thức để update là .put và .patch. Vậy chúng khác nhau như thế nào:
        .put -> replace User
        .patch -> update User
*/

/*
    Mây hàm dưới này chạy trước controller (middleware)
*/

// Authentication
router.route('/signup').post(validateBody(schemas.authSignUpSchema), UserController.signUp)

router.route('/signin').post(validateBody(schemas.authSignInSchema), UserController.signIn)

router.route('/secret').get(UserController.secret)

router.route('/:userID')
    .get(validateParam(schemas.idSchema,'userID'), UserController.getUser)
    .put(validateParam(schemas.idSchema, 'userID'), validateBody(schemas.userSchema), UserController.replaceUser)
    .patch(validateParam(schemas.idSchema, 'userID'), validateBody(schemas.userOptionalSchema), UserController.updateUser)

router.route('/:userID/decks')
    .get(validateParam(schemas.idSchema, 'userID'), UserController.getUserDecks)
    .post(validateParam(schemas.idSchema, 'userID'), validateBody(schemas.newDeckSchema), UserController.newUserDeck)

module.exports = router