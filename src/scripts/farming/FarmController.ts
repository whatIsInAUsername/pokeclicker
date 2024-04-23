/// <reference path="../../declarations/enums/MulchType.d.ts"/>

class FarmController {

    public static navigateIndex: KnockoutObservable<number> = ko.observable(0);
    public static berryListFiltered: KnockoutObservableArray<BerryType> = ko.observableArray([]);
    public static numberOfTabs: KnockoutComputed<number>;
    public static farmingModalTabSelected: KnockoutObservable<string> = ko.observable('berryFarmView');

    public static berryListEnd: KnockoutComputed<number>;

    public static selectedBerry: KnockoutObservable<BerryType> = ko.observable(BerryType.Cheri);
    public static selectedMulch: KnockoutObservable<MulchType> = ko.observable(MulchType.Boost_Mulch);
    public static selectedShovel: KnockoutObservable<boolean> = ko.observable(false);
    public static selectedMulchShovel: KnockoutObservable<boolean> = ko.observable(false);
    public static selectedPlotSafeLock: KnockoutObservable<boolean> = ko.observable(false);

    public static berryListVisible: KnockoutObservable<boolean> = ko.observable(true);

    public static multipliers = ['×1', '×10', '×100', '×1000', 'All'];
    public static multIndex: KnockoutObservable<number> = ko.observable(0);

    static readonly BERRIES_PER_PAGE = 8;

    public static initialize() {
        this.berryListFiltered(Array.from(Array(GameHelper.enumLength(BerryType) - 1).keys()));

        this.numberOfTabs = ko.pureComputed(() => {
            return Math.floor(App.game.farming.highestUnlockedBerry() / this.BERRIES_PER_PAGE);
        });

        this.berryListEnd = ko.pureComputed(() => {
            const highestMutation = App.game.farming.mutations.slice().sort((a, b) => b.mutatedBerry - a.mutatedBerry).find(mut => mut._hintSeen() && !App.game.farming.unlockedBerries[mut.mutatedBerry]());
            const highestMutationHint = highestMutation?.mutatedBerry ?? 0;
            return Math.max(App.game.farming.highestUnlockedBerry(), highestMutationHint);
        });

        this.navigateIndex(0);
    }

    public static openFarmModal() {
        if (App.game.farming.canAccess()) {
            $('#farmModal').modal('show');
        } else {
            Notifier.notify({
                message: `You need the ${GameConstants.humanifyString(KeyItemType[KeyItemType.Wailmer_pail])} to access this location.\n<i>Clear Route 13 or 15 first.</i>`,
                type: NotificationConstants.NotificationOption.warning,
            });
        }
    }

    public static getImage(index: number) {
        const plot: Plot = App.game.farming.plotList[index];
        if (plot.berry === BerryType.None) {
            return '';
        }
        if (plot.stage() === PlotStage.Seed) {
            return 'assets/images/farm/AllTreeSeed.png';
        } else if (plot.stage() === PlotStage.Sprout) {
            return 'assets/images/farm/AllTreeSprout.png';
        }
        return `assets/images/farm/${BerryType[plot.berry]}Tree${PlotStage[plot.stage()]}.png`;
    }

    public static calculateCssClass() {
        if (this.selectedPlotSafeLock()) {
            return 'PlotSafeLockSelected';
        }
        if (this.selectedShovel()) {
            return 'ShovelSelected';
        }
        if (this.selectedMulchShovel()) {
            return 'MulchShovelSelected';
        }
        if (this.berryListVisible()) {
            return 'BerrySelected';
        }
        return 'MulchSelected';
    }

    public static calcMulchClass(plot: Plot) {
        if (plot.mulch === MulchType.None) {
            return '';
        }
        return MulchType[plot.mulch];
    }

    public static plotClick(index: number, event: MouseEvent) {
        const plot: Plot = App.game.farming.plotList[index];

        if (event.shiftKey) {
            this.shiftTogglePlotSafeLock(plot, index);
        } else {
            this.handleClickActions(plot, index);
        }
    }

    private static shiftTogglePlotSafeLock(plot: Plot, index: number) {
        if (!plot.isUnlocked) {
            return;
        }

        App.game.farming.togglePlotSafeLock(index);
    }

    public static toggleAllPlotsLocked(lock: boolean) {
        App.game.farming.plotList.forEach((plot, index) => {
            if (plot.isUnlocked && ((lock && !plot.isSafeLocked) || (!lock && plot.isSafeLocked))) {
                App.game.farming.togglePlotSafeLock(index);
            }
        });
    }

