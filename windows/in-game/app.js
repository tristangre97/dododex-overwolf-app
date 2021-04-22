var hideNarc;
//document.getElementById('ark-box').scrollTop = 0;
var arkBox = document.getElementById('ark-box')
var app = document.getElementById('app');
var creatureSelect = document.getElementById('creature-selector');
var hidden = 1;
var closeSettings = document.getElementById('close-settings');
var maxItems = 50;
var bioImg = `<img class="narc-img" src="../../img/Bio_Toxin.png">`
var narcoticImg = `<img class="narc-img" src="../../img/Narcotics.png">`
var narcoBerryImg = `<img class="narc-img" src="../../img/Narcoberry.png">`
// var bioImg = `<img class="narc-img" src="https://www.dododex.com/media/item/Bio_Toxin.png">`
// var narcoticImg = `<img class="narc-img" src="https://www.dododex.com/media/item/Narcotics.png">`
// var narcoBerryImg = `<img class="narc-img" src="https://www.dododex.com/media/item/Narcoberry.png">`
var defaultWeapons = [
  {"itemName":"Longneck Rifle (Tranquilizer Dart)","damage":26,"torpor":221,"percent":100,"img":"Tranquilizer_Dart"},
  {"itemName":"Longneck Rifle (Shocking Tranquilizer Dart)","damage":26,"torpor":442,"percent":100, "img":"Shocking_Tranquilizer_Dart"},
  {"itemName":"Bow","damage":20,"torpor":90,"percent":100,"img":"Tranq_Arrow_Bow"},
  {"itemName":"Crossbow","damage":35,"torpor":157.5,"percent":100,"img":"Tranq_Arrow_Crossbow"},
  {"itemName":"Compound Bow","damage":27,"torpor":50,"percent":100,"img":"Tranq_Arrow_Compound"},
  {"itemName":"Slingshot","damage":14,"torpor":23.8,"percent":100,"img":"Slingshot"},
  {"itemName":"Electric Prod","damage":1,"torpor":266,"percent":100,"img":"Electric_Prod"}
];
var recentTames = ["Raptor"];
var isPassive;
if (localStorage.arkWeapons === undefined) {localStorage.setItem("arkWeapons", JSON.stringify(defaultWeapons))}
if (localStorage.recentlyTamed === undefined) {localStorage.setItem("recentlyTamed", JSON.stringify(recentTames))}
recentlyTamed = JSON.parse(localStorage.getItem("recentlyTamed"));
consumptionMultiplier = Math.max(Math.min(consumptionMultiplier,1000),0.1)

var settingsPage = document.getElementById("settings-page");

function changeSetting(setting) {
  newValue = document.getElementById(setting).value;
  localStorage.setItem(setting, newValue)
}

