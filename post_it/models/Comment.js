const { DataTypes } = require('sequelize');
const db            = require('../db/conn');

const Comment = db.define('comment',{
    comment:{
        type: DataTypes.STRING,
        allowNull: false
    },
    userId:{
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Comment;