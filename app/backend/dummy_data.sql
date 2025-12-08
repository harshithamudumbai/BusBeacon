-- ============================================
-- GPS SMART BUS SYSTEM - DUMMY DATA
-- Run this SQL to populate tables for API testing
-- ============================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- ============================================
-- 1. SCHOOLS (base_schoolname)
-- ============================================
INSERT INTO `base_schoolname` (`schoolid`, `schoolname`, `sname`, `code`, `urlval`, `address1`, `address2`, `area`, `city`, `pincode`, `telephone`, `mobile`, `email`, `website`, `cestructureid`, `senderid`, `sms_username`, `sms_password`, `sms_clientid`, `campus_website`, `headerlink`, `logoposition`, `additionalheader`, `print_college_header`, `sendsms`, `smsprovider`, `senderemail`, `stulogin_support`, `sentfrom`, `paymentdue`, `coesignature`, `principalsignature`, `systemflag`, `whatsapp_credentials`) VALUES
(1, 'Devakul International School', 'DIS', 'DIS', 'https://dis.edu.in', 'Road No 36', 'Jubilee Hills', 'Jubilee Hills', 'Hyderabad', 500033, '040-12345678', '9876543000', 'info@dis.edu.in', 'www.dis.edu.in', 1, 'DISSCH', 'smsuser', 'smspass', 'client1', 'https://campus.dis.edu.in', '', 'left', '', '', 1, 'provider1', 'noreply@dis.edu.in', 1, 'DIS Admin', 30, '', '', 1, ''),
(2, 'XYZ Academy', 'XYZ', 'XYZ', 'https://xyz.edu.in', 'Road No 12', 'Banjara Hills', 'Banjara Hills', 'Hyderabad', 500034, '040-87654321', '9876543001', 'info@xyz.edu.in', 'www.xyz.edu.in', 1, 'XYZSCH', 'smsuser2', 'smspass2', 'client2', 'https://campus.xyz.edu.in', '', 'left', '', '', 1, 'provider1', 'noreply@xyz.edu.in', 1, 'XYZ Admin', 30, '', '', 0, '');

-- ============================================
-- 2. USER ROLES (base_user_roles)
-- ============================================
INSERT INTO `base_user_roles` (`id`, `userrole`, `academicflag`, `attendanceflag`, `classteacherflag`) VALUES
(1, 'Super Admin', 0, 0, 0),
(2, 'Transport Manager', 0, 0, 0),
(3, 'Office Admin', 0, 0, 0),
(4, 'Bus Attender', 0, 0, 0),
(5, 'Parent', 0, 0, 0),
(6, 'Student', 1, 1, 0),
(7, 'Driver', 0, 0, 0);

-- ============================================
-- 3. USERS (jos_users)
-- Staff: userrole = 1,2,3,4,7
-- Students: userrole = 6
-- Parents: userrole = 5
-- ============================================
INSERT INTO `jos_users` (`id`, `schoolid`, `deptid`, `rollnumber`, `sapid`, `eventstatus`, `userrole`, `encrypturl`, `name`, `username`, `email`, `mobile`, `password`, `pwd`, `usertype`, `block`, `sendEmail`, `gid`, `registerDate`, `lastvisitDate`, `activation`, `params`, `whatsappenabled`) VALUES
-- Super Admin
(1, 1, 0, '', '', 0, '1', 'enc_superadmin', 'Admin User', 'superadmin', 'admin@dis.edu.in', 9999999999, 'hashed_pwd', 'Admin@123', 'Administrator', 0, 1, 1, '2024-01-01 00:00:00', '2025-12-08 10:00:00', '', '', 1),

-- Transport Managers
(2, 1, 0, '', '', 0, '2', 'enc_umadevi', 'Uma Devi', 'umadevi', 'uma@dis.edu.in', 9087654321, 'hashed_pwd', 'Uma@123', 'Staff', 0, 1, 1, '2024-01-01 00:00:00', '2025-12-08 09:00:00', '', '', 1),
(3, 1, 0, '', '', 0, '2', 'enc_vikram', 'Vikram Singh', 'vikramsingh', 'vikram@dis.edu.in', 9123456789, 'hashed_pwd', 'Vikram@123', 'Staff', 0, 1, 1, '2024-01-01 00:00:00', '2025-12-08 09:30:00', '', '', 1),

