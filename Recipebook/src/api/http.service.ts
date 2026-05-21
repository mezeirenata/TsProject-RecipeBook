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
        url = url + "?kategoria=" + category_filter + "?tipus=" + type_filter;
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error("Hiba lekéréskor");
    return await response.json();
}
export async function getAllIngredients(): Promise<Ingredient[]> {
    let url = BASE_URL + "/hozzavalok";
    const response = await fetch(url);
    if (!response.ok) throw new Error("Hiba lekéréskor");
    return await response.json();
}

//------------------------------SEARCH------------------------------
//SEARCH - nev alapjan 
export async function searchRecipesByFetch(nev: string): Promise<Recipe[]> {
    const url = new URL(BASE_URL + "/receptek");
    url.searchParams.append("search", nev);
    const response = await fetch(url);
    if (!response.ok) throw new Error("Hiba lekéréskor");
    return await response.json();
}
export async function searchIngredientsByFetch(nev: string): Promise<Ingredient[]> {
    const url = new URL(BASE_URL + "/hozzavalok");
    url.searchParams.append("search", nev);
    const response = await fetch(url);
    if (!response.ok) throw new Error("Hiba lekéréskor");
    return await response.json();
}
//SEARCH - id alapjan
export async function searchRecipeById(id: string): Promise<Recipe> {
    const url = BASE_URL + "/receptek/" + id;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Hiba lekéréskor");
    return await response.json();
}
export async function searchIngredientById(id: string): Promise<Ingredient> {
    const url = BASE_URL + "/hozzavalok/" + id;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Hiba lekéréskor");
    return await response.json();
}

//------------------------------DELETE------------------------------
export async function deleteRecipe(id: string){
    const url = BASE_URL + "/receptek/" + id;
    const response = await fetch(url, {
        method: "DELETE",
        redirect: "follow"
    });
    if (!response.ok) throw new Error("Hiba törléskor");
    return await response.json();
}
export async function deleteIngredient(id: string){
    const url = BASE_URL + "/hozzavalok/" + id;
    const response = await fetch(url, {
        method: "DELETE",
        redirect: "follow"
    });
    if (!response.ok) throw new Error("Hiba törléskor");
    return await response.json();
}

//------------------------------POST/CREATE------------------------------
export async function uploadRecipe(newRecipe: Recipe): Promise<Recipe> 
{
    let url = BASE_URL + "/receptek";
    const response = await fetch(url, {
        method: "POST",
        redirect: "follow",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newRecipe)
    });
    if (!response.ok) throw new Error("Hiba feltöltéskor");
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
    if (!response.ok) throw new Error("Hiba szerkesztéskor");
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
    return await response.json();
}
