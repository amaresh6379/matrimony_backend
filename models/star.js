module.exports = (db, Sequelize) => {
  let Star = db.define('star', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    starName: {
      type: Sequelize.STRING,
      required: true
    },
    starTamil: {
      type: Sequelize.STRING,
      required: true
    },
  },
    {
      tableName: 'star', schema: 'matrimony', underscored: true, timestamps: false,
    });
  Star.association = (models) => {
    Star.hasMany(models.zodiacDetails, { foreignKey: 'starId' })
  }
  return Star;
}