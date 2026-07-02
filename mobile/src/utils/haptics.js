let Haptics;
try { Haptics = require("expo-haptics"); } catch {}

const noop = () => {};

export const lightImpact = () => {
  if (!Haptics) return;
  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
};

export const mediumImpact = () => {
  if (!Haptics) return;
  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
};

export const heavyImpact = () => {
  if (!Haptics) return;
  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch {}
};

export const successNotification = () => {
  if (!Haptics) return;
  try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
};

export const errorNotification = () => {
  if (!Haptics) return;
  try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
};

export const selectionFeedback = () => {
  if (!Haptics) return;
  try { Haptics.selectionAsync(); } catch {}
};
