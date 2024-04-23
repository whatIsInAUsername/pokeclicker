///<reference path="../GameConstants.d.ts"/>

enum PokemonLocationType {
    Route,
    Roaming,
    Dungeon,
    DungeonBoss,
    DungeonChest,
    Evolution,
    Egg,
    Baby,
    Shop,
    Fossil,
    Safari,
    BattleFrontier,
    Wandering,
    Discord,
    QuestLineReward,
    TempBattleReward,
    GymReward,
    DungeonReward,
    Trade
}

class PokemonHelper extends TmpPokemonHelper {
    /*
    PRETTY MUCH ONLY USED BY THE BOT BELOW
    */

    public static getPokemonRegionRoutes(pokemonName: PokemonNameType, maxRegion: GameConstants.Region = GameConstants.Region.none) {
        const regionRoutes = {};
        Routes.regionRoutes.forEach(routeData => {
            const region = routeData.region;
            // If we only want to check up to a maximum region
            if (maxRegion != GameConstants.Region.none && region > maxRegion) {
                return false;
            }
            Object.entries(routeData.pokemon).forEach(([encounterType, pokemon]) => {
                if (Object.values(pokemon).flat().includes(pokemonName)) {
                    if (!regionRoutes[region]) {
                        regionRoutes[region] = [];
                    }
                    regionRoutes[region].push({ route: routeData.number });
                }
            });
            routeData.pokemon.special?.forEach(special => {
                if (special.pokemon.includes(pokemonName)) {
                    if (!regionRoutes[region]) {
                        regionRoutes[region] = [];
                    }
                    regionRoutes[region].push({ route: routeData.number, requirements: special.req.hint() });
                }
            });
            return true;
        });
        return regionRoutes;
    }

    public static getPokemonDungeons(pokemonName: PokemonNameType, maxRegion: GameConstants.Region = GameConstants.Region.none): Array<string> {
        const dungeons = [];
        Object.entries(dungeonList).forEach(([dungeonName, dungeon]) => {
            // If we only want to check up to a maximum region
            if (maxRegion != GameConstants.Region.none) {
                const region = GameConstants.RegionDungeons.findIndex(d => d.includes(dungeonName));
                if (region > maxRegion) {
                    return false;
                }
            }
            // Dungeon Grunt
            if (dungeon.pokemonList.includes(pokemonName)) {
                dungeons.push(dungeonName);
            }
        });
        return dungeons;
    }

    public static getPokemonBossDungeons(pokemonName: PokemonNameType, maxRegion: GameConstants.Region = GameConstants.Region.none): Array<string> {
        const dungeons = [];
        Object.entries(dungeonList).forEach(([dungeonName, dungeon]) => {
            // If we only want to check up to a maximum region
            if (maxRegion != GameConstants.Region.none) {
                const region = GameConstants.RegionDungeons.findIndex(d => d.includes(dungeonName));
                if (region > maxRegion) {
                    return false;
                }
            }
            // Dungeon Boss
            const boss = dungeon.availableBosses(false, true).find(boss => boss.name == pokemonName);
            if (boss) {
                const data = {
                    dungeon: dungeonName,
                    requirements: boss.options?.requirement?.hint(),
                };
                dungeons.push(data);
            }
        });
        return dungeons;
    }

    public static getPokemonChestDungeons(pokemonName: PokemonNameType, maxRegion: GameConstants.Region = GameConstants.Region.none): Array<string> {
        const dungeons = [];
        Object.entries(dungeonList).forEach(([dungeonName, dungeon]) => {
            // If we only want to check up to a maximum region
            if (maxRegion != GameConstants.Region.none) {
                const region = GameConstants.RegionDungeons.findIndex(d => d.includes(dungeonName));
                if (region > maxRegion) {
                    return false;
                }
            }
            // Dungeon Chest
            Object.values(dungeon.lootTable).flat().forEach(i => {
                if (i.loot == pokemonName) {
                    const data = {
                        dungeon: dungeonName,
                        requirements: i.requirement?.hint(),
                    };
                    dungeons.push(data);
                }
            });
        });
        return dungeons;
    }

    public static getPokemonEggs(pokemonName: PokemonNameType, maxRegion: GameConstants.Region = GameConstants.Region.none): Array<string> {
        const eggTypes = [];
        Object.entries(App.game.breeding.hatchList).forEach(([eggType, eggArr]) => {
            eggArr.forEach((pokemonArr, region) => {
                // If we only want to check up to a maximum region
                if (maxRegion != GameConstants.Region.none && region > maxRegion)  {
                    return false;
                }
                if (pokemonArr.includes(pokemonName)) {
                    eggTypes.push(EggType[eggType]);
                }
            });
        });
        return eggTypes;
    }

