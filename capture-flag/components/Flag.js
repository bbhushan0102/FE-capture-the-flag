import React from 'react';
import { Button, View } from 'react-native';
import { MapView } from 'expo';
import greenFlag from '../assets/green-flag.png';
import redFlag from '../assets/red-flag.png';

const Flag = props => {
	const flag = props.nearFlag ? greenFlag : redFlag;
	return (
		<View>
			<MapView.Marker
				image={flag}
				onPress={props.captureFlag}
				coordinate={{
					latitude: props.flagLat,
					longitude: props.flagLong
				}}
				title={'random Flag'}
			/>
		</View>
	);
};

export default Flag;
