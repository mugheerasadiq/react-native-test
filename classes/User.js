var axios = require('axios');
var qs = require('qs');
import AsyncStorage from '@react-native-async-storage/async-storage';
const api = require('../api.json');
const search_user_url = api.search_user;
const get_hashtag_posts_url = api.get_hashtag_posts;
const get_post_comments_url = api.get_post_comments;
const get_all_posts_url = api.get_all_posts;
const get_followers_url = api.get_followers;
const update_user_url = api.update_user;
const send_code_url = api.send_code;
const recover_password_url = api.recover_password;
const initiate_url = api.initiate;
const mute_url = api.mute;
const unmute_url = api.unmute;
const delete_url = api.delete;
const get_deleted_chat_object_url = api.get_deleted_chat_object;
const block_url = api.block;
const unblock_url = api.unblock;
const get_user_by_id_url = api.get_user_by_id;
const search_user_for_chats_url = api.search_user_for_chats;
const get_friends_url = api.get_friends;
const get_user_by_username_url = api.get_user_by_username;
const delete_post_url = api.delete_post;
const update_bio_url = api.update_bio;

class User {
  calculateTime = (updateDate) => {
    let message = '';
    updateDate = new Date(updateDate);
    const currDate = new Date();
    const diffTime = Math.abs(updateDate - currDate) / 60000;
    let minutes = parseFloat(diffTime).toFixed(0);
    if (minutes < 60) {
      if (minutes < 2) {
        message = minutes + ' minute ago';
      } else {
        message = minutes + ' minutes ago';
      }
    } else {
      let hours = minutes / 60;
      if (hours < 24) {
        hours = parseFloat(hours).toFixed(0);
        if (hours < 2) {
          message = hours + ' hour ago';
        } else {
          message = hours + ' hours ago';
        }
      } else {
        let days = hours / 24;
        days = parseFloat(days).toFixed(0);
        if (days < 2) {
          message = days + ' day ago';
        } else {
          message = days + ' days ago';
        }
      }
    }

    return message;
  };

  calculatePostTime = (updateDate) => {
    let message = '';
    updateDate = new Date(updateDate);
    const currDate = new Date();
    const diffTime = Math.abs(updateDate - currDate) / 60000;
    let minutes = parseFloat(diffTime).toFixed(0);
    if (minutes < 60) {
      message = minutes + 'm';
    } else {
      let hours = minutes / 60;
      if (hours < 24) {
        hours = parseFloat(hours).toFixed(0);
        message = hours + 'h';
      } else {
        let days = hours / 24;
        days = parseFloat(days).toFixed(0);
        message = days + 'd';
      }
    }

    return message;
  };

  calculateCommentTime = (updateDate) => {
    let message = '';
    updateDate = new Date(updateDate);
    const currDate = new Date();
    const diffTime = Math.abs(updateDate - currDate) / 60000;
    let minutes = parseFloat(diffTime).toFixed(0);
    if (minutes < 60) {
      message = minutes + ' min';
    } else {
      let hours = minutes / 60;
      if (hours < 24) {
        hours = parseFloat(hours).toFixed(0);
        message = hours + ' hour';
      } else {
        let days = hours / 24;
        days = parseFloat(days).toFixed(0);
        message = days + ' day';
      }
    }

    return message;
  };

