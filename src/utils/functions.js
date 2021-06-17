const AuthSchema = require("../database/schemas/authentication")
const config = require("../../config")
const fetch = require("node-fetch")

module.exports = {
    getCommunity,
	checkUser,
	checkGuild,
}

async function getCommunity(api_key) {
    const dbRes = await AuthSchema.findOne({ api_key: api_key })
    return dbRes
}
async function checkUser(userid) {
	const user = await fetch(`https://discord.com/api/users/${userid}`, {
		headers: {
			"Content-type": "application/json",
			"Authorization": `Bot ${config.botToken}`
		}
	}).then((r) => r.json())
	if (!user || !user.id) return false
	return true
}
async function checkGuild(guildId) {
	const guild = await fetch(`https://discord.com/api/guilds/${guildId}`, {
		headers: {
			"Content-type": "application/json",
			"Authorization": `Bot ${config.botToken}`
		}
	}).then((r) => r.json())
	if (guild.id && guild.name) return 1
	if (!guild || !guild.id) return 0
	return guild.code // return the error code from the API itself
}