class Card {
  constructor(id, name, type, set, power, strength, mana_cost, attributes, rarity, isLegendary, image = null)
  {
    this.id = id;
    this.name = name;
    this.type = type;
    this.set = set;
    this.power = power;
    this.strength = strength;
    this.mana_cost = mana_cost;
    this.attributes = attributes;
    this.rarity = rarity;
    this.isLegendary = isLegendary;
    this.image = image;
  }

  getManaCost()
  {
    console.log(this.mana_cost);
  }
}
