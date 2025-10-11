// Validate card number using Luhn algorithm
export const validateCardNumber = (number) => {
  // Remove all non-digit characters (spaces, dashes, etc.)
  const digits = number.replace(/\D/g, '');
  
  // Basic length check
  if (digits.length !== 16) {
    throw new Error('Card number must be 16 digits');
  }

  let sum = 0;        // Will hold the Luhn checksum
  let isEven = false; // Used to decide when to double a digit

  // Traverse digits from right to left (Luhn’s rule)
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i]);

    // Double every second digit
    if (isEven) {
      digit *= 2;
      // If doubling makes it >9, subtract 9
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven; // Toggle for next loop
  }

  // Luhn rule: total sum must be divisible by 10
  if (sum % 10 !== 0) {
    throw new Error('Invalid card number');
  }

  return true; // Card is valid
};

// Validate expiry date in MM/YY format
export const validateCardExpiry = (expiry) => {
  // Accept either MM/YY or digits-only MMYY
  if (!/^\d{2}(\/)?\d{2}$/.test(expiry)) {
    throw new Error('Expiry date must be MM/YY');
  }
  const digits = expiry.replace(/\D/g, '');
  const month = parseInt(digits.slice(0, 2), 10);
  const year = parseInt(digits.slice(2, 4), 10);
  const currentYear = new Date().getFullYear() % 100; // last 2 digits
  const currentMonth = new Date().getMonth() + 1;

  if (month < 1 || month > 12) {
    throw new Error('Month must be 01–12');
  }
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    throw new Error('Card has expired');
  }
  if (year > currentYear + 5) {
    throw new Error('Invalid expiry date');
  }
  return true;
};

// Validate CVV (security code)
export const validateCVV = (cvv) => {
  // Must be 3 or 4 digits (Visa, MasterCard = 3, Amex = 4)
  if (!/^\d{3,4}$/.test(cvv)) {
    throw new Error('CVV must be 3 or 4 digits');
  }
  return true;
};

// Sanitize a phone input to contain only digits and a single leading '+' if present
export const sanitizePhone = (raw = '') => {
  if (typeof raw !== 'string') return '';
  // Remove all characters except digits and '+'
  let cleaned = raw.replace(/[^\d+]/g, '');
  // If '+' occurs not at start, strip them; keep only first if at start
  if (cleaned.startsWith('+')) {
    // Remove any additional '+' characters
    cleaned = '+' + cleaned.slice(1).replace(/\+/g, '');
  } else {
    // Remove any stray '+' inside string
    cleaned = cleaned.replace(/\+/g, '');
  }
  return cleaned;
};

// Phone validation (updated):
//  Requirement change: user wants to allow up to 11 digits (no '+') or up to 12 digits after '+'.
//  We now enforce ONLY the max length + numeric/+ format, not exact length.
//  Rules:
//   - If starts with '+': pattern ^\+\d{1,12}$ (plus followed by 1–12 digits)
//   - Else: pattern ^\d{1,11}$ (1–11 digits)
//  You can tighten minimum length later if business rules require.
export const validatePhone = (phone) => {
  const value = sanitizePhone(phone);
  if (!value) throw new Error('Phone is required');
  if (value.startsWith('+')) {
    if (!/^\+\d{1,12}$/.test(value)) {
      throw new Error('Phone with + must be + followed by up to 12 digits');
    }
  } else {
    if (!/^\d{1,11}$/.test(value)) {
      throw new Error('Phone must be up to 11 digits');
    }
  }
  return true;
};

// Keystroke guard: prevent typing invalid characters directly
export const allowPhoneKey = (e) => {
  const { key, target } = e;
  const controlKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Tab'];
  if (controlKeys.includes(key)) return;
  const raw = target.value;
  const digitsCount = raw.replace(/[^\d]/g, '').length;
  const startsPlus = raw.startsWith('+');
  // Allow one leading +
  if (key === '+') {
    if (target.selectionStart === 0 && !startsPlus && digitsCount === 0) return; // only before digits typed
    e.preventDefault();
    return;
  }
  if (/^\d$/.test(key)) {
    // New max digits: + => 12 digits, else => 11 digits
    const maxDigits = startsPlus ? 12 : 11;
    if (digitsCount >= maxDigits) { e.preventDefault(); return; }
    return;
  }
  e.preventDefault();
};

