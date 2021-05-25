const mongoose = require("mongoose")
const { getUserStringFromID } = require("../../utils/functions-databaseless")

const LogSchema = new mongoose.Schema({
	id: String,
    timestamp: Date,
    apikey: String,
    ip: String,
    responseBody: Object,
    requestBody: Object,
    endpointAddress: String,
})
LogSchema.pre("save", function (next) {
	this.id = getUserStringFromID(this._id.toString())
	next()
})

module.exports = mongoose.model('logs', LogSchema)