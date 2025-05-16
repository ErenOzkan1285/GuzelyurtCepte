import React, { useState } from 'react';
import {
  StyleSheet,
  Pressable,
  TextInput,
  Image,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function SignUp() {
  const router = useRouter();

  // Form state'leri
  const [name, setName] = useState('');
  const [sname, setSname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // REGISTER İSTEĞİ
  const handleRegister = async () => {
    try {
      const res = await fetch('http://10.0.2.2:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          sname,
          phone,
          password
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        Alert.alert('Registration Failed', data.message || 'An error occurred');
        return;
      }

      Alert.alert('Success', 'User registered successfully!');
      router.replace('/login'); // login sayfasına yönlendir

    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/guzelyurtcepte_logo.png')}
          style={styles.logo}
          resizeMode="stretch"
        />
      </View>
      <View style={styles.footer}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Sign Up</Text>
        </View>
        <View>
          <TextInput
            placeholder="Name"
            placeholderTextColor="#AEAEAE"
            style={styles.inputContainer}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            placeholder="Surname"
            placeholderTextColor="#AEAEAE"
            style={styles.inputContainer}
            value={sname}
            onChangeText={setSname}
          />
          <TextInput
            placeholder="Email"
            placeholderTextColor="#AEAEAE"
            style={styles.inputContainer}
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            placeholder="Phone Number"
            placeholderTextColor="#AEAEAE"
            style={styles.inputContainer}
            value={phone}
            onChangeText={setPhone}
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
            onPress={handleRegister}
          >
            <Text style={styles.buttonText}>Register</Text>
          </Pressable>
        </View>
        <View style={styles.buttonOuterContainer}>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.link}>Already have an account? Click here to Login</Text>
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
    flex: 3,
    backgroundColor: '#3b3b3b',
    borderTopLeftRadius: 100,
    elevation: 20,
  },
  logo: {
    alignSelf: 'center',
    width: 200,
    height: 200,
    borderRadius: 20,
  },
  titleContainer: {
    backgroundColor: '#fff',
    borderRadius: 30,
    marginHorizontal: 100,
    marginVertical: 25,
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
    marginTop: 8,
    marginBottom: 10,
    height: 60,
    borderWidth: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    elevation: 6,
    fontSize: 14,
    padding: 10,
  },
  buttonOuterContainer: {
    borderRadius: 28,
    marginHorizontal: 40,
    marginVertical: 5,
    overflow: 'hidden',
  },
  buttonInnerContainer: {
    backgroundColor: '#3D90D7',
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
