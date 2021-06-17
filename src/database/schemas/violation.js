const mongoose = require("mongoose")
const { getUserStringFromID } = require("../../utils/functions-databaseless")

const ViolationSchema = new mongoose.Schema({
	id: String,
    playername: String,
	communityId: {
		type: mongoose.Types.ObjectId,
		ref: "Communities"
	},
	brokenRule: mongoose.SchemaTypes.ObjectId,
    proof: String,
    description: String,
    automated: Boolean,
    violatedTime: Date,
    adminId: String,
})
ViolationSchema.pre("save", function (next) {
	this.id = getUserStringFromID(this._id.toString())
	next()
})

module.exports = mongoose.model('Violations', ViolationSchema)