-- Office Admins
(4, 1, 0, '', '', 0, '3', 'enc_sunita', 'Sunita Rao', 'sunitarao', 'sunita@dis.edu.in', 8097654321, 'hashed_pwd', 'Sunita@123', 'Staff', 0, 1, 1, '2024-01-01 00:00:00', '2025-12-08 08:00:00', '', '', 1),
(5, 1, 0, '', '', 0, '3', 'enc_priya', 'Priya Sharma', 'priyasharma', 'priya@dis.edu.in', 9876543210, 'hashed_pwd', 'Priya@123', 'Staff', 0, 1, 1, '2024-01-01 00:00:00', '2025-12-08 08:30:00', '', '', 1),

-- Bus Attenders
(6, 1, 0, '', '', 0, '4', 'enc_raju', 'Raju Kumar', 'rajukumar', 'raju@dis.edu.in', 9014536201, 'hashed_pwd', 'Raju@123', 'Staff', 0, 1, 1, '2024-01-01 00:00:00', '2025-12-08 06:00:00', '', '', 1),
(7, 1, 0, '', '', 0, '4', 'enc_suresh', 'Suresh Babu', 'sureshbabu', 'suresh@dis.edu.in', 9014536202, 'hashed_pwd', 'Suresh@123', 'Staff', 0, 1, 1, '2024-01-01 00:00:00', '2025-12-08 06:00:00', '', '', 1),
(8, 1, 0, '', '', 0, '4', 'enc_ramesh', 'Ramesh Naidu', 'rameshnaidu', 'ramesh@dis.edu.in', 9014536203, 'hashed_pwd', 'Ramesh@123', 'Staff', 0, 1, 1, '2024-01-01 00:00:00', '2025-12-08 06:00:00', '', '', 1),

-- Drivers
(9, 1, 0, '', '', 0, '7', 'enc_venkat', 'Venkat Sharma', 'venkatsharma', 'venkat@dis.edu.in', 9876543001, 'hashed_pwd', 'Venkat@123', 'Staff', 0, 1, 1, '2024-01-01 00:00:00', '2025-12-08 06:00:00', '', '', 1),
(10, 1, 0, '', '', 0, '7', 'enc_ravi', 'Ravi Kumar', 'ravikumar', 'ravi@dis.edu.in', 9876543002, 'hashed_pwd', 'Ravi@123', 'Staff', 0, 1, 1, '2024-01-01 00:00:00', '2025-12-08 06:00:00', '', '', 1),
(11, 1, 0, '', '', 0, '7', 'enc_sureshd', 'Suresh Reddy', 'sureshreddy', 'sureshd@dis.edu.in', 9876543003, 'hashed_pwd', 'Suresh@123', 'Staff', 0, 1, 1, '2024-01-01 00:00:00', '2025-12-08 06:00:00', '', '', 1),

