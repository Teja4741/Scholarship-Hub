-- Create database
CREATE DATABASE IF NOT EXISTS gradious_scholar_hub;
USE gradious_scholar_hub;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'admin') DEFAULT 'student',
  firstName VARCHAR(100),
  lastName VARCHAR(100),
  phone VARCHAR(20),
  dateOfBirth DATE,
  profileImage VARCHAR(500),
  isActive BOOLEAN DEFAULT TRUE,
  emailVerified BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Scholarships table
CREATE TABLE IF NOT EXISTS scholarships (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type ENUM('Medical', 'Engineering', 'Degree', 'Diploma', 'ITI') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  deadline DATE NOT NULL,
  eligibility JSON NOT NULL,
  benefits JSON NOT NULL,
  documentsRequired JSON NOT NULL,
  provider VARCHAR(255),
  location VARCHAR(255),
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT,
  scholarshipId INT NOT NULL,
  studentName VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  dateOfBirth DATE NOT NULL,
  address TEXT,
  nationality VARCHAR(100),
  category ENUM('general', 'obc', 'sc', 'st', 'ews') NOT NULL,
  marks DECIMAL(5,2) NOT NULL,
  gpa DECIMAL(4,2),
  familyIncome DECIMAL(10,2) NOT NULL,
  course VARCHAR(255) NOT NULL,
  degree VARCHAR(255),
  yearOfStudy VARCHAR(50),
  fieldOfStudy VARCHAR(255),
  graduationDate DATE,
  institution VARCHAR(255) NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'under_review') DEFAULT 'pending',
  submittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewedAt TIMESTAMP NULL,
  reviewerNotes TEXT,
  installmentPlan ENUM('monthly', 'quarterly', 'semiannual', 'annual'),
  installmentAmount DECIMAL(10,2),
  installmentDuration INT,
  scholarshipAmount DECIMAL(10,2),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (scholarshipId) REFERENCES scholarships(id) ON DELETE CASCADE
);

-- User saved scholarships
CREATE TABLE IF NOT EXISTS user_saved_scholarships (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  scholarshipId INT NOT NULL,
  savedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (scholarshipId) REFERENCES scholarships(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_scholarship (userId, scholarshipId)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  type ENUM('application_status', 'deadline_reminder', 'new_scholarship', 'system') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  isRead BOOLEAN DEFAULT FALSE,
  data JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Documents table for file uploads
CREATE TABLE IF NOT EXISTS documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  applicationId INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  originalname VARCHAR(255) NOT NULL,
  mimetype VARCHAR(100) NOT NULL,
  size INT NOT NULL,
  url VARCHAR(500) NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  extractedText TEXT,
  verifiedAt TIMESTAMP NULL,
  verificationNotes TEXT,
  uploadedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (applicationId) REFERENCES applications(id) ON DELETE CASCADE
);

-- Reviews and ratings
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  scholarshipId INT NOT NULL,
  userId INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  isVerified BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (scholarshipId) REFERENCES scholarships(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_review (userId, scholarshipId)
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT,
  action VARCHAR(100) NOT NULL,
  entityType VARCHAR(50) NOT NULL,
  entityId INT,
  details JSON,
  ipAddress VARCHAR(45),
  userAgent TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert sample scholarship data
INSERT INTO scholarships (name, description, type, amount, deadline, eligibility, benefits, documentsRequired, provider, location) VALUES
('Medical Excellence Scholarship', 'For outstanding medical students pursuing MBBS', 'Medical', 50000.00, '2025-12-31', '{"minimumMarks": 85, "maximumIncome": 500000, "ageLimit": 25}', '["Full tuition coverage", "Monthly stipend of ₹5000", "Research grant of ₹25000 annually"]', '["Marksheet", "Income certificate", "Admission letter", "Medical fitness certificate"]', 'Government of India', 'All India'),
('Engineering Innovation Grant', 'Supporting engineering students with innovative projects', 'Engineering', 75000.00, '2025-08-15', '{"minimumMarks": 80, "maximumIncome": 600000}', '["Tuition fee waiver", "Project funding up to ₹50000", "Internship opportunities"]', '["Academic transcripts", "Income proof", "Project proposal", "Recommendation letter"]', 'Ministry of Education', 'All India'),
('Degree Excellence Program', 'Merit-based scholarship for degree courses', 'Degree', 30000.00, '2025-09-30', '{"minimumMarks": 75, "maximumIncome": 400000}', '["Annual scholarship of ₹30000", "Book allowance of ₹5000"]', '["Marksheet", "Fee receipt", "Bank details", "Aadhaar card"]', 'State Government', 'All States'),
('Diploma Skill Development', 'For diploma students in technical fields', 'Diploma', 25000.00, '2025-07-31', '{"minimumMarks": 70, "maximumIncome": 300000}', '["Course fee support", "Tool kit worth ₹10000"]', '["Diploma certificate", "Income certificate", "Course details"]', 'Technical Education Board', 'All India'),
('ITI Training Support', 'Financial aid for ITI students', 'ITI', 15000.00, '2025-06-30', '{"minimumMarks": 60, "maximumIncome": 250000}', '["Training fee waiver", "Monthly stipend during training"]', '["ITI admission letter", "Previous marksheet", "Family income proof"]', 'Skill Development Ministry', 'All India');

-- Insert sample admin user (password: admin123)

