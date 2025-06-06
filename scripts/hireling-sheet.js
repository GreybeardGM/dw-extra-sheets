class HirelingSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["dungeonworld", "sheet", "actor", "hireling"],
      template: "modules/dungeonworld-hirelings/templates/hireling-sheet.html",
      width: 600,
      height: "auto",
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "moves" }]
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
    super.activateListeners(html);

    html.find(".reset-skills").click(() => {
      const skills = foundry.utils.duplicate(this.actor.system.skills || {});
      for (const key in skills) {
        skills[key].value = skills[key].max;
      }
      this.actor.update({ "system.skills": skills });
    });

    html.find(".use-skill").click(ev => {
      const key = ev.currentTarget.dataset.skill;
      const skills = foundry.utils.duplicate(this.actor.system.skills || {});
      const skill = skills[key];
      if (!skill) return;
      if (skill.value > 0) {
        skill.value -= 1;
        this.actor.update({ "system.skills": skills });
      } else {
        ui.notifications.warn(`${skill.label} has no points left to use.`);
      }
    });

    html.find(".roll-loyalty").click(() => {
      ui.notifications.info("Loyalty roll logic to be implemented.");
    });
  }
}

Actors.registerSheet("dungeonworld", HirelingSheet, {
  types: ["npc"],
  label: "Hireling Sheet",
  makeDefault: false
});
