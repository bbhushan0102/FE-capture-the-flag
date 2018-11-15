import React, { Component } from 'react';
import {
  Platform,
  Text,
  View,
  StyleSheet,
  Dimensions,
  Alert
} from 'react-native';
import { Constants, Location, Permissions, MapView, Font } from 'expo';
import HeaderBar from './components/HeaderBar'
import Map from './components/Map'

export default class App extends Component {
  state = {
    errorMessage: null,
		loading: true,
		lat: 0,
		long: 0,
		nearFlag: false,
		flagCaptured: false,
		flagGenerated: false,
		flagLat: 0,
		flagLong: 0,
		score: 0
  };
  componentWillMount() {
    if (Platform.OS === 'android' && !Constants.isDevice) {
      this.setState({
        errorMessage:
          'Oops, this will not work on Sketch in an Android emulator. Try it on your device!'
      });
    } else {
      this._getLocationAsync();
    }
  }

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied'
      });
    }
    Location.watchPositionAsync({ distanceInterval: 5 }, newLocation => {
      if (this.state.lat !== newLocation.coords.latitude) {
        this.setState({
          lat: newLocation.coords.latitude,
          long: newLocation.coords.longitude,
          loading: false
        });
      }
    });
  };

  captureFlag = () => {
    if (this.state.nearFlag) {
      Alert.alert(
        'Alert Title',
        'My Alert Msg',
        [
          { text: 'Capture the flag', onPress: () => this.incrementScore() },
          {
            text: 'Leave the flag',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel'
          }
        ],
        { cancelable: false }
      );
    }
  };

  incrementScore = () => {
    this.setState({
      score: this.state.score + 5
    });
  };

  render() {
    if (this.state.loading)
      return (
        <View style={styles.loading}>
          <Text>Loading...</Text>
        </View>
      );
    else {
      const {lat, long, nearFlag} = this.state
      const screen = Dimensions.get('window');
      const ASPECT_RATIO = screen.width / screen.height;
      const latitudeDelta = 0.005;
      const longitudeDelta = latitudeDelta * ASPECT_RATIO;
      const userLocation = { latitude: lat, longitude: long, latitudeDelta, longitudeDelta };

      return (
        <View style={{ flex: 1 }}>
          <HeaderBar score={this.state.score} />
          <Map lat={lat} long={long} isNearFlag={nearFlag} captureFlag={this.captureFlag} resetCoords={userLocation}/>
        </View>
      );
    }
  }

}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1'
  }
});