var narcotics = {
	ascerbic: {
		torpor: 25,
		secs: 2
	},
	bio: {
		torpor: 80,
		secs: 16
	},
	narcotics: {
		torpor: 40,
		secs: 8
	},
	narcoberries: {
		torpor: 7.5,
		secs: 3
	}
}
  tameFoodData = [];
	tameFoodAmountData = [];
	tameTimeData = [];
	tameNarcData = [];
  creatureTorpor = [];

 function tameCommand() {
   var tamingMultiplier = localStorage.tamingMultiplier || 1;
   var consumptionMultiplier = localStorage.consumptionMultiplier || 1;
   //updateSettingsInput();
   document.getElementById("tamingMultiplier").value = tamingMultiplier;
   document.getElementById("consumptionMultiplier").value = consumptionMultiplier;
   clearTable();
   var creature = document.getElementById("creatures").value.replace(" ","").toLowerCase();
   var creatureImg = document.getElementById("creature-pic");
   creatureImg.src = `../../img/creatures/${creature.toLowerCase().replace(" ","")}.webp`;
   var level = document.getElementById("level").value;
   var tameTable = document.getElementById('tameTable');
   tameTable.style.transition = '0.555s';
   tameTable.style.opacity = 0;
   var tameDescText = document.getElementById('tamingDesc');
   var tameNoticeText = document.getElementById('tamingNotice');
   var tameTypeDiv = document.getElementById('tame-type');
   //console.log(creature)
  fetch('https://www.tristan.games/data.json').then(response => response.json()).then(data => {
  CREATURES = data.CREATURES;
  FOODS = data.FOODS;
  IMAGES = data.IMAGES;
  ITEMS = data.ITEMS;
  WEAPONS = data.WEAPONS;
	var creatureData = data.CREATURES[creature];
	var creatureName = creatureData.name;
	var creatureDesc = creatureData.desc;
	var baseAffinity = creatureData.a0;
  var torporDropSpeed = creatureData.tDPS0;
	var affinityLevelIncrease = creatureData.aI;
	var foodBase = creatureData.foodBase;
	var foodMult = creatureData.foodMult;
  var carryableBy = creatureData.carry;
	var effectiveness = 100;
	var totalSecs = 0;
  var tameType = "Passive";
  isPassive = true;

  var nvfam = creatureData.nvfam;
    if (!nvfam) {
    nvfam = 1;
    tameType = "";
    isPassive = false;
  };
    //console.log(consumptionMultiplier)
	var affinityNeeded = baseAffinity + (affinityLevelIncrease * level);
	var affinityLeft = affinityNeeded;
	var foodConsumption = foodBase * foodMult * consumptionMultiplier;
	var creatureEats = creatureData.eats;	
  tameTypeDiv.innerText = tameType;
	var foods = data.FOODS;
	var tamingMult = tamingMultiplier * 4;
	var tDPS0 = creatureData.tDPS0;
	var t1 = creatureData.t1;
	var tI = creatureData.tI;
	var totalTorpor = t1 + tI * (level - 1);
  creatureTorpor.push(totalTorpor)
	var torporDeplPS = tDPS0 + Math.pow(level - 1, 0.800403041) / (22.39671632 / tDPS0);
	var creatureAffinity = affinityLevelIncrease * level;
  var creatureT = t1 + tI * (level-1);
    if (creatureDesc) {
	  tameDescText.innerText = creatureDesc;
	 }
	var tamingNotice = creatureData.tamingNotice;
	 if (tamingNotice) {
	   tameNoticeText.innerText = tamingNotice;
	 }
  if(creatureEats) {
      creatureEats.forEach(foodItem=> {
		var numNeeded = Math.ceil(affinityLeft / foods[foodItem].affinity / tamingMult / nvfam);
		var aFoodSeconds = Math.ceil(numNeeded * foods[foodItem].food / foodConsumption);
		var foodTime = convertTime(aFoodSeconds);
		var ascerbicmushroomsMin = Math.max(Math.ceil((aFoodSeconds * torporDeplPS - totalTorpor) / (narcotics.ascerbic.torpor + torporDeplPS * narcotics.ascerbic.secs)), 0);
		var biotoxinsMin = Math.max(Math.ceil((aFoodSeconds * torporDeplPS - totalTorpor) / (narcotics.bio.torpor + torporDeplPS * narcotics.bio.secs)), 0);
		var narcsMin = Math.max(Math.ceil((aFoodSeconds * torporDeplPS - totalTorpor) / (narcotics.narcotics.torpor + torporDeplPS * narcotics.narcotics.secs)), 0);
		var narcBMin = Math.max(Math.ceil((aFoodSeconds * torporDeplPS - totalTorpor) / (narcotics.narcoberries.torpor + torporDeplPS * narcotics.narcoberries.secs)), 0);
    foodItemEntry = foodItem.split('|');
    tameFoodData.push(foodItemEntry[0])
    tameFoodAmountData.push(numNeeded)
    tameTimeData.push(foodTime)
    //console.log(biotoxinsMin)
    if(!narcBMin) {
      hideNarc = true;
      tameNarcData.push(`${bioImg} ${biotoxinsMin.toLocaleString()}\n${narcoticImg} ${narcsMin.toLocaleString()}\n${narcoBerryImg} ${narcBMin.toLocaleString()}`)
    } else {
      tameNarcData.push(`${bioImg} ${biotoxinsMin.toLocaleString()}\n${narcoticImg} ${narcsMin.toLocaleString()}\n${narcoBerryImg} ${narcBMin.toLocaleString()}`)
      hideNarc = false;
    }
    
		//tameData.push(`${numNeeded}x ${foodItem} (${foodTime}) (${biotoxinsMin}, ${narcsMin}, ${narcBMin})`)
    
	});
  } else {
    koStats.innerText = `<p>No tame data</p>`
  }
  
  if(carryableBy) {
    i = 0;
		while (i < carryableBy.length) {
      if(carryableBy[i]=="crystalwyvern"){carryableBy[i]="Crystal Wyvern"}
			let $p = document.createElement('div');
			$p.className = 'carry-block';
			$p.innerHTML = `
      <img class="mini-creature-img" src="../../img/creatures/${carryableBy[i].toLowerCase().replace(" ","")}.webp">
      <p class="item-name">${carryableBy[i].charAt(0).toUpperCase() + carryableBy[i].slice(1)}</p>

    `;
    carryData.appendChild($p);
			i++
		}
  } else {
    carryData.innerHTML = `
    <p>This creature cannot be carried.</p>
    `
  }
renderEgg(creatureName);

})
 .then(() => {
   //console.log(hideNarc)
  if(isPassive === true) {
    tameTable.innerHTML = `
    <thead>
  <tr>
    <th>Food</th>
    <th>Amount</th>
    <th>Time</th>
  </tr>
</thead>`
    tameLength = tameFoodData.length;
    i = 0;
    while (i < tameLength && i < maxItems) {
    let $p = document.createElement('tr');
    $p.className = 'tame-data';
    $p.innerHTML = `
    <td>${tameFoodData[i]}</td>
    <td>${tameFoodAmountData[i]}</td>
    <td>${tameTimeData[i]}</td>`;
    tameTable.appendChild($p);    
    i++
    }
    koStats(creatureTorpor);
    tameTable.style.opacity = 0.5;
    tameTable.style.opacity = 0.75;
    tameTable.style.opacity = 1;
  } else {
    tameTable.innerHTML = `
    <thead>
  <tr>
    <th>Food</th>
    <th>Amount</th>
    <th>Time</th>
    <th>Narcs</th>
  </tr>
</thead>`
    tameLength = tameFoodData.length;
    i = 0;
    while (i < tameLength && i < maxItems) {
    let $p = document.createElement('tr');
    $p.className = 'tame-data';
    $p.innerHTML = `
    <td>${tameFoodData[i]}</td>
    <td>${tameFoodAmountData[i]}</td>
    <td>${tameTimeData[i]}</td>
    <td>${tameNarcData[i]}</td>`;
    tameTable.appendChild($p);    
    i++
    }
    koStats(creatureTorpor);
    tameTable.style.opacity = 0.5;
    tameTable.style.opacity = 0.75;
    tameTable.style.opacity = 1;
  }

  })



}

