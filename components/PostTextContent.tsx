import React, { useCallback, useState } from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function (props: any) {
  const [textShown, setTextShown] = useState(false); //To show ur remaining Text
  const [lengthMore, setLengthMore] = useState(false); //to show the "Read more & Less Line"
  const lines = 2;
  const toggleNumberOfLines = () => {
    //To toggle the show text or hide it
    setTextShown(!textShown);
  };

  const onTextLayout = useCallback((e) => {
    setLengthMore(e.nativeEvent.lines.length >= lines); //to check the text is more than 4 lines or not
    // console.log(e.nativeEvent);
  }, []);

  return (
    <View>
      <Text
        onTextLayout={onTextLayout}
        numberOfLines={textShown ? undefined : lines}
        style={{
          fontFamily: 'Montserrat',
          fontStyle: 'normal',
          fontWeight: '500',
          // fontSize: 12,
          lineHeight: 15,
          color: '#4F4F4F',
          marginRight: 30,
          width: 300,
        }}
      >
        {props.text}
      </Text>

      {lengthMore ? (
        <Text
          onPress={toggleNumberOfLines}
          style={{
            lineHeight: 15,
            marginTop: 10,
            fontWeight: '900',
            // fontSize: 12,
          }}
        >
          {textShown ? 'Read less' : 'Read more'}
        </Text>
      ) : null}
    </View>
  );
}
