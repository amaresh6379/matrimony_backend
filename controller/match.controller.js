const verifyToken = require('../middleware/verifyToken');
const router = require('express').Router({ mergeParams: true });
require('../global_function');
const matchService = require('../service/match.service');


const getMatchingList = async (req, res) => {
  const [matchErr, matachData] = await to(matchService.getMatchingList(req));
  if (matchErr) {
    return ReE(res, Object.assign({ success: false }, { details: matchErr.message }), 422);
  }
  return ReS(res, { result: matachData }, 200);

};


router.get('/', verifyToken, getMatchingList);

module.exports = {
  router,
  getMatchingList
};
