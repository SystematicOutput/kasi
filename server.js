const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-that-should-be-in-env-vars';
const AUTH_COOKIE_NAME = 'kasistays_jwt';

// --- DATABASE CONNECTION ---
// IMPORTANT: Use environment variables in a real application for security.
// Ensure you have a .env file or have set these variables in your environment.
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'matimba2242', // SET YOUR DB PASSWORD HERE OR IN .env
    database: process.env.DB_NAME || 'kasistays'
};

const pool = mysql.createPool(dbConfig);

// Test database connection on startup
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Successfully connected to the MySQL database.');
        connection.release();
    } catch (error) {
        console.error('❌ DATABASE CONNECTION FAILED ❌');
        console.error(`Error: ${error.message}`);
        console.error('Please check your database credentials in server.js and ensure the MySQL server is running.');
        process.exit(1); // Exit if DB connection fails
    }
})();


// --- MIDDLEWARE ---
app.use(express.json()); // To parse JSON bodies
app.use(cookieParser()); // To parse cookies

// Middleware to verify JWT and set user data on req object
const authenticateUser = (req, res, next) => {
    const token = req.cookies[AUTH_COOKIE_NAME];
    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // The decoded payload is attached to the request
        req.user = { id: decoded.id, email: decoded.email, role: decoded.role, is_verified: decoded.isVerified };
    } catch (error) {
        // If token is invalid (e.g., expired), clear the cookie
        console.error('JWT Verification Error:', error.message);
        res.clearCookie(AUTH_COOKIE_NAME, { path: '/' });
    }
    
    next();
};

app.use(authenticateUser);

const isLandlord = (req, res, next) => {
    if (req.user && req.user.role === 'landlord') {
        return next();
    }
    return res.status(403).json({ message: 'Access denied. Landlord role required.' });
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
};

const isStudent = (req, res, next) => {
    if (req.user && req.user.role === 'student') {
        return next();
    }
    return res.status(403).json({ message: 'Access denied. Student role required.' });
};


// --- API ROUTES ---

// [AUTH]
app.post('/api/auth/signup', async (req, res) => {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
        return res.status(400).json({ message: 'Email, password, and role are required.' });
    }
    try {
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        const [result] = await pool.query(
            'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
            [email, passwordHash, role]
        );
        const userProfile = { uid: result.insertId, email, role, isVerified: false };
        
        // Generate JWT
        const tokenPayload = { id: result.insertId, email, role, isVerified: false };
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1d' });

        res.cookie(AUTH_COOKIE_NAME, token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            path: '/' 
        });

        res.status(201).json(userProfile);
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Email already in use.' });
        }
        console.error(error);
        res.status(500).json({ message: 'Database error during sign up.' });
    }
});

app.post('/api/auth/signin', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const match = await bcrypt.compare(password, user.password_hash);
        if (match) {
            const userProfile = { uid: user.id.toString(), email: user.email, role: user.role, isVerified: !!user.is_verified };
            
            // Generate JWT
            const tokenPayload = { id: user.id, email: user.email, role: user.role, isVerified: !!user.is_verified };
            const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1d' });

            res.cookie(AUTH_COOKIE_NAME, token, { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000, // 1 day
                path: '/' 
            });

            res.json(userProfile);
        } else {
            res.status(401).json({ message: 'Invalid credentials.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during sign in.' });
    }
});

app.post('/api/auth/signout', (req, res) => {
    res.clearCookie(AUTH_COOKIE_NAME, { path: '/' });
    res.status(200).json({ message: 'Signed out successfully.' });
});

app.get('/api/auth/me', (req, res) => {
    if (req.user) {
        // Renaming id to uid to match frontend type
        const { id, is_verified, ...rest } = req.user;
        res.json({ uid: id.toString(), isVerified: !!is_verified, ...rest });
    } else {
        res.status(401).json(null);
    }
});


// [DATA]
const mapListingData = (rows) => {
    return rows.map(row => ({
        id: row.id.toString(),
        landlordId: row.landlord_id.toString(),
        title: row.title,
        price: parseFloat(row.price),
        imageUrl: row.imageUrl,
        location: row.location,
        isVerified: !!row.is_landlord_verified, // Landlord's verification status
        isActive: !!row.is_active,
        gpsCoordinates: {
            lat: parseFloat(row.gps_lat),
            lng: parseFloat(row.gps_lng),
        }
    }));
};

