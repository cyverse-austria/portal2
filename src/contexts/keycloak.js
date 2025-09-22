import React from 'react'
const KeycloakContext = React.createContext()
KeycloakContext.displayName = 'Keycloak'

function useKeycloak() {
    const context = React.useContext(KeycloakContext)
    if (!context) {
        throw new Error(`useKeycloak must be used within a KeycloakProvider`)
    }
    return context
}

//FIXME
// function withKeycloak() {
//   return <React.Component keycloak={useKeycloak()} {...this.props} />
// }

function KeycloakProvider(props) {
    const kauth = props.kauth
    // const [keycloak, setKeycloak] = React.useState()
    // const value = React.useMemo(() => [keycloak, setKeycloak], [keycloak])
    const token =
        kauth && kauth.grant && kauth.grant.access_token
            ? kauth.grant.access_token
            : null
    const profile = token
        ? {
              id: token.content.preferred_username,
              email: token.content.email,
              entitlement: token.content.entitlement,
              firstName: token.content.given_name,
              lastName: token.content.family_name,
              name: token.content.name,
          }
        : null
    return <KeycloakContext.Provider value={{ token, profile }} {...props} />
}

export { KeycloakProvider, useKeycloak }
