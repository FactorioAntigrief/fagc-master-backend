const mongoose = require("mongoose")
const { getUserStringFromID } = require("../../utils/functions-databaseless")

const RuleSchema = new mongoose.Schema({
	readableid: String,
    shortdesc: String,
    longdesc: String,
})
RuleSchema.pre("save", function (next) {
	this.readableid = getUserStringFromID(this._id.toString())
	next()
})

module.exports = mongoose.model('Rules', RuleSchema)