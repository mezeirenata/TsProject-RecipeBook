
import type { Ingredient } from '../models/ingredient';
import { getAllIngredients, searchIngredientById } from '../api/http.service';

let globalSearchValue = "";
const tableContainer = document.getElementById("tableContainer") as HTMLDivElement;
const notFound = document.getElementById("not-found") as HTMLDivElement;
const zeroFound = document.getElementById("zero-found") as HTMLDivElement;

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
  // TODO: printError() - reni?
  try {
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
    // TODO: printError() 
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