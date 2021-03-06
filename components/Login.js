import React, { Component } from "react";
import {
  Button,
  Image,
  Platform,
  NativeModules,
  StyleSheet,
  Text,
  View,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Dimensions,
  ScrollView,
} from "react-native";
import logo from "./assets/logo.png";
import GoogleIcon from './assets/GoogleIcon.png'
import { TouchableOpacity } from "react-native-gesture-handler";
import * as firebase from "firebase";
import FireBase from "./config/FireBase";
import * as Google from "expo-google-app-auth";
import { user } from "firebase-functions/lib/providers/auth";


export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      isLoadingComplete: false,
    };
  }
  //function for logging user in
  loginAction = () => {
    firebase
      .auth()
      .signInWithEmailAndPassword(this.state.email, this.state.password)
      .then(() => {
        console.log("user signed in!");
        this.props.navigation.navigate("main");
      })
      .catch((error) => {
        if (error.code === "auth/email-already-in-use") {
          Alert.alert(
            "This email already exists. Use a different email or reigster a new email."
          );
        } else if (error.code === "auth/invalid-email") {
          Alert.alert(
            "This email address is invalid. Try again using a different one"
          );
        } else if (error.code === "auth/user-not-found") {
          Alert.alert("This account does not exist. Please register.");
        } else {
          Alert.alert("Email or password is wrong.");
        }
      });
  };

  componentDidMount() {
    if (!firebase.apps.length) {
      //initialize firebase
      firebase.initializeApp(FireBase.config);
    }
  }
  isUserEqual = (googleUser, firebaseUser) => {
    if (firebaseUser) {
      var providerData = firebaseUser.providerData;
      for (var i = 0; i < providerData.length; i++) {
        if (
          providerData[i].providerId ===
            firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
          providerData[i].uid === googleUser.getBasicProfile().getId()
        ) {
          // We don't need to reauth the Firebase connection.
          return true;
        }
      }
    }
    return false;
  };

  signIn() {
    var provider = new firebase.auth.GoogleAuthProvider();

    firebase
      .auth()
      .signInWithPopup(provider)
      .then(function (result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        console.log("user signed in");
        // ...
      })
      .catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
        console.log(error);
      });
  }

  onSignIn = (googleUser) => {
    console.log("Google Auth Response", googleUser);
    // We need to register an Observer on Firebase Auth to make sure auth is initialized.
    var unsubscribe = firebase.auth().onAuthStateChanged(
      function (firebaseUser) {
        unsubscribe();
        // Check if we are already signed-in Firebase with the correct user.
        if (!this.isUserEqual(googleUser, firebaseUser)) {
          // Build Firebase credential with the Google ID token.
          var credential = firebase.auth.GoogleAuthProvider.credential(
            googleUser.idToken,
            googleUser.accessToken
          );
          // Sign in with credential from the Google user.
          firebase
            .auth()
            .signInAndRetrieveDataWithCredential(credential)
            .then(function (result) {
              // This gives you a Google Access Token. You can use it to access the Google API.
              var token = result.credential.accessToken;
              // The signed-in user info.
              var user = result.user;
              console.log(user);
            }).then(() => this.props.navigation.navigate('main'))
            .catch(function (error) {
              // Handle Errors here.
              var errorCode = error.code;
              var errorMessage = error.message;
              // The email of the user's account used.
              var email = error.email;
              // The firebase.auth.AuthCredential type that was used.
              var credential = error.credential;
              console.log(error);
              // ...
            });
        } else {
          console.log("User already signed-in Firebase.");
        }
      }.bind(this)
    );
  };

  signInWithGoogleAsync = async () => {
    try {
      const result = await Google.logInAsync({
        expoClientID: 
        "146881575660-qsnmho05u28votpiph6ctp6d36aarv1q.apps.googleusercontent.com",
        androidClientId:
          "1093991806317-s9dlssevu70ugglemapno9agfklf6i3l.apps.googleusercontent.com",
        iosClientId:
          "1093991806317-ifo35ee4ad1iemia8tcdbvqj4t6skvq2.apps.googleusercontent.com", //enter ios client id
        androidStandaloneAppClientId:
          "1093991806317-s9dlssevu70ugglemapno9agfklf6i3l.apps.googleusercontent.com",
        scopes: ["profile", "email"],
      });

      if (result.type === "success") {
        this.onSignIn(result);
        return result.accessToken;
      } else {
        return { cancelled: true };
      }
    } catch (e) {
      console.log("couldn't sign in user");
    }
  };

  render() {
    return (
      <KeyboardAvoidingView style={styles.container}>
        
        <View style={{
          borderRadius: 30,
          height: height,
          width: width,
          opacity: 1,
          marginTop: height*0.4, 
          justifyContent: 'center', 
          alignContent: 'center', 
          backgroundColor: '#FFFCFC',}}>
            <Image style={{marginTop: -280, height: 250, width: 250, alignSelf: 'center'}}source={logo}/>
            <TextInput
            style={styles.Email}
            onChangeText={(email) => this.setState({ email })}
            placeholder="Email"
            placeholderTextColor="#2C2F33"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.password}
            secureTextEntry={true}
            onChangeText={(password) => this.setState({ password })}
            placeholder="Password"
            autoCapitalize="none"
            placeholderTextColor="#2C2F33"
          />
          <TouchableOpacity style={styles.Login} onPress={() => this.loginAction()}>
            <Text style={{fontSize: 22}}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
          onPress={() => this.signInWithGoogleAsync()}
          style={styles.buttonGPlusStyle}
          activeOpacity={0.5}>
          <Image
            source={GoogleIcon}
            style={styles.buttonImageIconStyle}
          />
          <View style={styles.buttonIconSeparatorStyle} />
          <Text style={styles.buttonTextStyle}>
            Sign In With Google
          </Text>
        </TouchableOpacity>
        <Text style={{marginTop: 20, alignSelf: 'center'}} 
        onPress={() => this.props.navigation.navigate("registerScreen")}>
          Don't have an account? Sign Up
        </Text>
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const { height, width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E55B46",
    opacity: 0.7,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonGPlusStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    padding: height * 0.016,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'transparent',
    elevation: 3,
    shadowColor: 'rgba(0,0,0, .4)', 
    shadowOffset: { height: 3, width: 3 }, 
    shadowOpacity: 3, 
    shadowRadius: 3, 
    width: width * 0.9,
    marginBottom: height*0.1
  },
  
  buttonTextStyle: {
    color: '#000000',
  },
  Email: {
    borderWidth: 0,
    color: "#000",
    borderBottomColor: "#606060",
    borderBottomWidth: height * 0.001,
    alignSelf: 'center',
    height: height * 0.05,
    width: width * 0.75,
  },
  buttonImageIconStyle: {
    padding: 10,
    margin: 5,
    height: 25,
    width: 25,
    resizeMode: 'stretch',
  },
  logo: {
    height: height * 0.5,
    width: width * 0.9,
  },
  password: {
    borderWidth: 0,
    color: "#000",
    borderBottomColor: "#606060",
    borderBottomWidth: height * 0.001,
    marginTop: height*0.03,
    marginBottom: height*0.1,
    alignSelf: 'center',
    height: height * 0.05,
    width: width * 0.75,
  },
  Login: {
    alignSelf: "center",
    alignItems: 'center',
    backgroundColor: '#E55B46',
    padding: height * 0.016,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'transparent',
    elevation: 3,
    shadowColor: 'rgba(0,0,0, .4)', 
    shadowOffset: { height: 3, width: 3 }, 
    shadowOpacity: 3, 
    shadowRadius: 3, 
    width: width * 0.9,
    marginBottom: 20
  },
  passwordReset1: {
    color: "#FFF",
    textAlign: "center",
    marginTop: height * 0.03,
    fontFamily: Platform.select({
      ios: () => "AppleSDGothicNeo-Thin",
      android: () => "sans-serif-thin",
    })(),
  },
  passwordReset2: {
    alignItems: "center",
    padding: height * 0.016,
    borderRadius: 10,
    borderWidth: 1,
    borderBottomColor: "#FFF",
    borderTopColor: "#FFF",
    borderRightColor: "#FFF",
    borderLeftColor: "#FFF",
    width: width * 0.9,
    marginTop: height * 0.03,
    fontFamily: Platform.select({
      ios: () => "AppleSDGothicNeo-Thin",
      android: () => "sans-serif-thin",
    })(),
  },
  Title: {
    color: "#FFF",
    fontSize: 15,
    fontFamily: Platform.select({
      ios: () => "AppleSDGothicNeo-Thin",
      android: () => "sans-serif-thin",
    })(),
    marginTop: -height * 0.1,
    textAlign: "center",
    justifyContent: "center",
  },
});
