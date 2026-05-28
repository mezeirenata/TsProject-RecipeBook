import type { Ingredient } from "./ingredient";

export interface Recipe{
    id: string;
    nev: string;
    elkeszitesiIdoPerc: number;
    elkeszites: string[];
    tipus: string;
    kategoria: string;
    kepUrl: string;
    hozzavalok: {
        hozzavalo: Ingredient,
        mennyiseg: number
    }[];
}