    public static getPokemonShops(pokemonName: PokemonNameType, maxRegion: GameConstants.Region = GameConstants.Region.none): Array<string> {
        const shops = [];
        Object.entries(TownList).forEach(([townName, town]) => {
            // Check if the shop has items
            const townShops = town.content.filter(c => c instanceof Shop && c.items);
            if (townShops.length) {
                // If we only want to check up to a maximum region
                const region = town.region;
                if (maxRegion != GameConstants.Region.none && region > maxRegion) {
                    return false;
                }
                const hasPokemon = townShops.find(ts => (ts as Shop).items?.find(item => item.name == pokemonName));
                if (hasPokemon) {
                    shops.push(townName);
                }
            }
        });
        return shops;
    }

    public static getPokemonRoamingRegions(pokemonName: PokemonNameType, maxRegion: GameConstants.Region = GameConstants.Region.none): Array<string> {
        const regions = [];
        Object.entries(RoamingPokemonList.list).forEach(([region, regionArr]) => {
            if (maxRegion != GameConstants.Region.none && (+region) > maxRegion) {
                return false;
            }
            RoamingPokemonList.roamerGroups[region].forEach((group, i) => {
                const pokemon = regionArr[i]?.find(r => r.pokemon.name == pokemonName);
                if (pokemon) {
                    const data = {
                        region: +region,
                        requirements: pokemon.unlockRequirement?.hint(),
                        roamingGroup: group,
                    };
                    regions.push(data);
                }
            });
        });
        return regions;
    }

    public static getPokemonParents(pokemonName: PokemonNameType, maxRegion: GameConstants.Region = GameConstants.Region.none): Array<string> {
        const parents = [];
        Object.entries(pokemonBabyPrevolutionMap).forEach(([parent, baby]) => {
            if (baby == pokemonName) {
                if (maxRegion != GameConstants.Region.none && pokemonMap[parent].nativeRegion > maxRegion) {
                    return false;
                }
                parents.push(parent);
            }
        });
        return parents;
    }

    public static getPokemonFossils(pokemonName: PokemonNameType): Array<string> {
        const fossils = [];
        Object.entries(GameConstants.FossilToPokemon).forEach(([fossil, pokemon]) => {
            if (pokemon == pokemonName) {
                fossils.push(fossil);
            }
        });
        return fossils;
    }

    public static getPokemonSafariChance(pokemonName: PokemonNameType): Record<GameConstants.Region, Record<number, number>> {
        const list = {};
        Object.entries(SafariPokemonList.list).forEach(([region]) => {
            if (region == GameConstants.Region.kalos.toString()) {
                // Friendly safari might cause infinite recursion
                return;
            }
            const zoneList = SafariPokemonList.list[region]();
            const safariWeight = zoneList.reduce((sum, p) => sum += p.weight, 0);
            const safariPokemon = zoneList.find(p => p.name == pokemonName);
            if (safariPokemon) {
                list[+region] = list[+region] || {};
                list[+region][0] = +((SafariPokemon.calcPokemonWeight(safariPokemon) / safariWeight) * 100).toFixed(2);
            }
        });
        return list;
    }

    public static getPokemonPrevolution(pokemonName: PokemonNameType, maxRegion: GameConstants.Region = GameConstants.Region.none): Array<EvoData> {
        const evolutions = [];
        const prevolutionPokemon = pokemonList.filter((p: PokemonListData) => p.evolutions?.find(e => e.evolvedPokemon == pokemonName));
        prevolutionPokemon.forEach((p: PokemonListData) => p.evolutions.forEach(e => {
            if (e.evolvedPokemon == pokemonName) {
                // ignore dummy evolutions
                if (e.trigger === EvoTrigger.NONE) {
                    return false;
                }
                if (maxRegion != GameConstants.Region.none && p.nativeRegion > maxRegion) {
                    return false;
                }
                evolutions.push(e);
            }
        }));
        return evolutions;
    }

    public static getPokemonLevelPrevolution(pokemonName: PokemonNameType, maxRegion: GameConstants.Region = GameConstants.Region.none): EvoData {
        const evolutionPokemon = pokemonList.find((p: PokemonListData) => p.evolutions?.find(e => e.trigger === EvoTrigger.LEVEL && e.evolvedPokemon == pokemonName));
        if (maxRegion != GameConstants.Region.none && pokemonMap[evolutionPokemon.name].nativeRegion > maxRegion) {
            return;
        }
        return (evolutionPokemon as PokemonListData)?.evolutions?.find(e => e.evolvedPokemon == pokemonName);
    }

    public static getPokemonStonePrevolution(pokemonName: PokemonNameType, maxRegion: GameConstants.Region = GameConstants.Region.none): EvoData {
        const evolutionPokemon = pokemonList.find((p: PokemonListData) => p.evolutions?.find(e => e.trigger === EvoTrigger.STONE && e.evolvedPokemon == pokemonName));
        if (maxRegion != GameConstants.Region.none && pokemonMap[evolutionPokemon.name].nativeRegion > maxRegion) {
            return;
        }
        return (evolutionPokemon as PokemonListData)?.evolutions?.find(e => e.evolvedPokemon == pokemonName);
    }

