import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { spawn } from "node:child_process";

const baseUrl = "http://localhost:3002";
const outDir = "/Users/mobvista/Desktop/difyon/artifacts/auth-visual-review-2026-07-03";
const screenshotsDir = path.join(outDir, "screenshots");
const userDataDir = path.join(outDir, "chrome-profile");
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const port = 9333;

const accountEmail = "visual.account.1783048674510@example.com";
const accountPassword = "CodexVisual123";
const viewports = [
  { name: "390-mobile", width: 390, height: 844 },
  { name: "768-tablet", width: 768, height: 1024 },
  { name: "1440-desktop", width: 1440, height: 960 },
];

const captures = [];
const failures = [];
let chrome;

await fs.mkdir(screenshotsDir, { recursive: true });
await fs.mkdir(userDataDir, { recursive: true });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function httpJson(url, method = "GET") {
  return new Promise((resolve, reject) => {
    const request = http.request(url, { method }, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () => {
        if (response.statusCode && response.statusCode >= 400) {
          reject(new Error(`${method} ${url} failed: ${response.statusCode} ${body}`));
          return;
        }
        if (!body) {
          resolve({});
          return;
        }
        try {
          resolve(JSON.parse(body));
        } catch {
          resolve({ text: body });
        }
      });
    });
    request.on("error", reject);
    request.end();
  });
}

async function waitForChrome() {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    try {
      await httpJson(`http://127.0.0.1:${port}/json/version`);
      return;
    } catch {
      await sleep(250);
    }
  }
  throw new Error("Chrome DevTools endpoint did not start");
}

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 0;
    this.pending = new Map();
    this.listeners = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.addEventListener("open", resolve, { once: true });
      this.ws.addEventListener("error", reject, { once: true });
    });
    this.ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(message.error.message));
        else resolve(message.result);
        return;
      }
      if (message.method && this.listeners.has(message.method)) {
        for (const listener of this.listeners.get(message.method)) listener(message.params);
      }
    });
  }

  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`${method} timed out`));
        }
      }, 20000);
    });
  }

  once(method, timeout = 15000) {
    return new Promise((resolve) => {
      const done = (params) => {
        clearTimeout(timer);
        this.off(method, done);
        resolve(params);
      };
      const timer = setTimeout(() => done(undefined), timeout);
      this.on(method, done);
    });
  }

  on(method, listener) {
    if (!this.listeners.has(method)) this.listeners.set(method, new Set());
    this.listeners.get(method).add(listener);
  }

  off(method, listener) {
    this.listeners.get(method)?.delete(listener);
  }

  close() {
    this.ws?.close();
  }
}

function safeName(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function newClient(viewport, initScript = "") {
  const target = await httpJson(`http://127.0.0.1:${port}/json/new?about:blank`, "PUT");
  const client = new CdpClient(target.webSocketDebuggerUrl);
  await client.connect();
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: false,
  });
  if (initScript) {
    await client.send("Page.addScriptToEvaluateOnNewDocument", { source: initScript });
  }
  return { client, targetId: target.id };
}

async function closeTarget(client, targetId) {
  client.close();
  await httpJson(`http://127.0.0.1:${port}/json/close/${targetId}`).catch(() => {});
}

async function navigate(client, route) {
  const load = client.once("Page.loadEventFired", 12000);
  await client.send("Page.navigate", { url: baseUrl + route });
  await load;
  await sleep(900);
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    userGesture: true,
  });
  if (result.exceptionDetails) {
    throw new Error(
      result.exceptionDetails.exception?.description ||
        result.exceptionDetails.text ||
        "Runtime evaluation failed"
    );
  }
  return result.result?.value;
}

function fillExpression(selector, value, index = 0) {
  const missingMessage = JSON.stringify(`Missing selector: ${selector}`);
  return `
    (() => {
      const element = document.querySelectorAll(${JSON.stringify(selector)})[${index}];
      if (!element) throw new Error(${missingMessage});
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      setter.call(element, ${JSON.stringify(value)});
      element.dispatchEvent(new Event("input", { bubbles: true }));
      element.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    })()
  `;
}

