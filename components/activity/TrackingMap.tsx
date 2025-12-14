import { TrackPoint } from '@/types';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { MapStyleElement, Polyline, Region } from 'react-native-maps';

interface LatLngLike {
  latitude: number;
  longitude: number;
}

interface TrackingMapProps {
  trackPoints?: TrackPoint[];
  showsUserLocation?: boolean;
  focusPoint?: LatLngLike;
}

const DEFAULT_DELTA = 0.015;

const runningFriendlyMapStyle: MapStyleElement[] = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#05070b' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#7c92ad' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#05070b' }],
  },
  {
    featureType: 'landscape',
    elementType: 'geometry.fill',
    stylers: [{ color: '#080c14' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry.fill',
    stylers: [{ color: '#041026' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0f1724' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [{ color: '#121d30' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#1b2842' }],
  },
  {
    featureType: 'road.local',
    elementType: 'geometry',
    stylers: [{ color: '#111929' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry.fill',
    stylers: [{ color: '#0a1b14' }],
  },
  {
    featureType: 'poi.school',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.medical',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.business',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'transit',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#10182b' }],
  },
];

const toRegion = (point: LatLngLike): Region => ({
  latitude: point.latitude,
  longitude: point.longitude,
  latitudeDelta: DEFAULT_DELTA,
  longitudeDelta: DEFAULT_DELTA,
});

export const TrackingMap = ({
  trackPoints = [],
  showsUserLocation = true,
  focusPoint,
}: TrackingMapProps) => {
  const derivedCenter = useMemo(() => {
    if (focusPoint) return focusPoint;
    if (trackPoints.length === 0) return undefined;
    const lastPoint = trackPoints[trackPoints.length - 1];
    return { latitude: lastPoint.latitude, longitude: lastPoint.longitude };
  }, [focusPoint, trackPoints]);

  const region = useMemo(
    () => (derivedCenter ? toRegion(derivedCenter) : undefined),
    [derivedCenter],
  );

  return (
    <MapView
      style={StyleSheet.absoluteFill}
      userInterfaceStyle="dark"
      mapType="standard"
      customMapStyle={runningFriendlyMapStyle}
      showsUserLocation={showsUserLocation}
      followsUserLocation={true}
      pitchEnabled={false}
      rotateEnabled={false}
      showsBuildings={false}
      showsPointsOfInterest={false}
      toolbarEnabled={false}
      {...(region ? { region } : {})}
    >
      {trackPoints.length > 1 && (
        <Polyline
          coordinates={trackPoints.map((p) => ({
            latitude: p.latitude,
            longitude: p.longitude,
          }))}
          strokeColor="#ADFF2F"
          strokeWidth={4}
        />
      )}
    </MapView>
  );
};