    public static getPokemonBattleFrontier(pokemonName: PokemonNameType): Array<number> {
        const stages = [];
        BattleFrontierMilestones.milestoneRewards.filter(m => m instanceof BattleFrontierMilestonePokemon).forEach(milestone => {
            if (milestone._description == pokemonName) {
                stages.push(milestone.stage);
            }
        });
        return stages;
    }

    public static getPokemonWandering(pokemonName: PokemonNameType): Array<string> {
        const berries = [];
        if (Berry.baseWander.includes(pokemonName)) {
            return ['Always'];
        }
        App.game.farming.berryData.forEach((berry) => {
            if (berry.wander.includes(pokemonName)) {
                berries.push(BerryType[berry.type]);
            }
        });
        return berries;
    }

    public static getPokemonDiscord(pokemonName: PokemonNameType): Array<number> {
        const codes = [];
        App.game.discord.codes.forEach(code => {
            if (code.name == pokemonName) {
                codes.push(code.price);
            }
        });
        return codes;
    }

    public static getPokemonTempBattleReward(pokemonName: PokemonNameType): Array<string> {
        const tempBattleList = [];
        Object.entries(TemporaryBattleList).forEach(tempBattle => {
            if (tempBattle[1].optionalArgs?.firstTimeRewardFunction?.toString().includes(`'${pokemonName}'`) ||
                tempBattle[1].optionalArgs?.rewardFunction?.toString().includes(`'${pokemonName}'`) ||
                (tempBattle[1].optionalArgs?.isTrainerBattle === false && tempBattle[1].getPokemonList().some((p) => p.name === pokemonName))) {
                tempBattleList.push(tempBattle[0]);
            }
        });
        return tempBattleList;
    }

    public static getPokemonGymReward(pokemonName: PokemonNameType): Array<string> {
        const gymList = [];
        Object.values(GymList).forEach(gym => {
            if (gym.rewardFunction?.toString().includes(`'${pokemonName}'`)) {
                gymList.push(gym.leaderName);
            }
        });
        return gymList;
    }

    public static getPokemonDungeonReward(pokemonName: PokemonNameType): Array<string> {
        const dungeons = [];
        Object.values(dungeonList).forEach(dungeon => {
            if (dungeon.rewardFunction?.toString().includes(`'${pokemonName}'`)) {
                dungeons.push(dungeon.name);
            }
        });
        return dungeons;
    }

    public static getPokemonQuestLineReward(pokemonName: PokemonNameType): Array<string> {
        const questLines = [];
        App.game.quests.questLines().forEach(questLine => questLine.quests().forEach(quest => {
            if ((quest as any).customReward?.toString().includes(`'${pokemonName}'`)) {
                questLines.push(questLine.name);
            }
        }));
        return questLines;
    }

    public static getPokemonTrades(pokemonName: PokemonNameType, maxRegion: GameConstants.Region = GameConstants.Region.none): Array<string> {
        const trades = [];
        Object.entries(TownList).forEach(([townName, town]) => {
            // If we only want to check up to a maximum region
            if (maxRegion != GameConstants.Region.none && town.region > maxRegion) {
                return false;
            }

            const townShops = town.content.filter(c => c instanceof Shop);
            if (townShops.length) {
                let hasPokemon = false;
                for (let i = 0; i < townShops.length && !hasPokemon; i++) {
                    const shop = townShops[i];
                    if (shop instanceof GemMasterShop) {
                        hasPokemon = GemDeal.list[shop.shop]?.().some(deal => deal.item.itemType.type == pokemonName);
                    } else if (shop instanceof ShardTraderShop) {
                        hasPokemon = ShardDeal.list[shop.location]?.().some(deal => deal.item.itemType.type == pokemonName);
                    } else if (shop instanceof BerryMasterShop) {
                        hasPokemon = BerryDeal.list[shop.location]?.().some(deal => deal.item.itemType.type == pokemonName);
                    }
                }
                if (hasPokemon) {
                    trades.push(townName);
                }
            }
        });
        return trades;
    }

