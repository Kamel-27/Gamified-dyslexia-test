-- CreateTable
CREATE TABLE "ScreeningSession" (
    "id" TEXT NOT NULL,
    "childAge" INTEGER NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'ar',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScreeningSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScreeningResponse" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "chosenIndex" INTEGER,
    "result" TEXT NOT NULL,
    "reactionTimeMs" INTEGER NOT NULL,
    "timeLimitSeconds" INTEGER NOT NULL,

    CONSTRAINT "ScreeningResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScreeningResult" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "totalScore" DOUBLE PRECISION NOT NULL,
    "riskBand" TEXT NOT NULL,
    "stageScoresJson" TEXT NOT NULL,
    "ranAvgMs" DOUBLE PRECISION NOT NULL,
    "vowelDeltaMs" DOUBLE PRECISION NOT NULL,
    "flaggedStagesJson" TEXT NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScreeningResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScreeningResponse_sessionId_idx" ON "ScreeningResponse"("sessionId");

-- CreateIndex
CREATE INDEX "ScreeningResponse_sessionId_stageId_idx" ON "ScreeningResponse"("sessionId", "stageId");

-- CreateIndex
CREATE UNIQUE INDEX "ScreeningResult_sessionId_key" ON "ScreeningResult"("sessionId");

-- AddForeignKey
ALTER TABLE "ScreeningResponse" ADD CONSTRAINT "ScreeningResponse_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ScreeningSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScreeningResult" ADD CONSTRAINT "ScreeningResult_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ScreeningSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
