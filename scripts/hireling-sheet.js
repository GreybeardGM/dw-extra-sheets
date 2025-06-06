class HirelingSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["dungeonworld", "sheet", "actor", "hireling"],
      template: "modules/dungeonworld-hirelings/templates/hireling-sheet.html",
      width: 500,
      height: 400
    });
  }

  getData() {
    const context = super.getData();
    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".skill-use").click(ev => {
      const skillKey = ev.currentTarget.dataset.key;
      const skills = duplicate(this.actor.system.skills);
      if (skills[skillKey].value > 0) {
        skills[skillKey].value -= 1;
        this.actor.update({ "system.skills": skills });
      }
    });

    html.find(".reset-skills").click(() => {
      const skills = duplicate(this.actor.system.skills);
      for (const key in skills) {
        skills[key].value = skills[key].max;
      }
      this.actor.update({ "system.skills": skills });
    });
  }
}

Actors.registerSheet("dungeonworld", HirelingSheet, {
  types: ["hireling"],
  label: "Hireling Sheet",
  makeDefault: true
});
