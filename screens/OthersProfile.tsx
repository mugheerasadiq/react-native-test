import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ImageBackground,
  Dimensions,
  Text,
  FlatList,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { Icon, Card, Header } from 'react-native-elements';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { user } from '../assets/testing_json/user';
import { Audio } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';
import avatar from '../assets/images/avatarDuet.jpg';

// import AddCoverImage from '../components/AddCoverImage';
//The user information to be fetched and passed to the ProfileSharedLayout as parameter
//this is others profile so the user data will be recieved from the onPress call of this person's profile
interface Post {
  post_id: string;
  image: string;
}
type renderItemPropType = { item: Post };
let postArray: Post[] = [];
let flag = 1;
let optionShow = false;

import BottomApp from '../components/BottomNavigation';
import { RouteStackParamList } from '../navigation/RouteParameterList';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const axios = require('axios');
var qs = require('qs');
const api = require('../api.json');
import User from '../classes/User';
const userObj = new User();

const get_user_by_id_url = api.get_user_by_id;
const get_user_posts_url = api.get_user_posts;
const photo_url = api.photo;
const get_follow_status_url = api.get_follow_status;
const get_user_follow_status_url = api.get_user_follow_status;
const unfollow_user_url = api.unfollow_user;
const follow_user_url = api.follow_user;
const get_user_url = api.get_user;
const audio_url = api.audio;