function clickExpression(selector, index = 0) {
  const missingMessage = JSON.stringify(`Missing selector: ${selector}`);
  return `
    (() => {
      const element = document.querySelectorAll(${JSON.stringify(selector)})[${index}];
      if (!element) throw new Error(${missingMessage});
      element.click();
      return true;
    })()
  `;
}

async function screenshot(client, title, viewport, note = "") {
  await sleep(350);
  const metrics = await client.send("Page.getLayoutMetrics");
  const height = Math.max(viewport.height, Math.ceil(metrics.cssContentSize?.height || viewport.height));
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: Math.min(height, 24000),
    deviceScaleFactor: 1,
    mobile: false,
  });
  await sleep(100);
  const result = await client.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: true,
  });
  const file = `${safeName(title)}__${viewport.name}.png`;
  await fs.writeFile(path.join(screenshotsDir, file), Buffer.from(result.data, "base64"));
  captures.push({ title, viewport: viewport.name, file: `screenshots/${file}`, note });
}

async function captureGoto(title, route, note = "") {
  for (const viewport of viewports) {
    console.log(`capture ${title} ${viewport.name}`);
    let client;
    let targetId;
    try {
      ({ client, targetId } = await newClient(viewport));
      await clearOrigin(client);
      await navigate(client, route);
      await screenshot(client, title, viewport, note || route);
    } catch (error) {
      failures.push({ title, viewport: viewport.name, error: error.message });
    } finally {
      if (client) await closeTarget(client, targetId);
    }
  }
}

async function captureInteraction(title, fn, note = "", initScript = "") {
  for (const viewport of viewports) {
    console.log(`capture ${title} ${viewport.name}`);
    let client;
    let targetId;
    try {
      ({ client, targetId } = await newClient(viewport, initScript));
      await clearOrigin(client);
      await fn(client, viewport);
      await screenshot(client, title, viewport, note);
    } catch (error) {
      failures.push({ title, viewport: viewport.name, error: error.message });
    } finally {
      if (client) await closeTarget(client, targetId);
    }
  }
}

function mockFetchScript(matchPath, status, body, delay = 0) {
  return `
    (() => {
      const originalFetch = window.fetch.bind(window);
      window.fetch = async (input, init) => {
        const url = String(typeof input === "string" ? input : input?.url || "");
        if (url.includes(${JSON.stringify(matchPath)})) {
          if (${delay} > 0) await new Promise((resolve) => setTimeout(resolve, ${delay}));
          return new Response(${JSON.stringify(JSON.stringify(body))}, {
            status: ${status},
            headers: { "Content-Type": "application/json" }
          });
        }
        return originalFetch(input, init);
      };
    })();
  `;
}

async function clearOrigin(client) {
  await client.send("Storage.clearDataForOrigin", {
    origin: baseUrl,
    storageTypes: "all",
  }).catch(() => {});
}

async function login(client) {
  await clearOrigin(client);
  await navigate(client, "/login");
  await evaluate(client, fillExpression('input[type="email"]', accountEmail));
  await evaluate(client, fillExpression('input[type="password"]', accountPassword));
  await evaluate(client, clickExpression('button[type="submit"]'));
  await sleep(3800);
}

async function captureAccount(title, route, note) {
  for (const viewport of viewports) {
    console.log(`capture ${title} ${viewport.name}`);
    let client;
    let targetId;
    try {
      ({ client, targetId } = await newClient(viewport));
      await login(client);
      await navigate(client, route);
      await screenshot(client, title, viewport, note);
    } catch (error) {
      failures.push({ title, viewport: viewport.name, error: error.message });
    } finally {
      if (client) await closeTarget(client, targetId);
    }
  }
}

