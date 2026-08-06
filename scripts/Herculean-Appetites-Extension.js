const MODULE_ID = "dw-extra-sheets";
const FLAG_KEY = "herculeanAppetites";
const MOVE_SOURCE_ID = "7EpgYJc7Isi37fD5";
const APPETITE_FORMULA = "1d6[appetite-d6]+1d8[appetite-d8]";
const CONTROL_CLASS = "dw-herculean-appetites-toggle";
const RESULT_CLASS = "dw-herculean-appetites-result";

function text(key, data = {}) {
  const german = game.i18n.lang?.toLowerCase().startsWith("de");
  const strings = german
    ? {
        active: "Herculean Appetites: 1d6 + 1d8",
        inactive: "Normalwurf: 2d6",
        enabled: "Herculean Appetites aktiviert.",
        disabled: "Normalwurf aktiviert.",
        title: "Zwischen Normalwurf und Herculean Appetites wechseln",
        complication: `d6 (${data.d6}) > d8 (${data.d8}): Der SL führt eine Komplikation oder Gefahr ein.`,
        clear: `d6 (${data.d6}) ≤ d8 (${data.d8}): Keine zusätzliche Appetit-Komplikation.`,
        unreadable: "Herculean Appetites: Die Einzelwürfel konnten nicht ausgewertet werden."
      }
    : {
        active: "Herculean Appetites: 1d6 + 1d8",
        inactive: "Normal roll: 2d6",
        enabled: "Herculean Appetites enabled.",
        disabled: "Normal roll enabled.",
        title: "Toggle between a normal roll and Herculean Appetites",
        complication: `d6 (${data.d6}) > d8 (${data.d8}): The GM introduces a complication or danger.`,
        clear: `d6 (${data.d6}) ≤ d8 (${data.d8}): No additional appetite complication.`,
        unreadable: "Herculean Appetites: Could not evaluate the individual dice."
      };

  return strings[key];
}

function hasHerculeanAppetites(actor) {
  if (actor?.type !== "character") return false;

  return actor.items.some(item => {
    if (item.type !== "move") return false;

    const sourceId = item.getFlag("core", "sourceId") ?? "";
    const name = item.name?.trim().toLowerCase();
    const moveClass = item.system?.class?.trim().toLowerCase();
    const rollFormula = item.system?.rollFormula?.replaceAll(" ", "").toLowerCase();

    return item.id === MOVE_SOURCE_ID
      || sourceId.endsWith(`.${MOVE_SOURCE_ID}`)
      || name === "herculean appetites"
      || (moveClass?.includes("barbar") && rollFormula?.includes("d6+d8"));
  });
}

function getActorFormula(actor) {
  return String(actor.system.attributes?.rollFormula?.value ?? "");
}

function isAppetiteFormula(formula) {
  const normalized = formula.toLowerCase();
  return normalized.includes("[appetite-d6]")
    && normalized.includes("[appetite-d8]");
}

async function toggleHerculeanAppetites(actor) {
  const currentFormula = getActorFormula(actor);
  const active = isAppetiteFormula(currentFormula);
  const state = actor.getFlag(MODULE_ID, FLAG_KEY) ?? {};

  if (active) {
    await actor.update({
      "system.attributes.rollFormula.value": state.previousFormula ?? "",
      [`flags.${MODULE_ID}.${FLAG_KEY}`]: {
        enabled: false,
        previousFormula: ""
      }
    });
    ui.notifications.info(text("disabled"));
    return;
  }

  await actor.update({
    "system.attributes.rollFormula.value": APPETITE_FORMULA,
    [`flags.${MODULE_ID}.${FLAG_KEY}`]: {
      enabled: true,
      previousFormula: currentFormula
    }
  });
  ui.notifications.info(text("enabled"));
}

function getRootElement(html) {
  if (html instanceof HTMLElement) return html;
  if (html?.[0] instanceof HTMLElement) return html[0];
  return null;
}

