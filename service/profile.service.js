const Profile = require('../models').profile;
const PersonalDetails = require('../models').personalDetails;
const CareerDetails = require('../models').careerDetails;
const ParentDetails = require('../models').parentDetails;
const ProfileImage = require('../models').profileImage;
const ZodiacDetails = require('../models').zodiacDetails;
const District = require('../models').district;
const telegramService = require('../service/telegram.service');
const Height = require('../models').height;
const Weight = require('../models').weight;
const Zodiac = require('../models').zodiac;
const Star = require('../models').star;
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const { Op, where } = require('sequelize');
const puppeteer = require("puppeteer");
const path = require("path");



require('../global_function');


const bcrypt = require('bcrypt');
const { TE } = require('../global_function');
const SALT = CONFIG.SALT;

async function hashPasswordBcrypt(plainPassword) {
  const saltRounds = 12;
  const hash = await bcrypt.hash(plainPassword, saltRounds);
  return hash; // store in DB
}

/**
 * 
 * @param {*} req 
 * @returns 
 */
const createProfile = async (req) => {
  const { gender, name, dob, mobileNumber, password, martialStatus, religion, nativePlace, districtId } = req.body;
  const hashPassword = await hashPasswordBcrypt(password + SALT);
  const [profileErr, profileData] = await to(Profile.create({ name, gender, dob: new Date(dob), mobileNumber, password: hashPassword, martialStatus, religion, nativePlace, districtId }));
  if (profileErr) {
    console.log("profileErr", profileErr);
    return TE(profileErr.message);
  }
  if (profileData) {
    profileData['age'] = new Date().getFullYear() - new Date(profileData.dob).getFullYear();
    const districtDetails = await District.findOne({ where: { id: profileData.districtId } });
    profileData['districtName'] = districtDetails.districtName;
    const [telegramErr, telegramData] = await to(telegramService.sendNewUserMessage(profileData));
    if (telegramErr) {
      return TE(telegramErr.message);
    }

    return {
      createProfile: true,
      message: 'Profile created successfully',
      matrimonyId: profileData.matrimonyId,
      id: profileData.id
    };
  }
}

module.exports.createProfile = createProfile;


const createPersonalDetails = async (req) => {
  const { heightId, weightId, skinTone, foodOption, Intereqt, asset } = req.body;
  const [personalDetailsErr, personalDetailsData] = await to(PersonalDetails.create({ heightId, weightId, skinTone, foodOption, Intereqt, asset, profileId: req.params.id }));
  if (personalDetailsErr) {
    return TE(personalDetailsErr.message);
  }
  if (personalDetailsData) {
    return {
      createPersonalDetails: true,
      message: 'Personal Details created successfully'
    };
  }
}

module.exports.createPersonalDetails = createPersonalDetails;


const createCareerDetails = async (req) => {
  const { educationDetails, profession, companyName, monthyIncome, workLocation } = req.body;
  console.log({ educationDetails, profession, companyName, monthyIncome, workLocation, profileId: req.params.id });
  const [careerDetailsErr, careerDetailsData] = await to(CareerDetails.create({ educationDetails, profession, companyName, monthyIncome, workLocation, profileId: parseInt(req.params.id) }));
  if (careerDetailsErr) {
    return TE(careerDetailsErr.message);
  }
  if (careerDetailsData) {
    return {
      createCareerDetails: true,
      message: 'Career Details created successfully'
    };
  }

}
module.exports.createCareerDetails = createCareerDetails;



const createZodiacDetails = async (req) => {
  const { zodiacId, starId, patham, dosham, jathgamImage } = req.body;
  const [zodiacDetailsErr, zodiacDetailsData] = await to(ZodiacDetails.create({ zodiacId, starId, patham, dosham, jathgamImage, profileId: req.params.id }));
  if (zodiacDetailsErr) {
    return TE(zodiacDetailsErr.message);
  }
  if (zodiacDetailsData) {
    return {
      createZodiacDetails: true,
      message: 'Zodiac Details created successfully'
    };
  }
}
module.exports.createZodiacDetails = createZodiacDetails;


