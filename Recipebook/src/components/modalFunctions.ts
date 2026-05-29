import { getAllIngredients, uploadRecipe } from "../api/http.service";
import { fileExtensions, RecipeCategory, RecipeType } from "../models/enum";
import type { Ingredient } from "../models/ingredient";
import type { Recipe } from "../models/recipe";
import { settime } from "./other";

let selectedIds:string[] = [];
//mentés
function checkFields(): boolean{
    let modalAlert = document.getElementById("modal-alert")!
    let modalAlertContent = document.getElementById("modal-alert-content")!
    let recipeName = document.getElementById("p-name")! as HTMLInputElement;
    let selectCategory = (document.getElementById('select-cat')! as HTMLSelectElement);
    let selectType = (document.getElementById('select-type-x')! as HTMLSelectElement);
    let inputHour = document.getElementById("p-hour")! as HTMLInputElement;
    let inputMinute = document.getElementById("p-minute")! as HTMLInputElement;
    let selectedIngredients = document.querySelectorAll('.ingredient-item');
    let ingredientsQuantities = document.querySelectorAll('.input-quantity');
    let selectIngredients = document.getElementById('ingredients-list') as HTMLSelectElement;
    let inputStep = document.getElementById('input-step') as HTMLInputElement;
    let uploadedSteps = document.querySelectorAll('.step-item');
    let alertClose = document.getElementById('alert-btn-close')! as HTMLButtonElement;
    
    let hour = 0;
    let minute = 0;

    alertClose.addEventListener('click', () => {
            modalAlert.style.display = "none";
            modalAlertContent.innerText = "";
        });

    modalAlert.style.display = "none";
    modalAlertContent.innerText = "";

    let emptyField = false;
    if (recipeName.value.trim() == ""){
        recipeName.classList.toggle('border-error',true);
        emptyField = true;
    }
    if (selectCategory.value.trim() == ""){
        selectCategory.classList.toggle('border-error',true);
        emptyField = true;
    }
    if (selectType.value.trim() == ""){
        selectType.classList.toggle('border-error',true);
        emptyField = true;
    }
    if (inputHour.value.trim() == "" && inputMinute.value.trim() == ""){
        inputHour.classList.toggle('border-error',true);
        inputMinute.classList.toggle('border-error',true);
        emptyField = true;
    }

    if (selectedIngredients.length == 0){
        selectIngredients.classList.toggle('border-error',true);
        emptyField= true;
    }
    if (uploadedSteps.length == 0){
        inputStep.classList.toggle('border-error',true);
        emptyField = true;
    }

// számok megvizsgálása
    let numberError = false;
    let numberCantBeConverted = false;
    if (Number(inputHour.value) < 0 ){
        inputHour.classList.toggle('border-error',true);
        numberError = true;
    }
    if (Number(inputMinute.value) < 0){
        inputMinute.classList.toggle('border-error',true);
        numberError = true;
    }
    
//
    try{
        ingredientsQuantities.forEach(element => {
            if (Number((element as HTMLInputElement).value) <= 0){
                numberError = true;
                element.classList.toggle('border-error',true);
            }
        });
    }
    catch{
        numberCantBeConverted = true;
       
    }
//
    try{
        hour = Number(inputHour.value);
        if (!Number.isInteger(hour))
        {
            throw new Error();
        }
    }
    catch{
        inputHour.classList.toggle('border-error',true);
        numberCantBeConverted = true;
    }
//
    try{
        minute = Number(inputMinute.value);
        if (!Number.isInteger(minute))
        {
            throw new Error();
        }
    }
    catch{
        inputMinute.classList.toggle('border-error',true);
        numberCantBeConverted = true;
    }
//
    if (emptyField){
        modalAlert.style.display = "block";
        modalAlertContent.innerText = "Nem maradhat üresen kötelező mező!";
        return false;
    }
    if (numberError){
        modalAlert.style.display = "block";
        modalAlertContent.innerText = "Nem adhat meg 0 vagy negatív értéket!";
        return false;
    }
    if (numberCantBeConverted){
        modalAlert.style.display = "block";
        modalAlertContent.innerText = "Helytelen a megadott számérték!";
        return false;
    }
    return true;
    
}
export async function saveRecipe(){
    if (checkFields()){
    // kép
        let image = (document.getElementById("modal-header-image")! as HTMLImageElement).src;
        let modalAlert = document.getElementById("modal-alert")!;
        let modalAlertContent = document.getElementById("modal-alert-content")!;
    // név
        let recipeName = (document.getElementById('p-name') as HTMLInputElement).value;
    // lépések
        let stepsList: string[] = [];
        let stepsListHTML = document.querySelectorAll('.step-item');
        stepsListHTML.forEach(step => {
            stepsList.push((step as HTMLLIElement).innerText);
        });
    // hozzávalók
        let ingredientsList: {hozzavalo: Ingredient,quantity:number}[] = [];
        let ingredientsHTML = document.querySelectorAll('.ingredient-item');
        ingredientsHTML.forEach(async(ingredientLi) =>{
            let ingredientId = ingredientLi.id.split("list-ingredient-")[1];
            let ingredients = await getAllIngredients();

            ingredients.forEach( ingredient => {
                if (ingredient.id == ingredientId){
                    let quantity = Number((document.getElementById(`input-quantity-${ingredient.id}`) as HTMLInputElement).value);
                    ingredientsList.push({hozzavalo: ingredient, quantity: quantity});
                }
            });
            
        });
    // idő
        let minutes = Number((document.getElementById('p-hour') as HTMLInputElement).value)*60 + Number((document.getElementById('p-minute') as HTMLInputElement).value);
    // kategória
        let category = (document.getElementById('select-cat') as HTMLSelectElement).value;
    // típus
        let type = (document.getElementById('select-type-x') as HTMLSelectElement).value;
        try{
            await uploadRecipe(recipeName,minutes,stepsList,type,category,image,ingredientsList);
        }
        catch(e){

            modalAlert.style.display = "block";
            modalAlertContent.innerText = "Nem sikerült menteni a receptet!";
            return false;
            
        }
        (document.getElementById('btn-close-modal') as HTMLButtonElement).click();
    }
    
}
//

