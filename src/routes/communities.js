const express = require('express');
const router = express.Router();
const CommunityModel = require("../database/schemas/community")
const AuthModel = require("../database/schemas/authentication")
const ViolationModel = require("../database/schemas/violation")
const OffenseModel = require("../database/schemas/offense")
const cryptoRandomString = require('crypto-random-string')
const { communityCreatedMessage, communityRemovedMessage } = require("../utils/info")
const { checkGuild, checkUser } = require("../utils/functions");
const { validateUserString } = require('../utils/functions-databaseless');

router.post('/create', async (req, res) => {
    if (req.body.name === undefined || typeof (req.body.name) !== "string")
        return res.status(400).json({ error: "Bad Request", description: `name expected string, got ${typeof (req.body.name)} with value of ${req.body.name}` })
    if (req.body.contact === undefined || typeof (req.body.contact) !== "string")
        return res.status(400).json({ error: "Bad Request", description: `contact expected Discord UserID, got ${typeof (req.body.contact)} with value of ${req.body.contact}` })
	if (req.body.guildId === undefined || typeof (req.body.guildId) !== "string")
		return res.status(400).json({ error: "Bad Request", description: `guildId expected Discord guildId, got ${typeof (req.body.guildId)} with value of ${req.body.guildId}` })
    const dbRes = await CommunityModel.findOne({
        name: req.body.name
    })
    if (dbRes !== null)
        return res.status(403).json({ error: "Bad Request", description: `Community with name ${req.body.name} already exists` })
    
	const contact = await checkUser(req.body.contact)
	if (contact == 0)
		return res.status(400).json({ error: "Bad Request", description: `contact must be Discord User snowflake, got value ${req.body.contact}, which isn't a Discord user or it isn't available to the bot` })
	const guild = await checkGuild(req.body.guildId)
	if (guild !== 1) {
		if (guild == 0)
			return res.status(400).json({ error: "Bad Request", description: `guildId must be Discord Guild snowflake, got value ${req.body.guildId}, which isn't a Discord guild or it isn't available to the bot` })
		else return res.status(400).json({ error: "Bad Request", description: `guildId must be Discord Guild snowflake, got value ${req.body.guildId}, which isn't a Discord guild or it isn't available to the bot, or another issue with the API has occured` })
	}
    const community = await CommunityModel.create({
        name: req.body.name,
        contact: req.body.contact,
		guildId: req.body.guildId,
    })
	const api_key = await AuthModel.create({
		communityId: community._id,
		api_key: cryptoRandomString(128)
	})

    communityCreatedMessage(community.toObject())
    res.status(200).json({
        community: community,
        key: api_key.api_key,
        allowed_ips: []
    })
})

router.delete('/remove', async (req, res) => {
    if (req.body.id === undefined || !validateUserString(req.body.id))
        return res.status(400).json({ error: "Bad Request", description: `id expected string, got ${typeof (req.body.id)} with value of ${req.body.id}` })
    const community = await CommunityModel.findOne({id: req.body.id})
    if (community === null)
        return res.status(404).json({ error: "Not Found", description: `Community with ID ${req.body.id} was not found` })
    // these queries need .exec() so they actually run and not just build themselves
	AuthModel.findOneAndDelete({
        communityId: community._id
    }).exec()

    const toRevoke = await OffenseModel.find({
        communityId: community._id
    }).populate('violations')
    toRevoke.forEach((offense) => {
        offense.violations.forEach((violation) => {
            ViolationModel.findByIdAndDelete(violation._id).exec()
        })
        OffenseModel.findByIdAndDelete(offense._id).exec()
    })
    AuthModel.findOneAndDelete({communityname: community.name}).exec()
    const communityRemoved = await CommunityModel.findByIdAndDelete(community._id)
    communityRemovedMessage(communityRemoved.toObject())
    res.status(200).json(communityRemoved)
})

module.exports = router