app.get('/api/listings', async (req, res) => {
    const { q } = req.query;
    try {
        let query = `
            SELECT
                l.id, l.landlord_id, l.title, l.price_per_month AS price, l.image_url AS imageUrl, l.location_address AS location, l.gps_lat, l.gps_lng, l.is_active, u.is_verified AS is_landlord_verified
            FROM listings l
            JOIN users u ON l.landlord_id = u.id
            WHERE l.is_active = TRUE
        `;
        const params = [];

        if (q) {
            query += ' AND (l.title LIKE ? OR l.location_address LIKE ?)';
            params.push(`%${q}%`, `%${q}%`);
        }

        const [rows] = await pool.query(query, params);
        res.json(mapListingData(rows));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch listings.' });
    }
});

app.post('/api/listings', authenticateUser, isLandlord, async (req, res) => {
    const { title, price, imageUrl, location, gpsLat, gpsLng, description } = req.body;
    if (!title || !price || !location || !gpsLat || !gpsLng) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }
    try {
        const [result] = await pool.query(
            'INSERT INTO listings (landlord_id, title, price_per_month, image_url, location_address, gps_lat, gps_lng, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [req.user.id, title, price, imageUrl || 'https://picsum.photos/400/300?random=' + Date.now(), location, gpsLat, gpsLng, description]
        );
        const [[newListing]] = await pool.query('SELECT * from listings WHERE id = ?', [result.insertId]);
        res.status(201).json(newListing);
    } catch (error) {
        console.error('Failed to create listing:', error);
        res.status(500).json({ message: 'Failed to create listing.' });
    }
});