function convertTime(seconds) {
  sec = Math.round(seconds);
  var days = Math.floor(sec / (3600*24));
  var hours = parseInt(sec / 3600) % 24;
  var minutes = parseInt((sec % 3600) / 60);
  var seconds = parseInt(sec % 60);
  //console.log(days, hours, minutes, seconds)
  if(days>0){return `${String(days).padStart(2, '0')}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`}

  if(days==0&&hours>0){return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`}
  if(hours==0&&minutes>0){return `${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`}
  if(minutes==0&&seconds>0){return `${String(seconds).padStart(2, '0')}s`}
	return `${String(days).padStart(2, '0')}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
}

function clearTable() {
  var tameTable = document.getElementById('tameTable');
  var eggTable = document.getElementById('eggTable');
  tameTable.style.opacity = 0;
  var tameDescText = document.getElementById('tamingDesc');
  var tameNoticeText = document.getElementById('tamingNotice');
  var koDiv = document.getElementById('ko');
  tameFoodData = [];
	tameFoodAmountData = [];
	tameTimeData = [];
	tameNarcData = [];
  creatureTorpor = [];
  tameNoticeText.innerText = "";
  tameDescText.innerText = "";
  koDiv.innerHTML = "";
  tameTable.innerHTML = ``;
  eggTable.innerHTML = ``;
  carryData.innerHTML = ``;
  //console.log("cleared")
}

function renderTameApp(creature, creatureFullName) {
  updateRecent(creatureFullName);
  console.time("App rendered in");
  document.getElementById('ark-box').scrollTop = 0;
  showSelector();
  app.innerHTML = `
  <div class="smain-content">
    <p class="title">Tame Data&nbsp;<span id="tame-type"></span></p>
     <div id="tamingNotice"></div>
<table id="tameTable">
</table>
<p class="title">KO Data</p>
<div id="ko"></div>
<p class="title"><span id="creatureNameBreed"></span> Breeding</p>
<div id="eggTable"></div>
<div class="input-box settings-input">
<label for="hatchMultiplier">Hatch Multiplier</label>
<input autocomplete="off" onchange="changeSetting('hatchMultiplier'); setBlockHeights(); tameCommand();" min="1" max="9999" id="hatchMultiplier" type="number">
</div>
<div class="input-box settings-input">
<label for="matureMultiplier">Mature Multiplier</label>
<input autocomplete="off" onchange="changeSetting('matureMultiplier'); setBlockHeights(); tameCommand();" min="1" max="9999" id="matureMultiplier" type="number">
</div>
<p class="title">Carryable By</p>
<div id="carryData"></div>
  <div id="tamingDesc"></div>
  </div>
  <div class="footer">
   <img class="tg-logo" src="https://www.tristan.games/logos/TGLogo.svg">
   </div>
  `;
  var creatureInput = document.getElementById('creatures');
  creatureInput.options[creatureInput.selectedIndex].value = creature;
  creatureInput.options[creatureInput.selectedIndex].text = creature;

  tameCommand(creatureFullName);
  console.timeEnd("App rendered in");
}

function renderSearchPage() {
  hideSelector();
  app.innerHTML = `
    <div class="creature-page" id="creature-page">
    <div class="input-box full search sticky-search">
  <input autocomplete="off" placeholder="Search Creatures" id="searchInput" class="almost" onkeyup="searchItems()">
    </div>
    
    <ul id="creature-list"></ul>
    <div class="footer">
   <img class="tg-logo" src="https://www.tristan.games/logos/TGLogo.svg">
   </div>
    </div>
    `
  renderCreatures();
}
function renderCreatures() {
  var creatureList = ["Achatina","Allosaurus","Angler","Ankylosaurus","Araneo","Archaeopteryx","Argentavis","Arthropluera","Astrocetus","Baryonyx","Basilisk","Basilosaurus","Beelzebufo","Bloodstalker","Brontosaurus","Bulbdog","Carbonemys","Carnotaurus","Castoroides","Chalicotherium","Coelacanth","Compy","Crystal Wyvern","Daeodon","Deinonychus","Desert Titan","Dilophosaur","Dimetrodon","Dimorphodon","Diplocaulus","Diplodocus","Direbear","Direwolf","Dodo","Doedicurus","Dung Beetle","Dunkleosteus","Electrophorus","Equus","Featherlight","Ferox","Forest Titan","Gacha","Gallimimus","Gasbags","Giant Bee","Giganotosaurus","Gigantopithecus","Glowtail","Griffin","Hesperornis","Hyaenodon","Ice Titan","Ichthyornis","Ichthyosaurus","Iguanodon","Jerboa","Kairuku","Kaprosuchus","Karkinos","Kentrosaurus","Lamprey","Leech","Liopleurodon","Lymantria","Lystrosaurus","Magmasaur","Mammoth","Managarmr","Manta","Mantis","Megachelon","Megalania","Megaloceros","Megalodon","Megalosaurus","Megatherium","Mesopithecus","Microraptor","Morellatops","Mosasaurus","Moschops","Onyc","Otter","Oviraptor","Ovis","Pachy","Pachyrhinosaurus","Paracer","Parasaur","Pegomastax","Pelagornis","Phiomia","Phoenix","Piranha","Plesiosaur","Procoptodon","Pteranodon","Pulmonoscorpius","Purlovia","Quetzal","Raptor","Ravager","Reaper","Rex","Rock Drake","Rock Elemental","Roll Rat","Royal Griffin","Sabertooth","Sarco","Shinehorn","Snow Owl","Spinosaur","Stegosaurus","Tapejara","Terror Bird","Therizinosaurus","Thorny Dragon","Thylacoleo","Titanoboa","Titanosaur","Triceratops","Trilobite","Troodon","Tropeognathus","Tusoteuthis","Unicorn","Velonasaur","Vulture","Woolly Rhino","Wyvern","Yutyrannus"];
  var creatureListDiv = document.getElementById('creature-list')
  creatureLength = creatureList.length;
    i = 0;
    while (i < creatureLength) {
    let $p = document.createElement('li');
    $p.className = 'creature-block';
    $p.innerHTML = `
    <div onclick="renderTameApp('${creatureList[i].toLowerCase().replace(" ","")}', '${creatureList[i]}')">
    <img loading="lazy" src="../../img/creatures/${creatureList[i].toLowerCase().replace(" ","")}.webp">
    <p class="creature-name">${creatureList[i]}</p>
    </div>
    `;
    creatureListDiv.appendChild($p);    
    i++
    }
  
}


renderSearchPage();



function searchItems() {
    var input, filter, ul, li, a, i, p;
    input = document.getElementById('searchInput');
    filter = input.value.toUpperCase();
    ul = document.getElementById("creature-list");
    li = ul.getElementsByTagName('li');
    for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("p")[0];
        if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}


function koStats(totalTorpor) {
  var weapons = JSON.parse(localStorage.getItem("arkWeapons"));
  //console.log(totalTorpor)
    var koDiv = document.getElementById('ko');
		weaponAmount = weapons.length;
		i = 0;
		while (i < weaponAmount) {
			let $p = document.createElement('div');
			$p.className = 'ko-block';
			$p.innerHTML = `
      <img class="weapon-img" src="../../img/items/${weapons[i].img}.webp">
      <p class="shot-amount">${Math.ceil(totalTorpor/weapons[i].torpor).toLocaleString()}</p>
      <p class="item-percent">${weapons[i].percent}%</p>
      <p class="item-name">${weapons[i].itemName}</p>
    `;
			koDiv.appendChild($p);
			i++
		}

}
//{"itemName":"Longneck Rifle (Tranquilizer Dart)","damage":26,"torpor":221,"percent":100},
function addNewWeapon(itemName, baseDamage, baseTorpor, percent, img) {
  var weapons = JSON.parse(localStorage.getItem("arkWeapons"));
  percentage = percent / 100;
  weaponname = itemName;
  var existingWeapons = JSON.parse(localStorage.getItem("arkWeapons"));
  if (existingWeapons == null) existingWeapons = [];

  weaponTorpor = Math.abs(baseTorpor*(percentage));
  weaponDamage = Math.abs(baseDamage*(percentage)) ;
	var weaponEntry = {
		"itemName": itemName,
		"damage": weaponDamage,
		"torpor": weaponTorpor,
    "percent": percent,
    "img": img
	};
  
  localStorage.setItem("weaponEntry", JSON.stringify(weaponEntry));
	existingWeapons.unshift(weaponEntry);
	localStorage.setItem("arkWeapons", JSON.stringify(existingWeapons));
  
}

//addNewWeapon('Rfle', 23, 221, 125);

function toggleSettings() {
  var tamingMultiplier = localStorage.tamingMultiplier || 1;
  var consumptionMultiplier = localStorage.consumptionMultiplier || 1;
  //updateSettingsInput();
  document.getElementById("tamingMultiplier").value = tamingMultiplier;
  document.getElementById("consumptionMultiplier").value = consumptionMultiplier;
  settingsPage.classList.toggle("shown");
  arkBox.classList.toggle("stop-scrolling");
  closeSettings.classList.toggle("shown")
}
function updateSettingsInput() {
  var tameSettinginput = document.getElementById('tamingMultiplier')
  var consumptionSettinginput = document.getElementById('consumptionMultiplier')
  tameSettinginput.value = tamingMultiplier;
  consumptionSettinginput.value = consumptionMultiplier;
}

function hideSelector() {
  creatureSelect.classList.remove("shown");
}

function showSelector() {
  creatureSelect.classList.add("shown");
}



function renderEgg(creature) {
  var eggTable = document.getElementById('eggTable');
  eggTable.innerHTML = `
  <div class="center-box">
  <div class="lds-ripple"><div></div><div></div></div>
  </div>
  `;
  creature.charAt(0).toUpperCase() + creature.slice(1)
  var hatchMultiplier = localStorage.hatchMultiplier || 1;
  var matureMultiplier = localStorage.matureMultiplier || 1;

  var hatchMultiplierinput = document.getElementById('hatchMultiplier')
  var matureMultiplierinput = document.getElementById('matureMultiplier')
  hatchMultiplierinput.value = hatchMultiplier;
  matureMultiplierinput.value = matureMultiplier;

  creatureNameBreed.innerText = creature;
  if(creature=="Direbear"){creature="Dire Bear"}
  if(creature=="Crystalwyvern"){creature="Crystal Wyvern"}
  fetch(`https://arkbuddy.app/api/data?creature=${creature}`).then(function(response) {
	// The API call was successful!
	if (response.ok) {
		return response.json();
	}
}).then(function(data) {
	var breedingTimes = data.breeding;
  var incubationTime = parseInt(breedingTimes.incubationTime / hatchMultiplier);
  var gestationTime = parseInt(breedingTimes.gestationTime / hatchMultiplier);
  var maturationTime = parseInt(breedingTimes.maturationTime / matureMultiplier);
  var incubationTimeFinal = convertTime(incubationTime);
  var maturationTimeFinal = convertTime(maturationTime);
  var gestationTimeFinal = convertTime(gestationTime); 
  var tTime = parseInt((breedingTimes.incubationTime / hatchMultiplier) + (breedingTimes.gestationTime / hatchMultiplier) + (breedingTimes.maturationTime / matureMultiplier));
  var growTime = (breedingTimes.maturationTime / matureMultiplier);
  
  var babyTimeSeconds = percentage(10, growTime);
  var juvTimeSeconds = percentage(50, growTime);
  var juvTimeFinal = parseInt(juvTimeSeconds - babyTimeSeconds)
  var babyTime = convertTime(babyTimeSeconds);
  var juvTime = convertTime(juvTimeFinal);
  var toAdultTime = parseInt(growTime / 2);
  var toAdult = convertTime(toAdultTime);

  var totalTime = convertTime(tTime);
  var eggMinTemp = breedingTimes.eggTempMin;
  var eggMaxTemp = breedingTimes.eggTempMax;
  var eggTempMinFar = Math.ceil((eggMinTemp * 1.8) + 32);
  var eggTempMaxFar = Math.ceil((eggMaxTemp * 1.8) + 32);
  

  if(data.breeding.incubationTime == 0) {
    eggTable.innerHTML = `
    <div class="egg-box half">
    <p class="big-text">${totalTime}</p>
    <p class="mini-text">Total Time</p>
    </div>
    <div class="egg-box half">
    <p class="big-text">${gestationTimeFinal}</p>
    <p class="mini-text">Gestation Time</p>
    </div>
    <div class="egg-box third">
    <p class="big-text">${babyTime}</p>
    <p class="mini-text">Baby</p>
    </div>
    <div class="egg-box third">
    <p class="big-text">${juvTime}</p>
    <p class="mini-text">Juvenile</p>
    </div>
    <div class="egg-box third">
    <p class="big-text">${toAdult}</p>
    <p class="mini-text">Adult</p>
    </div>
    `
    return;
  }
  if(data.breeding.gestationTime == 0) {
    eggTable.innerHTML = `
    <div class="egg-box half">
    <p class="big-text">${totalTime}</p>
    <p class="mini-text">Total Time</p>
    </div>
    <div class="egg-box half">
    <p class="big-text">${eggTempMinFar}° - ${eggTempMaxFar}°F (${eggMinTemp}° - ${eggMaxTemp}°C)</p>
    <p class="mini-text">Ideal Temp</p>
    </div>
    <div class="egg-box full center-text">
    <p class="big-text">${incubationTimeFinal}</p>
    <p class="mini-text">Incubation</p>
    </div>
    <div class="egg-box third">
    <p class="big-text">${babyTime}</p>
    <p class="mini-text">Baby</p>
    </div>
    <div class="egg-box third">
    <p class="big-text">${juvTime}</p>
    <p class="mini-text">Juvenile</p>
    </div>
    <div class="egg-box third">
    <p class="big-text">${toAdult}</p>
    <p class="mini-text">Adult</p>
    </div>
    `
  }


}).catch(function(err) {
  console.log(err)
	eggTable.innerHTML = `
  <p>No breeding data available</p>
  `
});
}

function updateRecent(creature) {
  recentlyTamed.unshift(creature)
  if (recentlyTamed.length > 6) recentlyTamed.length = 6;
  localStorage.setItem("recentlyTamed", JSON.stringify(recentlyTamed));
}

function percentage(percent, total) {
  return ((percent/ 100) * total)
}


function setBlockHeights() {
  var eggTableDiv = document.getElementById("eggTable");
  var eggTableHeight = eggTableDiv.offsetHeight;
  eggTableDiv.style.minHeight = `${eggTableHeight}px`;
}


















