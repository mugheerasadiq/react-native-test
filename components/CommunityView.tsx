import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Image,
  ImageBackground,
  Platform,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';
import LikeCommentBar from './LikeCommentBar';
import { LinearGradient } from 'expo-linear-gradient';
import CircleSlider from 'react-native-circle-slider';
import { ScrollView } from 'react-native-gesture-handler';
const height = Dimensions.get('screen').height;

const CommunityView = (props: any) => {
  const [paused, setPause] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>('0:00');
  const [duration, setDuration] = useState<string>(props.totalTime);
  const [slider, setSlider] = useState<number>(0);
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

  useEffect(() => {
    restart ? setRestart(false) : setRestart(true);
  }, [slider]);

  return (
    <ScrollView>
      <View style={styles.containerView}>
        <ImageBackground
          source={{ uri: props.imageSource }}
          style={styles.ImageBackground}
          imageStyle={{ borderRadius: 30 }}
        >
          <LinearGradient
            colors={['transparent', '#FFF']}
            style={{ flex: 1, borderRadius: 30 }}
          />
          <View style={styles.audioplayer}>
            <View style={styles.timeOnSpot}>
              <Text style={styles.timeText}>{currentTime}</Text>
            </View>
            {/* <View style={styles.timeOnSpot}>
                  <Text style={styles.timeText}>{props.currentTime}</Text>
            </View>
            <View style={styles.timeTotalSpot}>
                  <Text style={styles.timeText}>{props.totalTime}</Text>
            </View> */}
            <View style={styles.circle}>
              {restart && (
                <CircleSlider
                  dialWidth={5}
                  value={slider}
                  dialRadius={107}
                  btnRadius={6.5}
                  strokeColor={'lightgrey'}
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
                  strokeColor={'lightgrey'}
                  strokeWidth={0.5}
                  meterColor={'black'}
                  textSize={-150000}
                  textColor={'white'}
                />
              )}
            </View>
            <TouchableOpacity
              style={{
                flex: 1,
                marginTop: '32%',
                marginLeft: '32%',
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

            <View style={styles.timeTotalSpot}>
              <Text style={styles.timeText}>{duration}</Text>
            </View>
          </View>
          <View style={{ marginBottom: 0.28 * height }} />
          <LikeCommentBar
            likes={props.likes}
            numOfComments={props.numOfComments}
            timePassed={props.timePassed}
            id={props.id}
            postAuthor={props.postAuthor}
            profilePhoto={props.profilePhoto}
            userCaption={props.userCaption}
            textCaption={props.textCaption}
            handleLike={props.handleLike}
            likedFromUser={props.likedFromUser}
            navigation={props.navigation}
            postId={props.postId}
            comments={props.comments}
            follower={props.follower}
            userId={props.userId}
            blockList={props.blockList}
            allowComments={props.allowComments}
          />
        </ImageBackground>
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  containerView: {
    flex: 1,
    backgroundColor: '#808080',
    width: 340,
    height: height * 0.7,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 7 },
    shadowRadius: 10,
    shadowOpacity: 0.4,
    elevation: 5,
    borderRadius: 30,
    marginTop: 0.012 * height,
  },
  audioplayer: {
    opacity: 1,
    padding: 8,
    width: '100%',
    position: 'relative',
    flexDirection: 'row',
    marginVertical: '10%',
    height: 0.17 * height,
  },
  circle: {
    // flex: 1,
    position: 'absolute',
    // width:"50%",
    // height: "30%",
    // left: 70,
    marginLeft: '17%',
    marginTop: '5%',
    transform: [{ rotate: '270deg' }],
  },

  timeOnSpot: {
    // position: 'absolute',
    height: 17,
    width: 40,
    top: 120,

    /* small text */
  },
  timeText: {
    fontFamily: 'Montserrat',
    fontStyle: 'normal',
    fontWeight: '500',
    // fontSize: 12,
    lineHeight: 15,
    textAlign: 'center',
    // color: "black",

    /* darkgrey */
    color: 'white',
  },
  timeTotalSpot: {
    height: 17,
    top: 120,
  },
  pauseButton: {
    width: 42,
  },
  playButton: {
    width: 42,
  },
  ImageBackground: {
    flex: 1,
    // width: 340,
    // alignSelf: "center",
    // borderRadius: 30,
  },
});

export default CommunityView;
