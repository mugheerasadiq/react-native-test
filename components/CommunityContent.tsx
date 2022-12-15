import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Dimensions,
} from 'react-native';
import CommunityView from './CommunityView';
import User from '../classes/User';
const user = new User();
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Audio } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import MicButton from './MicButton';
const api = require('../api.json');
const audio_url = api.audio;
const photo_url = api.photo;
const server_url = api.server;
import io from 'socket.io-client/dist/socket.io';

const CommunityContent = (props: any) => {
  // declare/fetch how many posts there are (CommunityView's) along with their image sources
  // CommunityViews have to be looped

  const [posts, setPosts] = useState([]);
  const [loginUserId, setLoginUserId] = useState();
  const [blockList, setBlockList] = useState([]);
  let socket = io(server_url);
  //  socket.on('post-deleted', (postId:any) => {
  //       setPosts(posts.filter((e:any)=>e.id != postId))
  //  });

  useFocusEffect(
    React.useCallback(() => {
      setPosts([]);
      AsyncStorage.getItem('hashId').then((loginUserId) => {
        setLoginUserId(loginUserId);
        AsyncStorage.getItem('accessToken').then((token: any) => {
          (async () => {
            const userData = await user.getUser(loginUserId, token);
            const blockList = userData.data.data.blockedBy.concat(
              userData.data.data.blocked
            ); // includes ids of those who blocked me & whom I blocked
            setBlockList(blockList);
            user
              .getAllPosts(token)
              .then((res: any) => {
                let arr: any = [];
                res.data.data.map((item: any) => {
                  if (!blockList.includes(item.userId._id)) {
                    if (item.status == 'public') {
                      arr.push({
                        id: item._id,
                        postAuthor: item.userId.name,
                        userId: item.userId._id,
                        profilePhoto: item.userId.profilePhoto,
                        userCaption: item.description,
                        timePassed: user.calculatePostTime(item.createdAt),
                        likes: item.likes.length,
                        numOfComments: item.comments.length,
                        likedFromUser: item.likes.includes(loginUserId),
                        currentTime: '0:00',
                        totalTime: item.duration,
                        comments: item.comments,
                        thumbnail: item.thumbnail,
                        follower: item.userId.followers.includes(loginUserId),
                        audioClip: item.audioClip,
                        allowComments: item.allowComments,
                      });
                    }
                  }
                });
                setPosts(arr);
              })
              .catch((err) => {
                console.log(err);
              });
          })();
        });
      });
    }, [])
  );

  const [playingAudio, setPlayingAudio] = useState(false);

  const [sound, setSound] = useState<Audio.Sound | undefined>(undefined);
  const navigation = useNavigation();
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
                posts: posts,
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
  const handleLike = (id: number) => {
    let index = posts.findIndex((element) => element.id === id);
    let temp = posts;

    if (temp[index].likedFromUser) {
      temp[index].likes -= 1;
    } else {
      temp[index].likes += 1;
    }
    temp[index].likedFromUser = !temp[index].likedFromUser;
    setPosts(temp);
  };

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

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        // snapToInterval={Dimensions.get("window").width - 10}
        // snapToAlignment={"end"}
        style={styles.scrollview}
      >
        {posts.map((element, index) => {
          let arr = [];
          let comp;

          element.comments.map((item: any) => {
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

          return (
            <CommunityView
              imageSource={
                element.thumbnail ? photo_url + element.thumbnail : ''
              }
              key={index}
              id={element.id}
              currentTime={element.currentTime}
              totalTime={element.totalTime}
              likes={element.likes}
              numOfComments={element.numOfComments}
              timePassed={element.timePassed}
              postAuthor={element.postAuthor}
              profilePhoto={
                element.profilePhoto ? photo_url + element.profilePhoto : ''
              }
              userCaption={hashtagit(element.userCaption)}
              textCaption={element.userCaption}
              handleLike={handleLike}
              likedFromUser={element.likedFromUser}
              playSound={playSound}
              navigation={props.navigation}
              postId={element.id}
              comments={arr}
              follower={element.follower}
              userId={element.userId}
              blockList={blockList}
              audioClip={element.audioClip}
              allowComments={element.allowComments}
            ></CommunityView>
          );
        })}
      </ScrollView>

      {/* <TouchableOpacity
        style={{
          position: "relative",
          bottom: 25,
          right: 15,
          borderRadius: 30,
          shadowColor: "#000",
          shadowOffset: { width: 1, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
          elevation: 5,
        }}
      >
        <Image
          source={require("../assets/images/micGuidance.png")}
          style={styles.micimage}
        />
      </TouchableOpacity> */}
      <MicButton />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    alignItems: 'center',
    height: '100%',
    // marginBottom: 40,
  },
  scrollview: {
    width: '100%',
    height: '100%',
  },
  micimage: {
    height: 70,
    width: 70,
    borderRadius: 30,
  },
  hashtag: {
    color: '#D2AE9A',
    fontWeight: '500',
    // fontSize: 12,
    //lineHeight: 15,
  },
});

export default CommunityContent;