-- Students (userrole = 6)
(101, 1, 1, '5A-101', 'SAP101', 0, '6', 'enc_arjun', 'Arjun Sharma', 'arjunsharma', 'arjun@student.dis.edu.in', 9876540101, 'hashed_pwd', 'Arjun@123', 'Student', 0, 0, 1, '2024-06-01 00:00:00', '2025-12-08 07:00:00', '', '', 0),
(102, 1, 1, '4B-102', 'SAP102', 0, '6', 'enc_priyap', 'Priya Patel', 'priyapatel', 'priya@student.dis.edu.in', 9876540102, 'hashed_pwd', 'Priya@123', 'Student', 0, 0, 1, '2024-06-01 00:00:00', '2025-12-08 07:00:00', '', '', 0),
(103, 1, 1, '6A-103', 'SAP103', 0, '6', 'enc_rahul', 'Rahul Verma', 'rahulverma', 'rahul@student.dis.edu.in', 9876540103, 'hashed_pwd', 'Rahul@123', 'Student', 0, 0, 1, '2024-06-01 00:00:00', '2025-12-08 07:00:00', '', '', 0),
(104, 1, 1, '5B-104', 'SAP104', 0, '6', 'enc_sneha', 'Sneha Reddy', 'snehareddy', 'sneha@student.dis.edu.in', 9876540104, 'hashed_pwd', 'Sneha@123', 'Student', 0, 0, 1, '2024-06-01 00:00:00', '2025-12-08 07:00:00', '', '', 0),
(105, 1, 1, '7A-105', 'SAP105', 0, '6', 'enc_karan', 'Karan Gupta', 'karangupta', 'karan@student.dis.edu.in', 9876540105, 'hashed_pwd', 'Karan@123', 'Student', 0, 0, 1, '2024-06-01 00:00:00', '2025-12-08 07:00:00', '', '', 0),
(106, 1, 1, '6B-106', 'SAP106', 0, '6', 'enc_ananya', 'Ananya Iyer', 'ananyaiyer', 'ananya@student.dis.edu.in', 9876540106, 'hashed_pwd', 'Ananya@123', 'Student', 0, 0, 1, '2024-06-01 00:00:00', '2025-12-08 07:00:00', '', '', 0),
(107, 1, 1, '8A-107', 'SAP107', 0, '6', 'enc_rohan', 'Rohan Kumar', 'rohankumar', 'rohan@student.dis.edu.in', 9876540107, 'hashed_pwd', 'Rohan@123', 'Student', 0, 0, 1, '2024-06-01 00:00:00', '2025-12-08 07:00:00', '', '', 0),
(108, 1, 1, '8B-108', 'SAP108', 0, '6', 'enc_kavya', 'Kavya Nair', 'kavyanair', 'kavya@student.dis.edu.in', 9876540108, 'hashed_pwd', 'Kavya@123', 'Student', 0, 0, 1, '2024-06-01 00:00:00', '2025-12-08 07:00:00', '', '', 0),
(109, 1, 1, '3A-109', 'SAP109', 0, '6', 'enc_aditya', 'Aditya Menon', 'adityamenon', 'aditya@student.dis.edu.in', 9876540109, 'hashed_pwd', 'Aditya@123', 'Student', 0, 0, 1, '2024-06-01 00:00:00', '2025-12-08 07:00:00', '', '', 0),
(110, 1, 1, '4A-110', 'SAP110', 0, '6', 'enc_meera', 'Meera Singh', 'meerasingh', 'meera@student.dis.edu.in', 9876540110, 'hashed_pwd', 'Meera@123', 'Student', 0, 0, 1, '2024-06-01 00:00:00', '2025-12-08 07:00:00', '', '', 0),
(111, 1, 1, '5A-111', 'SAP111', 0, '6', 'enc_harsh', 'Harsh Mehta', 'harshmehta', 'harsh@student.dis.edu.in', 9876540111, 'hashed_pwd', 'Harsh@123', 'Student', 0, 0, 1, '2024-06-01 00:00:00', '2025-12-08 07:00:00', '', '', 0),
(112, 1, 1, '6A-112', 'SAP112', 0, '6', 'enc_nandini', 'Nandini Rao', 'nandinirao', 'nandini@student.dis.edu.in', 9876540112, 'hashed_pwd', 'Nandini@123', 'Student', 0, 0, 1, '2024-06-01 00:00:00', '2025-12-08 07:00:00', '', '', 0),

-- Parents (userrole = 5) - linked to students via mobile
(201, 1, 0, '', '', 0, '5', 'enc_rajesh', 'Rajesh Sharma', 'rajeshsharma', 'rajesh@parent.dis.edu.in', 9876543210, 'hashed_pwd', 'Rajesh@123', 'Parent', 0, 0, 1, '2024-06-01 00:00:00', '2025-12-08 08:00:00', '', '', 1),
(202, 1, 0, '', '', 0, '5', 'enc_amit', 'Amit Patel', 'amitpatel', 'amit@parent.dis.edu.in', 9876543211, 'hashed_pwd', 'Amit@123', 'Parent', 0, 0, 1, '2024-06-01 00:00:00', '2025-12-08 08:00:00', '', '', 1),
(203, 1, 0, '', '', 0, '5', 'enc_vikramv', 'Vikram Verma', 'vikramverma', 'vikramv@parent.dis.edu.in', 9876543212, 'hashed_pwd', 'Vikram@123', 'Parent', 0, 0, 1, '2024-06-01 00:00:00', '2025-12-08 08:00:00', '', '', 1),
(204, 1, 0, '', '', 0, '5', 'enc_sureshr', 'Suresh Reddy', 'sureshreddy_p', 'sureshr@parent.dis.edu.in', 9876543213, 'hashed_pwd', 'Suresh@123', 'Parent', 0, 0, 1, '2024-06-01 00:00:00', '2025-12-08 08:00:00', '', '', 1),
(205, 1, 0, '', '', 0, '5', 'enc_rameshg', 'Ramesh Gupta', 'rameshgupta', 'rameshg@parent.dis.edu.in', 9876543214, 'hashed_pwd', 'Ramesh@123', 'Parent', 0, 0, 1, '2024-06-01 00:00:00', '2025-12-08 08:00:00', '', '', 1),
(206, 1, 0, '', '', 0, '5', 'enc_venkati', 'Venkat Iyer', 'venkatiyer', 'venkati@parent.dis.edu.in', 9876543215, 'hashed_pwd', 'Venkat@123', 'Parent', 0, 0, 1, '2024-06-01 00:00:00', '2025-12-08 08:00:00', '', '', 1);

