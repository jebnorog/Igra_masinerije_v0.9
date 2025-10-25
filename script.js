// --- GLOBALNE PROMENLJIVE ---
let timerInterval;
let seconds = 0;
let minutes = 0;
let igraAktivna = false;

let kasa = 0;
let period = "dan";
let danBroj = 1;
let danIndex = 0;
let periodBrojac = 0;

let moral = 100;
let zbidelj = 0;
let cacad = 0;
let blokaderi = 0;

let cheatAktivan = false;
let jakaSifra = false;

// --- NOVO: ZBIDELJ SISTEM ---
let zbideljLevel = 1;
let zbideljProduction = 500;
const zbideljUpgrade = [0, 500, 700, 900, 1200];
const zbideljUpgradeCosts = [0, 1500000, 2000000, 3000000, 5000000];

// --- KOPANJE SISTEM (KARTICA 9) ---
let kineziStatus = 0; // 0 = nije pokušano, -1 = neuspeh, 1 = uspeh
let rusiStatus = 0;
let arapiStatus = 0;


// --- NOVO: KONJ SISTEM ---
let konjPodmazan = false;

// --- SENDVIČARIJUM SISTEM (KARTICA 12) ---
let sendviciNapravljeni = false;


// --- ELEMENTI ---
const kasaDisplay = document.getElementById("money-value");
const periodDisplay = document.getElementById("day-period");
const danDisplay = document.getElementById("day-number");
const danNaziv = document.getElementById("day-name");
const timerDisplay = document.getElementById("timer");
const startBtn = document.getElementById("start-btn");

const moralFill = document.getElementById("moral-fill");
const moralValue = document.getElementById("moral-value");
const zbideljFill = document.getElementById("zbidelj-fill");
const zbideljValue = document.getElementById("zbidelj-value");
const zbideljModal = document.getElementById("zbidelj-modal");
const zbideljOk = document.getElementById("zbidelj-ok");

const cacadFill = document.getElementById("cacad-fill");
const cacadValue = document.getElementById("cacad-value");
const blokaderiFill = document.getElementById("blokaderi-fill");
const blokaderiValue = document.getElementById("blokaderi-value");

// --- MMF NOĆNI ELEMENTI ---
const mmfNightModal = document.getElementById("mmf-night-modal");
const mmfNightExit = document.getElementById("mmf-night-exit");

// --- CACAD ELEMENTI ---
const cacadMinusModal = document.getElementById("cacad-minus-modal");
const cacadPlusModal = document.getElementById("cacad-plus-modal");
const shareMinus = document.getElementById("share-minus");
const sharePlus = document.getElementById("share-plus");
const restartMinus = document.getElementById("restart-minus");
const restartPlus = document.getElementById("restart-plus");

// --- BLOKADERI ELEMENTI ---
const blokMinusModal = document.getElementById("blok-minus-modal");
const blokPlusModal = document.getElementById("blok-plus-modal");
const shareBlokMinus = document.getElementById("share-blok-minus");
const shareBlokPlus = document.getElementById("share-blok-plus");
const restartBlokMinus = document.getElementById("restart-blok-minus");
const restartBlokPlus = document.getElementById("restart-blok-plus");

// --- MORAL ELEMENTI ---
const moralModal = document.getElementById("moral-modal");
const shareMoral = document.getElementById("share-moral");
const restartMoral = document.getElementById("restart-moral");

const daniNedelje = ["Pon", "Uto", "Sre", "Čet", "Pet", "Sub", "Ned"];

// --- FORMATIRANJE ---
function formatMoney(v) {
  return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " €";
}

// --- TAJMER / START ---
function updateTimerDisplay() {
  const m = String(minutes).padStart(2, "0");
  const s = String(seconds).padStart(2, "0");
  timerDisplay.textContent = `${m}:${s}`;
}

function resetVariables() {
  seconds = 0;
  minutes = 0;
  kasa = 0;
  period = "dan";
  danBroj = 1;
  danIndex = 0;
  periodBrojac = 0;
  moral = 100;
  zbidelj = 0;
  cacad = 0;
  blokaderi = 0;
  cheatAktivan = false;
  jakaSifra = false;
  zbideljLevel = 1;
  zbideljProduction = 500;
  konjPodmazan = false;
  window.mmfCooldown = 0;
  sendviciNapravljeni = false;
    // --- RESET KOPANJE STATUSA ---
  kineziStatus = 0;
  rusiStatus = 0;
  arapiStatus = 0;
    // --- OČISTI DODATNE DUGMIĆE IZ MODALA ---
  const cardRight = document.querySelector("#card-modal .card-right");
  if (cardRight) {
    const extraButtons = cardRight.querySelectorAll(".exit-btn:not(#close-card)");
    extraButtons.forEach(btn => btn.remove());
  }


  updateTimerDisplay();
  kasaDisplay.textContent = formatMoney(kasa);
  periodDisplay.textContent = period;
  danDisplay.textContent = danBroj;
  danNaziv.textContent = daniNedelje[danIndex];
  updateMoral(moral);
  updateZbidelj(zbidelj);
  updateCacad(cacad);
  updateBlokaderi(blokaderi);
  updateLampice();
}

function startGame() {
  clearInterval(timerInterval);
  resetVariables();
  igraAktivna = true;

  timerInterval = setInterval(() => {
    seconds++;
    if (seconds >= 60) {
      seconds = 0;
      minutes++;
    }
    updateTimerDisplay();
  }, 1000);
}
startBtn.addEventListener("click", startGame);

// --- PERIOD I DANI ---
function togglePeriod() {
  if (!igraAktivna) return;

  // Promena dana/noći
  period = period === "dan" ? "noć" : "dan";
  periodDisplay.textContent = period;
  updateLampice();

  // Brojanje perioda i dana
  periodBrojac++;
  if (periodBrojac >= 2) {
    periodBrojac = 0;
    danBroj++;
    danDisplay.textContent = danBroj;
    danIndex = (danIndex + 1) % daniNedelje.length;
    danNaziv.textContent = daniNedelje[danIndex];
    updateLampice();

    // --- DODAVANJE ZBIDELJA SVAKI DAN ---
    zbidelj += zbideljProduction;
    if (zbidelj >= 100000) {
      zbidelj = 100000;
      zbideljModal.classList.remove("hidden");
    }
    updateZbidelj(zbidelj);

    // --- DODAVANJE REKETA SVAKI DAN ---
    const daysSince = danBroj - reketLastCollected;
    if (daysSince > 7) {
      reketStored = 0;
    } else {
      reketStored += reketDaily;
    }
    updateReketText?.();
  }

  // --- NOĆNI DOGAĐAJ NA SVAKIH 10 DANA ---
  if (period === "noć" && danBroj % 10 === 0) {
    if (Math.random() < 0.9) {
      showNightEvent();
      return;
    }
  }

  // --- DNEVNI DOGAĐAJ: SUBOTA UJUTRU (FANTOMKA) ---
  if (period === "dan" && danNaziv.textContent === "Sub" && danBroj % 10 !== 0) {
    showFantomkaEvent();
    return;
  }

  // --- DNEVNI DOGAĐAJ: PON / SRE / PET (CACAD BANULA PO JOŠ ZBIDELJA) ---
  if (
    period === "dan" &&
    ["Pon", "Sre", "Pet"].includes(danNaziv.textContent) &&
    danBroj % 10 !== 0
  ) {
    if (Math.random() < 0.25) {
      showCacadZbideljEvent();
      return;
    }
  }

  // --- NOĆNI DOGAĐAJ: UTO / ČET (SEFE, ZVEKNULI SMO X KOG STE TRAŽILI) ---
  if (
    period === "noć" &&
    ["Uto", "Čet"].includes(danNaziv.textContent) &&
    danBroj % 10 !== 0
  ) {
    if (Math.random() < 0.3) {
      showZveknuliEvent();
      return;
    }
  }

  // --- PROVERE KRAJNJIH STANJA ---
  if (cacad <= -100) showCacadModal("minus");
  if (cacad >= 100) showCacadModal("plus");
  if (blokaderi <= -100) showBlokaderiModal("minus");
  if (blokaderi >= 100) showBlokaderiModal("plus");
  if (moral === 0) showMoralModal();
}

