const Profile = require('../models').profile;
const CareerDetails = require('../models').careerDetails;
const ZodiacDetails = require('../models').zodiacDetails;
const Zodiac = require('../models').zodiac;
const Star = require('../models').star;
const ProfileInterset = require('../models').profileInterset;
require('../global_function');
const { Op, where } = require("sequelize");
const { off } = require('..');

const getMatchingList = async (req) => {
  const gender = req.user.gender;
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  const filterData = req.query.filterData
    ? JSON.parse(req.query.filterData)
    : null;
  let zodiacWhereCondition = {};
  let profileWhereCondition = {
    gender: { [Op.ne]: gender },
    isDeleted: false,
    isActive: true
  };

  // Filters
  if (filterData) {

    if (filterData.zodiacId) {
      zodiacWhereCondition.zodiacId = filterData.zodiacId;
    }

    if (filterData.starId) {
      zodiacWhereCondition.starId = filterData.starId;
    }

    if (filterData.fromAge && filterData.toAge) {
      const today = new Date();

      const minDOB = new Date(
        today.getFullYear() - filterData.toAge,
        today.getMonth(),
        today.getDate()
      );

      const maxDOB = new Date(
        today.getFullYear() - filterData.fromAge,
        today.getMonth(),
        today.getDate()
      );

      profileWhereCondition.dob = {
        [Op.between]: [minDOB, maxDOB]
      };
    }

    if (filterData.maritalStatus) {
      profileWhereCondition.martialStatus = filterData.maritalStatus;
    }

    if (filterData.districtId) {
      profileWhereCondition.districtId = filterData.districtId;
    }
  }
  const [matchErr, matachData] = await to(Profile.findAll(
    {
      attributes: ['id', 'matrimonyId', 'name', 'gender', 'dob', 'martialStatus', 'religion', 'nativePlace', 'createdAt', 'districtId'],
      where: profileWhereCondition,
      include: [
        {
          model: CareerDetails,
          attributes: ['educationDetails', 'profession', 'companyName', 'monthyIncome'],
          required: false
        },
        {
          model: ZodiacDetails,
          attributes: ['id'],
          where: zodiacWhereCondition,
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
          required: (zodiacWhereCondition.zodiacId || zodiacWhereCondition.starId) ? true : false
        }
      ],
      order: [
        ['created_at', 'DESC']
      ],
      limit: limit,
      offset: offset
    }));
  if (matchErr) {
    return TE(matchErr.message);
  }
  return matachData;
}


const sendInterset = async (req) => {
  const id = req?.user?.id;
  const interestId = req?.query?.interestId;
  if (!id || !interestId) return TE('Id is required');
  const [matchErr, matachData] = await to(ProfileInterset.findOrCreate({
    where: {
      profileId: id,
      likedProfileId: interestId
    },
    defaults: {
      profileId: id,
      likedProfileId: interestId
    }
  })
  );
  if (matchErr) {
    return TE(matchErr.message);
  }
  console.log("matachData", matachData[1]);
  if (matachData[1]) {
    return {
      success: true,
      message: 'Interest sent successfully',
      data: matachData[0]
    }
  }
  else {
    return {
      success: true,
      message: 'Interest already sent',
      data: matachData[0]
    }

  }
  return matachData;
}

const getSentLikes = async (req) => {
  const id = req?.user?.id;
  const gender = req?.user?.gender;
  if (!id) return TE('Id is required');
  const [matchErr, matchData] = await to(
    ProfileInterset.findAll({
      attributes: ['profileId', 'likedProfileId'],

      where: { profileId: id },

      include: [
        {
          model: Profile,
          attributes: [
            "matrimonyId",
            "name",
            "gender",
            "dob",
            "mobileNumber",
            "martialStatus",
            "religion",
            "nativePlace",
            "createdAt",
            "districtId"
          ],
          as: 'Receiver',
          required: true,
          where: {
            gender: { [Op.ne]: gender },
            isDeleted: false,
            isActive: true
          },
          include: [
            {
              model: CareerDetails,
              attributes: ['educationDetails', 'profession', 'companyName', 'monthyIncome'],
              required: false
            },
            {
              model: ZodiacDetails,
              attributes: ['id'],
              required: false,
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
              ]
            }
          ],
          order: [['created_at', 'DESC']]
        }
      ],
    })
  );
  if (matchErr) {
    return TE(matchErr.message);
  }
  return matchData;
}

const getReceivedLikes = async (req) => {
  const id = req?.user?.id;
  const gender = req?.user?.gender;
  if (!id) return TE('Id is required');
  const [matchErr, matachData] = await to(ProfileInterset.findAll({
    attributes: ['profileId', 'likedProfileId'],
    where: {
      likedProfileId: id
    },
    include: [
      {
        model: Profile,
        attributes: [
          "matrimonyId",
          "name",
          "gender",
          "dob",
          "mobileNumber",
          "martialStatus",
          "religion",
          "nativePlace",
          "createdAt",
          "districtId"
        ],
        required: true,
        as: "Sender",
        where: {
          gender: { [Op.ne]: gender },
          isDeleted: false,
          isActive: true
        },
        include: [
          {
            model: CareerDetails,
            attributes: ['educationDetails', 'profession', 'companyName', 'monthyIncome'],
            required: false
          },
          {
            model: ZodiacDetails,
            attributes: ['id'],
            required: false,
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
            ]
          }
        ],
        order: [['created_at', 'DESC']]
      }
    ],
  }));
  if (matchErr) {
    return TE(matchErr.message);
  }
  return matachData;
}

module.exports = {
  getMatchingList,
  sendInterset,
  getSentLikes,
  getReceivedLikes
}