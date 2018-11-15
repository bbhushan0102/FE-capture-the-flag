import React from 'react';
import {
    View,
    Dimensions,
    TouchableHighlight,
    StyleSheet
  } from 'react-native';
import { MapView} from 'expo';
import greenFlag from '../assets/green-flag.png';
import redFlag from '../assets/red-flag.png';
import randomLocation from 'random-location';
import { FontAwesome } from '@expo/vector-icons';

const Map = (props) => {
      const { lat, long, nearFlag, resetCoords, captureFlag } = props;
      const flag = nearFlag ? greenFlag : redFlag;

      handleRecenter = () => {
        this.map.animateToRegion(resetCoords, 500);
      };
    return (
        <View style={{flex: 1}}>
        <MapView
        ref={map => {
          this.map = map;
        }}
        style={{ flex: 1 }}
        initialRegion={resetCoords}
        title={'capture flag'}
        showsUserLocation={true}
        followUserLocation={true}
      >
        <MapView.Marker
          image={flag}
          onPress={captureFlag}
          coordinate={{
            latitude: randomLocation.randomCirclePoint(
              { latitude: lat, longitude: long },
              500
            ).latitude,
            longitude: randomLocation.randomCirclePoint(
              { latitude: lat, longitude: long },
              500
            ).longitude
          }}
        />
      </MapView>
       <TouchableHighlight onPress={this.handleRecenter} underlayColor={'#ececec'} style={styles.recenterBtn}>
       <FontAwesome  name="bullseye" size={40} color="#00bbff" />
        </TouchableHighlight>
   </View>
    );
};

  const styles = StyleSheet.create({
    recenterBtn: {
      position: 'absolute',
      bottom: 40,
      right: 20,
      backgroundColor: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 150,
      width: 60,
      height: 60,
      shadowColor: '#333',
      shadowOpacity: 0.4,
      shadowOffset: { width: 4, height: 4 },
      elevation: 5
    }
  });

export default Map;