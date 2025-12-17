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


const sendInterset = async (req, res) => {
  const [matchErr, matachData] = await to(matchService.sendInterset(req));
  if (matchErr) {
    return ReE(res, Object.assign({ success: false }, { details: matchErr.message }), 422);
  }
  return ReS(res, { result: matachData }, 200);
};


const getSentLikes = async (req, res) => {
  const [matchErr, matachData] = await to(matchService.getSentLikes(req));
  if (matchErr) {
    return ReE(res, Object.assign({ success: false }, { details: matchErr.message }), 422);
  }
  return ReS(res, { result: matachData }, 200);
};


const getReceivedLikes = async (req, res) => {
  const [matchErr, matachData] = await to(matchService.getReceivedLikes(req));
  if (matchErr) {
    return ReE(res, Object.assign({ success: false }, { details: matchErr.message }), 422);
  }
  return ReS(res, { result: matachData }, 200);
};

router.get('/', verifyToken, getMatchingList);
router.put('/:id', verifyToken, sendInterset);
router.get('/:id/sent', verifyToken, getSentLikes);
router.get('/:id/received', verifyToken, getReceivedLikes);

module.exports = {
  router,
  getMatchingList
};
