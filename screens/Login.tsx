import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { RouteStackParamList } from '../navigation/RouteParameterList';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import User from '../classes/User';
const userObj = new User();
const axios = require('axios');
var qs = require('qs');
const api = require('../api.json');
const login_url = api.login;
const get_all_comments_url = api.get_all_comments;
const get_user_posts_url = api.get_user_posts;
const get_userfeed_url = api.get_userfeed;
const get_user_by_id_url = api.get_user_by_id;
const get_user_url = api.get_user;

function LoginPage({ navigation, route }: RouteStackParamList<'LoginPage'>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [comments, setComments] = useState<any>([]);
  const [displayName, setDisplayName] = useState('');
  const [screen, setScreen] = useState('auto');
  const [indicator, setIndicator] = useState(false);

  React.useEffect(() => {
    (async () => {
      const id = await AsyncStorage.getItem('hashId');
      if (id) {
        navigation.replace('BottomApp', {
          screen: 'HomePage',
        });
      }
    })();
  }, []);

  const getPosts = (posts: any, loginUserId: any) => {
    let arr: any = [];
    posts?.map((item: any) => {
      arr.push({
        id: item._id,
        audioClip: item.audioClip,
        userId: item.userId._id,
        currentTime: '3:42',
        totalTime: item.duration,
        userName: item.userId.name,
        userCaption: item.description,
        timeSincePosted: userObj.calculatePostTime(item.createdAt),
        amountLikes: item.likes.length,
        amountComments: item.comments.length,
        likeStatus: item.likes.includes(loginUserId),
        playing: false,
      });
    });
    return arr;
  };

  const login = () => {
    let token: any;
    var data = qs.stringify({
      email: email,
      password: password,
    });
    var config = {
      method: 'post',
      url: login_url,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: data,
    }; 
    axios(config)
      .then((json: any) => {
        setScreen('auto');
        setIndicator(false);
        if (json.data.message == 'Done') {
          token = json.data.accessToken;
          AsyncStorage.setItem('email', email);
          AsyncStorage.setItem('accessToken', json.data.accessToken);
          AsyncStorage.setItem('displayname', json.data.displayname);
          AsyncStorage.setItem('hashId', json.data.id);
          AsyncStorage.removeItem('searchTextForCommunityPage');
          AsyncStorage.setItem(
            'userData',
            JSON.stringify({
              name: json.data.name,
              profilePhoto: json.data.profilePicture,
            })
          );

          navigation.replace('BottomApp', {
            screen: 'HomePage',
          });
        } else {
          alert(json.data.message);
        }
      })
      .catch((error: any) => {
        setIndicator(false)
        setScreen('auto')
        console.log('=========error======', error);
        console.log('=========error======', error.response.data);
      });
  };

  useFocusEffect(
    React.useCallback(() => {
      AsyncStorage.getItem('displayname').then((name: any) => {
        if (name) {
          setDisplayName(name);
        }
      });
    }, [])
  );

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}>
      <View style={styles.container} pointerEvents={screen}>
        <LinearGradient
          colors={['#FFFFFF', '#FFFFFF']}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: 600,
          }}
        />

        <View style={styles.loading}>
          <ActivityIndicator size="large" animating={indicator} />
        </View>

        {
          // {displayName != '' && (
          //   <Text style={styles.logo}>
          //     Welcome back, {'\n'}
          //     {displayName}
          //   </Text>
          // )}
        }
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
            setScreen('none');
            setIndicator(true);
            login();
          }}>
          <Text style={styles.loginText}>Log In</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('SendOtp')}>
          <Text style={styles.forgot}>Forgot your password?</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('SignUpPage')}>
          <Text style={styles.signUpText}>
            Do not have account?{'\n'}Sign Up
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

export default LoginPage;

// function GoToButton({ screenName } : {screenName: any}) {
//   const navigation = useNavigation();

//   return (
//     <TouchableOpacity>
//       title={`Go to ${screenName}`}
//       onPress={() => navigation.navigate(screenName)}
//       </TouchableOpacity>
//   );
// }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontWeight: 'bold',
    fontSize: 40,
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
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
