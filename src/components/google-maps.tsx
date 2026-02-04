'use client'

import { useState, useCallback, useRef } from 'react'
import { Wrapper, Status } from '@googlemaps/react-wrapper'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Loader2 } from 'lucide-react'

interface Location {
  address: string
  lat: number
  lng: number
}

interface LocationPickerProps {
  label: string
  value: string
  onChange: (location: Location) => void
  placeholder?: string
}

const render = (status: Status) => {
  switch (status) {
    case Status.LOADING:
      return (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading maps...</span>
        </div>
      )
    case Status.FAILURE:
      return (
        <div className="text-red-500 p-4">
          Failed to load Google Maps. Please check your API key.
        </div>
      )
    case Status.SUCCESS:
      return <MapComponent />
  }
}

function MapComponent() {
  return (
    <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Map will appear here</p>
    </div>
  )
}

export function LocationPicker({ label, value, onChange, placeholder }: LocationPickerProps) {
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null)
  const placesService = useRef<google.maps.places.PlacesService | null>(null)

  const initializeServices = useCallback(() => {
    if (!autocompleteService.current && window.google) {
      autocompleteService.current = new google.maps.places.AutocompleteService()
      placesService.current = new google.maps.places.PlacesService(
        document.createElement('div')
      )
    }
  }, [])

  const handleInputChange = useCallback(async (input: string) => {
    if (!input || input.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setIsLoading(true)
    initializeServices()

    try {
      if (autocompleteService.current) {
        const response = await autocompleteService.current.getPlacePredictions({
          input,
          componentRestrictions: { country: 'in' }, // Restrict to India
          types: ['address', 'establishment']
        })
        
        setSuggestions(response.predictions || [])
        setShowSuggestions(true)
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    } finally {
      setIsLoading(false)
    }
  }, [initializeServices])

  const handleSelectPlace = useCallback(async (placeId: string, description: string) => {
    if (!placesService.current) return

    try {
      const response = await new Promise<google.maps.places.PlaceResult>((resolve, reject) => {
        placesService.current!.getDetails({ placeId }, (result, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && result) {
            resolve(result)
          } else {
            reject(new Error('Place not found'))
          }
        })
      })

      if (response.geometry?.location) {
        const location: Location = {
          address: description,
          lat: response.geometry.location.lat(),
          lng: response.geometry.location.lng()
        }
        onChange(location)
        setShowSuggestions(false)
      }
    } catch (error) {
      console.error('Error fetching place details:', error)
    }
  }, [onChange])

  return (
    <div className="relative">
      <Label htmlFor={label} className="flex items-center gap-2">
        <MapPin className="h-4 w-4" />
        {label}
      </Label>
      <div className="relative">
        <Input
          id={label}
          type="text"
          placeholder={placeholder || "Enter location..."}
          value={value}
          onChange={(e) => {
            handleInputChange(e.target.value)
            onChange({ address: e.target.value, lat: 0, lng: 0 })
          }}
          onFocus={() => setShowSuggestions(true)}
          className="pr-10"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto">
          <CardContent className="p-0">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.place_id}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                onClick={() => handleSelectPlace(suggestion.place_id!, suggestion.description)}
              >
                <div className="text-sm font-medium">{suggestion.structured_formatting.main_text}</div>
                <div className="text-xs text-gray-500">{suggestion.structured_formatting.secondary_text}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export function GoogleMap({ pickup, drop }: { pickup?: Location; drop?: Location }) {
  const mapRef = useRef<google.maps.Map | null>(null)
  const directionsService = useRef<google.maps.DirectionsService | null>(null)
  const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null)

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map
    directionsService.current = new google.maps.DirectionsService()
    directionsRenderer.current = new google.maps.DirectionsRenderer()
    directionsRenderer.current.setMap(map)

    // Set default view to India
    map.setCenter({ lat: 20.5937, lng: 78.9629 })
    map.setZoom(5)
  }, [])

  const updateRoute = useCallback(() => {
    if (!pickup || !drop || !directionsService.current || !directionsRenderer.current) return

    directionsService.current.route(
      {
        origin: { lat: pickup.lat, lng: pickup.lng },
        destination: { lat: drop.lat, lng: drop.lng },
        travelMode: google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && directionsRenderer.current) {
          directionsRenderer.current.setDirections(result)
        }
      }
    )
  }, [pickup, drop])

  // Update route when locations change
  React.useEffect(() => {
    updateRoute()
  }, [updateRoute])

  return (
    <Wrapper
      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
      render={render}
      libraries={['places', 'geometry']}
      language="en"
      region="IN"
    >
      <div className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
        <div
          ref={(node) => {
            if (node && !mapRef.current) {
              const map = new google.maps.Map(node, {
                zoom: 5,
                center: { lat: 20.5937, lng: 78.9629 },
                mapTypeControl: true,
                streetViewControl: true,
                fullscreenControl: true
              })
              onMapLoad(map)
            }
          }}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </Wrapper>
  )
}