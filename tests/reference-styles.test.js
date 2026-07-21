const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const styles = fs.readFileSync(path.join(__dirname, '..', 'public', 'styles.css'), 'utf8');
const app = fs.readFileSync(path.join(__dirname, '..', 'public', 'app.js'), 'utf8');

test('reference implementation styles override generic result pre styles', () => {
  const genericRule = styles.indexOf('.result-panel pre');
  const referenceRule = styles.indexOf('.result-panel .solution-reveal pre');
  assert.ok(genericRule >= 0);
  assert.ok(referenceRule > genericRule);
  assert.match(styles.slice(referenceRule), /color: #e6edf3; background: #11161d/);
  assert.match(styles.slice(referenceRule), /font: 13px\/1\.75/);
});

test('reference implementations use escaped offline syntax highlighting', () => {
  assert.match(app, /function highlightCode/);
  assert.match(app, /escapeHtml\(token\)/);
  assert.match(app, /class="syntax-code language-\$\{language\}"/);
  assert.match(styles, /\.tok-keyword/);
  assert.match(styles, /\.tok-comment/);
});
