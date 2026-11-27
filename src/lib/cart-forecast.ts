import {hashWords, random} from './geode-prediction.ts';
export const CART_SEASONS = ['spring', 'summer', 'autumn', 'winter'] as const;
export type CartSeason = typeof CART_SEASONS[number];
export type CartStart = {gameId: string; legacy: boolean; year: number; season: CartSeason; day: number};
const max = 2147483647;
const rules = [
 {label: 'Snowman Rarecrow', hash: 215490858, probability: .4, price: 4000, late: true},
 {label: 'Coffee Bean', hash: -2050093257, probability: .25, price: 2500, late: true},
 {label: 'Red Fez', hash: -527134828, probability: .1, price: 8000, late: false},
 {label: 'Retro Catalogue', hash: -1405208486, probability: .1, price: 110000, late: false},
] as const;

// Independent seeded offer slots from the PC 1.6 reference. No game item pools or art.
export function forecastCart(input: CartStart) {
 const seasonIndex = CART_SEASONS.indexOf(input.season);
 const gameId = Number(input.gameId);
 if (!/^\d{1,16}$/.test(input.gameId) || !Number.isSafeInteger(gameId) || gameId < 1
  || !Number.isInteger(input.year) || input.year < 1 || input.year > 100
  || seasonIndex < 0 || !Number.isInteger(input.day) || input.day < 1 || input.day > 28) {
  throw Error('Enter a numeric game ID, a year from 1–100, and a valid season and day.');
 }
 const first = (input.year - 1) * 112 + seasonIndex * 28 + input.day;
 return Array.from({length: 28}, (_, index) => first + index).filter(day => day % 7 === 5 || day % 7 === 0).map(absoluteDay => {
  const month = Math.floor((absoluteDay - 1) / 28);
  const offers = rules.filter(rule => {
   if (rule.late && month % 4 < 2) return false;
   const seed = input.legacy
    ? (rule.hash % max + gameId % max + absoluteDay) % max
    : hashWords(rule.hash % max, gameId % max, absoluteDay);
   return random(seed)() < rule.probability;
  }).map(({label, price}) => ({label, price}));
  return {absoluteDay, weekday: absoluteDay % 7 === 5 ? 'Friday' : 'Sunday',
   day: (absoluteDay - 1) % 28 + 1, season: CART_SEASONS[month % 4], year: 1 + Math.floor((absoluteDay - 1) / 112), offers};
 });
}
