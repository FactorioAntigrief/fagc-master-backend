const mongoose = require("mongoose")
const { getUserStringFromID } = require("../../utils/functions-databaseless")

const CommunitySchema = new mongoose.Schema({
	readableid: String,
    name: String,
    contact: String,
	guildid: String,
})
CommunitySchema.pre("save", function (next) {
	this.readableid = getUserStringFromID(this._id.toString())
	next()
})

module.exports = mongoose.model('Communities', CommunitySchema)