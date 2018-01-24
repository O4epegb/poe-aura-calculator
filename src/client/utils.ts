import { Big } from 'big.js';

export function getInitialState() {
    return window.__INITIAL_STATE__ as {};
}

export function add(first: number, ...rest: Array<number>) {
    const bigResult = rest.reduce((acc, item) => acc.plus(item), Big(first));
    return Number(bigResult.toFixed(4));
}

export function mul(first: number, ...rest: Array<number>) {
    const bigResult = rest.reduce((acc, item) => acc.times(item), Big(first));
    return Number(bigResult.toFixed(4));
}

export function minus(first: number, ...rest: Array<number>) {
    const bigResult = rest.reduce((acc, item) => acc.minus(item), Big(first));
    return Number(bigResult.toFixed(4));
}

export function div(first: number, ...rest: Array<number>) {
    const bigResult = rest.reduce((acc, item) => acc.div(item), Big(first));
    return Number(bigResult.toFixed(4));
}
