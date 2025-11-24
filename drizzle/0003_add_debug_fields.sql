-- Add debugging and error tracking fields to orcid_searches table
ALTER TABLE `orcid_searches` ADD COLUMN `errorMessage` text;
ALTER TABLE `orcid_searches` ADD COLUMN `searchedAt` timestamp;
ALTER TABLE `orcid_searches` ADD COLUMN `debugHtml` text;
ALTER TABLE `orcid_searches` ADD COLUMN `debugInfo` text;
