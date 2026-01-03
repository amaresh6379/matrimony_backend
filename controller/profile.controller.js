const router = require('express').Router({ mergeParams: true });
const profileService = require('../service/profile.service');
const verifyToken = require('../middleware/verifyToken');
const multer = require('multer');
const upload = multer();
require('../global_function');


const createProfile = async (req, res) => {
  const [createErr, createSucc] = await to(profileService.createProfile(req));
  if (createErr) {
    return ReE(res, Object.assign({ success: false }, { details: createErr.message }), 422);
  }
  return ReS(res, { result: createSucc }, 200);
}


const createCareerDetails = async (req, res) => {
  const [createErr, createSucc] = await to(profileService.createCareerDetails(req));
  if (createErr) {
    return ReE(res, Object.assign({ success: false }, { details: createErr.message }), 422);
  }
  return ReS(res, { result: createSucc }, 200);
}

const createFamilyDetails = async (req, res) => {
  const [createErr, createSucc] = await to(profileService.createFamilyDetails(req));
  if (createErr) {
    return ReE(res, Object.assign({ success: false }, { details: createErr.message }), 422);
  }
  return ReS(res, { result: createSucc }, 200);
}

const createZodiacDetails = async (req, res) => {
  const [createErr, createSucc] = await to(profileService.createZodiacDetails(req));
  if (createErr) {
    return ReE(res, Object.assign({ success: false }, { details: createErr.message }), 422);
  }
  return ReS(res, { result: createSucc }, 200);
}


const createPersonalDetails = async (req, res) => {
  const [createErr, createSucc] = await to(profileService.createPersonalDetails(req));
  if (createErr) {
    return ReE(res, Object.assign({ success: false }, { details: createErr.message }), 422);
  }
  return ReS(res, { result: createSucc }, 200);
}


const createProfileImage = async (req, res) => {
  const [createErr, createSucc] = await to(profileService.createProfileImage(req));
  if (createErr) {
    return ReE(res, Object.assign({ success: false }, { details: createErr.message }), 422);
  }
  return ReS(res, { result: createSucc }, 200);
}



// Token endpoint

const getOneProfileDetails = async (req, res) => {
  const [matchErr, matachData] = await to(profileService.getOneProfileDetails(req));
  if (matchErr) {
    return ReE(res, Object.assign({ success: false }, { details: matchErr.message }), 422);
  }
  return ReS(res, { result: matachData }, 200);
}

const updateProfileDetails = async (req, res) => {
  const [matchErr, matachData] = await to(profileService.updateProfileDetails(req));
  if (matchErr) {
    return ReE(res, Object.assign({ success: false }, { details: matchErr.message }), 422);
  }
  return ReS(res, { result: matachData }, 200);
}

const updateProfileImage = async (req, res) => {
  const [matchErr, matachData] = await to(profileService.updateProfileImage(req));
  if (matchErr) {
    return ReE(res, Object.assign({ success: false }, { details: matchErr.message }), 422);
  }
  return ReS(res, { result: matachData }, 200);
}


const updateCareerDetails = async (req, res) => {
  const [matchErr, matachData] = await to(profileService.updateCareerDetails(req));
  if (matchErr) {
    return ReE(res, Object.assign({ success: false }, { details: matchErr.message }), 422);
  }
  return ReS(res, { result: matachData }, 200);
}

const updateFamilyDetails = async (req, res) => {
  const [matchErr, matachData] = await to(profileService.updateFamilyDetails(req));
  if (matchErr) {
    return ReE(res, Object.assign({ success: false }, { details: matchErr.message }), 422);
  }
  return ReS(res, { result: matachData }, 200);
}

const updateZodiacDetails = async (req, res) => {
  const [matchErr, matachData] = await to(profileService.updateZodiacDetails(req));
  if (matchErr) {
    return ReE(res, Object.assign({ success: false }, { details: matchErr.message }), 422);
  }
  return ReS(res, { result: matachData }, 200);
}

const updatePersonalDetails = async (req, res) => {
  const [matchErr, matachData] = await to(profileService.updatePersonalDetails(req));
  if (matchErr) {
    return ReE(res, Object.assign({ success: false }, { details: matchErr.message }), 422);
  }
  return ReS(res, { result: matachData }, 200);
}

const getProfilePercentage = async (req, res) => {
  const [matchErr, matachData] = await to(profileService.getProfilePercentage(req));
  if (matchErr) {
    return ReE(res, Object.assign({ success: false }, { details: matchErr.message }), 422);
  }
  return ReS(res, { result: matachData }, 200);
}


const downloadProfile = async (req, res) => {
  const [matchErr, matachData] = await to(profileService.downloadProfile(req));
  if (matchErr) {
    return ReE(res, Object.assign({ success: false }, { details: matchErr.message }), 422);
  }
  return ReS(res, { result: matachData }, 200);
}


const BulkCreateProfile = async (req, res) => {
  const [createErr, createSucc] = await to(profileService.BulkCreateProfile(req));
  if (createErr) {
    return ReE(res, Object.assign({ success: false }, { details: createErr.message }), 422);
  }
  return ReS(res, { result: createSucc }, 200);
}


router.post('/form', upload.any(), BulkCreateProfile);
router.post('/', createProfile);
router.post('/:id/personal', createPersonalDetails);
router.post('/:id/career', createCareerDetails);
router.post('/:id/family', createFamilyDetails);
router.post('/:id/zodiac', createZodiacDetails);
router.post('/:id/profileImage', createProfileImage);



// token endpoints
router.get('/:id', verifyToken, getOneProfileDetails);
router.put('/:id', verifyToken, updateProfileDetails);
router.put('/:id/profileImage', verifyToken, updateProfileImage);
router.put('/:id/personal', verifyToken, updatePersonalDetails);
router.put('/:id/career', verifyToken, updateCareerDetails);
router.put('/:id/family', verifyToken, updateFamilyDetails);
router.put('/:id/zodiac', verifyToken, updateZodiacDetails);
router.get('/:id/profilePercentage', verifyToken, getProfilePercentage);
router.get('/:id/download', downloadProfile);





module.exports = {
  router,
  createProfile
};