// --- MORAL ---
function updateMoral(v) {
  moral = Math.max(0, Math.min(100, v));
  moralValue.textContent = moral;
  moralFill.style.width = moral + "%";
  moralFill.style.backgroundColor =
    moral >= 61 ? "#0f0" : moral >= 26 ? "#ff0" : "#f00";
}

// --- ZBIDELJ ---
function updateZbidelj(v) {
  zbidelj = Math.max(0, Math.min(100000, v));
  zbideljValue.textContent = zbidelj.toLocaleString("sr-RS");
  const perc = (zbidelj / 100000) * 100;
  zbideljFill.style.width = perc + "%";
  zbideljFill.style.backgroundColor = zbidelj >= 79999 ? "#f00" : "#0f0";
  if (zbidelj >= 100000) zbideljModal.classList.remove("hidden");
}
zbideljOk.addEventListener("click", () => {
  zbideljModal.classList.add("hidden");
  zbidelj = 0;
  updateZbidelj(0);
  togglePeriod();
});

// --- SKALE ---
function updateScale(fill, valueEl, newValue) {
  const val = Math.max(-100, Math.min(100, newValue));
  valueEl.textContent = val;
  const absVal = Math.abs(val);
  const percent = (absVal / 100) * 50;
  fill.style.width = percent + "%";
  fill.style.left = val >= 0 ? "50%" : `calc(50% - ${percent}%)`;

  if (absVal <= 50) {
    fill.style.backgroundColor = "#0f0";
    fill.style.animation = "none";
  } else if (absVal <= 74) {
    fill.style.backgroundColor = "#ffa500";
    fill.style.animation = "none";
  } else {
    fill.style.backgroundColor = "#f00";
    fill.style.animation = "soft-blink 1.2s infinite ease-in-out";
  }
}
function updateCacad(v) { updateScale(cacadFill, cacadValue, v); cacad = v; }
function updateBlokaderi(v) { updateScale(blokaderiFill, blokaderiValue, v); blokaderi = v; }

// === KARTICA 2 – REKET SISTEM ===
let reketLevel = 1;
let reketDaily = 5000000;
let reketStored = 0;
let reketLastCollected = 1;

const reketModal = document.getElementById("reket-modal");
const reketText = document.getElementById("reket-text");
const reketAngazuj = document.getElementById("reket-angazuj");
const reketPokupi = document.getElementById("reket-pokupi");
const reketExit = document.getElementById("reket-exit");

function prikaziReket() {
  updateReketText();
  reketModal.classList.remove("hidden");
}


// ažuriranje teksta u modalu
function updateReketText() {
  const procenti = [30, 60, 90];
  const prihodi = [5000000, 10000000, 15000000];
  reketText.innerHTML = `
    <b>Pokupi reket dok te tvoji nisu pokrali.</b><br><br>
    Trenutno reketirate ${procenti[reketLevel - 1]}% grada i dnevni prihod je ${(prihodi[reketLevel - 1] / 1000000)} M €.<br>
    Akumulirano: ${(reketStored / 1000000).toFixed(1)} M €<br><br>
    Možeš angažovati još huligana i zauzeti još lokala.<br> 
    Upgrade kosta 5M.<br> Proizvodnja po nivoima 5M-10M-15M. <br> 
    Ako ne pokupis novac 7 dana sve ce nestati sto se nakupio jer jbg, s takvim ljudima radis.<br>
    Kad pokupis reket korupcija raste za 20.<br>
    <b>Nivo: ${reketLevel}/3</b>
  `;
}

/// --- KARTICE ---
const cardModal = document.getElementById("card-modal");
const closeCard = document.getElementById("close-card");
const modalImg = document.getElementById("modal-img");

document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", () => {

    const imgName = card.getAttribute("data-img");

    // --- AKO JE KARTICA 2 (REKET) — OTVORI SAMO NJEN MODAL ---
    if (imgName === "kar2.jpg") {
      prikaziReket();
      return; // prekida dalje izvršavanje da se ne otvori glavni modal
    }

    // --- RESET MODALA PRI SVAKOM OTVARANJU ---
    const cardRight = cardModal.querySelector(".card-right");

    // briše sve dodatne "IZLAZ" dugmiće osim glavnog
    const extraButtons = cardRight.querySelectorAll(".exit-btn:not(#close-card)");
    extraButtons.forEach(btn => btn.remove());

    // resetuje sva action dugmad na početno stanje
    const allBtns = cardModal.querySelectorAll(".action-btn");
    allBtns.forEach(b => {
      b.style.backgroundColor = "#070";
      b.style.cursor = "pointer";
      b.onclick = null;
      b.style.display = "inline-block";
    });

    // priprema za novu karticu
    const buttons = cardModal.querySelectorAll(".action-btn");

// --- KARTICA 4 – POSLOVI (DVE FAZE) ---
if (imgName === "kar4.jpg") {
  // Zatvori sve ostale modale pre početka (ali ne kartice!)
  document.querySelectorAll("div[id$='-modal']").forEach(modal => {
    if (modal.classList && !modal.classList.contains("hidden")) {
      modal.classList.add("hidden");
    }
  });

  // Pronađi lampicu i proveri boju
  const lampica = card.querySelector(".lampica");
  const lampColor = lampica
    ? window.getComputedStyle(lampica).backgroundColor
    : "rgb(255,0,0)";

  // --- 1. Crvena lampica (nema nikog) ---
  if (lampColor.includes("255, 0, 0")) {
    modalImg.src = "assets/nemanikog.jpg";
    const cardText = document.getElementById("card-text");
    cardText.innerHTML = `<b>Nema nikog.</b>`;
    const buttons = cardModal.querySelectorAll(".action-btn");
    buttons.forEach(btn => btn.style.display = "none");

    cardModal.classList.remove("hidden");
    const exitBtn = document.createElement("button");
    exitBtn.textContent = "IZLAZ";
    exitBtn.className = "exit-btn";
    exitBtn.onclick = () => cardModal.classList.add("hidden");
    cardText.insertAdjacentElement("afterend", exitBtn);
    return;
  }

  // --- 2. Zelena lampica (random posao) ---
  // Prva faza – FIRMA
  const firmaOptions = [
    { img: "firma1.jpg", tekst: "Naleteo si kad HULIGANI AD uzima posao. Dobijaš 20%.", procenat: 0.2 },
    { img: "firma2.jpg", tekst: "Naleteo si kad LICNA KARTA DOO uzima posao. Dobijaš 40%.", procenat: 0.4 },
    { img: "firma3.jpg", tekst: "Naleteo si kad EMIRATI SRBIJA CO uzima posao. Dobijaš 60%.", procenat: 0.6 },
  ];
  const izabranaFirma = firmaOptions[Math.floor(Math.random() * firmaOptions.length)];
  let firmaUdeo = izabranaFirma.procenat;

  // Prikaz prve faze
  modalImg.src = `assets/${izabranaFirma.img}`;
  const cardText = document.getElementById("card-text");
  cardText.innerHTML = `<b>${izabranaFirma.tekst}</b>`;
  const buttons = cardModal.querySelectorAll(".action-btn");
  buttons.forEach(btn => btn.style.display = "none");

  cardModal.classList.remove("hidden");

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "NEXT";
  nextBtn.className = "action-btn";
  cardText.insertAdjacentElement("afterend", nextBtn);

  nextBtn.onclick = () => {
    // --- 2. faza: GRADNJA ---
    const gradnje = [
      { img: "gradj1.jpg", tekst: "Gradi se cudesni grad na vodi i vrednost je 60M, korupcija +10", vrednost: 60000000 },
      { img: "gradj2.jpg", tekst: "Gradi se zeleznicka stanica i vrednost je 40M, korupcija +10", vrednost: 40000000 },
      { img: "gradj3.jpg", tekst: "Gradi se autoput i vrednost je 30M, korupcija +10", vrednost: 30000000 },
      { img: "gradj4.jpg", tekst: "Gradi se metro i vrednost je 50M", vrednost: 50000000 },
    ];
    const izabranaGradnja = gradnje[Math.floor(Math.random() * gradnje.length)];
    const zarada = Math.round(izabranaGradnja.vrednost * firmaUdeo);

    modalImg.src = `assets/${izabranaGradnja.img}`;
    cardText.innerHTML = `
      <b>${izabranaGradnja.tekst}</b><br><br>
      <span style="color:#0f0;">Tvoje je ${formatMoney(zarada)}.</span>
    `;

    nextBtn.remove(); // uklanja dugme NEXT

    const exitBtn = document.createElement("button");
    exitBtn.textContent = "ZATVORI";
    exitBtn.className = "exit-btn";
    cardText.insertAdjacentElement("afterend", exitBtn);

    exitBtn.onclick = () => {
      kasa += zarada;
      kasaDisplay.textContent = formatMoney(kasa);
      updateMoral(moral + 10);
      togglePeriod();
      cardModal.classList.add("hidden");
      updateLampice(); // osveži lampicu nakon završetka posla
    };
  };

  return;
}



    // --- ZBIDELJ KARTICA br.5 ---
    if (imgName === "kar5.jpg") {
      modalImg.src = `assets/${imgName}`;
      cardModal.classList.remove("hidden");
      updateZbideljDisplay();
      buttons[0].textContent = "Upgrade lvl 2";
      buttons[1].textContent = "Upgrade lvl 3";
      buttons[2].textContent = "Upgrade lvl 4";
      buttons[0].onclick = () => upgradeZbidelj(2);
      buttons[1].onclick = () => upgradeZbidelj(3);
      buttons[2].onclick = () => upgradeZbidelj(4);
      return;
    }
    
    // --- NOVA KARTICA br.6 (MARICA) ---
    if (imgName === "kar6.jpg") {
      modalImg.src = `assets/${imgName}`;
      cardModal.classList.remove("hidden");

      const cardText = document.getElementById("card-text");
      const buttons = cardModal.querySelectorAll(".action-btn");
      buttons.forEach(btn => btn.style.display = "none");

      // Dinamički sadržaj kartice
      cardText.innerHTML = `
        <b>Ovde vec 40 godina živi Marica</b><br><br>
        Otkupice sav zbidelj za dalju preprodaju, stanardna cena, soma po kg.</b><br>
        Prodajom korupcija skace za 10.</b><br>
        Ako se prepuni skladiste vrata ostaju otvorena i zbidelj propada.</b><br>
        <div id="marica-range-box" style="margin-top:15px;">
          <input type="range" id="marica-slider" min="0" max="${zbidelj}" value="0" step="100" style="width:90%;">
          <div id="marica-value" style="margin-top:10px;">Prodajem: 0 kg</div>
        </div>
        <div class="card-buttons">
          <button class="action-btn" id="marica-ok">OK</button>
          <button class="exit-btn" id="marica-exit">IZLAZ</button>
        </div>
      `;

      // --- SLIDER PRAĆENJE ---
      const maricaSlider = document.getElementById("marica-slider");
      const maricaValue = document.getElementById("marica-value");
      maricaSlider.addEventListener("input", () => {
        maricaValue.textContent = `Prodajem: ${parseInt(maricaSlider.value).toLocaleString("sr-RS")} kg`;
      });

      // --- DUGME OK ---
      document.getElementById("marica-ok").addEventListener("click", () => {
        const kolicina = parseInt(maricaSlider.value);
        if (kolicina > 0) {
          zbidelj -= kolicina;
          kasa += kolicina * 1000;
          updateZbidelj(zbidelj);
          kasaDisplay.textContent = formatMoney(kasa);
          updateMoral(moral + 10);
        }
        togglePeriod();
        cardModal.classList.add("hidden");
      });

      // --- DUGME IZLAZ ---
      document.getElementById("marica-exit").addEventListener("click", () => {
        cardModal.classList.add("hidden");
      });

      return;
    }

