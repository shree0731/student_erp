const MeetingRequest = require('../models/MeetingRequest');
const { ActionLogStore } = require('../models/ActionLog');
const { getDBStatus } = require('../config/db');
const { inMemoryRequests } = require('../controllers/integrationController');
const notificationDispatcher = require('./notificationDispatcher');

/**
 * Server-side Idempotent Action Engine for Student Risk Assessments
 * 
 * Rules:
 * - High: creates 1 urgent meeting request + 1 mentor_alert dispatch + 1 parent_alert dispatch.
 * - Medium: creates 1 normal advisory meeting request + 1 mentor_alert dispatch.
 * - Low: no meeting request and no email. Logs "No intervention needed".
 * - Email or dispatcher failures must NEVER fail the assessment or throw.
 * - Idempotent per assessment_id: same assessment_id never acts twice.
 */
async function executeAssessmentActions({
  assessment_id,
  student_id,
  student_name = '',
  mentor_id,
  college_id = 'C101',
  prediction
}) {
  if (!assessment_id) {
    throw new Error('assessment_id is required for action engine execution');
  }

  // 1. Idempotency Check: if actions already logged for this assessment_id, return immediately
  const existingLogs = await ActionLogStore.findByAssessmentId(assessment_id);
  if (existingLogs && existingLogs.length > 0) {
    return {
      idempotent: true,
      logs: existingLogs
    };
  }

  const logs = [];

  if (prediction === 'High') {
    // Step 1: Create Urgent Meeting Request
    const requestId = `REQ_URGENT_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const meetingData = {
      request_id: requestId,
      student_id,
      student_name,
      mentor_id,
      college_id,
      category: 'crisis',
      urgency: 'urgent',
      status: 'new',
      reason_short: 'High dropout risk detected via automated assessment'
    };

    try {
      if (getDBStatus()) {
        await MeetingRequest.create(meetingData);
      }
      inMemoryRequests.set(requestId, {
        ...meetingData,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const log = await ActionLogStore.create({
        assessment_id,
        student_id,
        step: 'create_urgent_meeting',
        status: 'ok',
        detail: `Created urgent meeting request: ${requestId}`,
        at: new Date()
      });
      logs.push(log);
    } catch (meetingErr) {
      console.error('[Action Engine] Failed to create urgent meeting:', meetingErr.message);
      const log = await ActionLogStore.create({
        assessment_id,
        student_id,
        step: 'create_urgent_meeting',
        status: 'failed',
        detail: meetingErr.message,
        at: new Date()
      });
      logs.push(log);
    }

    // Step 2: Dispatch Mentor Alert
    try {
      const mentorResult = await notificationDispatcher.dispatch({
        event_type: 'mentor_alert',
        student_id,
        mentor_id,
        college_id,
        subject: `CRITICAL ALERT: High Dropout Risk Assessed for ${student_name || student_id}`,
        body_text: `Student ${student_name || student_id} has been assessed as HIGH dropout risk. Immediate advisory intervention is recommended.`,
        idempotency_key: `${assessment_id}-mentor-alert`,
        risk_level: 'High'
      });

      const log = await ActionLogStore.create({
        assessment_id,
        student_id,
        step: 'dispatch_mentor_alert',
        status: mentorResult.status === 'failed' ? 'failed' : 'ok',
        detail: mentorResult.status === 'failed' ? (mentorResult.error || 'Failed to dispatch') : `Dispatched via ${mentorResult.channel || 'notification service'}`,
        at: new Date()
      });
      logs.push(log);
    } catch (dispErr) {
      console.error('[Action Engine] Mentor alert dispatch error:', dispErr.message);
      const log = await ActionLogStore.create({
        assessment_id,
        student_id,
        step: 'dispatch_mentor_alert',
        status: 'failed',
        detail: dispErr.message,
        at: new Date()
      });
      logs.push(log);
    }

    // Step 3: Dispatch Parent Alert
    try {
      const parentResult = await notificationDispatcher.dispatch({
        event_type: 'parent_alert',
        student_id,
        mentor_id,
        college_id,
        subject: `Official Academic Notice: Student Risk Assessment for ${student_name || student_id}`,
        body_text: `Official academic advisory notification regarding student ${student_name || student_id}. High dropout risk indicators detected.`,
        idempotency_key: `${assessment_id}-parent-alert`,
        risk_level: 'High'
      });

      const log = await ActionLogStore.create({
        assessment_id,
        student_id,
        step: 'dispatch_parent_alert',
        status: parentResult.status === 'failed' ? 'failed' : 'ok',
        detail: parentResult.status === 'failed' ? (parentResult.error || 'Failed to dispatch') : `Dispatched via ${parentResult.channel || 'notification service'}`,
        at: new Date()
      });
      logs.push(log);
    } catch (dispErr) {
      console.error('[Action Engine] Parent alert dispatch error:', dispErr.message);
      const log = await ActionLogStore.create({
        assessment_id,
        student_id,
        step: 'dispatch_parent_alert',
        status: 'failed',
        detail: dispErr.message,
        at: new Date()
      });
      logs.push(log);
    }

  } else if (prediction === 'Medium') {
    // Step 1: Create Normal Advisory Meeting Request
    const requestId = `REQ_ADV_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const meetingData = {
      request_id: requestId,
      student_id,
      student_name,
      mentor_id,
      college_id,
      category: 'meeting',
      urgency: 'normal',
      status: 'new',
      reason_short: 'Medium dropout risk detected via automated assessment'
    };

    try {
      if (getDBStatus()) {
        await MeetingRequest.create(meetingData);
      }
      inMemoryRequests.set(requestId, {
        ...meetingData,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const log = await ActionLogStore.create({
        assessment_id,
        student_id,
        step: 'create_advisory_meeting',
        status: 'ok',
        detail: `Created advisory meeting request: ${requestId}`,
        at: new Date()
      });
      logs.push(log);
    } catch (meetingErr) {
      console.error('[Action Engine] Failed to create advisory meeting:', meetingErr.message);
      const log = await ActionLogStore.create({
        assessment_id,
        student_id,
        step: 'create_advisory_meeting',
        status: 'failed',
        detail: meetingErr.message,
        at: new Date()
      });
      logs.push(log);
    }

    // Step 2: Dispatch Mentor Alert
    try {
      const mentorResult = await notificationDispatcher.dispatch({
        event_type: 'mentor_alert',
        student_id,
        mentor_id,
        college_id,
        subject: `Advisory Notice: Medium Dropout Risk Assessed for ${student_name || student_id}`,
        body_text: `Student ${student_name || student_id} has been assessed as MEDIUM dropout risk. Proactive advisory meeting recommended.`,
        idempotency_key: `${assessment_id}-mentor-alert`,
        risk_level: 'Medium'
      });

      const log = await ActionLogStore.create({
        assessment_id,
        student_id,
        step: 'dispatch_mentor_alert',
        status: mentorResult.status === 'failed' ? 'failed' : 'ok',
        detail: mentorResult.status === 'failed' ? (mentorResult.error || 'Failed to dispatch') : `Dispatched via ${mentorResult.channel || 'notification service'}`,
        at: new Date()
      });
      logs.push(log);
    } catch (dispErr) {
      console.error('[Action Engine] Mentor alert dispatch error:', dispErr.message);
      const log = await ActionLogStore.create({
        assessment_id,
        student_id,
        step: 'dispatch_mentor_alert',
        status: 'failed',
        detail: dispErr.message,
        at: new Date()
      });
      logs.push(log);
    }

  } else {
    // Low Risk: no request and no email. Log "No intervention needed".
    const log = await ActionLogStore.create({
      assessment_id,
      student_id,
      step: 'evaluate_interventions',
      status: 'skipped',
      detail: 'No intervention needed',
      at: new Date()
    });
    logs.push(log);
  }

  return {
    idempotent: false,
    logs
  };
}

module.exports = {
  executeAssessmentActions
};
