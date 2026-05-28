// szia reni ha ezt látod a kód még nagyon basic plusz lehe thogy azért csúnya

import type { Ingredient } from './models/ingredient';
import { getAllIngredients, deleteIngredient } from './api/http.service';

function renderIngredients(ingredients: Ingredient[]) {
  const IngredientsTable = document.getElementById('ingredientsTable') as HTMLTableElement;

  ingredients.forEach(i => {
    IngredientsTable.innerHTML +=
      `
      <tr>
          <th class="align-middle text-center" scope="row">${i.id}</th>
          <td class="align-middle text-center">${i.nev}</td>
          <td class="align-middle text-center">${i.mertekegyseg}</td>
          <td class="align-middle text-center">${i.egysegAr}</td>
          <td class="align-middle text-center ">
            <button id="editBtn/${i.id}" type="button" class="btn btn-outline-warning me-1"><i class="bi bi-pencil"></i></button>
            <button id="deleteBtn/${i.id}" type="button" class="btn btn-outline-danger"><i class="bi bi-trash"></i></button>
          </td>
        </tr>
      `
    
    // const deleteButton = document.getElementById("deleteBtn/" + i.id) as HTMLButtonElement;
    // deleteButton.addEventListener("click", async () => {
    //   try {
    //     await deleteIngredient(i.id);
    //   } catch (error) {
    //     console.error("Error deleting ingredient:", error);
    //   }
    // });
    // MÉG nem működik

  });
}

renderIngredients(await getAllIngredients());
