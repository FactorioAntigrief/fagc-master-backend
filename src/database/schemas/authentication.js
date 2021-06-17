const mongoose = require("mongoose")

const AuthSchema = new mongoose.Schema({
	communityId: {
		type: mongoose.Types.ObjectId,
		ref: 'Communities'
	},
    api_key: String,
    allowed_ips: [String]
})

module.exports = mongoose.model('Authentication', AuthSchema)