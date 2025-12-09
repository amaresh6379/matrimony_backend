const Profile = require('../models').profile;
const CareerDetails = require('../models').careerDetails;
const ZodiacDetails = require('../models').zodiacDetails;
const Zodiac = require('../models').zodiac;
const Star = require('../models').star;
require('../global_function');
const { Op, Model } = require("sequelize");
const zodiac = require('../models/zodiac');

const getMatchingList = async (req, res) => {
  const gender = req.user.gender;
  const limit = req.query.limit;
  const offset = req.query.offset;
  const [matchErr, matachData] = await to(Profile.findAll(
    {
      attributes: ['id', 'matrimonyId', 'name', 'gender', 'dob', 'martialStatus', 'religion', 'nativePlace'],
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
module.exports = {
  getMatchingList
}