// Paste guard: sanitize pasted content before insertion
export const handlePhonePaste = (e, setter) => {
  e.preventDefault();
  const pasted = (e.clipboardData || window.clipboardData).getData('text');
  let sanitized = sanitizePhone(pasted);
  // Trim to rules
  if (sanitized.startsWith('+')) {
    // Allow + and up to 12 digits => total length up to 13 chars
    sanitized = sanitized.replace(/^(\+\d{0,12}).*/, '$1');
  } else {
    // Up to 11 digits
    sanitized = sanitized.replace(/^(\d{0,11}).*/, '$1');
  }
  if (typeof setter === 'function') setter(sanitized); else if (e.target) e.target.value = sanitized;
};

// Validate postal code (5 digits only)
export const validatePostalCode = (code) => {
  if (!/^\d{5}$/.test(code)) {
    throw new Error('Postal code must be 5 digits');
  }
  return true;
};

// Validate email address
export const validateEmail = (email) => {
  // Very basic regex for "something@something.domain"
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    throw new Error('Please enter a valid email address');
  }
  return true;
};

// Validate name
export const validateName = (name) => {
  if (name.trim().length < 2) {
    throw new Error('Name must be at least 2 characters long');
  }
  // Only allow letters and spaces
  if (!/^[a-zA-Z\s]*$/.test(name)) {
    throw new Error('Name can only contain letters and spaces');
  }
  return true;
};

// Validate address
export const validateAddress = (address) => {
  if (address.trim().length < 5) {
    throw new Error('Address must be at least 5 characters long');
  }
  return true;
};

// -----------------------------
// Numeric-only input helpers
// -----------------------------

// Generic: keep only digits, optionally trim to max digits
export const sanitizeDigits = (raw = '', maxDigits) => {
  let digits = String(raw || '').replace(/\D/g, '');
  if (typeof maxDigits === 'number') digits = digits.slice(0, maxDigits);
  return digits;
};

// Control keys commonly allowed during typing
const CONTROL_KEYS = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Tab'];

// Generic guard for digit-only fields with a max digit count
export const allowNumericKey = (e, maxDigits) => {
  const { key, target } = e;
  if (CONTROL_KEYS.includes(key)) return; // allow navigation/edit keys
  if (!/^\d$/.test(key)) { e.preventDefault(); return; }

  const value = String(target.value || '');
  const selectionStart = target.selectionStart ?? value.length;
  const selectionEnd = target.selectionEnd ?? value.length;
  const selectionLen = Math.max(0, selectionEnd - selectionStart);
  const digitsCount = value.replace(/\D/g, '').length;
  const nextDigits = digitsCount - selectionLen + 1; // simulate replacing selection with one digit
  if (typeof maxDigits === 'number' && nextDigits > maxDigits) {
    e.preventDefault();
  }
};

// Generic paste handler for digit-only fields
export const handleNumericPaste = (e, setter, maxDigits) => {
  e.preventDefault();
  const pasted = (e.clipboardData || window.clipboardData).getData('text');
  const sanitized = sanitizeDigits(pasted, maxDigits);
  if (typeof setter === 'function') setter(sanitized); else if (e.target) e.target.value = sanitized;
};

// ---- Card Number (16 digits) ----
export const sanitizeCardNumber = (raw = '') => sanitizeDigits(raw, 16);
export const allowCardNumberKey = (e) => allowNumericKey(e, 16);
export const handleCardNumberPaste = (e, setter) => handleNumericPaste(e, setter, 16);

// ---- Expiry Date (MM/YY => 4 digits) ----
export const formatExpiryFromDigits = (digits) => {
  const d = sanitizeDigits(digits, 4);
  const mm = d.slice(0, 2);
  const yy = d.slice(2, 4);
  return yy ? `${mm}/${yy}` : mm;
};
export const sanitizeExpiry = (raw = '') => formatExpiryFromDigits(raw);
export const allowExpiryKey = (e) => allowNumericKey(e, 4); // only digits allowed; UI can insert '/'
export const handleExpiryPaste = (e, setter) => {
  e.preventDefault();
  const pasted = (e.clipboardData || window.clipboardData).getData('text');
  const formatted = formatExpiryFromDigits(pasted);
  if (typeof setter === 'function') setter(formatted); else if (e.target) e.target.value = formatted;
};

// ---- CVV (3-4 digits) ----
export const sanitizeCVVInput = (raw = '') => sanitizeDigits(raw, 4);
export const allowCVVKey = (e) => allowNumericKey(e, 4);
export const handleCVVPaste = (e, setter) => handleNumericPaste(e, setter, 4);

// ---- Postal Code (5 digits) ----
export const sanitizePostalCodeInput = (raw = '') => sanitizeDigits(raw, 5);
export const allowPostalCodeKey = (e) => allowNumericKey(e, 5);
export const handlePostalCodePaste = (e, setter) => handleNumericPaste(e, setter, 5);
