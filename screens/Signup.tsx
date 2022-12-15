import React, { useState } from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { RouteStackParamList } from '../navigation/RouteParameterList';
import VoiceCommand from '../components/VoiceCommand_Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
const axios = require('axios');
var qs = require('qs');
const api = require('../api.json');
const register_url = api.register;
import { MaterialIcons } from '@expo/vector-icons';

export default function SignupPage({
  navigation,
  route,
}: RouteStackParamList<'SignUpPage'>) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [screen, setScreen] = useState('auto');
   const [indicator, setIndicator] = useState(false);

  const Reg = () => {
    var data = qs.stringify({
      name: name,
      username: username,
      displayname: name,
      email: email,
      password: password,
    });
    var config = {
      method: 'post',
      url: register_url,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: data,
    };
    axios(config)
      .then((json: any) => {
        setScreen('auto');
        setIndicator(false)
        Alert.alert(json.data.message, '', [
          {
            text: 'Ok',
            onPress: () => {
              if (json.data.message == 'User Created!') {
                AsyncStorage.setItem('email', email);
                AsyncStorage.setItem('accessToken', json.data.accessToken);
                AsyncStorage.setItem('displayname', name);
                AsyncStorage.setItem('hashId', json.data.id);
                AsyncStorage.removeItem('searchTextForCommunityPage');

                AsyncStorage.setItem(
                  'userData',
                  JSON.stringify({
                    name: name,
                    username: username,
                    profilePhoto: '',
                  })
                );
                navigation.replace('BottomApp', {
                  screen: 'HomePage',
                });
              }
            },
          },
        ]);
      })
      .catch((error: any) => console.log('=========error======', error));
  };
  return (
    <View style={styles.container} pointerEvents={screen}>
      {
      //   <LinearGradient
      //   colors={['#FFFFFF', '#FFFFFF']}
      //   style={{
      //     position: 'absolute',
      //     left: 0,
      //     right: 0,
      //     top: 0,
      //     height: 600,
      //   }}
      // />
      }
       <View style={styles.loading}>
          <ActivityIndicator size="large" animating={indicator} />
        </View>
      <Text style={styles.logo}>Welcome to Uptone</Text>
      <View style={styles.inputView}>
        <TextInput
          style={styles.inputText}
          placeholder="Name"
          placeholderTextColor="black"
          onChangeText={(text) => setName(text)}
        />
      </View>
      <View style={styles.underline}></View>
      <View style={styles.inputView}>
        <TextInput
          style={styles.inputText}
          placeholder="Username"
          placeholderTextColor="black"
          onChangeText={(text) => setUsername(text)}
        />
      </View>
      <View style={styles.underline}></View>
      <View style={styles.inputView}>
        <TextInput
          style={styles.inputText}
          placeholder="Email"
          placeholderTextColor="black"
          onChangeText={(text) => setEmail(text)}
        />
      </View>
      <View style={styles.underline}></View>
      <View style={styles.inputView}>
        <TextInput
          secureTextEntry
          style={styles.inputText}
          placeholder="Password"
          placeholderTextColor="black"
          onChangeText={(text) => setPassword(text)}
        />
      </View>
      <View style={styles.underline}></View>
      <TouchableOpacity
        style={styles.loginBtn}
        onPress={() => {
          if (name == '' || username == '' || email == '' || password == '') {
            Alert.alert('Please fill all the fields!');
          } else {
            setScreen('none');
            setIndicator(true)
            Reg();
          }
        }}>
        <Text style={styles.loginText}>Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('LoginPage');
        }}>
        <Text style={styles.signUpText}>
          Already have an account?{'\n'}Log in
        </Text>
        {/* onPress={() => navigation.navigate(Signup)} */}
      </TouchableOpacity>

     { /*<ImageBackground
        source={require('../assets/vectorlogo.png')}
        style={styles.background}></ImageBackground>*/}
    </View>
  );
}

const height = Dimensions.get('screen').height;
const width = Dimensions.get('screen').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontWeight: 'bold',
    fontSize: 33,
    color: '#000000',
    marginBottom: 40,
  },
  inputView: {
    width: '80%',
    backgroundColor: 'transparent',
    borderRadius: 25,
    height: 60,
    marginBottom: 0,
    justifyContent: 'center',
    padding: 5,
  },
  inputText: {
    width: '100%',
    height: 60,
    color: 'black',
    fontWeight: 'bold',
    paddingTop: 45,
  },
  forgot: {
    color: 'black',
    fontSize: 16,
    marginBottom: 40,
  },
  loginBtn: {
    width: '80%',
    backgroundColor: '#7393B3',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    marginBottom: 40,
  },
  loginText: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 18,
  },
  signUpText: {
    color: 'black',
    fontSize: 16,
    textAlign: 'center',
  },
  underline: {
    height: 0,
    width: 300,
    borderTopColor: 'black',
    borderTopWidth: 2,
    marginTop: 0,
    marginBottom: 40,
  },
  background: {
    height: '65%',
    width: '65%',
    position: 'absolute',
    left: '58%',
    right: '25%',
    top: '20%',
    bottom: '50.78%',
  },
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth:1,
  },
  back: {
    position: 'absolute',
    left: 0,
    right: '85%',
    top: 0,
    bottom: '85%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
