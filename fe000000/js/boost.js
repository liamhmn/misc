let Boost = {
  bought() {
    return player.boost.bought;
  },
  addBought(n) {
    player.boost.bought = player.boost.bought + n;
  },
  costForOne(n) {
    return Decimal.pow(2, this.costSlowdown() * Math.pow(this.costSkip() * (this.bought() + this.costStart() + n - 1), this.costPow()));
  },
  cost() {
    return this.costForOne(1);
  },
  costFor(n) {
    // Scaling gets good enough that it becomes impractical to consider 
    let m = n;
    let totalCost = new Decimal(0);
    while (m > 0) {
      let newTotalCost = totalCost.plus(this.costForOne(m));
      if (totalCost.eq(newTotalCost)) {
        break
      }
      totalCost = newTotalCost;
      m--;
    }
    return totalCost;
  },
  areBoostsDisabled() {
    return [8, 9, 10].indexOf(Challenge.currentChallenge()) !== -1;
  },
  multiplierPer() {
    if (this.areBoostsDisabled()) {
      return 1;
    }
    let mult = InfinityUpgrade(1).effect();
    if (InfinityChallenge.isInfinityChallengeCompleted(7)) {
      mult += 2;
    }
    mult *= Study(1).effect() * EternityUpgrade(2).effect() * this.boostPowerEffect();
    if (InfinityChallenge.isInfinityChallengeRunning(7)) {
      mult = Math.pow(mult, 2);
    }
    return mult;
  },
  multiplier() {
    return Decimal.pow(this.multiplierPer(), this.bought());
  },
  isVisible() {
    return !this.areBoostsDisabled();
  },
  canBuy(n) {
    if (n === undefined) {
      n = 1;
    }
    return n <= this.maxBuyable();
  },
  costSlowdown() {
    return EternityChallenge.getEternityChallengeReward(2);
  },
  costPower() {
    return EternityChallenge.isEternityChallengeRunning(2) ? 3 : 2;
  },
  costStart() {
    return EternityChallenge.isEternityChallengeRunning(2) ? 2 : 4;
  },
  costSkip() {
    return EternityChallenge.isEternityChallengeRunning(2) ? 1 : 2;
  },
  maxBuyable() {
    if (!this.isVisible() || InfinityPrestigeLayer.mustInfinity() || !Generators.anyGenerators()) return 0;
    let num = Math.floor((Math.pow(player.stars.max(1).log(2) / this.costSlowdown(), 1 / this.costPower()) - this.costStart()) / this.costSkip() + 1) - this.bought();
    if (player.stars.lt(this.costFor(num))) {
      num -= 1;
    }
    num = Math.min(num, Challenge.isChallengeEffectActive(7) ? Challenge.challenge7PurchasesLeft() : Infinity,
      InfinityChallenge.isInfinityChallengeRunning(8) ? InfinityChallenge.infinityChallenge8PurchasesLeft() : Infinity);
    num = Math.max(num, 0);
    return num;
  },
  buy(n, guaranteedBuyable) {
    if (n === undefined) {
      n = 1;
    }
    if (n === 0 || (!guaranteedBuyable && !this.canBuy(n))) return;
    player.stars = player.stars.minus(this.costFor(n));
    this.addBought(n);
    Stats.recordPurchase(0, n);
  },
  buyMax() {
    this.buy(this.maxBuyable(), true);
  },
  boostPower() {
    return player.boostPower;
  },
  boostPowerEffect() {
    return 1 + Math.log2(this.boostPower())
  },
  isBoostPowerVisible() {
    return this.isVisible() && this.boostPower() > 1;
  },
  boostPowerPerSecond() {
    return this.boostPowerPerBoost() * Math.max(0, this.bought() - this.boostPowerStart());
  },
  boostPowerPerBoost() {
    return 1 / 16384;
  },
  boostPowerStart() {
    return 320;
  },
  produceBoostPower(diff) {
    player.boostPower += this.boostPowerPerSecond() * diff;
    let oldExtraTheorems = this.extraTheorems();
    player.bestBoostPowerEver = Math.max(player.boostPower, player.bestBoostPowerEver);
    let newExtraTheorems = this.extraTheorems();
    player.unspentTheorems += newExtraTheorems - oldExtraTheorems;
  },
  bestBoostPowerEver() {
    return player.bestBoostPowerEver;
  },
  extraTheorems() {
    return Studies.theoremsFrom(Math.log2(this.bestBoostPowerEver()), 3);
  },
  nextExtraTheorem() {
    return Math.pow(2, Studies.costPow(this.extraTheorems(), 3));
  }
};
