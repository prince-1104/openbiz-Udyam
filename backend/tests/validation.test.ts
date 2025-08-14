const { z } = require('zod');

// Test validation schemas
const step1Schema = z.object({
  aadhaarNumber: z.string()
    .length(12, 'Aadhaar number must be exactly 12 digits')
    .regex(/^[0-9]{12}$/, 'Aadhaar number must contain only digits'),
  mobileNumber: z.string()
    .length(10, 'Mobile number must be exactly 10 digits')
    .regex(/^[6-9][0-9]{9}$/, 'Mobile number must start with 6-9 and be 10 digits'),
});

const step2Schema = z.object({
  panNumber: z.string()
    .length(10, 'PAN number must be exactly 10 characters')
    .regex(/^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$/, 'Invalid PAN format. Expected format: ABCDE1234F'),
  businessName: z.string()
    .min(3, 'Business name must be at least 3 characters')
    .max(100, 'Business name must be less than 100 characters'),
  ownerName: z.string()
    .min(3, 'Owner name must be at least 3 characters')
    .max(100, 'Owner name must be less than 100 characters'),
  dateOfBirth: z.string()
    .min(1, 'Date of birth is required'),
  gender: z.string()
    .min(1, 'Gender selection is required'),
  socialCategory: z.string()
    .min(1, 'Social category selection is required'),
  physicallyHandicapped: z.boolean().optional(),
  exServiceman: z.boolean().optional(),
});

describe('Step 1 Validation', () => {
  test('should validate correct Aadhaar number', () => {
    const validData = {
      aadhaarNumber: '123456789012',
      mobileNumber: '9876543210'
    };
    
    const result = step1Schema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  test('should reject invalid Aadhaar number length', () => {
    const invalidData = {
      aadhaarNumber: '12345678901', // 11 digits
      mobileNumber: '9876543210'
    };
    
    const result = step1Schema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      console.log('Error structure:', JSON.stringify(result.error, null, 2));
      expect(result.error.issues && result.error.issues.length > 0).toBe(true);
      expect(result.error.issues[0].message).toContain('12 digits');
    }
  });

  test('should reject Aadhaar with non-digits', () => {
    const invalidData = {
      aadhaarNumber: '12345678901a', // contains letter
      mobileNumber: '9876543210'
    };
    
    const result = step1Schema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues && result.error.issues.length > 0).toBe(true);
      expect(result.error.issues[0].message).toContain('only digits');
    }
  });

  test('should validate correct mobile number', () => {
    const validData = {
      aadhaarNumber: '123456789012',
      mobileNumber: '9876543210'
    };
    
    const result = step1Schema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  test('should reject mobile number starting with invalid digit', () => {
    const invalidData = {
      aadhaarNumber: '123456789012',
      mobileNumber: '1876543210' // starts with 1
    };
    
    const result = step1Schema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues && result.error.issues.length > 0).toBe(true);
      expect(result.error.issues[0].message).toContain('start with 6-9');
    }
  });
});

describe('Step 2 Validation', () => {
  test('should validate correct PAN number', () => {
    const validData = {
      panNumber: 'ABCDE1234F',
      businessName: 'Test Business',
      ownerName: 'John Doe',
      dateOfBirth: '1990-01-01',
      gender: 'Male',
      socialCategory: 'General'
    };
    
    const result = step2Schema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  test('should reject invalid PAN format', () => {
    const invalidData = {
      panNumber: 'ABCD12345', // wrong format
      businessName: 'Test Business',
      ownerName: 'John Doe',
      dateOfBirth: '1990-01-01',
      gender: 'Male',
      socialCategory: 'General'
    };
    
    const result = step2Schema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues && result.error.issues.length > 0).toBe(true);
      expect(result.error.issues[0].message).toContain('10 characters');
    }
  });

  test('should reject business name that is too short', () => {
    const invalidData = {
      panNumber: 'ABCDE1234F',
      businessName: 'AB', // too short
      ownerName: 'John Doe',
      dateOfBirth: '1990-01-01',
      gender: 'Male',
      socialCategory: 'General'
    };
    
    const result = step2Schema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues && result.error.issues.length > 0).toBe(true);
      expect(result.error.issues[0].message).toContain('at least 3 characters');
    }
  });

  test('should validate optional fields', () => {
    const validData = {
      panNumber: 'ABCDE1234F',
      businessName: 'Test Business',
      ownerName: 'John Doe',
      dateOfBirth: '1990-01-01',
      gender: 'Male',
      socialCategory: 'General',
      physicallyHandicapped: true,
      exServiceman: false
    };
    
    const result = step2Schema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});
