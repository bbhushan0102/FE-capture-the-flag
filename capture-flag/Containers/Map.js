import React, { Component } from 'react';
import greenFlag from '../assets/green-flag.png';
import redFlag from '../assets/red-flag.png';
import {
  Platform,
  Text,
  View,
  StyleSheet,
  Dimensions,
  Alert,
  Image,
  TouchableHighlight
} from 'react-native';
import { Constants, Location, Permissions, MapView } from 'expo';
import randomLocation from 'random-location';
import { FontAwesome } from '@expo/vector-icons';

export default class Map extends Component {
  static navigationOptions = {
    drawerLabel: 'Screen One',
    drawerIcon: () => (
      <Image
        source={{uri: `https://dummyimage.com/60x60/000/fff.jpg&text=1`}}
        style={{width: 30, height: 30, borderRadius: 15}}
      />
    )
  }

  state = {
    errorMessage: null,
    loading: true,
    lat: 0,
    long: 0,
    random: true,
    flagCaptured: false,
    modalVisible: false,
    score: 0
  };
  componentWillMount() {
    // Font.loadAsync({
    //   'FontAwesome' : require('react-native-fontawesome')
    // })
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
        console.log(this.state.lat, '<< state');
        console.log(newLocation.coords.latitude, '<< new location');
        this.setState({
          lat: newLocation.coords.latitude,
          long: newLocation.coords.longitude,
          loading: false
        });
      }
    });
  };

  captureFlag = () => {
    if (this.state.random) {
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
      const screen = Dimensions.get('window');
      const ASPECT_RATIO = screen.width / screen.height;
      const latitudeDelta = 0.005;
      const { lat, long } = this.state;
      const initialRegion = {
        latitudeDelta,
        longitudeDelta: latitudeDelta * ASPECT_RATIO,
        latitude: lat,
        longitude: long
      };
      const flag = this.state.random ? greenFlag : redFlag;
      return (
        <View style={{ flex: 1 }}>
          
          <MapView
            ref={map => {
              this.map = map;
            }}
            style={{ flex: 1 }}
            initialRegion={initialRegion}
            title={'capture flag'}
            showsUserLocation={true}
            followUserLocation={true}
          >
            {/* {this.state.location.coords && (
              <MapView.Marker
                coordinate={{
                  latitude: this.state.location.coords.latitude,
                  longitude: this.state.location.coords.longitude
                }}
                title={'Your Location'}
              />
            )} */}
            <MapView.Marker
              image={flag}
              onPress={this.captureFlag}
              coordinate={{
                latitude: randomLocation.randomCirclePoint(
                  { latitude: this.state.lat, longitude: this.state.long },
                  500
                ).latitude,
                longitude: randomLocation.randomCirclePoint(
                  { latitude: this.state.lat, longitude: this.state.long },
                  500
                ).longitude
              }}
              // title={'Capture Flag'}
            />
          </MapView>

          <TouchableHighlight onPress={this.handleRecenter}>
            <View style={styles.buttonContainer}>
              <FontAwesome name="bullseye" size={40} color="#00bbff" />
            </View>
          </TouchableHighlight>
        </View>
      );
    }
  }
  handleRecenter = () => {
    const { lat, long } = this.state;
    const userLocation = { latitude: lat, longitude: long };
    this.map.animateToRegion(userLocation, 500);
  };
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1'
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    textAlign: 'center'
  },

  buttonContainer: {
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
    shadowOpacity: 0.5,
    shadowOffset: { width: 5, height: 5 }
  }
});