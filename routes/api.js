const express = require('express');
const router = express.Router();
const { User, Exercise } = require('../models/user');

router.post('/users', async (req, res) => {
  const { username } = req.body;

  try {
    const newUser = new User({ username });
    await newUser.save();
    res.json({ username: newUser.username, _id: newUser._id });
  } catch (error) {
    res.status(400).json({ error: 'User creation failed' });
  }
});

router.get('/users', async (req, res) => {
  const users = await User.find({}, 'username _id');
  res.json(users);
});

router.post('/users/:_id/exercises', async (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  try {
    const user = await User.findById(_id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const exercise = new Exercise({
      userId: user._id,
      description,
      duration: parseInt(duration),
      date: date ? new Date(date) : new Date()
    });

    await exercise.save();
    res.json({
      username: user.username,
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString(),
      _id: user._id
    });
  } catch (error) {
    res.status(400).json({ error: 'Failed to add exercise' });
  }
});

router.get('/users/:_id/logs', async (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  try {
    const user = await User.findById(_id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    let query = { userId: user._id };

    if (from) query.date = { $gte: new Date(from) };
    if (to) query.date = { ...query.date, $lte: new Date(to) };

    const exercises = await Exercise.find(query)
      .limit(parseInt(limit) || 0)
      .select('description duration date -_id');

    res.json({
      username: user.username,
      count: exercises.length,
      _id: user._id,
      log: exercises.map(ex => ({
        description: ex.description,
        duration: ex.duration,
        date: ex.date.toDateString()
      }))
    });
  } catch (error) {
    res.status(400).json({ error: 'Failed to retrieve logs' });
  }
});

module.exports = router;
