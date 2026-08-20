// tabBackend/middleware/rateLimiter.js
// High-performance Rate Limiter Middleware for Express (Serverless & Docker Ready)

const requestMap = new Map();

/**
 * Creates a rate limiter middleware for Express
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds (default: 60,000 ms = 1 minute)
 * @param {number} options.max - Maximum requests per IP within windowMs
 * @param {string} options.message - Error message returned on 429 status
 */
export const createRateLimiter = ({ windowMs = 60 * 1000, max = 60, message = 'Too many requests. Please try again later.' } = {}) => {
    return (req, res, next) => {
        // Extract client IP address accurately handling reverse proxies (Vercel, Cloudflare, Nginx)
        const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.ip || req.socket.remoteAddress || 'unknown-ip';
        const now = Date.now();

        if (!requestMap.has(ip)) {
            requestMap.set(ip, []);
        }

        const timestamps = requestMap.get(ip);
        
        // Remove timestamps outside the sliding window
        const validTimestamps = timestamps.filter(ts => now - ts < windowMs);
        
        if (validTimestamps.length >= max) {
            const oldestMs = validTimestamps[0];
            const retryAfterSec = Math.ceil((windowMs - (now - oldestMs)) / 1000);
            
            res.setHeader('Retry-After', String(retryAfterSec));
            res.setHeader('X-RateLimit-Limit', String(max));
            res.setHeader('X-RateLimit-Remaining', '0');

            return res.status(429).json({
                error: message,
                retryAfterSeconds: retryAfterSec,
                statusCode: 429
            });
        }

        validTimestamps.push(now);
        requestMap.set(ip, validTimestamps);
        
        res.setHeader('X-RateLimit-Limit', String(max));
        res.setHeader('X-RateLimit-Remaining', String(max - validTimestamps.length));

        // Periodic garbage collection to prevent memory leaks in long-running node processes
        if (requestMap.size > 2000) {
            for (const [key, val] of requestMap.entries()) {
                if (!val || val.length === 0 || now - val[val.length - 1] > windowMs) {
                    requestMap.delete(key);
                }
            }
        }

        next();
    };
};

export const apiLimiter = createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
    message: 'API rate limit exceeded. Maximum 60 requests per minute allowed.'
});

export const authLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // 15 auth attempts per 15 minutes
    message: 'Too many authentication attempts. Please wait 15 minutes before trying again.'
});