-- ============================================
-- 4. SECTIONS (base_sections) - Class/Section
-- ============================================
INSERT INTO `base_sections` (`id`, `mastersectionid`, `schoolid`, `deptid`, `alternatedeptid`, `programid`, `seccatid`, `name`, `aliasname`, `published`, `yearord`, `yearname`, `cestructureid`, `subsection`, `placementsflag`, `dummysection`, `gradetype`) VALUES
(1, NULL, 1, 1, 0, 1, 1, 'Class 3 - Section A', '3A', 1, 3, '3rd', 1, 'A', 0, 0, 1),
(2, NULL, 1, 1, 0, 1, 1, 'Class 3 - Section B', '3B', 1, 3, '3rd', 1, 'B', 0, 0, 1),
(3, NULL, 1, 1, 0, 1, 1, 'Class 4 - Section A', '4A', 1, 4, '4th', 1, 'A', 0, 0, 1),
(4, NULL, 1, 1, 0, 1, 1, 'Class 4 - Section B', '4B', 1, 4, '4th', 1, 'B', 0, 0, 1),
(5, NULL, 1, 1, 0, 1, 1, 'Class 5 - Section A', '5A', 1, 5, '5th', 1, 'A', 0, 0, 1),
(6, NULL, 1, 1, 0, 1, 1, 'Class 5 - Section B', '5B', 1, 5, '5th', 1, 'B', 0, 0, 1),
(7, NULL, 1, 1, 0, 1, 1, 'Class 6 - Section A', '6A', 1, 6, '6th', 1, 'A', 0, 0, 1),
(8, NULL, 1, 1, 0, 1, 1, 'Class 6 - Section B', '6B', 1, 6, '6th', 1, 'B', 0, 0, 1),
(9, NULL, 1, 1, 0, 1, 1, 'Class 7 - Section A', '7A', 1, 7, '7th', 1, 'A', 0, 0, 1),
(10, NULL, 1, 1, 0, 1, 1, 'Class 8 - Section A', '8A', 1, 8, '8th', 1, 'A', 0, 0, 1),
(11, NULL, 1, 1, 0, 1, 1, 'Class 8 - Section B', '8B', 1, 8, '8th', 1, 'B', 0, 0, 1);

-- ============================================
-- 5. BUS ASSETS (base_bus_assets)
-- ============================================
INSERT INTO `base_bus_assets` (`id`, `schoolid`, `assetname`, `chassisnumber`, `capacity`, `status`) VALUES
(1, 1, 'TS09EK3274', 'CHAS2024001', 40, 1),
(2, 1, 'TS09EK5678', 'CHAS2024002', 35, 1),
(3, 1, 'TS09EK9012', 'CHAS2024003', 30, 0),
(4, 1, 'TS09EK1234', 'CHAS2024004', 45, 1),
(5, 2, 'TS09EK5555', 'CHAS2024005', 40, 1);

-- ============================================
-- 6. BUS ROUTES (base_bus_routes)
-- routetype: 1 = pickup, 2 = dropoff
-- ============================================
INSERT INTO `base_bus_routes` (`id`, `schoolid`, `bus_asset_id`, `route`, `start_date`, `end_date`, `routetype`, `createdby`, `createdon`, `modifiedby`, `modifiedon`, `displayorder`) VALUES
-- Route 12 - Pickup
(1, 1, 1, 'Route 12 - Pickup', '2024-06-01', '2025-05-31', 1, 1, '2024-06-01 00:00:00', 1, '2024-06-01 00:00:00', 1),
-- Route 12 - Dropoff
(2, 1, 1, 'Route 12 - Dropoff', '2024-06-01', '2025-05-31', 2, 1, '2024-06-01 00:00:00', 1, '2024-06-01 00:00:00', 2),
-- Route 15 - Pickup
(3, 1, 2, 'Route 15 - Pickup', '2024-06-01', '2025-05-31', 1, 1, '2024-06-01 00:00:00', 1, '2024-06-01 00:00:00', 3),
-- Route 15 - Dropoff
(4, 1, 2, 'Route 15 - Dropoff', '2024-06-01', '2025-05-31', 2, 1, '2024-06-01 00:00:00', 1, '2024-06-01 00:00:00', 4),
-- Route 20 - Pickup
(5, 1, 4, 'Route 20 - Pickup', '2024-06-01', '2025-05-31', 1, 1, '2024-06-01 00:00:00', 1, '2024-06-01 00:00:00', 5),
-- Route 20 - Dropoff
(6, 1, 4, 'Route 20 - Dropoff', '2024-06-01', '2025-05-31', 2, 1, '2024-06-01 00:00:00', 1, '2024-06-01 00:00:00', 6);

