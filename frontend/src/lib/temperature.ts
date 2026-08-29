// Meteorological cold -> hot encoding, shared by the index scale and the cards
// so a given station reads as one colour everywhere it appears.

export const TEMP_MIN = -10;
export const TEMP_MAX = 40;

export const GRADIENT_CSS =
  'linear-gradient(90deg, #2f6ba8 0%, #4ea0c6 28%, #57ac82 52%, #d69b3c 78%, #bc4e38 100%)';

type Stop = { at: number; rgb: [number, number, number] };

const STOPS: Stop[] = [
  { at: 0, rgb: [47, 107, 168] },
  { at: 0.28, rgb: [78, 160, 198] },
  { at: 0.52, rgb: [87, 172, 130] },
  { at: 0.78, rgb: [214, 155, 60] },
  { at: 1, rgb: [188, 78, 56] },
];

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export function tempFraction(celsius: number): number {
  return clamp01((celsius - TEMP_MIN) / (TEMP_MAX - TEMP_MIN));
}

export function temperatureColor(celsius: number): string {
  const f = tempFraction(celsius);
  let lower = STOPS[0];
  let upper = STOPS[STOPS.length - 1];

  for (let i = 0; i < STOPS.length - 1; i += 1) {
    if (f >= STOPS[i].at && f <= STOPS[i + 1].at) {
      lower = STOPS[i];
      upper = STOPS[i + 1];
      break;
    }
  }

  const span = upper.at - lower.at || 1;
  const t = (f - lower.at) / span;
  const channel = (a: number, b: number) => Math.round(a + (b - a) * t);

  return `rgb(${channel(lower.rgb[0], upper.rgb[0])}, ${channel(
    lower.rgb[1],
    upper.rgb[1],
  )}, ${channel(lower.rgb[2], upper.rgb[2])})`;
}
