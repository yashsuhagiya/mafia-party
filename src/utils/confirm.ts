import { Alert, Platform } from 'react-native';

// react-native-web's Alert.alert is a no-op; use the browser dialogs there.
export function confirm(
	title: string,
	message: string,
	confirmLabel: string,
	onConfirm: () => void,
	destructive = false,
) {
	if (Platform.OS === 'web') {
		if (window.confirm(`${title}\n\n${message}`)) onConfirm();
		return;
	}
	Alert.alert(title, message, [
		{ text: 'Cancel', style: 'cancel' },
		{
			text: confirmLabel,
			style: destructive ? 'destructive' : 'default',
			onPress: onConfirm,
		},
	]);
}

export function notify(title: string, message: string) {
	if (Platform.OS === 'web') window.alert(`${title}\n\n${message}`);
	else Alert.alert(title, message);
}
