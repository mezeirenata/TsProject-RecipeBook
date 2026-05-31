import type { Ingredient } from './models/ingredient';
import { getAllIngredients, deleteIngredient, uploadIngredient, editIngredient } from './api/http.service';

const tableBody = document.getElementById('ingredientsTable') as HTMLTableSectionElement;

const CLASSES = {
  cellAlign: 'align-middle text-center',
  cellAlignTop: 'align-top text-center',
  cellAlignMuted: 'align-middle text-center text-muted',
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

const UNITS = ['kg', 'dkg', 'g', 'l', 'dl', 'cl', 'ml'];

function renderUnitOptions(selectedUnit = 'kg') {
  return UNITS
    .map(unit => `<option value="${unit}" ${unit === selectedUnit ? 'selected' : ''}>${unit}</option>`)
    .join('');
}

const addIngredientRow = `
<tr class="table-light">
  <th class="${CLASSES.cellAlignTop}">#</th>
  <td class="${CLASSES.cellAlignTop}">
    <div class="position-relative">
      <input id="newName" type="text" class="${CLASSES.input}" placeholder="Név">
      <div class="invalid-feedback text-start">Kérlek töltsd ki a nevet!</div>
    </div>
  </td>
  <td class="${CLASSES.cellAlignTop}">
    <select id="newUnit" class="${CLASSES.select}">
      ${renderUnitOptions()}
    </select>
  </td>
  <td class="${CLASSES.cellAlignTop}">
    <div class="position-relative">
      <input type="number" id="newPrice" class="${CLASSES.input}" placeholder="Ár">
      <div class="invalid-feedback text-start">Kérlek töltsd ki az árat!</div>
    </div>
  </td>
  <td class="${CLASSES.cellAlignTop}">
    <button type="button" data-action="add" class="${CLASSES.btnAdd}"><i class="${CLASSES.iconAdd} pointer-events-none"></i></button>
  </td>
</tr>
`;

let editingId: string | null;

async function renderIngredients(ingredients: Ingredient[]) {
  if (!tableBody) return;

  let structure = addIngredientRow;

  ingredients.forEach(i => {
    if (editingId === i.id) { // Szerkesztő mód
      structure += `
        <tr data-id="${i.id}">
          <th class="${CLASSES.cellAlignTop} text-muted" scope="row">#${i.id}</th>
          <td class="${CLASSES.cellAlignTop}">
            <div class="position-relative">
              <input id="editName-${i.id}" type="text" class="${CLASSES.input}" value="${i.nev}">
              <div class="invalid-feedback text-start">Kérem adjon nevet a hozzávalónak!</div>
            </div>
          </td>
          <td class="${CLASSES.cellAlignTop}">
            <select id="editUnit-${i.id}" class="${CLASSES.select}">
              ${renderUnitOptions(i.mertekegyseg)}
              </select>
          </td>
          <td class="${CLASSES.cellAlignTop}">
            <div class="position-relative">
              <input type="number" id="editPrice-${i.id}" class="${CLASSES.input}" value="${i.egysegAr}">
              <div class="invalid-feedback text-start">Kérem adjon meg árat a hozzávalónak!</div>
            </div>
          </td>
          <td class="${CLASSES.cellAlignTop}">
            <button type="button" data-id="${i.id}" data-action="save" class="${CLASSES.btnSave}"><i class="${CLASSES.iconSave} pointer-events-none"></i></button>
            <button type="button" data-id="${i.id}" data-action="cancel" class="${CLASSES.btnCancel}"><i class="${CLASSES.iconCancel} pointer-events-none"></i></button>
          </td>
        </tr>
      `;
    }
    else { // Olvasó mód
      structure += `
        <tr data-id="${i.id}">
          <th class="${CLASSES.cellAlignMuted}" scope="row">#${i.id}</th>
          <td class="${CLASSES.cellAlign} ${CLASSES.boldGreen}">${i.nev}</td>
          <td class="${CLASSES.cellAlign}">${i.mertekegyseg}</td>
          <td class="${CLASSES.cellAlign}">${i.egysegAr.toLocaleString('hu-HU', { style: 'currency', currency: 'HUF', minimumFractionDigits: 0, maximumFractionDigits: 2 })}</td>
          <td class="${CLASSES.cellAlign}">
            <button type="button" data-id="${i.id}" data-action="edit" class="${CLASSES.btnEdit}"><i class="${CLASSES.iconEdit} pointer-events-none"></i></button>
            <button type="button" data-id="${i.id}" data-action="delete" class="${CLASSES.btnDelete}"><i class="${CLASSES.iconDelete} pointer-events-none"></i></button>
          </td>
        </tr>
      `;
    }
  });

  tableBody.innerHTML = structure;
}

function tableEvents() {
  if (!tableBody) return;

  tableBody.addEventListener('click', async (event) => {
    const button = (event.target as HTMLElement).closest('button');
    if (!button) return;

    const action = button.dataset.action;
    const id = button.dataset.id;

    try {
      if (action === 'add') {
        const nameInput = document.getElementById('newName') as HTMLInputElement;
        const unitSelect = document.getElementById('newUnit') as HTMLSelectElement;
        const priceInput = document.getElementById('newPrice') as HTMLInputElement;


        let hasError = false;
        if (!nameInput.value.trim()) {
          nameInput.classList.add('is-invalid');
          hasError = true;
        } else {
          nameInput.classList.remove('is-invalid');
        }

        if (!priceInput.value.trim()) {
          priceInput.classList.add('is-invalid');
          hasError = true;
        } else {
          priceInput.classList.remove('is-invalid');
        }

        if (hasError) return;

        await uploadIngredient({
          id: '',
          nev: nameInput.value.trim(),
          mertekegyseg: unitSelect.value,
          egysegAr: parseFloat(priceInput.value),
        });

        refreshData();
      }

      else if (action === 'edit' && id) {
        editingId = id;
        refreshData();
      }

      else if (action === 'cancel') {
        editingId = null;
        refreshData();
      }

      else if (action === 'save' && id) {
        const editName = document.getElementById(`editName-${id}`) as HTMLInputElement;
        const editUnit = document.getElementById(`editUnit-${id}`) as HTMLSelectElement;
        const editPrice = document.getElementById(`editPrice-${id}`) as HTMLInputElement;


        let hasError = false;
        if (!editName.value.trim()) {
          editName.classList.add('is-invalid');
          hasError = true;
        } else {
          editName.classList.remove('is-invalid');
        }

        if (!editPrice.value.trim()) {
          editPrice.classList.add('is-invalid');
          hasError = true;
        } else {
          editPrice.classList.remove('is-invalid');
        }

        if (hasError) return;

        await editIngredient({
          id: id,
          nev: editName.value.trim(),
          mertekegyseg: editUnit.value,
          egysegAr: parseFloat(editPrice.value),
        });

        editingId = null;
        refreshData();
      }

      else if (action === 'delete' && id) {
        if (confirm('Biztosan törölni szeretnéd ezt az alapanyagot?')) {
          await deleteIngredient(id);
          refreshData();
        }
      }
    }
    catch (error) {
      console.error("BAJ VAN", error);
    }
  });
}

async function refreshData() {
  const data = await getAllIngredients();
  renderIngredients(data);
}

async function initialize() {
  tableEvents();
  await refreshData();
}

initialize();

// cursor adott helyeken?,
// hozzáadáskor előre kerüljön