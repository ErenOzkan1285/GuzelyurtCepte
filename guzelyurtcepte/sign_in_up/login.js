import React, { useState } from 'react';
import { StyleSheet, Pressable, TextInput, Image, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../assets/images/guzelyurtcepte_logo.png')}
          style={styles.logo}
          resizeMode="stretch"
        />
      </View>
      <View style={styles.footer}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Login</Text>
        </View>
        <View>
          <TextInput
            placeholder="Email"
            placeholderTextColor="#AEAEAE"
            style={styles.inputContainer}
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            placeholder="Password"
            secureTextEntry
            placeholderTextColor="#AEAEAE"
            style={styles.inputContainer}
            value={password}
            onChangeText={setPassword}
          />
        </View>
        <View style={styles.buttonOuterContainer}>
          <Pressable
            style={styles.buttonInnerContainer}
            android_ripple={{ color: '#fff' }}
            onPress={() => {/* handle login */ }}
          >
            <Text style={styles.buttonText}>Login</Text>
          </Pressable>
        </View>
        <View style={styles.buttonOuterContainer}>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={styles.link}>Don't you have an account? Click here to Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flex: 1.5,
    backgroundColor: '#3b3b3b',
    borderTopLeftRadius: 100,
    elevation: 20,
  },
  logo: {
    alignSelf: 'center',
    width: 300,
    height: 300,
    borderRadius: 20,
  },
  titleContainer: {
    backgroundColor: '#fff',
    borderRadius: 30,
    marginHorizontal: 100,
    marginVertical: 50,
    elevation: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b3b3b',
    textAlign: 'center',
    padding: 10,
  },
  inputContainer: {
    color: '#000',
    borderColor: '#fff',
    marginHorizontal: 30,
    marginTop: 10,
    marginBottom: 25,
    height: 60,
    borderWidth: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    elevation: 6,
    fontSize: 18,
    paddingHorizontal: 20,
  },
  buttonOuterContainer: {
    borderRadius: 28,
    marginHorizontal: 40,
    marginVertical: 5,
    overflow: 'hidden',
  },
  buttonInnerContainer: {
    backgroundColor: '#328E6E',
    paddingVertical: 8,
  },
  buttonText: {
    color: '#eff3fa',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 20,
  },
  link: { marginTop: 15, textAlign: 'center', color: '#fff' },
});