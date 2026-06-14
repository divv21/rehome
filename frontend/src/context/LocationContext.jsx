import { createContext, useContext, useState } from 'react'

const LOCATIONS = [
  { id: 'delhi', label: 'Saket, New Delhi', serviceable: true },
  { id: 'gurugram', label: 'XYZ Residency, Gurugram', serviceable: true },
  { id: 'mumbai', label: 'South Mumbai, Mumbai', serviceable: false },
]

const LocationContext = createContext()

export function LocationProvider({ children }) {
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0])

  return (
    <LocationContext.Provider value={{ selectedLocation, setSelectedLocation, LOCATIONS }}>
      {children}
    </LocationContext.Provider>
  )
}

export function useLocation() {
  return useContext(LocationContext)
}

export { LOCATIONS }
