// lib/rate-limit.ts

import { prisma } from "@/lib/prisma";

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

export async function checkRateLimitForRequest(
  key: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; retryAfterMs?: number }> {
  if (process.env.NODE_ENV !== "production") {
    return checkRateLimit(key, config);
  }

  const now = new Date();
  const windowBoundary = new Date(now.getTime() - config.windowMs);

  return prisma.$transaction(async (tx) => {
    const entry = await tx.rateLimitEntry.findUnique({ where: { key } });

    if (entry?.lockedUntil && entry.lockedUntil > now) {
      return {
        allowed: false,
        retryAfterMs: entry.lockedUntil.getTime() - now.getTime(),
      };
    }

    if (!entry || entry.windowStart <= windowBoundary) {
      await tx.rateLimitEntry.upsert({
        where: { key },
        create: {
          key,
          count: 1,
          windowStart: now,
          lockedUntil: null,
        },
        update: {
          count: 1,
          windowStart: now,
          lockedUntil: null,
        },
      });
      return { allowed: true };
    }

    if (entry.count >= config.maxAttempts) {
      const lockedUntil = config.lockoutMs
        ? new Date(now.getTime() + config.lockoutMs)
        : null;

      await tx.rateLimitEntry.update({
        where: { key },
        data: { lockedUntil },
      });

      return {
        allowed: false,
        retryAfterMs: config.lockoutMs ?? config.windowMs,
      };
    }

    await tx.rateLimitEntry.update({
      where: { key },
      data: { count: { increment: 1 }, lockedUntil: null },
    });

    return { allowed: true };
  });
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