const createFamilyDetails = async (req) => {
  const { fatherName, motherName, fatherMobileNumber, motherMobileNumber, siblingMale, siblingFemale, marriedMale, marriedFemale, contactPersonName, contactPersonNumber, contactPersonType } = req.body;
  const [familyDetailsErr, familyDetailsData] = await to(ParentDetails.create({ fatherName, motherName, fatherMobileNumber, motherMobileNumber, siblingMale, siblingFemale, marriedMale, marriedFemale, contactPersonName, contactPersonNumber, contactPersonType, profileId: req.params.id }));
  if (familyDetailsErr) {
    return TE(familyDetailsErr.message);
  }
  if (familyDetailsData) {
    return {
      createFamilyDetails: true,
      message: 'Family Details created successfully'
    };
  }
}
module.exports.createFamilyDetails = createFamilyDetails;


const createProfileImage = async (req) => {
  const { profileUrl } = req.body;
  const [profileImageErr, profileImageData] = await to(ProfileImage.create({ profileUrl, profileId: req.params.id, isMain: true }));
  if (profileImageErr) {
    return TE(profileImageErr.message);
  }
  if (profileImageData) {
    return {
      createProfileImage: true,
      message: 'Profile Image created successfully'
    };
  }
}
module.exports.createProfileImage = createProfileImage;


const getOneProfileDetails = async (req) => {
  const id = req?.user?.id;
  if (!id) return TE('Id is required');
  const [matchErr, matachData] = await to(Profile.findOne({
    attributes: ['matrimonyId', 'name', 'gender', 'mobileNumber', 'dob', 'martialStatus', 'religion', 'nativePlace', 'districtId'],
    where: {
      id: id,
      isDeleted: false,
      isActive: true
    },
    include: [
      {
        model: District,
        attributes: ['districtName'],
        required: false
      },
      {
        model: CareerDetails,
        attributes: ['educationDetails', 'profession', 'companyName', 'monthyIncome'],
        required: false
      },
      {
        model: ParentDetails,
        attributes: ['fatherName', 'motherName', 'fatherMobileNumber', 'motherMobileNumber', 'siblingMale', 'siblingFemale', 'marriedMale', 'marriedFemale'],
        required: false
      },
      {
        model: ZodiacDetails,
        attributes: ['id', 'patham', 'dosham', 'jathgamImage'],
        include: [
          {
            model: Zodiac,
            attributes: ['zodiacTamil'],
            required: false
          },
          {
            model: Star,
            attributes: ['starTamil'],
            required: false
          }
        ],
        required: false
      },
      {
        model: PersonalDetails,
        attributes: ['skinTone', 'foodOption', 'Interest', 'asset'],
        required: false,
        include: [
          {
            model: Height,
            attributes: ['heightName'],
            required: false
          },
          {
            model: Weight,
            attributes: ['weightName'],
            required: false
          }
        ]
      },
      {
        model: ProfileImage,
        attributes: ['profileUrl', 'isMain'],
        required: false,
        where: {
          isDeleted: false
        }
      }
    ]
  }));
  if (matchErr) {
    return TE(matchErr.message);
  }
  return matachData;

}

module.exports.getOneProfileDetails = getOneProfileDetails;


const updateProfileDetails = async (req) => {
  if (req?.body) {
    const updateDetails = {
      matrimonyId: req.body.matrimonyId,
      name: req.body.name,
      gender: req.body.gender,
      mobileNumber: req.body.mobileNumber,
      dob: req.body.dob,
      martialStatus: req.body.martialStatus,
      religion: req.body.religion,
      nativePlace: req.body.nativePlace,
      districtId: req.body.districtId
    };
    const [updateErr, updateData] = await to(Profile.update(updateDetails, { where: { id: req.user.id, isDeleted: false, isActive: true } }));
    if (updateErr) {
      return TE(updateErr.message);
    }
    return updateData;
  }
}
module.exports.updateProfileDetails = updateProfileDetails;

const updateProfileImage = async (req) => {
  if (req?.body) {
    const updateProfileImage = {
      profileUrl: req.body.profileUrl,
      isMain: true
    };
    const [updateErr, updateData] = await to(ProfileImage.update(updateProfileImage, { where: { profileId: req.user.id } }));
    if (updateErr) {
      return TE(updateErr.message);
    }
    return updateData;

  }
}
module.exports.updateProfileImage = updateProfileImage;


