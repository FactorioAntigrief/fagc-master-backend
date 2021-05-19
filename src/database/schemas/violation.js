const mongoose = require("mongoose")

const ViolationSchema = new mongoose.Schema({
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

module.exports = mongoose.model('Violations', ViolationSchema)