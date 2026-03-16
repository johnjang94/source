-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "aiInvolvement" TEXT,
ADD COLUMN     "currentFrustrations" TEXT,
ADD COLUMN     "dependencies" TEXT,
ADD COLUMN     "desiredFeatures" TEXT,
ADD COLUMN     "kpis" TEXT,
ADD COLUMN     "projectStage" TEXT,
ADD COLUMN     "regulatoryRequirements" TEXT,
ADD COLUMN     "stakeholders" TEXT,
ADD COLUMN     "successMetrics" TEXT,
ADD COLUMN     "targetAudience" TEXT,
ADD COLUMN     "technicalConstraints" TEXT,
ADD COLUMN     "triedSolutions" TEXT;

-- AlterTable
ALTER TABLE "ProjectIntake" ADD COLUMN     "aiInvolvement" TEXT,
ADD COLUMN     "currentFrustrations" TEXT,
ADD COLUMN     "dependencies" TEXT,
ADD COLUMN     "desiredFeatures" TEXT,
ADD COLUMN     "kpis" TEXT,
ADD COLUMN     "projectStage" TEXT,
ADD COLUMN     "regulatoryRequirements" TEXT,
ADD COLUMN     "stakeholders" TEXT,
ADD COLUMN     "successMetrics" TEXT,
ADD COLUMN     "targetAudience" TEXT,
ADD COLUMN     "technicalConstraints" TEXT,
ADD COLUMN     "triedSolutions" TEXT;
