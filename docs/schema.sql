-- ============================================================
-- Event Booking System - Database Schema
-- MySQL 8.0+
-- ============================================================

CREATE DATABASE IF NOT EXISTS `event_booking_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `event_booking_db`;

-- ── Users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `users` (
  `id`         INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(100)     NOT NULL,
  `email`      VARCHAR(150)     NOT NULL,
  `password`   VARCHAR(255)     NOT NULL,
  `createdAt`  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Events ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `events` (
  `id`                INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `title`             VARCHAR(200)     NOT NULL,
  `description`       TEXT,
  `date`              DATETIME         NOT NULL,
  `total_capacity`    INT UNSIGNED     NOT NULL,
  `remaining_tickets` INT UNSIGNED     NOT NULL,
  `createdAt`         DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`         DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_events_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Bookings ─────────────────────────────────────────────────
-- booking_code is a UUID assigned on confirmation.
-- Indexed on user_id and event_id for fast lookups.
-- SELECT ... FOR UPDATE on events.remaining_tickets prevents race conditions.
CREATE TABLE IF NOT EXISTS `bookings` (
  `id`           INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  `user_id`      INT UNSIGNED   NOT NULL,
  `event_id`     INT UNSIGNED   NOT NULL,
  `booking_date` DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `booking_code` VARCHAR(36)    NOT NULL COMMENT 'Unique UUID given to user post-booking',
  `tickets_count` INT UNSIGNED  NOT NULL DEFAULT 1,
  `status`       ENUM('confirmed','cancelled') NOT NULL DEFAULT 'confirmed',
  `createdAt`    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_bookings_code` (`booking_code`),
  KEY `idx_bookings_user_id`  (`user_id`),
  KEY `idx_bookings_event_id` (`event_id`),
  CONSTRAINT `fk_bookings_user`  FOREIGN KEY (`user_id`)  REFERENCES `users`  (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bookings_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Event Attendance ─────────────────────────────────────────
-- One attendance record per booking (UNIQUE on booking_id prevents double check-in).
CREATE TABLE IF NOT EXISTS `event_attendance` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`    INT UNSIGNED NOT NULL,
  `event_id`   INT UNSIGNED NOT NULL,
  `booking_id` INT UNSIGNED NOT NULL,
  `entry_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdAt`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_attendance_booking` (`booking_id`),
  KEY `idx_attendance_user_id`  (`user_id`),
  KEY `idx_attendance_event_id` (`event_id`),
  CONSTRAINT `fk_attendance_user`    FOREIGN KEY (`user_id`)    REFERENCES `users`    (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_attendance_event`   FOREIGN KEY (`event_id`)   REFERENCES `events`   (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_attendance_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Sample Seed Data ─────────────────────────────────────────
INSERT INTO `users` (`name`, `email`, `password`) VALUES
  ('Alice Johnson', 'alice@example.com', '$2a$12$placeholderHashReplaceWithBcrypt'),
  ('Bob Smith',     'bob@example.com',   '$2a$12$placeholderHashReplaceWithBcrypt');

INSERT INTO `events` (`title`, `description`, `date`, `total_capacity`, `remaining_tickets`) VALUES
  ('Tech Summit 2025',    'Annual technology conference',   DATE_ADD(NOW(), INTERVAL 30 DAY),  200, 200),
  ('Node.js Workshop',    'Hands-on Node.js training',      DATE_ADD(NOW(), INTERVAL 15 DAY),   50,  50),
  ('Startup Pitch Night', 'Entrepreneurs pitch to VCs',     DATE_ADD(NOW(), INTERVAL 7  DAY),  100, 100);
