import React, { Component } from 'react';
import greenFlag from './assets/green-flag.png';
import redFlag from './assets/red-flag.png';
import { Platform, Text, View, StyleSheet, Dimensions, Button, Alert, Image } from 'react-native';
import { Constants, Location, Permissions, MapView } from 'expo';
import randomLocation from 'random-location';
import geolib from 'geolib';
import * as api from './api';
import AppNavigation from './Navigation/AppNavigation'

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
				errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!'
			});
		} else {
			this._getLocationAsync();

			api.getUser('BigT93').then(user =>
				this.setState(
					{
						score: user.score,
						flagCaptured: user.flagCaptured,
						flagGenerated: user.flagGenerated,
						flagLat: user.latitude,
						flatLong: user.longitude,
						username: user.username
					},
					this.generateFlag()
				)
			);
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
				this.amINear();
			}
		});
	};
	generateFlag = () => {
		const flagCoordinate = {
			latitude: randomLocation.randomCirclePoint({ latitude: this.state.lat, longitude: this.state.long }, 500).latitude,
			longitude: randomLocation.randomCirclePoint({ latitude: this.state.lat, longitude: this.state.long }, 500).longitude
		};
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
		const scoreUpdate = this.state.score + 5;
		api.patchScore(this.state.username, scoreUpdate);
		this.setState({
			score: scoreUpdate
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
			const flag = this.state.nearFlag ? greenFlag : redFlag;
			return (
        <View style={{ flex: 1 }}>
        <AppNavigation score={this.state.score}/>
					{/* <View style={styles.topBar}>
						<View style={styles.user}>
							<Text>User</Text>
						</View>
						<View style={styles.logo}>
							<Image source={require('./assets/icon.png')} style={{ height: 25, width: 25 }} />
						</View>
						<View style={styles.score}>
							<Text>Score: {this.state.score}</Text>
						</View>
					</View> */}
					{/* <MapView
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
						{/* <MapView.Marker
							image={flag}
							onPress={this.captureFlag}
							coordinate={{
								latitude: 53.4858,
								longitude: -2.2421
							}}
							title={'Football Museum'}
						/> */}
					{/* </MapView> */}
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
	paragraph: {
		margin: 24,
		fontSize: 18,
		textAlign: 'center'
	},
	button: {
		backgroundColor: 'blue',
		color: 'white',
		padding: 20,
		borderRadius: 100
	},
	buttonContainer: {
		position: 'absolute',
		bottom: 40,
		right: 20
	},
	topBar: {
		display: 'flex',
		height: 70,
		backgroundColor: 'green',
		justifyContent: 'center',
		alignItems: 'flex-end',
		flexDirection: 'row',
		paddingVertical: 10
	},
	user: {
		color: 'black',
		flex: 1,
		alignItems: 'center',
		flexGrow: 1
	},
	logo: {
		flex: 1,
		alignItems: 'center',
		flexGrow: 2
	},
	score: {
		color: 'black',
		flex: 1,
		alignItems: 'center',
		flexGrow: 1
	}
});
