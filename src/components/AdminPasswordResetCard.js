import React, { useState } from 'react'
import {
    Typography,
    TextField,
    Button,
    Grid,
    Box,
    CircularProgress,
    Alert,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    FormLabel,
    IconButton,
    InputAdornment,
} from '@mui/material'
import { Visibility, VisibilityOff, Refresh } from '@mui/icons-material'
import { useAPI } from '../contexts/api'
import { useError } from '../contexts/error'

const AdminPasswordResetCard = ({ user, onPasswordReset }) => {
    const api = useAPI()
    const [_, setError] = useError()

    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [passwordMode, setPasswordMode] = useState('custom') // 'custom' or 'generate'
    const [customPassword, setCustomPassword] = useState('')
    const [generatedPassword, setGeneratedPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [message, setMessage] = useState('')

    const generateRandomPassword = () => {
        const length = 16
        const charset =
            'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
        let password = ''

        // Ensure at least one of each type
        const lowercase = 'abcdefghijklmnopqrstuvwxyz'
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        const numbers = '0123456789'
        const special = '!@#$%^&*'

        password += lowercase[Math.floor(Math.random() * lowercase.length)]
        password += uppercase[Math.floor(Math.random() * uppercase.length)]
        password += numbers[Math.floor(Math.random() * numbers.length)]
        password += special[Math.floor(Math.random() * special.length)]

        // Fill the rest randomly
        for (let i = 4; i < length; i++) {
            password += charset[Math.floor(Math.random() * charset.length)]
        }

        // Shuffle the password
        return password
            .split('')
            .sort(() => Math.random() - 0.5)
            .join('')
    }

    const handleGeneratePassword = () => {
        const newPassword = generateRandomPassword()
        setGeneratedPassword(newPassword)
        setPasswordMode('generate')
    }

    const handlePasswordReset = async () => {
        const password =
            passwordMode === 'custom' ? customPassword : generatedPassword

        if (!password) {
            setError('Please enter a password or generate one')
            return
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long')
            return
        }

        setLoading(true)
        setSuccess(false)
        setMessage('')

        try {
            const response = await api.adminPasswordReset(user.id, { password })

            if (response.success) {
                setSuccess(true)
                setMessage(response.message)

                // Refresh user data if callback provided
                if (onPasswordReset) {
                    const updatedUser = await api.user(user.id)
                    onPasswordReset(updatedUser)
                }

                // Clear form
                setCustomPassword('')
                setGeneratedPassword('')
                setPasswordMode('custom')
            } else {
                setError(response.message || 'Password reset failed')
            }
        } catch (error) {
            console.error('Password reset error:', error)
            setError(error.message || 'An error occurred during password reset')
        } finally {
            setLoading(false)
        }
    }

    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    const getPasswordValue = () => {
        return passwordMode === 'custom' ? customPassword : generatedPassword
    }

    const handlePasswordChange = event => {
        setCustomPassword(event.target.value)
        setPasswordMode('custom')
    }

    return (
        <Box>
            <Typography component="div" variant="h5" gutterBottom>
                Admin Password Reset
            </Typography>

            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {message}
                </Alert>
            )}

            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <FormControl component="fieldset">
                        <FormLabel component="legend">
                            Password Option
                        </FormLabel>
                        <RadioGroup
                            row
                            value={passwordMode}
                            onChange={e => setPasswordMode(e.target.value)}
                        >
                            <FormControlLabel
                                value="custom"
                                control={<Radio />}
                                label="Set Custom Password"
                            />
                            <FormControlLabel
                                value="generate"
                                control={<Radio />}
                                label="Generate Random Password"
                            />
                        </RadioGroup>
                    </FormControl>
                </Grid>

                <Grid item xs={12}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <TextField
                            fullWidth
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            value={getPasswordValue()}
                            onChange={handlePasswordChange}
                            disabled={loading}
                            variant="outlined"
                            helperText="Minimum 8 characters required"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={
                                                handleTogglePasswordVisibility
                                            }
                                            disabled={loading}
                                            edge="end"
                                        >
                                            {showPassword ? (
                                                <VisibilityOff />
                                            ) : (
                                                <Visibility />
                                            )}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <IconButton
                            onClick={handleGeneratePassword}
                            disabled={loading}
                            title="Generate random password"
                            color="primary"
                        >
                            <Refresh />
                        </IconButton>
                    </Box>
                </Grid>

                <Grid item xs={12}>
                    <Box display="flex" gap={2} alignItems="center">
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handlePasswordReset}
                            disabled={loading || !getPasswordValue()}
                            startIcon={
                                loading ? <CircularProgress size={20} /> : null
                            }
                        >
                            {loading
                                ? 'Resetting Password...'
                                : 'Reset Password'}
                        </Button>

                        {generatedPassword && passwordMode === 'generate' && (
                            <Typography variant="body2" color="textSecondary">
                                Generated password is ready to use
                            </Typography>
                        )}
                    </Box>
                </Grid>

                <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                        This will reset the user's password across all systems
                        (LDAP, iRODS, etc.) using portal-conductor. If the user
                        doesn't exist in the datastore, an account will be
                        created automatically.
                    </Typography>
                </Grid>
            </Grid>
        </Box>
    )
}

export default AdminPasswordResetCard
