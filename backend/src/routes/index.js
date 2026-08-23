const { Router } = require("express");
const healthRouter = require("./health");
const codingRouter = require("./coding");
const aiTutorRouter = require("./aiTutor");
const accessRouter = require("./access");
const billingRouter = require("./billing");
const billingCallbacksRouter = require("./billingCallbacks");
const billingAdminRouter = require("./billingAdmin");
const quizRouter = require("./quiz");

const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/access", accessRouter);
apiRouter.use("/billing/callbacks", billingCallbacksRouter);
apiRouter.use("/billing/admin", billingAdminRouter);
apiRouter.use("/billing", billingRouter);
apiRouter.use("/coding", codingRouter);
apiRouter.use("/ai-tutor", aiTutorRouter);
apiRouter.use("/quiz", quizRouter);

// Future modules (not implemented yet):
// apiRouter.use("/auth", authRouter);
// apiRouter.use("/users", usersRouter);
// apiRouter.use("/ai", aiRouter);
// apiRouter.use("/roadmaps", roadmapsRouter);
// apiRouter.use("/progress", progressRouter);
// apiRouter.use("/awards", awardsRouter);

module.exports = apiRouter;
