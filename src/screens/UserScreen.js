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
import { PermissionsAndroid } from 'react-native';

import ReactNativeForegroundService from '@supersami/rn-foreground-service';
import RNLocation from 'react-native-location';
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

//   

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
  const handleBackgroundPermission = async() =>
  {
    const backgroundgranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
            {
              title: 'Background Location Permission',
              message:
                'We need access to your location ' +
                'so you can get live quality updates.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          if (backgroundgranted === PermissionsAndroid.RESULTS.GRANTED) {
        
                RNLocation.configure({
                    distanceFilter: 100, // Meters
                    desiredAccuracy: {
                    ios: 'best',
                    android: 'balancedPowerAccuracy',
                    },
                    // Android only
                    androidProvider: 'auto',
                    interval: 5000, // Milliseconds
                    fastestInterval: 10000, // Milliseconds
                    maxWaitTime: 5000, // Milliseconds
                    // iOS Only
                    activityType: 'other',
                    allowsBackgroundLocationUpdates: false,
                    headingFilter: 1, // Degrees
                    headingOrientation: 'portrait',
                    pausesLocationUpdatesAutomatically: false,
                    showsBackgroundLocationIndicator: false,
                });
                let locationSubscription = null;
                let locationTimeout = null;
                
                ReactNativeForegroundService.add_task(
                    () => {
                    RNLocation.requestPermission({
                        ios: 'whenInUse',
                        android: {
                        detail: 'fine',
                        },
                    }).then((granted) => {
                        console.log('Location Permissions: ', granted);
                        // if has permissions try to obtain location with RN location
                        if (granted) {
                        locationSubscription && locationSubscription();
                        locationSubscription = RNLocation.subscribeToLocationUpdates(
                            ([locations]) => {
                            locationSubscription();
                            locationTimeout && clearTimeout(locationTimeout);
                            console.log(locations);
                            },
                        );
                        } else {
                        locationSubscription && locationSubscription();
                        locationTimeout && clearTimeout(locationTimeout);
                        console.log('no permissions to obtain location');
                        }
                    });
                    },
                    {
                    delay: 1000,
                    onLoop: true,
                    taskId: 'taskid',
                    onError: (e) => console.log('Error logging:', e),
                    },
                );
            
          }else{
              console.log('permission not granted');
          }
  }

  useEffect(() => {
    handleLocationPermission();
    handleBackgroundPermission();
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
  }, []);
  const onButtonClick = () => {
    handleBackgroundPermission();
      console.log('button pressed');
      
  }

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
      <DepartureInformation onButtonClick={onButtonClick} />
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