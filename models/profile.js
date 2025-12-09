module.exports = (db, Sequelize) => {
  let Profile = db.define('profile', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    matrimonyId: {
      type: Sequelize.STRING,
      required: true
    },
    name: {
      type: Sequelize.STRING,
      required: true,
      allowNull: false
    },
    gender: {
      type: Sequelize.ENUM('MALE', 'FEMALE'),
      required: true,
      allowNull: false
    },
    dob: {
      type: Sequelize.DATE,
      required: true
    },
    mobileNumber: {
      type: Sequelize.STRING,
      required: true
    },
    password: {
      type: Sequelize.STRING,
      required: true
    },
    martialStatus: {
      type: Sequelize.ENUM('UNMARRIED', 'DIVORCED', 'DIVORCED_WITH_CHILDREN', 'SEPARATED', 'SEPARATED_WITH_CHILDREN', 'WIDOW/WIDOWER', 'WIDOW/WIDOWER_WITH_CHILDREN'),
      required: true,
      allowNull: false
    },
    religion: {
      type: Sequelize.ENUM('HINDU', 'CHRISTIAN'),
      required: true
    },
    nativePlace: {
      type: Sequelize.STRING,
      required: true
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      required: true,
      defaultValue: false
    },
    isDeleted: {
      type: Sequelize.BOOLEAN,
      required: true,
      defaultValue: false
    },
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    updatedAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    expiredAt: {
      type: Sequelize.DATE
    },
    startAt: {
      type: Sequelize.DATE
    },
    lockedUntil: {
      type: Sequelize.DATE
    },
    failedAttempts: {
      type: Sequelize.INTEGER
    }
  },
    {
      tableName: 'profile', schema: 'matrimony', underscored: true, timestamps: false,
      indexes: [
        {
          name: 'profile_idx_id',
          using: 'BTREE',
          fields: ['id']
        },
        {
          name: 'profile_idx_matrimony_id',
          using: 'BTREE',
          fields: ['matrimony_id']
        },
        {
          name: 'profile_idx_name',
          using: 'BTREE',
          fields: ['name']
        },
        {
          name: 'profile_idx_gender',
          using: 'BTREE',
          fields: ['gender']
        },
        {
          name: 'profile_idx_dob',
          using: 'BTREE',
          fields: ['dob']
        },
        {
          name: 'profile_idx_mobile_number',
          using: 'BTREE',
          fields: ['mobile_number']
        },
        {
          name: 'profile_idx_martial_status',
          using: 'BTREE',
          fields: ['martial_status']
        },
        {
          name: 'profile_idx_is_active',
          using: 'BTREE',
          fields: ['is_active']
        },
        {
          name: 'profile_idx_is_deleted',
          using: 'BTREE',
          fields: ['is_deleted']
        },
        {
          name: 'profile_idx_expired_at',
          using: 'BTREE',
          fields: ['expired_at']
        },
        {
          name: 'profile_idx_religion',
          using: 'BTREE',
          fields: ['religion']
        },
      ]
    });
  Profile.association = (models) => {
    Profile.hasMany(models.careerDetails, { foreignKey: 'profileId' });
    Profile.hasMany(models.parentDetails, { foreignKey: 'profileId' });
    Profile.hasMany(models.zodiacDetails, { foreignKey: 'profileId' });
    Profile.hasMany(models.profileImage, { foreignKey: 'profileId' });
    Profile.belongsTo(models.district, { foreignKey: 'districtId' })
  }
  return Profile;
}