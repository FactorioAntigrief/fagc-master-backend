const { apikey } = require("../../config.json")

/**
 * @description Checks the authentication of a user by searching the database with the API key
 * @param {express.Request} - Request to the API 
 * @returns {Number} - 200 if OK, 401 if wrong IP, 404 if key not found / doesn't belong to anyone
 */
const authenticate = async (req) => {
    if (req.method === 'GET') return 200
    if (req.headers.apikey === undefined) return 404 // no api key
    if (req.headers.apikey !== apikey) return 401
    else return 200
}

module.exports = authenticate