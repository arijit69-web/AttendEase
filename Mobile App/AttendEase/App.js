import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Device from 'expo-device';
import * as Location from 'expo-location';

export default function App() {
  const [deviceInfo, setDeviceInfo] = useState(null); 
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchDeviceInfo = () => {
      const info = {
        brand: Device.brand,
        model: Device.modelName,
        osName: Device.osName,
        osVersion: Device.osVersion,
        manufacturer: Device.manufacturer,
      };
      setDeviceInfo(info); 
    };

    fetchDeviceInfo();
  }, []);

  useEffect(() => {
    const fetchLocation = async () => {
      if (!deviceInfo) return; 

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      const data = {
        ...deviceInfo, 
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      try {
        console.log(JSON.stringify(data));
        const response = await fetch('http://192.168.1.5:3001/senddata', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();
        console.log('Response:', result);
      } catch (error) {
        console.error('Error sending data:', error);
      }
    };

    fetchLocation();
  }, [deviceInfo]); 

  let locationText = 'Fetching location...';
  if (errorMsg) {
    locationText = errorMsg;
  } else if (location) {
    locationText = `Latitude: ${location.coords.latitude}, Longitude: ${location.coords.longitude}`;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>About Phone</Text>
      {deviceInfo ? (
        <>
          <Text>Brand: {deviceInfo.brand}</Text>
          <Text>Model: {deviceInfo.model}</Text>
          <Text>OS Name: {deviceInfo.osName}</Text>
          <Text>OS Version: {deviceInfo.osVersion}</Text>
          <Text>Manufacturer: {deviceInfo.manufacturer}</Text>
        </>
      ) : (
        <Text>Fetching device info...</Text>
      )}
      <Text style={styles.heading}>Current Location</Text>
      <Text>{locationText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
