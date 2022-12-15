import React, { useState } from 'react';
import { useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
const axios = require('axios');
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CommunityContent from '../components/CommunityContent';
import CommunityView from '../components/CommunityView';
import SearchBar from '../components/SearchBar';
import SearchResultsContent from '../components/SearchResultsContent';
import { Audio } from 'expo-av';
import { Sound } from 'expo-av/build/Audio';
import { RouteStackParamList } from '../navigation/RouteParameterList';
import BottomApp from '../components/BottomNavigation';
import { AntDesign } from '@expo/vector-icons';
import { Searchbar, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import User from '../classes/User';
const user = new User();
const api = require('../api.json');
const get_user_url = api.get_user;

export default function Community(props: RouteStackParamList<'Community'>) {
  const Posts = [];

  let [people, setPeople] = useState([]);
  const [random, setRandom] = useState(0);
  //  {
  //     id: 4,
  //     currentTime: "3:42",
  //     totalTime: "7:32",
  //     userName: "Jessica Simmons",
  //     userCaption:
  //       "I just learned how to play a new song",
  //     timeSincePosted: "2h",
  //     amountLikes: 132,
  //     amountComments: 3,
  //     name: "person 1",
  //     following: true,
  //   }

  let [toggleScreen, setToggleScreen] = useState(false);
  let [text, setText] = useState('');
  let [sound, setSound] = useState(null);
  let [soundOwner, setSoundOwner] = useState(null);
  let [audioPlaying, setAudioPlaying] = useState(false);
  const [id, setId] = useState('');
  const navigation = useNavigation();
  const handle = (text: string, id: string) => {
    if (text.length >= 1) {
      setToggleScreen(true);
      // query to server
      user.findUsers(text, id).then((res: any) => {
        const { data } = res;

        let users: any = [];
        data.data.map((item: any) => {
          if (item._id == id) {
            return;
          }
          users.push({
            id: item._id,
            currentTime: '3:42',
            totalTime: '7:32',
            userName: item.username,
            userCaption: 'I just learned how to play a new song on the piano!',
            timeSincePosted: '2h',
            amountLikes: 132,
            amountComments: 3,
            name: item.name,
            following: item.followers.includes(id),
            profile: item.profilePhoto,
            isBlocked: item.blockedBy.includes(id) ? true : false,
            bio: item.bio,
          });
        });

        setPeople([...users]);
      });
    } else {
      setToggleScreen(false);
      // this is where it stops the music
    }
    AsyncStorage.setItem('searchTextForCommunityPage', text);
    setText(text);
  };

  // function alternate(users:any){
  //   if(users[users.length - 1]?.artifical){
  //     users = users.filter((e:any)=>!e.artifical)
  //   }
  //   else{

  //   }
  //   return users
  // }

  const stopSound = async (sound: Sound | null) => {
    let filtered = people.filter(
      (element: { name: string; following: boolean }) =>
        element.name.toUpperCase().includes(text.toUpperCase())
    );
    let found = filtered.find((element) => element.name === soundOwner);
    if (text.length === 0 || !found) {
      await sound?.stopAsync().then(() => {
        setSound(null);
        setAudioPlaying(false);
        setSoundOwner(null);
        //
      });
    }
  };

  useEffect(() => {
    if (sound) {
      stopSound(sound);
    }
  }, [text]);

  // useEffect(() => {
  //   console.log(people)
  // }, [people]);

  useFocusEffect(
    React.useCallback(() => {
      AsyncStorage.getItem('email').then((email: any) => {
        var config = {
          method: 'get',
          url: get_user_url + email,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        };
        axios(config).then(
          (json: any) => {
            setToggleScreen(false);
            setId(json.data.data._id);
            setPeople([]);
            setText('');
            // const fetchedText = AsyncStorage.getItem(
            //   'searchTextForCommunityPage'
            // );
            // fetchedText.then((text: any) => {
            //   if (text) {
            //     setPeople([])
            //     handle(text,json.data.data._id);
            //   }
            // });
          },
          (err: any) => {
            console.log(err);
          }
        );
      });
    }, [])
  );

  return (
    <>
      <View style={{ backgroundColor: 'white', height: '100%' }}>
        <View
          style={{
            flexDirection: 'row',
            marginTop: 50,
            alignItems: 'center',
            marginHorizontal: 20,
            marginBottom: 20,
          }}
        >
          <AntDesign name="search1" size={25} color="black" />
          <TextInput
            onChangeText={(v: string) => {
              handle(v, id);
            }}
            value={text}
            placeholder="Search"
            style={{
              marginLeft: 10,
              marginRight: 15,
              height: 35,
              backgroundColor: '#eee',
              width: 250,
              borderRadius: 15,
              borderTopRightRadius: 15,
              borderTopLeftRadius: 15,
              fontSize: 17,
            }}
            placeholderTextColor={'#828282'}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
          />
          <TouchableOpacity
            style={styles.messageButton}
            onPress={() => {
              navigation.navigate('Chats');
            }}
          >
            <Image source={require('../assets/images/Vector.png')}></Image>
          </TouchableOpacity>
        </View>
        {toggleScreen ? (
          <SearchResultsContent
            text={text}
            random={random}
            dummy={people}
            setDummy={setPeople}
            sound={sound}
            setSound={setSound}
            setSoundOwner={setSoundOwner}
            setAudioPlaying={setAudioPlaying}
            audioPlaying={audioPlaying}
            Navigation={props.navigation}
          ></SearchResultsContent>
        ) : (
          <CommunityContent navigation={props.navigation}></CommunityContent>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  messageButton: {
    position: 'absolute',
    width: 24,
    height: 22,
    top: 10,
    right: 10,
  },
});
