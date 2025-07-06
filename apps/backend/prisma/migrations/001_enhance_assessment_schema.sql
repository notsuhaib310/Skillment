-- Migration: Enhance Assessment Schema for Advanced Features
-- Description: Add support for enhanced assessment builder features including 
-- better question data structure, AI metadata, and additional assessment fields

BEGIN;

-- Add new fields to Assessment table
ALTER TABLE "Assessment" 
ADD COLUMN IF NOT EXISTS "instructions" TEXT,
ADD COLUMN IF NOT EXISTS "passingMarks" INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS "showCorrectAnswers" BOOLEAN DEFAULT FALSE;

-- Add new fields to Question table for enhanced data structure
ALTER TABLE "Question"
ADD COLUMN IF NOT EXISTS "mcqData" JSONB,
ADD COLUMN IF NOT EXISTS "codingData" JSONB,
ADD COLUMN IF NOT EXISTS "aiMetadata" JSONB;

-- Update existing data to set default values for new non-nullable fields
UPDATE "Assessment" 
SET "passingMarks" = 60 
WHERE "passingMarks" IS NULL;

UPDATE "Assessment" 
SET "showCorrectAnswers" = FALSE 
WHERE "showCorrectAnswers" IS NULL;

-- Add indexes for better query performance on new JSONB fields
CREATE INDEX IF NOT EXISTS "idx_question_mcq_data" ON "Question" USING GIN ("mcqData");
CREATE INDEX IF NOT EXISTS "idx_question_coding_data" ON "Question" USING GIN ("codingData");
CREATE INDEX IF NOT EXISTS "idx_question_ai_metadata" ON "Question" USING GIN ("aiMetadata");

-- Add index for assessment instructions for search functionality
CREATE INDEX IF NOT EXISTS "idx_assessment_instructions" ON "Assessment" USING GIN (to_tsvector('english', "instructions"));

COMMIT; 