const mongoose = require("mongoose")
const { getUserStringFromID } = require("../../utils/functions-databaseless")

const OffenseModel = new mongoose.Schema({
	id: String,
    playername: String,
    communityId: {
		type: mongoose.Types.ObjectId,
		ref: "Communities"
	},
	violations: [{ type: mongoose.Types.ObjectId, ref: 'Violations' }]
})
OffenseModel.pre("save", function (next) {
	this.id = getUserStringFromID(this._id.toString())
	next()
})

module.exports = mongoose.model('Offenses', OffenseModel)