const MODULE_ID = "dw-extra-sheets";
const FLAG_KEY = "herculeanAppetites";
const MOVE_SOURCE_ID = "7EpgYJc7Isi37fD5";
const APPETITE_FORMULA = "1d6[appetite-d6]+1d8[appetite-d8]";
const CONTROL_CLASS = "dwes-appetites-toggle";
const RESULT_CLASS = "dwes-appetites-result";

const STRINGS = {
  de: {
    active: "1d6 + 1d8",
    inactive: "2d6",
    title: "Zwischen Normalwurf und Herculean Appetites wechseln",
    complication: "Dein rücksichtsloses Streben verursacht eine Komplikation.",
    clear: "Keine zusätzliche Appetit-Komplikation."
  },
  en: {
    active: "1d6 + 1d8",
    inactive: "2d6",
    title: "Toggle between a normal roll and Herculean Appetites",
    complication: "Your heedless pursuit causes a complication.",
    clear: "No additional appetite complication."
  }
};

function localize(key) {
  const language = game.i18n.lang?.toLowerCase().startsWith("de") ? "de" : "en";
  return STRINGS[language][key];
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

function isAppetiteFormula(formula) {
  const normalized = formula.toLowerCase();
  return normalized.includes("[appetite-d6]")
    && normalized.includes("[appetite-d8]");
}

async function toggleHerculeanAppetites(actor) {
  const currentFormula = String(actor.system.attributes?.rollFormula?.value ?? "");
  const active = isAppetiteFormula(currentFormula);
  const state = actor.getFlag(MODULE_ID, FLAG_KEY) ?? {};

  if (active) {
    await actor.update({
      "system.attributes.rollFormula.value": state.previousFormula ?? "",
      [`flags.${MODULE_ID}.${FLAG_KEY}`]: {
        previousFormula: ""
      }
    });
    return;
  }

  await actor.update({
    "system.attributes.rollFormula.value": APPETITE_FORMULA,
    [`flags.${MODULE_ID}.${FLAG_KEY}`]: {
      previousFormula: currentFormula
    }
  });
}

function renderAppetiteControl(app, html) {
  const actor = app.actor;
  if (!actor?.isOwner || !hasHerculeanAppetites(actor)) return;

  const root = html instanceof HTMLElement
    ? html
    : html?.[0] instanceof HTMLElement
      ? html[0]
      : null;
  const target = root?.querySelector(".cell--roll-formula")
    ?? root?.querySelector(".sheet-resources");
  if (!target || target.querySelector(`.${CONTROL_CLASS}`)) return;

  const formula = String(actor.system.attributes?.rollFormula?.value ?? "");
  const active = isAppetiteFormula(formula);
  const button = document.createElement("button");
  button.type = "button";
  button.className = `${CONTROL_CLASS}${active ? ` ${CONTROL_CLASS}--active` : ""}`;
  button.title = localize("title");
  button.setAttribute("aria-pressed", String(active));

  if (active) {
    // Inline !important is intentional: Dungeon World Night Mode applies the same priority.
    button.style.setProperty(
      "background-color",
      "var(--dwes-appetites-active-background)",
      "important"
    );
  }

  const icon = document.createElement("i");
  icon.className = active ? "fa-solid fa-fire" : "fa-solid fa-dice";
  const label = document.createElement("span");
  label.textContent = localize(active ? "active" : "inactive");
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
  const normalizedContent = content.toLowerCase();
  if (!normalizedContent.includes("appetite-d6")
    || !normalizedContent.includes("appetite-d8")
    || content.includes(RESULT_CLASS)) return;

  const template = document.createElement("template");
  template.innerHTML = content;
  const card = template.content.querySelector(".dw-chat-card .chat-card");
  if (!card) return;

  const d6 = readDieResult(template.content, "appetite-d6", 6);
  const d8 = readDieResult(template.content, "appetite-d8", 8);
  if (d6 === null || d8 === null) {
    console.warn(`${MODULE_ID} | Could not evaluate Herculean Appetites dice`, { message });
    return;
  }

  const complication = d6 > d8;
  const result = document.createElement("div");
  const modifier = complication ? "complication" : "clear";
  result.className = `row ${RESULT_CLASS} ${RESULT_CLASS}--${modifier}`;
  result.textContent = localize(modifier);

  const roll = card.querySelector(".roll");
  if (roll) roll.before(result);
  else card.append(result);

  message.updateSource({ content: template.innerHTML });
}

Hooks.on("renderActorSheet", renderAppetiteControl);
Hooks.on("preCreateChatMessage", evaluateAppetiteRoll);

console.log(`${MODULE_ID} | Herculean Appetites extension loaded`);
