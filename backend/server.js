const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

const dbPath = process.env.DB_PATH || path.join(__dirname, 'spy_decoder.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS completion_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      messages_decoded INTEGER NOT NULL,
      four_decoded_at DATETIME,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id)
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_four_decoded_at ON completion_records(four_decoded_at)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_user_id ON completion_records(user_id)`);
});

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

app.post('/api/auth/login', (req, res) => {
  const { email, firstName, lastName } = req.body;

  if (!email || !firstName || !lastName) {
    return res.status(400).json({ error: 'Email, first name, and last name are required' });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      db.run(
        'INSERT INTO users (email, first_name, last_name) VALUES (?, ?, ?)',
        [email, firstName, lastName],
        function(err) {
          if (err) {
            console.error('Insert user error:', err);
            return res.status(500).json({ error: 'Failed to create user' });
          }
          
          const userId = this.lastID;
          const newUser = {
            id: userId,
            email,
            first_name: firstName,
            last_name: lastName
          };
          
          db.run(
            'INSERT INTO completion_records (user_id, messages_decoded) VALUES (?, 0)',
            [userId],
            (err) => {
              if (err) {
                console.error('Insert record error:', err);
                return res.status(500).json({ error: 'Failed to create record' });
              }
              
              db.get(
                'SELECT * FROM completion_records WHERE user_id = ?',
                [userId],
                (err, record) => {
                  if (err) {
                    console.error('Get record error:', err);
                    return res.status(500).json({ error: 'Database error' });
                  }
                  
                  res.json({ 
                    user: {
                      id: newUser.id,
                      email: newUser.email,
                      firstName: newUser.first_name,
                      lastName: newUser.last_name
                    },
                    completionRecord: record
                  });
                }
              );
            }
          );
        }
      );
    } else {
      db.run(
        'UPDATE users SET first_name = ?, last_name = ? WHERE id = ?',
        [firstName, lastName, user.id],
        (err) => {
          if (err) {
            console.error('Update user error:', err);
            return res.status(500).json({ error: 'Failed to update user' });
          }
          
          user.first_name = firstName;
          user.last_name = lastName;
          
          db.get(
            'SELECT * FROM completion_records WHERE user_id = ?',
            [user.id],
            (err, record) => {
              if (err) {
                console.error('Get record error:', err);
                return res.status(500).json({ error: 'Database error' });
              }
              
              if (!record) {
                db.run(
                  'INSERT INTO completion_records (user_id, messages_decoded) VALUES (?, 0)',
                  [user.id],
                  (err) => {
                    if (err) {
                      console.error('Insert record error:', err);
                      return res.status(500).json({ error: 'Failed to create record' });
                    }
                    
                    res.json({ 
                      user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.first_name,
                        lastName: user.last_name
                      },
                      completionRecord: { user_id: user.id, messages_decoded: 0 }
                    });
                  }
                );
              } else {
                res.json({ 
                  user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name
                  },
                  completionRecord: record
                });
              }
            }
          );
        }
      );
    }
  });
});

app.post('/api/progress/update', (req, res) => {
  const { userId, messagesDecoded } = req.body;

  if (!userId || messagesDecoded === undefined) {
    return res.status(400).json({ error: 'User ID and messages decoded count are required' });
  }

  db.get(
    'SELECT * FROM completion_records WHERE user_id = ?',
    [userId],
    (err, currentRecord) => {
      if (err) {
        console.error('Get record error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (!currentRecord) {
        return res.status(404).json({ error: 'User record not found' });
      }

      const now = new Date().toISOString();
      let query, params;

      if (!currentRecord.four_decoded_at && messagesDecoded >= 4) {
        query = `UPDATE completion_records 
                 SET messages_decoded = ?, four_decoded_at = ?, last_updated = ? 
                 WHERE user_id = ?`;
        params = [messagesDecoded, now, now, userId];
      } else {
        query = `UPDATE completion_records 
                 SET messages_decoded = ?, last_updated = ? 
                 WHERE user_id = ?`;
        params = [messagesDecoded, now, userId];
      }

      db.run(query, params, (err) => {
        if (err) {
          console.error('Update record error:', err);
          return res.status(500).json({ error: 'Failed to update progress' });
        }

        db.get(
          'SELECT * FROM completion_records WHERE user_id = ?',
          [userId],
          (err, updatedRecord) => {
            if (err) {
              console.error('Get updated record error:', err);
              return res.status(500).json({ error: 'Database error' });
            }

            res.json(updatedRecord);
          }
        );
      });
    }
  );
});

app.get('/api/leaderboard', (req, res) => {
  db.all(
    `SELECT 
      u.first_name,
      u.last_name,
      cr.messages_decoded,
      cr.four_decoded_at
    FROM completion_records cr
    JOIN users u ON cr.user_id = u.id
    WHERE cr.four_decoded_at IS NOT NULL
    ORDER BY cr.four_decoded_at ASC, cr.messages_decoded DESC`,
    [],
    (err, rows) => {
      if (err) {
        console.error('Leaderboard error:', err);
        return res.status(500).json({ error: 'Failed to fetch leaderboard' });
      }

      const formattedLeaderboard = rows.map((entry, index) => ({
        rank: index + 1,
        displayName: `${entry.first_name} ${entry.last_name.charAt(0)}.`,
        messagesDecoded: entry.messages_decoded,
        fourDecodedAt: entry.four_decoded_at,
        completionTime: new Date(entry.four_decoded_at).toLocaleString()
      }));

      res.json(formattedLeaderboard);
    }
  );
});

app.post('/api/admin/authenticate', (req, res) => {
  const { email, password } = req.body;
  
  // Check for admin credentials
  if (email === 'edward.kerr@rackspace.com' && password === 'rxtproduct25') {
    res.json({ success: true, isAdmin: true });
  } else {
    res.status(401).json({ error: 'Invalid admin credentials' });
  }
});

app.get('/api/admin/export-csv', (req, res) => {
  // Check admin auth header
  const authHeader = req.headers.authorization;
  if (authHeader !== 'Admin edward.kerr@rackspace.com') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  db.all(
    `SELECT 
      u.email,
      u.first_name,
      u.last_name,
      cr.messages_decoded,
      cr.four_decoded_at,
      u.created_at
    FROM users u
    LEFT JOIN completion_records cr ON u.id = cr.user_id
    ORDER BY cr.four_decoded_at ASC NULLS LAST, cr.messages_decoded DESC`,
    [],
    (err, rows) => {
      if (err) {
        console.error('Export error:', err);
        return res.status(500).json({ error: 'Failed to export data' });
      }

      // Create CSV content
      let csv = 'Email,First Name,Last Name,Messages Decoded,Completed At,Registered At\n';
      
      rows.forEach(row => {
        csv += `"${row.email}","${row.first_name}","${row.last_name}",`;
        csv += `${row.messages_decoded || 0},`;
        csv += `"${row.four_decoded_at || 'Not completed'}",`;
        csv += `"${row.created_at}"\n`;
      });

      // Set headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="spy-decoder-export-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csv);
    }
  );
});

app.get('/api/admin/stats', (req, res) => {
  // Check admin auth header
  const authHeader = req.headers.authorization;
  if (authHeader !== 'Admin edward.kerr@rackspace.com') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  db.get(
    `SELECT 
      COUNT(DISTINCT u.id) as total_users,
      COUNT(DISTINCT CASE WHEN cr.four_decoded_at IS NOT NULL THEN u.id END) as completed_users,
      SUM(cr.messages_decoded) as total_messages_decoded,
      AVG(cr.messages_decoded) as avg_messages_per_user
    FROM users u
    LEFT JOIN completion_records cr ON u.id = cr.user_id`,
    [],
    (err, stats) => {
      if (err) {
        console.error('Stats error:', err);
        return res.status(500).json({ error: 'Failed to get stats' });
      }

      res.json({
        totalUsers: stats.total_users || 0,
        completedUsers: stats.completed_users || 0,
        totalMessagesDecoded: stats.total_messages_decoded || 0,
        avgMessagesPerUser: Math.round(stats.avg_messages_per_user || 0),
        completionRate: stats.total_users > 0 
          ? Math.round((stats.completed_users / stats.total_users) * 100) 
          : 0
      });
    }
  );
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});