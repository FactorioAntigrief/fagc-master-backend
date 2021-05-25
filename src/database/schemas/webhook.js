const mongoose = require("mongoose")
const { getUserStringFromID } = require("../../utils/functions-databaseless")

const WebhookSchema = new mongoose.Schema({
	id: String,
    id: String,
    token: String,
    guildid: String,
})
WebhookSchema.pre("save", function (next) {
	this.id = getUserStringFromID(this._id.toString())
	next()
})

module.exports = mongoose.model('webhooks', WebhookSchema)