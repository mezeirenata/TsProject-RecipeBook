import { getAllIngredients, getAllRecipes } from "../api/http.service"
import type { Ingredient } from "../models/ingredient";
import type { Recipe } from "../models/recipe"

export async function searchRecipes( category:string = "", type:string = ""):Promise<Recipe[]>{
    const search = (document.getElementById("search-input") as HTMLInputElement)!
    let recipes: Recipe[] = await getAllRecipes(category,type);
    let returnableRecipes: Recipe[] = [];
    recipes.forEach(recipe => {
        // if (search.value.startsWith("#")){
        //     if (("#" + recipe.id).toLowerCase() == search.value.toLowerCase() || recipe.nev.toLowerCase().includes(search.value.toLowerCase())){
        //         returnableRecipes.push(recipe); 
        //         console.log(recipe);
        //     }
        // }
        // else{
            if (recipe.nev.toLowerCase().includes(search.value.toLowerCase())){
            returnableRecipes.push(recipe);
            }     
        // }
    });
    return returnableRecipes;
    }
        
/// todo: rövidítés
export async function searchIngredients():Promise<Ingredient[]>{
    const search = (document.getElementById("search-input-ingredient") as HTMLInputElement)!
    if (search.value.startsWith("#")){
                let ingredients: Ingredient[] = await getAllIngredients();
                let returnableIngredients: Ingredient[] = [];
                ingredients.forEach(ingredient => {
                    if (("#" + ingredient.id).toLowerCase() == search.value.toLowerCase() || ingredient.nev.toLowerCase().includes(search.value.toLowerCase())){
                        returnableIngredients.push(ingredient);
                        
                    }
                });
                if (returnableIngredients.length > 0){
                    document.getElementById("not-found-ingredient")!.classList.toggle("d-none",true);
                    document.getElementById("recipes-list-ingredient")!.classList.toggle("d-none",false);
                    document.getElementById("recipes-list-ingredient")!.style.overflowY = "scroll";
                    return returnableIngredients;
                    //loading screen kikapcs
                }
                else{
                    throw new Error("Nincs találat");
                }
        }
        else{
                let ingredients: Ingredient[] = await getAllIngredients();
                let returnableIngredients: Ingredient[] = [];
                ingredients.forEach(ingredient => {
                       if (ingredient.nev.toLowerCase().includes(search.value.toLowerCase())){
                           returnableIngredients.push(ingredient);
                       }     
                })     
                if (returnableIngredients.length > 0){
                    document.getElementById("not-found")!.classList.toggle("d-none",true);
                    document.getElementById("recipes-list")!.classList.toggle("d-none",false);
                    document.getElementById("recipes-list")!.style.overflowY = "scroll";
                    return returnableIngredients;
                    //loading screen kikapcs
                }
                else{
                    throw new Error("Nincs találat");
                }  
        }
    return [];
}