-- ============================================
-- 7. BUS STOPS/STAGES (base_bus_stages)
-- ============================================
INSERT INTO `base_bus_stages` (`id`, `routeid`, `stagenumber`, `stage`, `latitude`, `longitude`, `scheduledtime`) VALUES
-- Route 12 Pickup Stops (routeid = 1)
(1, 1, 1, 'Green Park Colony', 17.4156000, 78.4347000, '06:30:00'),
(2, 1, 2, 'Hauz Khas Village', 17.4167000, 78.4389000, '06:45:00'),
(3, 1, 3, 'Malviya Nagar', 17.4234000, 78.4456000, '07:00:00'),
(4, 1, 4, 'Saket', 17.4312000, 78.4523000, '07:15:00'),
(5, 1, 5, 'School Main Gate', 17.4456000, 78.4634000, '07:30:00'),

-- Route 12 Dropoff Stops (routeid = 2) - reverse order
(6, 2, 1, 'School Main Gate', 17.4456000, 78.4634000, '15:00:00'),
(7, 2, 2, 'Saket', 17.4312000, 78.4523000, '15:15:00'),
(8, 2, 3, 'Malviya Nagar', 17.4234000, 78.4456000, '15:30:00'),
(9, 2, 4, 'Hauz Khas Village', 17.4167000, 78.4389000, '15:45:00'),
(10, 2, 5, 'Green Park Colony', 17.4156000, 78.4347000, '16:00:00'),

-- Route 15 Pickup Stops (routeid = 3)
(11, 3, 1, 'MG Road', 17.4256000, 78.4447000, '06:45:00'),
(12, 3, 2, 'Brigade Road', 17.4367000, 78.4589000, '07:00:00'),
(13, 3, 3, 'Indiranagar', 17.4478000, 78.4690000, '07:15:00'),
(14, 3, 4, 'School Main Gate', 17.4456000, 78.4634000, '07:30:00'),

-- Route 15 Dropoff Stops (routeid = 4)
(15, 4, 1, 'School Main Gate', 17.4456000, 78.4634000, '15:00:00'),
(16, 4, 2, 'Indiranagar', 17.4478000, 78.4690000, '15:15:00'),
(17, 4, 3, 'Brigade Road', 17.4367000, 78.4589000, '15:30:00'),
(18, 4, 4, 'MG Road', 17.4256000, 78.4447000, '15:45:00'),

-- Route 20 Pickup Stops (routeid = 5)
(19, 5, 1, 'Kondapur', 17.4500000, 78.3700000, '06:30:00'),
(20, 5, 2, 'Gachibowli', 17.4400000, 78.3500000, '06:45:00'),
(21, 5, 3, 'Nanakramguda', 17.4300000, 78.3800000, '07:00:00'),
(22, 5, 4, 'Financial District', 17.4200000, 78.3900000, '07:15:00'),
(23, 5, 5, 'School Main Gate', 17.4456000, 78.4634000, '07:30:00');

-- ============================================
-- 8. BUS-ROUTE-ATTENDER MAPPING (base_bus_asset_route_attendant_map)
-- ============================================
INSERT INTO `base_bus_asset_route_attendant_map` (`id`, `schoolid`, `assetid`, `routeid`, `attendantid`, `fromtime`, `totime`, `createdon`, `createdby`, `modifiedon`, `modifiedby`) VALUES
(1, 1, 1, 1, 6, 600, 800, '2024-06-01 00:00:00', 1, '2024-06-01 00:00:00', 1),  -- Raju on Route 12 Pickup
(2, 1, 1, 2, 6, 1500, 1700, '2024-06-01 00:00:00', 1, '2024-06-01 00:00:00', 1),  -- Raju on Route 12 Dropoff
(3, 1, 2, 3, 7, 630, 800, '2024-06-01 00:00:00', 1, '2024-06-01 00:00:00', 1),  -- Suresh on Route 15 Pickup
(4, 1, 2, 4, 7, 1500, 1700, '2024-06-01 00:00:00', 1, '2024-06-01 00:00:00', 1),  -- Suresh on Route 15 Dropoff
(5, 1, 4, 5, 8, 600, 800, '2024-06-01 00:00:00', 1, '2024-06-01 00:00:00', 1);  -- Ramesh on Route 20 Pickup