// hozzávalók megjelenítése
function renderIngredientsDetails(ingredients: {hozzavalo: Ingredient,mennyiseg:number}[]){
    let ingredientList = document.getElementById('selected-ingredients')! as HTMLUListElement;
    ingredientList.classList.toggle('show',true);
    ingredientList.innerHTML = "";
    ingredients.forEach(ingredientElement => {
            if (!selectedIds.includes(ingredientElement.hozzavalo.id)){
                selectedIds.push(ingredientElement.hozzavalo.id);
                let li = document.createElement('li');
                li.id = "list-ingredient-" + ingredientElement.hozzavalo.id;
                li.className = "list-group-item d-flex flex-wrap ingredient-item pb-3 mt-1 ";
    
                let firstRow = document.createElement('div');
                firstRow.className = "my-auto d-flex my-auto flex-nowrap w-100 justify-content-between fw-bold mb-1";
    
                let p = document.createElement('p');
                p.className = "mb-0 overflow-x-auto w-50 text-success my-auto";
                p.innerText = ingredientElement.hozzavalo.nev;
                firstRow.appendChild(p);
                firstRow.innerHTML += `<span class="w-25 mx-2 my-auto  fw-bold">${ingredientElement.mennyiseg} ${ingredientElement.hozzavalo.mertekegyseg}</span>`;
                firstRow.innerHTML += `<span for="" class="w-25 ms-auto mt-auto badge p-2  bg-secondary-subtle text-dark">teljes ár: ${ingredientElement.mennyiseg * ingredientElement.hozzavalo.egysegAr} Ft</span>`;
    
    
                li.appendChild(firstRow);
    
            
                ingredientList.appendChild(li);   

            }
    });
}
export function renderIngredients(ingredients: Ingredient[]){
    let selectedIngredients = document.getElementById("selected-ingredients")! as HTMLUListElement;

    
    let sumPrice = 0;

    let plusBtn =  (document.getElementById('btn-add-ingredient') as HTMLButtonElement)!;
    plusBtn.classList.toggle("disabled",true);
    
    let listIngredients = (document.getElementById("ingredients-list") as HTMLSelectElement)!;
    listIngredients.innerHTML = `<option value="" selected>Válasszon hozzávalót!</option>
    <option value="" ></option>`;
    
    ingredients.forEach(ingredient => {
        const optionIngredient = document.createElement('option');
        optionIngredient.value = "ingredient-option-"+ ingredient.id;
        optionIngredient.innerText = ingredient.nev;
        listIngredients.appendChild(optionIngredient);
    });
    listIngredients.addEventListener('change', () => {
         let selectedoption = listIngredients.options[listIngredients.selectedIndex];
         if (selectedoption.value != "" && !selectedIds.includes(selectedoption.value.split("-")[2])){
            plusBtn.classList.toggle("disabled",false);

        }
        else{
            plusBtn.classList.toggle("disabled",true);
        }
    });




// hozzáadás
    plusBtn.addEventListener('click', () => {
        let selectedoption = listIngredients.options[listIngredients.selectedIndex];
        let ingredientId = selectedoption.value.split("-")[2];
        ingredients.forEach(ingredient => {
            if (ingredient.id == ingredientId && !selectedIds.includes(ingredient.id)){
                document.getElementById('ingredients-list')!.classList.toggle('border-error',false);
                selectedIds.push(ingredient.id);
                let li = document.createElement('li');
                li.id = "list-ingredient-" + ingredient.id;

                let firstRow = document.createElement('div');
                firstRow.className = "my-auto d-flex flex-nowrap w-100 fw-bold mb-1";
                li.className = "list-group-item d-flex flex-wrap ingredient-item pb-3";

                let p = document.createElement('p');
                p.className = "mb-0 overflow-x-auto w-75 text-success";
                p.innerText = ingredient.nev;
                firstRow.appendChild(p);

                let cancelDiv = document.createElement('div');
                cancelDiv.className = "ms-auto btn btn-outline-danger rounded my-auto p-0 px-1 fw-bold";
                cancelDiv.id = "cancel-ingredient-" + ingredient.id;
                cancelDiv.innerHTML = '<i class="bi bi-x-lg"></i>';
                firstRow.appendChild(cancelDiv);

                li.appendChild(firstRow);

                let secondRow = document.createElement('div');
                secondRow.className = "d-flex flex-nowrap w-100";

                let quantityDiv = document.createElement('div');
                quantityDiv.className = "d-flex flex-nowrap w-50";

                let label = document.createElement('label');
                label.className = "me-2 my-auto";
                label.innerText = `mennyiség (${ingredient.mertekegyseg}): `;
                quantityDiv.appendChild(label);
                quantityDiv.innerHTML += `<input type="number" placeholder="0" min="0" class="form-control input-quantity" id="input-quantity-${ingredient.id}" style="width: 35%;">`;

                let priceDiv = document.createElement('div');
                priceDiv.className = "d-flex flex-nowrap w-50";
                priceDiv.innerHTML = `<span for="" class="ms-auto mt-auto badge p-2  bg-secondary-subtle text-dark">teljes ár: <span id="${ingredient.id}-price" class="price-by-ingredient">0</span> Ft</span>`;

                secondRow.appendChild(quantityDiv);
                secondRow.appendChild(priceDiv);
                li.appendChild(secondRow);
                selectedIngredients.appendChild(li);   
                plusBtn.classList.toggle("disabled",true);

//// törlés
                document.getElementById("cancel-ingredient-" + ingredient.id)!.addEventListener('click', () => {
                    let tobeDeletedLi = document.getElementById('list-ingredient-' + ingredient.id);
                    selectedIngredients.removeChild(tobeDeletedLi!);
                    let newlySelectedIds: string[] = [];
                    selectedIds.forEach(id =>{
                        if (id != ingredient.id){
                            newlySelectedIds.push(id);
                        }
                    });
                    sumPrice = 0;
                    document.querySelectorAll(".price-by-ingredient").forEach(element =>{
                        sumPrice += Number((element as HTMLSpanElement).innerText);
                    } );
                    document.getElementById("sum-price")!.innerText = sumPrice.toString();
                    settime();  
                    selectedIds = newlySelectedIds;
                });

                /// mennyiség változtatása
                document.getElementById("input-quantity-"+ ingredient.id)!.addEventListener('input', () =>{
                    let inputQuantity = document.getElementById("input-quantity-"+ingredient.id) as HTMLInputElement;
                    if (Number(inputQuantity.value) <= 0){
                        inputQuantity.classList.toggle("border-error",true);
                        document.getElementById(ingredient.id + "-price")!.innerText = "0";
                    }
                    else{
                        inputQuantity.classList.toggle("border-error",false);
                        document.getElementById(ingredient.id + "-price")!.innerText = (ingredient.egysegAr * Number(inputQuantity.value)).toString();
                    }
                    sumPrice = 0;
                    document.querySelectorAll(".price-by-ingredient").forEach(element =>{
                        sumPrice += Number((element as HTMLSpanElement).innerText);
                    } );
                    document.getElementById("sum-price")!.innerText = sumPrice.toString();
                    settime();  
                });
            }
            else{
                plusBtn.classList.toggle("disabled",true);
            }
            listIngredients.selectedIndex = 0;
        });
    });
   
}
//

