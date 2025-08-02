import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import { RegisterRequest } from '../types';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterRequest & { confirmPassword: string }>();

  const password = watch('password');

  const onSubmit = async (data: RegisterRequest & { confirmPassword: string }) => {
    setLoading(true);
    setError(null);

    try {
      await registerUser({
        email: data.email,
        username: data.username,
        password: data.password,
        full_name: data.full_name,
      });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{ backgroundColor: '#1a1a1a' }}
    >
      <Card sx={{ 
        maxWidth: 400, 
        width: '100%', 
        backgroundColor: '#2a2a2a',
        border: '1px solid #444',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ color: '#e5e5e5' }}>
            Register
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Full Name"
              margin="normal"
              {...register('full_name')}
              error={!!errors.full_name}
              helperText={errors.full_name?.message}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#1a1a1a',
                  color: '#e5e5e5',
                  '& fieldset': {
                    borderColor: '#444',
                  },
                  '&:hover fieldset': {
                    borderColor: '#666',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#b0b0b0',
                  '&.Mui-focused': {
                    color: '#667eea',
                  },
                },
                '& .MuiFormHelperText-root': {
                  color: '#ff6b6b',
                },
              }}
            />

            <TextField
              fullWidth
              label="Username"
              margin="normal"
              {...register('username', {
                required: 'Username is required',
                minLength: {
                  value: 3,
                  message: 'Username must be at least 3 characters',
                },
              })}
              error={!!errors.username}
              helperText={errors.username?.message}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#1a1a1a',
                  color: '#e5e5e5',
                  '& fieldset': {
                    borderColor: '#444',
                  },
                  '&:hover fieldset': {
                    borderColor: '#666',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#b0b0b0',
                  '&.Mui-focused': {
                    color: '#667eea',
                  },
                },
                '& .MuiFormHelperText-root': {
                  color: '#ff6b6b',
                },
              }}
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              margin="normal"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#1a1a1a',
                  color: '#e5e5e5',
                  '& fieldset': {
                    borderColor: '#444',
                  },
                  '&:hover fieldset': {
                    borderColor: '#666',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#b0b0b0',
                  '&.Mui-focused': {
                    color: '#667eea',
                  },
                },
                '& .MuiFormHelperText-root': {
                  color: '#ff6b6b',
                },
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#1a1a1a',
                  color: '#e5e5e5',
                  '& fieldset': {
                    borderColor: '#444',
                  },
                  '&:hover fieldset': {
                    borderColor: '#666',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#b0b0b0',
                  '&.Mui-focused': {
                    color: '#667eea',
                  },
                },
                '& .MuiFormHelperText-root': {
                  color: '#ff6b6b',
                },
              }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              margin="normal"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) =>
                  value === password || 'Passwords do not match',
              })}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#1a1a1a',
                  color: '#e5e5e5',
                  '& fieldset': {
                    borderColor: '#444',
                  },
                  '&:hover fieldset': {
                    borderColor: '#666',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#b0b0b0',
                  '&.Mui-focused': {
                    color: '#667eea',
                  },
                },
                '& .MuiFormHelperText-root': {
                  color: '#ff6b6b',
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3, 
                mb: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                },
              }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Register'}
            </Button>
          </form>

          <Typography variant="body2" align="center" sx={{ color: '#b0b0b0' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#667eea', textDecoration: 'none' }}>
              Sign in
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;