import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Alert,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../hooks/useAuth';
import { usersApi } from '../services/api';
import { User } from '../types';

interface ProfileForm {
  email: string;
  username: string;
  full_name: string;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [success, setSuccess] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({
    defaultValues: {
      email: user?.email || '',
      username: user?.username || '',
      full_name: user?.full_name || '',
    },
  });

  const updateMutation = useMutation(usersApi.updateCurrentUser, {
    onSuccess: (response) => {
      queryClient.setQueryData('currentUser', { data: response.data });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    await updateMutation.mutateAsync(data);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Profile
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>

              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Profile updated successfully!
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      {...register('full_name')}
                      error={!!errors.full_name}
                      helperText={errors.full_name?.message}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Username"
                      {...register('username', {
                        required: 'Username is required',
                        minLength: {
                          value: 3,
                          message: 'Username must be at least 3 characters',
                        },
                      })}
                      error={!!errors.username}
                      helperText={errors.username?.message}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={updateMutation.isLoading}
                    >
                      {updateMutation.isLoading ? 'Updating...' : 'Update Profile'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Status
              </Typography>
              
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Account ID
                </Typography>
                <Typography variant="body1">
                  {user?.id}
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Account Status
                </Typography>
                <Typography variant="body1" color={user?.is_active ? 'success.main' : 'error.main'}>
                  {user?.is_active ? 'Active' : 'Inactive'}
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Member Since
                </Typography>
                <Typography variant="body1">
                  {new Date().toLocaleDateString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;