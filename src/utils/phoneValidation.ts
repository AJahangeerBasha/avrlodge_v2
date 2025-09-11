// Phone number validation utilities

export const validatePhoneNumber = (phone: string): boolean => {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Check if it's exactly 10 digits and starts with 6-9
  if (cleanPhone.length !== 10) return false;
  
  const firstDigit = parseInt(cleanPhone[0]);
  return firstDigit >= 6 && firstDigit <= 9;
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Limit to 10 digits
  return cleanPhone.slice(0, 10);
};

export const isValidPhoneNumber = (phone: string): boolean => {
  return validatePhoneNumber(phone);
};

export const getPhoneValidationError = (phone: string): string | null => {
  if (!phone) return 'Phone number is required';
  
  const cleanPhone = formatPhoneNumber(phone);
  
  if (cleanPhone.length === 0) return 'Phone number is required';
  if (cleanPhone.length < 10) return 'Phone number must be 10 digits starting with 6-9';
  if (cleanPhone.length > 10) return 'Phone number must be exactly 10 digits starting with 6-9';
  
  // Check if it starts with 6-9
  const firstDigit = parseInt(cleanPhone[0]);
  if (firstDigit < 6 || firstDigit > 9) {
    return 'Phone number must start with 6, 7, 8, or 9';
  }
  
  return null;
};

export const formatDisplayPhone = (phone: string): string => {
  const cleanPhone = formatPhoneNumber(phone);
  
  if (cleanPhone.length === 10) {
    // Format as XXX-XXX-XXXX
    return `${cleanPhone.slice(0, 3)}-${cleanPhone.slice(3, 6)}-${cleanPhone.slice(6)}`;
  }
  
  return cleanPhone;
};