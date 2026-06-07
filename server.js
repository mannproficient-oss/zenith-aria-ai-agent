 require('dotenv').config();
const express = require('express');
const twilio = require('twilio');
const cors = require('cors');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// ── Lead Scoring Engine ────────────────────────────────────────────
async function updateLeadScore(phone) {
  try {
    // Find lead by phone
    const leadsSnap = await db.collection('leads').where('phone', '==', phone).get();
    if (leadsSnap.empty) return;

    const leadDoc = leadsSnap.docs[0];
    const leadData = leadDoc.data();

    // Get all calls for this phone
    const callsSnap = await db.collection('calls').where('to', '==', phone).get();
    const calls = callsSnap.docs.map(d => d.data());

    // Calculate score
    let score = 0;
    const breakdown = [];

    const completedCalls = calls.filter(c => c.status === 'completed');
    const failedCalls = calls.filter(c => c.status === 'failed' || c.status === 'busy' || c.status === 'no-answer');
    const totalDuration = calls.reduce((sum, c) => sum + (c.duration || 0), 0);
    const avgDuration = completedCalls.length > 0 ? totalDuration / completedCalls.length : 0;

    // Scoring rules
    if (completedCalls.length >= 1) { score += 20; breakdown.push({ rule: 'First call completed', points: 20 }); }
    if (completedCalls.length >= 2) { score += 15; breakdown.push({ rule: '2+ completed calls', points: 15 }); }
    if (completedCalls.length >= 3) { score += 10; breakdown.push({ rule: '3+ completed calls', points: 10 }); }
    if (avgDuration >= 120) { score += 20; breakdown.push({ rule: 'Long conversation (2+ min)', points: 20 }); }
    else if (avgDuration >= 60) { score += 10; breakdown.push({ rule: 'Good conversation (1+ min)', points: 10 }); }
    if (calls.length >= 3) { score += 10; breakdown.push({ rule: 'High engagement (3+ calls)', points: 10 }); }
    if (failedCalls.length >= 2) { score -= 10; breakdown.push({ rule: 'Multiple failed attempts', points: -10 }); }
    if (completedCalls.length === 0 && calls.length >= 1) { score -= 5; breakdown.push({ rule: 'No completed calls yet', points: -5 }); }

    // Bonus for existing interest level
    if (leadData.interest === 'Hot') { score += 15; breakdown.push({ rule: 'Marked as Hot lead', points: 15 }); }
    else if (leadData.interest === 'Warm') { score += 5; breakdown.push({ rule: 'Marked as Warm lead', points: 5 }); }

    // Cap score between 0-100
    score = Math.max(0, Math.min(100, score));

    // Determine grade
    let grade, color;
    if (score >= 80) { grade = 'Hot'; color = '#e11d48'; }
    else if (score >= 50) { grade = 'Warm'; color = '#d97706'; }
    else if (score >= 20) { grade = 'Cold'; color = '#64748b'; }
    else { grade = 'New'; color = '#94a3b8'; }

    // Update lead in Firestore
    await leadDoc.ref.update({
      score,
      grade,
      scoreBreakdown: breakdown,
      totalCalls: calls.length,
      completedCalls: completedCalls.length,
      totalDuration,
      avgDuration: Math.round(avgDuration),
      lastCalled: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`📊 Lead score updated: ${phone} → ${score}/100 (${grade})`);
    return { score, grade, breakdown };
  } catch (err) {
    console.error('Score update error:', err.message);
  }
}

// ── Health Check ───────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'Aria server running ✅', firebase: 'connected ✅', scoring: 'enabled ✅' });
});

