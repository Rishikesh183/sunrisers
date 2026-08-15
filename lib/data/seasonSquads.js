import seasonSquads from '../../data/SeasonSquads.json';

export function getSeasonSquads() {
    return seasonSquads;
}

export function getSeasonYears() {
    return Object.keys(seasonSquads).map(Number).sort();
}

export function getSquadForYear(year) {
    return seasonSquads[String(year)] || [];
}
