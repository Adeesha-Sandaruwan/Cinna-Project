// Card number validation using Luhn algorithm
export const validateCardNumber = (number) => {
  const digits = number.replace(/\D/g, '');
  
  if (digits.length !== 16) {
    throw new Error('Card number must be 16 digits');
  }

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  if (sum % 10 !== 0) {
    throw new Error('Invalid card number');
  }

  return true;
};

// Card expiry date validation
export const validateCardExpiry = (expiry) => {
  // Check basic format (MM/YY)
  if (!/^\d{2}\/\d{2}$/.test(expiry)) {
    throw new Error('Expiry date must be in MM/YY format');
  }

  const [month, year] = expiry.split('/').map(part => parseInt(part.trim()));
  const currentYear = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth() + 1;
  
  // Validate month
  if (month < 1 || month > 12) {
    throw new Error('Month must be between 01 and 12');
  }

  // Validate year
  if (year < currentYear) {
    throw new Error('Card has expired');
  }

  // If it's current year, check if month has passed
  if (year === currentYear && month < currentMonth) {
    throw new Error('Card has expired');
  }

  // Check if date is too far in the future (optional, most cards are valid for 5 years)
  if (year > currentYear + 5) {
    throw new Error('Invalid expiry date - too far in the future');
  }
  
  return true;
};

// CVV validation
export const validateCVV = (cvv) => {
  if (!/^\d{3,4}$/.test(cvv)) {
    throw new Error('CVV must be 3 or 4 digits');
  }
  return true;
};

// Phone number validation
export const validatePhone = (phone) => {
  // Allow both formats: +94XXXXXXXXX or 0XXXXXXXXX
  const phoneRegex = /^(?:\+94|0)\d{9}$/;
  
  if (!phoneRegex.test(phone)) {
    throw new Error('Phone number must start with +94 or 0 followed by 9 digits');
  }
  return true;
};

// Postal code validation
export const validatePostalCode = (code) => {
  if (!/^\d{5}$/.test(code)) {
    throw new Error('Postal code must be 5 digits');
  }
  return true;
};

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    throw new Error('Please enter a valid email address');
  }
  return true;
};

// Name validation
export const validateName = (name) => {
  if (name.trim().length < 2) {
    throw new Error('Name must be at least 2 characters long');
  }
  if (!/^[a-zA-Z\s]*$/.test(name)) {
    throw new Error('Name can only contain letters and spaces');
  }
  return true;
};

// Address validation
export const validateAddress = (address) => {
  if (address.trim().length < 5) {
    throw new Error('Address must be at least 5 characters long');
  }
  return true;
};