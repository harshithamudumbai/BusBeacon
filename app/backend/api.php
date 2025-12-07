<?php
/**
 * GPS SMART BUS SYSTEM - PHP API BACKEND
 * Place this file on your PHP server
 * 
 * Database Tables Used:
 * - base_bus_assets (buses)
 * - base_bus_routes (routes)
 * - base_bus_stages (stops)
 * - base_bus_user_routes (student-stop mapping)
 * - base_bus_asset_route_attendant_map (bus-route-attender)
 * - base_bus_trip_header (trips)
 * - base_bus_trip_attendance_details (attendance)
 * - base_bus_trip_studentsatstart (initial attendance)
 * - base_bus_trip_time_details (trip timing)
 * - base_bus_stagedelay_alerts (alerts)
 * - base_bus_location_data (GPS tracking)
 * - base_schoolname (schools)
 * - base_sections (class/section)
 * - jos_users (users)
 * - base_user_roles (roles)
 * - base_useralerts (notifications)
 * 
 * MISSING TABLES (using dummy data):
 * - base_bus_approvals (for route change/half-day requests)
 * - base_bus_halfday_leaves (half-day leave details)
 * - Driver info (stored inline with bus/route)
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database Configuration
define('DB_HOST', 'your-db-host.rds.amazonaws.com');
define('DB_NAME', 'testgitanjalischools');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');

// JWT Secret
define('JWT_SECRET', 'your-secret-key-change-this');

// Role mapping from database role IDs to app roles
$ROLE_MAPPING = [
    '1' => 'super_admin',      // Adjust based on your base_user_roles table
    '2' => 'transport_manager',
    '3' => 'office_admin',
    '4' => 'attender',
];

// ============================================
// DATABASE CONNECTION
// ============================================

function getDB() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $pdo = new PDO(
                "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
                DB_USER,
                DB_PASS,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );
        } catch (PDOException $e) {
            jsonResponse(false, 'Database connection failed', null, 500);
        }
    }
    return $pdo;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function jsonResponse($success, $message, $data = null, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data,
    ]);
    exit;
}

function getRequestBody() {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

function getQueryParams() {
    return $_GET;
}

function generateJWT($userId, $roles) {
    $header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload = base64_encode(json_encode([
        'user_id' => $userId,
        'roles' => $roles,
        'exp' => time() + (24 * 60 * 60), // 24 hours
    ]));
    $signature = base64_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
    return "$header.$payload.$signature";
}

function verifyJWT($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    
    [$header, $payload, $signature] = $parts;
    $expectedSignature = base64_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
    
    if ($signature !== $expectedSignature) return null;
    
    $data = json_decode(base64_decode($payload), true);
    if ($data['exp'] < time()) return null;
    
    return $data;
}

function getAuthUser() {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        return null;
    }
    return verifyJWT($matches[1]);
}

function requireAuth() {
    $user = getAuthUser();
    if (!$user) {
        jsonResponse(false, 'Unauthorized', null, 401);
    }
    return $user;
}

// ============================================
// ROUTING
// ============================================

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = preg_replace('/^\/busbeacon\/api/', '', $uri); // Remove base path
$method = $_SERVER['REQUEST_METHOD'];

// Route handlers
$routes = [
    // Auth
    'POST /auth/send-otp' => 'handleSendOtp',
    'POST /auth/verify-otp' => 'handleVerifyOtp',
    'POST /auth/logout' => 'handleLogout',
    
    // Dashboard
    'GET /dashboard/stats' => 'handleDashboardStats',
    
    // Trips
    'GET /trips/today' => 'handleTodayTrips',
    'POST /trips/{id}/start' => 'handleStartTrip',
    'POST /trips/{id}/end' => 'handleEndTrip',
    'GET /trips/{id}' => 'handleGetTrip',
    
    // Students
    'GET /students' => 'handleGetStudents',
    'GET /students/search' => 'handleSearchStudents',
    'GET /students/list' => 'handleGetStudentsList',
    
    // Attendance
    'POST /attendance/mark' => 'handleMarkAttendance',
    'GET /attendance/trip/{id}' => 'handleGetTripAttendance',
    
    // Routes
    'GET /routes' => 'handleGetRoutes',
    'GET /routes/{id}/stops' => 'handleGetRouteStops',
    'GET /routes/{id}/students' => 'handleGetRouteStudents',
    
    // Buses
    'GET /buses' => 'handleGetBuses',
    'GET /buses/active' => 'handleGetActiveBuses',
    'POST /buses/location' => 'handleUpdateBusLocation',
    
    // Approvals
    'GET /approvals' => 'handleGetApprovals',
    'POST /approvals/{id}/approve' => 'handleApproveRequest',
    'POST /approvals/{id}/reject' => 'handleRejectRequest',
    'POST /approvals/{id}/process' => 'handleProcessApproval',
    
    // Half-day
    'POST /halfday/create' => 'handleCreateHalfDay',
    'GET /halfday/today' => 'handleGetTodayHalfDay',
    
    // Alerts
    'GET /alerts' => 'handleGetAlerts',
    'POST /alerts/{id}/acknowledge' => 'handleAcknowledgeAlert',
    
    // Notifications
    'GET /notifications' => 'handleGetNotifications',
    'POST /notifications/{id}/read' => 'handleMarkNotificationRead',
    'POST /notifications/read-all' => 'handleMarkAllNotificationsRead',
    
    // Schools
    'GET /schools' => 'handleGetSchools',
    
    // Issues
    'GET /issues/categories' => 'handleGetIssueCategories',
    'POST /issues/report' => 'handleReportIssue',
];

// Find matching route
$handler = null;
$params = [];

foreach ($routes as $route => $handlerName) {
    [$routeMethod, $routePath] = explode(' ', $route, 2);
    
    if ($method !== $routeMethod) continue;
    
    // Convert route pattern to regex
    $pattern = preg_replace('/\{(\w+)\}/', '(?P<$1>[^/]+)', $routePath);
    $pattern = '#^' . $pattern . '$#';
    
    if (preg_match($pattern, $uri, $matches)) {
        $handler = $handlerName;
        $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
        break;
    }
}

if ($handler && function_exists($handler)) {
    $handler($params);
} else {
    jsonResponse(false, 'Endpoint not found', null, 404);
}

// ============================================
// AUTH HANDLERS
// ============================================

function handleSendOtp($params) {
    $body = getRequestBody();
    $phone = $body['phoneNumber'] ?? '';
    
    if (empty($phone)) {
        jsonResponse(false, 'Phone number required', null, 400);
    }
    
    // In production, integrate with SMS gateway here
    // For now, just return success
    jsonResponse(true, 'OTP sent successfully', ['message' => "OTP sent to $phone"]);
}

function handleVerifyOtp($params) {
    global $ROLE_MAPPING;
    $body = getRequestBody();
    $phone = $body['phoneNumber'] ?? '';
    $otp = $body['otp'] ?? '';
    
    if (empty($phone) || empty($otp)) {
        jsonResponse(false, 'Phone number and OTP required', null, 400);
    }
    
    // For development, accept '000000' as valid OTP
    if ($otp !== '000000') {
        jsonResponse(false, 'Invalid OTP');
    }
    
    $db = getDB();
    
    // Find user by phone number
    $stmt = $db->prepare("
        SELECT u.id, u.name, u.mobile, u.userrole, u.schoolid, u.encrypturl as avatar
        FROM jos_users u
        WHERE u.mobile = :phone AND u.block = 0
        LIMIT 1
    ");
    $stmt->execute(['phone' => $phone]);
    $user = $stmt->fetch();
    
    if (!$user) {
        jsonResponse(false, 'User not found');
    }
    
    // Parse roles from comma-separated string
    $roleIds = explode(',', $user['userrole']);
    $roles = [];
    foreach ($roleIds as $roleId) {
        $roleId = trim($roleId);
        if (isset($ROLE_MAPPING[$roleId])) {
            $roles[] = $ROLE_MAPPING[$roleId];
        }
    }
    
    // Default to attender if no roles found
    if (empty($roles)) {
        $roles = ['attender'];
    }
    
    // Get assigned bus/route for attender
    $assignedBus = null;
    $assignedRoute = null;
    
    if (in_array('attender', $roles)) {
        $stmt = $db->prepare("
            SELECT 
                m.id as mapId,
                a.id as busId, a.assetname as busNumber, a.capacity,
                r.id as routeId, r.route as routeName, r.routetype
            FROM base_bus_asset_route_attendant_map m
            JOIN base_bus_assets a ON m.assetid = a.id
            JOIN base_bus_routes r ON m.routeid = r.id
            WHERE m.attendantid = :userId
            AND CURDATE() BETWEEN r.start_date AND r.end_date
            LIMIT 1
        ");
        $stmt->execute(['userId' => $user['id']]);
        $mapping = $stmt->fetch();
        
        if ($mapping) {
            $assignedBus = [
                'id' => (string)$mapping['busId'],
                'number' => $mapping['busNumber'],
                'capacity' => (int)$mapping['capacity'],
                'routeId' => (string)$mapping['routeId'],
            ];
            $assignedRoute = [
                'id' => (string)$mapping['routeId'],
                'name' => $mapping['routeName'],
                'code' => 'R-' . $mapping['routeId'],
            ];
        }
    }
    
    // Get assigned branches (schools)
    $stmt = $db->prepare("
        SELECT s.schoolid as id, s.schoolname as name, s.code, 
               CONCAT(s.address1, ', ', s.area, ', ', s.city) as address
        FROM base_schoolname s
        WHERE s.schoolid = :schoolId OR :schoolId = 0
    ");
    $stmt->execute(['schoolId' => $user['schoolid']]);
    $branches = [];
    while ($school = $stmt->fetch()) {
        $branches[] = [
            'id' => (string)$school['id'],
            'schoolId' => (string)$school['id'],
            'name' => $school['name'],
            'code' => $school['code'],
            'address' => $school['address'],
        ];
    }
    
    $token = generateJWT($user['id'], $roles);
    
    $userProfile = [
        'id' => (string)$user['id'],
        'name' => $user['name'],
        'phoneNumber' => (string)$user['mobile'],
        'avatar' => $user['avatar'] ?: '',
        'roles' => $roles,
        'assignedBranches' => $branches,
        'assignedBus' => $assignedBus,
        'assignedRoute' => $assignedRoute,
    ];
    
    jsonResponse(true, 'OTP verified successfully', ['token' => $token, 'user' => $userProfile]);
}

function handleLogout($params) {
    // JWT is stateless, just return success
    jsonResponse(true, 'Logged out successfully', ['message' => 'Logged out']);
}

// ============================================
// DASHBOARD HANDLERS
// ============================================

function handleDashboardStats($params) {
    requireAuth();
    $query = getQueryParams();
    $branchId = $query['branchId'] ?? null;
    
    $db = getDB();
    
    // Total buses
    $sql = "SELECT COUNT(*) FROM base_bus_assets WHERE status = 1";
    if ($branchId) $sql .= " AND schoolid = :branchId";
    $stmt = $db->prepare($sql);
    if ($branchId) $stmt->execute(['branchId' => $branchId]);
    else $stmt->execute();
    $totalBuses = $stmt->fetchColumn();
    
    // Active buses (on trip today)
    $stmt = $db->prepare("
        SELECT COUNT(DISTINCT m.assetid)
        FROM base_bus_trip_header h
        JOIN base_bus_asset_route_attendant_map m ON h.assetrouteattendantid = m.id
        WHERE DATE(h.starttime) = CURDATE()
    ");
    $stmt->execute();
    $activeBuses = $stmt->fetchColumn();
    
    // Total students with bus routes
    $stmt = $db->prepare("
        SELECT COUNT(DISTINCT userid) FROM base_bus_user_routes
        WHERE CURDATE() BETWEEN fromtime AND totime
    ");
    $stmt->execute();
    $totalStudents = $stmt->fetchColumn();
    
    // Present today
    $stmt = $db->prepare("
        SELECT COUNT(DISTINCT d.userid)
        FROM base_bus_trip_attendance_details d
        JOIN base_bus_trip_header h ON d.headerid = h.id
        WHERE DATE(h.starttime) = CURDATE() AND d.status = 1
    ");
    $stmt->execute();
    $presentToday = $stmt->fetchColumn();
    
    // Absent today
    $stmt = $db->prepare("
        SELECT COUNT(DISTINCT d.userid)
        FROM base_bus_trip_attendance_details d
        JOIN base_bus_trip_header h ON d.headerid = h.id
        WHERE DATE(h.starttime) = CURDATE() AND d.status = 0
    ");
    $stmt->execute();
    $absentToday = $stmt->fetchColumn();
    
    // Pending approvals (dummy - table doesn't exist)
    $pendingApprovals = 0;
    
    // Active alerts
    $stmt = $db->prepare("
        SELECT COUNT(*) FROM base_bus_stagedelay_alerts
        WHERE DATE(senton) = CURDATE()
    ");
    $stmt->execute();
    $activeAlerts = $stmt->fetchColumn();
    
    jsonResponse(true, 'Stats fetched', [
        'totalBuses' => (int)$totalBuses,
        'activeBuses' => (int)$activeBuses,
        'totalStudents' => (int)$totalStudents,
        'presentToday' => (int)$presentToday,
        'absentToday' => (int)$absentToday,
        'pendingApprovals' => (int)$pendingApprovals,
        'activeAlerts' => (int)$activeAlerts,
    ]);
}

// ============================================
// TRIP HANDLERS
// ============================================

function handleTodayTrips($params) {
    $auth = requireAuth();
    $query = getQueryParams();
    $busId = $query['busId'] ?? null;
    
    $db = getDB();
    
    // Get today's date formatted
    $today = date('l, j F'); // e.g., "Monday, 7 December"
    
    // Get trips for today
    $sql = "
        SELECT 
            h.id as tripId,
            h.starttime,
            m.assetid as busId,
            r.routetype as type,
            (SELECT COUNT(DISTINCT userid) FROM base_bus_user_routes WHERE stageid IN 
                (SELECT id FROM base_bus_stages WHERE routeid = r.id) 
                AND CURDATE() BETWEEN fromtime AND totime
            ) as totalStudents,
            (SELECT COUNT(*) FROM base_bus_stages WHERE routeid = r.id) as stops
        FROM base_bus_trip_header h
        JOIN base_bus_asset_route_attendant_map m ON h.assetrouteattendantid = m.id
        JOIN base_bus_routes r ON m.routeid = r.id
        WHERE DATE(h.starttime) = CURDATE()
    ";
    
    if ($busId) {
        $sql .= " AND m.assetid = :busId";
    }
    
    // For attender, filter by their assigned bus
    if (in_array('attender', $auth['roles'])) {
        $sql .= " AND m.attendantid = :attenderId";
    }
    
    $stmt = $db->prepare($sql);
    $bindParams = [];
    if ($busId) $bindParams['busId'] = $busId;
    if (in_array('attender', $auth['roles'])) $bindParams['attenderId'] = $auth['user_id'];
    $stmt->execute($bindParams);
    
    $trips = [];
    $hasActiveTrip = false;
    
    while ($row = $stmt->fetch()) {
        $tripType = $row['type'] == 1 ? 'pickup' : 'dropoff';
        $startTime = $tripType == 'pickup' ? '6:30 AM' : '2:30 PM';
        $endTime = $tripType == 'pickup' ? '8:00 AM' : '4:00 PM';
        
        // Check if trip is active
        $status = 'pending';
        if ($row['starttime']) {
            $status = 'active';
            $hasActiveTrip = true;
        }
        
        $trips[] = [
            'id' => (string)$row['tripId'],
            'busId' => (string)$row['busId'],
            'date' => date('Y-m-d'),
            'type' => $tripType,
            'status' => $status,
            'startedAt' => $row['starttime'],
            'startTime' => $startTime,
            'endTime' => $endTime,
            'attenderId' => (string)$auth['user_id'],
            'totalStudents' => (int)$row['totalStudents'],
            'presentCount' => 0,
            'absentCount' => 0,
            'currentStopIndex' => 0,
            'stops' => (int)$row['stops'],
        ];
    }
    
    // If no trips exist, create default ones
    if (empty($trips)) {
        $trips = [
            [
                'id' => 'trip_' . date('Ymd') . '_1',
                'busId' => $busId ?: 'bus_1',
                'date' => date('Y-m-d'),
                'type' => 'pickup',
                'status' => 'pending',
                'startTime' => '6:30 AM',
                'endTime' => '8:00 AM',
                'attenderId' => (string)$auth['user_id'],
                'totalStudents' => 23,
                'presentCount' => 0,
                'absentCount' => 0,
                'currentStopIndex' => 0,
                'stops' => 5,
            ],
            [
                'id' => 'trip_' . date('Ymd') . '_2',
                'busId' => $busId ?: 'bus_1',
                'date' => date('Y-m-d'),
                'type' => 'dropoff',
                'status' => 'pending',
                'startTime' => '2:30 PM',
                'endTime' => '4:00 PM',
                'attenderId' => (string)$auth['user_id'],
                'totalStudents' => 23,
                'presentCount' => 0,
                'absentCount' => 0,
                'currentStopIndex' => 0,
                'stops' => 5,
            ],
        ];
    }
    
    jsonResponse(true, 'Trips fetched', [
        'date' => $today,
        'hasActiveTrip' => $hasActiveTrip,
        'trips' => $trips,
    ]);
}

function handleStartTrip($params) {
    $auth = requireAuth();
    $tripId = $params['id'] ?? '';
    
    $db = getDB();
    
    // Check if trip exists, if not create one
    $stmt = $db->prepare("SELECT id FROM base_bus_trip_header WHERE id = :tripId");
    $stmt->execute(['tripId' => $tripId]);
    
    if (!$stmt->fetch()) {
        // Get attendant's route mapping
        $stmt = $db->prepare("
            SELECT id FROM base_bus_asset_route_attendant_map 
            WHERE attendantid = :attenderId 
            AND CURDATE() BETWEEN DATE(FROM_UNIXTIME(fromtime)) AND DATE(FROM_UNIXTIME(totime))
            LIMIT 1
        ");
        $stmt->execute(['attenderId' => $auth['user_id']]);
        $mapping = $stmt->fetch();
        
        if ($mapping) {
            $stmt = $db->prepare("
                INSERT INTO base_bus_trip_header (assetrouteattendantid, starttime, createdby, createdon)
                VALUES (:mapId, NOW(), :userId, NOW())
            ");
            $stmt->execute(['mapId' => $mapping['id'], 'userId' => $auth['user_id']]);
            $tripId = $db->lastInsertId();
        }
    }
    
    jsonResponse(true, 'Trip started', [
        'id' => (string)$tripId,
        'status' => 'active',
        'startedAt' => date('c'),
    ]);
}

function handleEndTrip($params) {
    requireAuth();
    $tripId = $params['id'] ?? '';
    
    // In a real implementation, update the trip end time
    jsonResponse(true, 'Trip ended', [
        'id' => $tripId,
        'status' => 'completed',
        'completedAt' => date('c'),
    ]);
}

function handleGetTrip($params) {
    requireAuth();
    $tripId = $params['id'] ?? '';
    
    // Return trip details
    jsonResponse(true, 'Trip fetched', [
        'id' => $tripId,
        'status' => 'pending',
    ]);
}

// ============================================
// STUDENT HANDLERS
// ============================================

function handleGetStudents($params) {
    requireAuth();
    $query = getQueryParams();
    $busId = $query['busId'] ?? null;
    $stopId = $query['stopId'] ?? null;
    
    $db = getDB();
    
    $sql = "
        SELECT 
            u.id, u.name, u.rollnumber, u.mobile,
            s.id as sectionId, s.name as sectionName, s.yearname as class,
            ur.stageid as stopId,
            st.stage as stopName, st.latitude, st.longitude, st.scheduledtime,
            r.id as routeId, r.route as routeName, r.bus_asset_id as busId,
            a.assetname as busNumber
        FROM jos_users u
        JOIN base_bus_user_routes ur ON u.id = ur.userid
        JOIN base_bus_stages st ON ur.stageid = st.id
        JOIN base_bus_routes r ON st.routeid = r.id
        JOIN base_bus_assets a ON r.bus_asset_id = a.id
        LEFT JOIN base_sections s ON u.deptid = s.id
        WHERE CURDATE() BETWEEN DATE(ur.fromtime) AND DATE(ur.totime)
    ";
    
    $bindParams = [];
    if ($busId) {
        $sql .= " AND r.bus_asset_id = :busId";
        $bindParams['busId'] = $busId;
    }
    if ($stopId) {
        $sql .= " AND ur.stageid = :stopId";
        $bindParams['stopId'] = $stopId;
    }
    
    $sql .= " ORDER BY st.stagenumber, u.name";
    
    $stmt = $db->prepare($sql);
    $stmt->execute($bindParams);
    
    $students = [];
    while ($row = $stmt->fetch()) {
        $students[] = [
            'id' => (string)$row['id'],
            'branchId' => '1',
            'name' => $row['name'],
            'class' => $row['class'] ?: 'N/A',
            'section' => $row['sectionName'] ?: 'A',
            'rollNumber' => $row['rollnumber'],
            'photoUrl' => '',
            'busId' => (string)$row['busId'],
            'routeId' => (string)$row['routeId'],
            'stopId' => (string)$row['stopId'],
            'parent1Name' => 'Parent',
            'parent1Phone' => (string)$row['mobile'],
            'isActive' => true,
            'attendanceStatus' => 'pending',
            'stop' => [
                'id' => (string)$row['stopId'],
                'routeId' => (string)$row['routeId'],
                'name' => $row['stopName'],
                'latitude' => (float)$row['latitude'],
                'longitude' => (float)$row['longitude'],
                'scheduledPickupTime' => $row['scheduledtime'],
            ],
        ];
    }
    
    jsonResponse(true, 'Students fetched', $students);
}

function handleSearchStudents($params) {
    requireAuth();
    $query = getQueryParams();
    $searchQuery = $query['query'] ?? '';
    
    if (strlen($searchQuery) < 2) {
        jsonResponse(true, 'Search results', []);
    }
    
    $db = getDB();
    
    $stmt = $db->prepare("
        SELECT u.id, u.name, u.rollnumber, u.mobile
        FROM jos_users u
        WHERE (u.name LIKE :query OR u.rollnumber LIKE :query)
        AND u.userrole IN ('1', '2', '21')
        LIMIT 20
    ");
    $stmt->execute(['query' => "%$searchQuery%"]);
    
    $students = [];
    while ($row = $stmt->fetch()) {
        $students[] = [
            'id' => (string)$row['id'],
            'name' => $row['name'],
            'rollNumber' => $row['rollnumber'],
            'isActive' => true,
        ];
    }
    
    jsonResponse(true, 'Search results', $students);
}

function handleGetStudentsList($params) {
    // Alias for handleGetStudents
    handleGetStudents($params);
}

// ============================================
// ATTENDANCE HANDLERS
// ============================================

function handleMarkAttendance($params) {
    $auth = requireAuth();
    $body = getRequestBody();
    
    $tripId = $body['tripId'] ?? '';
    $studentId = $body['studentId'] ?? '';
    $status = $body['status'] ?? 'pending';
    $note = $body['note'] ?? null;
    
    if (empty($tripId) || empty($studentId)) {
        jsonResponse(false, 'Trip ID and Student ID required', null, 400);
    }
    
    $statusMap = [
        'present' => 1,
        'absent' => 0,
        'half_day' => 2,
        'reassigned' => 3,
        'pending' => -1,
    ];
    
    $statusValue = $statusMap[$status] ?? -1;
    
    $db = getDB();
    
    // Get student's stage
    $stmt = $db->prepare("
        SELECT stageid FROM base_bus_user_routes 
        WHERE userid = :studentId 
        AND CURDATE() BETWEEN DATE(fromtime) AND DATE(totime)
        LIMIT 1
    ");
    $stmt->execute(['studentId' => $studentId]);
    $route = $stmt->fetch();
    $stageId = $route['stageid'] ?? 0;
    
    // Check if attendance already exists
    $stmt = $db->prepare("
        SELECT id FROM base_bus_trip_attendance_details 
        WHERE headerid = :tripId AND userid = :studentId
    ");
    $stmt->execute(['tripId' => $tripId, 'studentId' => $studentId]);
    $existing = $stmt->fetch();
    
    if ($existing) {
        // Update
        $stmt = $db->prepare("
            UPDATE base_bus_trip_attendance_details 
            SET status = :status, modifiedby = :userId, modifiedon = NOW()
            WHERE id = :id
        ");
        $stmt->execute(['status' => $statusValue, 'userId' => $auth['user_id'], 'id' => $existing['id']]);
        $attendanceId = $existing['id'];
    } else {
        // Insert
        $stmt = $db->prepare("
            INSERT INTO base_bus_trip_attendance_details 
            (headerid, stageid, userid, status, createdby, createdon, modifiedby, modifiedon)
            VALUES (:tripId, :stageId, :studentId, :status, :userId, NOW(), :userId, NOW())
        ");
        $stmt->execute([
            'tripId' => $tripId,
            'stageId' => $stageId,
            'studentId' => $studentId,
            'status' => $statusValue,
            'userId' => $auth['user_id'],
        ]);
        $attendanceId = $db->lastInsertId();
    }
    
    jsonResponse(true, 'Attendance marked', [
        'id' => (string)$attendanceId,
        'tripId' => $tripId,
        'studentId' => $studentId,
        'stopId' => (string)$stageId,
        'status' => $status,
        'markedAt' => date('c'),
        'markedBy' => (string)$auth['user_id'],
        'note' => $note,
    ]);
}

function handleGetTripAttendance($params) {
    requireAuth();
    $tripId = $params['id'] ?? '';
    
    $db = getDB();
    
    $stmt = $db->prepare("
        SELECT d.id, d.userid as studentId, d.stageid as stopId, d.status, d.createdon as markedAt
        FROM base_bus_trip_attendance_details d
        WHERE d.headerid = :tripId
    ");
    $stmt->execute(['tripId' => $tripId]);
    
    $statusMap = [1 => 'present', 0 => 'absent', 2 => 'half_day', 3 => 'reassigned', -1 => 'pending'];
    
    $attendance = [];
    while ($row = $stmt->fetch()) {
        $attendance[] = [
            'id' => (string)$row['id'],
            'tripId' => $tripId,
            'studentId' => (string)$row['studentId'],
            'stopId' => (string)$row['stopId'],
            'status' => $statusMap[$row['status']] ?? 'pending',
            'markedAt' => $row['markedAt'],
        ];
    }
    
    jsonResponse(true, 'Attendance fetched', $attendance);
}

// ============================================
// ROUTE HANDLERS
// ============================================

function handleGetRoutes($params) {
    requireAuth();
    $query = getQueryParams();
    $branchId = $query['branchId'] ?? null;
    
    $db = getDB();
    
    $sql = "
        SELECT r.id, r.route as name, r.routetype, r.schoolid, r.bus_asset_id,
               r.displayorder, a.assetname as busNumber
        FROM base_bus_routes r
        JOIN base_bus_assets a ON r.bus_asset_id = a.id
        WHERE CURDATE() BETWEEN r.start_date AND r.end_date
    ";
    
    if ($branchId) {
        $sql .= " AND r.schoolid = :branchId";
    }
    
    $sql .= " ORDER BY r.displayorder";
    
    $stmt = $db->prepare($sql);
    if ($branchId) $stmt->execute(['branchId' => $branchId]);
    else $stmt->execute();
    
    $routes = [];
    while ($row = $stmt->fetch()) {
        // Get stops for this route
        $stopsStmt = $db->prepare("
            SELECT id, stage as name, latitude, longitude, stagenumber as 'order', scheduledtime
            FROM base_bus_stages
            WHERE routeid = :routeId
            ORDER BY stagenumber
        ");
        $stopsStmt->execute(['routeId' => $row['id']]);
        
        $stops = [];
        while ($stop = $stopsStmt->fetch()) {
            // Count students at this stop
            $countStmt = $db->prepare("
                SELECT COUNT(*) FROM base_bus_user_routes 
                WHERE stageid = :stopId AND CURDATE() BETWEEN DATE(fromtime) AND DATE(totime)
            ");
            $countStmt->execute(['stopId' => $stop['id']]);
            $studentsCount = $countStmt->fetchColumn();
            
            $stops[] = [
                'id' => (string)$stop['id'],
                'routeId' => (string)$row['id'],
                'name' => $stop['name'],
                'address' => '',
                'latitude' => (float)$stop['latitude'],
                'longitude' => (float)$stop['longitude'],
                'order' => (int)$stop['order'],
                'scheduledPickupTime' => $stop['scheduledtime'],
                'scheduledDropoffTime' => '',
                'studentsCount' => (int)$studentsCount,
            ];
        }
        
        $routes[] = [
            'id' => (string)$row['id'],
            'branchId' => (string)$row['schoolid'],
            'name' => $row['name'],
            'code' => 'R-' . $row['id'],
            'stops' => $stops,
            'isActive' => true,
        ];
    }
    
    jsonResponse(true, 'Routes fetched', $routes);
}

function handleGetRouteStops($params) {
    requireAuth();
    $routeId = $params['id'] ?? '';
    
    $db = getDB();
    
    $stmt = $db->prepare("
        SELECT id, stage as name, latitude, longitude, stagenumber as 'order', scheduledtime
        FROM base_bus_stages
        WHERE routeid = :routeId
        ORDER BY stagenumber
    ");
    $stmt->execute(['routeId' => $routeId]);
    
    $stops = [];
    while ($row = $stmt->fetch()) {
        // Count students at this stop
        $countStmt = $db->prepare("
            SELECT COUNT(*) FROM base_bus_user_routes 
            WHERE stageid = :stopId AND CURDATE() BETWEEN DATE(fromtime) AND DATE(totime)
        ");
        $countStmt->execute(['stopId' => $row['id']]);
        $studentsCount = $countStmt->fetchColumn();
        
        $stops[] = [
            'id' => (string)$row['id'],
            'routeId' => $routeId,
            'name' => $row['name'],
            'address' => '',
            'latitude' => (float)$row['latitude'],
            'longitude' => (float)$row['longitude'],
            'order' => (int)$row['order'],
            'scheduledPickupTime' => $row['scheduledtime'],
            'scheduledDropoffTime' => '',
            'studentsCount' => (int)$studentsCount,
        ];
    }
    
    jsonResponse(true, 'Stops fetched', $stops);
}

function handleGetRouteStudents($params) {
    requireAuth();
    $routeId = $params['id'] ?? '';
    
    $db = getDB();
    
    // Get stops with students
    $stmt = $db->prepare("
        SELECT id, stage as name, latitude, longitude, stagenumber as 'order', scheduledtime
        FROM base_bus_stages
        WHERE routeid = :routeId
        ORDER BY stagenumber
    ");
    $stmt->execute(['routeId' => $routeId]);
    
    $stops = [];
    while ($stop = $stmt->fetch()) {
        // Get students at this stop
        $studentsStmt = $db->prepare("
            SELECT u.id, u.name, u.rollnumber, u.mobile,
                   s.yearname as class, s.name as sectionName
            FROM jos_users u
            JOIN base_bus_user_routes ur ON u.id = ur.userid
            LEFT JOIN base_sections s ON u.deptid = s.id
            WHERE ur.stageid = :stopId
            AND CURDATE() BETWEEN DATE(ur.fromtime) AND DATE(ur.totime)
            ORDER BY u.name
        ");
        $studentsStmt->execute(['stopId' => $stop['id']]);
        
        $students = [];
        while ($student = $studentsStmt->fetch()) {
            $students[] = [
                'id' => (string)$student['id'],
                'branchId' => '1',
                'name' => $student['name'],
                'class' => $student['class'] ?: 'N/A',
                'section' => $student['sectionName'] ?: 'A',
                'rollNumber' => $student['rollnumber'],
                'photoUrl' => '',
                'busId' => '',
                'routeId' => $routeId,
                'stopId' => (string)$stop['id'],
                'parent1Name' => 'Parent',
                'parent1Phone' => (string)$student['mobile'],
                'isActive' => true,
                'attendanceStatus' => 'pending',
            ];
        }
        
        $stops[] = [
            'id' => (string)$stop['id'],
            'routeId' => $routeId,
            'name' => $stop['name'],
            'address' => '',
            'latitude' => (float)$stop['latitude'],
            'longitude' => (float)$stop['longitude'],
            'order' => (int)$stop['order'],
            'scheduledPickupTime' => $stop['scheduledtime'],
            'scheduledDropoffTime' => '',
            'studentsCount' => count($students),
            'students' => $students,
        ];
    }
    
    jsonResponse(true, 'Students by route fetched', ['stops' => $stops]);
}

// ============================================
// BUS HANDLERS
// ============================================

function handleGetBuses($params) {
    requireAuth();
    $query = getQueryParams();
    $status = $query['status'] ?? 'all';
    
    $db = getDB();
    
    $sql = "
        SELECT a.id, a.assetname as number, a.capacity, a.status, a.schoolid,
               r.id as routeId, r.route as routeName
        FROM base_bus_assets a
        LEFT JOIN base_bus_routes r ON a.id = r.bus_asset_id 
            AND CURDATE() BETWEEN r.start_date AND r.end_date
        WHERE 1=1
    ";
    
    if ($status !== 'all') {
        $statusMap = ['on_trip' => 1, 'idle' => 1, 'maintenance' => 0];
        $sql .= " AND a.status = " . ($statusMap[$status] ?? 1);
    }
    
    $stmt = $db->prepare($sql);
    $stmt->execute();
    
    $buses = [];
    while ($row = $stmt->fetch()) {
        // Count current students
        $countStmt = $db->prepare("
            SELECT COUNT(DISTINCT ur.userid)
            FROM base_bus_user_routes ur
            JOIN base_bus_stages st ON ur.stageid = st.id
            WHERE st.routeid = :routeId
            AND CURDATE() BETWEEN DATE(ur.fromtime) AND DATE(ur.totime)
        ");
        $countStmt->execute(['routeId' => $row['routeId']]);
        $currentStudents = $countStmt->fetchColumn();
        
        // Check if on trip
        $tripStmt = $db->prepare("
            SELECT COUNT(*) FROM base_bus_trip_header h
            JOIN base_bus_asset_route_attendant_map m ON h.assetrouteattendantid = m.id
            WHERE m.assetid = :busId AND DATE(h.starttime) = CURDATE()
        ");
        $tripStmt->execute(['busId' => $row['id']]);
        $isOnTrip = $tripStmt->fetchColumn() > 0;
        
        $busStatus = $row['status'] == 0 ? 'maintenance' : ($isOnTrip ? 'on_trip' : 'idle');
        
        $buses[] = [
            'id' => (string)$row['id'],
            'number' => $row['number'],
            'branchId' => (string)$row['schoolid'],
            'routeId' => (string)$row['routeId'],
            'capacity' => (int)$row['capacity'],
            'currentStudents' => (int)$currentStudents,
            'driverName' => 'Driver',
            'driverPhone' => '',
            'status' => $busStatus,
            'lateCount' => 0,
            'isActive' => $row['status'] == 1,
            'route' => $row['routeId'] ? [
                'id' => (string)$row['routeId'],
                'name' => $row['routeName'],
                'code' => 'R-' . $row['routeId'],
            ] : null,
        ];
    }
    
    jsonResponse(true, 'Buses fetched', $buses);
}

function handleGetActiveBuses($params) {
    requireAuth();
    
    $db = getDB();
    
    $stmt = $db->prepare("
        SELECT DISTINCT a.id, a.assetname as number, a.capacity, a.schoolid,
               r.id as routeId, r.route as routeName,
               loc.latitude, loc.longitude, loc.speed
        FROM base_bus_assets a
        JOIN base_bus_asset_route_attendant_map m ON a.id = m.assetid
        JOIN base_bus_trip_header h ON m.id = h.assetrouteattendantid
        JOIN base_bus_routes r ON m.routeid = r.id
        LEFT JOIN base_bus_location_data loc ON h.id = loc.tripid
        WHERE DATE(h.starttime) = CURDATE()
        ORDER BY loc.timestamp DESC
    ");
    $stmt->execute();
    
    $buses = [];
    $seenBuses = [];
    
    while ($row = $stmt->fetch()) {
        if (isset($seenBuses[$row['id']])) continue;
        $seenBuses[$row['id']] = true;
        
        $buses[] = [
            'id' => (string)$row['id'],
            'number' => $row['number'],
            'branchId' => (string)$row['schoolid'],
            'routeId' => (string)$row['routeId'],
            'capacity' => (int)$row['capacity'],
            'status' => 'on_trip',
            'isActive' => true,
            'currentLocation' => [
                'latitude' => (float)$row['latitude'],
                'longitude' => (float)$row['longitude'],
                'speed' => (float)$row['speed'],
            ],
            'route' => [
                'id' => (string)$row['routeId'],
                'name' => $row['routeName'],
            ],
        ];
    }
    
    jsonResponse(true, 'Active buses fetched', $buses);
}

function handleUpdateBusLocation($params) {
    $auth = requireAuth();
    $body = getRequestBody();
    
    $tripId = $body['tripId'] ?? '';
    $latitude = $body['latitude'] ?? 0;
    $longitude = $body['longitude'] ?? 0;
    $speed = $body['speed'] ?? 0;
    
    if (empty($tripId)) {
        jsonResponse(false, 'Trip ID required', null, 400);
    }
    
    $db = getDB();
    
    // Get bus asset name
    $stmt = $db->prepare("
        SELECT a.assetname
        FROM base_bus_trip_header h
        JOIN base_bus_asset_route_attendant_map m ON h.assetrouteattendantid = m.id
        JOIN base_bus_assets a ON m.assetid = a.id
        WHERE h.id = :tripId
    ");
    $stmt->execute(['tripId' => $tripId]);
    $bus = $stmt->fetch();
    $assetName = $bus['assetname'] ?? '';
    
    // Insert location
    $stmt = $db->prepare("
        INSERT INTO base_bus_location_data 
        (tripid, assetname, latitude, longitude, timestamp, speed, createdon)
        VALUES (:tripId, :assetName, :lat, :lng, NOW(), :speed, NOW())
    ");
    $stmt->execute([
        'tripId' => $tripId,
        'assetName' => $assetName,
        'lat' => $latitude,
        'lng' => $longitude,
        'speed' => $speed,
    ]);
    
    jsonResponse(true, 'Location updated', ['message' => 'Location saved']);
}

// ============================================
// APPROVAL HANDLERS (DUMMY - TABLE MISSING)
// ============================================

function handleGetApprovals($params) {
    requireAuth();
    
    // Since base_bus_approvals table doesn't exist, return empty or dummy data
    jsonResponse(true, 'Approvals fetched', []);
}

function handleApproveRequest($params) {
    requireAuth();
    $approvalId = $params['id'] ?? '';
    
    jsonResponse(true, 'Request approved', ['id' => $approvalId, 'status' => 'approved']);
}

function handleRejectRequest($params) {
    requireAuth();
    $approvalId = $params['id'] ?? '';
    
    jsonResponse(true, 'Request rejected', ['id' => $approvalId, 'status' => 'rejected']);
}

function handleProcessApproval($params) {
    requireAuth();
    $approvalId = $params['id'] ?? '';
    $body = getRequestBody();
    
    jsonResponse(true, "Request {$body['status']}", ['id' => $approvalId, 'status' => $body['status']]);
}

// ============================================
// HALF-DAY HANDLERS (DUMMY - TABLE MISSING)
// ============================================

function handleCreateHalfDay($params) {
    requireAuth();
    $body = getRequestBody();
    
    // Since table doesn't exist, return dummy response
    jsonResponse(true, 'Half-day request created', [
        'id' => 'approval_' . time(),
        'type' => 'half_day',
        'studentId' => $body['studentId'],
        'status' => 'pending',
    ]);
}

function handleGetTodayHalfDay($params) {
    requireAuth();
    
    jsonResponse(true, 'Half-day leaves fetched', []);
}

// ============================================
// ALERT HANDLERS
// ============================================

function handleGetAlerts($params) {
    requireAuth();
    $query = getQueryParams();
    $isAcknowledged = isset($query['isAcknowledged']) ? ($query['isAcknowledged'] === 'true') : null;
    
    $db = getDB();
    
    $stmt = $db->prepare("
        SELECT a.id, a.tripid, a.stageid, a.alerttype, a.senton,
               st.stage as stopName,
               r.route as routeName
        FROM base_bus_stagedelay_alerts a
        JOIN base_bus_stages st ON a.stageid = st.id
        JOIN base_bus_routes r ON st.routeid = r.id
        ORDER BY a.senton DESC
        LIMIT 50
    ");
    $stmt->execute();
    
    $alerts = [];
    while ($row = $stmt->fetch()) {
        $alerts[] = [
            'id' => (string)$row['id'],
            'branchId' => '1',
            'type' => $row['alerttype'] === 'delay' ? 'late_bus' : 'schedule_variance',
            'severity' => 'medium',
            'title' => "Delay at {$row['stopName']}",
            'message' => "Bus on {$row['routeName']} was delayed at {$row['stopName']}",
            'isAcknowledged' => false,
            'createdAt' => $row['senton'],
        ];
    }
    
    jsonResponse(true, 'Alerts fetched', $alerts);
}

function handleAcknowledgeAlert($params) {
    requireAuth();
    $alertId = $params['id'] ?? '';
    
    // In a real implementation, update the alert status
    jsonResponse(true, 'Alert acknowledged', ['id' => $alertId, 'isAcknowledged' => true]);
}

// ============================================
// NOTIFICATION HANDLERS
// ============================================

function handleGetNotifications($params) {
    $auth = requireAuth();
    $query = getQueryParams();
    $unreadOnly = isset($query['unreadOnly']) ? ($query['unreadOnly'] === 'true') : false;
    
    $db = getDB();
    
    $sql = "
        SELECT id, type, message, date, status
        FROM base_useralerts
        WHERE userid = :userId
    ";
    
    if ($unreadOnly) {
        $sql .= " AND status = 0";
    }
    
    $sql .= " ORDER BY date DESC LIMIT 50";
    
    $stmt = $db->prepare($sql);
    $stmt->execute(['userId' => $auth['user_id']]);
    
    $notifications = [];
    while ($row = $stmt->fetch()) {
        $notifications[] = [
            'id' => (string)$row['id'],
            'userId' => (string)$auth['user_id'],
            'title' => ucfirst($row['type']),
            'message' => $row['message'],
            'type' => 'info',
            'isRead' => $row['status'] == 1,
            'createdAt' => $row['date'],
        ];
    }
    
    jsonResponse(true, 'Notifications fetched', $notifications);
}

function handleMarkNotificationRead($params) {
    $auth = requireAuth();
    $notificationId = $params['id'] ?? '';
    
    $db = getDB();
    
    $stmt = $db->prepare("
        UPDATE base_useralerts SET status = 1 WHERE id = :id AND userid = :userId
    ");
    $stmt->execute(['id' => $notificationId, 'userId' => $auth['user_id']]);
    
    jsonResponse(true, 'Marked as read', ['message' => 'Notification marked as read']);
}

function handleMarkAllNotificationsRead($params) {
    $auth = requireAuth();
    
    $db = getDB();
    
    $stmt = $db->prepare("
        UPDATE base_useralerts SET status = 1 WHERE userid = :userId AND status = 0
    ");
    $stmt->execute(['userId' => $auth['user_id']]);
    
    jsonResponse(true, 'All marked as read', ['message' => 'All notifications marked as read']);
}

// ============================================
// SCHOOL HANDLERS
// ============================================

function handleGetSchools($params) {
    requireAuth();
    
    $db = getDB();
    
    $stmt = $db->prepare("
        SELECT schoolid as id, schoolname as name, code, 
               CONCAT(address1, ', ', area, ', ', city) as address
        FROM base_schoolname
        ORDER BY schoolname
    ");
    $stmt->execute();
    
    $schools = [];
    while ($row = $stmt->fetch()) {
        $schools[] = [
            'id' => (string)$row['id'],
            'name' => $row['name'],
            'code' => $row['code'],
            'address' => $row['address'],
            'branches' => [
                [
                    'id' => (string)$row['id'],
                    'schoolId' => (string)$row['id'],
                    'name' => 'Main Branch',
                    'code' => $row['code'] . '-M',
                    'address' => $row['address'],
                ],
            ],
        ];
    }
    
    jsonResponse(true, 'Schools fetched', $schools);
}

// ============================================
// ISSUE HANDLERS
// ============================================

function handleGetIssueCategories($params) {
    requireAuth();
    
    $categories = [
        ['id' => '1', 'name' => 'Vehicle Breakdown', 'icon' => 'car'],
        ['id' => '2', 'name' => 'Student Issue', 'icon' => 'user'],
        ['id' => '3', 'name' => 'Route Problem', 'icon' => 'map'],
        ['id' => '4', 'name' => 'Accident', 'icon' => 'alert-triangle'],
        ['id' => '5', 'name' => 'Schedule Delay', 'icon' => 'clock'],
        ['id' => '6', 'name' => 'Other', 'icon' => 'help-circle'],
    ];
    
    jsonResponse(true, 'Categories fetched', $categories);
}

function handleReportIssue($params) {
    $auth = requireAuth();
    $body = getRequestBody();
    
    // In production, store this in a database
    $ticketId = 'TKT-' . time();
    
    jsonResponse(true, 'Issue reported', ['ticketId' => $ticketId]);
}