export default function OthersProfile(
  props: RouteStackParamList<'OthersProfile'>
) {
  const show = props?.route?.params?.following ? false : true;
  const [playingBio, setPlayingBio] = useState(false);
  const [optionShow, setOptionShow] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | undefined>(undefined);
  const [isPressed, setIsPressed] = useState(show);
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [flatPosts, setFlatPosts] = useState(null);
  const [blocked, setBlocked] = useState(
    props?.route?.params?.blocked || false
  );
  const [myId, setMyId] = useState(null);
  const [token, setToken] = useState(null);
  const _id = props?.route?.params?._id || '';
  const [followersLength, setFollowersLength] = useState(0);
  const [followingLength, setFollowingLength] = useState(0);
  const [blockList, setBlockList] = useState([]);
  const [friends, setFriends] = useState([]);
  const [refresh, setRefresh] = useState(0);

  // it didn't work
  // useEffect(()=>{
  //   AsyncStorage.getItem('email').then((email:string)=>{
  //     var config = {
  //         method: 'get',
  //         url: get_user_url + email,
  //         headers: {
  //           'Content-Type': 'application/x-www-form-urlencoded',
  //         },
  //       };
  //       axios(config).then((json:any)=>{
  //         setIsPressed(!json.data.data.following.includes(_id))
  //       },(err:any)=>{
  //         console.log(err)
  //       })
  //   })
  // },[])

  const getPosts = (posts: any, loginUserId: any, friends: any) => {
    let arr: any = [];
    posts?.map((item: any) => {
      const obj = {
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
        comments: item.comments,
        allowComments: item.allowComments,
        thumbnail: item.thumbnail,
      };

      if (item.status == 'public') {
        arr.push(obj);
      }
      // not sure, but I think this work is also done at backend
      else if (item.status == 'friends' && friends.includes(item.userId)) {
        arr.push(obj);
      }
    });
    return arr;
  };

  const getSinglePost = (
    posts: any,
    loginUserId: any,
    friends: any,
    post: any
  ) => {
    let arr: any = [];
    posts?.map((item: any) => {
      const obj = {
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
        comments: item.comments,
        allowComments: item.allowComments,
        thumbnail: item.thumbnail,
      };

      if (post.post_id == item._id) {
        if (item.status == 'public') {
          arr.push(obj);
        }
        // not sure, but I think this work is also done at backend
        else if (item.status == 'friends' && friends.includes(item.userId)) {
          arr.push(obj);
        }
      }
    });
    return arr;
  };

  useFocusEffect(
    useCallback(() => {
      var config = {
        method: 'get',
        url: get_user_by_id_url + _id,
      };

      axios(config)
        .then((json: any) => {
          setUser(json.data);
          AsyncStorage.getItem('hashId').then((myId: any) => {
            setBlocked(json.data.data.blockedBy.includes(myId));
            setMyId(myId);

            AsyncStorage.getItem('accessToken').then((token: any) => {
              // get user posts
              setToken(token);
              var config = {
                method: 'get',
                url: get_user_posts_url + _id,
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  authorization: token,
                },
              };

              axios(config)
                .then((json: any) => {
                  setPosts(json.data);
                  let arr: any = [];
                  userObj.getUser(myId, token).then((res: any) => {
                    setBlockList(
                      res.data.data.blocked.concat(res.data.data.blockedBy)
                    );
                    const friends = res.data.data.friends;
                    setFriends(friends);

                    json.data.map((item: any) => {
                      const obj = {
                        post_id: item._id,
                        image: item.thumbnail,
                      };

                      if (item.status == 'public') {
                        arr.push(obj);
                      } else if (
                        item.status == 'friends' &&
                        friends.includes(item.userId)
                      ) {
                        arr.push(obj);
                      }
                    });
                    setFlatPosts(arr);
                  });
                })
                .catch((error: any) =>
                  console.log('=========error======', error)
                );
            });
          });
        })
        .catch((error: any) => console.log('=========error======', error));
    }, [refresh])
  );

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        // some issues exists here
        if (user) {
          const token = await AsyncStorage.getItem('accessToken');
          const hashId = await AsyncStorage.getItem('hashId');
          const userData = await userObj.getUser(hashId, token);

          let following = user?.data?.following;
          userData.data.data.blockedBy.map((item: any) => {
            following = following.filter((e: any) => e != item);
          });

          userData.data.data.blocked.map((item: any) => {
            following = following.filter((e: any) => e != item);
          });

          let followers = user?.data?.followers;
          userData.data.data.blockedBy.map((item: any) => {
            followers = followers.filter((e: any) => e != item);
          });

          userData.data.data.blocked.map((item: any) => {
            followers = followers.filter((e: any) => e != item);
          });

          setFollowersLength(followers?.length);
          setFollowingLength(following?.length);
        }
      })();
    }, [user])
  );

  const updateFollow = () => {
    if (isPressed) {
      // follow
      AsyncStorage.getItem('accessToken').then((token: any) => {
        var data = qs.stringify({
          followerid: _id,
        });
        var config = {
          method: 'patch',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            authorization: token,
          },
          url: follow_user_url,
          data: data,
        };

        axios(config)
          .then((json: any) => {
            setRefresh(Math.random());
            // console.log(json.data.message)
          })

          .catch((error: any) => console.log('=========error======', error));
      });

      props?.route?.params?.addInFollowingList &&
        props?.route?.params?.addInFollowingList(props?.route?.params.userId);
    } else {
      // unfollow
      AsyncStorage.getItem('accessToken').then((token: any) => {
        var data = qs.stringify({
          followerid: _id,
        });
        var config = {
          method: 'patch',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            authorization: token,
          },
          url: unfollow_user_url,
          data: data,
        };

        axios(config)
          .then((json: any) => {
            // Alert.alert(json.data.message);
            setRefresh(Math.random());
          })

          .catch((error: any) => console.log('=========error======', error));
      });
      props?.route?.params?.removeFromFollowingList &&
        props?.route?.params?.removeFromFollowingList(
          props?.route?.params.userId
        );
    }
    setIsPressed(!isPressed);
    props?.route?.params?.setFollowing &&
      props?.route?.params?.setFollowing(!props?.route?.params?.following);
  };
  async function playSound() {
    if (!user?.data.bio) {
      alert("Bio isn't available!");
      return;
    }
    console.log('Loading Sound');
    try {
      if (!playingBio) {
        const { sound } = await Audio.Sound.createAsync({
          // Get audioBio from user
          uri: audio_url + user?.data.bio,
        });
        setSound(sound);
        console.log('Playing Sound');
        await sound.playAsync().then(() => {
          setPlayingBio(true);
        });

        sound.setOnPlaybackStatusUpdate(async (status) => {
          if (status.isLoaded) {
            if (status.didJustFinish === true) {
              setPlayingBio(false);
            }
          }
        });
      } else {
        sound?.stopAsync().then(() => {
          setPlayingBio(false);
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  const getSinglePostToShow = (item: any) => {
    // ******************************************************

    AsyncStorage.getItem('accessToken').then((token: any) => {
      let posts: any;

      // get user posts
      var config = {
        method: 'get',
        url: get_user_posts_url + _id,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          authorization: token,
        },
      };

      axios(config)
        .then((json: any) => {
          posts = json.data;
          props.navigation.navigate('OtherUserPosts', {
            data: getSinglePost(posts, _id, friends, item),
            blockList: blockList,
          });
        })
        .catch((error: any) => console.log('=========error======', error));
    });

    // ////////////////////////////////////////////////////
  };

  const getPostsToShow = () => {
    // ******************************************************

    AsyncStorage.getItem('accessToken').then((token: any) => {
      let posts: any;

      // get user posts
      var config = {
        method: 'get',
        url: get_user_posts_url + _id,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          authorization: token,
        },
      };

      axios(config)
        .then((json: any) => {
          posts = json.data;
          props.navigation.navigate('OtherUserPosts', {
            data: getPosts(posts, _id, friends),
            blockList: blockList,
          });
        })
        .catch((error: any) => console.log('=========error======', error));
    });

    // ////////////////////////////////////////////////////
  };

  useEffect(() => {
    console.log('unloading....');
    return sound
      ? () => {
          console.log('Unloading Sound');
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const handleMoreOptions = () => {
    setOptionShow(!optionShow);
  };
  let handleBack = () => {
    props.navigation.goBack();
  };

  const renderItem = ({ item }: renderItemPropType) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        getSinglePostToShow(item);
      }}
    >
      {/*onPress = should contain support to play the post */}
      <Image
        style={styles.postImage}
        source={{
          uri:
            item.image == ''
              ? 'https://images.pexels.com/photos/673865/pexels-photo-673865.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500'
              : photo_url + item.image,
        }}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView>
        <ImageBackground
          source={{
            uri: user?.data?.backgroundPhoto
              ? photo_url + user?.data.backgroundPhoto
              : '',
          }}
          style={styles.backgroundImage}
        >
          <View style={styles.ViewIcon}>
            <MaterialIcons
              className="setting-icon"
              name="arrow-back"
              size={30}
              color="#4F4F4F"
              onPress={handleBack}
            />
            {optionShow ? (
              <Icon
                name="cross"
                type="entypo"
                color="#fff"
                style={styles.icon}
                size={24}
                onPress={handleMoreOptions}
              />
            ) : (
              <Icon
                name="dots-three-vertical"
                type="entypo"
                color="#fff"
                style={styles.icon}
                size={24}
                onPress={handleMoreOptions}
              />
            )}

            {/*support to be added to begin a chat with this person */}
          </View>
          {/* profile image to be fetched from user's selected profile picture from data passed into this export fucntion */}
          <View style={styles.viewImage}>
            <Image
              source={{
                uri: user?.data?.profilePhoto
                  ? photo_url + user?.data.profilePhoto
                  : '',
              }}
              style={styles.image}
            ></Image>
          </View>
          <View style={styles.scrollview}>
            {/*user name to be taken from the passed user data */}
            <View style={styles.usernamewrap}>
              <Text style={styles.username}>{user?.data?.displayname}</Text>
              <TouchableOpacity
                style={styles.audioicon}
                onPress={() => playSound()}
              >
                <Icon name="campaign" color={playingBio ? '#0000FF' : '#000'} />
              </TouchableOpacity>
              {/*support must be there to play the audio stored as audio-bio of this person */}
            </View>
            {/*user nickname to be taken from the passed user data */}
            <View>
              <Text style={styles.nickText}>@{user?.data?.username}</Text>
            </View>
            {!blocked ? (
              <>
                <TouchableOpacity onPress={() => updateFollow()}>
                  {isPressed ? (
                    <View style={[styles.followButton]}>
                      <Text style={[styles.baseText, { color: 'black' }]}>
                        Follow
                      </Text>
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.followingButton,
                        { backgroundColor: 'rgba(132,156,176,1)' },
                      ]}
                    >
                      <Text style={[styles.baseText, { color: 'white' }]}>
                        Following
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
                <View style={styles.statbox}>
                  <TouchableOpacity
                    style={styles.block}
                    onPress={() => {
                      getPostsToShow();
                    }}
                  >
                    {/* number of posts to be taken from the passed user data */}
                    <Text style={styles.titleText}>{flatPosts?.length}</Text>
                    <Text style={styles.baseText}>Posts</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.block}
                    onPress={() => {
                      props.navigation.push('FollowingPage', {
                        myId: myId,
                        otherUserId: _id,
                      });
                    }}
                  >
                    {/*number of follows to be taken from the passed user data */}
                    <Text style={styles.titleText}>{followingLength}</Text>
                    <Text style={styles.baseText}>Following</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.block}
                    onPress={() => {
                      props.navigation.push('FollowersPage', {
                        myId: myId,
                        otherUserId: _id,
                      });
                    }}
                  >
                    {/* number of followers to be taken from the passed user data */}
                    <Text style={styles.titleText}>{followersLength}</Text>
                    <Text style={styles.baseText}>Followers</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.flexContainer}>
                  <FlatList<Post>
                    data={flatPosts}
                    keyExtractor={(item: Post) => item.post_id}
                    renderItem={renderItem}
                    numColumns={2}
                    horizontal={false}
                  />
                </View>
              </>
            ) : (
              <View style={{ marginBottom: '100%', marginTop: 100 }}>
                <Text style={{ fontSize: 22, textAlign: 'center' }}>
                  You blocked this account
                </Text>
                <TouchableOpacity
                  style={[styles.followButton, { width: 150 }]}
                  onPress={() => {
                    unblock();
                  }}
                >
                  <Text style={[styles.baseText, { color: 'black' }]}>
                    Click to unblock
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ImageBackground>
      </ScrollView>
      <View style={styles.bottomspace}>{/* <BottomApp /> */}</View>
      {optionShow && (
        <MoreOptions
          navigation={props.navigation}
          blocked={blocked}
          unblock={unblock}
          block={block}
          myId={myId}
          user={user}
          handleMoreOptions={handleMoreOptions}
        />
      )}
    </View>
  );

  function unblock() {
    userObj.unblock(myId, _id).then((res: any) => {
      setBlocked(false);
      props?.route?.params?.setBlocked(_id, false); // This is for followers & following
      props?.route?.params?.setIsBlocked(false);
    });
  }

  function block() {
    userObj.block(myId, _id).then((res: any) => {
      setBlocked(true);
      props?.route?.params?.setBlocked(_id, true); // This is for followers & following
      props?.route?.params?.setIsBlocked(true);
    });
  }
}

const MoreOptions = (props: any) => {
  let [blocked, setBlocked] = useState(props.blocked);
  return (
    <>
      <Card containerStyle={styles.Morecard}>
        <View
          style={styles.optionViewStyle}
          // onPress={() => { props.navigation.navigate('Chats',{currPage: 'Community'})}}
          onTouchEnd={() => {
            props.handleMoreOptions();
            props.navigation.navigate('SingleChat', {
              name: props.user?.data?.name,
              picture: props.user?.data?.profilePhoto,
              id: props.user?.data?._id,
              blockedMe: props.user?.data?.blocked.includes(props.myId),
              iBlocked: props.user?.data?.blockedBy.includes(props.myId),
            });
          }}
        >
          <Icon name="message" size={24} color="grey" />
          <Text style={styles.optionStyle}>Message User</Text>
        </View>
        {blocked ? (
          <View
            style={styles.optionViewStyle}
            onTouchEnd={() => {
              props.unblock();
              setBlocked(false);
              props.handleMoreOptions();
            }}
          >
            <Icon name="block" size={24} color="grey" />
            <Text style={styles.optionStyle}>Unblock User</Text>
          </View>
        ) : (
          <View
            style={styles.optionViewStyle}
            onTouchEnd={() => {
              props.block();
              setBlocked(true);
              props.handleMoreOptions();
            }}
          >
            <Icon name="block" size={24} color="grey" />
            <Text style={styles.optionStyle}>Block User</Text>
          </View>
        )}
      </Card>
    </>
  );
};

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    height: height,
  },
  flexContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  followButton: {
    borderWidth: 1,
    borderRadius: 25,
    padding: 10,
    borderColor: '#c3c3c3',
    alignSelf: 'center',
    width: (width * 1) / 3,
    marginTop: (height * 1) / 35,
  },
  followingButton: {
    borderWidth: 1,
    borderRadius: 25,
    padding: 10,
    borderColor: '#c3c3c3',
    alignSelf: 'center',
    width: (width * 1) / 3,
    marginTop: (height * 1) / 35,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  ViewIcon: {
    // height: height*1/11,
    flex: 1,
    width: '100%',
    marginTop: (height * 1) / 15,
    marginBottom: (height * 1) / 50,
    marginLeft: 16,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navbar: {
    flex: 1,
    width: '100%',
    marginTop: (height * 1) / 50,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingBottom: 10,
  },
  icon: {
    marginRight: 20,
  },
  viewImage: {
    display: 'flex',
    alignItems: 'center',
  },
  image: {
    height: (height * 1) / 7,
    width: (height * 1) / 7,
    borderRadius: (height * 1) / 10,
    backgroundColor: '#fff',
  },
  scrollview: {
    width: '100%',
    flex: 1,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    backgroundColor: '#fff',
    flexDirection: 'column',
    marginTop: 25,
  },
  nameAndBio: {
    flex: 1,
    flexDirection: 'row',
    padding: 10,
  },
  username: {
    fontSize: 25,
    fontFamily: 'Montserrat-Bold',
    color: 'black',
    alignSelf: 'center',
    textAlign: 'center',
    opacity: 0.7,
  },
  audioicon: {
    alignSelf: 'center',
    opacity: 0.7,
    margin: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#c3c3c3',
    padding: 4,
  },
  usernamewrap: {
    marginTop: (height * 1) / 25,
    // marginBottom: 5,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  statbox: {
    flexDirection: 'row',
    // // borderTopColor: '#e3e3e3',
    // borderTopWidth: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f3f3',
    marginTop: (height * 1) / 50,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '500',
    fontFamily: 'Montserrat',
    color: 'grey',
    alignSelf: 'center',
    textAlign: 'center',
    opacity: 0.8,
  },
  nickText: {
    fontSize: 18,
    fontFamily: 'Montserrat',
    color: 'grey',
    alignSelf: 'center',
    textAlign: 'center',
    opacity: 0.8,
  },
  baseText: {
    fontFamily: 'Montserrat',
    fontSize: 14,
    textAlign: 'center',
    opacity: 1,
    fontWeight: '500',
  },
  navTextBox: {
    width: width * 0.5,
  },
  block: {
    flexDirection: 'column',
    justifyContent: 'center',
    // padding: 10,
    height: Dimensions.get('window').width * (1 / 4),
    width: Dimensions.get('window').width * (1 / 3),
  },
  card: {
    height: width * 0.5,
    width: width * 0.5,
    // marginLeft : width*0.04/3
    // borderRadius: 5,
    // flex: 1,
  },
  postImage: {
    width: width * 0.5,
    height: width * 0.5,
    // borderRadius: 5,
    // flex: 1,
  },
  Morecard: {
    height: 150,
    width: width,
    margin: 0,
    padding: 0,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    position: 'absolute',
    paddingBottom: 20,
    // top: height - 650,
    bottom: 0,
    justifyContent: 'flex-end',
  },
  Morecardstyle: {
    position: 'absolute',
    bottom: '-100%',
  },
  optionViewStyle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginLeft: 60,
    marginTop: 20,
  },
  optionStyle: {
    fontSize: 16,
    marginLeft: 20,
    marginTop: 3,
    color: '#4F4F4F',
  },
  bottomspace: {
    position: 'absolute',
    width: '100%',
    height: 79,
    left: 0,
    bottom: 0,
    //top: 750,
    borderRadius: 100,
  },
});
