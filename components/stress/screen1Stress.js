import React, { Component } from "react";
import {
  Button,
  Image,
  StyleSheet,
  Text,
  View,
  Alert,
  ProgressBarAndroid,
  Dimensions,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import {Audio} from 'expo-av'

export default class screen1Stress extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isPlaying: false
        }
        
    }
    async componentDidMount() {
        try {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
            playsInSilentModeIOS: true,
            interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
            shouldDuckAndroid: true,
            staysActiveInBackground: true,
            playThroughEarpieceAndroid: true
          })
     
          this.loadAudio()
        } catch (e) {
          console.log(e)
        }
      }
      async loadAudio() {
        const {currentIndex, isPlaying, volume} = this.state
       
        try {
          const playbackInstance = new Audio.Sound()
          const source = require('./Beach-ambience.mp3')
       
          const status = {
            shouldPlay: isPlaying,
            volume
          }
       
          playbackInstance.setOnPlaybackStatusUpdate(this.onPlaybackStatusUpdate)     
          await playbackInstance.loadAsync(source, status, false)
          this.setState({playbackInstance})
          } catch (e) {
            console.log(e)
          }
      }
       
      onPlaybackStatusUpdate = status => {
        this.setState({
          isBuffering: status.isBuffering
        })
      }
      handlePlayPause = async () => {
        const { isPlaying, playbackInstance } = this.state
        isPlaying ? await playbackInstance.pauseAsync() : await playbackInstance.playAsync()
     
        this.setState({
          isPlaying: !isPlaying
        })
      }

  //layout of the page
  render() {
    return (
      <View style={styles.container}>
        <View style={{height: height, width: width, marginTop: height*0.3, borderRadius: 40, backgroundColor: '#FFF'}}>
            <Text style={{margin: 20, fontSize: 20, marginTop: 100}}>
                Close your eyes and imagine yourself on a Beach. You are sipping on your orange juice which 
                you still don't know how you got it on the island!
            </Text>
            <Image source={require('./beach.jpeg')} style={{height: 200, width: 250, alignSelf: 'center'}}/>
            <View style={{flex: 1, flexDirection: 'row', width: width, alignItems: 'center', justifyContent: 'center', marginTop: -10}}>
                
                <TouchableOpacity>
                    {
                        this.state.isPlaying ? (
                            <Ionicons name='ios-pause' size={100} color='#90EE90' style={{opacity: 1}} onPress={() => this.handlePlayPause()}/>
                        ) : (
                            <Ionicons name='ios-play-circle' size={100} color='#90EE90' style={{opacity: 1}} onPress={() => this.handlePlayPause()}/>
                        )
                    }
                    
                </TouchableOpacity>
            </View>
            <Ionicons onPress={() => console.log("pressed")}
            name='ios-redo' size={35} style={{marginBottom: 120, alignSelf: 'flex-end', marginEnd: 20, color: '#90EE90'}}/>
        </View>

      </View>
    );
  }
}

const { height, width } = Dimensions.get("window");

//stylesheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#90EE90", 
    opacity: 0.7,
    alignItems: "center",
    justifyContent: "center",
  }
});