-- Add uploadSessionId column to researchers table
ALTER TABLE `researchers` ADD COLUMN `uploadSessionId` int NOT NULL;

-- Create index for faster queries by session
CREATE INDEX `idx_researchers_upload_session` ON `researchers` (`uploadSessionId`);
