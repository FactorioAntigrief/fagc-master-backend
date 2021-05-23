const mongoose = require("mongoose")
const { getUserStringFromID } = require("../../utils/functions-databaseless")

const ViolationSchema = new mongoose.Schema({
	readableid: String,
    playername: String,
	communityid: {
		type: mongoose.Types.ObjectId,
		ref: "Communities"
	},
	broken_rule: mongoose.SchemaTypes.ObjectId,
    proof: String,
    description: String,
    automated: Boolean,
    violated_time: Date,
    admin_id: String,
})
ViolationSchema.pre("save", function (next) {
	this.readableid = getUserStringFromID(this._id.toString())
	next()
})

module.exports = mongoose.model('Violations', ViolationSchema)