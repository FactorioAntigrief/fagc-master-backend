const mongoose = require("mongoose")
const { getUserStringFromID } = require("../../utils/functions-databaseless")

const RevocationSchema = new mongoose.Schema({
	id: String,
    playername: String,
    adminid: String,
	communityid: {
		type: mongoose.Types.ObjectId,
		ref: "Communities"
	},
	brokenRule: mongoose.SchemaTypes.ObjectId,
    proof: String,
    description: String,
    automated: Boolean,
    violatedTime: Date,
    revokedTime: Date,
    revokedBy: String
})
RevocationSchema.pre("save", function (next) {
	this.id = getUserStringFromID(this._id.toString())
	next()
})


module.exports = mongoose.model('Revocations', RevocationSchema)