const updateCareerDetails = async (req) => {
  if (req?.body) {
    const updateCareerDetails = {
      educationDetails: req.body.educationDetails,
      profession: req.body.profession,
      companyName: req.body.companyName,
      monthyIncome: req.body.monthyIncome,
      workLocation: req.body.workLocation,
      updatedAt: new Date()
    };
    const [updateErr, updateData] = await to(CareerDetails.update(updateCareerDetails, { where: { profileId: req.user.id } }));
    if (updateErr) {
      return TE(updateErr.message);
    }
    return updateData;
  }

};

module.exports.updateCareerDetails = updateCareerDetails;


const updateFamilyDetails = async (req) => {
  if (req?.body) {
    const updateParentDetails = {
      fatherName: req.body.fatherName,
      motherName: req.body.motherName,
      fatherMobileNumber: req.body.fatherMobileNumber,
      motherMobileNumber: req.body.motherMobileNumber,
      siblingMale: req.body.siblingMale,
      siblingFemale: req.body.siblingFemale,
      marriedMale: req.body.marriedMale,
      marriedFemale: req.body.marriedFemale,
      updatedAt: new Date()
    };
    const [updateErr, updateData] = await to(ParentDetails.update(updateParentDetails, { where: { profileId: req.user.id } }));
    if (updateErr) {
      return TE(updateErr.message);
    }
    return updateData;
  }

}
module.exports.updateFamilyDetails = updateFamilyDetails;


const updateZodiacDetails = async (req) => {
  if (req?.body) {
    const updateZodiacDetails = {
      patham: req.body.patham,
      dosham: req.body.dosham,
      jathgamImage: req.body.jathgamImage,
      zodiacId: req.body.zodiacId,
      starId: req.body.starId
    };
    const [updateErr, updateData] = await to(ZodiacDetails.update(updateZodiacDetails, { where: { profileId: req.user.id } }));
    if (updateErr) {
      return TE(updateErr.message);
    }
    return updateData;
  }

}

module.exports.updateZodiacDetails = updateZodiacDetails;


const updatePersonalDetails = async (req) => {
  if (req?.body) {
    const updatePersonalDetails = {
      skinTone: req.body.skinTone,
      foodOption: req.body.foodOption,
      Interest: req.body.interest,
      weightId: req.body.weightId,
      heightId: req.body.heightId
    };
    const [updateErr, updateData] = await to(PersonalDetails.update(updatePersonalDetails, { where: { profileId: req.user.id } }));
    if (updateErr) {
      return TE(updateErr.message);
    }
    return updateData;
  }
};
module.exports.updatePersonalDetails = updatePersonalDetails;


const getProfilePercentage = async (req) => {
  const id = req.user.id;
  const fields = {
    profile: ["name", "gender", "dob", "mobileNumber", "martialStatus", "religion", "nativePlace", "districtId"],
    personalDetails: ["skinTone", "foodOption", "Interest", "asset", "heightId", "weightId"],
    careerDetails: ["educationDetails", "profession", "companyName", "monthyIncome", "workLocation"],
    parentsDetails: ["fatherName", "motherName", "fatherMobileNumber", "motherMobileNumber", "siblingMale", "siblingFemale", "marriedMale", "marriedFemale"],
    zodiacDetails: ["patham", "dosham", "jathgamImage", "zodiacId", "starId"],
    profileImage: ["profileUrl", "isMain"]
  };

  let totalFields = 0;
  let filledFields = 0;

  // Fetch all related tables
  const [
    profile,
    personalDetails,
    careerDetails,
    parentsDetails,
    zodiacDetails,
    profileImage
  ] = await Promise.all([
    Profile.findOne({ attributes: ["name", "gender", "dob", "mobileNumber", "martialStatus", "religion", "nativePlace", "districtId"], where: { id: id, isActive: true, isDeleted: false } }),
    PersonalDetails.findOne({ attributes: ["skinTone", "foodOption", "Interest", "asset", "heightId", "weightId"], where: { profileId: id } }),
    CareerDetails.findOne({ attributes: ["educationDetails", "profession", "companyName", "monthyIncome", "workLocation"], where: { profileId: id } }),
    ParentDetails.findOne({ attributes: ["fatherName", "motherName", "fatherMobileNumber", "motherMobileNumber", "siblingMale", "siblingFemale", "marriedMale", "marriedFemale"], where: { profileId: id } }),
    ZodiacDetails.findOne({ attributes: ["patham", "dosham", "jathgamImage", "zodiacId", "starId"], where: { profileId: id } }),
    ProfileImage.findOne({ attributes: ["profileUrl", "isMain"], where: { profileId: id } }),
  ]);

  const dataMap = {
    profile,
    personalDetails,
    careerDetails,
    parentsDetails,
    zodiacDetails,
    profileImage
  };

  // Count filled fields
  for (const table in fields) {
    const tableFields = fields[table];
    totalFields += tableFields.length;

    const row = dataMap[table];

    for (const f of tableFields) {
      if (row && row[f] !== null && row[f] !== "" && row[f] !== undefined) {
        filledFields++;
      }
    }
  }

  // Calculate percentage
  const percentage = Math.round((filledFields / totalFields) * 100);

  return percentage;
};


