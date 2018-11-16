import React, { Component } from 'react';
import { Platform, Text, View, StyleSheet, Dimensions, TouchableHighlight, Alert, AsyncStorage} from 'react-native';
import { Constants, Location, Permissions, MapView } from 'expo';
import randomLocation from 'random-location';
import { FontAwesome } from '@expo/vector-icons';
import geolib from 'geolib';
import * as api from '../api';
import Flag from './Flag';


export default class MainMap extends Component {
	state = {
		errorMessage: null,
		flagCaptured: false,
		flagGenerated: false,
		 flagLat: 0,
		 flagLong: 0,
         lat: 0,
		 long: 0,
         loading: true,
         name: '',
         nearFlag: false,
         score: 0,
         username: ''

	};
	componentWillMount() {
		if (Platform.OS === 'android' && !Constants.isDevice) {
			this.setState({
				errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!'
			});
		} else {
			this._getLocationAsync();

			AsyncStorage.getItem('mainUser')
			.then(userObj => {
				const newMainObj = JSON.parse(userObj)
				this.setState ({...newMainObj}, this.generateFlag(user.username))
			})
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
			}
		});
	};

	generateFlag = username => {
		const flagCoordinate = {
			latitude: randomLocation.randomCirclePoint({ latitude: this.state.lat, longitude: this.state.long }, 500).latitude,
			longitude: randomLocation.randomCirclePoint({ latitude: this.state.lat, longitude: this.state.long }, 500).longitude
		};
		api.patchFlagLocation(username, flagCoordinate.latitude, flagCoordinate.longitude);
		this.setState({
			flagLat: flagCoordinate.latitude,
			flagLong: flagCoordinate.longitude,
			flagGenerated: true
		});
	};

	captureFlag = () => {
		if (this.state.nearFlag) {
			Alert.alert(
				'Alert Title',
				'My Alert Msg',
				[
					{
						text: 'Capture the flag',
						onPress: () => {
							this.incrementScore();
							api.patchFlagCapture(this.state.username, this.state.flagLong, this.state.flagLat);
							this.setState({
								flagCaptured: true
							});
						}
					},
					{ text: 'Leave the flag', onPress: () => console.log('Cancel Pressed'), style: 'cancel' }
				],
				{ cancelable: false }
			);
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
		const near = geolib.isPointInCircle(
			{ latitude: this.state.lat, longitude: this.state.long },
			{ latitude: 53.4858, longitude: -2.2421 }, //need to fetch from BE
			150
		);
		this.setState({
			nearFlag: near
		});
	};
    handleRecenter = () => {
        this.map.animateToRegion(this.userLocationWithDelta(), 500);
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
		if (this.state.loading)
			return (
				<View style={styles.loading}>
					<Text>Loading...</Text>
				</View>
			);
		else {
            const {nearFlag, flagLat, flagLong} = this.state
			return (
				<View style={{ flex: 1 }}>
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
						{/* {this.state.flagLat && this.state.flagLong && (
							<MapView.Marker
								image={flag}
								onPress={this.captureFlag}
								coordinate={{
									latitude: this.state.flagLat,
									longitude: this.state.flagLong
								}}
								title={'Capture Flag'}
							/>
						)} */}
						{/* FLAG COMPONENT */}
						<Flag captureFlag={this.captureFlag} nearFlag={nearFlag} flagLat={flagLat} flagLong={flagLong} />
					</MapView>
                    <TouchableHighlight onPress={this.handleRecenter} underlayColor={'#ececec'} style={styles.recenterBtn}>
                         <FontAwesome  name="bullseye" size={40} color="#00bbff" />
                    </TouchableHighlight>
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
