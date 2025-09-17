import React from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'

/**
 * Reusable loading spinner component with customizable message and styling
 *
 * @param {Object} props
 * @param {string} props.message - Loading message to display (required)
 * @param {number} props.size - Size of the spinner (default: 60)
 * @param {string} props.minHeight - Minimum height of the container (default: "400px")
 * @param {Object} props.sx - Additional sx styling for the container
 */
const LoadingSpinner = ({
  message,
  size = 60,
  minHeight = "400px",
  sx = {}
}) => {
  if (!message) {
    console.warn('LoadingSpinner: message prop is required')
    return null
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight={minHeight}
      flexDirection="column"
      sx={sx}
    >
      <CircularProgress size={size} />
      <Typography variant="h6" sx={{ mt: 2 }}>
        {message}
      </Typography>
    </Box>
  )
}

export default LoadingSpinner