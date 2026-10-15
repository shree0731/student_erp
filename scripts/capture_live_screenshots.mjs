import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = path.resolve(process.env.TEMP || 'C:\\Temp', 'chrome_cdp_capture_' + Date.now());

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('Launching Chrome for CDP capture...');
  const proc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${userDataDir}`,
    '--window-size=1440,900',
    '--no-sandbox',
    '--disable-gpu',
    'about:blank'
  ], { detached: false });

  await sleep(2500);

  try {
    const vRes = await fetch('http://127.0.0.1:9222/json/version');
    const vData = await vRes.json();
    console.log('Connected to Chrome:', vData.Browser);

    const nRes = await fetch('http://127.0.0.1:9222/json/new?about:blank', { method: 'PUT' });
    const target = await nRes.json();
    const wsUrl = target.webSocketDebuggerUrl;
    console.log('Target WebSocket:', wsUrl);

    const ws = new WebSocket(wsUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let msgId = 0;
    const pending = {};
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && pending[data.id]) {
        if (data.error) pending[data.id].reject(new Error(data.error.message));
        else pending[data.id].resolve(data.result);
        delete pending[data.id];
      }
    };

    const cdp = (method, params = {}) => {
      const id = ++msgId;
      return new Promise((resolve, reject) => {
        pending[id] = { resolve, reject };
        ws.send(JSON.stringify({ id, method, params }));
      });
    };

    await cdp('Page.enable');
    await cdp('Runtime.enable');

    const outDir = path.resolve('docs', 'report_screenshots');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    // 1. ERP Login Page
    console.log('Capturing ERP Login Page...');
    await cdp('Page.navigate', { url: 'http://localhost:5173/login' });
    await sleep(2500);
    let shot = await cdp('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(outDir, 'fig_10_2_erp_login_page.png'), Buffer.from(shot.data, 'base64'));
    console.log('Saved: fig_10_2_erp_login_page.png');

    // Fetch tokens for auth pages
    console.log('Authenticating users for dashboard captures...');
    const demoPw = 'TestPassword123!';
    const getAuth = async (username) => {
      const r = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: demoPw })
      });
      return await r.json();
    };

    const adminAuth = await getAuth('admin');
    const mentorAuth = await getAuth('mentor');
    const studentAuth = await getAuth('student');

    // 2. Student Dashboard
    console.log('Capturing Student Dashboard...');
    await cdp('Page.navigate', { url: 'http://localhost:5173/login' });
    await sleep(500);
    await cdp('Runtime.evaluate', {
      expression: `
        sessionStorage.setItem('erp_token', '${studentAuth.token}');
        sessionStorage.setItem('erp_user', '${JSON.stringify(studentAuth.user).replace(/'/g, "\\'")}');
        window.location.href = '/student/dashboard';
      `
    });
    await sleep(3000);
    shot = await cdp('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(outDir, 'fig_10_3_student_dashboard.png'), Buffer.from(shot.data, 'base64'));
    console.log('Saved: fig_10_3_student_dashboard.png');

    // 3. Mentor Dashboard
    console.log('Capturing Mentor Dashboard...');
    await cdp('Runtime.evaluate', {
      expression: `
        sessionStorage.setItem('erp_token', '${mentorAuth.token}');
        sessionStorage.setItem('erp_user', '${JSON.stringify(mentorAuth.user).replace(/'/g, "\\'")}');
        window.location.href = '/mentor/dashboard';
      `
    });
    await sleep(3000);
    shot = await cdp('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(outDir, 'fig_10_4_mentor_dashboard.png'), Buffer.from(shot.data, 'base64'));
    console.log('Saved: fig_10_4_mentor_dashboard.png');

    // 4. Mentor Meeting Request Tab/Inbox
    console.log('Capturing Mentor Meeting Request Inbox...');
    await cdp('Runtime.evaluate', {
      expression: `
        // Click on the Interventions / Meeting Requests tab if present
        const tabs = Array.from(document.querySelectorAll('button, .tab-button, .nav-tab'));
        const reqTab = tabs.find(t => t.textContent.includes('Intervention') || t.textContent.includes('Meeting'));
        if (reqTab) reqTab.click();
      `
    });
    await sleep(2000);
    shot = await cdp('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(outDir, 'fig_10_7_mentor_request.png'), Buffer.from(shot.data, 'base64'));
    console.log('Saved: fig_10_7_mentor_request.png');

    // 5. Admin Dashboard
    console.log('Capturing Admin Dashboard...');
    await cdp('Runtime.evaluate', {
      expression: `
        sessionStorage.setItem('erp_token', '${adminAuth.token}');
        sessionStorage.setItem('erp_user', '${JSON.stringify(adminAuth.user).replace(/'/g, "\\'")}');
        window.location.href = '/admin/dashboard';
      `
    });
    await sleep(3000);
    shot = await cdp('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(outDir, 'fig_10_5_admin_dashboard.png'), Buffer.from(shot.data, 'base64'));
    console.log('Saved: fig_10_5_admin_dashboard.png');

    // 6. Baymate Chatbot with Student
    console.log('Capturing Baymate Chatbot with Student...');
    await cdp('Page.navigate', { url: 'http://localhost:5174/chat' });
    await sleep(3000);
    // Simulate a message if chat has an input box
    await cdp('Runtime.evaluate', {
      expression: `
        const input = document.querySelector('input[type="text"], textarea');
        if (input) {
          input.value = "Hello Baymate! Can you help me review my academic standing and attendance?";
          input.dispatchEvent(new Event('input', { bubbles: true }));
          const form = input.closest('form');
          if (form) form.dispatchEvent(new Event('submit', { bubbles: true }));
          else {
            const btn = document.querySelector('button[type="submit"]') || input.nextElementSibling;
            if (btn) btn.click();
          }
        }
      `
    });
    await sleep(4000);
    shot = await cdp('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(outDir, 'fig_10_6_baymate_chat_student.png'), Buffer.from(shot.data, 'base64'));
    console.log('Saved: fig_10_6_baymate_chat_student.png');

    ws.close();
    console.log('All screenshots captured successfully!');
  } finally {
    proc.kill();
  }
}

main().catch(console.error);