async function captureEmail(title, html, note) {
  for (const viewport of viewports) {
    console.log(`capture ${title} ${viewport.name}`);
    let client;
    let targetId;
    try {
      ({ client, targetId } = await newClient(viewport));
      const documentHtml = `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;background:#f6f7fb;padding:24px}</style></head><body>${html}</body></html>`;
      const encoded = Buffer.from(documentHtml).toString("base64");
      await client.send("Page.navigate", { url: `data:text/html;base64,${encoded}` });
      await client.once("Page.loadEventFired", 8000);
      await screenshot(client, title, viewport, note);
    } catch (error) {
      failures.push({ title, viewport: viewport.name, error: error.message });
    } finally {
      if (client) await closeTarget(client, targetId);
    }
  }
}

try {
  chrome = spawn(chromePath, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--remote-debugging-address=127.0.0.1",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    "about:blank",
  ], { stdio: "ignore" });

  await waitForChrome();

  await captureGoto("Login default", "/login", "登录页默认状态");
  await captureGoto("Login email verified success", "/login?verified=true", "邮箱验证成功后的登录提示");
  await captureGoto("Login password reset success", "/login?message=password-reset-success", "重置密码成功后的登录提示");
  await captureGoto("Login Google error", "/login?error=OAuthSignin", "Google 登录失败提示");

  await captureInteraction("Login invalid credentials error", async (client) => {
    await navigate(client, "/login");
    await evaluate(client, fillExpression('input[type="email"]', "nobody@example.com"));
    await evaluate(client, fillExpression('input[type="password"]', "WrongPass123"));
    await evaluate(client, clickExpression('button[type="submit"]'));
    await sleep(1800);
  }, "错误邮箱/密码后的表单错误状态");

  await captureInteraction("Login language menu open", async (client) => {
    await navigate(client, "/login");
    await evaluate(client, clickExpression('button[aria-haspopup="listbox"]'));
    await sleep(300);
  }, "语言菜单展开状态");

  await captureGoto("Register default", "/register", "注册页默认状态");
  await captureGoto("Register Google consent modal", "/register?googleConsent=required", "Google 注册条款确认弹窗");

  await captureInteraction("Register validation errors", async (client) => {
    await navigate(client, "/register");
    await evaluate(client, fillExpression('input[type="email"]', "bad-email"));
    await evaluate(client, fillExpression('input[type="password"]', "weak", 0));
    await evaluate(client, fillExpression('input[type="password"]', "different", 1));
    await evaluate(client, `document.body.click(); true`);
    await sleep(800);
  }, "注册表单校验错误");

  await captureGoto("Register check email after submit", "/verify-email?email=visual.register.review@example.com", "注册提交后等待验证邮件状态");
  await captureGoto("Register check email delivery failed", "/verify-email?email=visual.register.review@example.com&delivery=failed", "注册成功但邮件发送失败提示");
  await captureGoto("Forgot password default", "/forgot-password", "忘记密码默认状态");

  await captureInteraction("Forgot password email sent", async (client) => {
    await navigate(client, "/forgot-password");
    await evaluate(client, fillExpression('input[type="email"]', "visual.forgot.review@example.com"));
    await evaluate(client, clickExpression('button[type="submit"]'));
    await sleep(1600);
  }, "忘记密码邮件已发送状态");

  await captureGoto("Reset password no token invalid", "/reset-password", "没有 token 的重置密码错误状态");
  await captureGoto("Reset password form valid token visual", "/reset-password?token=visual-valid-token-for-form-only", "有效 token 时的重置表单视觉状态，不提交");

  await captureInteraction("Reset password validation errors", async (client) => {
    await navigate(client, "/reset-password?token=visual-valid-token-for-form-only");
    await evaluate(client, fillExpression('input[type="password"]', "weak", 0));
    await evaluate(client, fillExpression('input[type="password"]', "different", 1));
    await evaluate(client, `document.body.click(); true`);
    await sleep(800);
  }, "重置密码表单校验错误");

  await captureInteraction(
    "Reset password expired after submit",
    async (client) => {
      await navigate(client, "/reset-password?token=visual-expired-reset-token");
      await evaluate(client, fillExpression('input[type="password"]', "CodexVisual456", 0));
      await evaluate(client, fillExpression('input[type="password"]', "CodexVisual456", 1));
      await evaluate(client, clickExpression('button[type="submit"]'));
      await sleep(900);
    },
    "提交后返回过期 token 状态",
    mockFetchScript("/api/reset-password", 410, { error: "重置链接已过期", expired: true })
  );

  await captureInteraction(
    "Reset password invalid after submit",
    async (client) => {
      await navigate(client, "/reset-password?token=visual-invalid-reset-token");
      await evaluate(client, fillExpression('input[type="password"]', "CodexVisual456", 0));
      await evaluate(client, fillExpression('input[type="password"]', "CodexVisual456", 1));
      await evaluate(client, clickExpression('button[type="submit"]'));
      await sleep(900);
    },
    "提交后返回无效 token 状态",
    mockFetchScript("/api/reset-password", 400, { error: "重置链接无效" })
  );

  await captureInteraction(
    "Verify email loading",
    async (client) => {
      await navigate(client, "/verify-email?token=visual-loading-token");
      await sleep(650);
    },
    "邮箱验证请求进行中",
    mockFetchScript("/api/verify-email", 400, { error: "验证链接无效" }, 5000)
  );

  await captureInteraction(
    "Verify email success",
    async (client) => {
      await navigate(client, "/verify-email?token=visual-success-token");
      await sleep(700);
    },
    "邮箱验证成功状态，实际页面 2 秒后会跳登录",
    mockFetchScript("/api/verify-email", 200, { success: true, message: "邮箱验证成功" })
  );

  await captureInteraction(
    "Verify email expired",
    async (client) => {
      await navigate(client, "/verify-email?token=visual-expired-token");
      await sleep(700);
    },
    "邮箱验证链接过期状态",
    mockFetchScript("/api/verify-email", 410, { error: "验证链接已过期", expired: true })
  );

  await captureInteraction(
    "Verify email invalid",
    async (client) => {
      await navigate(client, "/verify-email?token=visual-invalid-token");
      await sleep(700);
    },
    "邮箱验证链接无效状态",
    mockFetchScript("/api/verify-email", 400, { error: "验证链接无效" })
  );

  await captureInteraction(
    "Verify email resend success",
    async (client) => {
      await navigate(client, "/verify-email?email=visual.resend.review@example.com");
      await evaluate(client, `
        (() => {
          const button = [...document.querySelectorAll("button")].find((item) =>
            /Resend|重新发送|Отправить/i.test(item.textContent || "")
          );
          if (!button) throw new Error("Missing resend button");
          button.click();
          return true;
        })()
      `);
      await sleep(900);
    },
    "重新发送验证邮件成功状态",
    mockFetchScript("/api/resend-verification", 200, { success: true, message: "如果该邮箱需要验证，验证邮件已发送" })
  );

  await captureGoto("Terms page", "/terms", "服务条款页面");
  await captureGoto("Privacy page", "/privacy", "隐私政策页面");

  await captureAccount("Account overview", "/account", "账号首页");
  await captureAccount("Account profile", "/account/profile", "资料页");
  await captureAccount("Account email verified state", "/account/email", "邮箱状态页");
  await captureAccount("Account security password change", "/account/security", "安全和改密码页");

  const emailShell = (body) => `<main style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:640px;margin:0 auto;padding:32px;color:#1a1e26">${body}</main>`;
  await captureEmail(
    "Verification email content",
    emailShell(`<h1>邮箱验证</h1><p>请点击下方链接验证您的邮箱地址：</p><p><a style="display:inline-block;background:#f953c6;color:white;text-decoration:none;padding:12px 18px;border-radius:8px" href="${baseUrl}/verify-email?token=sample-token">验证邮箱</a></p><p style="color:#55637f">此链接将在 24 小时后过期。</p>`),
    "验证邮件内容"
  );
  await captureEmail(
    "Password reset email content",
    emailShell(`<h1>密码重置</h1><p>请点击下方链接重置您的密码：</p><p><a style="display:inline-block;background:#f953c6;color:white;text-decoration:none;padding:12px 18px;border-radius:8px" href="${baseUrl}/reset-password?token=sample-token">重置密码</a></p><p style="color:#55637f">此链接将在 1 小时后过期。</p><p style="color:#55637f">如果您没有请求重置密码，请忽略此邮件。</p>`),
    "重置密码邮件内容"
  );
} finally {
  chrome?.kill("SIGTERM");
}

