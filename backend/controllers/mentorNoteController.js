const crypto = require('crypto');
const MentorNote = require('../models/MentorNote');
const Student = require('../models/Student');
const csvProvider = require('../utils/csvDataProvider');
const { getDBStatus } = require('../config/db');

// In-memory store when database is offline / running in resilient CSV mode
const inMemoryNotes = new Map();

/**
 * Helper to resolve student record and mentor assignment
 */
async function resolveStudent(studentId) {
  if (getDBStatus()) {
    const s = await Student.findOne({ student_id: studentId });
    if (s) return s.toObject ? s.toObject() : s;
  }
  const students = await csvProvider.getStudentsData();
  return students.find(s => s.student_id === studentId) || null;
}

/**
 * GET /api/students/:id/notes
 * Scoped: Mentors can only read notes for their own mentees; admins can read any.
 */
exports.getNotes = async (req, res) => {
  const user = req.user;
  const studentId = req.params.id;

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const student = await resolveStudent(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (user.role === 'mentor' && student.mentor_id !== user.linkedId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Mentors are only permitted to access notes for their assigned mentees'
      });
    }

    if (getDBStatus()) {
      const notes = await MentorNote.find({ student_id: studentId }).sort({ createdAt: -1 });
      return res.json({
        success: true,
        count: notes.length,
        data: notes
      });
    }

    // In-memory fallback
    const studentNotes = Array.from(inMemoryNotes.values())
      .filter(n => n.student_id === studentId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({
      success: true,
      count: studentNotes.length,
      data: studentNotes
    });
  } catch (err) {
    console.error('[GetNotes Error]', err);
    return res.status(500).json({ error: 'Failed to retrieve mentor notes' });
  }
};

/**
 * POST /api/students/:id/notes
 * Body: { note } (trimmed, 1-2000 chars)
 * Mentors can only add notes to their own mentees.
 */
exports.createNote = async (req, res) => {
  const user = req.user;
  const studentId = req.params.id;
  const { note } = req.body;

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!note || typeof note !== 'string' || note.trim().length === 0) {
    return res.status(400).json({ error: 'Validation Error', message: 'Note content cannot be empty' });
  }

  const trimmedNote = note.trim();
  if (trimmedNote.length > 2000) {
    return res.status(400).json({ error: 'Validation Error', message: 'Note content cannot exceed 2000 characters' });
  }

  try {
    const student = await resolveStudent(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (user.role === 'mentor' && student.mentor_id !== user.linkedId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Mentors are only permitted to add notes to their assigned mentees'
      });
    }

    const mentorId = user.linkedId;

    if (getDBStatus()) {
      const noteDoc = await MentorNote.create({
        student_id: studentId,
        mentor_id: mentorId,
        note: trimmedNote
      });

      return res.status(201).json({
        success: true,
        data: noteDoc
      });
    }

    // In-memory fallback
    const noteId = crypto.randomUUID();
    const noteDoc = {
      _id: noteId,
      student_id: studentId,
      mentor_id: mentorId,
      note: trimmedNote,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryNotes.set(noteId, noteDoc);

    return res.status(201).json({
      success: true,
      data: noteDoc
    });
  } catch (err) {
    console.error('[CreateNote Error]', err);
    return res.status(500).json({ error: 'Failed to save mentor note' });
  }
};

/**
 * DELETE /api/students/:id/notes/:noteId
 * Authorized for author mentor or admin
 */
exports.deleteNote = async (req, res) => {
  const user = req.user;
  const { id: studentId, noteId } = req.params;

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (getDBStatus()) {
      const note = await MentorNote.findById(noteId);
      if (!note || note.student_id !== studentId) {
        return res.status(404).json({ error: 'Note not found' });
      }

      if (user.role !== 'admin' && note.mentor_id !== user.linkedId) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only delete your own notes'
        });
      }

      await MentorNote.findByIdAndDelete(noteId);
      return res.json({ success: true, message: 'Note deleted' });
    }

    // In-memory fallback
    const note = inMemoryNotes.get(noteId);
    if (!note || note.student_id !== studentId) {
      return res.status(404).json({ error: 'Note not found' });
    }

    if (user.role !== 'admin' && note.mentor_id !== user.linkedId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete your own notes'
      });
    }

    inMemoryNotes.delete(noteId);
    return res.json({ success: true, message: 'Note deleted' });
  } catch (err) {
    console.error('[DeleteNote Error]', err);
    return res.status(500).json({ error: 'Failed to delete note' });
  }
};

/**
 * PUT /api/students/:id/notes
 * Body: { note } (trimmed, 1-2000 chars)
 * Upserts exactly ONE note for this (student_id, mentor_id).
 * Mentors can only update notes for their assigned mentees.
 * Students get 403.
 * Over 2000 chars returns 422.
 */
exports.upsertNote = async (req, res) => {
  const user = req.user;
  const studentId = req.params.id;
  const { note } = req.body;

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (user.role === 'student') {
    return res.status(403).json({ error: 'Forbidden', message: 'Students cannot update mentor notes' });
  }

  const noteStr = typeof note === 'string' ? note : String(note || '');
  const trimmedNote = noteStr.trim();

  if (trimmedNote.length > 2000) {
    return res.status(422).json({ error: 'Validation Error', message: 'Note content cannot exceed 2000 characters' });
  }

  try {
    const student = await resolveStudent(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (user.role === 'mentor' && student.mentor_id !== user.linkedId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Mentors are only permitted to update notes for their assigned mentees'
      });
    }

    const mentorId = user.linkedId;

    // Empty note clears the stored note
    if (trimmedNote.length === 0) {
      if (getDBStatus()) {
        await MentorNote.deleteMany({ student_id: studentId, mentor_id: mentorId });
      } else {
        for (const [key, n] of inMemoryNotes.entries()) {
          if (n.student_id === studentId && n.mentor_id === mentorId) {
            inMemoryNotes.delete(key);
          }
        }
      }
      return res.json({ success: true, message: 'Note cleared', data: null });
    }

    if (getDBStatus()) {
      let existingNote = await MentorNote.findOne({ student_id: studentId, mentor_id: mentorId });
      if (existingNote) {
        existingNote.note = trimmedNote;
        existingNote.updatedAt = new Date();
        await existingNote.save();
        return res.json({ success: true, data: existingNote });
      }

      const noteDoc = await MentorNote.create({
        student_id: studentId,
        mentor_id: mentorId,
        note: trimmedNote
      });

      return res.status(200).json({ success: true, data: noteDoc });
    }

    // In-memory fallback
    let existingNote = Array.from(inMemoryNotes.values()).find(
      n => n.student_id === studentId && n.mentor_id === mentorId
    );

    if (existingNote) {
      existingNote.note = trimmedNote;
      existingNote.updatedAt = new Date();
      return res.json({ success: true, data: existingNote });
    }

    const noteId = crypto.randomUUID();
    const noteDoc = {
      _id: noteId,
      student_id: studentId,
      mentor_id: mentorId,
      note: trimmedNote,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryNotes.set(noteId, noteDoc);

    return res.status(200).json({ success: true, data: noteDoc });
  } catch (err) {
    console.error('[UpsertNote Error]', err);
    return res.status(500).json({ error: 'Failed to upsert mentor note' });
  }
};

// Export in-memory store for testing inspection
exports.inMemoryNotes = inMemoryNotes;
