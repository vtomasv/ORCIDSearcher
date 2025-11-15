CREATE TABLE `institutions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`canonical` varchar(255) NOT NULL,
	`country` varchar(100),
	`countryCode` varchar(10),
	`orcidRegistryName` varchar(255),
	`variants` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `institutions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orcid_searches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`researcherId` int NOT NULL,
	`status` enum('pending','searching','found','multiple','not_found','manual') NOT NULL DEFAULT 'pending',
	`orcid` varchar(19),
	`resultCount` int DEFAULT 0,
	`searchUrl` text,
	`strategyUsed` varchar(50),
	`multipleResults` text,
	`needsReview` boolean DEFAULT false,
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orcid_searches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `researchers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`firstName` varchar(255) NOT NULL,
	`lastName` varchar(255) NOT NULL,
	`firstNameNormalized` varchar(255) NOT NULL,
	`lastNameNormalized` varchar(255) NOT NULL,
	`institution` varchar(255),
	`email` varchar(320),
	`country` varchar(100),
	`originalData` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `researchers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `upload_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`filename` varchar(255) NOT NULL,
	`totalResearchers` int NOT NULL,
	`processedCount` int DEFAULT 0,
	`foundCount` int DEFAULT 0,
	`multipleCount` int DEFAULT 0,
	`notFoundCount` int DEFAULT 0,
	`status` enum('uploading','processing','completed','failed') NOT NULL DEFAULT 'uploading',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`completedAt` timestamp,
	CONSTRAINT `upload_sessions_id` PRIMARY KEY(`id`)
);
