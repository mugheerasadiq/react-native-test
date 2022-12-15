import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  AsyncStorage,
} from 'react-native';
import {
  Header,
  Text,
} from 'react-native-elements';
import { MaterialIcons } from '@expo/vector-icons';
import { ScrollView } from 'react-native-gesture-handler';
import User from '../classes/User';

const user = new User();

class DescriptionDetail extends React.Component {

  state = {
    posts: []
  };

  componentDidMount(){
    console.log("PROPS : "+JSON.stringify(this.props.route.params.description))
    //this.setState(this.props.description)
    this.setState({posts: []})
      AsyncStorage.getItem('hashId').then((loginUserId) => {
        AsyncStorage.getItem('accessToken').then((token: any) => {
          (async () => {
            const userData = await user.getUser(loginUserId, token);
            const blockList = userData.data.data.blockedBy.concat(
              userData.data.data.blocked
            ); // includes ids of those who blocked me & whom I blocked
            user
              .getAllPosts(token)
              .then((res: any) => {
                let arr: any = [];
                res.data.data.map((item: any) => {
                  if (!blockList.includes(item.userId._id)) {
                    if (item.status == 'public') {
                      arr.push({
                        id: item._id,
                        postAuthor: item.userId.name,
                        userId: item.userId._id,
                        profilePhoto: item.userId.profilePhoto,
                        userCaption: item.description,
                        timePassed: user.calculatePostTime(item.createdAt),
                        likes: item.likes.length,
                        numOfComments: item.comments.length,
                        likedFromUser: item.likes.includes(loginUserId),
                        currentTime: '0:00',
                        totalTime: item.duration,
                        comments: item.comments,
                        thumbnail: item.thumbnail,
                        follower: item.userId.followers.includes(loginUserId),
                        audioClip: item.audioClip,
                        allowComments : item.allowComments
                      });
                    }
                  }
                });
                this.setState({posts: arr});
              })
              .catch((err) => {
                console.log(err);
              });
          })();
        });
      });
  }

  hashtagit = (caption: string) => {
    const message = [];
    const words = caption.split(' ');
    for (let i = 0; i < words.length; i++) {
      if (words[i].startsWith('#')) {
        message.push(
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate('HashtagPage', {
              hashtagTitle: words[i],
              posts: this.state.posts,
            })}>
            <Text style={styles.hashtag}>{words[i]}</Text>
          </TouchableOpacity>
        );
      }
      else if (words[i].startsWith('@')) {
        message.push(
          <TouchableOpacity
            onPress={()=>{user.toProfile(this.props.navigation, words[i])}}>
            <Text style={styles.hashtag}>
              {words[i]}
            </Text>
          </TouchableOpacity>
        );
      } else {
        message.push(' ' + words[i]);
      }
    }
    return message;
  };

  handleBack = () => {
    this.props.navigation.goBack();
  };

  render() {
    return (
      <ScrollView style={{flex:1, backgroundColor:'#fff'}}>
        <View style={styles.container}>
          <View style={{ marginTop: 30, marginBottom: 30 }}>
            <Header
              style={styles.headerStyle}
              placement="left"
              leftComponent={
                <MaterialIcons
                  className="setting-icon"
                  name="arrow-back"
                  size={30}
                  color="#4F4F4F"
                  onPress={this.handleBack}
                />
              }
              centerComponent={{
                text: 'Description',
                style: { fontSize: 24, fontWeight: 'bold', color: '#4F4F4F' }
              }}
              centerContainerStyle={styles.headerStyle}
              backgroundColor="#fff"
            />
          </View>
        </View>

        <View style={{flex:1, backgroundColor:'#fff'}}>
              <Text style={{fontSize:16, margin:16,}}>
                {this.hashtagit(this.props.route.params.description)}
              </Text>
          </View>

      </ScrollView>
    );
  }
}

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    // height: height,
    width: width,
    display: 'flex',
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  headerStyle: {
    width: width,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hashtag: {
    color: '#D2AE9A',
    fontWeight: '500',
    fontSize:12,
    //lineHeight: 15,
  },
});

export default DescriptionDetail;