// --- KARTICA 9 – KOPANJE ---
if (imgName === "kar9.jpg") {
  modalImg.src = `assets/${imgName}`;
  cardModal.classList.remove("hidden");

  const cardText = document.getElementById("card-text");
  const buttons = cardModal.querySelectorAll(".action-btn");
  buttons.forEach(btn => {
    btn.style.display = "inline-block";
    btn.onclick = null;
    btn.style.backgroundColor = "#070";
    btn.style.cursor = "pointer";
  });

  // --- DANJU ---
  if (period === "dan") {
    cardText.innerHTML = `
      <b>Ne možemo kopati po danu, uhvatiće nas meštani!</b><br><br>
      <span style="color:#f00;font-weight:bold;">Ništa nije pronađeno</span>
    `;
    buttons[0].style.display = "none";
    buttons[1].style.display = "none";
    buttons[2].style.display = "none";
    return;
  }

  // --- NOĆU ---
  const ekipe = [
    { naziv: "KINEZI", status: kineziStatus, slika: "tozla.jpg", tekst: "Kinezi našli tozla" },
    { naziv: "RUSI", status: rusiStatus, slika: "bakar.jpg", tekst: "Rusi našli bakar" },
    { naziv: "LAŽNI ARAPI", status: arapiStatus, slika: "voda.jpg", tekst: "Arapi našli vodu" }
  ];

  // --- STATUS PRIKAZ ---
  let statusLinije = ekipe.map(e => {
    if (e.status === 2)
      return `<span style='color:#f00;font-weight:bold;'>${e.naziv}: prodato</span>`;
    if (e.status === 1)
      return `<span style='color:#0f0;font-weight:bold;'>${e.naziv}: pronađeno</span>`;
    if (e.status === -1)
      return `<span style='color:#999;'>${e.naziv}: pokušano bez uspeha</span>`;
    return `<span style='color:#fff;'>${e.naziv}: nije pokušano</span>`;
  }).join("<br>");

  cardText.innerHTML = `<b>Biraj ekipu koju šalješ</b><br><br>
  Ovde mozes besplatno poslati strane kompanije da istrazuju prirodna bogatstva koja ces im kasnije prodati.</b><br>
  U slucau uspesnog pronalaska Korupcija+10.</b><br>
  Sanse su 33%</b><br>
  ${statusLinije}<br><br>`;

  ekipe.forEach((ekipa, i) => {
    const btn = buttons[i];
    btn.textContent = ekipa.naziv;
    btn.style.display = "inline-block";

    // --- BLOKADE ---
    if (ekipa.status === 1 || ekipa.status === 2) {
      btn.style.backgroundColor = "#800";
      btn.style.cursor = "not-allowed";
      btn.onclick = () => showLopoveNeKradi();
      return;
    }

    // --- AKTIVNO DUGME ---
    btn.onclick = () => {
      const sansa = Math.random();
      if (sansa <= 0.33) {
        // USPEH
        modalImg.src = `assets/${ekipa.slika}`;
        cardText.innerHTML = `<b>${ekipa.tekst}</b><br><br><span style="color:#0f0;">Uspešno pronađeno!</span>`;
        updateMoral(moral + 10);
        if (i === 0) kineziStatus = 1;
        if (i === 1) rusiStatus = 1;
        if (i === 2) arapiStatus = 1;
      } else {
        // NEUSPEH
        modalImg.src = "assets/kar9.jpg";
        cardText.innerHTML = `<b>Probaj opet kasnije</b>`;
        if (i === 0 && kineziStatus < 1) kineziStatus = -1;
        if (i === 1 && rusiStatus < 1) rusiStatus = -1;
        if (i === 2 && arapiStatus < 1) arapiStatus = -1;
      }

      // --- IZLAZ ---
      buttons.forEach(b => (b.style.display = "none"));
      const exitBtn = document.createElement("button");
      exitBtn.textContent = "IZLAZ";
      exitBtn.className = "exit-btn";
      exitBtn.onclick = () => {
        togglePeriod();
        cardModal.classList.add("hidden");
        updateLampice();
      };
      cardText.insertAdjacentElement("afterend", exitBtn);
    };
  });

  return;
}


    // --- NOVA KONJ KARTICA br.10 ---
    if (imgName === "kar10.jpg") {
      modalImg.src = `assets/${imgName}`;
      cardModal.classList.remove("hidden");

      const cardText = document.getElementById("card-text");
      updateKonjDisplay(cardText);

      // Samo jedno dugme: PLATI 5M
      buttons[0].textContent = "PLATI 5M";
      buttons[1].style.display = "none";
      buttons[2].style.display = "none";

      buttons[0].onclick = () => {
        if (!igraAktivna) return;
        if (konjPodmazan) return;
        if (kasa < 5000000) return showLopoveNeKradi();

        kasa -= 5000000;
        kasaDisplay.textContent = formatMoney(kasa);
        konjPodmazan = true;
        updateKonjDisplay(cardText);
        updateLampice();
        togglePeriod();
        cardModal.classList.add("hidden");
        console.log("Konj podmazan!");
      };
      return;
    }

