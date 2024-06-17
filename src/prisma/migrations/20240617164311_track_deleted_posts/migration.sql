-- CreateTable
CREATE TABLE "DeletedPost" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeletedPost_pkey" PRIMARY KEY ("id")
);