    public static getPokemonLocations = (pokemonName: PokemonNameType, maxRegion: GameConstants.Region = GameConstants.MAX_AVAILABLE_REGION) => {
        const encounterTypes = {};
        // Routes
        const regionRoutes = PokemonHelper.getPokemonRegionRoutes(pokemonName, maxRegion);
        if (Object.keys(regionRoutes).length) {
            encounterTypes[PokemonLocationType.Route] = regionRoutes;
        }
        // Dungeons
        const dungeons = PokemonHelper.getPokemonDungeons(pokemonName, maxRegion);
        if (dungeons.length) {
            encounterTypes[PokemonLocationType.Dungeon] = dungeons;
        }
        // Dungeon Boss
        const bossDungeons = PokemonHelper.getPokemonBossDungeons(pokemonName, maxRegion);
        if (bossDungeons.length) {
            encounterTypes[PokemonLocationType.DungeonBoss] = bossDungeons;
        }
        // Dungeon Chest
        const chestDungeons = PokemonHelper.getPokemonChestDungeons(pokemonName, maxRegion);
        if (chestDungeons.length) {
            encounterTypes[PokemonLocationType.DungeonChest] = chestDungeons;
        }
        // Eggs
        const eggs = PokemonHelper.getPokemonEggs(pokemonName, maxRegion);
        if (eggs.length) {
            encounterTypes[PokemonLocationType.Egg] = eggs;
        }
        // Shops
        const shops = PokemonHelper.getPokemonShops(pokemonName, maxRegion);
        if (shops.length) {
            encounterTypes[PokemonLocationType.Shop] = shops;
        }
        // Roaming
        const roaming = PokemonHelper.getPokemonRoamingRegions(pokemonName, maxRegion);
        if (roaming.length) {
            encounterTypes[PokemonLocationType.Roaming] = roaming;
        }
        // Baby
        const parents = PokemonHelper.getPokemonParents(pokemonName, maxRegion);
        if (parents.length) {
            encounterTypes[PokemonLocationType.Baby] = parents;
        }
        // Fossil
        const fossils = PokemonHelper.getPokemonFossils(pokemonName);
        if (fossils.length) {
            encounterTypes[PokemonLocationType.Fossil] = fossils;
        }
        // Safari
        const safariChance = PokemonHelper.getPokemonSafariChance(pokemonName);
        if (Object.keys(safariChance).length) {
            encounterTypes[PokemonLocationType.Safari] = safariChance;
        }
        // Evolution
        const evolutions = PokemonHelper.getPokemonPrevolution(pokemonName, maxRegion);
        if (evolutions.length) {
            encounterTypes[PokemonLocationType.Evolution] = evolutions;
        }

        // Battle Frontier
        const battleFrontier = PokemonHelper.getPokemonBattleFrontier(pokemonName);
        if (battleFrontier.length) {
            encounterTypes[PokemonLocationType.BattleFrontier] = battleFrontier;
        }

        // Wandering
        const wandering = PokemonHelper.getPokemonWandering(pokemonName);
        if (wandering.length) {
            encounterTypes[PokemonLocationType.Wandering] = wandering;
        }

        // Discord
        const discord = PokemonHelper.getPokemonDiscord(pokemonName);
        if (discord.length) {
            encounterTypes[PokemonLocationType.Discord] = discord;
        }

        // Temp battle reward
        const tempBattle = PokemonHelper.getPokemonTempBattleReward(pokemonName);
        if (tempBattle.length) {
            encounterTypes[PokemonLocationType.TempBattleReward] = tempBattle;
        }

        // Gym reward
        const gymReward = PokemonHelper.getPokemonGymReward(pokemonName);
        if (gymReward.length) {
            encounterTypes[PokemonLocationType.GymReward] = gymReward;
        }

        // Dungeon reward
        const dungeonReward = PokemonHelper.getPokemonDungeonReward(pokemonName);
        if (dungeonReward.length) {
            encounterTypes[PokemonLocationType.DungeonReward] = dungeonReward;
        }

        // Quest Line reward
        const questLineReward = PokemonHelper.getPokemonQuestLineReward(pokemonName);
        if (questLineReward.length) {
            encounterTypes[PokemonLocationType.QuestLineReward] = questLineReward;
        }

        // Trades
        const trades = PokemonHelper.getPokemonTrades(pokemonName);
        if (trades.length) {
            encounterTypes[PokemonLocationType.Trade] = trades;
        }

        // Return the list of items
        return encounterTypes;
    }

    public static isObtainableAndNotEvable = (pokemonName: PokemonNameType) => {
        const locations = PokemonHelper.getPokemonLocations(pokemonName);
        const isEvable = locations[PokemonLocationType.Dungeon] ||
            locations[PokemonLocationType.DungeonBoss] ||
            locations[PokemonLocationType.DungeonChest] ||
            (locations[PokemonLocationType.Evolution] as EvoData[])?.some((evo) => evo.trigger === EvoTrigger.STONE) || // Only stone evolutions gives EVs
            locations[PokemonLocationType.Roaming] ||
            locations[PokemonLocationType.Route] ||
            locations[PokemonLocationType.Safari] ||
            locations[PokemonLocationType.Shop] ||
            locations[PokemonLocationType.Wandering] ||
            locations[PokemonLocationType.Trade];
        return !isEvable && Object.keys(locations).length;
    };
}
