const mongoose = require("mongoose")

const AuthSchema = new mongoose.Schema({
	communityid: {
		type: mongoose.Types.ObjectId,
		ref: 'Communities'
	},
    api_key: String,
    allowed_ips: [String]
})

module.exports = mongoose.model('Authentication', AuthSchema)