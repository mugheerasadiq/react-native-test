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
import FollowersList from '../components/FollowersList';
import { Searchbar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
const axios = require('axios');
var qs = require('qs');
const api = require('../api.json');
const follow_user_url = api.follow_user;
const get_user_follow_status_url = api.get_user_follow_status;
const get_follow_status_url = api.get_follow_status;

import User from '../classes/User';
const userObj = new User();

export default function FollowersPage(props: any) {
  // let [followersData, setFollowersData] = useState(null);
  let [followers, setFollowers] = useState([]);
  let [text, setText] = useState('');
  const myId = props.route.params?.myId;
  const otherUserId = props.route.params?.otherUserId;
  // This is useless filter for reference see same place code in FollowingPage
  //  let [followers, setFollowers] = useState(
  //   followersData.filter((element) => element.followingMe === true)
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
            json.data.followers?.map((item: any) => {
              if (
                !item.blockedBy.includes(myId) &&
                !item.blocked.includes(myId)
              ) {
                arr.push({
                  name: item.name,
                  following: item.followers?.includes(myId),
                  followingMe: true,
                  blocked: item.blocked.includes(myId),
                  profilePhoto: item?.profilePhoto,
                  _id: item._id,
                });
              }
            });
            setFollowers(arr);
          })
          .catch((error: any) => console.log('=========error======', error));
      });
    }, [])
  );

  const handleClickBack = () => {
    props.navigation.goBack();
    console.log('Clicked Back!'); // Clicking back
  };

  const setBlock = (_id: string, value: boolean) => {
    let index = followers?.findIndex((element: any) => element._id === _id);
    followers[index].blocked = value;
    setFollowers([...followers]);
  };

  const remove = (_id: string) => {
    // API is not create yet
    // call block user code
    (async () => {
      const hashId = await AsyncStorage.getItem('hashId');
      const res = await userObj.block(hashId, _id);
    })();

    // this should be id
    let index = followers?.findIndex((element: any) => element._id === _id);
    followers[index].blocked = true;
    setFollowers(
      followers?.filter((element: any) => element.followingMe === true)
    );
  };

  const unremove = (_id: string) => {
    // API is not create yet

    let index = followers?.findIndex((element: any) => element._id === _id);
    followers[index].blocked = false;
    setFollowers(
      followers?.filter((element: any) => element.followingMe === true)
    );
  };

  const add = (_id: string) => {
    followAtBackend(_id);

    let index = followers?.findIndex((element: any) => element._id === _id);
    followers[index].following = true;
    setFollowers(
      followers?.filter((element: any) => element.followingMe === true)
    );
  };

  const followAtBackend = (_id: any) => {
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
          // Alert.alert(json.data.message)
        })

        .catch((error: any) => console.log('=========error======', error));
    });
  };

  return (
    <>
      <View style={{ backgroundColor: 'white' }}>
        <FollowHeader
          title={'Followers'}
          text={text}
          setText={setText}
          handleClickBack={handleClickBack}></FollowHeader>
        <Searchbar
          placeholder="Search"
          onChangeText={(v: string) => {
            // setFollowers(followers.filter((e:any)=>e.name.toLowerCase().includes(v.toLowerCase())))
            setText(v);
          }}
          value={text}
          style={styles.input}
          inputStyle={{ fontSize: 16 }}
        />

        {text.length > 0 ? (
          <FollowersList
            list={followers?.filter((element: any) =>
              element.name.toUpperCase().includes(text.toUpperCase())
            )}
            remove={remove}
            unremove={unremove}
            setBlock={setBlock}
            add={add}
            myId={myId}
            navigation={props.navigation}></FollowersList>
        ) : (
          <FollowersList
            list={followers}
            remove={remove}
            unremove={unremove}
            setBlock={setBlock}
            add={add}
            myId={myId}
            navigation={props.navigation}></FollowersList>
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