// --- KARTICA 11 – PRODAJA ---
if (imgName === "kar11.jpg") {
  modalImg.src = `assets/${imgName}`;
  cardModal.classList.remove("hidden");

  const cardText = document.getElementById("card-text");
  const buttons = cardModal.querySelectorAll(".action-btn");
  buttons.forEach(btn => {
    btn.style.display = "inline-block";
    btn.onclick = null;
    btn.style.backgroundColor = "#070";
    btn.style.cursor = "pointer";
  });

  // --- DEFINICIJA EKIPE I STATUSA ---
  const ekipe = [
    { naziv: "PRODAJ KINEZIMA", status: kineziStatus, slika: "tozla.jpg", tekst: "Prodat Kinezima" },
    { naziv: "PRODAJ RUSIMA", status: rusiStatus, slika: "bakar.jpg", tekst: "Prodat Rusima" },
    { naziv: "PRODAJ ARAPIMA", status: arapiStatus, slika: "voda.jpg", tekst: "Prodat Arapima" }
  ];

const sviProdati = ekipe.every(e => e.status === 2);

cardText.innerHTML = `<b>Izaberi kome prodaješ resurse</b><br><br>${
    sviProdati
      ? "<span style='color:#f00;font-weight:bold;'>Sve je već prodato!</span>"
      : "<span>Biraj pažljivo kome prodaješ, promasaj umanjuje moral za 5.</span><br>" +
        "<span>Uspešna prodaja: Korupcija +10, Caci +10, Blokaderi -15, Kasa +100M</span>"
  }<br><br>`;


  // --- POSTAVI DUGMAD ---
  ekipe.forEach((ekipa, i) => {
    const btn = buttons[i];
    btn.textContent = ekipa.naziv;
    btn.style.display = "inline-block";

    // Ako je već prodato
    if (ekipa.status === 2) {
      btn.style.backgroundColor = "#800";
      btn.style.cursor = "not-allowed";
      btn.onclick = () => showLopoveNeKradi();
      return;
    }

    // Klik dugmeta
    btn.onclick = () => {
      // Ako nije pronađeno u kartici 9
      if (ekipa.status !== 1) {
        modalImg.src = "assets/kurac.jpg";
        cardText.innerHTML = `<b>Moraš prvo da pronađeš resurse!</b>`;
        updateMoral(moral - 5);
        buttons.forEach(b => (b.style.display = "none"));

        const exitBtn = document.createElement("button");
        exitBtn.textContent = "IZLAZ";
        exitBtn.className = "exit-btn";
        exitBtn.onclick = () => {
          togglePeriod(); // pomera vreme i završava pokušaj
          cardModal.classList.add("hidden");
        };
        cardText.insertAdjacentElement("afterend", exitBtn);
        return;
      }

      // --- USPEŠNA PRODAJA ---
      modalImg.src = `assets/${ekipa.slika}`;
      cardText.innerHTML = `<b>${ekipa.tekst}</b><br><br><span style="color:#0f0;">Uspešna prodaja!</span>`;

      kasa += 100000000;
      updateMoral(moral + 10);
      updateCacad(cacad + 10);
      updateBlokaderi(blokaderi - 15);
      kasaDisplay.textContent = formatMoney(kasa);

      // Označi kao prodato
      if (i === 0) kineziStatus = 2;
      if (i === 1) rusiStatus = 2;
      if (i === 2) arapiStatus = 2;

      buttons.forEach(b => (b.style.display = "none"));

      const exitBtn = document.createElement("button");
      exitBtn.textContent = "IZLAZ";
      exitBtn.className = "exit-btn";
      exitBtn.onclick = () => {
        togglePeriod(); // pomera vreme i završava prodaju
        cardModal.classList.add("hidden");
        updateLampice(); // osvežava lampicu ako su svi prodati
      };
      cardText.insertAdjacentElement("afterend", exitBtn);
    };
  });

  // Sakrij višak (ako postoji)
  if (buttons[3]) buttons[3].style.display = "none";

  return;
}

// --- KARTICA 12 – SENDVIČARIJUM ---
if (imgName && imgName.includes("kar12")) {
  console.log("👉 Klik registrovan za karticu 12");

  const modal = document.getElementById("sendvicarijum-modal");
  const status = document.getElementById("sendvici-status");
  const napraviBtn = document.getElementById("napravi-sendvice");
  const exitBtn = document.getElementById("sendvici-exit");

  if (!modal) {
    console.warn("⚠️ sendvicarijum-modal NIJE pronađen u DOM-u!");
    return;
  }

  console.log("✅ Modal pronađen:", modal);
  console.log("classList pre:", modal.classList.value);

  // --- PRIKAŽI MODAL SIGURNO ---
  modal.classList.remove("hidden");
  modal.style.display = "flex";
  modal.style.zIndex = "9999";
  console.log("classList posle:", modal.classList.value);

  // --- STATUS FUNKCIJA ---
  function osveziSendvice() {
  // Glavni tekst u beloj boji (#fff)
  const tekst = `<span style="color:#fff;"><b>Sendvicarijum</b><br>
Ovde se prave sendvici za cacad koja ih skuplja subotom ujutru, zajedno sa lovom i zbideljom.<br>
Ako nisu spremni Cacad-20, ako jesu Cacad+15.<br>
Ako nemas 500kg zbidelja i novac dodatno se umanjuje moral Cacadi<br>
Ako imas sendvice a odbijes Korupcija-40.</span>`;

  // Prikaži ga u statusu
  status.innerHTML = tekst + "<br><br>";

  // Dodaj boju samo na status (napravljeni / nisu napravljeni)
  if (sendviciNapravljeni) {
    status.innerHTML += `<span style="color:#0f0;">Sendvici napravljeni</span>`;
    napraviBtn.disabled = true;
    napraviBtn.style.backgroundColor = "#555";
  } else {
    status.innerHTML += `<span style="color:#f00;">Sendvici nisu napravljeni</span>`;
    napraviBtn.disabled = false;
    napraviBtn.style.backgroundColor = "#070";
  }
}





  osveziSendvice();

  napraviBtn.onclick = () => {
    if (sendviciNapravljeni) return;
    if (kasa < 5000000) {
      alert("Nemaš dovoljno para za sendviče!");
      return;
    }
    kasa -= 5000000;
    kasaDisplay.textContent = formatMoney(kasa);
    sendviciNapravljeni = true;
    osveziSendvice();
    updateLampice();
  };

  exitBtn.onclick = () => {
    modal.classList.add("hidden");
    modal.style.display = "none";
  };

  return;
}


 // --- KARTICA 7 – MMF (DNEVNA I NOĆNA VERZIJA) ---
