
export function getTimeString(minutesGiven: number):string{
    let timeString = "";
    if (minutesGiven >= 60){
        let hour = Math.floor(minutesGiven / 60);
        let minutes = minutesGiven - hour * 60;
        timeString = minutes > 0 ? `${hour} óra ${minutes} perc` : `${hour} óra`;
    }
    else{
        timeString = `${minutesGiven} perc`;
    }
    return timeString;

}    

export function backgroundScroll(){
    const background = document.getElementById("navbar")!;
    let currentHeight = 400;
    let targetHeight = 400;

    window.addEventListener("scroll", () => {
        targetHeight = Math.max(400 - window.scrollY, 200);
        currentHeight += (targetHeight - currentHeight) * 0.1;

        background.style.height = `${currentHeight}px`;
    });
}

export function gainFocusBack(){
    const modal = document.getElementById('recipe-modal');
    // a bs modal lecsukódásakor a fókusz megmarad a modalon -> a hover effektus beragadt a gombon
    modal!.addEventListener('hidden.bs.modal', () =>{
        setTimeout(() => { // azért kell, mert míg lecsukódik a modal meg kell várni
            let buttons = document.querySelectorAll(".plus-btn")!;
            buttons.forEach(btn  => {
                (btn as HTMLButtonElement)!.blur(); // fókusz visszanyerése
            });
        }, 0);
    });
}

export function handleEnteronModal(){
    document.getElementById('recipe-form')!.addEventListener('keydown', (e) => {
    if (e.key == "Enter"){
        e.preventDefault();
        const active = document.activeElement ? document.activeElement as HTMLElement : null;
        active?.blur();
    }
        
});

}

export function settime(){
    setTimeout(() => {            
        let container = document.getElementById("steps-list")!;
        container.scrollTop = container.scrollHeight;

        let selectedIngredients = document.getElementById("selected-ingredients")!;
        selectedIngredients.scrollTop = selectedIngredients.scrollHeight;
    }, 500);  
}