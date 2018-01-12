import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Provider, observer, inject } from 'mobx-react';
import { Big } from 'big.js';

import '../../node_modules/normalize-css/normalize.css';
import './styles/_index.styl';

import { types } from 'mobx-state-tree';

// function add(first: number, ...rest: Array<number>) {
//     const bigResult = rest.reduce((acc, item) => acc.plus(item), Big(first));
//     return Number(bigResult.toPrecision(4).valueOf());
// }

function multiply(first: number, ...rest: Array<number>) {
    const bigResult = rest.reduce((acc, item) => acc.times(item), Big(first));
    return Number(bigResult.toPrecision(4).valueOf());
}

// function minus(first: number, ...rest: Array<number>) {
//     const bigResult = rest.reduce((acc, item) => acc.minus(item), Big(first));
//     return Number(bigResult.toPrecision(4).valueOf());
// }

function divide(first: number, ...rest: Array<number>) {
    const bigResult = rest.reduce((acc, item) => acc.div(item), Big(first));
    return Number(bigResult.toPrecision(4).valueOf());
}

const clarityReservationPerLevel = [
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

enum AuraNames {
    Clarity = 'Clarity',
    Blasphemy = 'Blasphemy'
}

const GenericAura = types
    .model({
        name: types.string,
        baseReservation: types.number,
        isChecked: types.boolean
    })
    .actions(self => {
        return {
            toggle() {
                self.isChecked = !self.isChecked;
            }
        };
    })
    .views(self => {
        return {
            totalReserved(multiplier = 1) {
                const value = self.isChecked ? self.baseReservation : 0;
                return multiply(value, multiplier);
            },
            reservationCost(multiplier = 1) {
                return multiply(self.baseReservation, multiplier);
            }
        };
    });

const Blasphemy = types
    .model({
        name: AuraNames.Blasphemy,
        reservationPerLevel: 35,
        numberOfCurses: types.number
    })
    .actions(self => {
        return {
            increase() {
                self.numberOfCurses = Math.min(self.numberOfCurses + 1, 7);
            },
            decrease() {
                self.numberOfCurses = Math.max(self.numberOfCurses - 1, 0);
            }
        };
    })
    .views(self => {
        return {
            totalReserved(multiplier = 1) {
                return multiply(
                    self.reservationPerLevel,
                    self.numberOfCurses,
                    multiplier
                );
            }
        };
    });

const Clarity = types
    .model({
        name: AuraNames.Clarity,
        lvl: types.number
    })
    .actions(self => {
        return {
            increase() {
                self.lvl = Math.min(self.lvl + 1, 30);
            },
            decrease() {
                self.lvl = Math.max(self.lvl - 1, 0);
            }
        };
    })
    .views(self => {
        return {
            totalReserved(multiplier = 1) {
                return multiply(
                    clarityReservationPerLevel[self.lvl],
                    multiplier
                );
            }
        };
    });

const BasicMultiplier = types
    .model({
        name: types.string,
        baseValue: types.number,
        isChecked: types.boolean,
        isBloodMagic: types.optional(types.boolean, false)
    })
    .actions(self => {
        return {
            toggle() {
                self.isChecked = !self.isChecked;
            }
        };
    })
    .views(self => {
        return {
            get value() {
                return self.isChecked ? self.baseValue : 1;
            },
            get percentBaseValue() {
                return multiply(self.baseValue, 100);
            }
        };
    });

const LeveledMultiplier = types
    .model({
        name: types.string,
        valuesArray: types.array(types.number),
        lvl: types.number,
        isBloodMagic: types.optional(types.boolean, false)
    })
    .actions(self => {
        return {
            increase() {
                self.lvl = Math.min(self.lvl + 1, self.valuesArray.length - 1);
            },
            decrease() {
                self.lvl = Math.max(self.lvl - 1, 0);
            }
        };
    })
    .views(self => {
        return {
            get value() {
                return self.lvl > 0 ? self.valuesArray[self.lvl] : 1;
            },
            get percentValue() {
                return multiply(self.valuesArray[self.lvl], 100);
            }
        };
    });

const StoreModel = types
    .model({
        auras: types.array(types.union(GenericAura, Blasphemy, Clarity)),
        mana: 1000,
        life: 5000,
        multipliers: types.array(
            types.union(BasicMultiplier, LeveledMultiplier)
        )
    })
    .actions(self => {
        return {
            changeMana(number: number) {
                self.mana = Math.min(number, 100000);
            },
            changeLife(number: number) {
                self.life = Math.min(number, 100000);
            }
        };
    })
    .views(self => {
        function totalPercentReserved() {
            const percentItems = self.auras.filter(item => !Clarity.is(item));
            return percentItems.reduce(
                (acc, item) => acc + item.totalReserved(),
                0
            );
        }

        function totalFlatReserved() {
            const flatItems = self.auras.filter(item => Clarity.is(item));

            return flatItems.reduce(
                (acc, item) => acc + item.totalReserved(),
                0
            );
        }

        function totalReservedByPercent(value: number) {
            return multiply(divide(value, 100), totalPercentReserved());
        }

        function totalMultiplier() {
            const multi = self.multipliers.reduce(
                (acc, item) => acc + item.value - 1,
                1
            );
            return multi;
        }

        function calculate(value: number) {
            return multiply(totalMultiplier(), value);
        }

        function isBloodMagic() {
            return self.multipliers.some(item => item.isBloodMagic);
        }

        return {
            get totalPercentReserved() {
                return calculate(totalPercentReserved());
            },
            get totalFlatReserved() {
                return calculate(totalFlatReserved());
            },
            get totalReservedByPercent() {
                return calculate(totalReservedByPercent(self.mana));
            },
            get totalReservedMana() {
                return isBloodMagic()
                    ? 0
                    : calculate(
                          totalReservedByPercent(self.mana) +
                              totalFlatReserved()
                      );
            },
            get totalReservedLife() {
                return isBloodMagic()
                    ? calculate(
                          totalReservedByPercent(self.life) +
                              totalFlatReserved()
                      )
                    : 0;
            },
            get totalMultiplier() {
                return totalMultiplier();
            },
            get isBloodMagic() {
                return isBloodMagic();
            }
        };
    });

const Store = StoreModel.create({
    auras: [
        ...[1, 2, 3, 4, 5].map(i => {
            return {
                name: `Aura ${i}`,
                baseReservation: i * 10,
                isChecked: false
            };
        }),
        {
            name: AuraNames.Clarity,
            lvl: 0
        },
        {
            name: AuraNames.Blasphemy,
            numberOfCurses: 0
        }
    ],
    multipliers: [
        {
            name: 'Empower',
            baseValue: 1.25,
            isChecked: false
        },
        {
            name: 'Enlighten',
            valuesArray: [1.0, 1.1, 1.2],
            lvl: 0
        },
        {
            name: 'Blood Magic',
            valuesArray: [1.0, 2.45, 2.42],
            lvl: 0
        }
    ]
});

@inject('store')
@observer
class AppComponent extends React.Component<
    {
        store?: typeof StoreModel.Type;
    },
    {}
> {
    render() {
        const { store } = this.props;

        return (
            <div>
                <div>
                    <h3>Auras</h3>
                    {store.auras.map((item, i) => {
                        if (Clarity.is(item)) {
                            return (
                                <div key={i}>
                                    {item.name}: lvl {item.lvl}, reservation{' '}
                                    {item.totalReserved(store.totalMultiplier)}
                                    <button onClick={item.decrease}>-</button>
                                    <button onClick={item.increase}>+</button>
                                </div>
                            );
                        }
                        if (Blasphemy.is(item)) {
                            return (
                                <div key={i}>
                                    {item.name}: curses {item.numberOfCurses},
                                    reservation{' '}
                                    {item.totalReserved(store.totalMultiplier)}%
                                    <button onClick={item.decrease}>-</button>
                                    <button onClick={item.increase}>+</button>
                                </div>
                            );
                        }
                        return (
                            <div key={i}>
                                {item.name} reservation:{' '}
                                {item.reservationCost(store.totalMultiplier)}%
                                <button onClick={item.toggle}>
                                    {item.isChecked.toString()}
                                </button>
                            </div>
                        );
                    })}
                </div>
                <div>
                    <h3>Multipliers</h3>
                    {store.multipliers.map((item, i) => {
                        if (LeveledMultiplier.is(item)) {
                            return (
                                <div key={i}>
                                    {item.name}, lvl {item.lvl}, value{' '}
                                    {item.percentValue}%
                                    <button onClick={item.decrease}>-</button>
                                    <button onClick={item.increase}>+</button>
                                </div>
                            );
                        }
                        return (
                            <div key={i}>
                                {item.name}, value {item.percentBaseValue}%
                                <button onClick={item.toggle}>
                                    {item.isChecked.toString()}
                                </button>
                            </div>
                        );
                    })}
                </div>
                <h3>Result</h3>
                <div>
                    Mana:{' '}
                    <input
                        type="text"
                        value={store.mana}
                        onChange={e =>
                            store.changeMana(Number(e.target.value) || 1000)
                        }
                    />
                    Life:{' '}
                    <input
                        type="text"
                        value={store.life}
                        onChange={e =>
                            store.changeLife(Number(e.target.value) || 1000)
                        }
                    />
                </div>
                <br />
                <div>Total reserved percent: {store.totalPercentReserved}%</div>
                <div>
                    Total reserved by percent : {store.totalReservedByPercent}
                </div>
                <div>Total reserved flat: {store.totalFlatReserved}</div>
                <div>Total reserved mana: {store.totalReservedMana}</div>
                <div>Total reserved life: {store.totalReservedLife}</div>
                <br />
                <div>
                    Mana: {store.mana - store.totalReservedMana}/{store.mana}
                    <div>Reserved: {store.totalPercentReserved}%</div>
                </div>
                <div>
                    Life: {store.life - store.totalReservedLife}/{store.life}
                    <div>Reserved: {store.totalPercentReserved}%</div>
                </div>
                <div>isBloodMagic = {store.isBloodMagic.toString()}</div>
            </div>
        );
    }
}

function main() {
    const App = () => (
        <Provider store={Store}>
            <AppComponent />
        </Provider>
    );

    ReactDom.render(<App />, document.querySelector('#root'));
}

main();