app.get('/api/listings/recent', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                l.id, l.landlord_id, l.title, l.price_per_month AS price, l.image_url AS imageUrl, l.location_address AS location, l.gps_lat, l.gps_lng, l.created_at, l.is_active, u.is_verified AS is_landlord_verified
            FROM listings l
            JOIN users u ON l.landlord_id = u.id
            WHERE l.is_active = TRUE
            ORDER BY l.created_at DESC
            LIMIT 8;
        `);
        res.json(mapListingData(rows));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch recent listings.' });
    }
});


app.get('/api/providers', async (req, res) => {
    const { q } = req.query;
    try {
        let query = `
            SELECT
                u.id,
                spp.full_name AS name,
                spp.service_category AS service,
                spp.contact_phone AS contact,
                u.profile_image_url AS imageUrl
            FROM users u
            JOIN service_provider_profiles spp ON u.id = spp.user_id
            WHERE u.role = 'provider'
        `;
        const params = [];

        if (q) {
            query += ' AND (spp.full_name LIKE ? OR spp.service_category LIKE ?)';
            params.push(`%${q}%`, `%${q}%`);
        }

        const [rows] = await pool.query(query, params);
        res.json(rows.map(r => ({...r, id: r.id.toString()})));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch service providers.' });
    }
});

// [MAINTENANCE]
app.get('/api/maintenance-requests', authenticateUser, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required.' });
    }
    try {
        let query = 'SELECT id, listing_id AS listingId, issue_description AS issue, status, created_at AS createdAt FROM maintenance_requests WHERE';
        if (req.user.role === 'student') {
            query += ' student_id = ?';
        } else if (req.user.role === 'landlord') {
            query += ' landlord_id = ?';
        } else {
            return res.json([]);
        }
        query += ' ORDER BY createdAt DESC';
        
        const [rows] = await pool.query(query, [req.user.id]);
        res.json(rows.map(r => ({...r, id: r.id.toString(), listingId: r.listingId.toString()})));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch maintenance requests.' });
    }
});





app.post('/api/maintenance-requests', authenticateUser, async (req, res) => {
    if (req.user.role !== 'student') {
        return res.status(403).json({ message: 'Only students can create requests.' });
    }
    const { listingId, issue } = req.body;
    if (!listingId || !issue) {
        return res.status(400).json({ message: 'Listing ID and issue description are required.' });
    }
    try {
                      const [bookingRows] = await pool.query(
              `SELECT b.landlord_id, l.id AS listing_id
               FROM bookings AS b
               JOIN listings AS l ON b.listing_id = l.id
               WHERE b.student_id = ? AND b.status = 'confirmed'`,
              [req.user.id] // student ID from the logged-in user
            );

           

        if (bookingRows.length === 0) {
            return res.status(404).json({ message: 'Booking not found for this student and listing.' });
        }

        const { landlord_id, listing_id } = bookingRows[0]


        // Insert maintenance request
        const [result] = await pool.query(
              'INSERT INTO maintenance_requests (listing_id, student_id, landlord_id, issue_description, status) VALUES (?, ?, ?, ?, ?)',
            [listing_id, req.user.id, landlord_id, issue, 'Open']
          
            );
        res.status(201).json({ id: result.insertId, message: 'Maintenance request created.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create request.' });
    }
});

app.put('/api/maintenance-requests/:id', authenticateUser, async (req, res) => {
    if (!req.user || req.user.role !== 'landlord') {
        return res.status(403).json({ message: 'Permission denied.' });
    }
    const { status } = req.body;
    const { id } = req.params;
    try {
        await pool.query(
            'UPDATE maintenance_requests SET status = ? WHERE id = ? AND landlord_id = ?',
            [status, id, req.user.id]
        );
        res.json({ message: 'Status updated.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update request.' });
    }
});

// [MESSAGING]
// Start or get a conversation
app.post('/api/conversations', authenticateUser, async (req, res) => {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    
    const { recipientId, listingId } = req.body;
    const senderId = req.user.id;

    if (!recipientId) return res.status(400).json({ message: 'Recipient ID is required' });

    try {
        // Check if a conversation between these users for this listing already exists
        const [existing] = await pool.query(`
            SELECT c.id FROM conversations c
            JOIN conversation_participants cp1 ON c.id = cp1.conversation_id AND cp1.user_id = ?
            JOIN conversation_participants cp2 ON c.id = cp2.conversation_id AND cp2.user_id = ?
            WHERE c.listing_id <=> ?
        `, [senderId, recipientId, listingId]);

        if (existing.length > 0) {
            return res.json({ id: existing[0].id.toString() });
        }

        // Create new conversation
        const connection = await pool.getConnection();
        await connection.beginTransaction();
        
        const [convoResult] = await connection.query('INSERT INTO conversations (listing_id) VALUES (?)', [listingId]);
        const conversationId = convoResult.insertId;

        await connection.query('INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?), (?, ?)', [conversationId, senderId, conversationId, recipientId]);
        
        await connection.commit();
        connection.release();

        res.status(201).json({ id: conversationId.toString() });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to start conversation' });
    }
});

// Get all conversations for a user
app.get('/api/conversations', authenticateUser, async (req, res) => {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });

    try {
        const [conversations] = await pool.query(`
            SELECT
                c.id,
                c.listing_id AS listingId,
                l.title AS listingTitle,
                other_user.id AS participantId,
                other_user.email AS participantEmail,
                other_user.profile_image_url as participantImageUrl,
                last_message.content AS lastMessage,
                last_message.created_at AS lastMessageTimestamp
            FROM conversations c
            JOIN conversation_participants cp_self ON c.id = cp_self.conversation_id AND cp_self.user_id = ?
            JOIN conversation_participants cp_other ON c.id = cp_other.conversation_id AND cp_other.user_id != ?
            JOIN users other_user ON cp_other.user_id = other_user.id
            LEFT JOIN listings l ON c.listing_id = l.id
            LEFT JOIN (
                SELECT m.* FROM messages m
                INNER JOIN (
                    SELECT conversation_id, MAX(created_at) as max_created_at
                    FROM messages
                    GROUP BY conversation_id
                ) AS latest_message ON m.conversation_id = latest_message.conversation_id AND m.created_at = latest_message.max_created_at
            ) AS last_message ON c.id = last_message.conversation_id
            ORDER BY last_message.created_at DESC;
        `, [req.user.id, req.user.id]);
        
        res.json(conversations.map(c => ({...c, id: c.id.toString(), participantId: c.participantId.toString() })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch conversations' });
    }
});

// Get messages for a conversation
app.get('/api/conversations/:id/messages', authenticateUser, async (req, res) => {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    
    const { id } = req.params;
    try {
        // Check if user is part of the conversation
        const [participants] = await pool.query('SELECT user_id FROM conversation_participants WHERE conversation_id = ?', [id]);
        if (!participants.some(p => p.user_id == req.user.id)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        
        const [messages] = await pool.query(`
            SELECT id, sender_id AS senderId, content, created_at AS timestamp
            FROM messages
            WHERE conversation_id = ?
            ORDER BY created_at ASC
        `, [id]);
        
        res.json(messages.map(m => ({...m, id: m.id.toString(), senderId: m.senderId.toString() })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
});

// Send a message
app.post('/api/conversations/:id/messages', authenticateUser, async (req, res) => {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    
    const { id } = req.params; // conversationId
    const { content } = req.body;
    try {
        const [participants] = await pool.query('SELECT user_id FROM conversation_participants WHERE conversation_id = ?', [id]);
        if (!participants.some(p => p.user_id == req.user.id)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        
        const [result] = await pool.query(
            'INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)',
            [id, req.user.id, content]
        );
        
        const [newMessage] = await pool.query('SELECT id, sender_id as senderId, content, created_at as timestamp FROM messages WHERE id = ?', [result.insertId]);

        res.status(201).json({...newMessage[0], id: newMessage[0].id.toString(), senderId: newMessage[0].senderId.toString()});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to send message' });
    }
});



// New landlord registration route
app.post('/api/auth/landlord-signup', async (req, res) => {
    const { email, password, fullName, phone, idNumber } = req.body;

    // Basic validation
    if (!email || !password || !fullName || !phone || !idNumber) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. Hash the password
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // 2. Insert new user into the 'users' table
        const [userResult] = await connection.query(
            "INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'landlord')",
            [email, passwordHash]
        );
        const userId = userResult.insertId;

        // 3. Insert a corresponding entry into the 'landlords' table
        await connection.query(
            "INSERT INTO landlords (user_id, fullName, phone, id_number) VALUES (?, ?, ?, ?)",
            [userId, fullName, phone, idNumber]
        );

        await connection.commit();

        res.status(201).json({ message: 'Landlord registered successfully!' });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Landlord registration failed:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'A user with this email already exists.' });
        }
        res.status(500).json({ message: 'Failed to register landlord.' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// --- BOOKING ROUTES ---
// NOTE: These routes assume a `bookings` table exists with a schema like:
// CREATE TABLE bookings (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     listing_id INT NOT NULL,
//     student_id INT NOT NULL,
//     landlord_id INT NOT NULL,
//     status ENUM('pending', 'confirmed', 'declined') NOT NULL DEFAULT 'pending',
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//     FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
//     FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
//     FOREIGN KEY (landlord_id) REFERENCES users(id) ON DELETE CASCADE
// );

app.get('/api/bookings', authenticateUser, async (req, res) => {
    if (!req.user) return res.status(401).json({ message: 'Authentication required.' });

    try {
        let query;
        let params = [req.user.id];
        
        if (req.user.role === 'student') {
            query = `
                SELECT b.id, b.status, b.created_at AS createdAt, l.title as listingTitle, l.id as listingId
                FROM bookings b
                JOIN listings l ON b.listing_id = l.id
                WHERE b.student_id = ?
                ORDER BY b.created_at DESC
            `;
        } else if (req.user.role === 'landlord') {
            query = `
                SELECT b.id, b.status, b.created_at AS createdAt, l.title as listingTitle, u.email as studentEmail, l.id as listingId
                FROM bookings b
                JOIN listings l ON b.listing_id = l.id
                JOIN users u ON b.student_id = u.id
                WHERE b.landlord_id = ?
                ORDER BY b.created_at DESC
            `;
        } else {
            return res.json([]);
        }
        
        const [rows] = await pool.query(query, params);
        res.json(rows.map(r => ({ ...r, id: r.id.toString(), listingId: r.listingId.toString() })));

    } catch (error) {
        console.error('Failed to fetch bookings:', error);
        res.status(500).json({ message: 'Failed to fetch bookings.' });
    }
});

app.post('/api/listings/:listingId/book', authenticateUser, isStudent, async (req, res) => {
    const { listingId } = req.params;
    const studentId = req.user.id;

    try {
        const [[listing]] = await pool.query('SELECT landlord_id, is_active FROM listings WHERE id = ?', [listingId]);
        if (!listing) return res.status(404).json({ message: 'Listing not found.' });
        if (!listing.is_active) return res.status(400).json({ message: 'This listing is no longer available.' });

        const [[existingBooking]] = await pool.query(
            'SELECT id FROM bookings WHERE listing_id = ? AND student_id = ? AND status != "declined"',
            [listingId, studentId]
        );
        if (existingBooking) return res.status(409).json({ message: 'You have already sent a booking request for this listing.' });

        const [result] = await pool.query(
            'INSERT INTO bookings (listing_id, student_id, landlord_id) VALUES (?, ?, ?)',
            [listingId, studentId, listing.landlord_id]
        );
        res.status(201).json({ id: result.insertId, message: 'Booking request sent.' });
    } catch (error) {
        console.error('Failed to create booking:', error);
        res.status(500).json({ message: 'Failed to create booking request.' });
    }
});

app.put('/api/bookings/:bookingId/status', authenticateUser, isLandlord, async (req, res) => {
    const { bookingId } = req.params;
    const { status } = req.body; // 'confirmed' or 'declined'
    const landlordId = req.user.id;
    
    if (!['confirmed', 'declined'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [[booking]] = await connection.query(
            'SELECT id, listing_id FROM bookings WHERE id = ? AND landlord_id = ? AND status = "pending"', 
            [bookingId, landlordId]
        );

        if (!booking) {
            connection.release();
            return res.status(404).json({ message: 'Booking not found or you do not have permission to modify it.' });
        }

        await connection.query('UPDATE bookings SET status = ? WHERE id = ?', [status, bookingId]);

        if (status === 'confirmed') {
            await connection.query('UPDATE listings SET is_active = FALSE WHERE id = ?', [booking.listing_id]);
            await connection.query(
                'UPDATE bookings SET status = "declined" WHERE listing_id = ? AND status = "pending"', 
                [booking.listing_id]
            );
        }

        await connection.commit();
        res.json({ message: `Booking has been ${status}.` });

    } catch (error) {
        await connection.rollback();
        console.error('Failed to update booking status:', error);
        res.status(500).json({ message: 'Failed to update booking status.' });
    } finally {
        connection.release();
    }
});


// --- ADMIN ROUTES ---
const adminRouter = express.Router();
adminRouter.use(authenticateUser, isAdmin);

// Get all users
adminRouter.get('/users', async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, email, role, is_verified, created_at FROM users ORDER BY created_at DESC');
        res.json(users.map(u => ({ uid: u.id.toString(), email: u.email, role: u.role, isVerified: !!u.is_verified, createdAt: u.created_at })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch users.' });
    }
});

// Verify a user (typically a landlord)
adminRouter.put('/users/:id/verify', async (req, res) => {
    const { isVerified } = req.body;
    try {
        await pool.query('UPDATE users SET is_verified = ? WHERE id = ?', [isVerified, req.params.id]);
        res.json({ message: 'User verification status updated.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update user verification.' });
    }
});

// Get all listings for admin
adminRouter.get('/listings', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                l.id, l.landlord_id, l.title, l.price_per_month AS price, l.image_url AS imageUrl, l.location_address AS location, l.gps_lat, l.gps_lng, l.is_active, u.is_verified AS is_landlord_verified
            FROM listings l
            JOIN users u ON l.landlord_id = u.id
            ORDER BY l.created_at DESC
        `);
        res.json(mapListingData(rows));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch all listings.' });
    }
});

// Update listing status (activate/deactivate)
adminRouter.put('/listings/:id/status', async (req, res) => {
    const { isActive } = req.body;
    try {
        await pool.query('UPDATE listings SET is_active = ? WHERE id = ?', [isActive, req.params.id]);
        res.json({ message: 'Listing status updated.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update listing status.' });
    }
});

app.use('/api/admin', adminRouter);


// --- FRONTEND SERVING ---
// In production, serve the built static files from the 'dist' directory
if (process.env.NODE_ENV === 'production') {
    const buildPath = path.join(__dirname, 'dist');
    app.use(express.static(buildPath));

    // SPA Fallback: for any request that doesn't match an API route or a static file,
    // send the React app's index.html file.
    app.get('*', (req, res) => {
      res.sendFile(path.join(buildPath, './Public/index.html'));
    });
}


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    if (process.env.NODE_ENV !== 'production') {
        console.log('Server is in DEVELOPMENT mode. Frontend is served by Vite dev server.');
    } else {
        console.log('Server is in PRODUCTION mode. Serving static files from /dist');
    }
});
