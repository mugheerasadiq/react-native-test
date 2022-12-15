//import React from "react";
//import ProfileSharedLayout from "../components/ProfileSharedLayout";
//import OthersProfileLayout from "../components/OthersProfileLayout";

//type ProfileProps = {
//isSelf?: boolean;
//userID?: string;
//};

//export default function Profile(props: ProfileProps): JSX.Element {
//if (props.isSelf) {
//return <ProfileSharedLayout />;
//} else {
//return <OthersProfileLayout />;
//}

//}
import { RouteStackParamList } from '../navigation/RouteParameterList';
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ImageBackground,
  Dimensions,
  Text,
  FlatList,
  Image,
  ScrollView,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { TouchableOpacity } from 'react-native-gesture-handler';
//import { user } from '../assets/testing_json/user';
import { Audio } from 'expo-av';
import BottomApp from '../components/BottomNavigation';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const axios = require('axios');
var qs = require('qs');
const api = require('../api.json');
import { MaterialIcons } from '@expo/vector-icons';
const get_user_url = api.get_user;
const photo_url = api.photo;
const get_user_posts_url = api.get_user_posts;
const get_follow_status_url = api.get_follow_status;
const audio_url = api.audio;
import User from '../classes/User';
const userObj = new User();

export default function Profile(props: RouteStackParamList<'Profile'>) {
  const [playingBio, setPlayingBio] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | undefined>(undefined);
  const [user, setUser] = useState<any>(undefined);
  const [posts, setPosts] = useState([]);
  const [myId, setMyId] = useState(null);
  const [followersLength, setFollowersLength] = useState(0);
  const [followingLength, setFollowingLength] = useState(0);
  const [flatPosts, setFlatPosts] = useState([]);
  const showBackBtn = props.route.params?.screen;

  const { navigation } = props;

  useFocusEffect(
    React.useCallback(() => {
      AsyncStorage.getItem('email').then((email: string) => {
        var config = {
          method: 'get',
          url: get_user_url + email,
        };

        axios(config)
          .then((json: any) => {
            AsyncStorage.setItem('user', JSON.stringify(json.data));
            setUser(json.data);

            AsyncStorage.getItem('accessToken').then((token: any) => {
              // get user posts
              setMyId(json.data.data._id);
              var config = {
                method: 'get',
                url: get_user_posts_url + json.data.data._id,
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  authorization: token,
                },
              };

              axios(config)
                .then((json: any) => {
                  console.log('json', json.data[0]);
                  setPosts(json.data);
                  let arr: any = [];
                  json.data.map((item: any) => {
                    arr.push({
                      post_id: item._id,
                      image: item.thumbnail,
                    });
                  });
                  setFlatPosts(arr);
                })
                .catch((error: any) =>
                  console.log('=========error======', error)
                );
            });
          })
          .catch((error: any) => console.log('=========error======', error));
      });
    }, [])
  );

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

  useEffect(() => {
    console.log('unloading....');
    return sound
      ? () => {
          console.log('Unloading Sound');
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const renderItem = ({ item }: renderItemPropType) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        props.navigation.navigate('UserPosts', {
          data: getSinglePost(item),
          blockList: user?.data?.blocked.concat(user?.data?.blockedBy),
        });
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

  const getPosts = () => {
    let arr: any = [];
    posts?.map((item: any) => {
      arr.push({
        id: item._id,
        audioClip: item.audioClip,
        userId: user?.data._id,
        currentTime: '3:42',
        totalTime: item.duration,
        userName: user?.data.name,
        userCaption: item.description,
        timeSincePosted: userObj.calculatePostTime(item.createdAt),
        amountLikes: item.likes.length,
        amountComments: item.comments.length,
        likeStatus: item.likes.includes(user?.data._id),
        playing: false,
        comments: item.comments,
        allowComments: item.allowComments,
        thumbnail: item.thumbnail,
      });
    });
    return arr;
  };

  const getSinglePost = (post: any) => {
    let arr: any = [];
    posts?.map((item: any) => {
      if (item._id == post.post_id) {
        arr.push({
          id: item._id,
          audioClip: item.audioClip,
          userId: user?.data._id,
          currentTime: '3:42',
          totalTime: item.duration,
          userName: user?.data.name,
          userCaption: item.description,
          timeSincePosted: userObj.calculatePostTime(item.createdAt),
          amountLikes: item.likes.length,
          amountComments: item.comments.length,
          likeStatus: item.likes.includes(user?.data._id),
          playing: false,
          comments: item.comments,
          allowComments: item.allowComments,
          thumbnail: item.thumbnail,
        });
      }
    });
    return arr;
  };

  useEffect(() => {
    let following = user?.data?.following;
    user?.data?.blockedBy.map((item: any) => {
      following = following.filter((e: any) => e != item);
    });

    user?.data?.blocked.map((item: any) => {
      following = following.filter((e: any) => e != item);
    });

    let followers = user?.data?.followers;
    user?.data?.blockedBy.map((item: any) => {
      followers = followers.filter((e: any) => e != item);
    });

    user?.data?.blocked.map((item: any) => {
      followers = followers.filter((e: any) => e != item);
    });

    setFollowersLength(followers?.length);
    setFollowingLength(following?.length);
  }, [user]);

  let handleBack = () => {
    props.navigation.goBack();
  };

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
          <View
            style={[
              styles.ViewIcon,
              {
                justifyContent:
                  showBackBtn == 'first' ? 'flex-end' : 'space-between',
              },
            ]}
          >
            {showBackBtn != 'first' && (
              <MaterialIcons
                className="setting-icon"
                name="arrow-back"
                size={30}
                color="#4F4F4F"
                onPress={handleBack}
              />
            )}
            <Icon
              name="dots-three-vertical"
              type="entypo"
              color="#fff"
              style={styles.icon}
              onPress={() => navigation.navigate('ProfileSettings')}
            />
          </View>
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
            <View style={styles.usernamewrap}>
              <Text style={styles.username}>{user?.data?.displayname}</Text>
              <TouchableOpacity
                style={styles.audioicon}
                onPress={() => playSound()}
              >
                <Image source={require('../assets/images/speaker1x.png')} />
              </TouchableOpacity>
            </View>
            <View>
              <Text style={styles.nickText}>@{user?.data?.username}</Text>
            </View>
            <View style={styles.statbox}>
              <TouchableOpacity
                style={styles.block}
                onPress={() =>
                  props.navigation.navigate('UserPosts', {
                    data: getPosts(),
                    blockList: user?.data?.blocked.concat(
                      user?.data?.blockedBy
                    ),
                  })
                }
              >
                {/* number of posts to be taken from the passed user data */}
                <Text style={styles.titleText}>{posts?.length}</Text>
                <Text style={styles.baseText}>Posts</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.block}
                onPress={() => {
                  props.navigation.navigate('FollowingPage', {
                    myId: myId,
                    otherUserId: null,
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
                  props.navigation.navigate('FollowersPage', {
                    myId: myId,
                    otherUserId: null,
                  });
                }}
              >
                {/* number of followers to be taken from the passed user data */}
                <Text style={styles.titleText}>{followersLength}</Text>
                <Text style={styles.baseText}>Followers</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.navbar}>
              <TouchableOpacity style={styles.navTextBox} onPress={() => {}}>
                <Text style={styles.galleryText}>My posts</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navTextBox} onPress={() => {}}>
                <Text style={styles.galleryText}>Saved</Text>
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
          </View>
        </ImageBackground>
      </ScrollView>
      <View style={styles.bottomspace}>{/* <BottomApp /> */}</View>
    </View>
  );
}
interface Post {
  post_id: string;
  image: string;
}
type renderItemPropType = { item: Post };
let postArray: Post[] = [
  //to hold all the existing posts of the user now represented with dummy images
  {
    post_id: '1',
    image:
      'https://images.pexels.com/photos/1680140/pexels-photo-1680140.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500',
  },
  {
    post_id: '2',
    image:
      'https://images.pexels.com/photos/2602545/pexels-photo-2602545.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500',
  },
  {
    post_id: '3',
    image:
      'https://images.pexels.com/photos/1705254/pexels-photo-1705254.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500',
  },
  {
    post_id: '4',
    image:
      'https://images.pexels.com/photos/673865/pexels-photo-673865.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500',
  },
];
let flag = 1;

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  flexContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  ViewIcon: {
    flex: 1,
    width: '100%',
    marginTop: (height * 1) / 15,
    marginBottom: (height * 1) / 50,
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
    fontSize: 21,
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
    marginRight: -2,
  },
  usernamewrap: {
    marginTop: (height * 1) / 20,
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
    fontSize: 16,
    fontFamily: 'Montserrat',
    fontWeight: '500',
    color: '#4F4F4F',
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
  galleryText: {
    fontFamily: 'Montserrat',
    fontSize: 14,
    textAlign: 'center',
  },

  navTextBox: {
    width: width * 0.5,
  },
  block: {
    flexDirection: 'column',
    justifyContent: 'center',
    //padding: 10,
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
