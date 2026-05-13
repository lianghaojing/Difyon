// lib/rate-limit.ts

interface RateLimitEntry {
  count: number;
  timestamps: number[];
  lockedUntil?: number;
}

const store = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  windowMs: number; // 滑动窗口时间（毫秒）
  maxAttempts: number; // 窗口内最大尝试次数
  lockoutMs?: number; // 锁定时间（毫秒），可选
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const entry = store.get(key);

  // 检查是否处于锁定状态
  if (entry?.lockedUntil && entry.lockedUntil > now) {
    return { allowed: false, retryAfterMs: entry.lockedUntil - now };
  }

  // 清除锁定（如果已过期）
  if (entry?.lockedUntil && entry.lockedUntil <= now) {
    store.delete(key);
    return { allowed: true };
  }

  if (!entry) {
    store.set(key, { count: 1, timestamps: [now] });
    return { allowed: true };
  }

  // 过滤窗口内的时间戳
  const windowStart = now - config.windowMs;
  entry.timestamps = entry.timestamps.filter((t) => t > windowStart);
  entry.count = entry.timestamps.length;

  if (entry.count >= config.maxAttempts) {
    // 触发锁定
    if (config.lockoutMs) {
      entry.lockedUntil = now + config.lockoutMs;
      store.set(key, entry);
      return { allowed: false, retryAfterMs: config.lockoutMs };
    }
    return { allowed: false, retryAfterMs: config.windowMs };
  }

  entry.timestamps.push(now);
  entry.count++;
  store.set(key, entry);
  return { allowed: true };
}

// 用于测试：重置存储
export function resetRateLimitStore(): void {
  store.clear();
}

// 预定义配置
export const LOGIN_RATE_LIMIT: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 分钟
  maxAttempts: 5,
  lockoutMs: 15 * 60 * 1000, // 锁定 15 分钟
};

export const FORGOT_PASSWORD_RATE_LIMIT: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 分钟
  maxAttempts: 3,
};

export const RESEND_VERIFICATION_RATE_LIMIT: RateLimitConfig = {
  windowMs: 5 * 60 * 1000, // 5 分钟
  maxAttempts: 3,
};
