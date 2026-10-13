const { z } = require('zod');
const MeetingRequest = require('../models/MeetingRequest');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const csvProvider = require('../utils/csvDataProvider');
const { getDBStatus } = require('../config/db');

const ingestMeetingSchema = z.object({
  request_id: z.string().uuid(),
  student_id: z.string().min(1),
  college_id: z.string().optional().default('C101'),
  category: z.enum(['meeting', 'academic', 'crisis']),
  urgency: z.enum(['normal', 'urgent']).optional().default('normal'),
  reason_short: z.string().min(1).max(200)
});

async function resolveMentorInfo(studentId) {
  let mentorId = 'FAC_EEC_CSE_001';
  let mentorName = 'Dr. Kavitha Ramanathan';

  try {
    let student = null;
    if (getDBStatus()) {
      student = await Student.findOne({ student_id: studentId });
    }
    if (!student) {
      const studentsList = await csvProvider.getStudentsData();
      student = studentsList.find(s => s.student_id === studentId);
    }

    if (student && student.mentor_id) {
      mentorId = student.mentor_id;
    }

    // Lookup faculty name
    let faculty = null;
    if (getDBStatus()) {
      faculty = await Faculty.findOne({ faculty_id: mentorId });
    }
    if (!faculty) {
      const facultyList = await csvProvider.getFacultyData();
      faculty = facultyList.find(f => f.faculty_id === mentorId);
    }
    if (faculty && faculty.name) {
      mentorName = faculty.name;
    }
  } catch (err) {
    console.warn('[ResolveMentorInfo] Error resolving mentor for student:', err.message);
  }

  return { mentorId, mentorName };
}

const inMemoryRequests = new Map();

exports.inMemoryRequests = inMemoryRequests;
exports.resolveMentorInfo = resolveMentorInfo;

exports.ingestMeetingRequest = async (req, res) => {
  const parseResult = ingestMeetingSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Invalid meeting request payload',
      details: parseResult.error.issues
    });
  }

  const { request_id, student_id, college_id, category, urgency, reason_short } = parseResult.data;
  const computedUrgency = category === 'crisis' ? 'urgent' : urgency;

  try {
    const { mentorId, mentorName } = await resolveMentorInfo(student_id);

    // Idempotency check: if record already exists, return existing
    if (getDBStatus()) {
      const existing = await MeetingRequest.findOne({ request_id });
      if (existing) {
        return res.status(200).json({
          success: true,
          request_id: existing.request_id,
          mentor_id: existing.mentor_id,
          mentor_name: mentorName,
          status: existing.status,
          duplicate: true
        });
      }

      const created = await MeetingRequest.create({
        request_id,
        student_id,
        mentor_id: mentorId,
        college_id: college_id || 'C101',
        category,
        urgency: computedUrgency,
        reason_short,
        status: 'new'
      });

      return res.status(201).json({
        success: true,
        request_id: created.request_id,
        mentor_id: created.mentor_id,
        mentor_name: mentorName,
        status: created.status,
        duplicate: false
      });
    }

    // In-memory / CSV mode fallback
    if (inMemoryRequests.has(request_id)) {
      const existing = inMemoryRequests.get(request_id);
      return res.status(200).json({
        success: true,
        request_id: existing.request_id,
        mentor_id: existing.mentor_id,
        mentor_name: mentorName,
        status: existing.status,
        duplicate: true
      });
    }

    const inMemRecord = {
      request_id,
      student_id,
      mentor_id: mentorId,
      college_id: college_id || 'C101',
      category,
      urgency: computedUrgency,
      reason_short,
      status: 'new',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryRequests.set(request_id, inMemRecord);

    return res.status(201).json({
      success: true,
      request_id,
      mentor_id: mentorId,
      mentor_name: mentorName,
      status: 'new',
      duplicate: false,
      note: 'Database offline; in-memory fallback persisted'
    });
  } catch (err) {
    console.error('[IngestMeetingRequest Error]', err);
    return res.status(500).json({ error: 'Internal meeting ingest error', details: err.message });
  }
};
