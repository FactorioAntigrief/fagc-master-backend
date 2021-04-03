const express = require('express');
const router = express.Router();
const ViolationModel = require("../database/schemas/violation")
const OffenseModel = require("../database/schemas/offense");
const RevocationModel = require('../database/schemas/revocation');


/* GET home page. */
router.get('/', function (req, res) {
    res.json({message: 'Testing API Homepage!'})
})
router.post('/reset', async (req, res) => {
    const res1 = await ViolationModel.deleteMany()
    const res2 = await OffenseModel.deleteMany()
    const res3 = await RevocationModel.deleteMany()
    // console.log(res1, res2)
    res.status(200).json({done: true})
})
router.get('/test', async (req, res) => {
    console.log(req.ip)
})

module.exports = router