-- ============================================
-- 9. STUDENT-STOP MAPPING (base_bus_user_routes)
-- Maps students (userid) to their pickup/drop stops (stageid)
-- ============================================
INSERT INTO `base_bus_user_routes` (`id`, `userid`, `buspassno`, `stageid`, `fromtime`, `totime`, `createdby`, `createdon`, `modifiedby`, `modifiedon`) VALUES
-- Students on Route 12 (stageid 1-5 for pickup)
(1, 101, 'BP2024-101', 1, '2024-06-01 00:00:00', '2025-05-31 23:59:59', 1, '2024-06-01 00:00:00', 1, '2024-06-01 00:00:00'),  -- Arjun at Green Park
(2, 102, 'BP2024-102', 1, '2024-06-01 00:00:00', '2025-05-31 23:59:59', 1, '2024-06-01 00:00:00', 1, '2024-06-01 00:00:00'),  -- Priya at Green Park
(3, 103, 'BP2024-103', 2, '2024-06-01 00:00:00', '2025-05-31 23:59:59', 1, '2024-06-01 00:00:00', 1, '2024-06-01 00:00:00'),  -- Rahul at Hauz Khas
(4, 104, 'BP2024-104', 2, '2024-06-01 00:00:00', '2025-05-31 23:59:59', 1, '2024-06-01 00:00:00', 1, '2024-06-01 00:00:00'),  -- Sneha at Hauz Khas
(5, 105, 'BP2024-105', 3, '2024-06-01 00:00:00', '2025-05-31 23:59:59', 1, '2024-06-01 00:00:00', 1, '2024-06-01 00:00:00'),  -- Karan at Malviya Nagar
(6, 106, 'BP2024-106', 3, '2024-06-01 00:00:00', '2025-05-31 23:59:59', 1, '2024-06-01 00:00:00', 1, '2024-06-01 00:00:00'),  -- Ananya at Malviya Nagar
(7, 107, 'BP2024-107', 4, '2024-06-01 00:00:00', '2025-05-31 23:59:59', 1, '2024-06-01 00:00:00', 1, '2024-06-01 00:00:00'),  -- Rohan at Saket
(8, 108, 'BP2024-108', 4, '2024-06-01 00:00:00', '2025-05-31 23:59:59', 1, '2024-06-01 00:00:00', 1, '2024-06-01 00:00:00'),  -- Kavya at Saket

-- Students on Route 15 (stageid 11-14 for pickup)
(9, 109, 'BP2024-109', 11, '2024-06-01 00:00:00', '2025-05-31 23:59:59', 1, '2024-06-01 00:00:00', 1, '2024-06-01 00:00:00'),   -- Aditya at MG Road
(10, 110, 'BP2024-110', 11, '2024-06-01 00:00:00', '2025-05-31 23:59:59', 1, '2024-06-01 00:00:00', 1, '2024-06-01 00:00:00'),  -- Meera at MG Road
(11, 111, 'BP2024-111', 12, '2024-06-01 00:00:00', '2025-05-31 23:59:59', 1, '2024-06-01 00:00:00', 1, '2024-06-01 00:00:00'),  -- Harsh at Brigade Road
(12, 112, 'BP2024-112', 13, '2024-06-01 00:00:00', '2025-05-31 23:59:59', 1, '2024-06-01 00:00:00', 1, '2024-06-01 00:00:00');  -- Nandini at Indiranagar

-- ============================================
-- 10. TRIPS (base_bus_trip_header)
-- ============================================
INSERT INTO `base_bus_trip_header` (`id`, `assetrouteattendantid`, `starttime`, `createdby`, `createdon`) VALUES
(1, 1, '2025-12-08 06:30:00', 6, '2025-12-08 06:30:00'),  -- Today's morning trip for Route 12
(2, 3, '2025-12-08 06:45:00', 7, '2025-12-08 06:45:00'),  -- Today's morning trip for Route 15
(3, 1, '2025-12-07 06:30:00', 6, '2025-12-07 06:30:00'),  -- Yesterday's morning trip for Route 12
(4, 2, '2025-12-07 15:00:00', 6, '2025-12-07 15:00:00');  -- Yesterday's afternoon trip for Route 12

