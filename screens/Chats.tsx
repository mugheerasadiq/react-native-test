import React, { useRef, useState } from 'react';
import {
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  View,
  Animated,
  Dimensions,
} from 'react-native';
import Header from '../components/Header';
import Colors from '../constants/Colors';
import { RouteStackParamList } from '../navigation/RouteParameterList';

import { AntDesign } from '@expo/vector-icons';
import {
  RectButton,
  ScrollView,
  TouchableWithoutFeedback,
  Swipeable,
} from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

import avatar from '../assets/images/avatarDuet.jpg';

import WaveChatAudio from '../components/WaveChatAudio';
var axios = require('axios');
var qs = require('qs');
import { useEffect } from 'react';
import Icon from 'react-native-ionicons';
import { Searchbar } from 'react-native-paper';
const api = require('../api.json');
const photo_url = api.photo;
const get_user_chats_url = api.get_user_chats;
import User from '../classes/User';
const user = new User();
const userObj = new User();
import { useFocusEffect } from '@react-navigation/native';

export default function Chats({
  navigation,
  route,
}: RouteStackParamList<'Chats'>) {
  const currPage = route.params;
  // console.log(currPage);

  const [myId, setMyId] = useState(null);

  useFocusEffect(React.useCallback(() => {
    let doesntDeleted = true;

    AsyncStorage.getItem('hashId').then((id: any) => {
      setMyId(id);
      var config = {
        method: 'get',
        url: get_user_chats_url + id,
      };

      axios(config).then((res: any) => {
        let arr: any = [];
        res.data.conversation.map((item: any) => {
          item.userIds.map((user: any) => {
            if (user._id != id) {
              const obj = {
                roomId: item._id,
                userId: user._id,
                picture: user.profilePhoto,
                name: user.name,
                lastMsg: userObj.calculatePostTime(item.lastMessageTime),
                muted: item.mute.includes(id) ? true : false,
                timeOfChatDeletion: null,
                blockedMe: user.blocked.includes(id) ? true : false,
                iBlocked: user.blockedBy.includes(id) ? true: false
              };
              if (item.deletedBy.length != 0) {
                item.deletedBy.map((del: any) => {
                  if (del.id == id) {
                    doesntDeleted = false;
                    if (del.messageAfterDeletion) {
                      obj.timeOfChatDeletion = del.time;
                      arr.push(obj);
                    }
                  }
                });
                if (doesntDeleted) {
                  arr.push(obj);
                }
              } else {
                arr.push(obj);
              }
            }
          });
        });
        setPeople(arr);
        setOriginalPeople(arr);
      });
    });
  }, []));

  const [originalPeople, setOriginalPeople] = useState([]);
  const [people, setPeople] = useState([]);

  const [openedNewChat, setOpenedNewChat] = useState(false);
  const [textSearch, setTextSearch] = useState('');
  const [plusClicked, setPlusClicked] = useState(false);

  const inputRef = useRef<any>();

  const onHandleNewChat = () => {
    setPlusClicked(true);
    inputRef?.current && inputRef?.current?.focus();
    setOpenedNewChat((prev) => !prev);
  };

  const handleGoBack = () => {
    openedNewChat ? setOpenedNewChat(false) : null;
    navigation.goBack();
  };

  const goToSingleChat = (people: any) => {
    navigation.navigate('SingleChat', {
      id: people.userId,
      name: people.name,
      picture: people.picture,
      timeOfChatDeletion: people.timeOfChatDeletion, // somewhow useless property
      blockedMe:people.blockedMe,
      iBlocked:people.iBlocked
    });
  };
  // There is some delays but I do not know how these works at the moment
  let row: Array<any> = [];
  let prevOpenedRow: any;
  const closeRow = (index: number) => {
    if (prevOpenedRow && prevOpenedRow !== row[index]) {
      prevOpenedRow.close();
    }
    prevOpenedRow = row[index];
  };
  const handleMute = (id: any, person: any, ref: any) => {
    if (!person.muted) {
      user.mute(person.roomId, myId).then((res: any) => {
        if (res.data.success) {
          people[id].muted = !people[id].muted;
          setPeople(people);
          ref.close();
        }
      });
    } else {
      user.unmute(person.roomId, myId).then((res: any) => {
        if (res.data.success) {
          people[id].muted = !people[id].muted;
          setPeople(people);
          ref.close();
        }
      });
    }
  };
  const handleDelete = (id: any, person: any, ref: any) => {
    user.deleteChat(person.roomId, myId).then((res: any) => {
      if (res.data.success) {
        const newPeople = people.filter((element) => element !== person);
        setPeople(newPeople);
        // close the swipeable
        ref.close();
      }
    });
  };
  const RenderSwipeOptions = ({
    progress,
    dragX,
    id,
    reference,
    person,
    handleMute,
    handleDelete,
  }: any) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0.5],
      outputRange: [1, 0.1],
    });
    const Style = {
      transform: [
        {
          scale,
        },
      ],
    };

    return (
      <View style={styles.swipeOptions}>
        <View
          style={{
            width: 80,
            backgroundColor: 'lightgray',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 25,
          }}>
          <Animated.Text
            style={[Style, { fontWeight: '400', fontSize: 12 }]}
            onPress={() => handleMute(id, person, reference)}>
            {person.muted ? 'Unmute' : 'Mute'}
          </Animated.Text>
        </View>
        <View
          style={{
            width: 80,
            backgroundColor: 'red',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 25,
          }}>
          <Animated.Text
            style={[Style, { color: '#fff', fontWeight: '500', fontSize: 12 }]}
            onPress={() => handleDelete(id, person, reference)}>
            Delete
          </Animated.Text>
        </View>
      </View>
    );
  };
  let swipeableRef: any = null;

  function compare(a: string, b: string) {
    if(a.lastMsg != "" && b.lastMsg != "") {
      let strValue1 = a.lastMsg
      let strValue2 = b.lastMsg
      console.log("INITIAL_TIME_1 : "+strValue1)
      console.log("INITIAL_TIME_2 : "+strValue2)
      // strValue1 = strValue1.charAt(0)
      // strValue2 = strValue2.charAt(0)
      strValue1 = strValue1.substring(0, strValue1.length-1)
      strValue2 = strValue2.substring(0, strValue2.length-1)
      console.log("TIME_1_FIRST_INDEX : "+strValue1)
      console.log("TIME_2_FIRST_INDEX : "+strValue2)
      let intValue1 = parseInt(strValue1)
      let intValue2 = parseInt(strValue2)
      console.log("INT_TIME_1 : "+intValue1)
      console.log("INT_TIME_2 : "+intValue2)
      if (intValue1 < intValue2)
         return -1;
      if (intValue1 > intValue2)
        return 1;
      return 0;
    } else {
      return 0;
    }
  }

  people.sort(compare);

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <Header
          onPressLeft={handleGoBack}
          onPressRight={() => {}}
          titleHeader={openedNewChat ? 'New chat' : 'Chats'}
          iconLeftClose={false}
          showIconRight={false}
        />
        <View style={styles.viewTop}>
          {/* <TextInput
            ref={inputRef}
            style={[styles.input, { width: openedNewChat ? 340 : 300 }]}
            placeholder="Search"
            placeholderTextColor="#ccc"
            onChangeText={(e) => setTextSearch(e)}
          /> */}
          <Searchbar
            placeholder="Search"
            onChangeText={(v: string) => {
              v = v.toLowerCase();
              if (v != '' && plusClicked) {
                let arr: any = [];
                user.findUsersForChats(v, myId).then((res: any) => {
                  res.data.data.map((item: any) => {
                    arr.push({
                      userId: item._id,
                      picture: item.profilePhoto,
                      name: item.name,
                      lastMsg: item.lastMessageTime ?userObj.calculatePostTime(item.lastMessageTime):'',
                      muted: item.mute ? item.mute.includes(myId) ? true : false : null,
                      iBlocked: item.blockedBy.includes(myId)?true:false
                    });
                  });
                  setPeople(arr.filter((e: any) => e.userId != myId));
                });
              } else {
                if (v == '') {
                  setPeople(originalPeople);
                } else {
                  setPeople(
                    originalPeople.filter((e) =>
                      e?.name.toLowerCase().includes(v)
                    )
                  );
                }
              }
            }}
            style={styles.input}
            inputStyle={{ fontSize: 16 }}
          />
          {!openedNewChat && (
            <RectButton onPress={onHandleNewChat}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: '#fff',
                  borderRadius: 150,
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowOpacity: 0.2,
                  shadowOffset: { width: 0, height: 0 },
                  shadowRadius: 10,
                }}>
                <AntDesign name="plus" size={24} color="black" />
              </View>
            </RectButton>
          )}
        </View>
        {console.log("CHATS : "+JSON.stringify(people))}
        <ScrollView
          // style={styles.containerScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 320, marginHorizontal: 10 }}>
          {people
            .filter((pep) =>
              textSearch.length > 1 ? pep.name.includes(textSearch) : true
            )
            .map((people:any, index) => {
              return (
                <Swipeable
                  key={index + people.name}
                  overshootRight={false}
                  ref={(ref) => (row[index] = ref)}
                  onSwipeableOpen={() => closeRow(index)}
                  renderRightActions={(progress, dragX) => {
                    return people.muted != null ? (<RenderSwipeOptions
                      progress={progress}
                      dragX={dragX}
                      id={index}
                      reference={row[index]}
                      person={people}
                      handleMute={handleMute}
                      handleDelete={handleDelete}
                    />):
                    null
                  }}>
                  <RectButton
                    key={index + people.name}
                    onPress={() => goToSingleChat(people)}
                    style={styles.containerChat}>
                    {/*  */}

                    <View
                      style={{
                        height: 60,
                        width: 50,
                        alignItems: 'center',
                      }}></View>
                    <View>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginLeft: -40,
                        }}>
                        <Image
                          style={{ borderRadius: 80, width: 55, height: 55 }}
                          source={{
                            uri:
                              people?.picture != ''
                                ? photo_url + people.picture
                                : '',
                          }}
                          width={34}
                          height={34}
                        />
                        <Text
                          style={{
                            marginLeft: 15,
                            color: '#4F4F4F',
                            fontSize: 17,
                            marginTop: 0,
                            fontFamily: 'Montserrat-Bold',
                          }}>
                          {people.name}
                        </Text>
                        <Text
                          style={{
                            marginLeft: 15,
                            color: '#4F4F4F',
                            fontSize: 13,
                          }}>
                          {people.lastMsg}
                        </Text>
                      </View>
                      {!openedNewChat && (
                        <>
                          <View style={{ marginTop: 20 }}>
                            <WaveChatAudio
                              style={{
                                marginTop: 0,
                                marginLeft: -50,
                              }}
                              height={35}
                              width={350}
                            />
                          </View>
                        </>
                      )}
                    </View>
                  </RectButton>
                </Swipeable>
              );
            })}
        </ScrollView>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  viewTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    marginLeft: 20,
    marginRight: 15,
    paddingHorizontal: 5,
    height: 35,
    backgroundColor: '#eee',
    width: 300,
    borderRadius: 40,
    fontSize: 17,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0,
    elevation: 1,
  },
  containerScroll: {
    marginTop: 0,
    marginHorizontal: 10,
    paddingBottom: 20,
    // height: "100%",
    //width: '100%'
  },
  containerChat: {
    height: 90,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    marginTop: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  swipeOptions: {
    display: 'flex',
    flexDirection: 'row',
  },
});
