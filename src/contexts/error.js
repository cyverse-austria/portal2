import React from 'react'
const ErrorContext = React.createContext()
ErrorContext.displayName = 'Error'

function useError() {
    const context = React.useContext(ErrorContext)
    if (!context) {
        throw new Error(`useError must be used within a ErrorProvider`)
    }
    return context
}

//FIXME
// function witError(WrappedComponent) {
//   return (
//     <WrappedComponent error={useError()} {...this.props} />
//   )
// }

function ErrorProvider(props) {
    const [error, setError] = React.useState(null)
    const value = React.useMemo(() => [error, setError], [error])
    return <ErrorContext.Provider value={value} {...props} />
}

// From https://github.com/vercel/next.js/discussions/11281#discussioncomment-48777
function withGetServerSideError(getServerSideFn) {
    return async function wrappedGetServerSideProps(ctx) {
        try {
            const result = await getServerSideFn(ctx)
            return result
        } catch (err) {
            // Return Axios error response
            const error = {
                statusCode:
                    err.response && err.response.status
                        ? err.response.status
                        : 500,
                message:
                    err.response && err.response.statusText
                        ? err.response.statusText
                        : 'Server Error',
            }
            return { props: { error } }
        }
    }
}

export { ErrorProvider, useError, withGetServerSideError }
