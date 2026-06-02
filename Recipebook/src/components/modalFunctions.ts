import { editRecipe, getAllIngredients, uploadRecipe } from "../api/http.service";
import { fileExtensions, RecipeCategory, RecipeType } from "../models/enum";
import type { Ingredient } from "../models/ingredient";
import type { Recipe } from "../models/recipe";
import { settime } from "./other";

let selectedIds:string[] = [];
let openedRecipe: Recipe | null = null;
let ingredients: Ingredient[] = [];
let modificationSaved = false;
try{
    ingredients = await getAllIngredients();
}
catch{
    console.error("Hozzávalók betöltése nem sikerült.");
}


// ❖━━━━━━━━━━━━━━━━━━ Mentés ━━━━━━━━━━━━━━━━━━❖
function checkFields(): boolean{
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
    
    let emptyField = false;
    let emptyList = false;
    let numberError = false;
    let numberCantBeConverted = false;
    let hourIsNull = false;
    let minuteisBig = false;
    let hour = 0;
    let minute = 0;

    hideAlert();
    alertClose.addEventListener('click', () => {
            hideAlert();
        });

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
        emptyList= true;
    }
    if (uploadedSteps.length == 0){
        inputStep.classList.toggle('border-error',true);
        emptyList = true;
    }

// számok megvizsgálása
    try{
        if (inputHour.value.includes('.')) throw new Error("hour");
        if (inputMinute.value.includes('.')) throw new Error("minute");
        hour = Number(inputHour.value);
        minute = Number(inputMinute.value);
        if (!Number.isInteger(hour)) throw new Error("hour");
        if (!Number.isInteger(minute)) throw new Error("minute");
    }
    catch(e){
        if ((e as Error).message == "hour") inputHour.classList.toggle('border-error',true);
        if ((e as Error).message == "minute") inputMinute.classList.toggle('border-error',true);
        numberCantBeConverted = true;
    }

    if (Number(inputHour.value) < 0 ){
        inputHour.classList.toggle('border-error',true);
        numberError = true;
    }
    if (Number(inputMinute.value) < 0){
        inputMinute.classList.toggle('border-error',true);
        numberError = true;
    }
    if (Number(inputMinute.value) == 0 && Number(inputHour.value) == 0){
        hourIsNull = true;
        inputHour.classList.toggle('border-error',true);
        inputMinute.classList.toggle('border-error',true);
    }
    if (Number(inputMinute.value) > 59){
        minuteisBig = true;
        inputMinute.classList.toggle('border-error',true);
    }
    try{
        ingredientsQuantities.forEach(element => {
            if ((element as HTMLInputElement).value == ""){
                emptyField = true;
                element.classList.toggle('border-error',true);
            }
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
    if (emptyField){
        showAlert("Nem maradhat üresen kötelező mező!");
        return false;
    }
    if (emptyList){
        showAlert("Legalább 1 elemnek szerepelnie kell a kötelező listákban!");
        return false;
    }
    if (numberCantBeConverted){
        showAlert("Helytelen a megadott számérték!");
        return false;
    }
    if (hourIsNull){
        showAlert("Nem lehet az elkészítés ideje 0 perc!");
        return false;
    }
   
    if (numberError){
        showAlert("Nem adhat meg 0 vagy negatív értéket!")
        return false;
    }
    if (minuteisBig){
        showAlert("A megadott perc maximum 59 lehet!");
        return false;
    }
    return true; 
}
export async function saveRecipe():Promise<boolean>{
    if (!checkFields()) return false;
    let image = (document.getElementById("modal-header-image")! as HTMLImageElement).src;
    let recipeName = (document.getElementById('p-name') as HTMLInputElement).value;
    let stepsList: string[] = [];
    let ingredientsList: {hozzavalo: Ingredient,mennyiseg:number}[] = [];
    let minutes = Number((document.getElementById('p-hour') as HTMLInputElement).value)*60 + Number((document.getElementById('p-minute') as HTMLInputElement).value);
    let category = (document.getElementById('select-cat') as HTMLSelectElement).value;
    let type = (document.getElementById('select-type-x') as HTMLSelectElement).value;
    // lépések
    document.querySelectorAll('.step-item').forEach(step => {
        stepsList.push((step as HTMLLIElement).innerText);
    });
    // hozzávalók
    document.querySelectorAll('.ingredient-item').forEach(ingredientLi =>{
        let ingredientId = ingredientLi.id.split("list-ingredient-")[1];
        let ingredient = getIngredientById(ingredientId);
        let quantity = Number((document.getElementById(`input-quantity-${ingredient.id}`) as HTMLInputElement).value);
        ingredientsList.push({hozzavalo: ingredient, mennyiseg: quantity});    
    });
    // 
    try{
        if (openedRecipe == null){
            await uploadRecipe(recipeName,minutes,stepsList,type,category,image,ingredientsList);
            (document.getElementById('btn-close-modal') as HTMLButtonElement).click();
            openedRecipe = null;
        }
        else{
            let tobeModified = openedRecipe;
            let og = JSON.stringify(openedRecipe);
            tobeModified.nev = recipeName;
            tobeModified.elkeszitesiIdoPerc = minutes;
            tobeModified.kategoria = category;
            tobeModified.tipus = type;
            tobeModified.kepUrl = image;
            tobeModified.elkeszites = stepsList;
            tobeModified.hozzavalok = ingredientsList;
            await editRecipe(tobeModified);
            if (JSON.stringify(tobeModified) != og){
                modificationSaved = true;
            }
            openedRecipe = tobeModified;
            detailView();
            renderModalByRecipe(openedRecipe);
        }
    }
    catch(e){
        showAlert("Nem sikerült menteni a receptet!","danger","success");
        return false;     
    }
    return true;
}   
// ❖━━━━━━━━━━━━━━━━━━ Hozzávalók ━━━━━━━━━━━━━━━━━━❖
function renderIngredientsDetails(ingredients: {hozzavalo: Ingredient,mennyiseg:number}[]){
    let ingredientList = document.getElementById('selected-ingredients')! as HTMLUListElement;
    ingredientList.classList.toggle('show',true);
    ingredientList.innerHTML = "";
    selectedIds = [];
    ingredients.forEach(ingredientElement => {
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
    });
}
export function renderIngredients(ingredients: Ingredient[],ingredientsFromRecipe: {hozzavalo: Ingredient,mennyiseg:number}[] |null){
    let selectedIngredients = document.getElementById("selected-ingredients")! as HTMLUListElement;
    let plusBtn =  (document.getElementById('btn-add-ingredient') as HTMLButtonElement)!;
    let listIngredients = (document.getElementById("ingredients-list") as HTMLSelectElement)!;
    selectedIds = [];
    selectedIngredients.innerHTML = "";

    plusBtn.classList.toggle("disabled",true);
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
         if (selectedoption.value != "" && !selectedIds.includes(selectedoption.value.split("ingredient-option-")[1])){
            plusBtn.classList.toggle("disabled",false);    
        }
        else plusBtn.classList.toggle("disabled",true);
    });
    if (ingredientsFromRecipe != null){
        ingredientsFromRecipe.forEach(ingredient => {
            document.getElementById('ingredients-list')!.classList.toggle('border-error',false);
            addIngredientToList(ingredient.hozzavalo, ingredient.mennyiseg,selectedIngredients);
            plusBtn.classList.toggle("disabled", true);  
        })
    }
// hozzáadás
    plusBtn.addEventListener('click', () => {
        let selectedoption = listIngredients.options[listIngredients.selectedIndex];
        let ingredientId = selectedoption.value.split("-")[2];
        
        let ingredient = getIngredientById(ingredientId);
        addIngredientToList(ingredient, 0, selectedIngredients);
        if (selectedIds.includes(ingredient.id)){
            plusBtn.classList.toggle("disabled",true);
            listIngredients.selectedIndex = 0;
        }    
    });  
}
function addIngredientToList(ingredient:Ingredient, mennyiseg: number, selectedIngredients: HTMLUListElement) {
    document.getElementById('ingredients-list')!.classList.toggle('border-error', false);
    if (selectedIds.includes(ingredient.id)) return false;
    let li = document.createElement('li');
    let firstRow = document.createElement('div');
    let p = document.createElement('p');
    let cancelDiv = document.createElement('div');
    let secondRow = document.createElement('div');
    let quantityDiv = document.createElement('div');
    let label = document.createElement('label');
    let priceDiv = document.createElement('div');
    
    selectedIds.push(ingredient.id);

    firstRow.className = "my-auto d-flex flex-nowrap w-100 fw-bold mb-1";
    li.className = "list-group-item d-flex flex-wrap ingredient-item pb-3";
    li.id = "list-ingredient-" + ingredient.id;

    p.className = "mb-0 overflow-x-auto w-75 text-success";
    p.innerText = ingredient.nev;
    
    cancelDiv.className = "ms-auto btn btn-outline-danger rounded my-auto p-0 px-1 fw-bold";
    cancelDiv.id = "cancel-ingredient-" + ingredient.id;
    cancelDiv.innerHTML = '<i class="bi bi-x-lg"></i>';
    
    secondRow.className = "d-flex flex-nowrap w-100";
    
    quantityDiv.className = "d-flex flex-nowrap w-50";
    
    label.className = "me-2 my-auto";
    label.innerText = `mennyiség (${ingredient.mertekegyseg}): `;
    quantityDiv.appendChild(label);
    quantityDiv.innerHTML += `<input type="number" placeholder="0" min="0" class="form-control input-quantity" value="${mennyiseg}" id="input-quantity-${ingredient.id}" style="width: 35%;">`;
    
    priceDiv.className = "d-flex flex-nowrap w-50";
    priceDiv.innerHTML = `<span for="" class="ms-auto mt-auto badge p-2  bg-secondary-subtle text-dark">teljes ár: <span id="${ingredient.id}-price" class="price-by-ingredient">${mennyiseg * ingredient.egysegAr}</span> Ft</span>`;
    
    firstRow.appendChild(p);
    firstRow.appendChild(cancelDiv);
    li.appendChild(firstRow);
    secondRow.appendChild(quantityDiv);
    secondRow.appendChild(priceDiv);
    li.appendChild(secondRow);
    selectedIngredients.appendChild(li);

    //// törlés
    document.getElementById("cancel-ingredient-" + ingredient.id)!.addEventListener('click', () => {
        let tobeDeletedLi = document.getElementById('list-ingredient-' + ingredient.id);
        let newIngredients:string[] = [];
        selectedIngredients.removeChild(tobeDeletedLi!);
        selectedIds.forEach(id => {
            if (ingredient.id != id) newIngredients.push(id);
        });
        selectedIds = newIngredients;
        refreshSumPrice();
        settime();
    });
    /// mennyiség változtatása
    document.getElementById("input-quantity-" + ingredient.id)!.addEventListener('input', () => {
        let inputQuantity = document.getElementById("input-quantity-" + ingredient.id) as HTMLInputElement;
        if (Number(inputQuantity.value) <= 0) {
            inputQuantity.classList.toggle("border-error", true);
            document.getElementById(ingredient.id + "-price")!.innerText = "0";
        }
        else {
            inputQuantity.classList.toggle("border-error", false);
            document.getElementById(ingredient.id + "-price")!.innerText = (ingredient.egysegAr * Number(inputQuantity.value)).toString();
        }
        refreshSumPrice();
        settime();
    });
    refreshSumPrice();
}
function getIngredientById(id:string):Ingredient{
    let returnableIngredient = ingredients[0];
    ingredients.forEach(ingredient => {
        if (id == ingredient.id) returnableIngredient = ingredient;
    });
    return returnableIngredient;
}
// ❖━━━━━━━━━━━━━━━━━━ Elkészítés lépései ━━━━━━━━━━━━━━━━━━❖
export function stepaddBtn(){
    let inputStep = document.getElementById("input-step") as HTMLInputElement;
    renderEditableStep(inputStep.value);
    settime();  
    inputStep.value = "";
}
function renderEditableStep(step:string){
    let stepsList = document.getElementById("steps-list") as HTMLOListElement;
    let li = document.createElement('li');
    let stepItems = document.querySelectorAll(".step-item");
    let maxid = 0;
    let textDiv = document.createElement('div');
    let removeStep = document.createElement('div');

    stepItems.forEach(item => {
        if (Number(item.id) > maxid){
            maxid = Number(item.id);
        }
    });

    li.className = "rounded py-2 align-items-center list-group-item  d-flex flex-nowrap step-item";
    li.id = (maxid + 1).toString();

    textDiv.className = "ms-2 my-auto overflow-x-auto";
    textDiv.innerText = step;
    
    removeStep.className = "ms-auto btn btn-outline-danger my-auto p-0 px-1 fw-bold";
    removeStep.id = `delete-step-${li.id}`; 
    removeStep.innerHTML = `<i class="bi bi-x-lg"></i>`;
    
    li.appendChild(textDiv); 
    li.appendChild(removeStep);   
    stepsList.appendChild(li);

    document.getElementById(`delete-step-${li.id}`)!.addEventListener('click', () => {
        stepsList.removeChild(li);
    });
}
function renderSteps(recipeToRender: Recipe){
    let stepList = document.getElementById('steps-list')! as HTMLOListElement;
    stepList.innerHTML = "";
    recipeToRender.elkeszites.forEach(step =>{
        let li = document.createElement('li');
        let textDiv = document.createElement('div');
        li.className = "rounded py-2 align-items-center list-group-item  d-flex flex-nowrap step-item";
        
        textDiv.className = "ms-2 my-auto overflow-x-auto";
        textDiv.innerText = step;
        
        li.appendChild(textDiv); 
        stepList.appendChild(li);
    });
}
function renderEditableSteps(Steps:string[]){
    let stepsList = document.getElementById("steps-list") as HTMLOListElement;
    stepsList.innerHTML = "";
    Steps.forEach(step => {
        renderEditableStep(step);
    });
    settime();  
}
function resetStepBtn(){
let stepBtn = document.getElementById("btn-add-step") as HTMLButtonElement;
    let inputStep = document.getElementById('input-step') as HTMLInputElement;
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
    stepBtn.removeEventListener('click',stepaddBtn);
    stepBtn.addEventListener('click', stepaddBtn); 
}
// ❖━━━━━━━━━━━━━━━━━━ Load options ━━━━━━━━━━━━━━━━━━❖
export function loadOptions(recipes: Recipe[]){
    const selectCategory =  (document.getElementById("select-category") as HTMLSelectElement)!;
    const selectType = (document.getElementById("select-type") as HTMLSelectElement)!;
    let CategoriesAll:string[] = [];
    let TypeAll : string[] = [];

    recipes.forEach(recipe => {
        if (!CategoriesAll.includes(recipe.kategoria)) CategoriesAll.push(recipe.kategoria);
        if (!TypeAll.includes(recipe.tipus)) TypeAll.push(recipe.tipus);
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
function generateOptionsByEnums(selectList: HTMLSelectElement, firstOption: string, enumList: {}){
    selectList.innerHTML = `<option value="" selected disabled>-- ${firstOption} --</option>`;

    Object.values(enumList).sort().forEach(type => {
        const option = document.createElement('option');
        option.value = type!.toString();
        option.innerText = type!.toString();
        selectList.appendChild(option);
    });
        selectList.addEventListener('change', () => {
        if (selectList.options[selectList.selectedIndex].value.trim() != "") selectList.classList.toggle('border-error',false);
    });

}
// ❖━━━━━━━━━━━━━━━━━━ Egyéb ━━━━━━━━━━━━━━━━━━❖
function overwritePrints(){
    if (openedRecipe != null){
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
        // selectedIds = [];
        
        let hourfromRecipe = Math.floor(openedRecipe.elkeszitesiIdoPerc / 60) ;
        let hour = "";
        let minute = "";
        let index = 0;
        let fitIndexCategory = 0;
        let fitIndexType = 0;

        minute = (openedRecipe.elkeszitesiIdoPerc - (hourfromRecipe * 60)).toString();
        hour = hourfromRecipe.toString();
        
        recipeName.value = openedRecipe.nev;
        inputHour.value =  hour;
        inputMinute.value = minute;
        inputImage.value = openedRecipe.kepUrl;
        inputStep.value = "";
        selectIngredients.selectedIndex = 0;
        image.src = openedRecipe.kepUrl;
    
        inputHour.classList.toggle('border-error',false);
        inputMinute.classList.toggle('border-error',false);
        inputImage.classList.toggle("border-error",false);
        recipeName.classList.toggle("border-error",false);
        selectIngredients.classList.toggle("border-error",false);
        inputStep.classList.toggle("border-error",false);
        selectCategory.classList.toggle("border-error",false);
        selectType.classList.toggle("border-error",false);


        detailView();
        document.getElementById('details-recipe-name')!.innerText = openedRecipe.nev;

        Object.values(RecipeCategory).sort().forEach(category => {
            if (category == openedRecipe!.kategoria){
                fitIndexCategory = index;
            }
            index++;
        });
        selectCategory.selectedIndex = fitIndexCategory + 1;

        index = 0;
        Object.values(RecipeType).sort().forEach(type => {
            if (type == openedRecipe!.tipus){
                fitIndexType = index;
            }
            index++;
        });
        selectType.selectedIndex = fitIndexType + 1;

        document.getElementById('recipe-category-badge')!.innerText = openedRecipe!.kategoria;
        document.getElementById('recipe-type-badge')!.innerText = openedRecipe!.tipus;
        
        let stringTime = Number(hour) > 0 ? `${hour} óra ${minute} perc`:`${minute} perc`;
        let sum = 0;
        openedRecipe!.hozzavalok.forEach(hozzavalo => {
            sum += hozzavalo.mennyiseg * hozzavalo.hozzavalo.egysegAr; 
        });
        sumprice.innerText = sum.toString();
        
        document.getElementById('details-time')!.innerText = stringTime;
        
        renderIngredientsDetails(openedRecipe!.hozzavalok);
        renderSteps(openedRecipe!);
    }
}
function clearInputs(){
    let inputHour = document.getElementById("p-hour")! as HTMLInputElement;
    let inputMinute = document.getElementById("p-minute")! as HTMLInputElement;
    let inputImage = document.getElementById("p-imageurl")! as HTMLInputElement;
    let recipeName = document.getElementById("p-name")! as HTMLInputElement;
    let selectCategory = document.getElementById('select-cat')! as HTMLSelectElement;
    let selectType  = document.getElementById('select-type-x')! as HTMLSelectElement;
    let selectIngredients = document.getElementById('ingredients-list') as HTMLSelectElement;
    let inputStep = document.getElementById('input-step') as HTMLInputElement;
    let sumprice = document.getElementById('sum-price') as HTMLInputElement;
    let image = document.getElementById('modal-header-image') as HTMLImageElement;
    selectedIds = [];
// reset 
    recipeName.value = "";
    inputHour.value =  "";
    inputMinute.value = "";
    inputImage.value =  "";
    image.src = "/images/placeholder.png";
    inputStep.value = "";
    sumprice.innerText = "0";
    selectType.selectedIndex = 0;
    selectCategory.selectedIndex = 0;
    selectIngredients.selectedIndex = 0;

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
   
    generateOptionsByEnums(selectCategory,"kategória",RecipeCategory);
    generateOptionsByEnums(selectType,"mód",RecipeType); 

    
}
function showAlert(message: string, bgcolor: string = "danger", removeColor: string = "success") {
    document.getElementById("modal-alert")!.classList.toggle(`alert-${bgcolor}`,true);
    document.getElementById("modal-alert")!.classList.toggle(`alert-${removeColor}`,false);
    document.getElementById("modal-alert")!.style.display = "block";
    document.getElementById("modal-alert-content")!.innerText = message;
}
function hideAlert() {
    document.getElementById('modal-alert')!.classList.toggle('alert-success',false);
    document.getElementById('modal-alert')!.classList.toggle('alert-danger',true);
    document.getElementById("modal-alert")!.style.display = "none";
    document.getElementById("modal-alert-content")!.innerText = "";
}
function refreshSumPrice() {
    let sumPrice = 0;
    document.querySelectorAll(".price-by-ingredient").forEach(element => {
        sumPrice += Number((element as HTMLSpanElement).innerText);
    });
    document.getElementById("sum-price")!.innerText = sumPrice.toString();
}
export function handleImageInputs(){
    let inputImage = document.getElementById("p-imageurl")! as HTMLInputElement;
    let image = document.getElementById("modal-header-image")! as HTMLImageElement;
   
    inputImage.addEventListener('input',() => {
        inputImage.classList.toggle("border-error",false);
        if (inputImage.value != ""){
            let fitExtension = false;
            try{
                let url = new URL(inputImage.value);
                Object.values(fileExtensions).forEach(extension => {
                    if (extension == url.pathname) fitExtension = true;
                });
            }
            catch{
                fitExtension = false;
            }

            if (!fitExtension || !inputImage.value.includes('https')){
                image.src = "/images/placeholder_error.png";
                inputImage.classList.toggle("border-error",true);
            }
            else inputImage.classList.toggle("border-error",false);  
        }
        else{
            image.src = "/images/placeholder.png";
        }
    });

    inputImage.addEventListener('change', () => {
        if (!inputImage.className.includes('border-error')) image.src= inputImage.value;
        else image.src = "/images/placeholder_error.png";
    });

    image.addEventListener('error', () => {
         image.src = "/images/placeholder_error.png";
    });
}
// ❖━━━━━━━━━━━━━━━━━━ Modal ━━━━━━━━━━━━━━━━━━❖
document.getElementById('btn-close-modal-shown')!.addEventListener('click', () => {
    openedRecipe = null;
    plusbuttonsEventListener();
});
document.getElementById('recipe-modal')!.addEventListener('hidden.bs.modal', () => {
    openedRecipe = null;
    plusbuttonsEventListener();
});

// modal megjelenítése
async function renderModalByRecipe(recipeToRender: Recipe | null){     
    let alertClose = document.getElementById('alert-btn-close')! as HTMLButtonElement;
    let inputHour = document.getElementById("p-hour")! as HTMLInputElement;
    let inputMinute = document.getElementById("p-minute")! as HTMLInputElement;
    let image = document.getElementById("modal-header-image")! as HTMLImageElement;
    let recipeName = document.getElementById("p-name")! as HTMLInputElement;
    let selectCategory = document.getElementById('select-cat')! as HTMLSelectElement;
    let selectType  = document.getElementById('select-type-x')! as HTMLSelectElement;
    let inputStep = document.getElementById('input-step') as HTMLInputElement;

    clearInputs();
    
    if (modificationSaved){
        showAlert("Sikeres módosítás!","success","danger");
    }
    else{
        hideAlert();
    }
    modificationSaved = false;
    if (recipeToRender == null) image.src = "/images/placeholder.png";
    
    alertClose.addEventListener('click', () => {
        hideAlert();
    });

/// recept neve
    recipeName.addEventListener('input', () => {
        recipeName.classList.toggle("border-error",false);
    });
/// select options
    generateOptionsByEnums(selectCategory,"kategória",RecipeCategory);
    generateOptionsByEnums(selectType,"mód",RecipeType);
/// elkészítési idő
    inputHour.addEventListener('input', () => {
        inputHour.classList.toggle('border-error',false);
        inputMinute.classList.toggle('border-error',false);
        if (Number(inputHour.value) < 0) inputHour.classList.toggle('border-error',true);
    });
    inputMinute.addEventListener('input',() => {
        inputHour.classList.toggle('border-error',false);
        inputMinute.classList.toggle('border-error',false);
        if (Number(inputMinute.value) < 0) inputMinute.classList.toggle('border-error',true);
    });
/// kép url
    handleImageInputs();
/// ingredients
    try{
        let ingredients = await getAllIngredients();
        renderIngredients(ingredients, recipeToRender? recipeToRender.hozzavalok:null);
    }
    catch(e){
        console.error(e);
        showAlert((e as Error).message, "danger","success");
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
    stepBtn.removeEventListener('click',stepaddBtn);
    stepBtn.addEventListener('click', stepaddBtn); 
// új
    if (recipeToRender != null){
        openedRecipe = recipeToRender;
        detailView();
        document.getElementById('selected-ingredients')!.innerHTML = "";
        overwritePrints();
        renderIngredientsDetails(openedRecipe!.hozzavalok);
        renderSteps(openedRecipe);
    }
    else{
        newView();
        document.getElementById('details-recipe-name')!.innerText = "";
    }
}
// részletek
export async function openDetailsWindow(selectedRecipe: Recipe){
    if (openedRecipe == null) openedRecipe = selectedRecipe;
    selectedIds = [];
    document.getElementById('selected-ingredients')!.innerHTML = "";
    document.getElementById('steps-list')!.innerHTML = "";
    await renderModalByRecipe(openedRecipe);
    detailView();
    (document.getElementById('cancel-edit-btn') as HTMLDivElement)!.addEventListener('click',  async () => {
        await renderModalByRecipe(openedRecipe);
        detailView();
    });
    document.getElementById('edit-btn')!.removeEventListener('click', editBtnEvent);
    document.getElementById('edit-btn')!.addEventListener('click', editBtnEvent);
    (document.getElementById('save-edit-btn') as HTMLDivElement)!.addEventListener('click', async () => {
        await saveRecipe();
    });
}
async function editBtnEvent(){
    document.getElementById('selected-ingredients')!.innerHTML = "";
    document.getElementById('steps-list')!.innerHTML = "";
    renderIngredients(ingredients,openedRecipe!.hozzavalok);
    renderEditableSteps(openedRecipe!.elkeszites);
    await editView();
}
// új
export async function plusbuttonsEventListener(){
    openedRecipe = null;
    hideAlert();
    newView();
    clearInputs();
    try{
        renderIngredients(await getAllIngredients(),null);
    }
    catch(e){
        showAlert((e as Error).message,"danger","success");
    }
    resetStepBtn();
    handleImageInputs();
    const plusBtns = document.querySelectorAll('.plus-btn')!;
    plusBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            settime();
            openedRecipe = null;
            await renderModalByRecipe(openedRecipe); 
        });
    });
    document.getElementById("save-recipe")!.removeEventListener('click', saveRecipe);
    document.getElementById("save-recipe")!.addEventListener('click', saveRecipe);
}
function detailView(){
    document.querySelectorAll('.new-display').forEach(element => {
        element.classList.toggle('d-none',true);
        });
    document.querySelectorAll('.details-display').forEach(element => {
        element.classList.toggle('d-none',false);
    });
    document.querySelectorAll('.edit-display').forEach(element => {
        element.classList.toggle('d-none',true);
    });
    document.querySelectorAll('.only-new-display').forEach(element => {
        element.classList.toggle('d-none',true);
    });
    document.getElementById('btn-close-modal-shown')!.classList.toggle('d-none',false);
}
async function editView(){
    hideAlert();
    document.querySelectorAll('.details-display').forEach(element =>{
        element.classList.toggle('d-none',true);
    });
    document.querySelectorAll('.new-display').forEach(element =>{
        element.classList.toggle('d-none',false);
    });
    document.querySelectorAll('.only-new-display').forEach(element => {
        element.classList.toggle('d-none',true);
    });
     document.querySelectorAll('.edit-display').forEach(element =>{
        element.classList.toggle('d-none',false);
    });
    document.getElementById('btn-close-modal-shown')!.classList.toggle('d-none',false);  
}
function newView(){
    document.querySelectorAll('.new-display').forEach(element => {
        element.classList.toggle('d-none',false);
    });
    document.querySelectorAll('.details-display').forEach(element => {
        element.classList.toggle('d-none',true);
    });
    document.querySelectorAll('.edit-display').forEach(element => {
        element.classList.toggle('d-none',true);
    });
    document.querySelectorAll('.only-new-display').forEach(element => {
        element.classList.toggle('d-none',false);
    });
}

// alert törlésnél
// alert hozzáadásnál
// api hibák
// ingredients: keresés + reszponzivitás + üres