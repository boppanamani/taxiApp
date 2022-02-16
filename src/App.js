import React from "react"
import UserScreen from "./screens/UserScreen"
import { PlaceProvider } from "./context/PlacesManager"

const App = () => {
  return (
    <PlaceProvider>
      <UserScreen />
    </PlaceProvider>
  )
}

export default App