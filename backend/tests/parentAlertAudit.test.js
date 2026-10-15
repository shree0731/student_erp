const fs = require('fs');
const path = require('path');

describe('Task 6 — Parent Alert Modal Honesty & Hook Integrity Audit', () => {
  const modalPath = path.resolve(__dirname, '../../frontend/src/components/ParentAlertModal.jsx');

  test('ParentAlertModal file exists', () => {
    expect(fs.existsSync(modalPath)).toBe(true);
  });

  test('Guarantees all React hooks are declared before any conditional return (Rule of Hooks)', () => {
    const content = fs.readFileSync(modalPath, 'utf8');

    // Find the position of all hook calls: useState, useEffect
    const useStateIndices = [...content.matchAll(/useState\(/g)].map(m => m.index);
    const useEffectIndices = [...content.matchAll(/useEffect\(/g)].map(m => m.index);
    const allHookIndices = [...useStateIndices, ...useEffectIndices];

    expect(allHookIndices.length).toBeGreaterThanOrEqual(4);

    // Find the position of early return statement: `if (!isOpen || !student) return null;`
    const earlyReturnMatch = content.match(/if\s*\(\s*!isOpen/);
    expect(earlyReturnMatch).not.toBeNull();
    const earlyReturnIndex = earlyReturnMatch.index;

    // Assert every hook index occurs BEFORE the early return statement
    allHookIndices.forEach(idx => {
      expect(idx).toBeLessThan(earlyReturnIndex);
    });
  });

  test('Guarantees zero hardcoded fake phone numbers or emails exist', () => {
    const content = fs.readFileSync(modalPath, 'utf8');

    expect(content).not.toMatch(/\+91\s*98401/);
    expect(content).not.toMatch(/\+91\s*94441/);
    expect(content).not.toMatch(/parent\.[a-z0-9]+@gmail\.com/i);
    expect(content).not.toMatch(/Dr\.\s*Kavitha\s*Ramanathan/);
  });

  test('Guarantees honest communication notice and copy button are present', () => {
    const content = fs.readFileSync(modalPath, 'utf8');

    // Notice that dispatch is truthful: emails sent through configured automation channel, no phone/SMS dispatch claimed
    expect(content).toMatch(/emails are sent through the configured automation channel/i);
    expect(content).toMatch(/no automatic phone or SMS dispatch/i);
    expect(content).not.toMatch(/automatic (SMS|phone) dispatch service is connected/i);

    // Copy message to clipboard button
    expect(content).toMatch(/navigator\.clipboard\.writeText/);
    expect(content).toMatch(/Copied to Clipboard!/);
  });
});