if (imgName === "kar7.jpg") {
  if (period === "noć") {
    // Noćna verzija (ostaje kao pre)
    mmfNightModal.classList.remove("hidden");
    return;
  }

  // --- DNEVNA VERZIJA ---
  modalImg.src = `assets/${imgName}`;
  cardModal.classList.remove("hidden");

  const cardText = document.getElementById("card-text");
  const buttons = cardModal.querySelectorAll(".action-btn");
  buttons.forEach(btn => btn.style.display = "inline-block");

  // --- GLOBALNA PROMENLJIVA ZA COOLDOWN ---
  if (typeof window.mmfCooldown === "undefined") window.mmfCooldown = 0;

  // --- PRORAČUN STATUSA APLIKACIJE ---
  let mozeAplicirati = danBroj > window.mmfCooldown;
  let danaOstalo = window.mmfCooldown - danBroj;

  cardText.innerHTML = `
    <b>Uslihtaj se Anđelini</b><br><br>
    Kad jednom dobijes kredit ne vracaj se 7 dana.</b><br>
    Šanse za dobitak manjeg su 50 %</b><br>
    Neuspeh: Moral-3, Cacad-3, Blokaderi+3</b><br>
    Upseh: Moral+5, Cacad+10</b><br>
    Šanse za dobitak veceg su 33 %</b><br>
    Neuspeh: Moral-5, Cacad-5, Blokaderi+5</b><br>
    Upseh: Moral+15, Cacad+15</b><br>

    ${
      mozeAplicirati
        ? `<span style="color:#0f0;font-weight:bold;">Možeš aplicirati</span>`
        : `<span style="color:#f00;font-weight:bold;">Ne možeš aplicirati još ${danaOstalo} dana</span>`
    }
  `;

  // --- DUGMAD ---
  buttons[0].textContent = "25 M €";
  buttons[1].textContent = "50 M €";
  buttons[2].style.display = "none";

  // --- FUNKCIJA ZA OBRADU KREDITA ---
  function pokusajKredit(sansa, iznos, moralPlus, cacadPlus, moralMinus, cacadMinus, blokPlus) {
    if (!mozeAplicirati) return showLopoveNeKradi();

    if (Math.random() <= sansa) {
      // USPEH
      kasa += iznos;
      updateMoral(moral + moralPlus);
      updateCacad(cacad + cacadPlus);
      kasaDisplay.textContent = formatMoney(kasa);
      window.mmfCooldown = danBroj + 7;

      cardText.innerHTML = `
        <b>Bravo!</b><br><br>
        Nikad joj niko više nije ušao u guzicu.<br><br>
        <span style="color:#0f0;font-weight:bold;">Dobio si kredit ${formatMoney(iznos)}!</span>
      `;
      buttons[0].style.display = "none";
      buttons[1].style.display = "none";
      buttons[2].style.display = "none";

      const exitBtn = document.createElement("button");
      exitBtn.textContent = "IZLAZ";
      exitBtn.className = "exit-btn";
      exitBtn.onclick = () => {
        togglePeriod();
        cardModal.classList.add("hidden");
      };
      cardText.insertAdjacentElement("afterend", exitBtn);
    } else {
      // NEUSPEH
      modalImg.src = "assets/kurac.jpg";
      cardText.innerHTML = `
        <b>DODJI SUTRA</b><br><br>
        <span style="color:#f00;">Dobio si kurac!</span>
      `;
      updateMoral(moral - moralMinus);
      updateCacad(cacad - cacadMinus);
      updateBlokaderi(blokaderi + blokPlus);

      buttons[0].style.display = "none";
      buttons[1].style.display = "none";
      buttons[2].style.display = "none";

      const exitBtn = document.createElement("button");
      exitBtn.textContent = "IZLAZ";
      exitBtn.className = "exit-btn";
      exitBtn.onclick = () => {
        togglePeriod();
        cardModal.classList.add("hidden");
      };
      cardText.insertAdjacentElement("afterend", exitBtn);
    }
  }

  // --- KLIKOVI NA DUGMAD ---
  buttons[0].onclick = () => pokusajKredit(0.5, 25000000, 5, 10, 3, 3, 3);
  buttons[1].onclick = () => pokusajKredit(0.33, 50000000, 15, 15, 5, 5, 5);

  return;
}

    // --- KARTICA 1 – DŽEPARENJE SANJE 97-98-99 ---
if (imgName === "kar1.jpg") {
  modalImg.src = `assets/${imgName}`;
  cardModal.classList.remove("hidden");

  const cardText = document.getElementById("card-text");
  cardText.innerHTML = `<b>Dzeparenje</b><br><br>
    Uvalio si se u EU na sastanak, nema stolica za tebe. <br> Iz revolta mozes pokusati da maznes:<br>
    Novcanik 99% sanse za 5M (Korupocija+1) <br> Torbicu 98% sanse za 10M (Korupcija+2) <br> Papire 97% sanse za 25M (korupcija+3) <br> Ako te navataju kraj je!`;

  const opcije = [
    { naziv: "Novcanik",  iznos: 5000000,  sansa: 0.99, moralPlus: 1 },
    { naziv: "Torbica", iznos: 10000000, sansa: 0.98, moralPlus: 2 },
    { naziv: "Papiri", iznos: 25000000, sansa: 0.97, moralPlus: 3 }
  ];

  const buttons = cardModal.querySelectorAll(".action-btn");
  buttons.forEach((btn, i) => {
    const o = opcije[i];
    btn.textContent = o.naziv;
    btn.style.display = "inline-block";
    btn.onclick = () => {
      if (!igraAktivna) return;
      if (Math.random() <= o.sansa) {
        // uspešan pokušaj
        kasa += o.iznos;
        kasaDisplay.textContent = formatMoney(kasa);
        updateMoral(moral + o.moralPlus);
        togglePeriod();
        cardModal.classList.add("hidden");
      } else {
        // neuspešan – Game Over
        cardModal.classList.add("hidden");
        showGameOverKradja();
      }
    };
  });

  return;
}

// --- KARTICA 8 – KOCKAJ SE ---
if (imgName === "kar8.jpg") {
  modalImg.src = `assets/${imgName}`;
  cardModal.classList.remove("hidden");

  const cardText = document.getElementById("card-text");
  const buttons = cardModal.querySelectorAll(".action-btn");
  buttons.forEach(btn => btn.style.display = "none");

  cardText.innerHTML = `
    <b>Kockaj se</b><br><br>
    Sve ili ništa – odluka je tvoja.
    <div class="card-buttons" style="margin-top:20px;">
      <button class="action-btn" id="kockaj-btn">STAVI SVE NA CRNO</button>
      <button class="exit-btn" id="kockaj-exit">IZLAZ</button>
    </div>
  `;

  // dugme "STAVI SVE NA CRNO"
  document.getElementById("kockaj-btn").addEventListener("click", () => {
    cardModal.classList.add("hidden");
    showGameOverKockanje();
  });

  // dugme "IZLAZ"
  document.getElementById("kockaj-exit").addEventListener("click", () => {
    cardModal.classList.add("hidden");
  });

  return;
}

// --- OSTALO ---
modalImg.src = `assets/${imgName}`;
cardModal.classList.remove("hidden");
buttons.forEach(btn => btn.onclick = () => cardModal.classList.add("hidden"));
});
});

closeCard.addEventListener("click", () => {
  cardModal.classList.add("hidden");
  // ukloni eventualne višak dugmiće koji su dodati dinamički
  const cardRight = cardModal.querySelector(".card-right");
  const extraButtons = cardRight.querySelectorAll(".exit-btn:not(#close-card)");
  extraButtons.forEach(btn => btn.remove());
});


// --- KONJ TEKST FUNKCIJA ---
function updateKonjDisplay(cardText) {
  const statusText = konjPodmazan
    ? `<b style="color:#0f0;">Konj jeste podmazan</b>`
    : `<b style="color:#f00;">Konj nije podmazan</b>`;
  cardText.innerHTML = `MAJMUNARIJUM<br><br>
  Ovde zivi mitsko bice. Majmun sa konjskom glavom.<br><br>
  Na svakih 10 dana se desavaju afere, ako nije podmazan na vreme ode sve u kurac.<br><br>
  Ako nije: Cacad-20<br><br>
  Ako jeste Korupcija+10, Cacad+5<br><br>
  Ako jeste a ODBIJES Korupcija-40<br><br>
  ${statusText}`;
}

// --- SLIKE KARTICA (ispravljeno) ---
document.querySelectorAll(".card").forEach(card => {
  const img = card.dataset.img; // koristi dataset umesto getAttribute
  if (img && img.endsWith(".jpg")) {
    card.style.backgroundImage = `url('assets/${img}')`;
    card.setAttribute("data-img", img); // ponovo upisuje sigurno
  }
});


// --- LAMPICE ---
const cards = document.querySelectorAll(".card");
cards.forEach(card => {
  const lampica = document.createElement("div");
  lampica.classList.add("lampica");
  card.appendChild(lampica);
});

