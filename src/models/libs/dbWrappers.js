const Db = require("./Db");
const DatabaseError = require("../../errorhandlers/DatabaseError");

const usingTrx = async (wrapperAsyncFn = async (_trxProvider) => {
}, trxProvider = undefined) => {
    if (trxProvider) {
        return await wrapperAsyncFn(trxProvider);
    } else {
        const trxProvider = Db.getTransactionProvider();
        try {
            const wrapperFnOutput = await wrapperAsyncFn(trxProvider);

            const txn = await trxProvider();
            await txn.commit();
            if (!txn.isCompleted()) {
                throw new DatabaseError("Transaction commit failed");
            }

            return wrapperFnOutput;
        } catch (e) {
            const txn = await trxProvider();
            await txn.rollback();
            throw new DatabaseError(e);
        }
    }
};

module.exports = { usingTrx };
