class HirelingSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["dungeonworld", "sheet", "actor", "hireling"],
      template: "modules/dungeonworld-hirelings/templates/hireling-sheet.html",
      width: 520,
      height: "auto"
    });
  }

  getData() {
    return super.getData();
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".reset-skills").click(() => {
      const skills = duplicate(this.actor.system.skills || {});
      for (const key in skills) {
        skills[key].value = skills[key].max;
      }
      this.actor.update({ "system.skills": skills });
    });

    html.find(".add-skill").click(() => {
      const skills = duplicate(this.actor.system.skills || {});
      const newKey = `skill_${foundry.utils.randomID(5)}`;
      skills[newKey] = { label: "New Skill", value: 1, max: 1 };
      this.actor.update({ "system.skills": skills });
    });

    html.find(".remove-skill").click(ev => {
      const key = ev.currentTarget.dataset.skill;
      const skills = duplicate(this.actor.system.skills || {});
      delete skills[key];
      this.actor.update({ "system.skills": skills }).then(() => {
        this.render();
      });
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
