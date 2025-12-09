module.exports = (db, Sequelize) => {
  let Weight = db.define('weight', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    weightName: {
      type: Sequelize.STRING
    }
  },
    {
      tableName: 'weight', schema: 'matrimony', underscored: true, timestamps: false,
    });
  Weight.association = (models) => {
    Weight.hasMany(models.personalDetails, { foreignKey: 'weightId' })
  }
  return Weight;
}