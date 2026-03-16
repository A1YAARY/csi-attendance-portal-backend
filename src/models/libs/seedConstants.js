// Todo: Eliminate use of IDs
const USER_ROLES_INFO = {
    ADMIN: {
        ID: 1,
        NAME: "admin"
    },
    SUPER_ADMIN: {
        ID: 2,
        NAME: "super_admin"
    },
    MEMBER: {
        ID: 3,
        NAME: "member"
    },
    CAPTAIN: {
        ID: 4,
        NAME: "captain"
    },
    ORGANIZATION_ADMIN: {
        NAME: "organization_admin"
    },
    EXPO_BIB_MARKING: {
        ID: 5,
        NAME: "expo_bib_marking"
    },
    EXPO_OTHER_UTILITY: {
        ID: 6,
        NAME: "expo_other_utility"
    },
    EXPO_FINANCE: {
        ID: 7,
        NAME: "expo_finance"
    },
    EXPO_SELF_SPOT_REGISTRATION: {
        ID: 8,
        NAME: "expo_self_spot_registration"
    }
};

const DATA_SOURCE = {
    FITBIT_DATA_SOURCE: {
        ID: 1,
        NAME: "Fitbit",
        UNIQUE_NAME: "fitbit"
    },
    GOOGLE_FIT_DATA_SOURCE: {
        ID: 2,
        NAME: "Google Fit",
        UNIQUE_NAME: "googlefit"
    },
    GARMIN_DATA_SOURCE: {
        ID: 3,
        NAME: "Garmin",
        UNIQUE_NAME: "garminhealth"
    },
    STRAVA_DATA_SOURCE: {
        ID: 4,
        NAME: "Strava",
        UNIQUE_NAME: "strava"
    },
    APPLE_HEALTH: {
        ID: 5,
        NAME: "Apple Health",
        UNIQUE_NAME: "applehealth"
    },
    HEALTH_CONNECT: {
        ID: 6,
        NAME: "Health Connect",
        UNIQUE_NAME: "healthconnect"
    },
    GOOGLE_FIT_CLIENT: {
        ID: 7,
        NAME: "Google Fit Client",
        UNIQUE_NAME: "googlefit_client"
    }
};

const ATTRIBUTES = {
    STEPS: {
        UNIQUE_NAME: "steps"
    },
    DISTANCE: {
        UNIQUE_NAME: "distance"
    }
};

module.exports = {
    USER_ROLES_INFO,
    DATA_SOURCE,
    ATTRIBUTES
};