  findUsers = (keyword, id) => {
    var config = {
      method: 'get',
      url: search_user_url + keyword + '/' + id + '/' + Math.random(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    return axios(config);
  };

  findUsersForChats = (keyword, id) => {
    var config = {
      method: 'get',
      url: search_user_for_chats_url + keyword + '/' + id,
    };

    return axios(config);
  };

  mute = (roomId, userId) => {
    var config = {
      method: 'patch',
      url: mute_url + roomId,
      data: {
        userId: userId,
      },
    };

    return axios(config);
  };

  unmute = (roomId, userId) => {
    var config = {
      method: 'patch',
      url: unmute_url + roomId,
      data: {
        userId: userId,
      },
    };

    return axios(config);
  };

  deleteChat = (roomId, userId) => {
    var config = {
      method: 'patch',
      url: delete_url + roomId,
      data: {
        userId: userId,
      },
    };

    return axios(config);
  };

  getDeletedChatObj = (roomId, userId) => {
    var config = {
      method: 'patch',
      url: get_deleted_chat_object_url + roomId,
      data: {
        userId: userId,
      },
    };
    return axios(config);
  };

  block = (myId, otherId) => {
    var config = {
      method: 'patch',
      url: block_url + myId + '/' + otherId,
    };

    return axios(config);
  };

  unblock = (myId, otherId) => {
    var config = {
      method: 'patch',
      url: unblock_url + myId + '/' + otherId,
    };

    return axios(config);
  };

  getHashtagPosts = (hashtag, token) => {
    var config = {
      method: 'get',
      url: get_hashtag_posts_url + hashtag,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        authorization: token,
      },
    };

    return axios(config);
  };

  getPostComments = (postId, token) => {
    var config = {
      method: 'get',
      url: get_post_comments_url + postId,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        authorization: token,
      },
    };

    return axios(config);
  };

  getAllPosts = (token) => {
    var config = {
      method: 'get',
      url: get_all_posts_url,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        authorization: token,
      },
    };

    return axios(config);
  };

  getFollowers = (userId, token) => {
    var config = {
      method: 'get',
      url: get_followers_url + userId,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        authorization: token,
      },
    };

    return axios(config);
  };

  updateUsername = (username, auth) => {
    var data = qs.stringify({
      username: username,
    });
    var config = {
      method: 'patch',
      url: update_user_url,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        authorization: auth,
      },
      data: data,
    };
    return axios(config);
  };

  updateDisplayName = (displayName, auth) => {
    var data = qs.stringify({
      displayname: displayName,
    });
    var config = {
      method: 'patch',
      url: update_user_url,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        authorization: auth,
      },
      data: data,
    };
    return axios(config);
  };

  send_email = (email) => {
    var config = {
      method: 'get',
      url: send_code_url + email,
    };

    return axios(config);
  };

  getUser = (id, auth) => {
    var config = {
      method: 'get',
      url: get_user_by_id_url + id,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        authorization: auth,
      },
    };

    return axios(config);
  };

  getUserByUsername = (username) => {
    var config = {
      method: 'get',
      url: get_user_by_username_url + username,
    };

    return axios(config);
  };

  recoverPassword(email, newPassword) {
    var data = qs.stringify({ email: email, newPassword: newPassword });
    var config = {
      method: 'put',
      url: recover_password_url,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: data,
    };

    return axios(config);
  }

  initiate(data, userOneId) {
    var config = {
      method: 'post',
      url: initiate_url + userOneId,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: data,
    };

    return axios(config);
  }

  getFriends(id) {
    var config = {
      method: 'get',
      url: get_friends_url + id,
    };

    return axios(config);
  }

  async toProfile(navigation, word) {
    const res = await this.getUserByUsername(word.slice(1));
    const myId = await AsyncStorage.getItem('hashId');
    const userData = res.data?.data;
    if (String(userData?._id) == String(myId)) {
      navigation.navigate('Profile');
    } else {
      if (!userData?.blocked.includes(myId)) {
        navigation.navigate('OthersProfile', {
          following: userData?.followers.includes(myId),
          _id: userData?._id,
          blocked: userData?.blockedBy.includes(myId),
        });
      } else {
        alert('User not found');
      }
    }
  }

  deletePost(postId, token) {
    var config = {
      method: 'delete',
      url: delete_post_url + postId,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        authorization: token,
      },
    };

    return axios(config);
  }

  updateBio(token, formData) {
    var config = {
      method: 'patch',
      url: update_bio_url,
      headers: {
        'Content-Type': 'multipart/form-data',
        authorization: token,
      },
      data: formData,
    };

    return axios(config);
  }
}
export default User;
