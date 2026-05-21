/// további étel típusok: grillezés, fagyasztás, sütés, főzés, hűtés, instant
// button: clear filters
// api hibák
// filterek törlése minden keresésnél
// sort
// kategóriák: leves, snack, desszert, saláta, szósz, ital ,főétel, szendvics, reggeli
// api hibakezelésnél kell majd a loading screen
// loading screen alapból bekapcs + minden inputnál
// footer?
// visszakérdezés
// állapot jelzés
// validáció
// összes kilistázás gomb
// modal
import './styles/style.css';
import './styles/ingredients.css'
import type { Recipe } from './models/recipe';
import { getAllRecipes } from './api/http.service';
import { searchRecipes } from './components/search';

let globalFilterCategory = "";
let globalFilterType = "";



const background = document.getElementById("navbar")!;

let currentHeight = 400;
let targetHeight = 400;

window.addEventListener("scroll", () => {
    targetHeight = Math.max(400 - window.scrollY, 200);
    currentHeight += (targetHeight - currentHeight) * 0.1;
    
    background.style.height = `${currentHeight}px`;
});


const modal = document.getElementById('projectModal');

// a bs modal lecsukódásakor a fókusz megmarad a modalon -> a hover effektus beragadt a gombon

modal!.addEventListener('hidden.bs.modal', function () {
    setTimeout(() => { // azért kell, mert míg lecsukódik a modal meg kell várni
        // document.getElementById("plus-btn")!.blur(); // fókusz visszanyerése
        let buttons = document.querySelectorAll(".plus-btn")!;
        buttons.forEach(btn  => {
            (btn as HTMLButtonElement)!.blur();
        });
    }, 0);
});


function renderRecipes(recipes: Recipe[]){
    const divList = (document.getElementById("recipes-list") as HTMLDivElement)!;


    if (recipes.length == 0){
        divList.innerHTML == "";
        divList.classList.toggle("d-none",true);
        (document.getElementById("zero-found") as HTMLDivElement)!.classList.toggle("d-none",false);

    }
    else{
        divList.classList.toggle("d-none",false);
        (document.getElementById("zero-found") as HTMLDivElement)!.classList.toggle("d-none",true);
        divList.innerHTML = "";
        divList.innerHTML = `<div class="col-12 col-md-6 col-lg-4 mb-5">
        <button data-bs-toggle="modal" data-bs-target="#projectModal" class="btn  btn-outline-success  border-success border-3   alert alert-secondary  card mx-auto shadow w-100  text-center plus-btn">
        <h1 class="my-auto"><i class="bi bi-plus-circle text-success"></i></h1>
        </button>
        </div>`;

 
      
    }
            recipes.forEach(recipe => {
                let timeString = "";
                if (recipe.elkeszitesiIdoPerc >= 60){
                    let hour = Math.floor(recipe.elkeszitesiIdoPerc / 60);
                    let minutes = recipe.elkeszitesiIdoPerc - hour * 60; 
                    timeString = minutes > 0 ? `${hour} óra ${minutes} perc` : `${hour} óra`;
                }
                else{
                    timeString = `${recipe.elkeszitesiIdoPerc} perc`;
                }
                
                const tdDiv = document.createElement('td');
                tdDiv.className = "col-12  col-md-6 col-lg-4 mb-5";
                const cardDiv = document.createElement('div');
                cardDiv.className = 'card mx-auto shadow w-100 card-recipe';
                cardDiv.style.width = "18rem";
                cardDiv.innerHTML = `
                <img src="${recipe.kepUrl}" class="card-img-top" alt="Sikertelen képbetöltés">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <h5 class="card-title"><span class="fw-bold me-2">${recipe.nev}</span> <span class="text-muted fs-5"> #${(recipe.id)}</span></h5>
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
                        <div class="btn btn-success w-100 me-2 fw-bold " id="details-${recipe.id}">Részletek</div>
                        <div class="btn btn-danger" id="delete-${recipe.id}"><i class="bi bi-trash3"></i></div>
                    </div>
                </div>
                `;

                tdDiv.appendChild(cardDiv);
                divList.appendChild(tdDiv);
            });
        }
    