-- ============================================
-- 11. TRIP ATTENDANCE (base_bus_trip_attendance_details)
-- status: 1 = present, 0 = absent, 2 = half_day, 3 = reassigned
-- ============================================
INSERT INTO `base_bus_trip_attendance_details` (`id`, `headerid`, `stageid`, `userid`, `status`, `createdby`, `createdon`, `modifiedby`, `modifiedon`) VALUES
-- Trip 1 (Today's Route 12 morning pickup)
(1, 1, 1, 101, 1, 6, '2025-12-08 06:32:00', 6, '2025-12-08 06:32:00'),  -- Arjun present
(2, 1, 1, 102, 1, 6, '2025-12-08 06:33:00', 6, '2025-12-08 06:33:00'),  -- Priya present
(3, 1, 2, 103, 3, 6, '2025-12-08 06:47:00', 6, '2025-12-08 06:47:00'),  -- Rahul reassigned
(4, 1, 2, 104, 1, 6, '2025-12-08 06:48:00', 6, '2025-12-08 06:48:00'),  -- Sneha present
(5, 1, 3, 105, 0, 6, '2025-12-08 07:02:00', 6, '2025-12-08 07:02:00'),  -- Karan absent
(6, 1, 3, 106, 1, 6, '2025-12-08 07:03:00', 6, '2025-12-08 07:03:00'),  -- Ananya present

-- Trip 3 (Yesterday's Route 12 morning)
(7, 3, 1, 101, 1, 6, '2025-12-07 06:32:00', 6, '2025-12-07 06:32:00'),
(8, 3, 1, 102, 1, 6, '2025-12-07 06:33:00', 6, '2025-12-07 06:33:00'),
(9, 3, 2, 103, 1, 6, '2025-12-07 06:47:00', 6, '2025-12-07 06:47:00'),
(10, 3, 2, 104, 1, 6, '2025-12-07 06:48:00', 6, '2025-12-07 06:48:00'),
(11, 3, 3, 105, 1, 6, '2025-12-07 07:02:00', 6, '2025-12-07 07:02:00'),
(12, 3, 3, 106, 0, 6, '2025-12-07 07:03:00', 6, '2025-12-07 07:03:00');

-- ============================================
-- 12. INITIAL STUDENTS AT TRIP START (base_bus_trip_studentsatstart)
-- ============================================
INSERT INTO `base_bus_trip_studentsatstart` (`id`, `headerid`, `userid`, `status`, `createdby`, `createdon`, `modifiedby`, `modifiedon`) VALUES
-- Trip 1 students at start
(1, 1, 101, 0, 6, '2025-12-08 06:30:00', 6, '2025-12-08 06:30:00'),
(2, 1, 102, 0, 6, '2025-12-08 06:30:00', 6, '2025-12-08 06:30:00'),
(3, 1, 103, 0, 6, '2025-12-08 06:30:00', 6, '2025-12-08 06:30:00'),
(4, 1, 104, 0, 6, '2025-12-08 06:30:00', 6, '2025-12-08 06:30:00'),
(5, 1, 105, 0, 6, '2025-12-08 06:30:00', 6, '2025-12-08 06:30:00'),
(6, 1, 106, 0, 6, '2025-12-08 06:30:00', 6, '2025-12-08 06:30:00'),
(7, 1, 107, 0, 6, '2025-12-08 06:30:00', 6, '2025-12-08 06:30:00'),
(8, 1, 108, 0, 6, '2025-12-08 06:30:00', 6, '2025-12-08 06:30:00');

-- ============================================
-- 13. TRIP TIME DETAILS (base_bus_trip_time_details)
-- ============================================
INSERT INTO `base_bus_trip_time_details` (`id`, `headerid`, `stageid`, `arrivaltime`, `departuretime`, `createdon`) VALUES
(1, 1, 1, '2025-12-08 06:30:00', '2025-12-08 06:35:00', '2025-12-08 06:35:00'),  -- Green Park
(2, 1, 2, '2025-12-08 06:45:00', '2025-12-08 06:50:00', '2025-12-08 06:50:00'),  -- Hauz Khas
(3, 1, 3, '2025-12-08 07:00:00', '2025-12-08 07:05:00', '2025-12-08 07:05:00');  -- Malviya Nagar (current stop)

-- ============================================
-- 14. GPS LOCATION DATA (base_bus_location_data)
-- ============================================
INSERT INTO `base_bus_location_data` (`id`, `tripid`, `assetname`, `latitude`, `longitude`, `timestamp`, `speed`, `direction`, `createdon`) VALUES
(1, 1, 'TS09EK3274', 17.4156000, 78.4347000, '2025-12-08 06:30:00', 0.00, 0, '2025-12-08 06:30:00'),
(2, 1, 'TS09EK3274', 17.4158000, 78.4350000, '2025-12-08 06:35:00', 25.50, 45, '2025-12-08 06:35:00'),
(3, 1, 'TS09EK3274', 17.4165000, 78.4380000, '2025-12-08 06:40:00', 30.00, 50, '2025-12-08 06:40:00'),
(4, 1, 'TS09EK3274', 17.4167000, 78.4389000, '2025-12-08 06:45:00', 5.00, 48, '2025-12-08 06:45:00'),
(5, 1, 'TS09EK3274', 17.4200000, 78.4420000, '2025-12-08 06:55:00', 28.00, 55, '2025-12-08 06:55:00'),
(6, 1, 'TS09EK3274', 17.4234000, 78.4456000, '2025-12-08 07:00:00', 0.00, 55, '2025-12-08 07:00:00');

-- ============================================
-- 15. ALERTS (base_bus_stagedelay_alerts)
-- ============================================
INSERT INTO `base_bus_stagedelay_alerts` (`id`, `tripid`, `stageid`, `parentid`, `alerttype`, `senton`) VALUES
(1, 1, 3, 205, 'delay', '2025-12-08 07:10:00'),  -- Delay alert for Malviya Nagar to Karan's parent
(2, 3, 2, 203, 'delay', '2025-12-07 06:55:00'),  -- Yesterday delay at Hauz Khas
(3, 1, 1, 201, 'no_boarding', '2025-12-08 06:40:00');  -- No boarding alert

-- ============================================
-- 16. USER NOTIFICATIONS (base_useralerts)
-- ============================================
INSERT INTO `base_useralerts` (`id`, `userid`, `schoolid`, `type`, `message`, `date`, `detailid`, `urlcode`, `status`, `pushstatus`) VALUES
(1, 2, 1, 'approval', 'New route change request for Arjun Sharma', '2025-12-08 08:00:00', 'approval_1', 'notif_001', 0, 0),
(2, 2, 1, 'approval', 'Half-day leave request for Priya Patel', '2025-12-08 08:30:00', 'approval_2', 'notif_002', 0, 0),
(3, 2, 1, 'alert', 'Bus R-12 has been late 3 times this week', '2025-12-08 09:00:00', 'alert_1', 'notif_003', 0, 0),
(4, 6, 1, 'info', 'Morning pickup trip starts in 30 minutes', '2025-12-08 06:00:00', 'trip_1', 'notif_004', 1, 1),
(5, 4, 1, 'success', 'Half-day request for Rahul Verma approved', '2025-12-08 10:00:00', 'approval_3', 'notif_005', 0, 0),
(6, 201, 1, 'info', 'Your child Arjun has boarded the bus', '2025-12-08 06:33:00', 'boarding_1', 'notif_006', 1, 1),
(7, 201, 1, 'info', 'Bus arriving at school in 10 minutes', '2025-12-08 07:20:00', 'eta_1', 'notif_007', 0, 0);

-- ============================================
-- 17. BATCH YEAR (base_batchyear) - For academic year
-- ============================================
INSERT INTO `base_batchyear` (`id`, `yearfrom`, `yearto`) VALUES
(1, '2024', '2025'),
(2, '2025', '2026');

-- ============================================
-- 18. BATCHES (base_batches) - Academic batches
-- ============================================
INSERT INTO `base_batches` (`batchid`, `groupid`, `fromdate`, `todate`, `classworkstartdate`, `classworkenddate`, `ord`, `created`, `created_by`, `modified`, `modified_by`, `batchyear`, `regulation`, `cestructureid`, `paymentconfigid`) VALUES
(1, 1, '2024-06-01', '2025-05-31', '2024-06-15', '2025-04-30', 1, '2024-05-01 00:00:00', 1, '2024-05-01 00:00:00', 1, 1, 'REG2024', 1, 1);

-- ============================================
-- VERIFICATION QUERIES
-- Run these to verify data is inserted correctly
-- ============================================

-- Check user counts by role
-- SELECT userrole, COUNT(*) as count FROM jos_users GROUP BY userrole;

-- Check students with their stops
-- SELECT u.id, u.name, u.rollnumber, s.stage, r.route 
-- FROM jos_users u 
-- JOIN base_bus_user_routes bur ON u.id = bur.userid 
-- JOIN base_bus_stages s ON bur.stageid = s.id 
-- JOIN base_bus_routes r ON s.routeid = r.id 
-- WHERE u.userrole = '6';

-- Check today's trips with attendance
-- SELECT th.id as trip_id, r.route, COUNT(tad.id) as attendance_count
-- FROM base_bus_trip_header th
-- JOIN base_bus_asset_route_attendant_map arm ON th.assetrouteattendantid = arm.id
-- JOIN base_bus_routes r ON arm.routeid = r.id
-- LEFT JOIN base_bus_trip_attendance_details tad ON th.id = tad.headerid
-- WHERE DATE(th.starttime) = CURDATE()
-- GROUP BY th.id, r.route;

-- ============================================
-- TEST CREDENTIALS FOR POSTMAN
-- ============================================
-- Super Admin: 9999999999 (OTP: 000000)
-- Transport Manager: 9087654321 (OTP: 000000)
-- Office Admin: 8097654321 (OTP: 000000)
-- Bus Attender: 9014536201 (OTP: 000000)
-- Multi-role (TM+OA): 9876543210 (OTP: 000000)
-- Multi-role (SA+TM): 9123456789 (OTP: 000000)
