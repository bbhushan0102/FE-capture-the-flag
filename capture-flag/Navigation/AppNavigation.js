import React from 'react'
import { Text, View, Animated, Easing, Button, StyleSheet} from 'react-native'
import { createStackNavigator, createDrawerNavigator, navigationOptions, NavigationActions } from 'react-navigation'
// import LoginScreen from '../Containers/LoginScreen'
// import SignupScreen from '../Containers/SignupScreen'
import Map from '../Containers/Map'
import CustomHeader from '../Components/CustomHeader'

import DrawerContainer from '../Containers/DrawerContainer';
import { FontAwesome } from '@expo/vector-icons';


const noTransitionConfig = () => ({
  transitionSpec: {
    duration: 0,
    timing: Animated.timing,
    easing: Easing.step0
  }
})

const DrawerStack = createDrawerNavigator({
  Map: { screen: Map }
}, {
  gesturesEnabled: false,
  contentComponent: DrawerContainer
})

const profileButton = (navigation) => {
    return (
            <View >
              <FontAwesome onPress={() => {navigation.toggleDrawer()}} name="user" size={30} color="white" />
            </View>
    )
}
const score = () => {
    return (
        <View style={styles.score}>
          <FontAwesome name="trophy" size={30} color="white" />
          <Text style={styles.scoreNumber}>20</Text>
        </View>
    )
}

// const DrawerNavigation = createStackNavigator({
//   DrawerStack: { screen: DrawerStack }
// }, {
//   headerMode: 'float',
//   navigationOptions: ({navigation}) => ({
//     headerStyle: { backgroundColor: '#00bbff'},
//     title: 'Capture Flag',
//     headerTintColor: 'white',
//     gesturesEnabled: false,
//     headerLeft: drawerButton(navigation),
//     headerRight: score()
//   })
// })

const DrawerNavigation = createStackNavigator({
    DrawerStack: { screen: DrawerStack }
  }, {
    headerMode: 'float',
  navigationOptions: ({navigation}) => ({
        header: props => <CustomHeader {...props} />,
        headerStyle: { backgroundColor: 'transparent'},
  })
  })

// login stack
// const LoginStack = createStackNavigator({
//   loginScreen: { screen: LoginScreen },
//   signupScreen: { screen: SignupScreen }
// }, {
//   headerMode: 'float',
//   navigationOptions: {
//     headerStyle: {backgroundColor: '#E73536'},
//     title: 'You are not logged in',
//     headerTintColor: 'white'
//   }
// })

// Manifest of possible screens
const PrimaryNav = createStackNavigator({
//   loginStack: { screen: LoginStack },
  drawerStack: { screen: DrawerNavigation }
}, {
  // Default config for all screens
  headerMode: 'none',
  title: 'Main',
  initialRouteName: 'drawerStack',
  transitionConfig: noTransitionConfig
})

const styles = StyleSheet.create({
    score: {
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        textAlign: 'center',
        flexDirection: 'row'
      },
      scoreNumber: {
        color: 'white',
        fontSize: 20,
        paddingLeft: 5
      }
})

export default PrimaryNav