document.getElementById("select-category")!.addEventListener('input', () => {
    globalFilterCategory = (document.getElementById("select-category")! as HTMLSelectElement).value;
    showClearBtn();
});
document.getElementById("select-type")!.addEventListener('input', () => {
    globalFilterType = (document.getElementById("select-type")! as HTMLSelectElement).value;
    showClearBtn();
});

document.getElementById("search-input")!.addEventListener('input',async() => {
showClearBtn();
});

(document.getElementById("btn-clear") as HTMLButtonElement)!.addEventListener('click', async () => {
    (document.getElementById("search-input")! as HTMLSelectElement).value = "";
    (document.getElementById("select-type")! as HTMLSelectElement).selectedIndex = 0;
    (document.getElementById("select-category")! as HTMLSelectElement).selectedIndex = 0;
    renderRecipes(await getAllRecipes("",""));
    globalFilterCategory = "";
    globalFilterType = "";
    (document.getElementById("btn-clear") as HTMLButtonElement)!.classList.toggle("d-none",true);

});

document.getElementById("search-input")!.addEventListener('keydown',async(e) => {
        if (e.key == "Enter" ){
            trySearch();
        }
});
document.getElementById("btn-search")!.addEventListener( 'click',async() => {
        trySearch();
});

async function trySearch(){
 try{
        renderRecipes(await searchRecipes(globalFilterCategory,globalFilterType));
        noError();
    }
    catch(e){
        console.error(e);
        printError();
    }
}

function printError(){
    /// error ablak megjelenítése, error kiírása
        (document.getElementById("zero-found") as HTMLDivElement)!.classList.toggle("d-none",true);
        document.getElementById("recipes-list")!.classList.toggle("d-none",true);
        document.getElementById("not-found")!.classList.toggle("d-none",false);
        let searchVal = (document.getElementById("search-input")! as HTMLInputElement).value;
       
        let messageSearch =  (searchVal == '' ? '': ` ("${searchVal}") `);
        let messageCategory = globalFilterCategory == ''? '': ('<span class="bg-info">'+` ${globalFilterCategory} ` + "</span>");
        let messageType =  globalFilterType== ''? '': ('<span class="bg-danger">' +` típus: ${globalFilterType} ` + "</span>");
        document.getElementById("not-found-message")!.innerHTML = `Nincs találat. ${messageSearch} ${messageCategory} ${messageType}`
         document.getElementById("recipes-list")!.style.overflowY = "hidden";
        // loading screen kikapcs
}

function noError(){
    document.getElementById("recipes-list")!.classList.toggle("d-none",false);
    // loading screen kikapcs
    document.getElementById("recipes-list")!.style.overflowY = "auto";
    document.getElementById("not-found")!.classList.toggle("d-none",true);
}

if (!document.getElementById("recipes-list")!.className.includes("d-none")){
    try{
        let currentRecipes = await getAllRecipes(globalFilterCategory,globalFilterType);
        renderRecipes(currentRecipes);
        noError();
        loadOptions(currentRecipes);
    }
    catch(e){
        console.error(e);
        printError();
    }
}

function showClearBtn(){
    let show = false;
    if  ((document.getElementById("search-input")! as HTMLSelectElement).value == "" && 
    (document.getElementById("select-type")! as HTMLSelectElement).value == "" &&
    (document.getElementById("select-category")! as HTMLSelectElement).value == ""){
        show = true;
    }
    (document.getElementById("btn-clear") as HTMLButtonElement)!.classList.toggle("d-none", show);
}

function loadOptions(recipes: Recipe[]){
    let CategoriesAll:string[] = [];
    let TypeAll : string[] = [];
    recipes.forEach(recipe => {
        if (!CategoriesAll.includes(recipe.kategoria)){
            CategoriesAll.push(recipe.kategoria);
        }
        if (!TypeAll.includes(recipe.tipus)){
            TypeAll.push(recipe.tipus);
        }
    });

    CategoriesAll.sort();
    TypeAll.sort();

    CategoriesAll.forEach(category => {
        (document.getElementById("select-category") as HTMLSelectElement)!.innerHTML += `<option value="cat-${category}">${category}</option>`;
    });

    TypeAll.forEach(type => {
           (document.getElementById("select-type") as HTMLSelectElement)!.innerHTML += `<option value="type-${type}">${type}</option>`;
    });

}