// input step plusbtn
export function handleClickEvent(){
    let inputStep = document.getElementById("input-step") as HTMLInputElement;
    let stepsList = document.getElementById("steps-list") as HTMLOListElement;
    let li = document.createElement('li');
    li.className = "rounded py-2 align-items-center list-group-item  d-flex flex-nowrap step-item";
    let stepItems = document.querySelectorAll(".step-item");
    let maxid = 0;
    stepItems.forEach(item => {
        if (Number(item.id) > maxid){
            maxid = Number(item.id);
        }
    });
    li.id = (maxid + 1).toString();

    let textDiv = document.createElement('div');
        textDiv.className = "ms-2 my-auto overflow-x-auto";
        textDiv.innerText = inputStep.value;
        li.appendChild(textDiv); 
   
    let removeStep = document.createElement('div');
        removeStep.className = "ms-auto btn btn-outline-danger my-auto p-0 px-1 fw-bold";
        removeStep.id = `delete-step-${li.id}`; 
        removeStep.innerHTML = `<i class="bi bi-x-lg"></i>`;
        li.appendChild(removeStep);   
           
    stepsList.appendChild(li);
    document.getElementById(`delete-step-${li.id}`)!.addEventListener('click', () => {
        stepsList.removeChild(li);
    });
    settime();  
    inputStep.value = "";
}
// Elkészítés lépéseinek megjelenítése
function renderSteps(recipeToRender: Recipe){
    let stepList = document.getElementById('steps-list')! as HTMLOListElement;
    stepList.innerHTML = "";
    recipeToRender.elkeszites.forEach(step =>{
        let li = document.createElement('li');
        li.className = "rounded py-2 align-items-center list-group-item  d-flex flex-nowrap step-item";
        
        let textDiv = document.createElement('div');
        textDiv.className = "ms-2 my-auto overflow-x-auto";
        textDiv.innerText = step;
        li.appendChild(textDiv); 

        stepList.appendChild(li);
    });
}
//

