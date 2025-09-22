import React from 'react'
const UserContext = React.createContext()
UserContext.displayName = 'User'

function useUser() {
    const context = React.useContext(UserContext)
    if (!context) {
        throw new Error(`useUser must be used within a UserProvider`)
    }
    return context
}

//FIXME
// function withUser(WrappedComponent) {
//   return (
//     <WrappedComponent user={useUser()} {...this.props} />
//   )
// }

function UserProvider(props) {
    const [user, setUser] = React.useState(props.user)
    const value = React.useMemo(() => [user, setUser], [user])
    return <UserContext.Provider value={value} {...props} />
}

export { UserProvider, useUser }