function updateLampice() {
  cards.forEach((card, index) => {
    const lampica = card.querySelector(".lampica");
    if (!lampica) return;
    lampica.style.backgroundColor = "#0f0";
    lampica.style.boxShadow = "0 0 8px 2px rgba(0,255,0,0.6)";

    // --- KARTICA 12 – SENDVIČARIJUM ---
if (index === 11) {
  lampica.style.backgroundColor = sendviciNapravljeni ? "#0f0" : "#f00";
  lampica.style.boxShadow = sendviciNapravljeni
    ? "0 0 8px 2px rgba(0,255,0,0.6)"
    : "0 0 8px 2px rgba(255,0,0,0.6)";
}

    // --- MMF kartica 7 ---
    if (index === 6) {
      lampica.style.backgroundColor = period === "noć" ? "#f00" : "#0f0";
      lampica.style.boxShadow = period === "noć"
        ? "none"
        : "0 0 8px 2px rgba(0,255,0,0.6)";
    }
    
        // --- KARTICA 4 – POSLOVI ---
    if (index === 3) { // jer je kar4.jpg četvrta po redu
      if (period === "noć") {
        // Noću uvek crvena
        lampica.style.backgroundColor = "#f00";
        lampica.style.boxShadow = "0 0 8px 2px rgba(255,0,0,0.6)";
      } else {
        // Danju – 30% šansa za zelenu, inače crvena
        const sansa = Math.random();
        if (sansa <= 0.3) {
          lampica.style.backgroundColor = "#0f0";
          lampica.style.boxShadow = "0 0 8px 2px rgba(0,255,0,0.6)";
        } else {
          lampica.style.backgroundColor = "#f00";
          lampica.style.boxShadow = "0 0 8px 2px rgba(255,0,0,0.6)";
        }
      }
    }

// --- KARTICA 9 – KOPANJE ---
if (index === 8) {
  const sviProdati = kineziStatus === 2 && rusiStatus === 2 && arapiStatus === 2;
  if (sviProdati) {
    lampica.style.backgroundColor = "#f00";
    lampica.style.boxShadow = "0 0 8px 2px rgba(255,0,0,0.6)";
  } else {
    lampica.style.backgroundColor = period === "noć" ? "#0f0" : "#f00";
    lampica.style.boxShadow = period === "noć"
      ? "0 0 8px 2px rgba(0,255,0,0.6)"
      : "0 0 8px 2px rgba(255,0,0,0.6)";
  }
}

    if (index === 10) { // kartica 11
  const sviProdati = kineziStatus === 2 && rusiStatus === 2 && arapiStatus === 2;
  lampica.style.backgroundColor = sviProdati ? "#f00" : "#0f0";
  lampica.style.boxShadow = sviProdati
    ? "0 0 8px 2px rgba(255,0,0,0.6)"
    : "0 0 8px 2px rgba(0,255,0,0.6)";
}

    // --- NOVO: KOPANJE kartica 9 ---
    if (index === 8) {
      lampica.style.backgroundColor = period === "noć" ? "#0f0" : "#f00";
      lampica.style.boxShadow = period === "noć"
        ? "0 0 8px 2px rgba(0,255,0,0.6)"
        : "0 0 8px 2px rgba(255,0,0,0.6)";
    }

    // --- KONJ kartica 10 ---
    if (index === 9) {
      lampica.style.backgroundColor = konjPodmazan ? "#0f0" : "#f00";
      lampica.style.boxShadow = konjPodmazan
        ? "0 0 8px 2px rgba(0,255,0,0.6)"
        : "0 0 8px 2px rgba(255,0,0,0.6)";
    }
  });
}

// --- KARTICA 1 ---
function handleCard1(amount) {
  if (!igraAktivna) return;
  kasa += amount;
  kasaDisplay.textContent = formatMoney(kasa);
  togglePeriod();
  cardModal.classList.add("hidden");
}

// --- NOĆNI DOGAĐAJ SISTEM ---
const nightEventModal = document.getElementById("night-event-modal");
const nightEventImg = document.getElementById("night-event-img");
const nightEventText = document.getElementById("night-event-text");
const nightEventExit = document.getElementById("night-event-exit");
const konjPodmazanModal = document.getElementById("konj-podmazan-modal");
const konjPodmazanExit = document.getElementById("konj-podmazan-exit");
const konjNijePodmazanModal = document.getElementById("konj-nije-podmazan-modal");
const konjNijePodmazanExit = document.getElementById("konj-nije-podmazan-exit");

const nightEvents = [
  { img: "dogadjaj1.jpg", text: "Srusio se helikopter. \nMoramo pokazivati 'nudes' blokaderke uzivo, nema veze sto je bila maloletna." },
  { img: "dogadjaj2.jpg", text: "Mali od onog s TV-a pregazio devojcicu i nije ni zastao. \nMoramo dovesti sve u studio da lupetaju." },
  { img: "dogadjaj3.jpg", text: "Pao plafon u skoli na decu. \nDovescemo debelog da siri mVznju." },
  { img: "dogadjaj4.jpg", text: "Kum divljao porseom, nasiban k'o ker. \nVadimo babu iz telesopa da cmizdri kako ne moze da prodje pored blokade." },
  { img: "dogadjaj5.jpg", text: "Zapalilo se postrojenje koje proizvodi struju jer smo ga lozili blatom umesto ugljem. \nPricacemo o 'ustaskoj' pevacici, stranim placenicima i domacim izdajnicima." },
  { img: "dogadjaj6.jpg", text: "Znas sina od onog naseg, e pa njegova ekipa stanglom disocirala blokaderki vilicu jer je lepila nalepnice... \nVoja ce da okVene mVznju gde tVeba." },
  { img: "dogadjaj7.jpg", text: "Pala neka nadsresnica, satro 16 zrtava. \nMoramo onoj nasoj napraviti koncert, da narod skrene misli." },
  { img: "dogadjaj8.jpg", text: "Blokirana cela drzava, generalni strajk. \nReci cemo da je bilo 500 blokadera, nego vidite otvorili smo jos jednu deonicu puta bez dozvole..." },
  { img: "dogadjaj9.jpg", text: "Nije nam bas uspeo nijedan kontraskup. \nTrebace love da se ovi snimci preprave..." },
  { img: "dogadjaj10.jpg", text: "Jednorog upao u fabriku zbidelja. \nNakon toga krenuo da vas juri i nabada glavom. \nReci cemo da je blokader i placenik." }
];

function showNightEvent() {
  const randomEvent = nightEvents[Math.floor(Math.random() * nightEvents.length)];
  nightEventImg.src = `assets/${randomEvent.img}`;
  nightEventText.textContent = randomEvent.text;
  nightEventModal.classList.remove("hidden");
}

nightEventExit.addEventListener("click", () => {
  nightEventModal.classList.add("hidden");
  if (konjPodmazan) konjPodmazanModal.classList.remove("hidden");
  else konjNijePodmazanModal.classList.remove("hidden");
});

// --- KONJ PODMAZAN ---
konjPodmazanExit.addEventListener("click", () => {
  // Sigurno zatvori sve moguće modale
  if (nightEventModal) nightEventModal.classList.add("hidden");
  if (konjPodmazanModal) konjPodmazanModal.classList.add("hidden");
  if (konjNijePodmazanModal) konjNijePodmazanModal.classList.add("hidden");
  if (cardModal) cardModal.classList.add("hidden");

  // Ažuriraj skale (isto kao pre)
  updateBlokaderi(blokaderi - 15);
  updateMoral(moral + 15);

  // Konj ostaje podmazan
  konjPodmazan = true;

  // Ukloni sva dugmad osim izlaza
  document.querySelectorAll(".action-btn").forEach(btn => (btn.style.display = "none"));

  // Mali delay da DOM završi pre nego što se krene dalje
  setTimeout(() => togglePeriod(), 250);
});


// --- KONJ NIJE PODMAZAN ---
konjNijePodmazanExit.addEventListener("click", () => {
  // Sigurno zatvori sve moguće modale
  if (nightEventModal) nightEventModal.classList.add("hidden");
  if (konjPodmazanModal) konjPodmazanModal.classList.add("hidden");
  if (konjNijePodmazanModal) konjNijePodmazanModal.classList.add("hidden");
  if (cardModal) cardModal.classList.add("hidden");

  // Ažuriraj skale (isto kao pre)
  updateCacad(cacad - 20);
  updateBlokaderi(blokaderi + 10);
  updateMoral(moral - 10);

  // Vrati da konj nije podmazan
  konjPodmazan = false;

  // Ukloni sva dugmad osim izlaza
  document.querySelectorAll(".action-btn").forEach(btn => (btn.style.display = "none"));

  // Mali delay da spreči dupli event
  setTimeout(() => togglePeriod(), 250);
});

