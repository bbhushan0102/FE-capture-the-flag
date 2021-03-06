import React, { Component } from 'react';
import { Platform, Text, View, StyleSheet, Dimensions, TouchableHighlight, Alert, AsyncStorage } from 'react-native';
import { Constants, Location, Permissions, MapView } from 'expo';
import randomLocation from 'random-location';
import { FontAwesome } from '@expo/vector-icons';
import {Drawer} from 'native-base';
import geolib from 'geolib';
import * as api from '../api';
import Flag from './Flag';
import HeaderBar from './HeaderBar'
import SideBar from './SideBar'
import {YellowBox} from 'react-native'
YellowBox.ignoreWarnings(['Require cycle:']);

export default class MainMap extends Component {
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
		score: 0,
		zoneLat: 0,
		zoneLong: 0,
		nearZone: false,
		username: ''
	};
	componentWillMount() {
		console.log('mounting');
		if (Platform.OS === 'android' && !Constants.isDevice) {
			this.setState({
				errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!'
			});
		} else {
			this._getLocationAsync()
				.then(() => AsyncStorage.getItem('mainUser'))
				.then(userObj => {
					const newMainObj = JSON.parse(userObj);
					return api.getUser(newMainObj.username).then(user => this.setState({ ...user }));
				});
		}
	}
	componentDidUpdate(prevProps, prevState) {
		if (prevState.lat !== this.state.lat && prevState.long !== this.state.long) {
			if (!this.state.flagGenerated) {
				this.generateFlag(this.state.username);
			}
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
				this.amINear();
				if (this.state.flagCaptured) {
					this.dropFlag();
				}
			}
		});
	};
	generateFlag = username => {
		const flagCoordinate = {
			latitude: randomLocation.randomCirclePoint({ latitude: this.state.lat, longitude: this.state.long }, 100).latitude,
			longitude: randomLocation.randomCirclePoint({ latitude: this.state.lat, longitude: this.state.long }, 100).longitude
		};
		api.patchFlagLocation(username, flagCoordinate.latitude, flagCoordinate.longitude);
		this.setState({
			flagLat: flagCoordinate.latitude,
			flagLong: flagCoordinate.longitude,
			flagGenerated: true
		});
	};

	generateZone = username => {
		const zoneCoordinate = {
			latitude: randomLocation.randomCirclePoint({ latitude: this.state.flagLat, longitude: this.state.flagLong }, 500).latitude,
			longitude: randomLocation.randomCirclePoint({ latitude: this.state.flagLat, longitude: this.state.flagLong }, 500).longitude
		};
		api.patchZoneLocation(username, zoneCoordinate.latitude, zoneCoordinate.longitude);
		this.setState({
			zoneLat: zoneCoordinate.latitude,
			zoneLong: zoneCoordinate.longitude
		});
	};

	captureFlag = () => {
		if (this.state.nearFlag) {
			Alert.alert(
				'Collect Flag',
				'Collect Flag',
				[
					{
						text: 'Capture the flag',
						onPress: () => {
							// this.incrementScore();
							api.patchFlagCapture(this.state.username, this.state.flagLong, this.state.flagLat);
							this.generateZone(this.state.username);
							this.setState({
								flagCaptured: true,
								flagGenerated: false
							});
						}
					},
					{ text: 'Leave the flag', onPress: () => console.log('Cancel Pressed'), style: 'cancel' }
				],
				{ cancelable: false }
			);
		}
	};
	dropFlag = () => {
		if (this.state.nearZone) {
			this.incrementScore();
			this.setState({
				flagCaptured: false
			});
			this.generateFlag(this.state.username);
		}
	};
	incrementScore = () => {
		const scoreUpdate = 5;
		api.patchScore(this.state.username, scoreUpdate);
		this.setState({
			score: this.state.score + scoreUpdate
		});
	};
	amINear = () => {
		let flag = geolib.isPointInCircle({ latitude: this.state.lat, longitude: this.state.long }, { latitude: this.state.flagLat, longitude: this.state.flagLong }, 20);
		let zone = geolib.isPointInCircle({ latitude: this.state.lat, longitude: this.state.long }, { latitude: this.state.zoneLat, longitude: this.state.zoneLong }, 20);
		this.setState({
			nearFlag: flag,
			nearZone: zone
		});
  };
  logOutUser = () => {
    AsyncStorage.removeItem('mainUser')
    this.props.navigation.navigate('Login')
  }
  handleRecenter = () => {
    this.map.animateToRegion(this.userLocationWithDelta(), 500);
  };
  closeDrawer = () => {
    this.drawer._root.close()
  };
  openDrawer = () => {
    this.drawer._root.open()
  };
  userLocationWithDelta = () => {
    const {lat, long} = this.state
    const screen = Dimensions.get('window');
    const ASPECT_RATIO = screen.width / screen.height;
    const latitudeDelta = 0.005;
    const longitudeDelta = latitudeDelta * ASPECT_RATIO;
    const userLocation = { latitude: lat, longitude: long, latitudeDelta, longitudeDelta };
    return userLocation
}

	render() {
		
		console.log(this.state.flagLat, this.state.flagLong);
		if (this.state.loading)
			return (
				<View style={styles.loading}>
					<Text>Loading...</Text>
				</View>
			);
		else {
			const { lat, long } = this.state;
			return (
				<View style={{ flex: 1 }}>
				<Drawer
                ref={(ref) => { this.drawer = ref; }}
                content={<SideBar logOut={this.logOutUser}/>}
                onClose={() => this.closeDrawer()} >
				<HeaderBar openDrawer={this.openDrawer.bind(this)} score={this.state.score}/>
				
					<MapView
						ref={map => {
							this.map = map;
						}}
						style={{ flex: 1 }}
						initialRegion={this.userLocationWithDelta()}
						title={'capture flag'}
						showsUserLocation={true}
						followUserLocation={true}
					>
						{/* FLAG COMPONENT */}
						{!this.state.flagCaptured && <Flag captureFlag={this.captureFlag} nearFlag={this.state.nearFlag} flagLat={this.state.flagLat} flagLong={this.state.flagLong} />}
						{this.state.flagCaptured && <MapView.Circle center={{ latitude: this.state.zoneLat, longitude: this.state.zoneLong }} radius={20} fillColor="rgba(0, 255, 0, 0.3)" />}
					</MapView>
				<TouchableHighlight onPress={this.handleRecenter} underlayColor={'#ececec'} style={styles.recenterBtn}>
					<FontAwesome  name="bullseye" size={40} color="#00bbff" />
				</TouchableHighlight>
				</Drawer>

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
	},
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
