// Product form validation functions

export const validateName = (name) => {
  if (!name) {
    return "Product name is required";
  }
  if (name.length > 100) {
    return "Product name cannot exceed 100 characters";
  }
  // Allow letters, numbers, spaces, and basic punctuation
  if (!/^[a-zA-Z0-9\s.,!?-]+$/.test(name)) {
    return "Product name can only contain letters, numbers, spaces, and basic punctuation";
  }
  return "";
};

export const validateDescription = (description) => {
  if (!description) {
    return "Description is required";
  }
  if (description.trim().length < 5) {
    return "Description must be at least 5 characters";
  }
  if (description.length > 2000) {
    return "Description cannot exceed 2000 characters";
  }
  return "";
};

export const validateSKU = (sku) => {
  if (!sku) {
    return "SKU is required";
  }
  // Format validation: CIN-XXXX-XXX
  if (!/^CIN-[A-Z]+-\d{3}$/.test(sku)) {
    return "SKU must be in format CIN-XXXX-XXX (e.g., CIN-WINE-009)";
  }
  if (sku.length < 5 || sku.length > 30) {
    return "SKU must be between 5 and 30 characters";
  }
  return "";
};

export const validatePrice = (price) => {
  if (!price) {
    return "Price is required";
  }
  const numPrice = parseFloat(price);
  if (isNaN(numPrice) || numPrice <= 0) {
    return "Price must be greater than 0";
  }
  if (numPrice > 999999.99) {
    return "Price cannot exceed 999,999.99";
  }
  // Check for more than 2 decimal places
  if (price.toString().includes('.') && price.toString().split('.')[1].length > 2) {
    return "Price cannot have more than 2 decimal places";
  }
  return "";
};

export const validateStock = (stock) => {
  if (!stock) {
    return "Stock quantity is required";
  }
  const numStock = parseInt(stock);
  if (!Number.isInteger(numStock)) {
    return "Stock must be a whole number";
  }
  if (numStock < 5) {
    return "Stock must be at least 5 units";
  }
  if (numStock > 100000) {
    return "Stock cannot exceed 100,000 units";
  }
  return "";
};

export const validateCategory = (category) => {
  if (!category) {
    return "Category is required";
  }
  return "";
};

export const validateGrade = (grade) => {
  if (!grade) {
    return "Grade is required";
  }
  if (!['A', 'B', 'C'].includes(grade)) {
    return "Grade must be A, B, or C";
  }
  return "";
};

export const validateExpiryDate = (expiryDate) => {
  if (!expiryDate) {
    return "Expiry date is required";
  }

  const today = new Date();
  const expiry = new Date(expiryDate);
  const fiveYearsFromNow = new Date(today.getFullYear() + 5, today.getMonth(), today.getDate());

  if (expiry < today) {
    return "Expiry date cannot be in the past";
  }

  if (expiry > fiveYearsFromNow) {
    return "Expiry date cannot be more than 5 years in the future";
  }

  return "";
};

export const validateVisibility = (visibility) => {
  if (!visibility) {
    return "Visibility is required";
  }
  if (!['public', 'private'].includes(visibility)) {
    return "Visibility must be either public or private";
  }
  return "";
};

export const validateImage = async (image) => {
  if (!image) {
    return "Product image is required";
  }

  // Check file size (2MB = 2 * 1024 * 1024 bytes)
  if (image.size > 2 * 1024 * 1024) {
    return "Image size cannot exceed 2MB";
  }

  // Check file type
  if (!image.type.startsWith("image/")) {
    return "File must be an image";
  }

  // Check dimensions
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      if (img.width < 300 || img.height < 300) {
        resolve("Image dimensions must be at least 300x300 pixels");
      }
      resolve("");
    };
    img.onerror = () => {
      resolve("Invalid image file");
    };
    img.src = URL.createObjectURL(image);
  });
};