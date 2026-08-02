// Disposable / Temporary / Made-up email domains blocklist
const DISPOSABLE_DOMAINS = new Set([
    'mailinator.com', '10minutemail.com', 'tempmail.com', 'temp-mail.org',
    'guerrillamail.com', 'trashmail.com', 'yopmail.com', 'throwawaymail.com',
    'fake.com', 'example.com', 'test.com', 'dispostable.com', 'sharklasers.com',
    'getnada.com', 'maildrop.cc', 'inboxalias.com', 'crazymailing.com',
    'tmail.ws', 'dayrep.com', 'teleworm.us', 'armyspy.com', 'rhyta.com'
]);

// Standard Email RFC 5322 Regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function validateEmailAddress(email) {
    if (!email || typeof email !== 'string') {
        return { valid: false, error: 'Email address is required' };
    }

    const trimmed = email.trim().toLowerCase();

    // 1. Basic Length Checks
    if (trimmed.length < 6 || trimmed.length > 254) {
        return { valid: false, error: 'Email length is invalid (must be between 6 and 254 characters)' };
    }

    // 2. Syntax & Structure Check
    if (!EMAIL_REGEX.test(trimmed)) {
        return { valid: false, error: 'Invalid email format. Please enter a valid email address (e.g., name@gmail.com)' };
    }

    const [localPart, domain] = trimmed.split('@');

    // 3. Local-part sanity checks
    if (!localPart || localPart.length > 64 || localPart.startsWith('.') || localPart.endsWith('.')) {
        return { valid: false, error: 'Invalid username format before @ symbol' };
    }

    // 4. Domain & TLD checks
    if (!domain || !domain.includes('.')) {
        return { valid: false, error: 'Invalid email domain extension' };
    }

    const domainParts = domain.split('.');
    const tld = domainParts[domainParts.length - 1];

    if (tld.length < 2 || /\d/.test(tld)) {
        return { valid: false, error: `Invalid domain extension ".${tld}". Please check for typos.` };
    }

    // 5. Disposable Email Block
    if (DISPOSABLE_DOMAINS.has(domain)) {
        return { valid: false, error: 'Temporary and disposable email addresses are not permitted. Please use a real email.' };
    }

    // 6. Common Made-up / Placeholder Checks
    if (domain === 'test.com' || domain === 'fake.com' || domain === 'example.com' || localPart === 'test' || localPart === 'asdf') {
        return { valid: false, error: 'Please enter a real email address instead of a placeholder' };
    }

    return { valid: true, email: trimmed };
}
