import {hashWords, random} from './geode-prediction.ts';
export const CART_SEASONS = ['spring', 'summer', 'autumn', 'winter'] as const;
export type CartSeason = typeof CART_SEASONS[number];
export type CartStart = {gameId: string; legacy: boolean; year: number; season: CartSeason; day: number; routeComplete?: boolean; communityCenterComplete?: boolean; jojaComplete?: boolean; includeNightMarket?: boolean; desertFestivalUnlocked?: boolean};
const max = 2147483647;
type Offer = {label: string; hash: number; probability: number; price: number; late?: boolean; routeComplete?: boolean; communityCenterOnly?: boolean; earliestDay?: number};
const rules: readonly Offer[] = [
 {label: 'Snowman Rarecrow', hash: 215490858, probability: .4, price: 4000, late: true},
 {label: 'Coffee Bean', hash: -2050093257, probability: .25, price: 2500, late: true},
 {label: 'Red Fez', hash: -527134828, probability: .1, price: 8000, late: false},
 {label: 'Retro Catalogue', hash: -1405208486, probability: .1, price: 110000},
 {label: 'Joja Catalogue', hash: -1741923356, probability: .1, price: 30000, communityCenterOnly: true},
 {label: 'Junimo Catalogue', hash: 1000809870, probability: .1, price: 70000, routeComplete: true},
 {label: 'Tea Set', hash: -1863931622, probability: .05, price: 1000000, earliestDay: 2689},
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
 return Array.from({length: 28}, (_, index) => first + index).filter(day => { const y=(day-1)%112+1; return day%7===5||day%7===0||!!input.includeNightMarket&&y>=99&&y<=101||!!input.desertFestivalUnlocked&&y>=15&&y<=17; }).map(absoluteDay => {
  const month = Math.floor((absoluteDay - 1) / 28);
  const y=(absoluteDay-1)%112+1;
  const venue=y>=99&&y<=101?'Night Market':y>=15&&y<=17?'Desert Festival':'Forest Cart';
  const offers = rules.filter(rule => {
   if ((rule.late && month % 4 < 2) || (rule.communityCenterOnly && !input.communityCenterComplete) || (rule.routeComplete && !input.routeComplete && !input.communityCenterComplete && !input.jojaComplete) || absoluteDay < (rule.earliestDay ?? 1)) return false;
   const seed = input.legacy
    ? (rule.hash % max + gameId % max + absoluteDay) % max
    : hashWords(rule.hash % max, gameId % max, absoluteDay);
   return random(seed)() < rule.probability;
  }).map(({label, price}) => ({label, price}));
  return {absoluteDay, venue, weekday: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][absoluteDay%7],
   day: (absoluteDay - 1) % 28 + 1, season: CART_SEASONS[month % 4], year: 1 + Math.floor((absoluteDay - 1) / 112), offers};
 });
}
