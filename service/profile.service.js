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
const { Op, where } = require('sequelize');
const puppeteer = require("puppeteer");
const path = require("path");
const axios = require('axios');
const fs = require('fs');
const { S3Client } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: CONFIG.AWS_REGION,
  credentials: {
    accessKeyId: CONFIG.AWS_ACCESS_KEY,
    secretAccessKey: CONFIG.AWS_SECRET_KEY
  }
});


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
  const [zodiacDetailsErr, zodiacDetailsData] = await to(ZodiacDetails.create({ zodiacId, starId, patham, dosham, jathgamImage, profileId: parseInt(req.params.id) }));
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
        attributes: ['fatherName', 'motherName', 'fatherMobileNumber', 'motherMobileNumber', 'siblingMale', 'siblingFemale', 'marriedMale', 'marriedFemale', 'contactPersonName', 'contactPersonNumber', 'contactPersonType'],
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
  const educationDetails = userData.careerDetails[0].dataValues.educationDetails.join(", ");
  const contactDetails =
    userData?.parentDetails?.[0]?.dataValues?.contactPersonName +
    ' (' +
    userData?.parentDetails?.[0]?.dataValues?.contactPersonType +
    ')\n' +
    userData?.parentDetails?.[0]?.dataValues?.contactPersonNumber;



  const readableDate = userData?.dob?.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
  particularUserDetail = {
    name: userData.name,
    gender: userData.gender,
    dob: readableDate,
    age: new Date().getFullYear() - new Date(userData.dob).getFullYear(),
    maritalStatus: userData.martialStatus ?? '-',
    religion: userData.religion ?? '-',
    nativePlace: userData.nativePlace ?? '-',
    district: userData?.district?.dataValues?.districtName ?? '-',
    education: educationDetails ?? '-',
    profession: userData?.careerDetails?.[0]?.dataValues?.profession ?? '-',
    company: userData?.careerDetails?.[0]?.dataValues?.company ?? '-',
    salary: userData?.careerDetails?.[0]?.dataValues?.salary ?? '-',
    contact: contactDetails ?? '-',
    fatherName: userData?.parentDetails?.[0]?.dataValues?.fatherName ?? '-',
    motherName: userData?.parentDetails?.[0]?.dataValues?.motherName ?? '-',
    raasi: userData?.zodiacDetails?.[0]?.zodiac?.dataValues?.zodiacTamil ?? '-',
    nachathiram: userData?.zodiacDetails?.[0]?.star?.dataValues?.starTamil ?? '-',
    assets: userData?.personalDetails?.[0]?.dataValues?.asset ?? '-',
    expectation: userData?.personalDetails?.[0]?.dataValues?.Interest ?? '-',
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
  console.log("rawData", rawData);
  const answers = {};
  for (const key in rawData) {
    if (key.startsWith('q')) {
      answers[key] = normalizeValue(rawData[key]);
    }
  }


  // console.log("answers", JSON.stringify(answers));
  // district fetch
  let districtErr, districtData;
  if (answers.q65_district) {
    [districtErr, districtData] = await to(District.findOne({ where: { districtName: answers.q65_district } }));
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
    [zodiacErr, zodiacData] = await to(Zodiac.findOne({ where: { zodiacTamil: answers.q47_zodiacnbsp } }));
    if (zodiacErr) {
      return TE(zodiacErr.message);
    }
  }
  // weight fetch
  let weightErr, weightData;
  if (answers.q74_weight) {
    [weightErr, weightData] = await to(Weight.findOne({ where: { weightName: answers.q74_weight } }));
    if (weightErr) {
      return TE(weightErr.message);
    }
  }
  // height fetch
  let heightErr, heightData;
  if (answers.q73_height) {
    [heightErr, heightData] = await to(Height.findOne({ where: { heightName: answers.q73_height } }));
    if (heightErr) {
      return TE(heightErr.message);
    }
  }
  const profileDetails = {
    body: {
      gender: answers.q36_gender.toUpperCase(),
      name: answers.q64_name,
      dob: answers.q25_date,
      mobileNumber: answers.q72_mobileNumber72,
      password: 'Admin@123',
      martialStatus: answers.q34_martialStatus.toUpperCase(),
      religion: answers.q42_religion,
      nativePlace: answers.q28_typeA,
      districtId: districtData.id ?? null
    }
  };
  // console.log("profileDetails", profileDetails);
  const [profileErr, profileSucc] = await to(createProfile(profileDetails));
  if (profileErr) {
    return TE(profileErr.message);
  }
  // console.log("profileSucc", profileSucc);
  if (profileSucc?.id) {
    const careerDetails = {
      body: {
        educationDetails: [answers.q38_education],
        profession: answers.q39_profession,
        companyName: answers.q40_company,
        monthyIncome: answers.q41_monthlyIncome,
        workLocation: answers.q42_workLocation
      },
      params: { id: JSON.stringify(profileSucc.id) }
    }
    const [careerErr, careerSucc] = await to(createCareerDetails(careerDetails));
    if (careerErr) {
      return TE(careerErr.message);
    }
    // console.log("careerSucc", careerSucc);
    const familyDetails = {
      body: {
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
      },
      params: { id: JSON.stringify(profileSucc.id) }
    }
    const [familyErr, familySucc] = await to(createFamilyDetails(familyDetails));
    if (familyErr) {
      return TE(familyErr.message);
    }

    let jathamImage, photo;
    // console.log("rawData?.jathamImage?.[0]", rawData?.jathamImage?.[0], "rawData?.photo?.[0]", rawData?.photo?.[0]);
    if (rawData?.jathamImage?.[0]) {
      jathamImage = await uploadImageFromUrl(rawData?.jathamImage?.[0], 'profile', profileSucc.matrimonyId)
      console.log("jathamImage", jathamImage);
    }
    if (rawData?.photo?.[0]) {
      photo = await uploadImageFromUrl(rawData?.photo?.[0], 'profile', profileSucc.matrimonyId)
    }


    // console.log("familySucc", familySucc);
    const zodiacDetails = {
      body: {
        zodiacId: zodiacData.id ?? null,
        starId: starData.id ?? null,
        patham: answers.q49_input49.match(/\d+/)?.[0],
        dosham: answers.q50_dosham,
        jathgamImage: jathamImage ?? null,
      },
      params: { id: JSON.stringify(profileSucc.id) }
    };
    const [zodiacErr, zodiacSucc] = await to(createZodiacDetails(zodiacDetails));
    if (zodiacErr) {
      return TE(zodiacErr.message);
    }
    const profileImage = {
      body: {
        profileUrl: photo ?? null
      },
      params: { id: JSON.stringify(profileSucc.id) }
    }
    const [imageErr, imageSucc] = await to(createProfileImage(profileImage));
    if (imageErr) {
      return TE(imageErr.message);
    }
    // console.log("imageSucc", imageSucc);
    const personalDetails = {
      body: {
        heightId: heightData?.id ?? null,
        weightId: weightData?.id ?? null,
        skinTone: answers.q60_color,
        foodOption: answers.q61_foodOption === 'அசைவம்' ? 'NONVEG' : (answers.q61_foodOption === 'சைவம்' ? 'VEG' : 'SOMETIMES_NONVEG'),
        Intereqt: answers.q57_input57,
        asset: answers.q56_input56
      },
      params: { id: JSON.stringify(profileSucc.id) }
    };
    const [personalErr, personalSucc] = await to(createPersonalDetails(personalDetails));
    if (personalErr) {
      return TE(personalErr.message);
    }
    // console.log("personalSucc", personalSucc);
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



async function uploadImageFromUrl(url, folder, profileId) {
  if (!url) return null;
  console.log('Downloading image from URL:', url);
  // 🔥 FORCE RAW FILE DOWNLOAD
  const downloadUrl = `${url}?download=1`;

  const response = await axios.get(downloadUrl, {
    responseType: 'stream',
    timeout: 20000,
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'image/*'
    }
  });
  // console.log("response", response);

  const contentType = response.headers['content-type'];
  console.log('Image content-type:', contentType);

  if (!contentType || !contentType.startsWith('image/')) {
    throw new Error(`Invalid content-type: ${contentType}`);
  }

  const extension = contentType.split('/')[1];
  console.log('Image extension:', extension);
  const key = `${folder}/${profileId}.${extension}`;

  console.log('Uploading to S3 key:', key);

  const uploadParams = {
    Bucket: CONFIG.AWS_BUCKET,
    Key: key,
    Body: response.data,
    ContentType: contentType
  };

  const result = await s3.send(new PutObjectCommand(uploadParams));
  console.log('S3 upload success:', result);

  return {
    key,
    url: `https://${CONFIG.AWS_BUCKET}.s3.${CONFIG.AWS_REGION}.amazonaws.com/${key}`
  };
}

module.exports.BulkCreateProfile = BulkCreateProfile;