import React from 'react';
import {
  GoogleMap,
  useLoadScript,
  StreetViewPanorama,
  Marker,
} from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
};

const center = {
  lat: 8.2258505,
  lng: 124.2353966,
};

const pov = {
  heading: 291.4,
  pitch: 1.92,
};

function Map() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyDATzXdlYTIOcQ8GZ18w5fND4KGxtJhz5M',
  });

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={18}
      options={{
        styles: [], // Default Google Maps colors
      }}
    >
      <StreetViewPanorama
        position={center}
        visible={true}
        pov={pov}
        options={{
          addressControl: true,
          linksControl: true,
          panControl: true,
          enableCloseButton: false,
          fullscreenControl: true,
          motionTracking: false,
          motionTrackingControl: false,
        }}
      />

      <Marker position={center} />
    </GoogleMap>
  );
}

export default Map;