
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';


export async function registerForPushNotificationAsync() {

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Only ask if permissions have not already been determined, because
    // iOS won't necessarily prompt the user a second time.
    if (existingStatus !== 'granted') {
      // Android remote notification permissions are granted during the app
      // install, so this will only ask on iOS.
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // Stop here if the user did not grant permissions
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId) {
      alert('Project ID not found. Push notifications will not work.');
      return;
    }

    try {
      // Get the token that uniquely identifies this device
      const token = (await Notifications.getExpoPushTokenAsync()).data;

      // If using Firebase, make sure to add the token to your database
      console.log(token);

      return token;

    } catch (error) {
      console.error('Error getting a token', error);
      alert('Error getting a token for push notification!');
      return;
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }
}