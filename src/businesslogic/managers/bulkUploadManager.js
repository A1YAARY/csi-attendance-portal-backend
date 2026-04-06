const BulkUserService = require("../../services/bulkUploadParserService");
const { uploadToS3 } = require("../../services/s3Services");
const AuthenticationManager = require("./authenticationManager");
const { ACCESS_ROLES } = require("../accessmanagement/roleConstants");

class BulkUploadManager {
static async bulkUploadUsers(adminUser, file) {
  try {
    // const userRoles = adminUser?.roles?.map(r => r.role_name) || [];
    // const isAuthorized = userRoles.includes(ACCESS_ROLES.ACCOUNT_ADMIN) || 
    //                    userRoles.includes(ACCESS_ROLES.ACCOUNT_SUPER_ADMIN);

    // if (!isAuthorized) {
    //   throw new Error("Unauthorized");
    // }


    // 📄 Step 1: Parse
    const users = await BulkUserService.parseFile(file);

    if (!users.length) {
      throw new Error("File is empty");
    }

    const results = [];

    // 🔄 Step 2: Process using EXISTING registerUser
    for (const row of users) {
      try {
        await AuthenticationManager.registerUser(adminUser, {
          ...row,
          organization_id: adminUser.organization_id
        }, { bulk: true }); // optional flag

        results.push({
          ...row,
          status: "SUCCESS",
          reason: ""
        });

      } catch (err) {
        results.push({
          ...row,
          status: "FAILED",
          reason: err.message
        });
      }
    }

    // 📊 Step 3: Generate report
    const buffer = BulkUserService.generateCSVBuffer(results);

    // ☁️ Step 4: Upload to S3
    const key = `attendance-portal/bulk-reports/report-${Date.now()}.csv`;
    const fileUrl = await uploadToS3(buffer, key, "text/csv");

    return {
      success: true,
      message: "Bulk upload completed",
      data: {
        fileUrl,
        total: results.length,
        success: results.filter(r => r.status === "SUCCESS").length,
        failed: results.filter(r => r.status === "FAILED").length
      }
    };

  } catch (error) {
    throw error;
  }
}
}

module.exports = BulkUploadManager