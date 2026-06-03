
import './styles/style.css';
import './styles/ingredients.css'
import type { Recipe } from './models/recipe';
import { deleteRecipe, getAllIngredients, getAllRecipes, modifyRecipeImage, searchRecipeById} from './api/http.service';
import { searchRecipes } from './components/search';
import { backgroundScroll, gainFocusBack, getTimeString, handleEnteronModal} from './components/other';
import {loadOptions, openDetailsWindow, plusbuttonsEventListener } from './components/modalFunctions';


let globalFilterCategory = "";
let globalFilterType = "";
const modal = document.getElementById('recipe-modal');



// ❖━━━━━━━━━━━━━━━━━━ Egyéb ━━━━━━━━━━━━━━━━━━❖
backgroundScroll(); // nav
gainFocusBack(); // modal
if (modal != null) handleEnteronModal(); // key.Enter
function showClearBtn(){
    let show = false;
    if  ((document.getElementById("search-input")! as HTMLSelectElement).value == "" &&
    (document.getElementById("select-type")! as HTMLSelectElement).value == "" &&
    (document.getElementById("select-category")! as HTMLSelectElement).value == ""){
        show = true;
    }
    (document.getElementById("btn-clear") as HTMLButtonElement)!.classList.toggle("d-none", show);
}
async function tryLoad(){
    try{
        await getAllIngredients();
    }
    catch(e){
        printError((e as Error).message);
    }
}
await tryLoad();
// ❖━━━━━━━━━━━━━━━━━━ Listázás ━━━━━━━━━━━━━━━━━━❖
function renderRecipes(recipes: Recipe[]){
    const divList = (document.getElementById("recipes-list") as HTMLDivElement)!;
    recipes.reverse().forEach(recipe => {
        let timeString = getTimeString(recipe.elkeszitesiIdoPerc);
        const cardDiv = document.createElement('div');
        const tdDiv = document.createElement('td');
  
        tdDiv.className = "col-12 col-md-6 col-lg-4 mb-5";
        cardDiv.className = 'card mx-auto shadow w-100 card-recipe';
        cardDiv.style.width = "18rem";
        
        cardDiv.innerHTML = `
        <img src="${recipe.kepUrl}" class="card-img-top object-fit-cover" style="min-height:280px;max-height:280px;" alt="Sikertelen képbetöltés" id="card-img-${recipe.id}">
        <div class="card-body">
            <div class="d-flex justify-content-between">
                <h5 class="card-title"><span class="fw-bold me-2" id="card-nev-${recipe.id}"></span></h5>
                <p>
                <i class="bi fs-6 bi-clock-history"></i>
                <span class="text-muted fs-6 me-2">${(timeString )} </span>
                </p>
            </div>
            <div class="d-flex justify-content between mb-5">
            <span class="badge bg-info me-1 rounded fs-6">${recipe.kategoria}</span>
            <span class="badge bg-warning text-dark rounded fs-6">${recipe.tipus}</span>
            </div>
            <hr>
            <div class="d-flex justify-content-between" >
            
                <button class="btn btn-success w-100 me-2 fw-bold " data-bs-toggle="modal" data-bs-target="#recipe-modal" id="details-${recipe.id}">Részletek</button>
                <div class="btn btn-danger" id="delete-${recipe.id}"><i class="bi bi-trash3"></i></div>
            </div>
        </div>
        `;
        tdDiv.appendChild(cardDiv);
        divList.appendChild(tdDiv);
    //
        document.getElementById(`card-img-${recipe.id}`)!.addEventListener('error', async () => {
            (document.getElementById(`card-img-${recipe.id}`) as HTMLImageElement).src = "/images/placeholder_error.png";       
            recipe.kepUrl = "/images/placeholder_error.png";
            try{
                await modifyRecipeImage(recipe);
            }
            catch(e){

            }
        });
    //   
        document.getElementById(`card-nev-${recipe.id}`)!.innerText = recipe.nev; // abban az esetben, ha html lett megadva névnek, akkor ne értelmezze
        document.getElementById(`delete-${recipe.id}`)!.addEventListener('click', async () => {
            if (confirm("Biztosan törli a receptet?")){
                try{
                    await deleteRecipe(recipe.id);
                    loadOptions(await getAllRecipes("",""));
                    await trySearch();
                }
                catch(e){

                }
            }
        });
    // részletek
        document.getElementById(`details-${recipe.id}`)!.addEventListener('click', async() => {
            try{
                let selectedRecipe:Recipe = await searchRecipeById(recipe.id);
                await openDetailsWindow(selectedRecipe); 
            }
            catch(e){
                // errorprint
                console.error(e);
            }
        });
        
    });
}
// ❖━━━━━━━━━━━━━━━━━━ Eventlistenerek ━━━━━━━━━━━━━━━━━━❖
document.getElementById("select-category")!.addEventListener('input', () => {
    globalFilterCategory = (document.getElementById("select-category")! as HTMLSelectElement).value;
    showClearBtn();
    trySearch();
});
document.getElementById("select-type")!.addEventListener('input', () => {
    globalFilterType = (document.getElementById("select-type")! as HTMLSelectElement).value;
    showClearBtn();
    trySearch();
});
document.getElementById("search-input")!.addEventListener('input',async() => {
    showClearBtn();
});

