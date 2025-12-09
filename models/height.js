module.exports = (db, Sequelize) => {
  let Height = db.define('height', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    heightName: {
      type: Sequelize.STRING
    }
  },
    {
      tableName: 'height', schema: 'matrimony', underscored: true, timestamps: false,
    });
  Height.association = (models) => {
    Height.hasMany(models.personalDetails, { foreignKey: 'heightId' })
  }
  return Height;
}