module.exports.getProfilePercentage = getProfilePercentage;

async function generateProfileImage(htmlPath, data, outputPath) {
  const browser = await puppeteer.launch({
    headless: "new"
  });

  const page = await browser.newPage();

  // Read HTML template
  let html = fs.readFileSync(htmlPath, "utf8");

  // Inject data into template
  Object.keys(data).forEach((key) => {
    html = html.replaceAll(`{{${key}}}`, data[key] || "");
  });

  // Load HTML
  await page.setContent(html, { waitUntil: "networkidle0" });

  // A4 size (high quality)
  await page.setViewport({
    width: 794,
    height: 930,
    deviceScaleFactor: 2
  });

  // Generate image
  await page.screenshot({
    path: outputPath,
    fullPage: true
  });

  await browser.close();

  return outputPath;
}


const downloadProfile = async (req) => {

  const input = {
    user: {
      id: req.params.id
    }
  };

  let [userErr, userData] = await to(getOneProfileDetails(input));
  if (userErr) {
    return TE(userErr.message);
  }
  let particularUserDetail = {};
  console.log("userData", userData.careerDetails);
  particularUserDetail = {
    name: userData.name,
    gender: userData.gender,
    dob: userData.dob,
    age: userData.age,
    martialStatus: userData.martialStatus,
    nativePlace: userData.nativePlace,
    district: userData.district.dataValues.districtName,
    education: userData.careerDetails,
    profession: userData.profession,
    company: userData.company,
    salary: userData.salary,
    contact: userData.mobileNumber,
    fatherName: userData.fatherName,
    motherName: userData.motherName,
    raasi: userData.raasi,
    nachathiram: userData.nachathiram,
    assets: userData.assets,
    expectation: userData.expectation
  };


  await generateProfileImage(path.join(__dirname, 'profileCard.html'), particularUserDetail, path.join(__dirname, `profile_${userData.matrimonyId}.png`));
  return true;
}

module.exports.downloadProfile = downloadProfile;




