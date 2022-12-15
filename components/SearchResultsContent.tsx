import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView } from 'react-native';
import SearchResultCard from './SearchResultCard';

const SearchResultsContent = (props: any) => {
  let filtered = props.dummy
  console.log("LIST : "+JSON.stringify(filtered))
  const follow = (title: string) => {
    let dummy = props.dummy;
    let target = props.dummy.findIndex(
      (element: { name: string }) => element.name === title
    );
    dummy[target].following = true;
    props.setDummy(dummy);
  };
  return (
    <View style={styles.container}>
      <ScrollView style={styles.followersContainer}>
        {filtered.map(
          (element: {
            id: string;
            name: string;
            following: boolean;
            bio:string,
            profile: string;
            isBlocked: boolean;
            userName:string
          }) => {
            console.log("ELEMENT : "+JSON.stringify(element))
            return (
              <SearchResultCard
                name={element.name}
                text={props.text}
                key={element.name} // No need
                title={element.userName}
                bio={element.bio}
                following={element.following}
                follow={follow}
                setAudioPlaying={props.setAudioPlaying}
                audioPlaying={props.audioPlaying}
                setSoundOwner={props.setSoundOwner}
                setSound={props.setSound}
                sound={props.sound}
                profile={element.profile}
                id={element.id}
                isBlocked={element.isBlocked}
                Navigation={props.Navigation}></SearchResultCard>
            );
          }
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  headingContainer: {
    flexDirection: 'row',
    width: '100%',
    height: '20%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backArrow: {
    flex: 1,
    marginBottom: -200,
  },
  headingText: {
    marginRight: 120,
    fontSize: 37,
  },
  searchBar: {
    width: '90%',
    backgroundColor: '#EAEAEA',
    borderColor: '#ffffff',
    borderWidth: 1,
    borderRadius: 30,
    alignSelf: 'center',
    marginTop: -20,
    marginBottom: 30,
    textAlign: 'center',
  },

  followersContainer: {
    height: '100%',
    width: '90%',
    alignSelf: 'center',
  },
});

export default SearchResultsContent;
