const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

// Middleware
app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Serve index page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// In-memory "database"
let users = [];
let exercises = [];

// ✅ 2 & 3. POST /api/users - Create new user
app.post('/api/users', (req, res) => {
  const username = req.body.username;
  const _id = Date.now().toString(); // unique ID

  const newUser = { username, _id };
  users.push(newUser);
  res.json(newUser);
});

// ✅ 4 & 5 & 6. GET /api/users - Return all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// ✅ 7 & 8. POST /api/users/:_id/exercises - Add exercise
app.post('/api/users/:_id/exercises', (req, res) => {
  const { description, duration, date } = req.body;
  const user = users.find((u) => u._id === req.params._id);

  if (!user) {
    return res.json({ error: 'User not found' });
  }

  const exerciseDate = date ? new Date(date) : new Date();
  const exercise = {
    _id: user._id,
    username: user.username,
    description: description,
    duration: parseInt(duration),
    date: exerciseDate.toDateString(),
  };

  exercises.push(exercise);
  res.json(exercise);
});

// ✅ 9–16. GET /api/users/:_id/logs - Retrieve full exercise log
app.get('/api/users/:_id/logs', (req, res) => {
  const user = users.find((u) => u._id === req.params._id);
  if (!user) {
    return res.json({ error: 'User not found' });
  }

  let userLogs = exercises.filter((e) => e._id === user._id);

  // Optional query params: from, to, limit
  const { from, to, limit } = req.query;

  if (from) {
    const fromDate = new Date(from);
    userLogs = userLogs.filter((e) => new Date(e.date) >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    userLogs = userLogs.filter((e) => new Date(e.date) <= toDate);
  }

  if (limit) {
    userLogs = userLogs.slice(0, parseInt(limit));
  }

  const log = userLogs.map((e) => ({
    description: e.description,
    duration: e.duration,
    date: e.date,
  }));

  res.json({
    username: user.username,
    _id: user._id,
    count: log.length,
    log,
  });
});

// Start server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
