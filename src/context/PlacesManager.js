// ./src/context/PlacesManager.js
import React from "react"

// initialState where we have currentPlace & destinationPlace.
export const initialState = {
  currentPlace: {
    description: "",
    placeId: "",
    latitude: "",
    longitude: "",
  },
  destinationPlace: {
    description: "",
    placeId: "",
  },
}

// A reducer function to Update our state based on actions.
// Similar to Redux.
export const placeReducer = (prevState, action) => {
  switch (action.type) {
    case "SET_CURRENT_PLACE":
      return {
        ...prevState,
        currentPlace: {
          description: action.description,
          placeId: action.placeId,
          latitude: action.latitude,
          longitude: action.longitude,
        },
      }
  }
}

// We create a context object
export const PlaceContext = React.createContext()

// This is the Context Provider
export const PlaceProvider = ({ children }) => {
  // We add useReducer Hook.
  // Takes a reducer and an initialState as arguments.
  // This return current State and dispatch function.
  const [place, dispatchPlace] = React.useReducer(placeReducer, initialState)

  // We wrapp our components with current State & dispatch function
  return (
    <PlaceContext.Provider value={{ place, dispatchPlace }}>
      {children}
    </PlaceContext.Provider>
  )
}

// This is a custom Hook to consume the created context object.
export const usePlace = () => React.useContext(PlaceContext)