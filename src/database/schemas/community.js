const mongoose = require("mongoose")

const CommunitySchema = new mongoose.Schema({
    name: String,
    contact: String,
	guildid: String,
})

module.exports = mongoose.model('Communities', CommunitySchema)