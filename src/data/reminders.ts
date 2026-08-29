import * as Notifications from 'expo-notifications';

/**
 * Local due-date reminders only. Nothing is sent to the other person, and no
 * remote push is involved — the app has no backend and never registers for one.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/** Asks for notification permission at the moment a reminder is actually set — never at launch. */
export async function ensureNotificationPermission(): Promise<boolean> {
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  } catch {
    return false;
  }
}

/**
 * Schedules one reminder and returns its identifier so the entry can cancel it
 * later. Returns undefined if permission was refused or the date has passed.
 */
export async function scheduleDueReminder(
  title: string,
  body: string,
  dueDate: Date,
): Promise<string | undefined> {
  if (dueDate.getTime() <= Date.now()) return undefined;
  if (!(await ensureNotificationPermission())) return undefined;
  try {
    return await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: dueDate },
    });
  } catch {
    return undefined;
  }
}
