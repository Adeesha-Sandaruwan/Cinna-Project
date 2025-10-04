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
  // Must be like "08/27"
  if (!/^\d{2}\/\d{2}$/.test(expiry)) {
    throw new Error('Expiry date must be in MM/YY format');
  }

  const [month, year] = expiry.split('/').map(part => parseInt(part.trim()));
  const currentYear = new Date().getFullYear() % 100; // Take last 2 digits of year
  const currentMonth = new Date().getMonth() + 1;     // JS months are 0-based

  // Month must be 01–12
  if (month < 1 || month > 12) {
    throw new Error('Month must be between 01 and 12');
  }

  // If card year is before current year → expired
  if (year < currentYear) {
    throw new Error('Card has expired');
  }

  // If same year but earlier month → expired
  if (year === currentYear && month < currentMonth) {
    throw new Error('Card has expired');
  }

  // Optional check: don’t allow unrealistically far expiry dates (>5 years from now)
  if (year > currentYear + 5) {
    throw new Error('Invalid expiry date - too far in the future');
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

// Validate phone number (Sri Lanka format)
export const validatePhone = (phone) => {
  // Accepts +94XXXXXXXXX or 0XXXXXXXXX
  const phoneRegex = /^(?:\+94|0)\d{9}$/;
  
  if (!phoneRegex.test(phone)) {
    throw new Error('Phone number must start with +94 or 0 followed by 9 digits');
  }
  return true;
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
