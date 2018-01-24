import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Provider, observer, inject } from 'mobx-react';
import { types } from 'mobx-state-tree';

import '../../node_modules/normalize-css/normalize.css';
import './styles/_index.styl';

import {
    clarityReservationPerLevel,
    bloodMagicValuesPerLevel,
    enlightenValuesPerLevel
} from './auras-data';
import { add, div, minus, mul } from './utils';

enum AuraNames {
    Clarity = 'Clarity',
    Blasphemy = 'Blasphemy'
}

enum MultiplierNames {
    Enlighten = 'Enlighten',
    Enhance = 'Enhance',
    Empower = 'Empower',
    BloodMagic = 'Blood Magic Gem',
    Generosity = 'Generosity',
    EssenceWorm = 'Essence Worm',
    HereticsVeil = "Heretic's Veil",
    PrismGuardian = 'Prism Guardian',
    Covenant = 'The Covenant',
    VictariosInfluence = "Victario's Influence"
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
                return Math.floor(mul(value, multiplier));
            },
            reservationCost(multiplier = 1) {
                return Math.floor(mul(self.baseReservation, multiplier));
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
                return Math.floor(
                    mul(
                        self.reservationPerLevel,
                        self.numberOfCurses,
                        multiplier
                    )
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
                return Math.floor(
                    mul(clarityReservationPerLevel[self.lvl], multiplier)
                );
            }
        };
    });

const BasicMultiplier = types
    .model({
        name: types.string,
        baseValue: types.number,
        isChecked: types.boolean,
        isBloodMagic: types.optional(types.boolean, false),
        isGlobal: types.optional(types.boolean, false)
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
                return mul(self.baseValue, 100);
            }
        };
    });

const LeveledMultiplier = types
    .model({
        name: types.string,
        valuesArray: types.array(types.number),
        lvl: types.number,
        bloodmagic: types.optional(types.boolean, false)
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
                return mul(self.valuesArray[self.lvl], 100);
            },
            get isBloodMagic() {
                return self.lvl > 0 && self.bloodmagic;
            }
        };
    });

const Group = types
    .model({
        auras: types.array(types.union(GenericAura, Blasphemy, Clarity)),
        multipliers: types.array(
            types.union(BasicMultiplier, LeveledMultiplier)
        )
    })
    .views(self => {
        function percentReserved() {
            const totalPercent = self.auras
                .filter(item => !Clarity.is(item))
                .reduce((acc, item) => add(acc, item.totalReserved()), 0);
            return Math.floor(useMultiplier(totalPercent));
        }

        function flatReserved() {
            const totalFlat = self.auras
                .filter(item => Clarity.is(item))
                .reduce((acc, item) => add(acc, item.totalReserved()), 0);

            return useMultiplier(totalFlat);
        }

        function finalMultiplier() {
            return self.multipliers.reduce(
                (acc, item) => minus(add(acc, item.value), 1),
                1
            );
        }

        function useMultiplier(value: number) {
            return mul(finalMultiplier(), value);
        }

        function isBloodMagic() {
            return self.multipliers.some(item => item.isBloodMagic);
        }

        return {
            get percentReserved() {
                return percentReserved();
            },
            get flatReserved() {
                return flatReserved();
            },
            get finalMultiplier() {
                return finalMultiplier();
            },
            get isBloodMagic() {
                return isBloodMagic();
            }
        };
    });

const StoreModel = types
    .model({
        mana: types.number,
        life: types.number,
        groups: types.array(Group)
    })
    .actions(self => {
        return {
            changeMana(number: number) {
                self.mana = Math.min(number, 100000);
            },
            changeLife(number: number) {
                self.life = Math.min(number, 100000);
            },
            addGroup() {
                self.groups.push(createGroup());
            }
        };
    })
    .views(self => {
        function flatLifeReserved() {
            return self.groups.reduce(
                (acc, group) =>
                    add(acc, group.isBloodMagic ? group.flatReserved : 0),
                0
            );
        }

        function flatManaReserved() {
            return self.groups.reduce(
                (acc, group) =>
                    add(acc, group.isBloodMagic ? 0 : group.flatReserved),
                0
            );
        }

        function valueReservedByPercent(value: number, percent: number) {
            return mul(div(value, 100), percent);
        }

        function manaPercentReserved() {
            return self.groups.reduce(
                (acc, group) =>
                    add(acc, group.isBloodMagic ? 0 : group.percentReserved),
                0
            );
        }

        function lifePercentReserved() {
            return self.groups.reduce(
                (acc, group) =>
                    add(acc, group.isBloodMagic ? group.percentReserved : 0),
                0
            );
        }

        return {
            get lifePercentReserved() {
                return lifePercentReserved();
            },
            get manaPercentReserved() {
                return manaPercentReserved();
            },
            get totalReservedMana() {
                return add(
                    valueReservedByPercent(self.mana, manaPercentReserved()),
                    flatManaReserved()
                );
            },
            get totalReservedLife() {
                return add(
                    valueReservedByPercent(self.life, lifePercentReserved()),
                    flatLifeReserved()
                );
            }
        };
    });

