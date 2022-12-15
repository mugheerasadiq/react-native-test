import React, { useState, useEffect } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Platform,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { HeaderStyleInterpolators } from '@react-navigation/stack';
//import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import {
  NavigationContainer,
  createNavigatorFactory,
  useNavigation,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import VideoPost from '../components/videoPost';
import DefaultPost from '../components/DefaultPost';
import BottomApp from '../components/BottomNavigation';
import HomeTitle from '../components/HomeTitle';
import { RouteStackParamList } from '../navigation/RouteParameterList';
import { BackgroundImage } from 'react-native-elements/dist/config';
import SmallImage from '../assets/background.png';
import MicButton from '../components/MicButton';
import { Audio } from 'expo-av';

import User from '../classes/User';
const user = new User();
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const axios = require('axios');
var qs = require('qs');
const api = require('../api.json');
const audio_url = api.audio;
const like_post_url = api.like_post;
const unlike_post_url = api.unlike_post;
const get_all_comments_url = api.get_all_comments;
const photo_url = api.photo;
const get_userfeed_url = api.get_userfeed;

export default function HomePageAudio(props: RouteStackParamList<'HomePage'>) {
  // const visual = async()=>{
  //       let hello ={HomePageVisuals, undefined}
  // };
  const posts = props.route.params?.data || [];
  const [comments, setComments] = useState(props.route.params?.comments || []);
  const navigation = useNavigation();
  const arrayOfComponents: any = [];
  const [Posts, setPosts] = useState(posts);

  const [indexState, setIndexState] = useState(Posts.length);
  const [indexClicked, setIndexClicked] = useState(0);
  const [playingAudio, setPlayingAudio] = useState(false);

  const [sound, setSound] = useState<Audio.Sound | undefined>(undefined);
  const [Pause, setPause] = useState<Audio.Sound | Boolean>(false);
  const [blockList, setBlockList] = useState(null);

  const [isPressed, setIsPressed] = useState({
    val: true,
  });
  // [indexState,setIndexState]===
  const indexOfClicked = (i) => {
    setIndexClicked(i);
  };

  useFocusEffect(
    React.useCallback(() => {
      setPosts([]);
      AsyncStorage.getItem('accessToken').then((token) => {
        let postsInside: any;
        let commentsInside: any;

        // get user posts
        var config = {
          method: 'get',
          url: get_userfeed_url,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            authorization: token,
          },
        };

        axios(config).then((json: any) => {
          postsInside = json.data;
          AsyncStorage.getItem('hashId').then((hashId: any) => {
            (async () => {
              const userData = await user.getUser(hashId, token);
              setBlockList(
                userData.data.data.blockedBy.concat(userData.data.data.blocked)
              );

              setPosts([
                ...getPosts(
                  postsInside,
                  hashId,
                  userData.data.data.blockedBy.concat(
                    userData.data.data.blocked
                  ),
                  userData.data.data.friends
                ),
              ]);
            })();
          });
        });
      });
    }, [])
  );

  function getPosts(
    postsInsideFunc: any,
    loginUserId: any,
    blockedBy: any,
    friends: any
  ) {
    let arr: any = [];
    postsInsideFunc?.map((item: any) => {
      if (!blockedBy?.includes(item.userId._id)) {
        const obj = {
          id: item._id,
          audioClip: item.audioClip,
          userId: item.userId._id,
          currentTime: '0:00',
          totalTime: item.duration,
          userName: item.userId.name,
          userCaption: item.description,
          timeSincePosted: user.calculatePostTime(item.createdAt),
          amountLikes: item.likes.length,
          amountComments: item.comments.length,
          likeStatus: item.likes.includes(loginUserId),
          playing: false,
          comments: item.comments,
          allowComments: item.allowComments,
          follower: item.userId.followers.includes(loginUserId),
          thumbnail: item.thumbnail,
        };

        if (item.status == 'public') {
          arr.push(obj);
        }
        // not sure, but I think this work is also done at backend
        else if (
          item.status == 'friends' &&
          friends.includes(item.userId._id)
        ) {
          arr.push(obj);
        }
      }
    });
    return arr;
  }

  function millisToMinutesAndSeconds(millis: any) {
    var minutes: any = Math.floor(millis / 60000);
    var seconds: any = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  }

  async function playSound(
    playingAudio: boolean,
    audioClip: string,
    setPause: any,
    setCurrentTime: any,
    setDuration: any,
    setSlider: any
  ) {
    console.log('Loading Sound');
    try {
      if (playingAudio) {
        const { sound } = await Audio.Sound.createAsync(
          {
            // Get audioBio from user
            uri: audio_url + audioClip,
          },
          {
            shouldPlay: true, //To play the audio when the component is loadded
            isLooping: false,
          }
        );
        setSound(sound);
        console.log('Playing Sound');
        setPause(false);
        await sound.playAsync().then(() => {
          setPlayingAudio(false);
        });

        sound.setOnPlaybackStatusUpdate(async (status) => {
          if (status.isLoaded) {
            if (status.didJustFinish === true) {
              setPause(true);
              setPlayingAudio(true);
            }
            setCurrentTime(millisToMinutesAndSeconds(status.positionMillis));
            setDuration(millisToMinutesAndSeconds(status.durationMillis));
            let sliderValuePart = status.durationMillis
              ? 180 / status.durationMillis
              : 0;
            setSlider(
              parseFloat(
                String(status.positionMillis * sliderValuePart)
              ).toFixed(0)
            );
          }
        });
      } else {
        sound?.pauseAsync().then(() => {
          setPlayingAudio(true);
          setPause(true);
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  const hashtagit = (caption: string) => {
    const message = [];
    const words = caption.split(' ');
    for (let i = 0; i < words.length; i++) {
      if (words[i].startsWith('#')) {
        message.push(
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('HashtagPage', {
                hashtagTitle: words[i],
                posts: Posts,
              })
            }
          >
            <Text style={styles.hashtag}>{words[i]}</Text>
          </TouchableOpacity>
        );
      } else if (words[i].startsWith('@')) {
        message.push(
          <TouchableOpacity
            onPress={() => {
              user.toProfile(props.navigation, words[i]);
            }}
          >
            <Text style={styles.hashtag}>{words[i]}</Text>
          </TouchableOpacity>
        );
      } else {
        message.push(' ' + words[i]);
      }
    }
    return message;
  };
  {
    Posts.map((e, index) => {
      console.log('IMAGE_POST : ' + JSON.stringify(e));
      let arr = [];
      let comp;
      e.comments.map((item: any) => {
        arr.push({
          picture: item.userId?.profilePhoto
            ? photo_url + item.userId?.profilePhoto
            : '',
          name: item.userId.name,
          lastMsg: item.duration,
          uri: audio_url + item.audio,
          userId: item.userId._id,
        });
      });

      arrayOfComponents.push(
        <VideoPost
          key={index}
          id={e.id}
          userId={e.userId}
          likeStatus={e.likeStatus}
          comments={arr}
          onPress={() => {
            indexOfClicked(index);
            setIndexState(indexState + index);
          }}
          style={
            indexClicked === index
              ? [styles.box, { zIndex: indexState }]
              : [styles.box, { zIndex: Posts.length - index }]
          }
          blurContainer={indexClicked === index ? { flex: 1 } : { flex: 1 }}
          backgroundPhoto={e.thumbnail}
          currentTime={e.currentTime}
          totalTime={e.totalTime}
          usersName={e.userName}
          userCaption={hashtagit(e.userCaption)}
          timeSincePosted={e.timeSincePosted}
          amountLikes={e.amountLikes}
          amountComments={e.amountComments}
          playing={e.playing}
          playSound={playSound}
          audioClip={e.audioClip}
          follower={e.follower}
          blockList={blockList}
          allowComments={e.allowComments}
          navigation={props.navigation}
        ></VideoPost>
      );
    });
  }
  return (
    <View style={styles.background}>
      <HomeTitle
        {...(props as unknown as RouteStackParamList<'HomePage'>)}
        title="Following"
      />

      <SafeAreaView style={styles.container}>
        <ScrollView style={{ padding: 10 }}>{arrayOfComponents}</ScrollView>
        <MicButton />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    marginTop: 20,
    width: '100%',
    height: 400,
    overflow: 'hidden',
    backgroundColor: '#EDEDED',
    borderColor: '#000000',
    borderWidth: 0.4,
    shadowOpacity: 0.4,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    borderRadius: 37,
    alignSelf: 'center',
  },
  background: {
    flex: 1,
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
  },
  scrollView: {
    backgroundColor: 'white',
    marginHorizontal: 0,
  },
  messageButton: {
    position: 'absolute',

    width: 24,
    height: 22,
    left: 330,
    top: 46,
  },
  guideButton: {
    position: 'absolute',
    width: 50,
    height: 50,
    left: 310,
    top: 663,
    shadowColor: '#000000',
    shadowOpacity: 0.4,
    shadowOffset: {
      width: 0,
      height: 1,
    },
  },
  bottomspace: {
    position: 'absolute',
    width: '100%',
    height: 79,
    left: 0,
    bottom: 0,
    borderRadius: 100,
  },
  hashtag: {
    color: '#D2AE9A',
    fontWeight: '500',
    // fontSize: 12,
    //lineHeight: 15,
  },
});
