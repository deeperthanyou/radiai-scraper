/**
 * Created by deep on 11/14/16.
 * data model for an ambulance that belongs to an ambulance squad
 */
"use strict";

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('radiologist', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        businessName: {
            type: DataTypes.STRING
        },
        categories: {
            type: DataTypes.STRING
        },
        email: {
            type: DataTypes.STRING
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        state: {
            type: DataTypes.STRING
        },
        city: {
            type: DataTypes.STRING
        },
        street: {
            type: DataTypes.STRING
        },
        zip: {
            type: DataTypes.STRING
        }
    }, {
        classMethods: {},
        // don't add the timestamp attributes (updatedAt, createdAt)
        timestamps: false,

        // disable the modification of table names; By default, sequelize will automatically
        // transform all passed model names (first parameter of define) into plural.
        // if you don't want that, set the following
        //freezeTableName: true,

        // define the table's name
        tableName: 'radiologist'
    }, {
        dialect: 'mysql'
    });
};