function createGroup(): typeof Group.Type {
    return Group.create({
        auras: [
            ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => {
                return {
                    name: `Aura ${i}`,
                    baseReservation: i * 5,
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
                name: MultiplierNames.Empower,
                baseValue: 1.25,
                isChecked: false
            },
            {
                name: MultiplierNames.Enlighten,
                valuesArray: enlightenValuesPerLevel,
                lvl: 0
            },
            {
                name: MultiplierNames.BloodMagic,
                valuesArray: bloodMagicValuesPerLevel,
                lvl: 0,
                bloodmagic: true
            },
            {
                name: MultiplierNames.Generosity,
                baseValue: 1,
                isChecked: false
            },
            {
                name: MultiplierNames.EssenceWorm,
                baseValue: 1.4,
                isChecked: false,
                isGlobal: true
            }
        ]
    });
}

const Store = StoreModel.create({
    mana: 1000,
    life: 1000,
    groups: [createGroup()]
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
            <div className="wrapper">
                {store.groups.map((group, groupIndex) => (
                    <div key={groupIndex} className="group">
                        <h2>Group {groupIndex + 1}</h2>
                        <h3>Auras</h3>
                        <div>
                            {group.auras.map((item, i) => {
                                if (Clarity.is(item)) {
                                    return (
                                        <div key={i}>
                                            {item.name}: lvl {item.lvl},
                                            reservation{' '}
                                            {item.totalReserved(
                                                group.finalMultiplier
                                            )}
                                            <button onClick={item.decrease}>
                                                -
                                            </button>
                                            <button onClick={item.increase}>
                                                +
                                            </button>
                                        </div>
                                    );
                                }
                                if (Blasphemy.is(item)) {
                                    return (
                                        <div key={i}>
                                            {item.name}: curses{' '}
                                            {item.numberOfCurses}, reservation{' '}
                                            {item.totalReserved(
                                                group.finalMultiplier
                                            )}%
                                            <button onClick={item.decrease}>
                                                -
                                            </button>
                                            <button onClick={item.increase}>
                                                +
                                            </button>
                                        </div>
                                    );
                                }
                                return (
                                    <div key={i}>
                                        {item.name} reservation:{' '}
                                        {item.reservationCost(
                                            group.finalMultiplier
                                        )}%
                                        <button onClick={item.toggle}>
                                            {item.isChecked.toString()}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                        <div>
                            <h3>Multipliers</h3>
                            {group.multipliers.map((item, i) => {
                                if (LeveledMultiplier.is(item)) {
                                    return (
                                        <div key={i}>
                                            {item.name}, lvl {item.lvl}, value{' '}
                                            {item.percentValue}%
                                            <button onClick={item.decrease}>
                                                -
                                            </button>
                                            <button onClick={item.increase}>
                                                +
                                            </button>
                                        </div>
                                    );
                                }
                                return (
                                    <div key={i}>
                                        {item.name}, value{' '}
                                        {item.percentBaseValue}%
                                        <button onClick={item.toggle}>
                                            {item.isChecked.toString()}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
                <h3>Result</h3>
                <button onClick={store.addGroup}>Add group</button>
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
                <div>Total reserved mana: {store.totalReservedMana}</div>
                <div>Total reserved life: {store.totalReservedLife}</div>
                <br />
                <div>
                    Mana: {store.mana - store.totalReservedMana}/{store.mana}
                    <div>Reserved: {store.manaPercentReserved}%</div>
                </div>
                <div>
                    Life: {store.life - store.totalReservedLife}/{store.life}
                    <div>Reserved: {store.lifePercentReserved}%</div>
                </div>
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