document.getElementById("search-input")!.addEventListener('keydown',async(e) => {
    if (e.key == "Enter" ) trySearch();
});
(document.getElementById("btn-clear") as HTMLButtonElement)!.addEventListener('click', async () => {
    (document.getElementById("search-input")! as HTMLSelectElement).value = "";
    (document.getElementById("select-type")! as HTMLSelectElement).selectedIndex = 0;
    (document.getElementById("select-category")! as HTMLSelectElement).selectedIndex = 0;
    (document.getElementById("btn-clear") as HTMLButtonElement)!.classList.toggle("d-none",true);
    globalFilterCategory = "";
    globalFilterType = "";
    trySearch();
});
document.getElementById("btn-search")!.addEventListener( 'click',async() => {
    trySearch();
});
// ❖━━━━━━━━━━━━━━━━━━ Keresés ━━━━━━━━━━━━━━━━━━❖
async function trySearch(){
    hideError();
    try{
        const divList = (document.getElementById("recipes-list") as HTMLDivElement)!;
        document.getElementById("not-found")!.classList.toggle("d-none",true);
        if (globalFilterCategory == "" && globalFilterType ==  "" && (document.getElementById("search-input") as HTMLInputElement)!.value == ""){
            let recipes = await searchRecipes("","");
            if (recipes.length == 0){
                divList.innerHTML = "";
                divList.classList.toggle("d-none",true);
                document.getElementById("not-found")!.classList.toggle("d-none",true);
                (document.getElementById("zero-found") as HTMLDivElement)!.classList.toggle("d-none",false);
            }
            else{
                await successfulSearch();
                loadOptions(await getAllRecipes("",""));
            }
        }
        else{
            divList.innerHTML = "";

            let recipes = await (searchRecipes(globalFilterCategory,globalFilterType));
            if (recipes.length == 0){
                printNotfound();
            }
            else{
                await successfulSearch();
            }
        }
    }
    catch(e){
        console.error(e);
        printError((e as Error).message);
    }
}
function noError(){
    document.getElementById("recipes-list")!.classList.toggle("d-none",false);
    document.getElementById("recipes-list")!.style.overflowY = "auto";
    hideError();
}
function printError(eMessage:string){
    document.getElementById('recipes-list-container')!.classList.toggle('d-none',true);
    document.getElementById('api-error')!.classList.toggle('d-none',false);
    document.getElementById('api-error')!.innerText = eMessage;
    
}
function hideError(){
    document.getElementById('recipes-list-container')!.classList.toggle('d-none',false);
    document.getElementById('api-error')!.classList.toggle('d-none',true);
}
function printNotfound(){
    (document.getElementById("zero-found") as HTMLDivElement)!.classList.toggle("d-none",true);
    document.getElementById("recipes-list")!.classList.toggle("d-none",true);
    document.getElementById("not-found")!.classList.toggle("d-none",false); // ha tényleges error van ,csak akkor írja ki
    let searchVal = (document.getElementById("search-input")! as HTMLInputElement).value;
    let messageSearch =  (searchVal == '' ? '': ` ("${searchVal}") `);
    let messageCategory = globalFilterCategory == ''? '': ('<span class="bg-info fs-6 badge rounded  pt-2 px-2">'+`kategória: ${globalFilterCategory} ` + "</span>");
    let messageType =  globalFilterType== ''? '': ('<span class="bg-warning text-black badge fs-6 rounded pt-2 px-2">' +` típus: ${globalFilterType} ` + "</span>");
    document.getElementById("not-found-message")!.innerHTML = `<p class="me-2 my-0">Nincs találat.</p> <p class="pe-4 mb-1"><span id="message-search"></span> ${messageCategory} ${messageType}</p>`;
    document.getElementById("message-search")!.innerText = messageSearch;
    document.getElementById("recipes-list")!.style.overflowY = "hidden";
}
async function successfulSearch(){
    const divList = (document.getElementById("recipes-list") as HTMLDivElement)!;
    // ha ideáig eljutott, a fetch sikerült
    let recipes = await (searchRecipes(globalFilterCategory,globalFilterType));
    divList.classList.toggle("d-none",false);
    (document.getElementById("zero-found") as HTMLDivElement)!.classList.toggle("d-none",true);
    divList.innerHTML = `<div class="col-12 col-md-6 col-lg-4 mb-5">
    <button data-bs-toggle="modal" data-bs-target="#recipe-modal" class="btn  btn-outline-success  border-success border-3   alert alert-secondary  card mx-auto shadow w-100  text-center plus-btn">
    <h1 class="my-auto"><i class="bi bi-plus-circle text-success"></i></h1>
    </button>
    </div>`;
    
    noError();
    renderRecipes(recipes);
}
// ❖━━━━━━━━━━━━━━━━━━ Modal ━━━━━━━━━━━━━━━━━━❖
if (modal != null){
    modal!.addEventListener('hidden.bs.modal', () =>{
        setTimeout(() => { // azért kell, mert míg lecsukódik a modal meg kell várni
        globalFilterCategory = "";
        globalFilterType = "";
        trySearch();
        }, 500);
    });
    plusbuttonsEventListener();
}
// ❖━━━━━━━━━━━━━━━━━━ Első futás ━━━━━━━━━━━━━━━━━━❖
if (!document.getElementById("recipes-list")!.className.includes("d-none")){
    trySearch();
}
