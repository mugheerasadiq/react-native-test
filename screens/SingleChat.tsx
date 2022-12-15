import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import { RouteStackParamList } from '../navigation/RouteParameterList';

import Header from '../components/Header';
import Colors from '../constants/Colors';
import Mic from '../components/Mic';
import { Audio } from 'expo-av';
import avatar from '../assets/images/avatarDuet.jpg';
import WaveChatAudio from '../components/WaveChatAudio';
import WaveChatAudio2 from '../components/WaveChatAudio2';

import { Feather, FontAwesome } from '@expo/vector-icons';
import Recording from '../components/Recording';
import StartDuetRecording from '../components/StartDuetRecording';
import { Icon } from 'react-native-elements';
var axios = require('axios');
var qs = require('qs');
const api = require('../api.json');
const server_url = api.server;
const get_deleted_chat_object_url = api.get_deleted_chat_object;
const photo_url = api.photo;
const initiate_url = api.initiate;
const send_message_url = api.send_message;
const get_conversation_url = api.get_conversation;
const audio_url = api.audio;
import AsyncStorage from '@react-native-async-storage/async-storage';
import User from '../classes/User';
const user = new User();
import io from 'socket.io-client/dist/socket.io';

const SingleChat = ({
  navigation,
  route,
}: RouteStackParamList<'SingleChat'>) => {
  const [myId, setMyId] = useState(null);
  const [userTwoId, setUserTwoId] = useState(null);
  const [roomIdExists, setRommIdExists] = useState(false);
  const [chatRoomId, setChatRoomId] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [indicator, setIndicator] = useState(true);
  const [screen, setScreen] = useState('none');
  let socket = io(server_url);
  let timeOfChatDeletion =
    route.params?.timeOfChatDeletion != null
      ? new Date(route.params.timeOfChatDeletion)
      : null;
  const blockedMe = route.params?.blockedMe;
  const [iBlocked, setIBlocked] = useState(route.params?.iBlocked);
  const flatlistRef = useRef();

  const onPressFunction = () => {
    flatlistRef.current.scrollToEnd({ animating: true });
    //flatlistRef.current.scrollToOffset({animated: false, offset: 0});
  };

  useEffect(() => {
    (async () => {
      const userTwoId = route.params.id;
      let userOneId: any = await AsyncStorage.getItem('hashId');
      setMyId(userOneId);
      setUserTwoId(userTwoId);

      var data = qs.stringify({
        userIds: JSON.stringify([userOneId, userTwoId]),
        isInitiate: false,
      });
      const res = await user.initiate(data, userOneId);

      if (res.data.chatRoom.isExists) {
        var config = {
          method: 'get',
          url: get_conversation_url + res.data.chatRoom.chatRoomId,
        };
        const obj = await user.getDeletedChatObj(
          res.data.chatRoom.chatRoomId,
          userOneId
        );
        if (obj.data != null) {
          if (obj.data.messageAfterDeletion) {
            timeOfChatDeletion = new Date(obj.data.time);
            const res2 = await axios(config);
            let arr: any = [];
            res2.data.conversation.map((item: any) => {
              const onePeople = {
                sentByUser: item.postedByUser._id == userOneId ? 1 : 2,
                msgTime: item.msgTime,
                picture: item.postedByUser.profilePhoto,
                uri: item.message,
              };
              if (timeOfChatDeletion) {
                if (new Date(item.createdAt) > timeOfChatDeletion) {
                  arr.push(onePeople);
                }
              } else {
                arr.push(onePeople);
              }
            });
            setChatData(arr);
            setIndicator(false);
            setScreen('auto');
          } else {
            setIndicator(false);
            setScreen('auto');
          }
        } else {
          const res2 = await axios(config);
          let arr: any = [];
          res2.data.conversation.map((item: any) => {
            arr.push({
              sentByUser: item.postedByUser._id == userOneId ? 1 : 2,
              msgTime: item.msgTime,
              picture: item.postedByUser.profilePhoto,
              uri: item.message,
            });
          });
          setChatData(arr);
          setIndicator(false);
          setScreen('auto');
        }

        setRommIdExists(true);
        setChatRoomId(res.data.chatRoom.chatRoomId);
      } else {
        setRommIdExists(false);
        setIndicator(false);
        setScreen('auto');
      }

      onPressFunction();
    })();
  }, []);

  useEffect(() => {
    if (myId) {
      let socket = io(server_url);

      socket.on('connect', () => {
        socket.emit('identity', myId);
      });

      socket.on(
        'message',
        (sender: any, msg: any, msgTime: any, profilePicture: any) => {
          // setMsg(msg)
          let obj = {
            sentByUser: 2,
            msgTime: msgTime,
            picture: profilePicture,
            uri: msg as string,
          };
          setChatData((prev) => [...prev, obj]);
        }
      );

      socket.on('disconnect', () => {
        console.log(socket.id); // undefined
      });
    }
    return () => {
      socket.emit('remove', myId);
    };
  }, [myId]);

  const [chatData, setChatData] = useState([]);

  const [onRecord, setOnRecord] = useState(false);
  const [audioRecorded, setAudioRecorded] = useState(false);
  const [count, setCount] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | undefined>(
    undefined
  );
  const [playing, setPlaying] = useState<Audio.Sound | undefined>(undefined);

  const handleGoBack = () => {
    navigation.goBack();
  };

  React.useEffect(() => {
    return playing
      ? () => {
          playing.unloadAsync(); }
      : undefined;
  }, [playing]);

  async function startRecording() {
    playing?.unloadAsync();
    setOnRecord(true);
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      console.log('Starting recording..');
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      await recording.startAsync();
      setRecording(recording);
    } catch (err) {
      console.log('Recording failed to start');
      console.log(err);
    }
  }

  async function stopRecording() {
    setOnRecord(false);
    setAudioRecorded(true);
    console.log('Stopping recording..');
    if (recording) {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log('Recording stopped and stored at', uri);
      setCount(0);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false, 
      });
    }
  }
  useEffect(() => {
    const timer = setInterval(() => {
      let paused = false;
      setOnRecord((p) => {
        paused = p;
        return p;
      });
      setCount((seconds) => {
        if (paused) {
          return seconds + 1;
        }
        return seconds;
      });
    }, 1000);
    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  // recording: Audio.Recording
  async function playSound(uri: string, rightNow: any) {
    console.log('Loading Sound');
    try {
      const { sound } = await Audio.Sound.createAsync({
        uri: rightNow ? uri : audio_url + uri,
      });
      if (playing === undefined) {
        console.log('audio playing!');
        setPlaying(sound);
        await sound!.playAsync();
      } else {
        // console.log('Current Audio stopped, playing new one!');
        const s1 = await sound.getStatusAsync();
        const s2 = await playing.getStatusAsync();
        if (s1.uri == s2.uri) {
          playing.stopAsync();
          setPlaying(undefined);
        } else {
          playing.stopAsync();
          await sound!.playAsync();
          setPlaying(sound);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  const dumpAudio = () => {
    setAudioRecorded(false);
  };

  const sent = () => {
    if (recording) {
      onPressFunction();
      let recording_url: any = recording._uri;
      recording_url =
        Platform.OS === 'android'
          ? recording_url
          : recording_url.replace('file://', '');

      let total = Math.round(recording._finalDurationMillis / 1000);
      let min = Math.round(total / 60);
      let sec =
        Math.round(total % 60) >= 10
          ? Math.round(total % 60)
          : '0' + Math.round(total % 60);
      if (Number(sec) <= 0) {
        alert('Recording should be 1 second or more');
        return;
      }
      AsyncStorage.getItem('userData').then((userData: any) => {
        userData = JSON.parse(userData);
        let obj = {
          sentByUser: 1,
          msgTime: min + ':' + sec,
          picture: userData.profilePhoto,
          uri: recording.getURI() as string,
          rightNow: true,
        };
        setChatData((prev) => [...prev, obj]);
        setAudioRecorded(false);
      });

      // #############################
      // upload post code

      let arr = recording_url.split('/');
      let audio_name = arr[arr.length - 1];
      arr = arr[arr.length - 1].split('.');

      (async () => {
        var userData = await AsyncStorage.getItem('userData');
        userData = JSON.parse(userData);
        var formData = new FormData();
        formData.append('audiofile', {
          uri: recording_url,
          type: 'audio/' + arr[1],
          name: audio_name,
        });
        formData.append('userId', myId);
        formData.append('receiver', userTwoId);
        formData.append('profilePicture', userData.profilePhoto);
        formData.append('msgTime', min + ':' + sec);

        let roomId;
        if (!roomIdExists) {
          var data = qs.stringify({
            userIds: JSON.stringify([myId, userTwoId]),
            isInitiate: true,
          });
          const res: any = await user.initiate(data, myId);
          roomId = res?.data?.chatRoom?.chatRoomId;
          setChatRoomId(roomId);
          var config = {
            method: 'post',
            url: send_message_url + roomId + '/' + 'message',
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            data: formData,
          };

          axios(config).then((res: any) => {
            handleSentMessageResult(res.data);
          });
        } else {
          roomId = chatRoomId;
          var config = {
            method: 'post',
            url: send_message_url + roomId + '/' + 'message',
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            data: formData,
          };

          axios(config).then((res: any) => {
            handleSentMessageResult(res.data);
          });
        }
      })();
    }
  };

  const handleSentMessageResult = (data: any) => {
    console.log(data);
  };

  const chatList = (item: any, index: number) => {
    return (
      <View style={{ flex: 1 }}>
        {item.sentByUser === 1 ? (
          <View style={{ alignSelf: 'flex-end', marginHorizontal: 20 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                alignSelf: 'flex-end',
              }}>
              <Text style={{ marginRight: 15 }}>{item.msgTime}</Text>
              <Image
                style={{ borderRadius: 80, width: 40, height: 40 }}
                source={{
                  uri: item?.picture != '' ? photo_url + item.picture : '',
                }}
                width={40}
                height={40}
              />
            </View>
            <TouchableOpacity
              onPress={() => playSound(item.uri, item.rightNow)}>
              <WaveChatAudio2
                style={{
                  marginTop: 10,
                  marginLeft: 10,
                }}
                height={25}
              />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ alignSelf: 'flex-start', marginHorizontal: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {chatData[index + 1]?.sentByUser != item.sentByUser && (
                <>
                  <Image
                    style={{ borderRadius: 80, width: 40, height: 40 }}
                    source={{
                      uri: item?.picture != '' ? photo_url + item.picture : '',
                    }}
                    width={40}
                    height={40}
                  />
                  <Text style={{ marginLeft: 15 }}>{item.msgTime}</Text>
                </>
              )}
            </View>
            <TouchableOpacity
              onPress={() => playSound(item.uri, item.rightNow)}>
              <WaveChatAudio
                style={{
                  marginTop: 10,
                  marginLeft: 10,
                }}
                height={25}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: Colors.light.background }}
      pointerEvents={screen}>
      <View style={styles.loading}>
        <ActivityIndicator size="large" animating={indicator} color={'grey'} />
      </View>
      <Header
        onPressLeft={handleGoBack}
        onPressRight={() => {}}
        titleHeader={route.params.name}
        iconLeftClose={false}
        showIconRight={false}
      />
      <View style={{ flex: 0.8 }}>
        <FlatList
          ref={flatlistRef}
          data={chatData}
          renderItem={({ item, index }) => chatList(item, index)}
        />
      </View>
      {blockedMe && (
        <Text style={{ textAlign: 'center', fontSize: 20 }}>
          You are blocked by {route.params.name}
        </Text>
      )}
      {iBlocked && (
        <View style={{}}>
          <Text style={{ fontSize: 22, textAlign: 'center' }}>
            You blocked this account
          </Text>
          <TouchableOpacity
            style={[styles.followButton, { width: 150 }]}
            onPress={() => {
              unblock();
            }}>
            <Text style={[styles.baseText, { color: 'black' }]}>
              Click to unblock
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {!audioRecorded && !blockedMe && !iBlocked && (
        <View
          style={{ flex: 0.2, justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity
            style={{
              height: 50,
              borderRadius: 25,
              width: '100%',
              paddingHorizontal: 30,
              alignItems: 'center',
              flexDirection: 'row',
              backgroundColor: '#ddd',
            }}
            onPressIn={startRecording}
            onPressOut={stopRecording}>
            {onRecord ? (
              <>
                <Mic />
                <Text style={{ marginLeft: 20 }}>Recording... {count}</Text>
              </>
            ) : (
              <>
                <Mic />
                <Text style={{ marginLeft: 20 }}>Press and hold to record</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {audioRecorded && (
        <View
          style={{ flex: 0.2, justifyContent: 'center', alignItems: 'center' }}>
          <View
            style={{
              height: 50,
              borderRadius: 25,
              paddingHorizontal: 30,
              flexDirection: 'row',
              backgroundColor: '#ddd',
              alignItems: 'center',
              justifyContent: 'space-around',
            }}>
            <TouchableOpacity onPress={dumpAudio}>
              <Feather name="trash-2" size={20} color="red" />
            </TouchableOpacity>
            <Text style={{ marginHorizontal: 25, fontWeight: '600' }}>
              Audio recorded
            </Text>
            <View
              style={{
                width: 35,
                height: 35,
                borderRadius: 30,
                backgroundColor: Colors.light.tint,
              }}>
              <TouchableOpacity
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 30,
                  paddingLeft: 7,
                  paddingTop: 8,
                }}
                onPress={sent}>
                <FontAwesome name="send" size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  function unblock() {
    user.unblock(myId, route.params?.id).then((res: any) => {
      setIBlocked(false);
    });
  }
};

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;
const styles = StyleSheet.create({
  container: {},
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
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
  baseText: {
    fontFamily: 'Montserrat',
    fontSize: 14,
    textAlign: 'center',
    opacity: 1,
    fontWeight: '500',
  },
});

export default SingleChat;