// img input
export function handleImageInputs(){
    let inputImage = document.getElementById("p-imageurl")! as HTMLInputElement;
    let image = document.getElementById("modal-header-image")! as HTMLImageElement;
    inputImage.addEventListener('input',() => {
        let splitted = inputImage.value.split('.');
        inputImage.classList.toggle("border-error",false);

        if (inputImage.value != ""){
            let fitExtension = false;

            Object.values(fileExtensions).forEach(extension => {
                if (extension == splitted[splitted.length -1]){
                    fitExtension = true;
                }
            });

            if (!fitExtension || !inputImage.value.includes('https')){
                image.src = "/images/placeholder.png";
                inputImage.classList.toggle("border-error",true);
            }
            else{
                inputImage.classList.toggle("border-error",false);
            }
        }
        else{
            inputImage.classList.toggle("border-error",true);
            image.src = "/images/placeholder.png";
        }
    });

    inputImage.addEventListener('change', () => {
        if (!inputImage.className.includes('border-error')){
            image.src= inputImage.value;
        }
        else{
            image.src = "/images/placeholder.png";
        }
    });
    image.addEventListener('error', () => {
         image.src = "/images/placeholder_error.png";

    });
}
// loadOptions -> modal: kategória + típus
export function loadOptions(recipes: Recipe[]){
    const selectCategory =  (document.getElementById("select-category") as HTMLSelectElement)!;
    const selectType = (document.getElementById("select-type") as HTMLSelectElement)!;
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

    selectCategory.innerHTML = `<option selected value="">Kategória választása..</option>
    <option  value="">-</option>`;
    selectType.innerHTML =  `<option selected value="">Elkészítési mód választása..</option>
      <option  value="">-</option>`;

    CategoriesAll.forEach(category => {
        selectCategory.innerHTML += `<option value="${category}">${category}</option>`;
    });

    TypeAll.forEach(type => {
           selectType.innerHTML += `<option value="${type}">${type}</option>`;
    });
}
// kategória + típus
function generateOptionsByEnums(selectList: HTMLSelectElement, firstOption: string, enumList: {}){
    selectList.innerHTML = `<option value="" selected disabled>-- ${firstOption} --</option>`;
    Object.values(enumList).sort().forEach(type => {
        const option = document.createElement('option');
        option.value = type!.toString();
        option.innerText = type!.toString();
        selectList.appendChild(option);
    });
        selectList.addEventListener('change', () => {
        if (selectList.options[selectList.selectedIndex].value.trim() != ""){
            selectList.classList.toggle('border-error',false);
        }
    });

}
//


