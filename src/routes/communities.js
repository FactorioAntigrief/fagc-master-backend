const express = require('express');
const router = express.Router();
const CommunityModel = require("../database/schemas/community")
const AuthModel = require("../database/schemas/authentication")
const ViolationModel = require("../database/schemas/violation")
const OffenseModel = require("../database/schemas/offense")
const cryptoRandomString = require('crypto-random-string')
const ObjectId = require('mongoose').Types.ObjectId
const { communityCreatedMessage, communityRemovedMessage } = require("../utils/info")
const { checkGuild, checkUser } = require("../utils/functions")

router.get('/getid', async (req, res) => {
	if (req.query.id === undefined || !ObjectId.isValid(req.query.id))
		return res.status(400).json({ error: "Bad Request", description: `id must be ObjectID, got ${req.query.id}` })
	const community = await CommunityModel.findById(req.query.id)
	res.status(200).json(community)
})
router.get('/getall', async (req, res) => {
	const dbRes = await CommunityModel.find({ name: { $exists: true } })
	res.status(200).json(dbRes)
})

router.post('/create', async (req, res) => {
    if (req.body.name === undefined || typeof (req.body.name) !== "string")
        return res.status(400).json({ error: "Bad Request", description: `name expected string, got ${typeof (req.body.name)} with value of ${req.body.name}` })
    if (req.body.contact === undefined || typeof (req.body.contact) !== "string")
        return res.status(400).json({ error: "Bad Request", description: `contact expected Discord UserID, got ${typeof (req.body.contact)} with value of ${req.body.contact}` })
	if (req.body.guildid === undefined || typeof (req.body.guildid) !== "string")
		return res.status(400).json({ error: "Bad Request", description: `guildid expected Discord GuildID, got ${typeof (req.body.guildid)} with value of ${req.body.guildid}` })
    const dbRes = await CommunityModel.findOne({
        name: req.body.name
    })
    if (dbRes !== null)
        return res.status(403).json({ error: "Bad Request", description: `Community with name ${req.body.name} already exists` })
    
	const contact = await checkUser(req.body.contact)
	if (contact == 0)
		return res.status(400).json({ error: "Bad Request", description: `contact must be Discord User snowflake, got value ${req.body.contact}, which isn't a Discord user or it isn't available to the bot` })
	const guild = await checkGuild(req.body.guildid)
	if (guild !== 1) {
		if (guild == 0)
			return res.status(400).json({ error: "Bad Request", description: `guildid must be Discord Guild snowflake, got value ${req.body.guildid}, which isn't a Discord guild or it isn't available to the bot` })
		else return res.status(400).json({ error: "Bad Request", description: `guildid must be Discord Guild snowflake, got value ${req.body.guildid}, which isn't a Discord guild or it isn't available to the bot, or another issue with the API has occured` })
	}
    const community = await CommunityModel.create({
        name: req.body.name,
        contact: req.body.contact,
		guildid: req.body.guildid,
    })
	const api_key = await AuthModel.create({
		communityid: community._id,
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
    if (req.body.id === undefined || !ObjectId.isValid(req.body.id))
        return res.status(400).json({ error: "Bad Request", description: `id expected string, got ${typeof (req.body.id)} with value of ${req.body.id}` })
    const community = await CommunityModel.findById(req.body.id)
    if (community === null)
        return res.status(404).json({ error: "Not Found", description: `Community with ObjectID ${req.body.id} was not found` })
    // these queries need .exec() so they actually run and not just build themselves
	AuthModel.findOneAndDelete({
        communityid: community._id
    }).exec()

    const toRevoke = await OffenseModel.find({
        communityid: community._id
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