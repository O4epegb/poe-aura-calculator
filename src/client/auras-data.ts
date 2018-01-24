export const clarityReservationPerLevel = [
    0,
    34,
    48,
    61,
    76,
    89,
    102,
    115,
    129,
    141,
    154,
    166,
    178,
    190,
    203,
    214,
    227,
    239,
    251,
    265,
    279,
    293,
    303,
    313,
    323,
    333,
    343,
    353,
    363,
    373,
    383,
    383
];

export const bloodMagicValuesPerLevel = [
    1.0,
    2.45,
    2.42,
    2.39,
    2.37,
    2.34,
    2.32,
    2.29,
    2.26,
    2.24,
    2.21,
    2.18,
    2.16,
    2.13,
    2.11,
    2.08,
    2.05,
    2.03,
    2.0,
    1.97,
    1.96,
    1.93,
    1.9,
    1.87,
    1.84,
    1.81,
    1.78,
    1.75,
    1.72,
    1.69,
    1.66
];

export const enlightenValuesPerLevel = buildValues(1, 0.04, 10);

function buildValues(
    startingValue: number,
    decreaseBy: number,
    totalLevels: number
): Array<number> {
    const values = [startingValue];

    for (let i = 0; i < totalLevels; i++) {
        values.push(startingValue - decreaseBy * i);
    }

    return values;
}
