import React, { useCallback, useRef } from 'react';
import { useState } from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity } from 'react-native';
import HomePagePopUp from '../components/HomePagePopUp';
import AudioCommentPopUp from './AudioCommentPopUp';
import AsyncStorage from '@react-native-async-storage/async-storage';
const axios = require('axios');
var qs = require('qs');
const api = require('../api.json');
const like_post_url = api.like_post;
const unlike_post_url = api.unlike_post;
const get_comments_url = api.get_comments;
const photo_url = api.photo;
const audio_url = api.audio;

const LikeCommentBar = (props: any) => {
  const [textShown, setTextShown] = useState(false); //To show ur remaining Text
  const [lengthMore, setLengthMore] = useState(false); //to show the "Read more & Less Line"
  const lines = 2;
  const defaultHeight = 420;
  const toggleNumberOfLines = () => {
    props.navigation.navigate('DescriptionDetail', {
      description: props.textCaption,
    });
    //To toggle the show text or hide it
    //setTextShown(!textShown);
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

  interface ref3 {
    current: any;
  }
  interface ref_audio {
    current: any;
  }
  const refRBSheet: ref3 = useRef(null);
  const refARBSheet: ref_audio = useRef(null);
  const [liked, setLiked] = useState(props.likedFromUser);
  const [likes, setLikes] = useState(props.likes);
  const [following, setFollowing] = useState(props.follower);
  const [numOfComments, setNumOfComments] = useState(props.numOfComments);

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

  const handleLike = (id: number) => {
    props.handleLike(id); // This is to update the original datas
    if (liked) {
      unlikePost();
      setLikes(likes - 1);
    } else {
      likePost();
      setLikes(likes + 1);
    }
    setLiked(!liked);
  };

  return (
    <View style={styles.container}>
      <View
        style={styles.headerView}
        onTouchEnd={() => {
          AsyncStorage.getItem('hashId').then((id) => {
            if (id != props.userId) {
              props.navigation.navigate('OthersProfile', {
                _id: props.userId,
                following: following,
                setFollowing: setFollowing,
              });
            } else {
              props.navigation.navigate('Profile');
            }
          });
        }}
      >
        <Image
          source={{ uri: props.profilePhoto }}
          style={{ width: 35, height: 35 }}
        />
        <Text style={styles.profilenamestyle}>{props.postAuthor}</Text>
        <Text style={styles.profiletimestyle}>{props.timePassed}</Text>
      </View>
      <View style={styles.headerView}>
        <View style={styles.caption}>
          <Text
            onTextLayout={onTextLayout}
            numberOfLines={textShown ? undefined : lines}
          >
            {props.userCaption}
          </Text>

          {props.userCaption.length > 15 ? (
            <Text
              onPress={toggleNumberOfLines}
              style={{
                lineHeight: 15,
                marginTop: 5,
                marginBottom: 5,
                fontWeight: '900',
                // fontSize: 12,
              }}
            >
              Read More
            </Text>
          ) : null}
        </View>

        <TouchableOpacity onPress={() => refRBSheet.current.open()}>
          <Image
            source={require('../assets/images/ellipsis.png')}
            style={{ width: 20, height: 20, marginVertical: 1 }}
          />
        </TouchableOpacity>
        <HomePagePopUp
          refRBSheet={refRBSheet}
          close={() => refRBSheet.current.close()}
        />
      </View>

      <View style={styles.likecommentbar}>
        <TouchableOpacity onPress={() => handleLike(props.id)}>
          <Image
            source={require('../assets/images/like.png')}
            style={
              liked
                ? {
                    width: 20,
                    height: 20,
                    marginLeft: 10,
                    alignSelf: 'center',
                    tintColor: 'red',
                  }
                : {
                    width: 20,
                    height: 20,
                    marginLeft: 10,
                    alignSelf: 'center',
                    tintColor: 'black',
                  }
            }
          />
        </TouchableOpacity>
        <Text style={styles.textstylelikebar}>{likes} likes</Text>
        <TouchableOpacity
          onPress={() => {
            if (props?.allowComments) {
              refARBSheet.current.open();
            } else {
              alert("comments aren't allowed");
            }
          }}
          style={{ flexDirection: 'row' }}
        >
          <Image
            source={require('../assets/images/comment.png')}
            style={{
              width: 20,
              height: 20,
              marginLeft: 10,
              alignSelf: 'center',
            }}
          />
          <Text style={styles.textstylelikebar}>{numOfComments} comments</Text>
        </TouchableOpacity>

        <AudioCommentPopUp
          refARBSheet={refARBSheet}
          close={() => refARBSheet.current.close()}
          comments={props.comments}
          postId={props.postId}
          navigation={props.navigation}
          numOfComments={numOfComments}
          setNumOfComments={setNumOfComments}
          blockList={props.blockList}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    opacity: 0.8,
    width: '88%',
    marginStart: 16,
    bottom: 20,
    marginBottom: 20,
    fontFamily: 'Montserrat',
  },
  textstylelikebar: {
    textAlignVertical: 'center',
    marginLeft: 10,
    marginTop: 3,
    fontSize: 14,
    fontFamily: 'Montserrat',
  },
  headerView: {
    alignItems: 'center',
    padding: 5,
    height: 50,
    flexDirection: 'row',
    fontFamily: 'Montserrat',
  },
  likecommentbar: {
    flexDirection: 'row',
    fontFamily: 'Montserrat',
  },
  profilenamestyle: {
    marginStart: 7,
    fontSize: 20,
    fontWeight: '200',
    fontFamily: 'Montserrat-Bold',
  },
  profiletimestyle: {
    marginStart: 7,
    fontSize: 15,
    color: '#4F4F4F',
    marginTop: 7,
    fontFamily: 'Montserrat',
  },
  caption: {
    color: '#4F4F4F',
    fontFamily: 'Montserrat',
    fontWeight: '500',
    flexDirection: 'column',
    justifyContent: 'center',
  },
});
export default LikeCommentBar;
