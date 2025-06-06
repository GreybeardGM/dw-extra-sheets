class HirelingSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["dungeonworld", "sheet", "actor", "hireling"],
      template: "modules/hireling-manager/templates/hireling-sheet.html",
      width: 500,
      height: 400,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  getData() {
    const context = super.getData();
    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find(".skill-use").click(ev => {
      const skillIndex = Number(ev.currentTarget.dataset.index);
      const skills = duplicate(this.actor.system.skills);
      if (skills[skillIndex].points > 0) {
        skills[skillIndex].points -= 1;
        this.actor.update({ "system.skills": skills });
      }
    });

    html.find(".reset-skills").click(() => {
      const skills = duplicate(this.actor.system.skills).map(s => {
        s.points = s.maxPoints;
        return s;
      });
      this.actor.update({ "system.skills": skills });
    });
  }
}

Actors.registerSheet("dungeonworld", HirelingSheet, {
  types: ["npc"], // Or define a custom type
  label: "Hireling Sheet",
  makeDefault: false
});
