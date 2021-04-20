const express = require('express');
const router = express.Router();
const CommunityModel = require("../database/schemas/community")
const AuthModel = require("../database/schemas/authentication")
const ViolationModel = require("../database/schemas/violation")
const OffenseModel = require("../database/schemas/offense")
const cryptoRandomString = require('crypto-random-string')
const ObjectId = require('mongoose').Types.ObjectId
const { communityCreatedMessage, communityRemovedMessage } = require("../utils/info")

/* GET home page. */
router.get('/', function (req, res) {
    res.json({message: 'Community API Homepage!'})
})
// TODO: create documentation for all endpoints & maybe change to swagger-jsdoc instead of this
/**
 * Gets your own community based on your API key, which must be in your request headers.
 * @route GET /communities/getown
 * @group communities - Operations concerning communities
 * @returns {object} 200 - Object of the community that the API key in the request headers belongs to
 */
router.get('/getown', async (req, res) => {
    console.log(req.headers.apikey)
    if (req.headers.apikey === undefined)
        return res.status(400).json({ error: "Bad Request", description: "No way to find you community without an API key" })
    const auth = await AuthModel.findOne({ api_key: req.headers.apikey })
    if (!auth)
        return res.status(404).json({error:"Not Found", description: "Community with your API key was not found"})
    const dbRes = await CommunityModel.findOne({
        name: auth.communityname
    })
    res.status(200).json(dbRes)
})
router.get('/getall', async (req, res) => {
    const dbRes = await CommunityModel.find({ name: { $exists: true } })
    res.status(200).json(dbRes)
})
router.get('/getid', async (req, res) => {
    if (req.query.id === undefined || !ObjectId.isValid(req.query.id))
        return res.status(400).json({ error: "Bad Request", description: `id must be ObjectID, got ${req.query.id}` })
    const community = await CommunityModel.findById(req.query.id)
    res.status(200).json(community)
})

router.post('/create', async (req, res) => {
    if (req.body.name === undefined || typeof (req.body.name) !== "string")
        return res.status(400).json({ error: "Bad Request", description: `name expected string, got ${typeof (req.body.name)} with value of ${req.body.name}` })
    if (req.body.contact === undefined || typeof (req.body.contact) !== "string")
        return res.status(400).json({ error: "Bad Request", description: `contact expected string, got ${typeof (req.body.contact)} with value of ${req.body.contact}` })
    const dbRes = await CommunityModel.findOne({
        name: req.body.name
    })
    if (dbRes !== null)
        return res.status(403).json({ error: "Bad Request", description: `Community with name ${req.body.name} already exists` })
    const api_key = await AuthModel.create({
        communityname: req.body.name,
        api_key: cryptoRandomString(128)
    })
    const community = await CommunityModel.create({
        name: req.body.name,
        contact: req.body.contact
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
    AuthModel.findOneAndDelete({
        communityname: community.name
    })

    const toRevoke = await OffenseModel.find({
        communityname: community.name
    }).populate('violations')
    toRevoke.forEach((offense) => {
        offense.violations.forEach((violation) => {
            ViolationModel.findByIdAndDelete(violation._id).then(() => {}) // needs the callback for some reason
        })
        console.log(offense._id)
        OffenseModel.findByIdAndDelete(offense._id).then(() => {})
    })
    AuthModel.findOneAndDelete({communityname: community.name}).then(() => {})
    const communityRemoved = await CommunityModel.findByIdAndDelete(community._id)
    communityRemovedMessage(communityRemoved.toObject())
    res.status(200).json(communityRemoved)
})

module.exports = router