import type { Ingredient } from './models/ingredient';
import { getAllIngredients, deleteIngredient, uploadIngredient, editIngredient } from './api/http.service';

const tableBody = document.getElementById('ingredientsTable') as HTMLTableSectionElement;

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
          <div class="invalid-feedback text-start">Kérlek töltsd ki a nevet!</div>
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
          <div data-new-field="price-error" class="invalid-feedback text-start">Kérlek töltsd ki az árat!</div>
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
            <div class="invalid-feedback text-start">Kérlek töltsd ki a nevet!</div>
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
                <div data-new-field="price-error" class="invalid-feedback text-start">Kérlek töltsd ki az árat!</div>
              </div>
            </div>
          </div>
          <button type="button" data-action="add" class="${CLASSES.btnAdd} w-100"><i class="${CLASSES.iconAdd} pointer-events-none"></i></button>
        </div>
      </td>
    </tr>
  `;
}

let editingId: string | null;

async function renderIngredients(ingredients: Ingredient[]) {
  if (!tableBody) return;

  let structure = renderAddIngredientRow();

  ingredients.reverse().forEach(i => {
    if (editingId === i.id) { // Szerkesztő mód
      structure += `
        <tr data-id="${i.id}">
          <th class="${CLASSES.cellAlign} text-muted" scope="row">#${i.id}</th>
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
              <div id="editPrice-error-${i.id}" class="invalid-feedback text-start">Kérem adjon meg árat a hozzávalónak!</div>
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
          <td class="${CLASSES.actions}">
            <div class="action-buttons-inner">
              <button type="button" data-id="${i.id}" data-action="edit" class="${CLASSES.btnEdit} action-button"><i class="${CLASSES.iconEdit} pointer-events-none"></i></button>
              <button type="button" data-id="${i.id}" data-action="delete" class="${CLASSES.btnDelete} action-button"><i class="${CLASSES.iconDelete} pointer-events-none"></i></button>
            </div>
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
      if (action === 'add') { //hozzaadas
        const currentRow = button.closest('tr');
        if (!currentRow) return;

        const nameInput = currentRow.querySelector('[data-new-field="name"]') as HTMLInputElement;
        const unitSelect = currentRow.querySelector('[data-new-field="unit"]') as HTMLSelectElement;
        const priceInput = currentRow.querySelector('[data-new-field="price"]') as HTMLInputElement;
        const priceError = currentRow.querySelector('[data-new-field="price-error"]') as HTMLElement;

        let hasError = false;

        if (!nameInput.value.trim()) {
          nameInput.classList.add('is-invalid');
          hasError = true;
        } else {
          nameInput.classList.remove('is-invalid');
        }

        if (!priceInput.value.trim()) {
          priceError.textContent = 'Kérlek töltsd ki az árat!';
          priceInput.classList.add('is-invalid');
          hasError = true;
        } else if (parseFloat(priceInput.value) <= 0) {
          priceError.textContent = 'Az árnak pozitívnak kell lennie!';
          priceInput.classList.add('is-invalid');
          hasError = true;
        } else {
          priceInput.classList.remove('is-invalid');
        }

        if (hasError) return;

        const newIngredient = await uploadIngredient({
          id: '',
          nev: nameInput.value.trim(),
          mertekegyseg: unitSelect.value,
          egysegAr: parseFloat(priceInput.value),
        });

        const data = await getAllIngredients();
        renderIngredients(data);
      }

      else if (action === 'edit' && id) { //szerkesztes
        editingId = id;
        refreshData();
      }

      else if (action === 'cancel') { //szerkesztes megszakitsasa
        editingId = null;
        refreshData();
      }

      else if (action === 'save' && id) { //szerkesztes mentes
        const editName = document.getElementById(`editName-${id}`) as HTMLInputElement;
        const editUnit = document.getElementById(`editUnit-${id}`) as HTMLSelectElement;
        const editPrice = document.getElementById(`editPrice-${id}`) as HTMLInputElement;
        const editPriceError = document.getElementById(`editPrice-error-${id}`) as HTMLElement;

        let hasError = false;

        if (!editName.value.trim()) {
          editName.classList.add('is-invalid');
          hasError = true;
        } else {
          editName.classList.remove('is-invalid');
        }

        if (!editPrice.value.trim()) {
          editPriceError.textContent = 'Kérem adjon meg árat a hozzávalónak!';
          editPrice.classList.add('is-invalid');
          hasError = true;
        } else if (parseFloat(editPrice.value) <= 0) {
          editPriceError.textContent = 'Az árnak pozitívnak kell lennie!';
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

      else if (action === 'delete' && id) { //torles
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