import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ImageBackground,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import HomePagePopUp from '../components/HomePagePopUp';
import CircleSlider from 'react-native-circle-slider';
import AudioCommentPopUp from '../components/AudioCommentPopUp';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const axios = require('axios');
var qs = require('qs');
const api = require('../api.json');
const like_post_url = api.like_post;
const unlike_post_url = api.unlike_post;
const get_comments_url = api.get_comments;
const photo_url = api.photo;
const audio_url = api.audio;

import User from '../classes/User';
const userObj = new User();

export default function VideoPost(props: any) {
  const [textShown, setTextShown] = useState(false); //To show ur remaining Text
  const [lengthMore, setLengthMore] = useState(false); //to show the "Read more & Less Line"
  const lines = 2;
  const defaultHeight = 420;
  const toggleNumberOfLines = () => {
    //To toggle the show text or hide it
    setTextShown(!textShown);
  };
  const [length, setLength] = useState(430);
  const onTextLayout = useCallback((e: any) => {
    if (e.nativeEvent.lines.length >= lines) {
      setLength(e.nativeEvent.lines.length * 15 + defaultHeight + 15);
    } else {
      setLength(e.nativeEvent.lines.length * 15 + defaultHeight);
    }

    setLengthMore(e.nativeEvent.lines.length >= lines); //to check the text is more than 4 lines or not
    // console.log(e.nativeEvent);
  }, []);

  const [following, setFollowing] = useState(props.follower);

  interface ref2 {
    current: any;
  }
  interface ref_audio {
    current: any;
  }
  const refARBSheet: ref_audio = useRef(null);
  const [liked, setLiked] = useState<boolean>(props.likeStatus);
  const selectLike = () => {
    if (!liked) {
      likePost();
    } else {
      unlikePost();
    }
    setLiked(!liked);
  };
  const [paused, setPause] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>('0:00');
  const [duration, setDuration] = useState<string>(props.totalTime);
  const [slider, setSlider] = useState(0);
  const [numOfComments, setNumOfComments] = useState(props.amountComments);
  const [restart, setRestart] = useState(false);

  const selectPause = () => {
    if (paused) {
      props.playSound(
        true,
        props.audioClip,
        setPause,
        setCurrentTime,
        setDuration,
        setSlider
      );
    } else {
      props.playSound(
        false,
        props.audioClip,
        setPause,
        setCurrentTime,
        setDuration,
        setSlider
      );
    }
  };
  const refRBSheet: ref2 = useRef(null);

  const likePost = () => {
    AsyncStorage.getItem('accessToken').then((token: any) => {
      var config = {
        method: 'patch',
        url: like_post_url + props.id,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          authorization: token,
        },
      };
      axios(config)
        .then((json: any) => {
          // Alert.alert(json.data.message);
        })

        .catch((error: any) => console.log('=========error======', error));
    });
  };
  const unlikePost = () => {
    AsyncStorage.getItem('accessToken').then((token: any) => {
      var config = {
        method: 'patch',
        url: unlike_post_url + props.id,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          authorization: token,
        },
      };
      axios(config)
        .then((json: any) => {
          // Alert.alert(json.data.message);
        })

        .catch((error: any) => console.log('=========error======', error));
    });
  };

  useEffect(() => {
    restart ? setRestart(false) : setRestart(true);
  }, [slider]);
  console.log('IMAGE : ' + props.backgroundPhoto);
  return (
    <View
      style={[
        props.style,
        {
          height: setTextShown ? length : defaultHeight,
        },
      ]}
    >
      <ImageBackground
        resizeMode="cover"
        source={{
          uri: props.backgroundPhoto ? api.photo + props.backgroundPhoto : '',
        }}
        style={{ flex: 1 }}
      >
        {/* <BlurView intensity={100} style={props.blurContainer}> */}
        <TouchableOpacity style={styles.flag}>
          <Image source={require('../assets/images/Vector2.png')}></Image>
        </TouchableOpacity>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            height: 250,
            paddingHorizontal: 20,
          }}
        >
          <View style={styles.timeOnSpot}>
            <Text style={styles.timeText}>{currentTime}</Text>
          </View>
          <View
            style={{
              flex: 1,
              position: 'relative',
              marginHorizontal: 20,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View style={styles.circle}>
              {restart && (
                <CircleSlider
                  dialWidth={5}
                  value={slider}
                  dialRadius={107}
                  btnRadius={6.5}
                  strokeColor={'grey'}
                  strokeWidth={0.5}
                  meterColor={'black'}
                  textSize={-150000}
                  textColor={'white'}
                />
              )}
              {!restart && (
                <CircleSlider
                  dialWidth={5}
                  value={slider}
                  dialRadius={107}
                  btnRadius={6.5}
                  strokeColor={'grey'}
                  strokeWidth={0.5}
                  meterColor={'black'}
                  textSize={-150000}
                  textColor={'white'}
                />
              )}
            </View>
            <TouchableOpacity
              style={{
                position: 'absolute',
                alignSelf: 'center',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: '30%',
              }}
              onPress={selectPause}
            >
              {paused ? (
                <Image
                  source={require('../assets/images/Play.png')}
                  style={styles.playButton}
                />
              ) : (
                <Image
                  source={require('../assets/images/Pause.png')}
                  style={styles.pauseButton}
                />
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.timeTotalSpot}>
            <Text style={styles.timeText}>{duration}</Text>
          </View>
        </View>
        <View
          style={styles.name}
          // navigation={props.navigation}
          onTouchEnd={() => {
            AsyncStorage.getItem('user').then((user: any) => {
              user = JSON.parse(user);
              if (user.data._id == props.userId) {
                props.navigation.navigate('Profile');
              } else {
                props.navigation.push('OthersProfile', {
                  _id: props.userId,
                  following: user?.data?.following.includes(props.userId),
                });
              }
            });
          }}
        >
          <Text style={styles.nameText}>
            {props.usersName}
            <View style={{ width: 10 }}></View>
            <Text style={styles.timeAgoText}>{props.timeSincePosted}</Text>
          </Text>
        </View>
        <View style={styles.caption}>
          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Text
              onTextLayout={onTextLayout}
              numberOfLines={textShown ? undefined : lines}
              style={{
                fontFamily: 'Montserrat',
                fontStyle: 'normal',
                fontWeight: '500',
                lineHeight: 15,
                color: '#4F4F4F',
                marginRight: 30,
                width: 300,
              }}
            >
              {props.userCaption}
            </Text>

            {props.userCaption.length > 15 ? (
              <Text
                onPress={toggleNumberOfLines}
                style={{
                  lineHeight: 15,
                  marginTop: 10,
                  fontWeight: '900',
                  // fontSize: 12,
                }}
              >
                {textShown ? 'Read less' : 'Read more'}
              </Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={styles.tripleLook}
            onPress={() => {
              refRBSheet.current.open();
            }}
          >
            <Text style={styles.tripleLookText}>...</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <TouchableOpacity style={styles.numLikes} onPress={selectLike}>
            {liked ? (
              <View>
                <Image
                  source={require('../assets/images/redheartIcon.png')}
                  style={[styles.heart, { width: 12, height: 12 }]}
                />
              </View>
            ) : (
              <View>
                <Image
                  source={require('../assets/images/heartIcon.png')}
                  style={styles.heart}
                />
              </View>
            )}
            <Text style={styles.reactionText}>
              {props.likeStatus
                ? liked && !props.likeStatus
                  ? props.amountLikes + 1
                  : props.likeStatus && liked
                  ? props.amountLikes
                  : props.amountLikes - 1
                : liked
                ? props.amountLikes + 1
                : props.amountLikes}{' '}
              likes
            </Text>
          </TouchableOpacity>
          <View>
            <TouchableOpacity
              style={styles.numComments}
              onPress={() => {
                if (props?.allowComments) {
                  refARBSheet.current.open();
                } else {
                  alert("comments aren't allowed");
                }
              }}
            >
              <Image source={require('../assets/images/commentIcon.png')} />
              <Text style={styles.reactionText}>{numOfComments} comments</Text>
            </TouchableOpacity>
          </View>
        </View>

        <HomePagePopUp
          refRBSheet={refRBSheet}
          close={() => refRBSheet.current.close()}
          allowDelete={props.allowDelete}
          postId={props.id}
          posts={props.posts}
          setPosts={props.setPosts}
        />
        {/* </Draggable> */}
        {/* </BlurView> */}
      </ImageBackground>
      <AudioCommentPopUp
        refARBSheet={refARBSheet}
        close={() => refARBSheet.current.close()}
        postId={props.id}
        comments={props.comments}
        navigation={props.navigation}
        numOfComments={numOfComments}
        setNumOfComments={setNumOfComments}
        blockList={props.blockList}
      />
    </View>
  );
}
const boxHeight = 415;
const figmaHeight = 375;
const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    borderRadius: 37,
  },
  flag: {
    alignSelf: 'flex-end',
    marginRight: 60,
  },
  timeOnSpot: {
    // position: 'absolute',
    width: 28,
    // height: 17,
    justifyContent: 'center',

    // left: (25/375)*boxHeight,
    // top: 130,

    /* small text */
  },
  timeText: {
    fontFamily: 'Montserrat',
    fontStyle: 'normal',
    fontWeight: '500',
    // fontSize: 12,
    lineHeight: 15,
    textAlign: 'center',
    justifyContent: 'center',
    /* darkgrey */
    color: '#4F4F4F',
    width: 32,
  },
  timeTotalSpot: {
    // position: 'absolute',
    width: 26,
    justifyContent: 'center',
    // left: 310,
    // top: 130,
  },
  circle: {
    position: 'absolute',
    // width:"50%",
    // height: "30%",
    // left: 70,
    // marginLeft: "17%",
    // marginTop: "5%",
    alignSelf: 'center',
    alignItems: 'center',
    transform: [{ rotate: '270deg' }],
  },
  highlightedCircle: {
    position: 'absolute',
    width: 214,
    height: 107,
    left: 101,
    top: 50,
  },
  dotButton: {
    position: 'absolute',
    width: 13,
    height: 14,
    left: 309,
    // top: 155,
    borderRadius: 50,
    backgroundColor: '#4F4F4F',
    transform: [{ rotate: '-90deg' }],
  },
  pauseButton: {
    // position: 'absolute',
    // width: 42,
    // height: 46.36,
    // left: 160,
    // top: 80,
  },
  playButton: {
    // position: 'absolute',
    // width: 42,
    // height: 46.36,
    // left: 160,
    // top: 80,
  },
  name: {
    // width: 420,
    // height: 22,
    // top: 347-83,
    // left: 90,
    alignSelf: 'center',
    marginTop: 15,
    // alignSelf:"center"
  },
  nameText: {
    fontFamily: 'Montserrat',
    fontWeight: '600',
    fontSize: 22,
    color: '#4F4F4F',
    // textAlign: "center"
  },
  caption: {
    display: 'flex',
    flexDirection: 'row',
    paddingHorizontal: 20,
    alignSelf: 'center',
    marginVertical: '5%',
    justifyContent: 'space-between',
  },
  captionText: {
    fontFamily: 'Montserrat',
    fontStyle: 'normal',
    fontWeight: '500',
    // fontSize: 12,
    lineHeight: 15,
    color: '#4F4F4F',
    marginRight: 30,
    width: 300,
  },
  timeAgo: {
    position: 'absolute',
    width: 26,
    height: 22,
    top: 347 - 83,
    left: 110,
  },
  timeAgoText: {
    fontFamily: 'Montserrat',
    fontStyle: 'normal',
    fontWeight: '400',
    // fontSize: 12,
    // lineHeight: 27,
    color: '#4F4F4F',
  },
  heart: {
    // position: 'absolute',
    // width: 14,
    // height: 14,
    // left: 27,
    // left: (25/375)*boxHeight,
    // top: 441-83,
  },
  chatPic: {
    position: 'absolute',
    width: 12,
    height: 12,
    // left: 103,
    left: (103 / figmaHeight) * boxHeight,
    top: 441 - 83,
  },
  numLikes: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'absolute',
    width: 60,
    left: 20,
    // top: 441-83,
    // top : 80
  },
  reactionText: {
    fontFamily: 'Montserrat',
    fontStyle: 'normal',
    fontWeight: '500',
    marginLeft: 5,
    // fontSize: 10,
  },
  numComments: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'absolute',
    left: 100,
  },
  tripleDot: {
    position: 'absolute',
    width: 18,
    height: 45,
    // left: 300
    // left: 415-(25/375)*boxHeight,
    // top: 303,
  },
  tripleLook: {
    // marginLeft: 10,
    // width: "10%",
    // paddingHorizontal: 10,
    // flex:1
    // fontFamily: 'Montserrat',
    // fontStyle: 'normal',
    // fontWeight: '500',
    // fontSize: 25,
    // lineHeight: 30,
    // color: '#4F4F4F',
    // transform: ([{ rotate: '90deg' }]),
  },
  tripleLookText: {
    fontFamily: 'Montserrat',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 25,
    // lineHeight: 30,
    color: '#4F4F4F',
    transform: [{ rotate: '90deg' }],
  },
  hashtag: {
    color: '#D2AE9A',
    fontWeight: '800',
  },
});
