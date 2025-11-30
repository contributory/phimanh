'use client';

import * as React from 'react';
import { TextField, TextFieldProps, InputAdornment, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { forwardRef, useState } from 'react';
import { Eye, EyeOff, Search, X } from 'lucide-react';

// Enhanced Material TextField with custom styling
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    backgroundColor: 'hsl(var(--background))',
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
    
    '& fieldset': {
      borderColor: 'hsl(var(--border))',
      borderWidth: 2,
    },
    
    '&:hover fieldset': {
      borderColor: 'hsl(var(--primary))',
      boxShadow: '0 0 0 3px hsla(var(--primary), 0.1)',
    },
    
    '&.Mui-focused fieldset': {
      borderColor: 'hsl(var(--primary))',
      borderWidth: 2,
      boxShadow: '0 0 0 3px hsla(var(--primary), 0.15)',
    },
    
    '&.Mui-error fieldset': {
      borderColor: 'hsl(var(--destructive))',
    },
    
    '&.Mui-error:hover fieldset': {
      borderColor: 'hsl(var(--destructive))',
      boxShadow: '0 0 0 3px hsla(var(--destructive), 0.1)',
    },
    
    '&.Mui-error.Mui-focused fieldset': {
      borderColor: 'hsl(var(--destructive))',
      boxShadow: '0 0 0 3px hsla(var(--destructive), 0.15)',
    },
  },
  
  '& .MuiInputLabel-root': {
    color: 'hsl(var(--muted-foreground))',
    fontSize: '0.875rem',
    
    '&.Mui-focused': {
      color: 'hsl(var(--primary))',
    },
    
    '&.Mui-error': {
      color: 'hsl(var(--destructive))',
    },
  },
  
  '& .MuiOutlinedInput-input': {
    color: 'hsl(var(--foreground))',
    fontSize: '0.875rem',
    padding: '12px 14px',
    
    '&::placeholder': {
      color: 'hsl(var(--muted-foreground))',
      opacity: 1,
    },
  },
  
  '& .MuiFormHelperText-root': {
    fontSize: '0.75rem',
    marginLeft: 4,
    marginTop: 6,
    
    '&.Mui-error': {
      color: 'hsl(var(--destructive))',
    },
  },
  
  // Size variants
  '&.size-small .MuiOutlinedInput-input': {
    padding: '8px 12px',
    fontSize: '0.75rem',
  },
  
  '&.size-large .MuiOutlinedInput-input': {
    padding: '16px 18px',
    fontSize: '1rem',
  },
  
  // Search variant styling
  '&.variant-search': {
    '& .MuiOutlinedInput-root': {
      borderRadius: 24,
      backgroundColor: 'hsl(var(--muted))',
      
      '& fieldset': {
        border: 'none',
      },
      
      '&:hover fieldset': {
        border: 'none',
        boxShadow: 'var(--shadow-sm)',
      },
      
      '&.Mui-focused fieldset': {
        border: 'none',
        boxShadow: 'var(--shadow-md)',
      },
    },
  },
  
  // Glass morphism variant
  '&.variant-glass': {
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      
      '& fieldset': {
        border: 'none',
      },
      
      '&:hover fieldset': {
        border: 'none',
        boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.3)',
      },
      
      '&.Mui-focused fieldset': {
        border: 'none',
        boxShadow: '0 0 0 2px hsl(var(--primary))',
      },
    },
    
    '.dark &': {
      '& .MuiOutlinedInput-root': {
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      },
    },
  },
}));

export interface EnhancedInputProps extends Omit<TextFieldProps, 'variant' | 'size'> {
  variant?: 'default' | 'search' | 'glass';
  size?: 'small' | 'medium' | 'large';
  clearable?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'start' | 'end';
}

const EnhancedInput = forwardRef<HTMLDivElement, EnhancedInputProps>(
  ({ 
    type = 'text', 
    variant = 'default', 
    size = 'medium',
    clearable = false,
    loading = false,
    icon,
    iconPosition = 'start',
    value,
    onChange,
    className,
    InputProps,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [internalValue, setInternalValue] = useState(value || '');
    
    // Handle controlled/uncontrolled component
    const inputValue = value !== undefined ? value : internalValue;
    const hasValue = Boolean(inputValue && inputValue.toString().length > 0);
    
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      if (value === undefined) {
        setInternalValue(newValue);
      }
      if (onChange) {
        onChange(event);
      }
    };
    
    const handleClear = () => {
      const event = {
        target: { value: '' }
      } as React.ChangeEvent<HTMLInputElement>;
      
      if (value === undefined) {
        setInternalValue('');
      }
      if (onChange) {
        onChange(event);
      }
    };
    
    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };
    
    // Determine input type
    const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;
    
    // Build class names
    const classNames = [
      `size-${size}`,
      variant !== 'default' && `variant-${variant}`,
      className,
    ].filter(Boolean).join(' ');
    
    // Build start adornment
    const startAdornment = [];
    if (icon && iconPosition === 'start') {
      startAdornment.push(
        <InputAdornment position="start" key="icon">
          {icon}
        </InputAdornment>
      );
    }
    if (variant === 'search' && !icon) {
      startAdornment.push(
        <InputAdornment position="start" key="search">
          <Search size={18} />
        </InputAdornment>
      );
    }
    
    // Build end adornment
    const endAdornment = [];
    if (loading) {
      endAdornment.push(
        <InputAdornment position="end" key="loading">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        </InputAdornment>
      );
    } else {
      if (clearable && hasValue) {
        endAdornment.push(
          <InputAdornment position="end" key="clear">
            <IconButton
              size="small"
              onClick={handleClear}
              edge="end"
              sx={{ padding: '4px' }}
            >
              <X size={16} />
            </IconButton>
          </InputAdornment>
        );
      }
      
      if (type === 'password') {
        endAdornment.push(
          <InputAdornment position="end" key="password-toggle">
            <IconButton
              size="small"
              onClick={togglePasswordVisibility}
              edge="end"
              sx={{ padding: '4px' }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </IconButton>
          </InputAdornment>
        );
      }
      
      if (icon && iconPosition === 'end') {
        endAdornment.push(
          <InputAdornment position="end" key="end-icon">
            {icon}
          </InputAdornment>
        );
      }
    }
    
    return (
      <StyledTextField
        ref={ref}
        type={inputType}
        value={inputValue}
        onChange={handleChange}
        className={classNames}
        variant="outlined"
        fullWidth
        InputProps={{
          startAdornment: startAdornment.length > 0 ? startAdornment : undefined,
          endAdornment: endAdornment.length > 0 ? endAdornment : undefined,
          ...InputProps,
        }}
        {...props}
      />
    );
  }
);

EnhancedInput.displayName = 'EnhancedInput';

export default EnhancedInput;