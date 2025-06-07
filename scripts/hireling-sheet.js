export class HirelingSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["dungeonworld", "sheet", "actor", "hireling"],
      template: "modules/dungeonworld-hirelings/templates/hireling-sheet.html",
      width: 600,
      height: 400,
      tabs: [
        { navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }
      ]
    });
  }

  getData(options) {
    const data = super.getData(options);
    const items = this.actor.items;

    data.basicMoves = items.filter(i => i.type === "npcMove" && i.system.moveType === "basic");
    data.specialMoves = items.filter(i => i.type === "npcMove" && i.system.moveType === "special");

    return data;
  }

  activateListeners(html) {
    // Reuse DW's logic for item edit/delete/create
    super.activateListeners(html);
  
    // === Loyalty Roll Click ===
    html.find(".roll-loyalty").click(ev => {
      const loyalty = this.actor.system.loyalty;
      ChatMessage.create({
        user: game.user.id,
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        content: `<strong>Loyalty Check:</strong> ${loyalty}`,
      });
    });
  
    // === Use Skill ===
    html.find(".use-skill").click(ev => {
      const skillId = ev.currentTarget.dataset.skill;
      const skill = this.actor.system.skills?.[skillId];
      if (!skill) return;
  
      if (skill.value > 0) {
        const path = `system.skills.${skillId}.value`;
        this.actor.update({ [path]: skill.value - 1 });
      } else {
        ui.notifications.warn(`${skill.label || "This skill"} is already at 0.`);
      }
    });
  
    // === Reset Skills Button ===
    html.find(".reset-skills").click(() => {
      const updates = {};
      for (let i = 1; i <= 5; i++) {
        const skill = this.actor.system.skills?.[i];
        if (skill) {
          updates[`system.skills.${i}.value`] = skill.max ?? skill.value ?? 0;
        }
      }
      this.actor.update(updates);
    });
  }
}

// Register inside the module scope
Hooks.once("init", () => {
  console.log("✅ Registering HirelingSheet for NPCs");
  Actors.registerSheet("dungeonworld-hirelings", HirelingSheet, {
    types: ["npc"],
    label: "Hireling Sheet",
    makeDefault: false
  });
});
