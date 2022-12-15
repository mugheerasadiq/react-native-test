import React, { useRef } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import RBSheet from 'react-native-raw-bottom-sheet';
import HomePageButtonImage from './HomePageButtonImage';
import CloseButton from './CloseButton';
import DuetOptionPopUp from './DuetOptionPopUp';
import AsyncStorage from '@react-native-async-storage/async-storage';
import User from '../classes/User';
const user = new User();

export default function HomePagePopUp({
  refRBSheet,
  close,
  allowDelete,
  postId,
  posts,
  setPosts
}: any) {
  interface ref3 {
    current: any;
  }
  const ref2RBSheet: ref3 = useRef(null);
  return (
    <RBSheet
      ref={refRBSheet}
      closeOnDragDown={false}
      closeOnPressMask={true}
      customStyles={{
        container: {
          backgroundColor: 'transparent',
        },
        wrapper: {
          backgroundColor: 'transparent',
        },
      }}
      height={allowDelete ? 320 : 260}>
      <BlurView intensity={100} style={[StyleSheet.absoluteFill, styles.theme]}>
        <View style={styles.theme}>
          <View style={styles.close}>
            <CloseButton onPress={close} />
          </View>
          <HomePageButtonImage
            title={'Duet'}
            imgSource={require('../assets/images/duet.png')}
            onPress={() => ref2RBSheet.current.open()}
          />
          <HomePageButtonImage
            title={'Share'}
            imgSource={require('../assets/images/share.png')}
          />
          <HomePageButtonImage
            title={'Save'}
            imgSource={require('../assets/images/save.png')}
          />
          <HomePageButtonImage
            title={'Report'}
            imgSource={require('../assets/images/report.png')}
          />
          {allowDelete && (
            <HomePageButtonImage
              title={'Delete'}
              imgSource={require('../assets/images/delete.png')}
              onPress={() => {
                Alert.alert('You want to delete the post?', '', [
                  {
                    text: 'Delete',
                    onPress: async () => {
                      try {
                        const token = await AsyncStorage.getItem('accessToken');
                        await user.deletePost(postId, token);
                        close()
                        setPosts(posts.filter((e:any)=>e.id != postId))
                        Alert.alert('Post deleted!')
                      } catch (error) {
                        console.log(error.response.data);
                      }
                    },
                  },
                  {
                    text: 'Cancel',
                  },
                ]);
              }}
            />
          )}
          <DuetOptionPopUp
            ref2RBSheet={ref2RBSheet}
            close={() => ref2RBSheet.current.close()}
          />
        </View>
      </BlurView>
    </RBSheet>
  );
}

const styles = StyleSheet.create({
  theme: {
    height: '100%',
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
  },
  close: {
    alignItems: 'flex-end',
    paddingTop: 15,
    paddingRight: 15,
  },
});
