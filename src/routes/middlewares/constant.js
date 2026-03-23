const RES_LOCALS = {
    USER_INFO: {
        KEY: "userInfo"
    }
};

const LOG_CONSTANTS = {
    ERROR: {
        FILE_NAME: "errorLogs.txt"
    },
    GARMIN_LOGS: {
        FILE_NAME: "garminLogs.txt"
    },
    TRANSACTION_LOGS: {
        FILE_NAME: "transactionLogs.txt"
    },
    EMAIL_LOG: {
        FILE_NAME: "emailLogs.txt"
    },
    TOKEN_LOG: {
        FILE_NAME: "tokenLogs.txt"
    },
    TOWNSCRIPT_LOG: {
        FILE_NAME: "townscriptLogs.txt"
    }
};

const MIME_TYPES = {
    jpeg: "image/jpeg",
    jpg: "image/jpg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    csv: "text/csv",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
};


module.exports = {
    RES_LOCALS,
    LOG_CONSTANTS,
    MIME_TYPES
}