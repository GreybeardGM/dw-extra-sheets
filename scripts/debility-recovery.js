const MODULE_ID = "dw-extra-sheets";
const FLAG_KEY = "debilityRecovery";
const ABILITIES = new Set(["str", "dex", "con", "int", "wis", "cha"]);
const GROUP_CLASS = "dwes-debility-recovery";

function recoveryValue(actor, ability) {
  const value = Number(actor.getFlag(MODULE_ID, FLAG_KEY)?.[ability] ?? 0);
  return Number.isFinite(value) ? Math.min(3, Math.max(0, Math.trunc(value))) : 0;
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
    if (!ABILITIES.has(ability) || !cell.querySelector(".ability-debility")) continue;

    const label = cell.querySelector(".ability-rollable")?.textContent.trim() ?? ability;
    let group = cell.querySelector(`:scope > .${GROUP_CLASS}`);
    if (group) {
      updateGroup(app, group, ability, label, group.dataset.pending === "true");
      continue;
    }

    // CSS reserves space below the original cell without changing its height.
    // This preserves both its flex layout and the modifier circle's position.
    cell.classList.add("dwes-has-recovery");

    group = document.createElement("div");
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
          // Update only this attribute, preserving the other five counters.
          await actor.update({ [`flags.${MODULE_ID}.${FLAG_KEY}.${ability}`]: next });
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

    cell.append(group);
    updateGroup(app, group, ability, label);
  }
}

Hooks.on("renderActorSheet", renderDebilityRecovery);
