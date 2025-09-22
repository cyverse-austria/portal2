import React from 'react'
import PortalAPI from '../lib/apiClient'

const APIContext = React.createContext()
APIContext.displayName = 'API'

function useAPI() {
    const context = React.useContext(APIContext)
    if (!context) {
        throw new Error(`useAPI must be used within an APIProvider`)
    }
    return new PortalAPI(context)
}

//FIXME
// function withAPI() {
//   return <React.Component api={useAPI()} {...this.props} />
// }

function APIProvider(props) {
    const [token] = React.useState(props.token)
    const [baseUrl] = React.useState(props.baseUrl)
    return <APIContext.Provider value={{ token, baseUrl }} {...props} />
}

export { APIProvider, useAPI }
