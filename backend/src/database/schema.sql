-- Initial schema for the scheduling system.
-- Table order follows foreign key dependencies:
-- 1. users, plans
-- 2. subscriptions
-- 3. availability_rules, availability_exceptions
-- 4. booking_requests, plan_requests
-- 5. bookings
-- 6. calendar_slots

SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(150) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'student') NOT NULL,
  phone VARCHAR(30) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_username (username),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role (role),
  KEY idx_users_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS plans (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  total_classes INT UNSIGNED NOT NULL,
  classes_per_week TINYINT UNSIGNED NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  price_per_class DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_plans_name (name),
  KEY idx_plans_is_active (is_active),
  CONSTRAINT chk_plans_total_classes CHECK (total_classes > 0),
  CONSTRAINT chk_plans_classes_per_week CHECK (classes_per_week > 0),
  CONSTRAINT chk_plans_price CHECK (price >= 0),
  CONSTRAINT chk_plans_price_per_class CHECK (price_per_class >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS system_settings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  setting_key VARCHAR(120) NOT NULL,
  setting_value TEXT NULL,
  value_type VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_system_settings_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS subscriptions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  student_id BIGINT UNSIGNED NOT NULL,
  plan_id BIGINT UNSIGNED NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_classes INT UNSIGNED NOT NULL,
  remaining_classes INT UNSIGNED NOT NULL,
  status ENUM('active', 'completed', 'cancelled', 'expired') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_subscriptions_student_status (student_id, status),
  KEY idx_subscriptions_plan_status (plan_id, status),
  KEY idx_subscriptions_period (start_date, end_date),
  CONSTRAINT fk_subscriptions_student
    FOREIGN KEY (student_id) REFERENCES users (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_subscriptions_plan
    FOREIGN KEY (plan_id) REFERENCES plans (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT chk_subscriptions_period CHECK (start_date <= end_date),
  CONSTRAINT chk_subscriptions_total_classes CHECK (total_classes > 0),
  CONSTRAINT chk_subscriptions_remaining_classes CHECK (
    remaining_classes <= total_classes
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS availability_rules (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  weekday TINYINT UNSIGNED NOT NULL COMMENT '0 = Monday, 6 = Sunday',
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes SMALLINT UNSIGNED NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_availability_rules_user_slot (user_id, weekday, start_time, end_time),
  KEY idx_availability_rules_user_weekday_active (user_id, weekday, is_active),
  CONSTRAINT fk_availability_rules_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT chk_availability_rules_weekday CHECK (weekday BETWEEN 0 AND 6),
  CONSTRAINT chk_availability_rules_time_range CHECK (start_time < end_time),
  CONSTRAINT chk_availability_rules_duration CHECK (slot_duration_minutes > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS availability_exceptions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  exception_date DATE NOT NULL,
  type ENUM('block_full_day', 'block_time_range', 'extra_time_range', 'custom_time_range') NOT NULL,
  start_time TIME NULL,
  end_time TIME NULL,
  reason VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_availability_exceptions_user_date (user_id, exception_date),
  KEY idx_availability_exceptions_type_date (type, exception_date),
  CONSTRAINT fk_availability_exceptions_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT chk_availability_exceptions_time_range CHECK (
    (
      type = 'block_full_day'
      AND start_time IS NULL
      AND end_time IS NULL
    ) OR (
      type <> 'block_full_day'
      AND start_time IS NOT NULL
      AND end_time IS NOT NULL
      AND start_time < end_time
    )
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS booking_requests (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  student_id BIGINT UNSIGNED NOT NULL,
  teacher_id BIGINT UNSIGNED NOT NULL,
  requested_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending',
  student_message TEXT NULL,
  admin_message TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_booking_requests_student_status (student_id, status),
  KEY idx_booking_requests_teacher_status_date (teacher_id, status, requested_date),
  KEY idx_booking_requests_requested_date (requested_date),
  CONSTRAINT fk_booking_requests_student
    FOREIGN KEY (student_id) REFERENCES users (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_booking_requests_teacher
    FOREIGN KEY (teacher_id) REFERENCES users (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT chk_booking_requests_time_range CHECK (start_time < end_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS plan_requests (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  student_id BIGINT UNSIGNED NOT NULL,
  plan_id BIGINT UNSIGNED NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_plan_requests_student_status (student_id, status),
  KEY idx_plan_requests_plan_status (plan_id, status),
  CONSTRAINT fk_plan_requests_student
    FOREIGN KEY (student_id) REFERENCES users (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_plan_requests_plan
    FOREIGN KEY (plan_id) REFERENCES plans (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bookings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  booking_request_id BIGINT UNSIGNED NOT NULL,
  student_id BIGINT UNSIGNED NOT NULL,
  teacher_id BIGINT UNSIGNED NOT NULL,
  subscription_id BIGINT UNSIGNED NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status ENUM('confirmed', 'cancelled', 'completed', 'no_show') NOT NULL DEFAULT 'confirmed',
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_bookings_request (booking_request_id),
  KEY idx_bookings_student_status_date (student_id, status, booking_date),
  KEY idx_bookings_teacher_status_date (teacher_id, status, booking_date),
  KEY idx_bookings_subscription (subscription_id),
  CONSTRAINT fk_bookings_request
    FOREIGN KEY (booking_request_id) REFERENCES booking_requests (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_bookings_student
    FOREIGN KEY (student_id) REFERENCES users (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_bookings_teacher
    FOREIGN KEY (teacher_id) REFERENCES users (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_bookings_subscription
    FOREIGN KEY (subscription_id) REFERENCES subscriptions (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT chk_bookings_time_range CHECK (start_time < end_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS calendar_slots (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status ENUM('available', 'blocked', 'pending', 'booked') NOT NULL DEFAULT 'available',
  booking_request_id BIGINT UNSIGNED NULL,
  booking_id BIGINT UNSIGNED NULL,
  source ENUM('rule', 'exception', 'manual') NOT NULL DEFAULT 'rule',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_calendar_slots_user_datetime (user_id, slot_date, start_time, end_time),
  UNIQUE KEY uq_calendar_slots_booking_request (booking_request_id),
  UNIQUE KEY uq_calendar_slots_booking (booking_id),
  KEY idx_calendar_slots_user_status_date (user_id, status, slot_date),
  KEY idx_calendar_slots_date_status (slot_date, status),
  CONSTRAINT fk_calendar_slots_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_calendar_slots_booking_request
    FOREIGN KEY (booking_request_id) REFERENCES booking_requests (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT fk_calendar_slots_booking
    FOREIGN KEY (booking_id) REFERENCES bookings (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT chk_calendar_slots_time_range CHECK (start_time < end_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE bookings
  MODIFY subscription_id BIGINT UNSIGNED NULL;

INSERT INTO plans (name, total_classes, classes_per_week, price, price_per_class)
VALUES
  ('Pacote mensal 4 aulas', 4, 1, 110.00, 27.00),
  ('Pacote mensal 8 aulas', 8, 2, 200.00, 25.00),
  ('Pacote mensal 12 aulas', 12, 3, 300.00, 25.00),
  ('Pacote mensal 20 aulas', 20, 5, 420.00, 21.00)
ON DUPLICATE KEY UPDATE
  total_classes = VALUES(total_classes),
  classes_per_week = VALUES(classes_per_week),
  price = VALUES(price),
  price_per_class = VALUES(price_per_class),
  updated_at = CURRENT_TIMESTAMP;
