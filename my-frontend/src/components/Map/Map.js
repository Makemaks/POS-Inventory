import React from 'react';
import { GoogleMap, useLoadScript, StreetViewPanorama, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
};

const center = {
  lat: 8.1620993,
  lng: 125.1280127,
};

const pov = {
  heading: 117.85,
  pitch: 0,
};

const markerPosition = {
  lat: 8.161961395581127,
  lng: 125.12804448671325,
};

function Map() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyDATzXdlYTIOcQ8GZ18w5fND4KGxtJhz5M', // Replace with your actual API key
  });

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={18}
    >
      <StreetViewPanorama
        position={center}
        visible
        pov={pov}
      />
      <Marker position={markerPosition} />
    </GoogleMap>
  );
}

export default Map;
