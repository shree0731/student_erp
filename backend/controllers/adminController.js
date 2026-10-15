/**
 * Admin Controller
 * Serves:
 * - GET /api/admin/summary (Institutional multi-dimensional aggregations)
 *
 * Implements native MongoDB Aggregation Pipeline ($facet, $group, $cond)
 * per prompt specification.
 */

const Student = require('../models/Student');
const MeetingRequest = require('../models/MeetingRequest');
const { getDBStatus } = require('../config/db');
const csvProvider = require('../utils/csvDataProvider');
const { inMemoryRequests } = require('./integrationController');

const ANONYMIZED_COLLEGE_NAMES = {
  C101: 'Apex Engineering College',
  C102: 'Kavery Residential Institute of Technology',
  C103: 'Modern Institute of Science & Technology',
  C104: 'Sahyadri Deemed University'
};

const getAdminSummary = async (req, res) => {
  try {
    if (req.user && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Administrator privilege required to access institutional summary'
      });
    }

    const { collegeId } = req.query;

    if (getDBStatus()) {
      const matchStage = collegeId ? { $match: { college_id: collegeId } } : { $match: {} };

      // MongoDB Aggregation Pipeline
      const [aggResult] = await Student.aggregate([
        matchStage,
        {
          $facet: {
            overall: [
              {
                $group: {
                  _id: null,
                  totalStudents: { $sum: 1 },
                  avgGpa: { $avg: '$overall_gpa' },
                  avgAttendance: { $avg: '$attendance_pct' },
                  lowAttendanceCount: {
                    $sum: { $cond: [{ $eq: ['$low_attendance_flag', 1] }, 1, 0] }
                  },
                  totalBacklogs: { $sum: '$backlogs_count' }
                }
              }
            ],
            byRiskLabel: [
              {
                $group: {
                  _id: '$dropout_risk_label',
                  count: { $sum: 1 }
                }
              }
            ],
            byDepartment: [
              {
                $group: {
                  _id: '$department',
                  count: { $sum: 1 },
                  avgGpa: { $avg: '$overall_gpa' },
                  avgAttendance: { $avg: '$attendance_pct' },
                  highRiskCount: {
                    $sum: { $cond: [{ $eq: ['$dropout_risk_label', 'High'] }, 1, 0] }
                  },
                  medRiskCount: {
                    $sum: { $cond: [{ $eq: ['$dropout_risk_label', 'Medium'] }, 1, 0] }
                  },
                  lowRiskCount: {
                    $sum: { $cond: [{ $eq: ['$dropout_risk_label', 'Low'] }, 1, 0] }
                  }
                }
              },
              { $sort: { count: -1 } }
            ],
            byCollege: [
              {
                $group: {
                  _id: { college_id: '$college_id', college_name: '$college_name' },
                  count: { $sum: 1 },
                  avgGpa: { $avg: '$overall_gpa' },
                  avgAttendance: { $avg: '$attendance_pct' },
                  highRiskCount: {
                    $sum: { $cond: [{ $eq: ['$dropout_risk_label', 'High'] }, 1, 0] }
                  }
                }
              },
              { $sort: { count: -1 } }
            ],
            byYear: [
              {
                $group: {
                  _id: '$year_of_study',
                  count: { $sum: 1 },
                  avgGpa: { $avg: '$overall_gpa' },
                  highRiskCount: {
                    $sum: { $cond: [{ $eq: ['$dropout_risk_label', 'High'] }, 1, 0] }
                  }
                }
              },
              { $sort: { _id: 1 } }
            ],
            byHomeState: [
              {
                $group: {
                  _id: '$home_state',
                  count: { $sum: 1 },
                  highRiskCount: {
                    $sum: { $cond: [{ $eq: ['$dropout_risk_label', 'High'] }, 1, 0] }
                  }
                }
              },
              { $sort: { count: -1 } }
            ]
          }
        }
      ]);

      const overall = (aggResult && aggResult.overall && aggResult.overall[0]) || {
        totalStudents: 0,
        avgGpa: 0,
        avgAttendance: 0,
        lowAttendanceCount: 0,
        totalBacklogs: 0
      };

      const meetMatch = collegeId ? { college_id: collegeId } : {};
      const meetingDocs = await MeetingRequest.find(meetMatch);
      const meetingRequestsStats = {
        total: meetingDocs.length,
        pending: meetingDocs.filter(m => ['new', 'acknowledged', 'scheduled'].includes(m.status)).length,
        new: meetingDocs.filter(m => m.status === 'new').length,
        acknowledged: meetingDocs.filter(m => m.status === 'acknowledged').length,
        scheduled: meetingDocs.filter(m => m.status === 'scheduled').length,
        resolved: meetingDocs.filter(m => m.status === 'resolved').length,
        cancelled: meetingDocs.filter(m => m.status === 'cancelled').length,
        urgent_open: meetingDocs.filter(m => m.urgency === 'urgent' && ['new', 'acknowledged', 'scheduled'].includes(m.status)).length
      };

      return res.json({
        source: 'mongodb_aggregation_pipeline',
        summary: {
          totalStudents: overall.totalStudents,
          avgGpa: Number(overall.avgGpa.toFixed(2)),
          avgAttendance: Number(overall.avgAttendance.toFixed(1)),
          lowAttendanceCount: overall.lowAttendanceCount,
          totalLowAttendance: overall.lowAttendanceCount,
          totalBacklogs: overall.totalBacklogs,
          meeting_requests: meetingRequestsStats
        },
        meeting_requests: meetingRequestsStats,
        byRiskLabel: aggResult.byRiskLabel,
        byDepartment: aggResult.byDepartment.map(d => ({
          ...d,
          avgGpa: Number(d.avgGpa.toFixed(2)),
          avgAttendance: Number(d.avgAttendance.toFixed(1))
        })),
        byCollege: aggResult.byCollege.map(c => ({
          college_id: c._id.college_id,
          college_name: ANONYMIZED_COLLEGE_NAMES[c._id.college_id] || c._id.college_name,
          count: c.count,
          avgGpa: Number(c.avgGpa.toFixed(2)),
          avgAttendance: Number(c.avgAttendance.toFixed(1)),
          highRiskCount: c.highRiskCount
        })),
        byYear: aggResult.byYear.map(y => ({
          year: y._id,
          count: y.count,
          avgGpa: Number(y.avgGpa.toFixed(2)),
          highRiskCount: y.highRiskCount
        })),
        byHomeState: aggResult.byHomeState || []
      });
    }

    // Fallback in-memory aggregation for offline evaluation
    let students = await csvProvider.getStudentsData();
    if (collegeId) students = students.filter(s => s.college_id === collegeId);

    const totalStudents = students.length;
    const avgGpa = totalStudents ? students.reduce((acc, s) => acc + s.overall_gpa, 0) / totalStudents : 0;
    const avgAttendance = totalStudents ? students.reduce((acc, s) => acc + s.attendance_pct, 0) / totalStudents : 0;
    const lowAttendanceCount = students.filter(s => s.low_attendance_flag === 1).length;
    const totalBacklogs = students.reduce((acc, s) => acc + s.backlogs_count, 0);

    // Group by risk label
    const riskMap = {};
    students.forEach(s => {
      riskMap[s.dropout_risk_label] = (riskMap[s.dropout_risk_label] || 0) + 1;
    });
    const byRiskLabel = Object.entries(riskMap).map(([k, v]) => ({ _id: k, count: v }));

    // Group by Department
    const deptMap = {};
    students.forEach(s => {
      if (!deptMap[s.department]) {
        deptMap[s.department] = { _id: s.department, count: 0, gpaSum: 0, attSum: 0, high: 0, med: 0, low: 0 };
      }
      const d = deptMap[s.department];
      d.count++;
      d.gpaSum += s.overall_gpa;
      d.attSum += s.attendance_pct;
      if (s.dropout_risk_label === 'High') d.high++;
      else if (s.dropout_risk_label === 'Medium') d.med++;
      else d.low++;
    });

    const byDepartment = Object.values(deptMap).map(d => ({
      _id: d._id,
      count: d.count,
      avgGpa: Number((d.gpaSum / d.count).toFixed(2)),
      avgAttendance: Number((d.attSum / d.count).toFixed(1)),
      highRiskCount: d.high,
      medRiskCount: d.med,
      lowRiskCount: d.low
    }));

    // Group by College
    const colMap = {};
    students.forEach(s => {
      if (!colMap[s.college_id]) {
        colMap[s.college_id] = { college_id: s.college_id, college_name: s.college_name, count: 0, gpaSum: 0, attSum: 0, high: 0 };
      }
      const c = colMap[s.college_id];
      c.count++;
      c.gpaSum += s.overall_gpa;
      c.attSum += s.attendance_pct;
      if (s.dropout_risk_label === 'High') c.high++;
    });

    const byCollege = Object.values(colMap).map(c => ({
      college_id: c.college_id,
      college_name: c.college_name,
      count: c.count,
      avgGpa: Number((c.gpaSum / c.count).toFixed(2)),
      avgAttendance: Number((c.attSum / c.count).toFixed(1)),
      highRiskCount: c.high
    }));

    // Group by Year
    const yearMap = {};
    students.forEach(s => {
      if (!yearMap[s.year_of_study]) {
        yearMap[s.year_of_study] = { year: s.year_of_study, count: 0, gpaSum: 0, high: 0 };
      }
      const y = yearMap[s.year_of_study];
      y.count++;
      y.gpaSum += s.overall_gpa;
      if (s.dropout_risk_label === 'High') y.high++;
    });

    const byYear = Object.values(yearMap).sort((a, b) => a.year - b.year).map(y => ({
      year: y.year,
      count: y.count,
      avgGpa: Number((y.gpaSum / y.count).toFixed(2)),
      highRiskCount: y.high
    }));

    // Group by Home State
    const stateMap = {};
    students.forEach(s => {
      const st = s.home_state || 'Unknown';
      if (!stateMap[st]) {
        stateMap[st] = { _id: st, count: 0, high: 0 };
      }
      stateMap[st].count++;
      if (s.dropout_risk_label === 'High') stateMap[st].high++;
    });
    const byHomeState = Object.values(stateMap)
      .sort((a, b) => b.count - a.count)
      .map(h => ({ _id: h._id, count: h.count, highRiskCount: h.high }));

    let memDocs = Array.from(inMemoryRequests.values());
    if (collegeId) memDocs = memDocs.filter(m => m.college_id === collegeId);
    const meetingRequestsStats = {
      total: memDocs.length,
      pending: memDocs.filter(m => ['new', 'acknowledged', 'scheduled'].includes(m.status)).length,
      new: memDocs.filter(m => m.status === 'new').length,
      acknowledged: memDocs.filter(m => m.status === 'acknowledged').length,
      scheduled: memDocs.filter(m => m.status === 'scheduled').length,
      resolved: memDocs.filter(m => m.status === 'resolved').length,
      cancelled: memDocs.filter(m => m.status === 'cancelled').length,
      urgent_open: memDocs.filter(m => m.urgency === 'urgent' && ['new', 'acknowledged', 'scheduled'].includes(m.status)).length
    };

    return res.json({
      source: 'csv_dataset_aggregation',
      summary: {
        totalStudents,
        avgGpa: Number(avgGpa.toFixed(2)),
        avgAttendance: Number(avgAttendance.toFixed(1)),
        lowAttendanceCount,
        totalLowAttendance: lowAttendanceCount,
        totalBacklogs,
        meeting_requests: meetingRequestsStats
      },
      meeting_requests: meetingRequestsStats,
      byRiskLabel,
      byDepartment,
      byCollege,
      byYear,
      byHomeState
    });
  } catch (err) {
    console.error('Error computing admin summary:', err);
    res.status(500).json({ error: 'Server error computing admin summary', details: err.message });
  }
};

module.exports = {
  getAdminSummary
};
