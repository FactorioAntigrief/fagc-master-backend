const mongoose = require("mongoose")
const { getUserStringFromID } = require("../../utils/functions-databaseless")

const LogSchema = new mongoose.Schema({
	readableid: String,
    timestamp: Date,
    apikey: String,
    ip: String,
    responseBody: Object,
    requestBody: Object,
    endpointAddress: String,
})
LogSchema.pre("save", function (next) {
	this.readableid = getUserStringFromID(this._id.toString())
	next()
})

module.exports = mongoose.model('logs', LogSchema)