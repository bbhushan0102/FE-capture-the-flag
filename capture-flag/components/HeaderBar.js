import React from 'react';
import {
    Text,
    View,
    StyleSheet
   
  } from 'react-native';
  import { FontAwesome } from '@expo/vector-icons';

const HeaderBar = ({score}) => {
    return (
        <View style={styles.topBar}>
            <View style={styles.user}>
              <FontAwesome name="user" size={30} color="white" />
            </View>
            <View style={styles.logo}>
              <Text style={{color: 'white', fontWeight: 'bold', fontSize: 20}}>Capture Flag</Text>
            </View>
            <View style={styles.score}>
              <FontAwesome name="trophy" size={30} color="white" />
              <Text style={styles.scoreNumber}>{score}</Text>
            </View>
          </View>
    );
};
const styles = StyleSheet.create({

    topBar: {
      display: 'flex',
      height: 80,
      backgroundColor: '#00bbff',
      justifyContent: 'center',
      alignItems: 'flex-end',
      flexDirection: 'row',
      paddingVertical: 10
    },
    user: {
      color: 'white',
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
      color: 'white',
      display: 'flex',
      flex: 1,
      alignItems: 'flex-end',
      justifyContent: 'center',
      flexGrow: 1,
      flexDirection: 'row'
    },
    scoreNumber: {
      color: 'white',
      fontSize: 20,
      paddingLeft: 5
    }
  });

export default HeaderBar;