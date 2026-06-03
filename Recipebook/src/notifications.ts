import './styles/notifications.css';

const notificationDiv = document.getElementById('notificationDiv') as HTMLDivElement;
const togglebutton = document.getElementById('toggleNotification') as HTMLButtonElement;

const eventMessages: { [key: string]: string } = {
  'ingredient-added': 'Hozzávaló hozzáadva!',
  'ingredient-deleted': 'Hozzávaló törölve!',
  'ingredient-edited': 'Hozzávaló frissítve!',
  // 'recipe-added': 'Recept hozzáadva!',
  // 'recipe-deleted': 'Recept törölve!',
  // 'recipe-edited': 'Recept frissítve!'
};

document.addEventListener('app-event', (event: Event) => { //nem kéne hogy any legyen
  const customEvent = event as CustomEvent<{ type: string }>;
  const eventType = customEvent.detail.type;
  const message = eventMessages[eventType];

  if (message) {
    notificationDiv.innerHTML = message;
    notificationDiv.appendChild(togglebutton);
    notificationDiv.style.display = 'block';
    notificationDiv.classList.add("alert", "alert-success");


    if (eventType === 'ingredient-added' || eventType === 'ingredient-edited') {
      notificationDiv.setAttribute('data-type', 'success');
      notificationDiv.classList.replace("alert-danger", "alert-success");
    }
    else {
      notificationDiv.setAttribute('data-type', 'error');
      notificationDiv.classList.replace("alert-success", "alert-danger");
    }

    setTimeout(() => {
      notificationDiv.style.display = 'none';
    }, 3000);
  }
});

togglebutton.innerHTML = '✕';
togglebutton.addEventListener('click', () => {
  notificationDiv.style.display = 'none';
});





