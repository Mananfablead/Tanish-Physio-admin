export interface ValidationError {
  [key: string]: string;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  message?: string;
  customValidator?: (value: any) => string | null;
}

export interface ValidationSchema {
  [fieldName: string]: ValidationRule;
}

export const validateField = (
  value: any,
  fieldName: string,
  schema: ValidationSchema
): string | null => {
  const rules = schema[fieldName];
  if (!rules) return null;

  // Required validation
  if (rules.required) {
    if (value === null || value === undefined || value === '') {
      return rules.message || `${fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`;
    }
  }

  // Skip other validations if field is empty and not required
  if (value === null || value === undefined || value === '') {
    return null;
  }

  // Min length validation
  if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
    return rules.message || `${fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} must be at least ${rules.minLength} characters`;
  }

  // Max length validation
  if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
    return rules.message || `${fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} must be no more than ${rules.maxLength} characters`;
  }

  // Pattern validation
  if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
    return rules.message || `${fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} format is invalid`;
  }

  // Custom validator
  if (rules.customValidator) {
    const customError = rules.customValidator(value);
    if (customError) {
      return customError;
    }
  }

  return null;
};

export const validateForm = (
  formData: any,
  schema: ValidationSchema
): ValidationError => {
  const errors: ValidationError = {};

  for (const fieldName in schema) {
    const error = validateField(formData[fieldName], fieldName, schema);
    if (error) {
      errors[fieldName] = error;
    }
  }

  return errors;
};

// Predefined validation schemas for different sections
export const heroValidationSchema: ValidationSchema = {
  heading: { required: true, minLength: 1, maxLength: 100 },
  subHeading: { required: true, minLength: 1, maxLength: 150 },
  description: { required: true, minLength: 10, maxLength: 500 },
  ctaText: { required: true, minLength: 1, maxLength: 50 },
  trustedBy: { required: true, minLength: 1, maxLength: 100 },
  features: { 
    customValidator: (value: string[]) => {
      if (!value || value.length === 0) return 'At least one feature is required';
      if (value.some(feature => !feature.trim())) return 'All features must have content';
      return null;
    }
  },
  image: { 
    required: true,
    customValidator: (value: string | File | null) => {
      if (!value) return 'Hero image is required';
      if (typeof value === 'string' && value.trim() === '') return 'Hero image is required';
      if (value instanceof File) {
        if (value.size > 5 * 1024 * 1024) return 'Image size must be less than 5MB';
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(value.type)) {
          return 'Only JPEG, PNG, WEBP, and GIF formats are allowed';
        }
      }
      return null;
    }
  }
};

export const stepValidationSchema: ValidationSchema = {
  title: { required: true, minLength: 1, maxLength: 100 },
  description: { required: true, minLength: 10, maxLength: 300 },
  image: { 
    required: true,
    customValidator: (value: string | File | null) => {
      if (!value) return 'Step image is required';
      if (typeof value === 'string' && value.trim() === '') return 'Step image is required';
      if (value instanceof File) {
        if (value.size > 5 * 1024 * 1024) return 'Image size must be less than 5MB';
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(value.type)) {
          return 'Only JPEG, PNG, WEBP, and GIF formats are allowed';
        }
      }
      return null;
    }
  }
};

export const conditionValidationSchema: ValidationSchema = {
  name: { required: true, minLength: 1, maxLength: 100 },
  content: { required: true, minLength: 10, maxLength: 1000 },
  image: { 
    required: true,
    customValidator: (value: string | File | null) => {
      if (!value) return 'Condition image is required';
      if (typeof value === 'string' && value.trim() === '') return 'Condition image is required';
      if (value instanceof File) {
        if (value.size > 5 * 1024 * 1024) return 'Image size must be less than 5MB';
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(value.type)) {
          return 'Only JPEG, PNG, WEBP, and GIF formats are allowed';
        }
      }
      return null;
    }
  }
};

export const conditionsSectionValidationSchema: ValidationSchema = {
  title: { required: true, minLength: 1, maxLength: 100 },
  description: { required: true, minLength: 10, maxLength: 500 },
  image: { 
    required: true,
    customValidator: (value: string | File | null) => {
      if (!value) return 'Section image is required';
      if (typeof value === 'string' && value.trim() === '') return 'Section image is required';
      if (value instanceof File) {
        if (value.size > 5 * 1024 * 1024) return 'Image size must be less than 5MB';
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(value.type)) {
          return 'Only JPEG, PNG, and GIF formats are allowed';
        }
      }
      return null;
    }
  }
};

export const whyUsValidationSchema: ValidationSchema = {
  title: { required: true, minLength: 1, maxLength: 100 },
  description: { required: true, minLength: 10, maxLength: 500 },
  stats: { 
    customValidator: (value: any[]) => {
      if (!value || value.length === 0) return 'At least one statistic is required';
      const invalidStats = value.filter(stat => 
        !stat.label?.trim() || !stat.value?.trim() || !stat.description?.trim()
      );
      if (invalidStats.length > 0) return 'All statistics must have label, value, and description';
      return null;
    }
  },
  features: { 
    customValidator: (value: string[]) => {
      if (!value || value.length === 0) return 'At least one feature is required';
      if (value.some(feature => !feature.trim())) return 'All features must have content';
      return null;
    }
  }
};

export const faqValidationSchema: ValidationSchema = {
  question: { required: true, minLength: 5, maxLength: 200 },
  answer: { required: true, minLength: 10, maxLength: 1000 }
};

export const termsValidationSchema: ValidationSchema = {
  title: { required: true, minLength: 1, maxLength: 100 },
  content: { required: true, minLength: 50, maxLength: 10000 }
};

export const contactValidationSchema: ValidationSchema = {
  title: { required: true, minLength: 1, maxLength: 100 },
  description: { required: true, minLength: 10, maxLength: 500 },
  email: { 
    required: true, 
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  phone: { required: true, minLength: 8, maxLength: 20 },
  address: { required: true, minLength: 10, maxLength: 300 },
  hours: { required: true, minLength: 10, maxLength: 300 }
};

export const aboutValidationSchema: ValidationSchema = {
  title: { required: true, minLength: 1, maxLength: 100 },
  description: { required: true, minLength: 10, maxLength: 500 },
  mission: { required: true, minLength: 10, maxLength: 1000 },
  vision: { required: true, minLength: 10, maxLength: 1000 },
  foundingStory: { required: true, minLength: 10, maxLength: 1000 },
  teamInfo: { required: true, minLength: 10, maxLength: 1000 },
  values: { 
    customValidator: (value: string[]) => {
      if (!value || value.length === 0) return 'At least one value is required';
      if (value.some(val => !val.trim())) return 'All values must have content';
      return null;
    }
  },
  images: { 
    customValidator: (value: (string | File)[]) => {
      if (!value || value.length === 0) return 'At least one image is required';
      if (value.some(img => img instanceof File)) {
        const invalidFiles = value.filter(img => img instanceof File && (
          img.size > 5 * 1024 * 1024 || 
          !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(img.type)
        ));
        if (invalidFiles.length > 0) {
          return 'All images must be less than 5MB and in JPEG, PNG, WEBP, or GIF format';
        }
      }
      return null;
    }
  }
};