// ── Outbound Call ──────────────────────────────────────────────────
app.post('/call', async (req, res) => {
  const { to, leadName } = req.body;
  if (!to) return res.status(400).json({ error: 'Missing phone number' });
  try {
    const call = await client.calls.create({
      to, from: process.env.TWILIO_PHONE_NUMBER,
      url: `${process.env.BASE_URL}/twiml`,
      statusCallback: `${process.env.BASE_URL}/call-status`,
      statusCallbackMethod: 'POST',
      statusCallbackEvent: ['initiated','ringing','answered','completed'],
      record: true,
    });

    await db.collection('calls').doc(call.sid).set({
      callSid: call.sid, to, from: process.env.TWILIO_PHONE_NUMBER,
      status: call.status, leadName: leadName || null,
      agentId: process.env.ELEVENLABS_AGENT_ID,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      duration: null, recordingUrl: null, transcript: null,
    });

    // Update lead call count immediately
    const leadsSnap = await db.collection('leads').where('phone', '==', to).get();
    if (!leadsSnap.empty) {
      await leadsSnap.docs[0].ref.update({
        callCount: admin.firestore.FieldValue.increment(1),
        lastCalled: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    console.log(`✅ Call initiated: ${call.sid} → ${to}`);
    res.json({ success: true, callSid: call.sid, status: call.status, to: call.to });
  } catch (err) {
    console.error('Call error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── TwiML ──────────────────────────────────────────────────────────
app.post('/twiml', (req, res) => {
  res.set('Content-Type', 'text/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?><Response><Connect><Stream url="wss://api.elevenlabs.io/v1/convai/twilio?agent_id=${process.env.ELEVENLABS_AGENT_ID}" /></Connect></Response>`);
});

// ── Real-time Call Status + Lead Scoring ──────────────────────────
app.post('/call-status', async (req, res) => {
  const { CallSid, CallStatus, CallDuration, RecordingUrl, To } = req.body;
  console.log(`📞 ${CallSid} → ${CallStatus} (${CallDuration}s)`);
  try {
    const update = {
      status: CallStatus,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    if (CallDuration) update.duration = parseInt(CallDuration);
    if (RecordingUrl) update.recordingUrl = RecordingUrl;
    await db.collection('calls').doc(CallSid).set(update, { merge: true });

    // Update analytics
    if (CallStatus === 'completed' || CallStatus === 'failed' || CallStatus === 'busy' || CallStatus === 'no-answer') {
      await db.collection('analytics').doc('summary').set({
        totalCalls: admin.firestore.FieldValue.increment(1),
        [`${CallStatus}Calls`]: admin.firestore.FieldValue.increment(1),
        totalDuration: admin.firestore.FieldValue.increment(parseInt(CallDuration) || 0),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      // Recalculate lead score after call completes
      if (To) await updateLeadScore(To);
    }
  } catch (err) { console.error('Status update error:', err.message); }
  res.status(200).send('OK');
});

// ── Get Calls ──────────────────────────────────────────────────────
app.get('/calls', async (req, res) => {
  try {
    const calls = await client.calls.list({ limit: 50 });
    res.json({ calls: calls.map(c => ({ sid: c.sid, to: c.to, status: c.status, duration: c.duration, startTime: c.startTime })) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Get Analytics ──────────────────────────────────────────────────
app.get('/analytics', async (req, res) => {
  try {
    const callsSnap = await db.collection('calls').get();
    const allCalls = callsSnap.docs.map(d => d.data());
    const completed = allCalls.filter(c => c.status === 'completed').length;
    const failed = allCalls.filter(c => c.status === 'failed').length;
    const totalDuration = allCalls.reduce((sum, c) => sum + (c.duration || 0), 0);
    res.json({ totalCalls: allCalls.length, completedCalls: completed, failedCalls: failed, avgDuration: completed > 0 ? Math.round(totalDuration/completed) : 0 });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Save Lead ──────────────────────────────────────────────────────
app.post('/leads', async (req, res) => {
  const { name, phone, interest, course, notes } = req.body;
  if (!name || !phone) return res.status(400).json({ error: 'Name and phone required' });
  try {
    const ref = await db.collection('leads').add({
      name, phone, interest: interest || 'Warm', course: course || 'B.Tech AI',
      notes: notes || null, score: 0, grade: 'New',
      scoreBreakdown: [], callCount: 0, completedCalls: 0,
      totalDuration: 0, avgDuration: 0, lastCalled: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ success: true, id: ref.id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Manually trigger score recalculation ──────────────────────────
app.post('/leads/:id/score', async (req, res) => {
  try {
    const leadDoc = await db.collection('leads').doc(req.params.id).get();
    if (!leadDoc.exists) return res.status(404).json({ error: 'Lead not found' });
    const result = await updateLeadScore(leadDoc.data().phone);
    res.json({ success: true, ...result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Aria server running on port ${PORT}`);
  console.log(`🔥 Firebase Firestore connected`);
  console.log(`📊 Lead scoring engine active`);
});