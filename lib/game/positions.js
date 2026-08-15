export const SLOT_LABELS = {
    1: 'Opener',
    2: 'Opener',
    3: 'One-down',
    4: 'Middle order',
    5: 'Middle order',
    6: 'Finisher',
    7: 'Finisher',
    8: 'Bowling all-rounder',
    9: 'Bowler',
    10: 'Bowler',
    11: 'Bowler',
};

export const TOTAL_SLOTS = 11;

export function slotLabel(slot) {
    return SLOT_LABELS[slot] || `Slot ${slot}`;
}

export function eligibleEmptySlots(player, filledSlots) {
    return player.slots.filter((slot) => !filledSlots.has(slot));
}

export function isPlayerPickable(player, filledSlots) {
    return eligibleEmptySlots(player, filledSlots).length > 0;
}
