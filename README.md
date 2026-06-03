# *ReceptNapló*
A ReceptNapló lehetővé teszi saját, egyedi receptkönyved összeállítását. A receptek és hozzávalók egyszerű, gyors és kényelmes kezelésével segít rendszerezni kedvenc ételeidet, így még élvezetesebbé teszi a konyhai élményt.
## *Funkciók*
- **navbar** - váltás receptek és hozzávalók oldala között
- **recept** - *keresés* (kategória, elkészítési mód, név), *kilistázás*, *új létrehozása*, *részletek megnyitása* -> *szerkesztés*, *törlés*
- **hozzávaló** - *keresés* (név,id), *kilistázás*, *új létrehozása*, *törlés*
## *Erőforrások*
- **recept** : id, név, kategória, elkészítési mód, elkészítés ideje, csatolt kép (URL), elkészítés lépései, hozzávalók
- **hozzávaló** : id, név, mértékegység, egységár
## *Technológiák*
- **JSON server** - backend
- **Vite** - build eszköz
- **TypeScript** - nyelv
- **HTML & CSS & Bootstrap** - megjelenés
- **Github** - verziókezelés
## Feladatmegosztás
#### Farkas Ádám - `https://github.com/farkasadamattila`
- hozzávalók html, fetch api funkciók, enumok, interfacek, hozzávaló létrehozásakor validáció, állapotjelzés
#### Mezei Renáta -`https://github.com/mezeirenata`
- index html, keresés & modal funkciók, receptek -> CRUD funkciók, recept létrehozásakor validáció, fetch hibakezelés 
#### Hutter Áron - `https://github.com/hutteraron3`
- bugtest, hozzávalók html, mintaadatok
## Letöltés & futtatás
**parancssorba gépelendő:**
- `git clone https://github.com/mezeirenata/TsProject-RecipeBook.git` 
- *repo mappán belül*
- `npm install vite`
- *ezt követően nyisd meg a TsProject-RecipeBook/Recipebook mappát a cmd-ben, majd adj ki 2 parancsot 2 külön ablakban:*
- `npm run dev`
- `npx json-server db.json`
