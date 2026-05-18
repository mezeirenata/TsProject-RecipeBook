import type { Ingredient } from "./ingredient";

export interface Recipe{
    id: string;
    nev: string;
    url: string;
    elkeszitesIdoPerc: number;
    elkeszites: string[];
    tipus: string;
    kategoria: string;
    kepUrl: string;
    hozzavalok: {
        hozzavalo: Ingredient,
        quantity: number
    }[];
}

