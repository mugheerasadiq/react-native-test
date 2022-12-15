import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import Following from '../components/Following';
import BackArrow from '../components/BackArrow';
import FollowHeader from '../components/FollowHeader';
import { baseProps } from 'react-native-gesture-handler/lib/typescript/handlers/gestureHandlers';
import FollowingList from '../components/FollowingList';
import { Searchbar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
const axios = require('axios');
var qs = require('qs');
import { useFocusEffect } from '@react-navigation/native';
const api = require('../api.json');

const get_follow_status_url = api.get_follow_status;
const get_user_by_id_url = api.get_user_by_id;
const unfollow_user_url = api.unfollow_user;
const get_user_follow_status_url = api.get_user_follow_status;

export default function FollowingPage(props: any) {
  // let [followingData, setFollowingData] = useState(null);
  let [text, setText] = useState('');
  const myId = props.route.params?.myId;
  const otherUserId = props.route.params?.otherUserId;
  let [following, setFollowing] = useState([]);
  // This filter is useless as user1 view following list of user2, he can see people in people which he isn't following
  // let [following, setFollowing] = useState(
  //   followingData.filter((element) => element.following === true)
  // );

  useFocusEffect(
    React.useCallback(() => {
      AsyncStorage.getItem('accessToken').then((token: any) => {
        var config = {
          method: 'get',
          url:
            otherUserId != null
              ? get_user_follow_status_url + otherUserId
              : get_follow_status_url,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            authorization: token,
          },
        };

        axios(config)
          .then((json: any) => {
            let arr: any = [];
            json.data.following?.map((item: any) => {
              if (
                !item.blockedBy.includes(myId) &&
                !item.blocked.includes(myId)
              ) {
                arr.push({
                  name: item.name,
                  following: true,
                  profilePhoto: item?.profilePhoto,
                  blocked: false,
                  _id: item._id,
                });
              }
            });
            setFollowing(arr);
          })
          .catch((error: any) => console.log('=========error======', error));
      });
    }, [])
  );

  const handleClickBack = () => {
    props.navigation.goBack();

    console.log('Clicked Back!'); // Clicking back
  };

  const unfollow = (_id: string) => {
    unfollowAtBackend(_id);
    // this should be id
    let index = following?.findIndex((element) => element._id === _id);
    following[index].following = false;
    setFollowing(following?.filter((element) => element.following === true));

    // // added this to change follow / following text on OthersProfile page
    //      props.navigation.pop()
    //      props.navigation.push("OthersProfile",{_id:_id,following:false});
  };

  const setBlock = (_id: string, value: boolean) => {
    let index = following?.findIndex((element: any) => element._id === _id);
    following[index].blocked = value;
    setFollowing([...following]);
  };

  const removeFromFollowingList = (_id: string) => {
    let index = following?.findIndex((element) => element._id === _id);
    following[index].following = false;
    setFollowing(following?.filter((element) => element.following === true));
  };

  const addInFollowingList = (_id: string) => {
    let index = following?.findIndex((element) => element._id === _id);
    following[index].following = true;
    setFollowing(following?.filter((element) => element.following === true));
  };

  const unfollowAtBackend = (_id: any) => {
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
          // Alert.alert(json.data.message)
        })

        .catch((error: any) => console.log('=========error======', error));
    });
  };

  return (
    <>
      <View style={{ backgroundColor: 'white' }}>
        <FollowHeader
          title={'Following'}
          text={text}
          setText={setText}
          handleClickBack={handleClickBack}></FollowHeader>
        <Searchbar
          placeholder="Search"
          onChangeText={(v: any) => {
            setText(v);
          }}
          value={text}
          style={styles.input}
          inputStyle={{ fontSize: 16 }}
        />

        {text.length > 0 ? (
          <FollowingList
            list={following?.filter((element: any) =>
              element.name.toUpperCase().includes(text.toUpperCase())
            )}
            unfollow={unfollow}
            removeFromFollowingList={removeFromFollowingList}
            addInFollowingList={addInFollowingList}
            myId={myId}
            setBlock={setBlock}
            navigation={props.navigation}></FollowingList>
        ) : (
          <FollowingList
            list={following}
            unfollow={unfollow}
            removeFromFollowingList={removeFromFollowingList}
            addInFollowingList={addInFollowingList}
            myId={myId}
            setBlock={setBlock}
            navigation={props.navigation}></FollowingList>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    height: 30,
    width: '90%', //
    alignSelf: 'center',
    backgroundColor: '#F2F2F2',
    marginBottom: 20,
    marginTop: -20,
    borderRadius: 50,
    paddingLeft: 20,
  },
  input: {
    alignSelf: 'center',
    marginLeft: 10,
    marginRight: 10,
    paddingHorizontal: 5,
    height: 35,
    backgroundColor: '#eee',
    width: 350,
    borderRadius: 40,
    marginBottom: 20,
    fontSize: 17,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0,
    elevation: 1,
  },
});
