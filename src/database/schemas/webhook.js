const mongoose = require("mongoose")
const { getUserStringFromID } = require("../../utils/functions-databaseless")

const WebhookSchema = new mongoose.Schema({
	readableid: String,
    id: String,
    token: String,
    guildid: String,
})
WebhookSchema.pre("save", function (next) {
	this.readableid = getUserStringFromID(this._id.toString())
	next()
})

module.exports = mongoose.model('webhooks', WebhookSchema)