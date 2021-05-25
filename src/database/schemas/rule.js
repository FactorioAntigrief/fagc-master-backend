const mongoose = require("mongoose")
const { getUserStringFromID } = require("../../utils/functions-databaseless")

const RuleSchema = new mongoose.Schema({
	id: String,
    shortdesc: String,
    longdesc: String,
})
RuleSchema.pre("save", function (next) {
	this.id = getUserStringFromID(this._id.toString())
	next()
})

module.exports = mongoose.model('Rules', RuleSchema)