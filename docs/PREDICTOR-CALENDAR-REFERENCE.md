# Seeded calendar reference (PC 1.6.15)

This extension covers train arrival candidates, the once-per-summer green-rain day, the baseline nightly farm-event roll, and the windstorm candidate roll. It uses the existing local signed xxHash and .NET RNG implementation. The public site uses example IDs; the private workspace accepts a numeric game ID or reads the main save locally. No network request or storage of the ID is needed; exported results omit it.

## Evidence

- MIT reference: https://github.com/MouseyPounds/stardew-predictor/blob/master/stardew-predictor.js (blob f84c2b30a32a04c3485ddabfba2be57cb0cde596, predictTrains/predictNight/predictGreenRain logic). Existing attribution at /licenses/mouseypounds.txt.
- https://stardewvalleywiki.com/Railroad
- https://stardewvalleywiki.com/Weather
- https://stardewvalleywiki.com/Random_Events
- Four independent synthetic vector sets: game ID 123456789, summer Y1, modern/legacy RNG, greenhouse repaired/unrepaired. Calculated using libxxhash XXH32 and independent Python implementation of .NET subtractive RNG. See tests/event-calendar.test.ts. Not real game fixtures.

## Limits

PC 1.6.15 reference only. No train cargo, full weather forecast, prior event history, Fairy Rose bonus, scripted events, valid placement, actual windstorm triggering, mods, multiplayer day-offset anomalies or post-reload suppression. Greenhouse state is fixed during the window, and changes RNG consumption. Overnight candidate appears against the preceding day. Positive candidate is not a promise that the game event happens. No change to release approvals.
