# Deferred Design Decisions

## Refresh tokens (deferred at batch 2, auth)
Chose single access-token JWT flow over access+refresh for now.
Reason: refresh tokens require real schema decisions (single-use vs
reusable, hashed storage, multi-device revocation) that can't be
correctly designed without a concrete second auth mechanism (OAuth)
to validate against.
Trigger to revisit: the moment OAuth or a second login mechanism is
actually being built — design refresh tokens together with it then,
not before.

## Spring Boot auto-generates a fallback UserDetailsService (batch 2)
If no UserDetailsService bean exists in the context, Spring Boot's
UserDetailsServiceAutoConfiguration creates an in-memory one with a
random password, printed in boot logs as "Using generated security
password: ...". This silently interferes with custom JWT-only auth.
Fix: define your own UserDetailsService bean (even a no-op one that
throws) to suppress the fallback via @ConditionalOnMissingBean.
Always check boot logs for that line on any new Spring Security setup.


### Education ongoing state

Education intentionally does not have a currentlyEnrolled field.
An ongoing degree is represented by endDate = null.

Considered adding currentlyEnrolled to mirror Experience's
currentlyWorking, but rejected it: a second boolean field can drift
out of sync with endDate (e.g. currentlyEnrolled = true while
endDate is also populated), and nothing would constrain the two to
agree without extra validation. Experience accepts that tradeoff
because "Present" is a strong enough convention to be worth it;
Education's single-field null-means-ongoing design avoids the
tradeoff entirely since the convention there is weaker.