function renderAppetiteControl(app, html) {
  const actor = app.actor;
  if (!actor?.isOwner || !hasHerculeanAppetites(actor)) return;

  const root = getRootElement(html);
  const target = root?.querySelector(".cell--roll-formula")
    ?? root?.querySelector(".sheet-resources");
  if (!target || target.querySelector(`.${CONTROL_CLASS}`)) return;

  const active = isAppetiteFormula(getActorFormula(actor));
  const button = document.createElement("button");
  button.type = "button";
  button.className = `${CONTROL_CLASS}${active ? " is-active" : ""}`;
  button.title = text("title");
  button.setAttribute("aria-pressed", String(active));

  const icon = document.createElement("i");
  icon.className = active ? "fa-solid fa-fire" : "fa-solid fa-dice";
  const label = document.createElement("span");
  label.textContent = text(active ? "active" : "inactive");
  button.append(icon, label);

  button.addEventListener("click", async event => {
    event.preventDefault();
    event.stopPropagation();
    button.disabled = true;

    try {
      await toggleHerculeanAppetites(actor);
      app.render(false);
    } catch (error) {
      console.error(`${MODULE_ID} | Could not toggle Herculean Appetites`, error);
      ui.notifications.error(error.message);
      button.disabled = false;
    }
  });

  target.append(button);
}

function readDieResult(root, flavor, denomination) {
  const flavorElement = Array.from(root.querySelectorAll(".part-flavor"))
    .find(element => element.textContent.trim().toLowerCase() === flavor);
  const tooltipPart = flavorElement?.closest(".tooltip-part");
  const scope = tooltipPart ?? root;
  const dice = Array.from(scope.querySelectorAll(`.dice-rolls .roll.d${denomination}`));
  const die = dice.find(element => !element.classList.contains("discarded")) ?? dice[0];
  const result = Number.parseInt(die?.textContent?.trim(), 10);
  return Number.isFinite(result) ? result : null;
}

function evaluateAppetiteRoll(message) {
  const content = message.content ?? "";
  if (!content.toLowerCase().includes("appetite-d6")
    || !content.toLowerCase().includes("appetite-d8")
    || content.includes(RESULT_CLASS)) return;

  const template = document.createElement("template");
  template.innerHTML = content;
  const card = template.content.querySelector(".dw-chat-card .chat-card");
  if (!card) return;

  const d6 = readDieResult(template.content, "appetite-d6", 6);
  const d8 = readDieResult(template.content, "appetite-d8", 8);
  const complication = d6 !== null && d8 !== null && d6 > d8;
  const result = document.createElement("div");
  result.className = `row ${RESULT_CLASS}${complication ? " complication" : " clear"}`;

  const icon = document.createElement("i");
  icon.className = complication
    ? "fa-solid fa-triangle-exclamation"
    : "fa-solid fa-drumstick-bite";
  const label = document.createElement("strong");
  label.textContent = d6 === null || d8 === null
    ? text("unreadable")
    : text(complication ? "complication" : "clear", { d6, d8 });
  result.append(icon, label);

  const roll = card.querySelector(".roll");
  if (roll) roll.before(result);
  else card.append(result);

  message.updateSource({ content: template.innerHTML });
}

function addStyles() {
  if (document.getElementById("dw-herculean-appetites-styles")) return;

  const style = document.createElement("style");
  style.id = "dw-herculean-appetites-styles";
  style.textContent = `
    .${CONTROL_CLASS} {
      align-items: center;
      display: flex;
      flex: 1 0 100%;
      gap: 0.4rem;
      justify-content: center;
      margin-top: 0.25rem;
    }

    .${CONTROL_CLASS}.is-active {
      background: #7a271a;
      border-color: #b8462f;
      color: #fff;
    }

    .${RESULT_CLASS} {
      align-items: center;
      border-left: 4px solid #637563;
      display: flex;
      gap: 0.5rem;
      margin: 0.35rem 0;
      padding: 0.4rem 0.5rem;
    }

    .${RESULT_CLASS}.clear {
      background: rgb(70 100 70 / 15%);
    }

    .${RESULT_CLASS}.complication {
      background: rgb(150 35 20 / 18%);
      border-left-color: #a32618;
    }
  `;
  document.head.append(style);
}

Hooks.once("init", addStyles);
Hooks.on("renderActorSheet", renderAppetiteControl);
Hooks.on("preCreateChatMessage", evaluateAppetiteRoll);

console.log(`${MODULE_ID} | Herculean Appetites extension loaded`);