document.getElementById('edit-btn')!.addEventListener('click', () => {
    // display -> edit, minden más megváltoztatni
    document.querySelectorAll('.details-display').forEach(element =>{
        element.classList.toggle('d-none',true);
    });
    document.querySelectorAll('.new-display').forEach(element =>{
        element.classList.toggle('d-none',false);
    });
     document.querySelectorAll('.edit-display').forEach(element =>{
        element.classList.toggle('d-none',false);
    });
});

// modal megjelenítése
async function renderModalByRecipe(recipeToRender: Recipe | null){
///          
    let modalAlert = document.getElementById("modal-alert")!;
    let modalAlertContent = document.getElementById("modal-alert-content")!;
    let alertClose = document.getElementById('alert-btn-close')! as HTMLButtonElement;
    let inputHour = document.getElementById("p-hour")! as HTMLInputElement;
    let inputMinute = document.getElementById("p-minute")! as HTMLInputElement;
    let inputImage = document.getElementById("p-imageurl")! as HTMLInputElement;
    let image = document.getElementById("modal-header-image")! as HTMLImageElement;
    let recipeName = document.getElementById("p-name")! as HTMLInputElement;
    let selectCategory = document.getElementById('select-cat')! as HTMLSelectElement;
    let selectType  = document.getElementById('select-type-x')! as HTMLSelectElement;
    let selectIngredients = document.getElementById('ingredients-list') as HTMLSelectElement;
    let inputStep = document.getElementById('input-step') as HTMLInputElement;
    let sumprice = document.getElementById('sum-price') as HTMLInputElement;
    selectedIds = [];
// reset 
    // új
    let clickedEdit = false;
    let hour = "";
    let minute = "";
    if (recipeToRender != null){
        let hourfromRecipe = Math.floor(recipeToRender.elkeszitesiIdoPerc / 60) ;
        minute = (recipeToRender.elkeszitesiIdoPerc - (hourfromRecipe * 60)).toString();
        hour = hourfromRecipe.toString();
    }
    //
    recipeName.value = recipeToRender? recipeToRender.nev: "";
    inputHour.value =  hour;
    inputMinute.value = minute;
    inputImage.value = recipeToRender? recipeToRender.kepUrl: "";
    inputStep.value = "";
    sumprice.innerText = "0";
    selectType.selectedIndex = 0;
    selectCategory.selectedIndex = 0;
    selectIngredients.selectedIndex = 0;
    image.src = recipeToRender ? recipeToRender.kepUrl:"/images/placeholder.png";

    document.getElementById('steps-list')!.innerHTML = "";
    document.getElementById('selected-ingredients')!.innerHTML = ""; 

    inputHour.classList.toggle('border-error',false);
    inputMinute.classList.toggle('border-error',false);
    inputImage.classList.toggle("border-error",false);
    recipeName.classList.toggle("border-error",false);
    selectIngredients.classList.toggle("border-error",false);
    inputStep.classList.toggle("border-error",false);
    selectCategory.classList.toggle("border-error",false);
    selectType.classList.toggle("border-error",false);
    
    modalAlert.style.display = "none";
    modalAlertContent.innerText = "";

    alertClose.addEventListener('click', () => {
        modalAlert.style.display = "none";
        modalAlertContent.innerText = "";
    });

/// recept neve
    recipeName.addEventListener('input', () => {
            recipeName.classList.toggle("border-error",false);
    });
/// kategória
    generateOptionsByEnums(selectCategory,"kategória",RecipeCategory);
/// elkészítési mód
    generateOptionsByEnums(selectType,"mód",RecipeType);
/// elkészítési idő
    inputHour.addEventListener('input', () => {
        inputHour.classList.toggle('border-error',false);
        inputMinute.classList.toggle('border-error',false);
        if (Number(inputHour.value) < 0){
            inputHour.classList.toggle('border-error',true);
        }
    });
    inputMinute.addEventListener('input',() => {
        inputHour.classList.toggle('border-error',false);
        inputMinute.classList.toggle('border-error',false);
        if (Number(inputMinute.value) < 0){
            inputMinute.classList.toggle('border-error',true);
        }
    });
/// kép url
    handleImageInputs();
    
/// ingredients
    try{
        let ingredients = await getAllIngredients();
        renderIngredients(ingredients);
    }
    catch(e){
        console.error(e);
        modalAlert.style.display = "block";
        modalAlertContent.innerText = e!.toString();
    }
/// steps
    let stepBtn = document.getElementById("btn-add-step") as HTMLButtonElement;
    stepBtn.classList.toggle("disabled",true);
    inputStep.addEventListener('input',() => {
        inputStep.classList.toggle('border-error',false);
            if (inputStep.value.trim() != ""){
                stepBtn.classList.toggle("disabled",false);
            }
            else{
                stepBtn.classList.toggle("disabled",true);
            }
        });
    stepBtn.removeEventListener('click',handleClickEvent);
    stepBtn.addEventListener('click', handleClickEvent); 

    // új
    if (recipeToRender != null){
        document.querySelectorAll('.new-display').forEach(element => {
            element.classList.toggle('d-none',true);
        });
        document.querySelectorAll('.details-display').forEach(element => {
            element.classList.toggle('d-none',false);
        });
        document.querySelectorAll('.edit-display').forEach(element => {
              element.classList.toggle('d-none',true);
        });
        
        document.getElementById('details-recipe-name')!.innerText = recipeToRender.nev;
        document.getElementById('edit-btn')!.addEventListener('click', () => {
            clickedEdit = true;
        });
        ///
        let index = 0;
        let fitIndexCategory = 0;
        let fitIndexType = 0;
        Object.values(RecipeCategory).sort().forEach(category => {
            if (category == recipeToRender.kategoria){
                fitIndexCategory = index;
            }
            index++;
        });

        selectCategory.selectedIndex = fitIndexCategory + 1;
        index = 0;
        Object.values(RecipeType).sort().forEach(type => {
            if (type == recipeToRender.tipus){
                fitIndexType = index;
            }
            index++;
        });
        selectType.selectedIndex = fitIndexType + 1;
        document.getElementById('recipe-category-badge')!.innerText = recipeToRender.kategoria;
        document.getElementById('recipe-type-badge')!.innerText = recipeToRender.tipus;
        ///
        let stringTime = Number(hour) > 0 ? `${hour} óra ${minute} perc`:`${minute} perc`;
        let sum = 0;
        recipeToRender.hozzavalok.forEach(hozzavalo => {
            sum += hozzavalo.mennyiseg * hozzavalo.hozzavalo.egysegAr;
            
        });
        sumprice.innerText = sum.toString();
        ///
        document.getElementById('details-time')!.innerText = stringTime;
        ///
        renderIngredientsDetails(recipeToRender.hozzavalok);
        ///
        renderSteps(recipeToRender);
    }
    else{
        document.querySelectorAll('.new-display').forEach(element => {
            element.classList.toggle('d-none',false);
        });
        document.querySelectorAll('.details-display').forEach(element => {
            element.classList.toggle('d-none',true);
        });
        document.querySelectorAll('.edit-display').forEach(element => {
            element.classList.toggle('d-none',true);
        });
        document.getElementById('details-recipe-name')!.innerText = "";
    }
//
}

// modal megnyitása: részletek
export async function openDetailsWindow(selectedRecipe: Recipe){
    await renderModalByRecipe(selectedRecipe);
}
// modal megnyitása: új
export function plusbuttonsEventListener(){
    const plusBtns = document.querySelectorAll('.plus-btn')!;
    plusBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            settime();
            await renderModalByRecipe(null); 
        });
              
    });
    document.getElementById("save-recipe")!.removeEventListener('click', saveRecipe);
    document.getElementById("save-recipe")!.addEventListener('click', saveRecipe);

}

// edit-cancel-btn eventlistener ->minden más display megváltoztatása
// mentés ->validáció ->> alert/menteni + display details visszaállítása
// 