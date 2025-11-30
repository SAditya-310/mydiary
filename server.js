import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { entry } from './data.js';
import { note } from './notemodel.js';
const app = express();
app.use(cors());
app.use(express.json());
const userDB = mongoose.createConnection("mongodb+srv://Aditya4743_db_user:hxn39ZOBfMfQkerJ@diary.xhylrag.mongodb.net/users");
const notesDB = mongoose.createConnection("mongodb+srv://Aditya4743_db_user:hxn39ZOBfMfQkerJ@diary.xhylrag.mongodb.net/notes");
const User = userDB.model("second", entry);
const Note = notesDB.model("notes", note);
const maxstreak = async (userId) => {
  const dates = await Note.find({ userId }).sort({ date: 1 });
  let maxStreak = 0, currentStreak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i - 1].date);
    const currDate = new Date(dates[i].date); 
    const diffTime = currDate - prevDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    if (diffDays === 1) {
      currentStreak++;
    } else if (diffDays > 1) {
      maxStreak = Math.max(maxStreak, currentStreak);
      currentStreak = 1;
    }
  }
  return Math.max(maxStreak, currentStreak);
}
app.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const newUser = new User({ name, email, password });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const u = await User.findOne({ email, password });
    if (u) {
      res.status(200).json({ message: "Login Successful", Id: u._id });
    }
    else res.status(401).json({ message: "Invalid credentials" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Notes route
app.post('/note', async (req, res) => {
  try {
    const { title, content, userId, mood } = req.body;
    if (!title || !content || !userId || !mood)
      return res.status(400).json({ message: "All fields required" });
    const today = new Date().toISOString().split("T")[0];
    const existing = await Note.findOne({ userId, date: today });
    if (existing) {
      return res.json({ message: "Note for today already exists" });
    }
    const newNote = new Note({ title, content, userId, mood, date: today });
    await newNote.save();
    res.status(201).json({ message: "Note added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving note" });
  }
});
app.post('/profile', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: "User ID required" });
  const u = await User.findById(userId);
  if (!u) return res.status(404).json({ message: "User not found" });
  const streak = await maxstreak(userId);
  res.status(200).json({ u, streak });
});
app.post('/getnotes', async (req, res) => {
  const { userId } = req.body;

  if (!userId) return res.status(400).json("User ID required");

  const notes = await Note.find({ userId });
  res.status(200).json(notes); // only this user’s notes
});
app.post('/deletenote', async (req, res) => {
  const { title, userId } = req.body;
  const m = await Note.findOneAndDelete({ title, userId });
  if (m) {
    res.status(200).json({ message: "Note deleted successfully" });
  }
  else {
    res.status(404).json({ message: "Note not found" });
  }
});
app.listen(5000, () => console.log("✅ Server running on port 5000"));