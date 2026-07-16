const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawn } = require('node:child_process');
const { Worker } = require('node:worker_threads');
const { generateGuide } = require('./guide-engine');

const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const DATA_FILE = path.join(ROOT, 'data', 'problems.json');
const PORT = Number(process.env.PORT) || 3210;
const HOST = process.env.HOST || '127.0.0.1';
const MAX_BODY = 512 * 1024;
const MAX_OUTPUT = 64 * 1024;
const TIMEOUT = 5000;
let problemDataCache;

function getProblemData() {
  if (!problemDataCache) problemDataCache = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  return problemDataCache;
}

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png'
};

function json(res, status, value) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(value));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new Error('请求内容过大'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
      catch { reject(new Error('JSON 格式无效')); }
    });
    req.on('error', reject);
  });
}

function normalizeOutput(value) {
  return String(value).replace(/\r\n/g, '\n').trim().replace(/[ \t]+$/gm, '');
}

async function runCode({ language, code, input = '' }) {
  if (!['javascript', 'python', 'cpp'].includes(language)) throw new Error('不支持的语言');
  if (typeof code !== 'string' || !code.trim()) throw new Error('代码不能为空');
  if (code.length > 200_000 || String(input).length > 100_000) throw new Error('代码或输入过大');

  if (language === 'javascript') return executeJavaScript(code, String(input));

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workspace-run-'));
  const ext = { javascript: 'js', python: 'py', cpp: 'cpp' }[language];
  const source = path.join(tempDir, `main.${ext}`);
  fs.writeFileSync(source, code);

  try {
    if (language === 'cpp') {
      const compile = await execute('g++', ['-std=c++17', '-O2', source, '-o', path.join(tempDir, 'main')], '', tempDir, 10000);
      if (compile.exitCode !== 0) return { ...compile, status: 'compile_error' };
      return { ...(await execute(path.join(tempDir, 'main'), [], input, tempDir, TIMEOUT)), status: 'finished' };
    }
    return { ...(await execute('python3', [source], input, tempDir, TIMEOUT)), status: 'finished' };
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

function executeJavaScript(code, input) {
  const workerSource = `
    const { parentPort, workerData } = require('node:worker_threads');
    const vm = require('node:vm');
    const output = [];
    let outputSize = 0;
    const write = (...values) => {
      const line = values.map((value) => typeof value === 'string' ? value : require('node:util').inspect(value, { depth: 4, colors: false })).join(' ') + '\\n';
      outputSize += Buffer.byteLength(line);
      if (outputSize > workerData.maxOutput) { const error = new Error('输出超过限制'); error.code = 'OUTPUT_LIMIT'; throw error; }
      output.push(line);
    };
    const fsMock = { readFileSync(fd, encoding) { if (fd !== 0 && fd !== '/dev/stdin') throw new Error('本地文件访问已禁用'); return encoding ? workerData.input : Buffer.from(workerData.input); } };
    const sandbox = {
      console: { log: write, error: write, warn: write },
      require(name) { if (name === 'fs' || name === 'node:fs') return fsMock; throw new Error('模块加载已禁用: ' + name); },
      process: { exitCode: 0, exit(code = 0) { const error = new Error('__EXIT__'); error.exitCode = code; throw error; } },
      Buffer, setTimeout, clearTimeout, setInterval, clearInterval, structuredClone, URL, URLSearchParams
    };
    const started = process.hrtime.bigint();
    try {
      vm.runInNewContext(workerData.code, sandbox, { filename: 'main.js' });
      parentPort.postMessage({ exitCode: Number(sandbox.process.exitCode) || 0, stdout: output.join(''), stderr: '', timeMs: Math.round(Number(process.hrtime.bigint() - started) / 1e6), timedOut: false, truncated: false, status: 'finished' });
    } catch (error) {
      const isExit = error.message === '__EXIT__';
      parentPort.postMessage({ exitCode: isExit ? (error.exitCode || 0) : 1, stdout: output.join(''), stderr: isExit ? '' : (error.stack || error.message), timeMs: Math.round(Number(process.hrtime.bigint() - started) / 1e6), timedOut: false, truncated: error.code === 'OUTPUT_LIMIT', status: 'finished' });
    }
  `;
  return new Promise((resolve) => {
    const started = process.hrtime.bigint();
    const worker = new Worker(workerSource, {
      eval: true,
      workerData: { code, input, maxOutput: MAX_OUTPUT },
      resourceLimits: { maxOldGenerationSizeMb: 64, maxYoungGenerationSizeMb: 16, stackSizeMb: 4 }
    });
    let settled = false;
    const finish = (result) => { if (settled) return; settled = true; clearTimeout(timer); resolve(result); };
    const timer = setTimeout(async () => {
      await worker.terminate();
      finish({ exitCode: -1, stdout: '', stderr: '执行超时（5 秒）', timeMs: TIMEOUT, timedOut: true, truncated: false, status: 'finished' });
    }, TIMEOUT);
    worker.once('message', (result) => finish(result));
    worker.once('error', (error) => finish({ exitCode: 1, stdout: '', stderr: error.stack || error.message, timeMs: Math.round(Number(process.hrtime.bigint() - started) / 1e6), timedOut: false, truncated: false, status: 'finished' }));
    worker.once('exit', (code) => { if (!settled && code !== 0) finish({ exitCode: code, stdout: '', stderr: 'JavaScript Worker 异常退出', timeMs: Math.round(Number(process.hrtime.bigint() - started) / 1e6), timedOut: false, truncated: false, status: 'finished' }); });
  });
}

function execute(command, args, input, cwd, timeout) {
  return new Promise((resolve) => {
    const started = process.hrtime.bigint();
    const child = spawn(command, args, { cwd, stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    let truncated = false;
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, timeout);
    const collect = (target) => (chunk) => {
      const text = chunk.toString();
      if (target === 'stdout') stdout += text;
      else stderr += text;
      if (stdout.length + stderr.length > MAX_OUTPUT) {
        truncated = true;
        child.kill('SIGKILL');
      }
    };
    child.stdout.on('data', collect('stdout'));
    child.stderr.on('data', collect('stderr'));
    child.on('error', (error) => {
      clearTimeout(timer);
      resolve({ exitCode: -1, stdout: '', stderr: error.message, timeMs: 0, timedOut: false });
    });
    child.on('close', (exitCode) => {
      clearTimeout(timer);
      const timeMs = Math.round(Number(process.hrtime.bigint() - started) / 1e6);
      resolve({ exitCode: exitCode ?? -1, stdout: stdout.slice(0, MAX_OUTPUT), stderr: stderr.slice(0, MAX_OUTPUT), timeMs, timedOut, truncated });
    });
    child.stdin.end(String(input));
  });
}

async function api(req, res, pathname) {
  if (req.method === 'GET' && pathname === '/api/health') {
    return json(res, 200, { ok: true, node: process.version, runners: ['javascript', 'python', 'cpp'] });
  }
  if (req.method === 'GET' && pathname === '/api/problems') {
    if (!fs.existsSync(DATA_FILE)) return json(res, 503, { error: '题库尚未构建，请运行 npm run import' });
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-cache' });
    return fs.createReadStream(DATA_FILE).pipe(res);
  }
  if (req.method === 'POST' && pathname === '/api/run') {
    try {
      const result = await runCode(await readBody(req));
      return json(res, 200, result);
    } catch (error) {
      return json(res, 400, { error: error.message });
    }
  }
  if (req.method === 'POST' && pathname === '/api/judge') {
    try {
      const body = await readBody(req);
      if (!Array.isArray(body.tests) || body.tests.length > 20) throw new Error('测试用例数量无效');
      const results = [];
      for (const test of body.tests) {
        const execution = await runCode({ language: body.language, code: body.code, input: test.input });
        const passed = execution.exitCode === 0 && !execution.timedOut && normalizeOutput(execution.stdout) === normalizeOutput(test.output);
        results.push({ ...execution, input: test.input, expected: test.output, actual: execution.stdout, passed });
        if (!passed) break;
      }
      return json(res, 200, { passed: results.length === body.tests.length && results.every((item) => item.passed), passedCount: results.filter((item) => item.passed).length, total: body.tests.length, results });
    } catch (error) {
      return json(res, 400, { error: error.message });
    }
  }
  if (req.method === 'POST' && pathname === '/api/guide') {
    try {
      if (!fs.existsSync(DATA_FILE)) throw new Error('题库尚未构建');
      const profile = await readBody(req);
      return json(res, 200, generateGuide(getProblemData(), profile));
    } catch (error) {
      return json(res, 400, { error: error.message });
    }
  }
  return false;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (url.pathname.startsWith('/api/')) {
    const handled = await api(req, res, url.pathname);
    if (handled !== false) return;
    return json(res, 404, { error: '接口不存在' });
  }
  let requested = decodeURIComponent(url.pathname);
  if (requested === '/') requested = '/index.html';
  const file = path.resolve(PUBLIC_DIR, `.${requested}`);
  if (!file.startsWith(`${PUBLIC_DIR}${path.sep}`)) {
    res.writeHead(403); return res.end('Forbidden');
  }
  fs.stat(file, (error, stat) => {
    if (error || !stat.isFile()) {
      res.writeHead(404); return res.end('Not found');
    }
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
});

if (require.main === module) {
  server.listen(PORT, HOST, () => console.log(`Workspace: http://${HOST}:${PORT}`));
}

module.exports = { server, runCode, normalizeOutput };