// angažuj još
reketAngazuj.addEventListener("click", () => {
  if (!igraAktivna) return;
  if (reketLevel >= 3) return showLopoveNeKradi();
  if (kasa < 10000000) return showLopoveNeKradi();

  kasa -= 10000000;
  kasaDisplay.textContent = formatMoney(kasa);
  reketLevel++;
  reketDaily = reketLevel === 2 ? 10000000 : 15000000;
  togglePeriod();
  updateReketText();
});

// pokupi
reketPokupi.addEventListener("click", () => {
  if (!igraAktivna) return;
  kasa += reketStored;
  kasaDisplay.textContent = formatMoney(kasa);
  updateMoral(moral + 10);
  reketStored = 0;
  reketLastCollected = danBroj;
  togglePeriod();
  updateReketText();
});

// izlaz
reketExit.addEventListener("click", () => {
  reketModal.classList.add("hidden");
});

// --- DODAJ U GLAVNI TOK: REKET PRAĆENJE ---
function azurirajReketNaPeriod() {
  if (!igraAktivna) return;

  const daysSince = danBroj - reketLastCollected;

  // Ako je prošlo više od 7 dana bez prikupljanja, resetuj i počni novo brojanje
  if (daysSince > 7) {
    reketStored = 0;
    reketLastCollected = danBroj;
  }

  // Svaki dan dodaj redovnu proizvodnju
  reketStored += reketDaily;
  updateReketText?.();
}

// --- CHEAT SISTEM ---
const cheatBtn = document.getElementById("cheat-btn");
const cheatModal = document.getElementById("cheat-modal");
const cheatInput = document.getElementById("cheat-input");
const cheatOk = document.getElementById("cheat-ok");
const cheatExit = document.getElementById("cheat-exit");
const cheatStage1 = document.getElementById("cheat-stage1");
const cheatStage2 = document.getElementById("cheat-stage2");
const cheatClose2 = document.getElementById("cheat-close2");
const popup = document.getElementById("cheat-popup");
const popupOk = document.getElementById("popup-ok");

cheatBtn.addEventListener("click", () => {
  if (!igraAktivna) return;
  cheatModal.classList.remove("hidden");
  if (cheatAktivan) {
    showStage2();
  } else {
    cheatStage1.classList.remove("hidden");
    cheatStage2.classList.add("hidden");
  }
});

cheatExit.addEventListener("click", () => cheatModal.classList.add("hidden"));
cheatClose2.addEventListener("click", () => cheatModal.classList.add("hidden"));

cheatOk.addEventListener("click", () => {
  const pass = cheatInput.value.trim().toLowerCase();
  if (pass === "jebnorog") {
    cheatAktivan = true;
    jakaSifra = false;
    showStage2();
  } else if (pass === "skafiskafnjak") {
    cheatAktivan = true;
    jakaSifra = true;
    showStage2();
  } else showPopup();
});

function showStage2() {
  cheatStage1.classList.add("hidden");
  cheatStage2.classList.remove("hidden");
}
function showPopup() {
  popup.classList.remove("hidden");
}
popupOk.addEventListener("click", () => popup.classList.add("hidden"));
function cheatBlocked() {
  showPopup();
}


// cheat dugmad
document.getElementById("moral-minus").addEventListener("click", () => {
  if (!cheatAktivan) return cheatBlocked();
  updateMoral(moral - 10);
});
document.getElementById("moral-plus").addEventListener("click", () => {
  if (!cheatAktivan) return cheatBlocked();
  updateMoral(moral + 10);
});
document.getElementById("cacad-minus").addEventListener("click", () => {
  if (!cheatAktivan) return cheatBlocked();
  updateCacad(cacad - 10);
});
document.getElementById("cacad-plus").addEventListener("click", () => {
  if (!cheatAktivan) return cheatBlocked();
  updateCacad(cacad + 10);
});
document.getElementById("blok-minus").addEventListener("click", () => {
  if (!cheatAktivan) return cheatBlocked();
  updateBlokaderi(blokaderi - 10);
});
document.getElementById("blok-plus").addEventListener("click", () => {
  if (!cheatAktivan) return cheatBlocked();
  updateBlokaderi(blokaderi + 10);
});
document.getElementById("period-plus").addEventListener("click", () => {
  if (!jakaSifra) return cheatBlocked();
  togglePeriod();
});
document.getElementById("kasa-plus").addEventListener("click", () => {
  if (!jakaSifra) return cheatBlocked();
  kasa += 100000000;
  kasaDisplay.textContent = formatMoney(kasa);
});
// --- EXIT MODAL ---
const exitBtn = document.getElementById("exit-btn");
const exitModal = document.getElementById("exit-modal");
const stayBtn = document.getElementById("stay-btn");
const leaveBtn = document.getElementById("leave-btn");

exitBtn.addEventListener("click", () => {
  if (!igraAktivna) return;
  exitModal.classList.remove("hidden");
});
stayBtn.addEventListener("click", () => exitModal.classList.add("hidden"));
leaveBtn.addEventListener("click", () => location.reload());

// --- ✅ CREDITS ---
const creditsBtn = document.getElementById("credits-btn");
const creditsModal = document.getElementById("credits-modal");
const closeCredits = document.getElementById("close-credits");
if (creditsBtn && creditsModal && closeCredits) {
  creditsBtn.addEventListener("click", () =>
    creditsModal.classList.remove("hidden")
  );
  closeCredits.addEventListener("click", () =>
    creditsModal.classList.add("hidden")
  );
}

// --- PRAVILA ---
const rulesBtn = document.getElementById("rules-btn");
const pravila1 = document.getElementById("pravila1-modal");
const pravila2 = document.getElementById("pravila2-modal");
const pravila3 = document.getElementById("pravila3-modal");
const next1 = document.getElementById("next1");
const next2 = document.getElementById("next2");
const ok3 = document.getElementById("ok3");

rulesBtn.addEventListener("click", () => {
  document.getElementById("credits-modal").classList.add("hidden");
  pravila1.classList.remove("hidden");
});
next1.addEventListener("click", () => {
  pravila1.classList.add("hidden");
  pravila2.classList.remove("hidden");
});
next2.addEventListener("click", () => {
  pravila2.classList.add("hidden");
  pravila3.classList.remove("hidden");
});
ok3.addEventListener("click", () => pravila3.classList.add("hidden"));

// --- CACAD / BLOKADERI / MORAL KRAJEVI ---
function showCacadModal(type) {
  if (type === "minus") cacadMinusModal.classList.remove("hidden");
  else if (type === "plus") cacadPlusModal.classList.remove("hidden");
}
function showBlokaderiModal(type) {
  if (type === "minus") blokMinusModal.classList.remove("hidden");
  else if (type === "plus") blokPlusModal.classList.remove("hidden");
}
function showMoralModal() {
  moralModal.classList.remove("hidden");
}