const BulkCreateProfile = async function (req) {
  const profileData = req.body;
  let rawData = {};
  if (profileData.rawRequest) {
    try {
      rawData = JSON.parse(profileData.rawRequest);
    } catch (err) {
      console.error('Invalid rawRequest JSON');
      return;
    }
  }
  const answers = {};
  for (const key in rawData) {
    if (key.startsWith('q')) {
      answers[key] = normalizeValue(rawData[key]);
    }
  }

  console.log("answers", JSON.stringify(answers));
  // district fetch
  let districtErr, districtData;
  if (answers.q65_district) {
    [districtErr, districtData] = await to(District.findOne({ where: { districtName: answers.q44_district } }));
    if (districtErr) {
      return TE(districtErr.message);
    }
  }
  // star fetch
  let starErr, starData;
  if (answers.q48_starnbsp) {
    [starErr, starData] = await to(Star.findOne({ where: { starTamil: answers.q48_starnbsp } }));
    if (starErr) {
      return TE(starErr.message);
    }
  }

  // zodiac fetch
  let zodiacErr, zodiacData;
  if (answers.q47_zodiacnbsp) {
    [zodiacErr, zodiacData] = await to(Zodiac.findOne({ where: { zodiacName: answers.q47_zodiacnbsp } }));
    if (zodiacErr) {
      return TE(zodiacErr.message);
    }
  }
  // weight fetch
  let weightErr, weightData;
  if (answers.q53_weightnbsp) {
    [weightErr, weightData] = await to(Weight.findOne({ where: { weightName: answers.q53_weightnbsp } }));
    if (weightErr) {
      return TE(weightErr.message);
    }
  }
  // height fetch
  let heightErr, heightData;
  if (answers.q52_heightnbsp) {
    [heightErr, heightData] = await to(Height.findOne({ where: { heightName: answers.q52_heightnbsp } }));
    if (heightErr) {
      return TE(heightErr.message);
    }
  }

  const profileDetails = {
    gender: answers.q36_gender,
    name: answers.q64_name,
    dob: answers.q25_date,
    mobileNumber: answers.q72_mobileNumber72,
    password: 'Admin@123',
    martialStatus: answers.q34_martialStatus,
    religion: answers.q42_religion,
    nativePlace: answers.q28_typeA,
    districtId: districtData.id ?? null
  };
  const [profileErr, profileSucc] = await to(createProfile(profileDetails));
  if (profileErr) {
    return TE(profileErr.message);
  }
  console.log("profileSucc", profileSucc);
  if (profileSucc?.id) {
    const careerDetails = {
      educationDetails: answers.q38_education,
      profession: answers.q39_profession,
      companyName: answers.q40_company,
      monthyIncome: answers.q41_monthlyIncome,
      workLocation: answers.q42_workLocation
    }
    const [careerErr, careerSucc] = await to(createCareerDetails({ careerDetails, params: { id: profileSucc.id } }));
    if (careerErr) {
      return TE(careerErr.message);
    }
    const familyDetails = {
      fatherName: answers.q45_fathersName,
      motherName: answers.q31_mothersName,
      fatherMobileNumber: null,
      motherMobileNumber: null,
      siblingMale: null,
      siblingFemale: null,
      marriedMale: null,
      marriedFemale: null,
      contactPersonName: answers.q53_typeA53,
      contactPersonNumber: answers.q54_typeA54,
      contactPersonType: answers.q55_mobileNumber
    }
    const [familyErr, familySucc] = await to(createFamilyDetails({ familyDetails, params: { id: profileSucc.id } }));
    if (familyErr) {
      return TE(familyErr.message);
    }
    const zodiacDetails = {
      zodiacId: zodiacData.id ?? null,
      starId: starData.id ?? null,
      patham: answers.q49_input49,
      dosham: answers.q50_dosham,
      jathgamImage: answers.q82_jathgamImage
    };
    const [zodiacErr, zodiacSucc] = await to(createZodiacDetails({ zodiacDetails, params: { id: profileSucc.id } }));
    if (zodiacErr) {
      return TE(zodiacErr.message);
    }
    const profileImage = {
      profileUrl: answers.q76_profileUrl
    }
    const [imageErr, imageSucc] = await to(createProfileImage({ profileImage, params: { id: profileSucc.id } }));
    if (imageErr) {
      return TE(imageErr.message);
    }
    const personalDetails = {
      heightId: heightData.id ?? null,
      weightId: weightData.id ?? null,
      skinTone: answers.q60_color,
      foodOption: answers.q61_foodOption,
      Intereqt: answers.q57_input57,
      asset: answers.q56_input56

    };
    const [personalErr, personalSucc] = await to(createPersonalDetails({ personalDetails, params: { id: profileSucc.id } }));
    if (personalErr) {
      return TE(personalErr.message);
    }
  }
}


function normalizeValue(value) {
  if (value === null || value === undefined) return null;

  // Phone fields
  if (typeof value === 'object' && value.full) {
    return value.full;
  }

  // Date fields
  if (typeof value === 'object' && value.day && value.month && value.year) {
    return `${value.day}-${value.month}-${value.year}`;
  }

  // Other objects
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return value;
}
module.exports.BulkCreateProfile = BulkCreateProfile;