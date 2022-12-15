import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView } from 'react-native';
import Following from './Following';

const FollowingList = (props: any) => {
  return (
    <>
      <ScrollView>
        {props.list.map(
          (element: {
            name: string;
            following: boolean;
            profilePhoto: string;
            _id: any;
            blocked: boolean;
          }) => {
            return (
              <Following
                title={element.name}
                key={element.name} // id to identify
                unfollow={props.unfollow}
                removeFromFollowingList={props.removeFromFollowingList}
                addInFollowingList={props.addInFollowingList}
                navigation={props.navigation}
                profilePhoto={element.profilePhoto}
                _id={element._id}
                myId={props.myId}
                setBlock={props.setBlock}
                blocked={element.blocked}
                following={element.following}></Following>
            );
          }
        )}
      </ScrollView>
    </>
  );
};

export default FollowingList;
