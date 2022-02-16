import React, { useEffect, useState } from "react"
import { SafeAreaView, StatusBar, StyleSheet,Platform } from "react-native"
import MapView, { PROVIDER_GOOGLE } from "react-native-maps"
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions"
import Geolocation from "react-native-geolocation-service"
import {customStyleMap} from '../styles'; 
import styled from 'styled-components/native';
import DepartureInformation from '../components/DepartureInformation';
import Geocoder from 'react-native-geocoding';
import {usePlace} from '../context/PlacesManager';
import {GOOGLE_MAPS_API_KEY} from '../utils/constants';
Geocoder.init(GOOGLE_MAPS_API_KEY, {language: 'en'});


const Container = styled.SafeAreaView`
  flex: 1;
  background-color: #fff
`;
const mapContainer = {
    flex: 7,
  };

const UserScreen = () => {
  const [location, setLocation] = useState(null)

  const handleLocationPermission = async () => {
    let permissionCheck = ""
    if (Platform.OS === "ios") {
      permissionCheck = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)

      if (permissionCheck === RESULTS.DENIED) {
        const permissionRequest = await request(
          PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        )
        permissionRequest === RESULTS.GRANTED
          ? console.warn("Location permission granted.")
          : console.warn("Location perrmission denied.")
      }
    }

    if (Platform.OS === "android") {
      permissionCheck = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)

      if (permissionCheck === RESULTS.DENIED) {
        const permissionRequest = await request(
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
        )
        permissionRequest === RESULTS.GRANTED
          ? console.warn("Location permission granted.")
          : console.warn("Location perrmission denied.")
      }
    }
  }

  useEffect(() => {
    handleLocationPermission()
  }, [])

  useEffect(() => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords
        setLocation({ latitude, longitude })
        
      },
      error => {
        console.log(error.code, error.message)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    )
  }, [])

  return (
    <Container>
      <StatusBar barStyle="dark-content" />
      {location && (
        <MapView
                style={mapContainer}
                provider={PROVIDER_GOOGLE}
                initialRegion={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
                showsUserLocation={true}
                customMapStyle={customStyleMap} // 👈
                paddingAdjustmentBehavior="automatic" // 👈
                showsMyLocationButton={true} // 👈
                showsBuildings={true} // 👈
                maxZoomLevel={17.5} // 👈
                loadingEnabled={true} // 👈
                loadingIndicatorColor="#fcb103" // 👈
                loadingBackgroundColor="#242f3e" // 👈
            />
            
      )}
      <DepartureInformation />
    </Container>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
})

export default UserScreen