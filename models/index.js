var Sequelize = require('sequelize');
require('../config');
var fs = require("fs");
var path = require('path');

const sequelize = new Sequelize(
  CONFIG.db_name,
  CONFIG.db_user,
  CONFIG.db_password,
  {
    host: CONFIG.db_host,
    dialect: CONFIG.db_dialect,
    port: CONFIG.db_port,
    logging: false,
  }
)

const schemaCreate = async function () {
  const test = [];
  var schemas = await sequelize.showAllSchemas().then(
    (s) => {
      CONSTANT.SCHEMAS.forEach((item) => {
        if (s.indexOf(item) < 0) {
          sequelize.createSchema(item).then((res) => { });
        }
      });
    },
    (err) => {
      console.error(
        "Unable to connect to Postgres database:",
        CONFIG.db_name,
        err.message
      );
      throw new Error(err);
    }
  );
  return schemas;
};

// CONSTANT.SCHEMAS.forEach((item) => {
// fs.readdirSync(__dirname + "/" + item)
// console.log("fs", fs.readdirSync(__dirname))

db = {};

fs.readdirSync(__dirname).forEach((file) => {
  if (file !== 'index.js') {
    var model = require(path.join(__dirname + "/", file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[file.slice(0, -3)] = model;
  }


})

Object.keys(db).forEach((modelName) => {
  // console.log(db[modelName].association);
  // console.log(modelName, 'in model', db['addresses']);
  if (db[modelName].association) {
    // console.log("db", db);
    // console.log("....", db[modelName].association(db))
    // console.log(db[modelName].association());
    db[modelName].association(db);
  }
});



// db.schemaCreate = schemaCreate();
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;