module.exports = (db, Sequelize) => {
  let District = db.define('district', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    districtName: {
      type: Sequelize.STRING,
      required: true
    },
    isDeleted: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
  },
    {
      tableName: 'district', schema: 'matrimony', underscored: true, timestamps: false
    });
  District.association = (models) => {
    District.hasMany(models.profile, { foreignKey: 'districtId' })
  }
  return District;
}