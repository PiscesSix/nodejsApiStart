// yarn init -> tạo json
// yarn express -> node_modules (chứa source code của các thư viện) + yarn.lock (lưu lịch sử)

const express = require('express')  // config on app
const logger = require('morgan')    // use for dev
const mongoClinet = require('mongoose') // connect mongodb
const bodyParser = require('body-parser')

// setup connect mongodb by mongoose
// connect success => then work else => catch work
mongoClinet.connect('mongodb://localhost/nodejsapistarter')
    .then(() => console.log('Connected database from mongodb.'))
    .catch((error) => console.error(`Connect database is failed with error which is ${error}`))

const app = express()

const userRoute = require('./routes/user')
const deckRoute = require('./routes/deck')

// Middlewares
// logger sẽ chạy trước đến request nên được gọi là middleware
// client - logger - handle
app.use(logger('dev'))

// sử dụng bodyParser
app.use(bodyParser.json())

// Routes 
app.use('/users', userRoute)
app.use('/decks', deckRoute)

// Routes
app.get('/', (req, res, next) => {
    return res.status(200).json({
        message: "Server is OK"
    })
})

// Catch 404 Errors and forward them to error handler
app.use((req, res, next) => {
    // req = request
    // res = respond
    const err = new Error('Not Found')
    err.status = 404
    // if err -> next 
    next(err) // chuyển đến hàm hàm xử lý lỗi (Error handler function)
})

// Error handler function
app.use((err, req, res, next) => {
    const error = app.get('env') == 'development' ? err: {}
    const status = err.status || 500

    // response to client
    return res.status(status).json({
        error: {
            message: error.message
        }
    })

})

// Start the server
const port = app.get('port') || 3000
app.listen(port, () => console.log(`Server is listening on port ${port}`))

// What is development and production
// development: yarn add morgan --save-dev -> Cài sai: yarn remove morgan (check package.json to see more)
// yarn add morgan --dev