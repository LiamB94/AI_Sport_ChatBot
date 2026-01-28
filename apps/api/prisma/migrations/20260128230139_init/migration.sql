-- CreateTable
CREATE TABLE "MatchupRequest" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchupRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchupResult" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "answerJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchupResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MatchupResult_requestId_key" ON "MatchupResult"("requestId");

-- AddForeignKey
ALTER TABLE "MatchupResult" ADD CONSTRAINT "MatchupResult_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "MatchupRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
