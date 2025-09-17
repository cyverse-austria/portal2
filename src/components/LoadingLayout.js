import React from 'react'
import Layout from './Layout'
import LoadingSpinner from './LoadingSpinner'

/**
 * Layout component that displays a loading spinner
 * Combines Layout wrapper with LoadingSpinner for full-page loading states
 *
 * @param {Object} props
 * @param {string} props.message - Loading message to display (required)
 * @param {string} props.title - Page title for Layout (required)
 * @param {boolean} props.breadcrumbs - Show breadcrumbs (optional)
 * @param {number} props.size - Size of the spinner (default: 60)
 * @param {string} props.minHeight - Minimum height of the spinner container (default: "400px")
 * @param {React.ReactNode} props.children - Additional content to render before spinner (optional)
 * @param {Object} props.spinnerSx - Additional sx styling for the spinner container
 * @param {...Object} layoutProps - Additional props passed to Layout component
 */
const LoadingLayout = ({
  message,
  title,
  breadcrumbs,
  size = 60,
  minHeight = "400px",
  children,
  spinnerSx = {},
  ...layoutProps
}) => {
  if (!message) {
    console.warn('LoadingLayout: message prop is required')
    return <Layout title={title || "Loading"} {...layoutProps} />
  }

  if (!title) {
    console.warn('LoadingLayout: title prop is required')
  }

  return (
    <Layout title={title || "Loading"} breadcrumbs={breadcrumbs} {...layoutProps}>
      {children}
      <LoadingSpinner
        message={message}
        size={size}
        minHeight={minHeight}
        sx={spinnerSx}
      />
    </Layout>
  )
}

export default LoadingLayout