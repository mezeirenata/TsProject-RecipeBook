import '../styles/features.css';

export function loadingStatus(div: HTMLDivElement, duration: number) {
    div.style.display = "block";
    div.innerHTML =
    `<div class="loader" id="loader"></div>`;
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'none';
    }, duration);
}

export async function loadingStatusWithData<T>(div: HTMLDivElement, asyncFunction: () => Promise<T>): Promise<T> {
    div.innerHTML =
    `<div class="loader" id="loader"></div>`;
    try {
        const data = await asyncFunction();
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'none';
        return data;
    } 
    catch (error) {
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'none';
        throw error;
    }
}

//MAIN.TS-ből származó kód


//Ádám förvedményei
// import { loadingStatus, loadingStatusWithData } from './features';
// import { getAllRecipes } from './api/http.service';
// const recipes = document.getElementById('recipes-list') as HTMLDivElement;

// const testdiv = document.createElement('div');
// testdiv.id = "testDiv";
// loadingStatus(testdiv, 9000);

// const testButton = document.createElement('button');
// testButton.className = "btn btn-danger mt-3";
// testButton.setAttribute('data-bs-toggle', 'modal');
// testButton.setAttribute('data-bs-target', '#exampleModal');
// testButton.textContent = 'Test Modal';
// recipes.appendChild(testButton);

// const Testmodal = document.createElement('div');
// Testmodal.id = "modal";
// Testmodal.innerHTML =
//     `
// <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
//     <div class="modal-dialog">
//         <div class="modal-content">
//             <div class="modal-header">
//                 <h1 class="modal-title fs-5" id="exampleModalLabel">Test Modal</h1>
//                 <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
//             </div>
//             <div class="modal-body" id="modalBody"> This is a test modal! </div>
//             <div class="modal-footer"> 
//                 <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button> 
//             </div>
//         </div>
//     </div>
// </div>
// `;
// recipes.appendChild(Testmodal);
// recipes.appendChild(testdiv)

// const modalElement = document.getElementById('exampleModal');
// if (modalElement) {
//     modalElement.addEventListener('show.bs.modal', async () => {
//         const modalBody = document.getElementById('modalBody') as HTMLDivElement;
//         if (modalBody) {
//             try {
//                 const recipes = await loadingStatusWithData(modalBody, () => getAllRecipes(""));
//                 modalBody.innerHTML = `<h5>Recipes loaded: ${recipes.length}</h5><p>Data fetched successfully!</p>`;
//             } catch (error) {
//                 modalBody.innerHTML = `<p style="color: red;">Error loading recipes: ${error}</p>`;
//             }
//         }
//     });
// }