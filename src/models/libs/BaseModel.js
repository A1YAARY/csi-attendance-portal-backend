require('dotenv').config();
const { TABLE_DEFAULTS } = require("./dbConstants");
const Db = require("../libs/Db");


class BaseModel {
    constructor(userId, dbname=null, isRead = false) {
        this.userId = userId;
        // this.dbname=dbname;
        // dbname = process.env.DB_CONNECTION || "api_write"
        // if (dbname == "api_write" && isRead) {
        //     dbname = 'api_read'
        // }
        // console.log("dbname", dbname);
        // this.DB = new Db(dbname)
    }

    async getQueryBuilder(trxProvider = null) {
        return trxProvider ? await trxProvider() : Db.getQueryBuilder();
    }

    getUserId() {
        return this.userId;
    }

    insertStatement(insertObj) {
        const userId = this.getUserId();
        if (!userId) {
            return insertObj;
        }

        return {
            ...insertObj,
            [TABLE_DEFAULTS.COLUMNS.CREATED_BY.KEY]: userId,
            [TABLE_DEFAULTS.COLUMNS.LAST_MODIFIED_BY.KEY]: userId
        };
    }

    // Helper insert for array
    insertArrayStatement(rows) {
        return rows.map(r => this.insertStatement(r));
    }

    async updateStatement({ updateObj }, trxProvider = null) {
        const userId = this.getUserId();
        if (!userId) {
            return updateObj;
        }

        const queryBuilder = await this.getQueryBuilder(trxProvider);

        return {
            ...updateObj,
            [TABLE_DEFAULTS.COLUMNS.UPDATED_AT.KEY]: queryBuilder.raw("CURRENT_TIMESTAMP"),
            [TABLE_DEFAULTS.COLUMNS.LAST_MODIFIED_BY.KEY]: userId
        };
    }

    whereStatement(whereObj) {
        return {
            [TABLE_DEFAULTS.COLUMNS.IS_DELETED.KEY]: false,
            ...whereObj
        };
    }

    getDefinedObject(object) {
        const definedObject = {};
        for (const key in object) {
            if (object[key] !== undefined) {
                definedObject[key] = object[key];
            }
        }

        return definedObject;
    }
}

module.exports = BaseModel;
