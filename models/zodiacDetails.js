module.exports = (db, Sequelize) => {
  let ZodiacDetails = db.define('zodiacDetails', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    patham: {
      type: Sequelize.ENUM('1', '2', '3', '4')
    },
    dosham: {
      type: Sequelize.STRING
    },
    jathgamImage: {
      type: Sequelize.STRING
    }
  },
    {
      tableName: 'zodiacDetails', schema: 'matrimony', underscored: true, timestamps: false,
      indexes: [
      ]
    });
  ZodiacDetails.association = (models) => {
    ZodiacDetails.belongsTo(models.zodiac, { foreignKey: 'zodiacId' });
    ZodiacDetails.belongsTo(models.star, { foreignKey: 'starId' });
    ZodiacDetails.belongsTo(models.profile, { foreignKey: 'profileId' })
  }
  return ZodiacDetails;
}