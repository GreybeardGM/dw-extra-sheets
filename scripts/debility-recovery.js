const MODULE_ID = "dw-extra-sheets";
const FLAG_KEY = "debilityRecovery";
const ABILITIES = new Set(["str", "dex", "con", "int", "wis", "cha"]);
const GROUP_CLASS = "dwes-debility-recovery";

function recoveryValue(actor, ability) {
  // The system's debility remains authoritative, including for older actors.
  if (!actor.system.abilities?.[ability]?.debility) return 0;
  const value = Math.trunc(Number(actor.getFlag(MODULE_ID, FLAG_KEY)?.[ability]));
  return Number.isFinite(value) && value > 0 ? Math.min(3, value) : 3;
}

function canEdit(app) {
  return app.actor.isOwner && app.isEditable;
}

function updateGroup(app, group, ability, label, pending = false) {
  const value = recoveryValue(app.actor, ability);
  const description = game.i18n.format("DWES.RecoveryRemaining", { ability: label, count: value });
  group.title = description;
  group.setAttribute("aria-label", description);

  for (const button of group.querySelectorAll("button")) {
    const pip = Number(button.dataset.pip);
    const target = pip === value ? pip - 1 : pip;
    const title = game.i18n.format("DWES.RecoverySet", { ability: label, count: target });
    button.setAttribute("aria-pressed", String(pip <= value));
    button.setAttribute("aria-label", title);
    button.title = title;
    button.disabled = pending || !canEdit(app);
  }
}

function renderDebilityRecovery(app, html) {
  const actor = app.actor;
  if (game.system.id !== "dungeonworld" || actor?.type !== "character") return;

  // AppV1 supplies jQuery in v12/v13; also accept a native render root.
  const root = html instanceof HTMLElement ? html : html?.[0];
  if (!(root instanceof HTMLElement)) return;

  for (const cell of root.querySelectorAll(".cell--abilities .abilities-list > .ability[data-ability]")) {
    const ability = cell.dataset.ability;
    if (!ABILITIES.has(ability)) continue;

    const label = cell.querySelector(".ability-rollable")?.textContent.trim() ?? ability;
    let group = cell.querySelector(`.dwes-debility-control > .${GROUP_CLASS}`);
    if (group) {
      updateGroup(app, group, ability, label, group.dataset.pending === "true");
      continue;
    }

    const original = cell.querySelector("label.ability-debility");
    const checkbox = original?.querySelector(`input[name="system.abilities.${ability}.debility"]`);
    if (!checkbox) continue;

    // Replace the label as well as its input: buttons inside a checkbox label
    // would otherwise inherit its click activation behavior.
    const control = document.createElement("div");
    control.className = "ability-debility dwes-debility-control";
    // A text-only label preserves the system's label typography without
    // associating it with any of the adjacent pip buttons.
    const caption = document.createElement("label");
    caption.className = "dwes-debility-label";
    caption.textContent = original.textContent.trim();

    group = document.createElement("span");
    group.className = GROUP_CLASS;
    group.setAttribute("role", "group");

    for (let pip = 1; pip <= 3; pip++) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "dwes-recovery-pip";
      button.dataset.pip = String(pip);
      button.addEventListener("click", async event => {
        event.preventDefault();
        event.stopPropagation();
        if (!canEdit(app) || group.dataset.pending === "true") return;

        const current = recoveryValue(actor, ability);
        const next = current === pip ? pip - 1 : pip;
        group.dataset.pending = "true";
        updateGroup(app, group, ability, label, true);
        try {
          // Save the counter and the native debility atomically for this actor.
          await actor.update({
            [`flags.${MODULE_ID}.${FLAG_KEY}.${ability}`]: next,
            [`system.abilities.${ability}.debility`]: next > 0
          });
        } catch (error) {
          console.error(`${MODULE_ID} | Could not update debility recovery`, error);
          ui.notifications.error(game.i18n.localize("DWES.RecoverySaveError"));
        } finally {
          delete group.dataset.pending;
          updateGroup(app, group, ability, label);
        }
      });
      group.append(button);
    }

    control.append(group, caption);
    original.replaceWith(control);
    updateGroup(app, group, ability, label);
  }
}

Hooks.on("renderActorSheet", renderDebilityRecovery);
