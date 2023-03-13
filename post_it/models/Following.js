const { DataTypes } = require('sequelize');
const db            = require('../db/conn');

const Following = db.define('following',{
    userId:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    followedId:{
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Following;