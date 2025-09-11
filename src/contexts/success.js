import React from 'react'

const SuccessContext = React.createContext()
SuccessContext.displayName = 'Success'

function useSuccess() {
  const context = React.useContext(SuccessContext)
  if (!context) {
    throw new Error(`useSuccess must be used within a SuccessProvider`)
  }
  return context
}

function SuccessProvider(props) {
  const [success, setSuccess] = React.useState(null);
  const value = React.useMemo(() => [success, setSuccess], [success])
  return <SuccessContext.Provider value={value} {...props} />
}

export { SuccessProvider, useSuccess };