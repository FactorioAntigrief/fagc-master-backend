const mongoose = require("mongoose")
const { getUserStringFromID } = require("../../utils/functions-databaseless")

const CommunitySchema = new mongoose.Schema({
	id: String,
    name: String,
    contact: String,
	guildid: String,
})
CommunitySchema.pre("save", function (next) {
	this.id = getUserStringFromID(this._id.toString())
	next()
})

module.exports = mongoose.model('Communities', CommunitySchema)