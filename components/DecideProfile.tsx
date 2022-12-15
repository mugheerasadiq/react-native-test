// Obselete file
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import User from '../classes/User';
const user = new User();
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DecideProfile(props: any) {
  const username = props.route.params.username.slice(1);

  React.useEffect(() => {
    (async () => {
      const res = await user.getUserByUsername(username);
      const myId = await AsyncStorage.getItem('hashId');
      const userData = res.data?.data;
      if (String(userData?._id) == String(myId)) {
        props.navigation.replace('Profile');
      } else {
        props.navigation.replace('OthersProfile', {
          following: userData?.followers.includes(myId),
          _id: userData?._id,
          blocked: userData?.blockedBy.includes(myId),
        });
      }
    })();
  }, []);
  return <></>;
}
