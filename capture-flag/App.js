import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  Easing,
  AsyncStorage, 
  Text
} from 'react-native';
import { createStackNavigator, createDrawerNavigator, createSwitchNavigator } from 'react-navigation'
import Login from "./components/Login";
import Register from "./components/Register";
// import ForgetPassword from "./app/components/ForgetPassword";
import { FontAwesome } from '@expo/vector-icons';
import MainMap from "./components/MainMap";
import Drawer from './components/Drawer'
import Score from './components/Score'
//import { getCenter } from 'geolib';


const DrawerStack = createDrawerNavigator({
  MainMap: {
        screen: MainMap,
        navigationOptions: {
          title: "MainMap"
        }
      }
}, {
  gesturesEnabled: false,
  contentComponent: Drawer
})
const MainNavigation = createStackNavigator({
  DrawerStack: { screen: DrawerStack }
}, {
  headerMode: 'float',
  navigationOptions: ({navigation}) => ({
    
    gesturesEnabled: false,
    headerLayoutPreset: 'center',
    title: 'Flag Land',
    headerLeft: <FontAwesome onPress={() => navigation.toggleDrawer()} name="user" size={30} color="white" />,
    headerRight: <Score />,
    headerStyle: {backgroundColor: '#00bbff'},
    headerTitleStyle: {color: '#fff', fontSize: 20, fontWeight: 'bold'},
    headerLeftContainerStyle: {paddingHorizontal: 20},
    headerRightContainerStyle: {paddingHorizontal: 20},
    
      
  })
})
const LoginStack = createStackNavigator({
  Login: { screen: Login },
  Register: { screen: Register },
  // ForgetPassword: { screen: ForgetPassword }
}, {
  headerMode: 'none',
  navigationOptions: {

  }
})

class App extends Component {

  componentDidMount() {
    console.log('AppNav mounted')
    this._bootstrapAsync();
    
  }
  _bootstrapAsync = async () => {
    const userToken = await AsyncStorage.getItem('mainUser');
    this.props.navigation.navigate(userToken ? 'mainStack' : 'loginStack');
  };
  render() {
    
    return (
     <View>
       <Text>...Loading things...</Text>
     </View>
    );
  }
}
export default createSwitchNavigator(
  {
    AuthLoading: App,
    loginStack: { screen: LoginStack },
    mainStack: { screen: MainNavigation }
  },
  {
    initialRouteName: 'AuthLoading',
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
