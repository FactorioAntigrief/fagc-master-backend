const mongoose = require("mongoose")
const { getUserStringFromID } = require("../../utils/functions-databaseless")

const RevocationSchema = new mongoose.Schema({
	readableid: String,
    playername: String,
    admin_id: String,
	communityid: {
		type: mongoose.Types.ObjectId,
		ref: "Communities"
	},
	broken_rule: mongoose.SchemaTypes.ObjectId,
    proof: String,
    description: String,
    automated: Boolean,
    violated_time: Date,
    revokedTime: Date,
    revokedBy: String
})
RevocationSchema.pre("save", function (next) {
	this.readableid = getUserStringFromID(this._id.toString())
	next()
})


module.exports = mongoose.model('Revocations', RevocationSchema)