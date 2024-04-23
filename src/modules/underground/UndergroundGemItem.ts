import PokemonType from '../enums/PokemonType';
import UndergroundItemValueType from '../enums/UndergroundItemValueType';
import Requirement from '../requirements/Requirement';
import UndergroundItem from './UndergroundItem';

export default class UndergroundGemItem extends UndergroundItem {
    constructor(
        public name: string,
        public id: number,
        space: Array<Array<number>>,
        public type: PokemonType,
        public value = 100,
        public requirement?: Requirement,
        weight?: (() => number) | number,
    ) {
        super(name, id, space, value, UndergroundItemValueType.Gem, requirement, weight);
    }
}
