import {
    Observable as KnockoutObservable,
    Computed as KnockoutComputed,
} from 'knockout';
import SettingOption from './SettingOption';
import Requirement from '../requirements/Requirement';

export default class Setting<T> {
    value: T;
    observableValue: KnockoutObservable<T>;

    // We can't set this up in the constructor because App.translation doesn't exist yet
    private cachedTranslatedName: KnockoutComputed<string>;

    // Leave options array empty to allow all options.
    constructor(
        public name: string,
        private defaultDisplayName: string,
        public options: SettingOption<T>[],
        public defaultValue: T,
        public requirement : Requirement = undefined,
    ) {
        this.observableValue = ko.observable(this.defaultValue);
        this.set(defaultValue);
    }

    set(value: T): void {
        if (this.validValue(value)) {
            this.value = value;
            this.observableValue(value);
        } else {
            // eslint-disable-next-line no-console
            console.warn(`${value} is not a valid value for setting ${this.name}`);
        }
    }

    validValue(value: T): boolean {
        if (this.options.length === 0) {
            return true;
        }
        for (let i = 0; i < this.options.length; i += 1) {
            if (this.options[i].value === value) {
                return this.options[i].isUnlocked();
            }
        }

        return false;
    }

    isSelected(value: T): KnockoutComputed<boolean> {
        return ko.pureComputed(() => (this.observableValue() === value), this);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, class-methods-use-this
    isValueUnlocked(value: T): boolean { 
        return true;
    }

    isUnlocked(): boolean {
        return this.requirement ? this.requirement.isCompleted() : true;
    }

    getValidOptions() {
        return this.options.filter((opt) => opt.isUnlocked());
    }

    get displayName(): string {
        if (!this.cachedTranslatedName) {
            this.cachedTranslatedName = App.translation.get(
                this.name,
                'settings',
                { defaultValue: this.defaultDisplayName },
            );
        }
        return this.cachedTranslatedName();
    }
}
