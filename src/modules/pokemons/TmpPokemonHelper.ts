import { getEvolution } from './EvoHelpers';
import {
    calcNativeRegion,
    calcUniquePokemonsByRegion,
    displayName,
    getImage,
    getPokeballImage,
    getPokemonById,
    getPokemonByName,
    incrementPokemonStatistics,
    typeIdToString,
    typeStringToId,
    hasMegaEvolution,
    hasUncaughtMegaEvolution,
    isMegaEvolution,
    getMegaStones,
    hasGigantamaxForm,
    hasUncaughtGigantamaxForm,
    isGigantamaxForm,
} from './PokemonHelper';

// Tmp class for scripts/pokemons/PokemonHelper to extend

export default class TmpPokemonHelper {
    static calcNativeRegion = calcNativeRegion;
    static getEvolution = getEvolution;
    static getPokemonById = getPokemonById;
    static getPokemonByName = getPokemonByName;
    static typeStringToId = typeStringToId;
    static typeIdToString = typeIdToString;
    static getImage = getImage;
    static calcUniquePokemonsByRegion = calcUniquePokemonsByRegion;
    static getPokeballImage = getPokeballImage;
    static incrementPokemonStatistics = incrementPokemonStatistics;
    static displayName = displayName;
    static hasMegaEvolution = hasMegaEvolution;
    static hasUncaughtMegaEvolution = hasUncaughtMegaEvolution;
    static isMegaEvolution = isMegaEvolution;
    static getMegaStones = getMegaStones;
    static hasGigantamaxForm = hasGigantamaxForm;
    static hasUncaughtGigantamaxForm = hasUncaughtGigantamaxForm;
    static isGigantamaxForm = isGigantamaxForm;
}
