module.exports = (db, Sequelize) => {
  let Zodiac = db.define('zodiac', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    zodiacName: {
      type: Sequelize.STRING,
      required: true
    },
    zodiacTamil: {
      type: Sequelize.STRING,
      required: true
    },
  },
    {
      tableName: 'zodiac', schema: 'matrimony', underscored: true, timestamps: false,
    });
  Zodiac.association = (models) => {
    Zodiac.hasMany(models.zodiacDetails, { foreignKey: 'zodiacId' })
  }
  return Zodiac;
}