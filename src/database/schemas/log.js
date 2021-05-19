const mongoose = require("mongoose")

const LogSchema = new mongoose.Schema({
    timestamp: Date,
    apikey: String,
    ip: String,
    responseBody: Object,
    requestBody: Object,
    endpointAddress: String,
})

module.exports = mongoose.model('logs', LogSchema)