    private static handleClickActions(plot: Plot, index: number) {
        // Unlocking Plot
        if (!plot.isUnlocked) {
            App.game.farming.unlockPlot(index);
        // Handle Safe Locking Plot
        } else if (this.selectedPlotSafeLock()) {
            App.game.farming.togglePlotSafeLock(index);
        // Handle Shovel
        } else if (this.selectedShovel()) {
            App.game.farming.shovel(index);
        //Handle Mulch Shovel
        } else if (this.selectedMulchShovel()) {
            App.game.farming.shovelMulch(index);
        // Handle Berries
        } else if (this.berryListVisible()) {
            if (plot.isEmpty()) {
                App.game.farming.plant(index, this.selectedBerry());
            } else {
                App.game.farming.harvest(index);
            }
        // Handle Mulches
        } else {
            App.game.farming.addMulch(index, this.selectedMulch(), this.getAmount());
        }
    }

    public static mulchAll() {
        if (!Settings.getSetting('confirmBeformeMulchingAllPlots').observableValue()) {
            return App.game.farming.mulchAll(FarmController.selectedMulch(), this.getAmount());
        }

        Notifier.confirm({
            title: 'Mulch All',
            message: `Are you sure you want to use ${this.getAmount()} ${MulchType[FarmController.selectedMulch()].replace('_', ' ')} on all plots?`,
            type: NotificationConstants.NotificationOption.info,
            confirm: 'Mulch',
        }).then(confirmed => {
            if (confirmed) {
                App.game.farming.mulchAll(FarmController.selectedMulch(), this.getAmount());
            }
        });
    }

    public static navigateRight() {
        if (FarmController.navigateIndex() < FarmController.numberOfTabs()) {
            FarmController.navigateIndex(FarmController.navigateIndex() + 1);
            this.selectedBerry(this.getUnlockedBerryListWithIndex()[0]);
        }
    }

    public static navigateLeft() {
        if (FarmController.navigateIndex() > 0) {
            FarmController.navigateIndex(FarmController.navigateIndex() - 1);
            this.selectedBerry(this.getUnlockedBerryListWithIndex()[0]);
        }
    }

    public static getUnlockedBerryListWithIndex() {
        return this.getUnlockedBerryList().slice(this.navigateIndex() * this.BERRIES_PER_PAGE, (this.navigateIndex() * this.BERRIES_PER_PAGE) + this.BERRIES_PER_PAGE);
    }

    public static getUnlockedBerryList() {
        return this.berryListFiltered().filter((berry) => berry <= this.berryListEnd());
    }

    private static getAmount() {
        return Number(this.multipliers[this.multIndex()].replace(/\D/g, '')) || Infinity;
    }

    public static incrementMultiplier() {
        this.multIndex((this.multIndex() + 1) % this.multipliers.length);
    }

    public static decrementMultiplier() {
        this.multIndex((this.multIndex() + this.multipliers.length - 1) % this.multipliers.length);
    }

    public static getBackgroundColor(index: number) {
        if (App.game.farming.unlockedBerries[index]()) {
            return GameConstants.BerryColor[App.game.farming.berryData[index].color];
        } else if (FarmController.getHint(index, true) !== '') {
            return GameConstants.BerryColor[8];
        } else {
            return GameConstants.BerryColor[9];
        }

    }

    public static getBerryImage(index: number) {
        return `assets/images/items/berry/${BerryType[index]}.png`;
    }

    public static getHint(index: number, checkSeen = false, checkUnlocked = false) {
        if (checkUnlocked && App.game.farming.unlockedBerries[index]()) {
            return '';
        }
        const mutation = App.game.farming.mutations.find(mutation => mutation.mutatedBerry === index && mutation.showHint);
        if (mutation) {
            if (checkSeen && !mutation.hintSeen) {
                return '';
            }
            return mutation.hint;
        }
        return '';
    }

    public static additionalInfoTooltip: KnockoutComputed<string> = ko.pureComputed(() => {
        const tooltip = [];

        // External Auras
        App.game.farming.externalAuras.forEach((aura, idx) => {
            if (typeof aura === 'undefined') {
                return;
            }
            if (aura() !== 1 && idx !== AuraType.Repel) {
                tooltip.push(`${AuraType[idx]}: ×${aura().toFixed(2)}`);
            } else if (aura() !== 0 && idx === AuraType.Repel) {
                tooltip.push(`${AuraType[idx]}: ${(aura() * 100).toFixed(2)}%`);
            }

        });

        // Adding header if necessary
        if (tooltip.length) {
            tooltip.unshift('<u>External Auras</u>');
        }

        return tooltip.join('<br>');
    });

}

