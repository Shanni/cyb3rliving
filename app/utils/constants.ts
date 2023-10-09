export const DEFAULT_COORDINATES = {
  lat: 49.24,
  lng: -123.12,
} as const;

export const PAYPAL_BASE_URL = "https://api-m.sandbox.paypal.com";

export const GRACE_PERIOD = 24 * 60 * 60 * 1000; // 1 day

export const DEFAULT_QUESTIONS = [
  "Where are you from?",
  "What do you do for work?",
  "Provide your GitHub profile link",
  "Do you have any pets?",
];
