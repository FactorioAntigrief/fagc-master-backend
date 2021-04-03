const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const mongoose = require("mongoose")

const logger = require('./utils/log')
const authUser = require("./utils/authUser")
const config = require("../config.json")

const ruleRouter = require('./routes/rules')
const communityRouter = require('./routes/communities')

const testingRouter = require('./routes/testing')

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

// app.set('trust proxy', true)
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// logger for any request other than POST
app.use(logger);

// middleware for authentication
const authMiddleware = async (req, res, next) => {
    const authenticated = await authUser(req)
    // When running on localhost, IP shows v4 as v6. use ngrok to test IP stuff locally
    // console.debug(req.headers['x-forwarded-for'] || req.socket.remoteAddress) // get origin IP
    if (authenticated === 404)
        return res.status(404).json({error: "AuthenticationError", description: "API key is wrong"})
    if (authenticated === 401)
        return res.status(410).json({error: "AuthenticationError", description: "IP adress whitelist mismatch"})
    next()
}

// Informatics router should be publicly available to anyone who wants to use it (logs & webhooks)
// this is why it is first, before the authentication middleware.

app.use('/master/*', authMiddleware)

app.use('/master/rules', ruleRouter)
app.use('/master/communities', communityRouter)
app.use('/master/testing', testingRouter)

app.get('/', (req, res) => {
    res.status(200).json({message: "FAGC api"})
})

// catch 404 and forward to error handler
app.use(function (req, res) {
    res.status(404).json({error: "Page Not Found"})
});

// error handler
app.use(function (err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.json({error: 'error', message: err.message});
});

mongoose.connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})

module.exports = app;
