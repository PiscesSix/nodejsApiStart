const express = require('express')
const router = require('express-promise-router')() 

const UserController = require('../controllers/user')

const { validateBody, validateParam, schemas } = require('../helpers/routerHelpers')

// passport
const passport = require('passport')
const passportConfig = require('../middlewares/passport')

router.route('/')
    .get(UserController.index)
    .post(validateBody(schemas.userSchema), UserController.newUser)

// Authentication
router.route('/signup').post(validateBody(schemas.authSignUpSchema), UserController.signUp)
router.route('/signin').post(validateBody(schemas.authSignInSchema), passport.authenticate('local', {session: false}), UserController.signIn)

// api enviroment -> {session} is false
router.route('/secret').get(passport.authenticate('jwt', {session: false}), UserController.secret)

router.route('/:userID')
    .get(validateParam(schemas.idSchema,'userID'), UserController.getUser)
    .post(UserController.getUserList)
    .put(validateParam(schemas.idSchema, 'userID'), validateBody(schemas.userSchema), UserController.replaceUser)
    .patch(validateParam(schemas.idSchema, 'userID'), validateBody(schemas.userOptionalSchema), UserController.updateUser)
    .delete(validateParam(schemas.idSchema,'userID'), UserController.deleteUser)

router.route('/:userID/decks')
    .get(validateParam(schemas.idSchema, 'userID'), UserController.getUserDecks)
    .post(validateParam(schemas.idSchema, 'userID'), validateBody(schemas.newDeckSchema), UserController.newUserDeck)

module.exports = router