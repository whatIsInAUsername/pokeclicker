import * as GameConstants from '../GameConstants';
import AchievementRequirement from './AchievementRequirement';

export default class SeviiCaughtRequirement extends AchievementRequirement {
    constructor(value: number, public shiny: boolean) {
        super(value, GameConstants.AchievementOption.more, shiny ? GameConstants.AchievementType['Shiny Pokemon'] : GameConstants.AchievementType['Caught Pokemon']);
    }

    public getProgress() {
        return Math.min(App.game.party.caughtPokemon
            .filter((p) => p.name.startsWith('Pinkan') && p.name != 'Pinkan Pikachu'
            || p.name.startsWith('Valencian')
            || p.name === 'Crystal Onix'
            || p.name === 'Ash\'s Butterfree'
            || p.name === 'Pink Butterfree')
            .filter((p) => p.shiny || !this.shiny).length,
        this.requiredValue);
    }

    public hint(): string {
        return `${this.requiredValue} unique Sevii Pokémon need to be caught.`;
    }
}
