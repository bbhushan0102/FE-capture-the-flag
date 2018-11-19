import React, { Component } from 'react';
import { Text, View, Button, AsyncStorage } from 'react-native';


class Drawer extends Component {

  logOutUser = () => {
		AsyncStorage.removeItem("mainUser")
		this.props.navigation.navigate("Login") 
  }
  
  render() {
    return (
      <View>
        <Button onPress={() => this.logOutUser()} title="Log Out"></Button>
      </View>
    );
  }
}

export default Drawer;
