import { validateEmail, validatePassword, sanitizeInput } from '../validators';

describe('validators utility library', () => {
  describe('validateEmail', () => {
    it('should validate correct email structures', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@sub.domain.co.uk')).toBe(true);
    });

    it('should reject incorrect email structures', () => {
      expect(validateEmail('plainaddress')).toBe(false);
      expect(validateEmail('@missingusername.com')).toBe(false);
      expect(validateEmail('username@.com')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate passwords matching all criteria', () => {
      const result = validatePassword('Password123');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject passwords that are too short', () => {
      const result = validatePassword('Pass12');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long.');
    });

    it('should reject passwords without any letter', () => {
      const result = validatePassword('123456789');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one letter.');
    });

    it('should reject passwords without any number', () => {
      const result = validatePassword('NoNumberPassword');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number.');
    });
  });

  describe('sanitizeInput', () => {
    it('should strip HTML tags from standard strings', () => {
      expect(sanitizeInput('<script>alert(1)</script> Hello')).toBe('alert(1) Hello');
      expect(sanitizeInput('<div>Paragraph</div>')).toBe('Paragraph');
    });

    it('should trim whitespace', () => {
      expect(sanitizeInput('   trimmed string   ')).toBe('trimmed string');
    });

    it('should truncate strings exceeding max length', () => {
      expect(sanitizeInput('1234567890', 5)).toBe('12345');
    });

    it('should return empty string for null/undefined/empty input', () => {
      expect(sanitizeInput('')).toBe('');
    });
  });
});
