const express = require('express')
const router = express.Router()
const RuleModel = require("../database/schemas/rule")
const ViolationModel = require("../database/schemas/violation")
const OffenseModel = require("../database/schemas/offense")
const { ruleCreatedMessage, ruleRemovedMessage } = require("../utils/info")
const { validateUserString } = require('../utils/functions-databaseless')

router.post('/create', async (req, res) => {
    if (req.body.shortdesc === undefined || typeof (req.body.shortdesc) !== "string")
        return res.status(400).json({ error: "Bad Request", description: `shortdesc must be string, got ${req.body.shortdesc}` })
    if (req.body.longdesc === undefined || typeof (req.body.longdesc) !== "string")
        return res.status(400).json({ error: "Bad Request", description: `longdesc must be string, got ${req.body.longdesc}` })
    const dbRes = await RuleModel.create({
        shortdesc: req.body.shortdesc,
        longdesc: req.body.longdesc
    })
    ruleCreatedMessage(dbRes.toObject())
    res.status(200).json(dbRes)
})
router.delete('/remove', async (req, res) => {
    if (req.body.id === undefined || !validateUserString(req.body.id))
        return res.status(400).json({ error: "Bad Request", description: `id must be ID` })
    const rule = await RuleModel.findOneAndDelete({id: req.body.id})
	if (!rule)
	res.status(404).json({ error: "Not Found", description: `Rule with ID ${req.body.id} was not found` })
	ruleRemovedMessage(rule.toObject())
	res.status(200).json(rule)
	const deletedViolations = await ViolationModel.find({ brokenRule: rule._id })
	await ViolationModel.deleteMany({ brokenRule: rule._id })
	await deletedViolations.forEach(async (violation) => {
		await OffenseModel.updateOne({ "violations": violation._id }, {
			$pull: {"violations": violation._id}
		})
	})
	OffenseModel.deleteMany({"violations": {$size: 0}}).exec()

})

module.exports = router