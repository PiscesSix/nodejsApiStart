const express = require('express')
// const router = express.Router()

/* thay vì dùng express thì dùng gói này, 
    gói này có thể giúp chúng ta bỏ đi try - catch mà code
    vẫn hoạt động giống như có try-catch
*/
const router = require('express-promise-router')() 

const DeckController = require('../controllers/deck')

const { validateBody, validateParam, schemas } = require('../helpers/routerHelpers')

router.route('/')
    .get(DeckController.index)
    .post(DeckController.newDeck)

module.exports = router