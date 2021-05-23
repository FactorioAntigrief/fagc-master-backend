const mongoose = require("mongoose")
const { getUserStringFromID } = require("../../utils/functions-databaseless")

const OffenseModel = new mongoose.Schema({
	readableid: String,
    playername: String,
    communityid: {
		type: mongoose.Types.ObjectId,
		ref: "Communities"
	},
	violations: [{ type: mongoose.Types.ObjectId, ref: 'Violations' }]
})
OffenseModel.pre("save", function (next) {
	this.readableid = getUserStringFromID(this._id.toString())
	next()
})

module.exports = mongoose.model('Offenses', OffenseModel)