package com.resumebuilder.auth.service;

import io.github.bucket4j.Bucket;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory rate limiter for POST /api/auth/login, keyed independently by
 * client IP and by the email being attempted -- unlike AiRateLimiterService
 * (which only needs a per-user key, since it only runs after
 * authentication succeeds), login has no authenticated user yet, so it
 * needs two separate keys to catch two separate attack shapes:
 *
 *   - IP-keyed: catches credential stuffing (many different emails tried
 *     rapidly from one source).
 *   - Email-keyed: catches brute-forcing one specific account, including
 *     by an attacker who rotates IPs (VPN, botnet) specifically to dodge
 *     an IP-only limit.
 *
 * Both buckets must allow a request through for login to proceed -- see
 * tryConsume() below, which checks the email bucket first and the IP
 * bucket second (not the reverse -- see that method's javadoc for why the
 * order matters).
 *
 * Limits are deliberately tighter than AiRateLimiterService's (10/hour) --
 * that limit exists to control cost on a paid external API call. This
 * limit exists to make credential guessing economically painful. A real
 * user mistyping a password a few times in a row (autofill glitch, caps
 * lock) should essentially never hit it; a script trying hundreds of
 * passwords should hit it almost immediately.
 *
 * Why refillGreedy (gradual, not a hard per-window reset): same reasoning
 * as AiRateLimiterService -- refillGreedy prevents an attacker from
 * timing a burst right at a window boundary (10 attempts at 11:59, another
 * 10 at 12:00) to briefly double their effective rate.
 *
 * Why in-memory rather than Redis: this app runs as a single instance
 * (see docker-compose.yml -- one app container, no replicas). Same
 * scaling note as AiRateLimiterService applies -- swap for a Redis-backed
 * ProxyManager (bucket4j-redis) if this ever runs on more than one
 * instance, since each instance would otherwise enforce its own limit
 * independently.
 */
@Service
public class LoginRateLimiterService {

    // Per IP: 30 login attempts per 15 minutes. Loose enough that a
    // shared IP (office network, campus Wi-Fi, mobile carrier NAT) with
    // several genuine users logging in around the same time won't
    // collide with each other, but tight enough to make a credential-
    // stuffing sweep across many emails from one IP slow to the point of
    // being impractical.
    private static final int IP_CAPACITY = 30;
    private static final Duration IP_REFILL_PERIOD = Duration.ofMinutes(15);

    // Per email: 10 attempts per 15 minutes, consumed on every attempt
    // (success or failure) -- see tryConsume() javadoc below for why.
    // Gives a real user comfortable room to mistype their password a
    // handful of times (autofill glitch, caps lock, forgotten password)
    // before hitting the limit, while still blocking a targeted brute-
    // force attempt against one account quickly.
    private static final int EMAIL_CAPACITY = 10;
    private static final Duration EMAIL_REFILL_PERIOD = Duration.ofMinutes(15);

    // Per IP for Registration: 10 registrations per 30 minutes.
    // Prevents automated bot account creation and registration DDoS spam.
    private static final int REGISTER_IP_CAPACITY = 10;
    private static final Duration REGISTER_IP_REFILL_PERIOD = Duration.ofMinutes(30);

    private final ConcurrentHashMap<String, Bucket> ipBuckets = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Bucket> emailBuckets = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Bucket> registerIpBuckets = new ConcurrentHashMap<>();

    /**
     * Attempts to consume one token from both the email bucket and the IP
     * bucket for this login attempt. Returns true only if both allow it.
     */
    public boolean tryConsume(String clientIp, String emailKey) {
        Bucket emailBucket = emailBuckets.computeIfAbsent(emailKey, k -> newEmailBucket());

        if (!emailBucket.tryConsume(1)) {
            return false;
        }

        Bucket ipBucket = ipBuckets.computeIfAbsent(clientIp, k -> newIpBucket());
        if (!ipBucket.tryConsume(1)) {
            emailBucket.addTokens(1);
            return false;
        }

        return true;
    }

    /**
     * Attempts to consume one registration token for the requesting IP.
     * Returns true if allowed, false if rate limit exceeded.
     */
    public boolean tryConsumeRegistration(String clientIp) {
        Bucket registerBucket = registerIpBuckets.computeIfAbsent(clientIp, k -> newRegisterIpBucket());
        return registerBucket.tryConsume(1);
    }

    private Bucket newIpBucket() {
        return Bucket.builder()
                .addLimit(limit -> limit.capacity(IP_CAPACITY).refillGreedy(IP_CAPACITY, IP_REFILL_PERIOD))
                .build();
    }

    private Bucket newEmailBucket() {
        return Bucket.builder()
                .addLimit(limit -> limit.capacity(EMAIL_CAPACITY).refillGreedy(EMAIL_CAPACITY, EMAIL_REFILL_PERIOD))
                .build();
    }

    private Bucket newRegisterIpBucket() {
        return Bucket.builder()
                .addLimit(limit -> limit.capacity(REGISTER_IP_CAPACITY).refillGreedy(REGISTER_IP_CAPACITY, REGISTER_IP_REFILL_PERIOD))
                .build();
    }
}