function shareOnFacebook() {
  const shareUrl = encodeURIComponent(window.location.href);
  window.open(
    `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
    "_blank"
  );
}
[
  shareMinus,
  sharePlus,
  shareBlokMinus,
  shareBlokPlus,
  shareMoral,
].forEach((b) => b?.addEventListener("click", shareOnFacebook));

// --- ✅ POPRAVLJEN RESTART FUNKCIJA ---
[
  restartMinus,
  restartPlus,
  restartBlokMinus,
  restartBlokPlus,
  restartMoral,
].forEach((btn) =>
  btn?.addEventListener("click", () => {
    document
      .querySelectorAll(
        "#cacad-minus-modal, #cacad-plus-modal, #blok-minus-modal, #blok-plus-modal, #moral-modal, #exit-modal, #cheat-modal, #zbidelj-modal, #credits-modal, #mmf-night-modal, #card-modal, #pravila1-modal, #pravila2-modal, #pravila3-modal, #night-event-modal, #konj-podmazan-modal, #konj-nije-podmazan-modal"
      )
      .forEach((m) => m.classList.add("hidden"));

    clearInterval(timerInterval);
    resetVariables();
    startGame();
  })
);

// --- MMF NOĆNI IZLAZ ---
mmfNightExit.addEventListener("click", () =>
  mmfNightModal.classList.add("hidden")
);

// --- GAME OVER – KRADJA ---
function showGameOverKradja() {
  const modal = document.getElementById("kradja-modal");
  if (modal) modal.classList.remove("hidden");
}

// share dugme
const shareKradja = document.getElementById("share-kradja");
if (shareKradja) {
  shareKradja.addEventListener("click", shareOnFacebook);
}

// restart dugme
const restartKradja = document.getElementById("restart-kradja");
if (restartKradja) {
  restartKradja.addEventListener("click", () => {
    document.getElementById("kradja-modal").classList.add("hidden");
    clearInterval(timerInterval);
    resetVariables();
    startGame();
  });
}

// --- GAME OVER – KOCKANJE ---
function showGameOverKockanje() {
  const modal = document.getElementById("kockanje-modal");
  if (modal) modal.classList.remove("hidden");
}

document.getElementById("share-kockanje").addEventListener("click", shareOnFacebook);
document.getElementById("restart-kockanje").addEventListener("click", () => {
  document.getElementById("kockanje-modal").classList.add("hidden");
  clearInterval(timerInterval);
  resetVariables();
  startGame();
});


// --- ZBIDELJ I LOPOV ---
function updateZbideljDisplay() {
  const cardText = document.getElementById("card-text");
  if (!cardText) return;
  const nextLevel = zbideljLevel < 4 ? zbideljLevel + 1 : null;
  let info = nextLevel
    ? `<br><br>Trenutna proizvodnja ${zbideljProduction} kg Zbidelja dnevno.<br>Sledeći nivo → ${zbideljUpgrade[nextLevel]} kg Zbidelja dnevno.<br><b>Nivo: ${zbideljLevel}/4</b>`
    : `<br><br>Trenutna proizvodnja ${zbideljProduction} kg Zbidelja dnevno.<br>Dostigli ste maksimalni nivo.<br><b>Nivo: ${zbideljLevel}/4</b>`;
  cardText.innerHTML = `Dobrodošli u Zbidelj fabriku!<br>Ova institucija proizvodi najfiniji Zbidelj poznat u regionu.<br>Povećajte proizvodne kapacitete mudrim investicijama i gledajte kako tone postaju vaša svakodnevica.<br> Cene upgrade-ova su 2M 3M 5M ${info}`;
}

function upgradeZbidelj(level) {
  if (!igraAktivna) return;
  if (level !== zbideljLevel + 1) return showLopoveNeKradi();
  const cost = zbideljUpgradeCosts[level];
  if (kasa < cost) return showLopoveNeKradi();
  kasa -= cost;
  kasaDisplay.textContent = formatMoney(kasa);
  zbideljLevel = level;
  zbideljProduction = zbideljUpgrade[level];
  updateZbideljDisplay();
  togglePeriod();
}

function showLopoveNeKradi() {
  document.getElementById("lopov-modal").classList.remove("hidden");
}
document.getElementById("lopov-ok")?.addEventListener("click", () => {
  document.getElementById("lopov-modal").classList.add("hidden");
});

// --- DNEVNI DOGAĐAJ: FANTOMKA (SUBOTA UJUTRU) ---
function showFantomkaEvent() {
  const modal = document.getElementById("night-event-modal");
  const img = document.getElementById("night-event-img");
  const text = document.getElementById("night-event-text");

  // Prikaz slike i osnovnog teksta
  img.src = "assets/fantomka.jpg";
  text.innerHTML = `<b>Cacad došla po dnevnice, sendviče i Zbidelj.</b>`;
  modal.classList.remove("hidden");

  // Pronađi i zameni postojeće dugme "IZLAZ"
  const exitBtn = document.getElementById("night-event-exit");
  const newExit = exitBtn.cloneNode(true);
  exitBtn.parentNode.replaceChild(newExit, exitBtn);

  // --- DEŠAVANJE PRI KLIKU NA IZLAZ ---
  newExit.addEventListener("click", () => {
    modal.classList.add("hidden");

    let zbideljOduzet = false;
    let sendviciProvereni = false;

    // 1️⃣ ZBIDELJ / KASA
    if (zbidelj >= 1000) {
      zbidelj -= 1000;
      updateZbidelj(zbidelj);
      zbideljOduzet = true;
    } else {
      kasa -= 5000000;
      if (kasa < 0) kasa = 0;
      kasaDisplay.textContent = formatMoney(kasa);
      updateCacad(cacad - 15);
    }

    // 2️⃣ SENDVIČI
    if (sendviciNapravljeni) {
      updateCacad(cacad + 5);
      sendviciProvereni = true;
    } else {
      updateCacad(cacad - 20);
    }

    // 3️⃣ KOMBINOVANI USLOV — NIŠTA NIJE ISPUNJENO
    if (!zbideljOduzet && !sendviciProvereni) {
      updateBlokaderi(blokaderi + 20);
    }

    // 4️⃣ RESET & ZAVRŠETAK
    sendviciNapravljeni = false;
    updateLampice();
    togglePeriod();
  });
}

// --- DNEVNI DOGAĐAJ: CACAD BANULA PO JOŠ ZBIDELJA (PON / SRE / PET) ---
function showCacadZbideljEvent() {
  const modal = document.getElementById("night-event-modal");
  const img = document.getElementById("night-event-img");
  const text = document.getElementById("night-event-text");

  // Prikaz slike i osnovnog teksta
  img.src = "assets/fantomka.jpg";
  text.innerHTML = `<b>Cacad banula po još Zbidelja.</b>`;
  modal.classList.remove("hidden");

  // Pronađi i zameni postojeće dugme "IZLAZ"
  const exitBtn = document.getElementById("night-event-exit");
  const newExit = exitBtn.cloneNode(true);
  exitBtn.parentNode.replaceChild(newExit, exitBtn);

  // --- DEŠAVANJE PRI KLIKU NA IZLAZ ---
  newExit.addEventListener("click", () => {
    modal.classList.add("hidden");

    // 1️⃣ Ako ima 1000+ Zbidelja
    if (zbidelj >= 1000) {
      zbidelj -= 1000;
      updateZbidelj(zbidelj);
      updateCacad(cacad + 5);
      updateMoral(moral + 10); // korupcija +10
      togglePeriod();
      return;
    }

    // 2️⃣ Ako nema dovoljno Zbidelja
    updateCacad(cacad - 10);
    updateMoral(moral - 15); // korupcija -15
    kasa -= 5000000;
    if (kasa < 0) kasa = 0;
    kasaDisplay.textContent = formatMoney(kasa);
    togglePeriod();
  });
}
// --- NOĆNI DOGAĐAJ: SEFE, ZVEKNULI SMO X KOG STE TRAŽILI (UTO / ČET) ---
function showZveknuliEvent() {
  const modal = document.getElementById("night-event-modal");
  const img = document.getElementById("night-event-img");
  const text = document.getElementById("night-event-text");

  // --- NASUMIČAN IZBOR META ---
  const mete = ["novinara", "klinca", "magarca"];
  const meta = mete[Math.floor(Math.random() * mete.length)];

  // Prikaz slike i osnovnog teksta
  img.src = "assets/fantomka.jpg";
  text.innerHTML = `<b>Sefe, zveknuli smo ${meta} kog ste tražili.</b>`;
  modal.classList.remove("hidden");

  // Pronađi i zameni postojeće dugme "IZLAZ"
  const exitBtn = document.getElementById("night-event-exit");
  const newExit = exitBtn.cloneNode(true);
  exitBtn.parentNode.replaceChild(newExit, exitBtn);

  // --- Dodaj drugo dugme "ODBIJ" ---
  const btnContainer = newExit.parentNode;
  const existingReject = document.getElementById("reject-btn");
  if (existingReject) existingReject.remove();

  const rejectBtn = document.createElement("button");
  rejectBtn.id = "reject-btn";
  rejectBtn.classList.add("exit-btn");
  rejectBtn.textContent = "ODBIJ";
  btnContainer.appendChild(rejectBtn);

  // --- DEŠAVANJE PRI KLIKU NA "IZLAZ" ---
  newExit.addEventListener("click", () => {
    modal.classList.add("hidden");
    kasa -= 10000000;
    if (kasa < 0) kasa = 0;
    kasaDisplay.textContent = formatMoney(kasa);
    updateMoral(moral + 10); // korupcija +10
    togglePeriod();
  });

  // --- DEŠAVANJE PRI KLIKU NA "ODBIJ" ---
  rejectBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
    updateMoral(moral - 40); // korupcija -40
    togglePeriod();
  });
}