const groups = new Map();
for (const item of captures) {
  if (!groups.has(item.title)) groups.set(item.title, []);
  groups.get(item.title).push(item);
}

let markdown = `# Auth Visual Review - 2026-07-03\n\nBase URL: ${baseUrl}\n\nScreenshots: ${captures.length}\nFailures: ${failures.length}\n\n## How to review\n\nFor each state, check mobile (390), tablet (768), and desktop (1440). Mark the state as OK or note the exact visual issue.\n\n`;

for (const [title, items] of groups) {
  markdown += `## ${title}\n\n`;
  if (items[0]?.note) markdown += `${items[0].note}\n\n`;
  for (const item of items.sort((a, b) => a.viewport.localeCompare(b.viewport))) {
    markdown += `### ${item.viewport}\n\n![${title} ${item.viewport}](${item.file})\n\n`;
  }
}

if (failures.length) {
  markdown += `## Capture Failures\n\n${failures
    .map((failure) => `- ${failure.title} / ${failure.viewport}: ${failure.error}`)
    .join("\n")}\n`;
}

await fs.writeFile(path.join(outDir, "README.md"), markdown, "utf8");

let html = `<!doctype html><html><head><meta charset="utf-8"><title>Auth Visual Review</title><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;background:#f6f7fb;color:#1a1e26}header{position:sticky;top:0;background:white;border-bottom:1px solid #e5e7eb;padding:18px 24px;z-index:2}main{padding:24px}.state{background:white;border:1px solid #e5e7eb;border-radius:10px;margin:0 0 24px;padding:18px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px}.shot{border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;background:#fff}.shot h3{font-size:13px;margin:0;padding:10px 12px;background:#fafafa;border-bottom:1px solid #e5e7eb}.shot img{display:block;width:100%;height:auto}p{color:#55637f}pre{white-space:pre-wrap}</style></head><body><header><h1>Auth Visual Review - 2026-07-03</h1><p>${captures.length} screenshots / ${failures.length} failures</p></header><main>`;

for (const [title, items] of groups) {
  html += `<section class="state"><h2>${title}</h2>${items[0]?.note ? `<p>${items[0].note}</p>` : ""}<div class="grid">`;
  for (const item of items.sort((a, b) => a.viewport.localeCompare(b.viewport))) {
    html += `<article class="shot"><h3>${item.viewport}</h3><a href="${item.file}"><img src="${item.file}" alt="${title} ${item.viewport}"></a></article>`;
  }
  html += "</div></section>";
}

if (failures.length) {
  html += `<section class="state"><h2>Capture Failures</h2><pre>${JSON.stringify(failures, null, 2)}</pre></section>`;
}

html += "</main></body></html>";
await fs.writeFile(path.join(outDir, "index.html"), html, "utf8");
await fs.writeFile(
  path.join(outDir, "capture-summary.json"),
  JSON.stringify({ outDir, screenshots: captures.length, failures }, null, 2),
  "utf8"
);

console.log(JSON.stringify({ outDir, screenshots: captures.length, failures }, null, 2));
