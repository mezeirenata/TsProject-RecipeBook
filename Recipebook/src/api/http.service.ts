import type { Recipe } from "../models/recipe";
import type { Ingredient } from "../models/ingredient";

const BASE_URL = "http://localhost:3000";

//------------------------------GET------------------------------
export async function getAllRecipes(category_filter: string, type_filter:string): Promise<Recipe[]> {
    let url = BASE_URL + "/receptek";
    if (category_filter != "" && type_filter == "") {
        url = url + "?kategoria=" + category_filter;
    }
    else if(category_filter == "" && type_filter != ""){
        url = url + "?tipus=" + type_filter;
    }
    else if(category_filter != "" && type_filter != ""){
        url = url + "?kategoria=" + category_filter + "&tipus=" + type_filter;
    }
    try{
        const response = await fetch(url);
        if (!response.ok) throw new Error("Hiba történt a lekérés közben." + ` (${response.status})`);
        return await response.json();
    }
    catch(e){
        if (e instanceof TypeError) throw new Error("Hiba történt a lekérés közben.");
        else {
            throw new Error((e as Error).message);
        }
    }
}
export async function getAllIngredients(): Promise<Ingredient[]> {
    let url = BASE_URL + "/hozzavalok";
    try{
        const response = await fetch(url);
        if (!response.ok) throw new Error("Hiba történt a lekérés közben." + ` (${response.status})`);
        return await response.json();
    }
    catch(e){
        if (e instanceof TypeError) throw new Error("Hiba történt a lekérés közben.");
        else {
            throw new Error((e as Error).message);
        }
    }
}

//------------------------------SEARCH------------------------------
//SEARCH - nev alapjan 
export async function searchRecipesByFetch(nev: string): Promise<Recipe[]> {
    const url = new URL(BASE_URL + "/receptek");
    url.searchParams.append("search", nev);
    const response = await fetch(url);
    if (!response.ok) throw new Error("Hiba történt a keresés közben."+ ` (${response.status})`);
    return await response.json();
}
export async function searchIngredientsByFetch(nev: string): Promise<Ingredient[]> {
    const url = new URL(BASE_URL + "/hozzavalok");
    url.searchParams.append("search", nev);
    const response = await fetch(url);
    if (!response.ok) throw new Error("Hiba történt a keresés közben."+ ` (${response.status})`);
    return await response.json();
}
//SEARCH - id alapjan
export async function searchRecipeById(id: string): Promise<Recipe> {
    const url = BASE_URL + "/receptek/" + id;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Hiba történt a lekérés közben."+ ` (${response.status})`);
    return await response.json();
}
export async function searchIngredientById(id: string): Promise<Ingredient> {
    const url = BASE_URL + "/hozzavalok/" + id;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Hiba történt a lekérés közben." + ` (${response.status})`);
    return await response.json();
}

//------------------------------DELETE------------------------------
export async function deleteRecipe(id: string){
    const url = BASE_URL + "/receptek/" + id;
    const response = await fetch(url, {
        method: "DELETE",
        redirect: "follow"
    });
    if (!response.ok) throw new Error("Hiba történt a törlés közben." + ` (${response.status})`);
    document.dispatchEvent(new CustomEvent('app-event', { detail: { type: 'recipe-deleted' } }));
    return await response.json();
}
export async function deleteIngredient(id: string){
    const url = BASE_URL + "/hozzavalok/" + id;
    const response = await fetch(url, {
        method: "DELETE",
        redirect: "follow"
    });
    if (!response.ok) throw new Error("Hiba törléskor");
    document.dispatchEvent(new CustomEvent('app-event', { detail: { type: 'ingredient-deleted' } }));
    return await response.json();
}

//------------------------------POST/CREATE------------------------------
export async function uploadRecipe(nev:string,elkeszitesiIdoPerc:Number, elkeszites:string[],tipus:string,kategoria:string,kepUrl:string,hozzavalok:{hozzavalo: Ingredient,mennyiseg:number}[]): Promise<Recipe> 
{
    let url = BASE_URL + "/receptek";
    const response = await fetch(url, {
        method: "POST",
        redirect: "follow",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({id:"1",nev:nev,elkeszitesiIdoPerc:elkeszitesiIdoPerc,elkeszites:elkeszites,tipus:tipus,kategoria:kategoria,kepUrl:kepUrl,hozzavalok:hozzavalok}),
    });
    if (!response.ok) throw new Error("Hiba történt a feltöltés közben." + ` (${response.status})`);
    document.dispatchEvent(new CustomEvent('app-event', { detail: { type: 'recipe-added' } }));
    return await response.json();
}
export async function uploadIngredient(newIngredient: Ingredient): Promise<Ingredient>
{
    let url = BASE_URL + "/hozzavalok";
    const response = await fetch(url, {
        method: "POST",
        redirect: "follow",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newIngredient)
    });
    if (!response.ok) throw new Error("Hiba feltöltéskor");
    document.dispatchEvent(new CustomEvent('app-event', { detail: { type: 'ingredient-added' } }));
    return await response.json();
}

//------------------------------PATCH------------------------------
export async function modifyRecipeImage(editedRecipe: Recipe): Promise<Recipe>
{
    let url = BASE_URL + "/receptek/" + editedRecipe.id;
    const response = await fetch(url, {
        method: "PATCH",
        redirect: "follow",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({kepUrl: editedRecipe.kepUrl})
    });
    if (!response.ok) throw new Error("Hiba lépett fel a kép módosítása közben." +` (${response.status})`);
    return await response.json();
}

//------------------------------EDIT------------------------------
export async function editRecipe(editedRecipe: Recipe): Promise<Recipe>
{
    let url = BASE_URL + "/receptek/" + editedRecipe.id;
    const response = await fetch(url, {
        method: "PUT",
        redirect: "follow",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(editedRecipe)
    });
    if (!response.ok) throw new Error("Hiba lépett fel módosítás közben." +` (${response.status})`);
    return await response.json();
}
export async function editIngredient(editedIngredient: Ingredient): Promise<Ingredient>
{
    let url = BASE_URL + "/hozzavalok/" + editedIngredient.id;
    const response = await fetch(url, {
        method: "PUT",
        redirect: "follow",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(editedIngredient)
    });
    if (!response.ok) throw new Error("Hiba szerkesztéskor");
    document.dispatchEvent(new CustomEvent('app-event', { detail: { type: 'ingredient-edited' } }));
    return await response.json();
}

//---
export async function newcreationHappened():Promise<{newCreationHappened: boolean}>{
    let url = BASE_URL + "/newCreationHappened";
    const response = await fetch(url, {method: "GET", redirect:"follow"});
    return await response.json();
}

export async function setcreationHappened(setValue: boolean):Promise<{newCreationHappened: boolean }>{
    let url = BASE_URL + "/newCreationHappened";
    const response = await fetch(url, {method:"PATCH", redirect:"follow", headers: {"Content-Type":"application/json"},body: JSON.stringify({newcreationHappened:setValue})});
    return await response.json();
}
