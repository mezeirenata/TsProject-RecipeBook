
import type { Ingredient } from '../models/ingredient';
import { getAllIngredients, searchIngredientById } from '../api/http.service';

let globalSearchValue = "";
const tableContainer = document.getElementById("tableContainer") as HTMLDivElement;
const notFound = document.getElementById("not-found") as HTMLDivElement;
const zeroFound = document.getElementById("zero-found") as HTMLDivElement;

function printError(eMessage:string){
  document.getElementById('tableContainer')!.classList.toggle('d-none',true);
  document.getElementById('api-error')!.classList.toggle('d-none',false);
  document.getElementById('api-error')!.innerText = eMessage;   
}

function hideError(){
  document.getElementById('tableContainer')!.classList.toggle('d-none',false);
  document.getElementById('api-error')!.classList.toggle('d-none',true);
}

function showClearBtn() {
  const show = globalSearchValue === "";
  (document.getElementById("btn-clear") as HTMLButtonElement).classList.toggle("d-none", show);
}

function printNotFound(searchedValue: string) {
  document.getElementById("not-found-message")!.innerHTML = `Nincs találat. <span>("${searchedValue}")</span>`;
  notFound.classList.toggle("d-none", false);
  tableContainer.classList.toggle("d-none", true);
  zeroFound.classList.toggle("d-none", true);
}

function printEmpty() {
  document.getElementById('ingredientsTable')!.innerHTML = renderAddIngredientRow();
  zeroFound.classList.toggle("d-none", false);
  tableContainer.classList.toggle("d-none", false);
  notFound.classList.toggle("d-none", true);
}

function printResults(ingredients: Ingredient[], renderFn: (ingredients: Ingredient[]) => void) {
  tableContainer.classList.toggle("d-none", false);
  notFound.classList.toggle("d-none", true);
  zeroFound.classList.toggle("d-none", true);
  renderFn(ingredients);
}

async function trySearch(renderFunction: (ingredients: Ingredient[]) => void) {
  try {
    hideError();
    const allData = await getAllIngredients();

    if (globalSearchValue === "") {
      if (allData.length === 0) {
        printEmpty();
      } else {
        printResults(allData, renderFunction);
      }
      return;
    }

    let results: Ingredient[];

    if (globalSearchValue.startsWith("#")) {
      const id = globalSearchValue.slice(1).trim();
      if (id === "" || id.includes(' ')) {
        results = [];
      } 
      else {
        try {
          const single = await searchIngredientById(id);
          results = [single];
        } catch {
          results = [];

        }
      }

    }
    else {
      results = allData.filter(i =>
        i.nev.toLowerCase().includes(globalSearchValue.toLowerCase())
      );
    }

    if (results.length === 0) {
      if (allData.length === 0) {
        printEmpty();
      } else {
        printNotFound(globalSearchValue);
      }
    } else {
      printResults(results, renderFunction);
    }

  } catch (e) {
    console.error((e as Error).message);
    printError((e as Error).message);
  }
  if (!globalSearchValue.startsWith("#") && globalSearchValue.trim() != "") {
    console.log("most")
  } 
  console.log("lorem")
}

export async function initSearch(renderFn: (ingredients: Ingredient[]) => void) {
  const searchInput = document.getElementById("search-input") as HTMLInputElement;
  const btnSearch = document.getElementById("btn-search") as HTMLButtonElement;
  const btnClear = document.getElementById("btn-clear") as HTMLButtonElement;

  const run = async () => {
    globalSearchValue = searchInput.value.trim();
    showClearBtn();
    await trySearch(renderFn);
  };

  searchInput.addEventListener("input", () => {
    globalSearchValue = searchInput.value.trim();
    showClearBtn();
  });
  searchInput.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      await run();
      console.log("button pressed: " + e.key)
      console.log("global value: " + globalSearchValue);
    }
  });
  btnSearch.addEventListener("click", async() => {await run()});
  btnClear.addEventListener("click", async() => {
    searchInput.value = "";
    globalSearchValue = "";
    showClearBtn();
    await trySearch(renderFn);
  });

  await trySearch(renderFn);
}
const UNITS = ['kg', 'dkg', 'g', 'l', 'dl', 'cl', 'ml'];
function renderUnitOptions(selectedUnit = 'kg') {
  return UNITS
    .map(unit => `<option value="${unit}" ${unit === selectedUnit ? 'selected' : ''}>${unit}</option>`)
    .join('');
}

function renderAddIngredientRow() { //első a desktop, második a mobil 
  return `
    <tr class="table-light d-none d-md-table-row">
      <th class="${CLASSES.cellAlign}" scope="row">#</th>
      <td class="${CLASSES.cellAlignTop}">
        <div class="position-relative">
          <input data-new-field="name" type="text" class="${CLASSES.input}" placeholder="Név">
          <div data-new-field="name-error" class="invalid-feedback text-start">Kérem adja meg a nevet!</div>
        </div>
      </td>
      <td class="${CLASSES.cellAlignTop}">
        <select data-new-field="unit" class="${CLASSES.select}">
          ${renderUnitOptions()}
        </select>
      </td>
      <td class="${CLASSES.cellAlignTop}">
        <div class="position-relative">
          <input data-new-field="price" type="number" min="0" class="${CLASSES.input}" placeholder="Ár">
          <div data-new-field="price-error" class="invalid-feedback text-start">Kérem adja meg az árat!</div>
        </div>
      </td>
      <td class="${CLASSES.cellAlignTop}">
        <button type="button" data-action="add" class="${CLASSES.btnAdd}"><i class="${CLASSES.iconAdd} pointer-events-none"></i></button>
      </td>
    </tr>
    
    <tr class="table-light d-md-none">
      <td colspan="5" class="${CLASSES.cellAlignTop} p-2">
        <div class="d-flex flex-column gap-2">
          <div class="position-relative">
            <input data-new-field="name" type="text" class="${CLASSES.input}" placeholder="Név">
            <div data-new-field="name-error" class="invalid-feedback text-start">Kérem adja meg a nevet!</div>
          </div>
          <div class="row g-2">
            <div class="col-6">
              <select data-new-field="unit" class="${CLASSES.select}">
                ${renderUnitOptions()}
              </select>
            </div>
            <div class="col-6">
              <div class="position-relative">
                <input data-new-field="price" type="number" min="0" class="${CLASSES.input}" placeholder="Ár">
                <div data-new-field="price-error" class="invalid-feedback text-start">Kérem adja meg az árat!</div>
              </div>
            </div>
          </div>
          <button type="button" data-action="add" class="${CLASSES.btnAdd} w-100"><i class="${CLASSES.iconAdd} pointer-events-none"></i></button>
        </div>
      </td>
    </tr>
  `;
}

const CLASSES = {
  cellAlign: 'align-middle text-center',
  cellAlignTop: 'align-top text-center',
  cellAlignMuted: 'align-middle text-center text-muted',
  actions: 'align-middle text-center action-buttons',
  input: 'form-control',
  select: 'form-select',
  btnAdd: 'btn btn-outline-success',
  btnEdit: 'btn btn-outline-warning me-1',
  btnDelete: 'btn btn-outline-danger',
  btnSave: 'btn btn-outline-warning me-1',
  btnCancel: 'btn btn-outline-danger',
  iconAdd: 'bi bi-plus-lg',
  iconEdit: 'bi bi-pencil',
  iconDelete: 'bi bi-trash',
  iconSave: 'bi bi-floppy',
  iconCancel: 'bi bi-x-circle',
  boldGreen: 'fw-bold text-success',
};

