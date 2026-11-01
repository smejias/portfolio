(function () {
  'use strict';
  var mrEl = document.getElementById('mr');
  if (!mrEl) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var logEl = document.getElementById('mr-log');
  var st;
  var found = {};          // endings found, kept across restarts

  function fresh() {
    return { tree: true, curse: false, heat: false, contract: false, tents: false, guardDone: false, bandit: false, captain: false, entry: null,
             gaines: null, answer: null, gold: 0, items: [] };
  }
  // where the front door leads once the guard is down: you resume where you left off
  function resume(s) {
    if (s.captain) return 'gaines';
    if (s.tents && !s.bandit) return 'grunts';
    if (s.tents && s.bandit) return 'captain';
    return 'inside';
  }
  function addItem(s, name) { if (s.items.indexOf(name) < 0) s.items.push(name); }

  // ----- line builders -----
  function say(who, t) { return ['say', who, t]; }
  function narr(t) { return ['narr', t]; }
  function sys(kind, t) { return ['sys', kind, t]; }

  var ALF = 'Alfus, the Red Emissary';
  var PITCH_Q = "What do you say? I'll make it worth your while, and believe me—I'm a good friend to have.";

  // ----- passages -----
  // lines: array or fn(state). choices: array or fn(state) of {t, to, fx, show, off}
  var P = {
    a1: {
      lines: [
        narr('You find Alfus, the Red Emissary, at the starting camp.'),
        say(ALF, "Hello there, fair Wizard. I'm Alfus, an Emissary from the Red Capital."),
        say(ALF, 'The emissaries are here for one reason, and one reason only: opportunity.'),
        say(ALF, 'That portal you came through represents the biggest influx of magic to the world since who knows when.'),
        say(ALF, 'But the only way to seize this particular opportunity is by offering some in return. And have I got an opportunity for you!'),
        say(ALF, PITCH_Q)
      ],
      note: 'Alfus sells the job as an opportunity, not a favor. I wanted players to hear how the Red Mages talk before they learn anything about their rules: ambitious, businesslike, a little cyberpunk.',
      choices: [
        { t: '“I’m not interested.”', to: 'decline' },
        { t: 'Hear him out', to: 'pitch' }
      ]
    },
    decline: {
      lines: [say(ALF, "You'll be back...")],
      note: 'Saying no never closes the quest. I didn\'t want to punish players for not being ready, so Alfus is still there when they come back.',
      choices: [{ t: 'Walk away, then come back later', to: 'a2' }]
    },
    a2: {
      lines: [
        narr('You return to Alfus.'),
        say(ALF, "Ah, I knew you'd be back eventually! These guys doubted you, but I had faith."),
        say(ALF, PITCH_Q)
      ],
      note: 'The second time, Alfus acts like he expected it. A small change in his lines, so coming back feels like it was noticed.',
      choices: [
        { t: '“I’m not interested.”', to: 'decline2' },
        { t: 'Hear him out', to: 'pitch' }
      ]
    },
    decline2: {
      lines: [say(ALF, "I'll be here if you change your mind.")],
      note: 'Same idea as before: no is never a dead end. The offer stays open for as long as the player needs.',
      choices: [{ t: 'Think it over', to: 'a2' }]
    },
    pitch: {
      lines: [
        say(ALF, 'What I need is for you to check in on a man named Gaines, one of my attendants, whose ambition has gotten the better of his senses.'),
        say(ALF, 'He has seized an "abandoned" mine to the southwest of here in hopes of easy resources.'),
        say(ALF, 'But the law of the Red Capital recognized the local territory as "locally sovereign", which makes his seizure explicitly illegal.'),
        say(ALF, "I want to offer you a contract to remove the opportunist from the mine. I need a word with him. I'm offering a recipe for Heat Wave up front and 50 gold and a mount upon completion."),
        say(ALF, 'What do you say? Do we have a deal?')
      ],
      note: 'The pitch is where I plant the Red Mages\' own law ("locally sovereign"). Alfus wants a man removed, but he makes it sound like a legal matter, which is how a Red Mage would frame it.',
      choices: [
        { t: 'Sign the contract', to: 'contract' },
        { t: '\u201cI\u2019m not ready.\u201d', to: 'notReady' }
      ]
    },
    notReady: {
      lines: [say(ALF, "You'll be back...")],
      note: 'This is the last chance to step back before signing. I wanted the player to be able to hesitate here and not be pushed into the contract.',
      choices: [{ t: 'Walk away, then come back later', to: 'a2' }]
    },
    contract: {
      fx: function (s) { s.contract = true; addItem(s, 'Contract with Alfus'); addItem(s, 'Heat Wave recipe'); },
      lines: [
        sys('item', 'Quest item: Contract with Alfus. “A contract you made with Alfus with a lot fine print.”'),
        say(ALF, 'Here\'s the recipe. It details my first "cleaning" job... I can still smell the smoke. Never underestimate what a little fire can accomplish.'),
        sys('reward', 'Recipe: Heat Wave'),
        say(ALF, 'Now, go southwest, find that mine, and show my former assistant exactly who the real boss is.')
      ],
      note: 'The contract has no mechanical use at first, and that was on purpose. Its fine print pays off at the end. Alfus also hands over Heat Wave up front, which is the spell the tent shortcut asks for.',
      choices: [{ t: 'Leave Alfus', to: 'camp' }]
    },
    camp: {
      lines: [narr('Before you go, there are a few things you can do at the camp.')],
      choices: function (s) {
        return [
          { t: 'Listen to the Red Attendants', to: 'attendants' },
          { t: 'Craft Heat Wave', to: 'craft', show: !s.heat },
          { t: 'Ask Alfus where the mine is', to: 'dirs' },
          { t: 'Head for the mine', to: 'entrance' }
        ];
      }
    },
    attendants: {
      lines: [
        say('Red Attendant A', 'I tried to warn the Emissary, Attendant Gaines only cares about himself.'),
        say('Red Attendant B', "I don't know how someone could waste the opportunity of working with the Emissary.")
      ],
      note: 'I wanted the player to hear two opinions about Gaines before ever meeting him. The quest asks them to decide what to do with him, so they should have something to decide with.',
      choices: [{ t: 'Back to the camp', to: 'camp' }]
    },
    craft: {
      fx: function (s) { s.heat = true; addItem(s, 'Heat Wave'); s.items = s.items.filter(function (i) { return i !== 'Heat Wave recipe'; }); },
      lines: [sys('progress', 'You craft Heat Wave.')],
      note: 'Equipping the spell is the player\'s choice. Without it the tent shortcut is not available, and I preferred that to an automatic reward.',
      choices: [{ t: 'Back to the camp', to: 'camp' }]
    },
    dirs: {
      lines: [say(ALF, 'Just head a bit south and a fair way east to find the mine entrance.')],
      choices: [{ t: 'Back to the camp', to: 'camp' }]
    },
    entrance: {
      lines: function (s) {
        if (s.guardDone) return [narr('You are back at the mine entrance. The guard is still down.')];
        return [
          narr('You head south and a fair way east. In the middle of the forest, a guard stands at the mine\u2019s door.'),
          say('Mine entrance guard', 'This area is off-limits.'),
          say('Mine entrance guard', 'Leave. Now.')
        ];
      },
      note: 'The front door is the simplest way in: one guard, one fight. Players who explored an earlier quest get a different option.',
      choices: function (s) {
        var c = s.guardDone
          ? [{ t: 'Go back into the mine', to: resume(s) }, { t: 'Walk away', to: 'camp' }]
          : [{ t: 'Fight your way in', to: 'guardFight' }, { t: 'Walk away', to: 'camp' }];
        if (s.curse) c.push({ t: 'Look around the entrance first', to: 'animal' });
        return c;
      }
    },
    guardFight: {
      lines: [say('Mine entrance guard', 'Come at me... bro!'), sys('battle', 'Battle: the mine entrance guard')],
      note: 'In the game, combat decides this. In this demo you choose the result so you can see both.',
      choices: [
        { t: 'Win the battle', to: 'inside', fx: function (s) { s.entry = 'front'; s.guardDone = true; } },
        { t: 'Lose the battle', to: 'guardLost' }
      ]
    },
    guardLost: {
      lines: [say('Mine entrance guard', 'Pfff, pathetic.')],
      choices: [{ t: 'Try again', to: 'entrance' }]
    },
    animal: {
      lines: [
        narr('Near the entrance, an animal looks up at you.'),
        say('Talking animal', "Hey, I recognize you! You're one of the humans that broke the curse on the wood!"),
        say('Talking animal', 'Is there anything I can help you with?'),
        say('Talking animal', 'You need to get into the mine? I used to hang out there myself, until those jerks moved in.'),
        say('Talking animal', "Follow me, I'll show you my private entrance."),
        say('Talking animal', 'Ready to go in?')
      ],
      note: 'One quest rewards the player for finishing another. I like when the world remembers what you did, and here it also gives the shortest route to Gaines.',
      choices: [
        { t: 'Go in', to: 'gaines', fx: function (s) { s.entry = 'secret'; } },
        { t: 'Walk away', to: 'camp' }
      ]
    },
    inside: {
      lines: [
        narr('Inside the mine there is a camp you can interact with.'),
        narr('The tents, though thick, look like they might burn with a strong enough flame, causing a distraction.'),
        narr('What will you do?')
      ],
      note: 'This is where the Heat Wave from the contract matters. A player who connects the two gets an easier fight, and the choice feels smart instead of lucky.',
      choices: function (s) {
        return [
          { t: 'Use Heat Wave to burn the tents', to: 'tents', off: s.heat ? null : 'You need Heat Wave' },
          { t: 'Leave the tents alone', to: 'captain' }
        ];
      }
    },
    tents: {
      fx: function (s) { s.tents = true; },
      lines: [
        narr('The tents immediately catch fire, alerting two of the guards who come running to deal with the flames.'),
        say('Bandit grunt', 'You there! Did you think you could destroy our stuff and get away with it?'),
        sys('battle', 'Battle: the two grunts')
      ],
      note: 'Burning the tents splits the group: first the grunts, then the captain alone. Skip the tents and you face the captain and both grunts together.',
      choices: [
        { t: 'Win the battle', to: 'captain', fx: function (s) { s.bandit = true; } },
        { t: 'Lose the battle (you are teleported to the mine entrance)', to: 'entrance' }
      ]
    },
    grunts: {
      lines: [
        narr('The fire is still burning. The two guards are waiting for you.'),
        say('Bandit grunt', 'You there! Did you think you could destroy our stuff and get away with it?'),
        sys('battle', 'Battle: the two grunts')
      ],
      choices: [
        { t: 'Win the battle', to: 'captain', fx: function (s) { s.bandit = true; } },
        { t: 'Lose the battle (you are teleported to the mine entrance)', to: 'entrance' }
      ]
    },
    captain: {
      lines: [
        narr('At the door to the last room, the bandit captain steps forward.'),
        say('Bandit captain', 'Who in the Void are you? And how did you get past the other guards?'),
        say('Bandit captain', "All right, I'll give you one opportunity to leave with your life. Take it, or die."),
        say('Bandit captain', 'What will you do?')
      ],
      note: 'Even the captain offers a way out. I wanted every fight to have a way back, so the player is never trapped in the mine.',
      choices: [
        { t: 'Fight your way in', to: 'captainFight' },
        { t: 'Leave', to: 'entrance' }
      ]
    },
    captainFight: {
      lines: function (s) {
        return [sys('battle', s.tents ? 'Battle: the captain alone' : 'Battle: the captain and his two grunts')];
      },
      choices: [
        { t: 'Win the battle', to: 'gaines', fx: function (s) { s.captain = true; } },
        { t: 'Lose the battle (you are teleported to the mine entrance)', to: 'entrance' }
      ]
    },
    gaines: {
      lines: function (s) {
        return [
          narr(s.entry === 'secret' ? 'The burrow lets you out in the last chamber, skipping everything in between.' : 'You push through the door into the last chamber of the mine.'),
          say('Gaines', 'How did you get in here? I swear, the Quantum Shadow has swallowed up all the good help.'),
          say('Gaines', "There's only one person with the discretionary budget to hire you. But that doesn't mean he offered you the best deal."),
          say('Gaines', "How about this, I'll walk away from this venture, as it's proving to be more trouble than it's worth, and you can have what I've found here."),
          say('Gaines', 'You can probably even collect on your contract to expel me? If not, I will be forced to defend myself to the fullest. What do you say?'),
          say('Gaines', 'Do we have a deal?')
        ];
      },
      note: 'The last boss does not have to be fought. Taking his deal is a choice that suits a Red Mage: negotiate, don\'t just push through.',
      choices: [
        { t: '“No deal, Alfus wants to see you.”', to: 'gFight' },
        { t: '“Alright, show me what you’ve got.”', to: 'gDeal' }
      ]
    },
    gFight: {
      lines: [sys('battle', 'Battle: Gaines’s bodyguards')],
      choices: [
        { t: 'Win the battle', to: 'gWon' },
        { t: 'Lose the battle', to: 'gLost' }
      ]
    },
    gLost: {
      lines: [narr('You lose, and you are teleported away from the fight.')],
      choices: [{ t: 'Go back to the mine entrance', to: 'entrance' }]
    },
    gWon: {
      fx: function (s) { s.gaines = 'turnedIn'; },
      lines: [
        say('Gaines', "Alright alright! I'll go! Just don't hurt me."),
        say('Gaines', "The mine is yours, I'll report to Alfus immediately."),
        say('Gaines', "You really can't find good help these days...")
      ],
      note: 'Fighting him is the direct route. Gaines gives up and says he will report to Alfus himself, so this branch finishes cleanly.',
      choices: [{ t: 'Go back to Alfus', to: 'report' }]
    },
    gDeal: {
      fx: function (s) { s.gaines = 'letGo'; addItem(s, 'Materials'); },
      lines: [
        say('Gaines', 'Finally, someone with some sense. Here, take this stash.'),
        sys('reward', 'Materials'),
        say('Gaines', "Perhaps our paths will cross again someday. I'd love to do some proper business with you."),
        say('Gaines', 'Until then, I bid thee well.')
      ],
      note: 'Taking the deal is the Red Mage move, so I made it pay. A player who negotiates is not worse off, they just earn it differently.',
      choices: [{ t: 'Go back to Alfus', to: 'report' }]
    },
    report: {
      lines: [
        narr('You head back to the Red camp.'),
        say(ALF, 'Welcome back, friend! News of your success has in fact preceded you.'),
        say(ALF, 'But I want to hear it from you.'),
        say(ALF, 'Do tell, how did events play out?')
      ],
      note: 'What Alfus asks, and what you can answer, depends on what you did with Gaines. Turn him in and there is one answer. Let him go and you can lie or tell the truth.',
      choices: function (s) {
        if (s.gaines === 'turnedIn') {
          return [{ t: '“I defeated the brigands and your former attendant. The mine is yours.”', to: 'rTruth' }];
        }
        return [
          { t: '“Your attendant was gone by time I got there.” (a lie)', to: 'rLie' },
          { t: '“I let your attendant go, but the mine is yours.”', to: 'rLetGo' }
        ];
      }
    },
    rTruth: {
      fx: function (s) { s.answer = 'turnedIn'; s.gold += 150; addItem(s, 'Hip Shades recipe'); },
      lines: [
        say(ALF, 'Indeed! The scoundrel came grovelling back for forgiveness. I sent him to Capital Review Board for punishment.'),
        say(ALF, 'I did admire his ambition, but a true businessman turns the rules to their favor, rather than breaking blatantly them.'),
        say(ALF, 'Anyway, here is your agreed upon payment, plus a little bonus for convincing Gaines to hand himself over.'),
        sys('reward', '150 gold + Hip Shades (one-time recipe)'),
        say(ALF, 'Red Hats always honor their contracts.'),
        say(ALF, "You did well here. I'll be keeping you in mind if future opportunities should arise.")
      ],
      note: 'Honesty with a clean result gets the best reward, a recipe on top of the gold. Every branch pays, and none ends the quest badly.',
      choices: [{ t: 'Continue', to: 'hedge' }]
    },
    rLie: {
      fx: function (s) { s.answer = 'lie'; s.gold += 150; },
      lines: [
        say(ALF, 'Hmmm? I wonder what could have driven him to abandon his investment.'),
        say(ALF, 'Perhaps further investigation is needed...'),
        say(ALF, "Anyway, that's nothing to do with you. Your end of the contract is complete, the mine is clear."),
        say(ALF, 'Here is your payment, in full.'),
        sys('reward', '150 gold'),
        say(ALF, 'Red Hats always honor their contracts.'),
        say(ALF, "You did well here. I'll be keeping you in mind if future opportunities should arise.")
      ],
      note: 'Lying pays the same as full success, and Alfus is not fooled. I wanted bending the truth to feel like what a Red Mage would do, and to be safe.',
      choices: [{ t: 'Continue', to: 'hedge' }]
    },
    rLetGo: {
      fx: function (s) { s.answer = 'letGo'; s.gold += 50; },
      lines: [
        say(ALF, 'You did what!?'),
        say(ALF, 'I should! Should...'),
        say(ALF, 'Pay you, I suppose. It seems you read your contract well. There was no clause demanding his return.'),
        say(ALF, 'How careless of me. But.. shrewd of you.'),
        say(ALF, 'Here is your payment.'),
        sys('reward', '50 gold'),
        say(ALF, "The Red Hats never break a contract. Next time, I'll make sure I pay more attention to the fine print.")
      ],
      note: 'This is where the contract\'s fine print pays off. It looked like a joke item, but it decides the argument: there was no clause demanding his return.',
      choices: [{ t: 'Continue', to: 'hedge' }]
    },
    hedge: {
      lines: [
        say(ALF, 'You know, there was a Hedge Wizard just over there who was trying to contract me for help with a grant bird or something. Seems like something you could handle.'),
        sys('progress', 'Quest complete')
      ],
      note: 'Alfus ends by pointing to another job nearby. I wanted the quest to lead somewhere, not stop at a payment.',
      choices: [
        { t: 'Walk around the Red camp', to: 'epilogue' },
        { t: 'See how it went', to: 'end' }
      ]
    },
    epilogue: {
      lines: [narr('Back at the Red camp, news has travelled.')],
      note: 'The camp reacts to what the player did. I like small changes in what NPCs say afterwards, because they cost little and show the choice mattered.',
      choices: [
        { t: 'Talk to Red Attendant A', to: 'epA' },
        { t: 'Talk to Red Attendant B', to: 'epB' },
        { t: 'Talk to Alfus again', to: 'epAlfus' },
        { t: 'See how it went', to: 'end' }
      ]
    },
    epA: {
      lines: function (s) {
        return s.gaines === 'turnedIn'
          ? [say('Red Attendant A', 'I hope the Review Board gives Gaines exactly what he deserves; a one way trip straight to the mail room.')]
          : [say('Red Attendant A', "I can't believe Gaines evaded justice."), say('Red Attendant A', 'Maybe I misjudged the risk/reward ratio of the situation...')];
      },
      choices: [{ t: 'Back', to: 'epilogue' }]
    },
    epB: {
      lines: [say('Red Attendant B', 'Hopefully this means things will go back to business as usual around here.')],
      choices: [{ t: 'Back', to: 'epilogue' }]
    },
    epAlfus: {
      lines: [say(ALF, "The Red Hats could use an enterprising Wizard like yourself. I trust you'll consider the Red path as you continue your journey.")],
      choices: [{ t: 'Back', to: 'epilogue' }]
    },
    end: { custom: true }
  };

  var NOTES = {
  "a1": "The Red Hats are bureaucrats, merchants and lawyers driven by rank, money and power. That was already in the lore, so Alfus's voice follows it. I kept the lines short but made each one carry the faction's personality: a lot with a little, so the world feels alive and coherent.",
  "decline": "I never lock the quest behind a first “no”. A player who just wasn't ready would lose content for no reason.",
  "a2": "When the player comes back, Alfus reacts to it instead of repeating his pitch. It is a small line, but it tells the player the world noticed.",
  "decline2": "Every refusal loops back to the offer. Nobody can get stuck here.",
  "pitch": "The contract only asks the player to remove Gaines. It says nothing about what happens to him afterwards. That gap is deliberate, because the last step plays with it.",
  "notReady": "Even “I'm not ready” returns to the offer. It costs the player nothing to read the terms and walk away.",
  "contract": "The contract has no mechanical use. It looks like a joke item, but its fine print decides the argument at the end. Alfus hands over the Heat Wave recipe up front, so the player has the tool before knowing they need it. Heat Wave already existed in the game: I reused it instead of asking a teammate to create a new item for this quest.",
  "attendants": "Two short lines that show the hierarchy of the Red Hats. The attendants also talk about Gaines, so the player hears opinions about him before meeting him.",
  "craft": "Crafting was a core part of the game's loop: grinding materials, quality rolls like a gacha, recipes you could share. I wanted it to have another use besides combat and selling. If a crafted spell can open a different way through a quest, players have a reason to craft everything they find.",
  "dirs": "Alfus only gives directions once the contract is signed, so the player always arrives at the mine with the quest already in hand.",
  "entrance": "The mine has two ways in. The front is a fight. The other is a reward for having helped the forest animals earlier.",
  "guardFight": "Combat decides this in the game. In this demo you choose the result so you can see both.",
  "guardLost": "In the open world, losing a fight teleports you to the last hub, because HP only exists in combat. Inside a quest I could choose, so the guards throw you out at the entrance, a small nod to the Team Rocket hideouts. It spares the player a long walk, and HP refills after every fight anyway.",
  "animal": "I like it when one quest quietly pays off another. One of our pillars was that players should explore, interact with everything and be curious about the world, so rewarding that felt natural to me. The burrow also skips the whole camp.",
  "inside": "Until then, spells were only used in combat. That never made sense to me: a wizard should be able to use their powers in the world too, and I wanted the world to feel magical. So in most of my quests, spells and crafted items matter outside combat. It had to be Heat Wave, a wide-area flame that sets the tents on fire.",
  "tents": "NPCs couldn't walk, so the enemies in the mine are static. I wanted a Pokémon-style stealth puzzle but the system didn't allow it, and I didn't want the scene to be only fighting. So: burn the tents and the group splits, grunts first, then the captain alone. This needed an inventory check for the spell, a requirement I asked the developers to add.",
  "captain": "The captain offers the player a last chance to leave, and leaving just sends them back to the entrance.",
  "gaines": "The boss doesn't have to be fought. Taking his deal is the Red Mage answer, so I didn't make it the weaker choice. It is another way through the same quest.",
  "gLost": "Same rule as the guard: you are sent to the entrance, but nothing is undone. The fights you won stay won. I never wanted the player to feel trapped or frustrated.",
  "gWon": "Turning Gaines in is the straightforward result, and the only one where Alfus can send him to the Capital Review Board.",
  "gDeal": "Gaines pays and leaves, still free, which decides which answers Alfus can hear later. I planned to bring Gaines back in future content for the Red Hats' city, so this choice would matter there.",
  "report": "What the player can say depends on what they did with Gaines, so the answers always match what actually happened. Rewards were never shown in advance, not even in the quest menu. I wanted players to explore out of curiosity about the story, not to chase a payout, and it meant I never had to match the story to a promised amount.",
  "rTruth": "Turning him in and telling the truth pays the most: 150 gold plus a one-time Hip Shades recipe. The shades already existed and fit the Red Mages, since Gaines wears dark glasses. Balancing items was already hard in an MMO, so I gave new meaning to what existed instead of asking the item designer for more. I learned that on projects like Frozen.",
  "rLie": "Alfus is happy either way, so the lie pays the full amount. He suspects (“further investigation is needed”) but has no proof. From here it rejoins the lines of the first branch: when the result is the same, I don't think every branch needs its own dialogue.",
  "rLetGo": "Alfus is annoyed you let him go, but you completed the contract, so he has to pay. He pays a little less, as if a clause let him adjust the amount. I left that implicit, and since rewards were never shown, the payout could follow the story. Here the contract's fine print gets the last word.",
  "hedge": "Every ending points to the next job. We barely used quest markers, so a line of dialogue guides the player instead, and if they talk to the character again they get a small hint about where to find more. That was a guideline from the creative director. The three branches also rejoin here: I only write separate interactions when the result differs.",
  "epilogue": "In many quests I left traces of what the player did, like a burned camp you find again when you return to the mine. I wanted players to remember a quest when they walk through that place again: a small moment of recalling something they lived earlier in the game as they move through the world. It gives the world weight, even at a small scale.",
  "epA": "Attendant A reacts differently depending on what the player did with Gaines.",
  "epB": "This one doesn't change. Not every NPC needs a branch.",
  "epAlfus": "Alfus ends by pointing at the Red path. It is an invitation, and it commits the player to nothing."
};
  NOTES.captainFight = function (s) {
    return s.tents
      ? 'Because the tents burned, the grunts are already down and the captain fights alone. This is where the earlier choice shows up as a shortcut.'
      : 'The tents were left alone, so the captain and both grunts attack together. This is where the earlier choice shows up as a cost.';
  };
  Object.keys(NOTES).forEach(function (k) { if (P[k]) P[k].note = NOTES[k]; });

  var ENDINGS = {
    turnedIn: ['Turned in', 'Gaines goes to the Capital Review Board. Alfus pays 150 gold and a bonus recipe.'],
    lie: ['The lie', 'You say he was already gone. Alfus suspects, and pays the full 150 gold anyway.'],
    letGo: ['The small print', 'You admit you let him go. The contract had no clause for it, so Alfus pays 50 gold.']
  };

  // ----- engine -----
  var hist = [];
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function val(x, s) { return typeof x === 'function' ? x(s) : x; }

  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function renderLines(lines) {
    var out = '', lastWho = null;
    lines.forEach(function (l) {
      if (l[0] === 'say') {
        if (l[1] !== lastWho) { if (lastWho !== null) out += '</div>'; out += '<div class="say"><span class="who">' + esc(l[1]) + '</span>'; lastWho = l[1]; }
        out += '<p>' + esc(l[2]) + '</p>';
      } else {
        if (lastWho !== null) { out += '</div>'; lastWho = null; }
        if (l[0] === 'narr') out += '<p class="narr">' + esc(l[1]) + '</p>';
        else if (l[0] === 'sys') out += '<span class="sysrow"><span class="sys ' + l[1] + '">' + esc(l[2]) + '</span></span>';
      }
    });
    if (lastWho !== null) out += '</div>';
    return out;
  }

  // the note is written onto the sticky note, very fast. The rest of the text is
  // laid out but invisible, so the note never changes size while it is typed.
  var CPS = 900;
  function typeNote(p, text, delay) {
    if (reduce) { p.textContent = text; return; }
    var shown = document.createElement('span');
    var rest = document.createElement('span');
    rest.setAttribute('aria-hidden', 'true');
    rest.style.visibility = 'hidden';
    rest.textContent = text;
    p.appendChild(shown);
    p.appendChild(rest);
    var t0 = 0;
    function step(now) {
      if (!p.isConnected) return;
      if (!t0) t0 = now;
      var n = Math.min(text.length, Math.floor((now - t0) * CPS / 1000));
      shown.textContent = text.slice(0, n);
      rest.textContent = text.slice(n);
      if (n < text.length) window.requestAnimationFrame(step);
      else p.textContent = text;
    }
    window.setTimeout(function () { window.requestAnimationFrame(step); }, delay || 160);
  }

  // ---- building a card (used both to show it and to measure it) ----
  // A long note is split into two or three sticky notes, at sentence boundaries.
  function chunks(text) {
    var sentences = text.match(/[^.!?]+[.!?]+["\u201d]?\s*|[^.!?]+$/g) || [text];
    var n = Math.min(3, Math.max(1, Math.round(text.length / 170)));
    if (n === 1 || sentences.length < 2) return [text];
    n = Math.min(n, sentences.length);
    var target = text.length / n, out = [], cur = '';
    sentences.forEach(function (sn, i) {
      var left = sentences.length - i;
      if (cur && out.length < n - 1 && (cur.length + sn.length / 2 > target || left <= n - out.length - 1)) {
        out.push(cur.trim()); cur = '';
      }
      cur += sn;
    });
    if (cur) out.push(cur.trim());
    return out;
  }

  function makeTurn(box, note, animate) {
    var turn = document.createElement('div');
    turn.className = 'turn';
    turn.appendChild(box);
    var area = document.createElement('div');
    area.className = 'notes';
    if (note) {
      var parts = chunks(note), before = 0;
      parts.forEach(function (part, i) {
        var pi = document.createElement('aside');
        pi.className = 'postit postit--' + (i % 3);
        pi.setAttribute('aria-label', 'Design note');
        pi.innerHTML = '<b>Design note' + (parts.length > 1 ? ' ' + (i + 1) + '/' + parts.length : '') + '</b><p></p>';
        var np = pi.querySelector('p');
        if (animate) typeNote(np, part, 160 + before * 1000 / CPS); else np.textContent = part;
        before += part.length;
        area.appendChild(pi);
      });
    }
    turn.appendChild(area);
    return turn;
  }

  function buildPass(id, said) {
    var p = P[id];
    var box = document.createElement('section');
    box.className = 'pass';
    box.innerHTML = (said ? '<p class="trail">You chose: <b>' + esc(said) + '</b></p>' : '') + renderLines(val(p.lines, st));
    var choices = val(p.choices, st).filter(function (c) { return c.show !== false; });
    var wrap = document.createElement('div');
    wrap.className = 'choices';
    choices.forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button';
      if (c.off) { b.className = 'off'; b.setAttribute('aria-disabled', 'true'); b.innerHTML = esc(c.t) + '<small>' + esc(c.off) + '</small>'; b.addEventListener('click', function (e) { e.preventDefault(); }); }
      else {
        b.textContent = c.t;
        b.addEventListener('click', function () {
          if (c.fx) c.fx(st);
          show(c.to, c.t);
        });
      }
      wrap.appendChild(b);
    });
    if (hist.length > 1) {
      var bb = document.createElement('button');
      bb.type = 'button';
      bb.className = 'back-inline';
      bb.textContent = '← Back';
      bb.addEventListener('click', goBack);
      wrap.appendChild(bb);
    }
    box.appendChild(wrap);
    return { box: box, note: val(p.note, st) };
  }

  function buildStart() {
    var box = document.createElement('section');
    box.className = 'pass';
    box.innerHTML =
      '<p class="eyebrow">Playable quest</p>' +
      '<p class="lead">Play one of the quests I designed. The Red Mages’ emissary wants a mine back from one of his own attendants. Every choice here is one the game offered, and the design notes explain why I built it that way.</p>' +
      '<p class="lead">In the game, this quest unlocks after the tutorial quest, The Gathering Tree. Here you play it as someone who finished it and helped the forest animals.</p>' +
      '<p class="lead">I wrote a draft of all the dialogue, along with each character’s intentions and personality. Jon Olson, the narrative designer, then reviewed it. Some lines were rewritten completely or partly, and he approved the final dialogue.</p>' +
      '<div class="choices"><button type="button" id="go">Start the quest</button></div>';
    return box;
  }

  function buildEnd() {
    var done = Object.keys(found).length;
    var how = [];
    how.push('You got in through ' + (st.entry === 'secret' ? 'the secret entrance' : 'the front gate') + '.');
    if (st.entry !== 'secret') how.push(st.tents ? 'You burned the tents to split the guards.' : 'You left the tents alone.');
    how.push(st.gaines === 'turnedIn' ? 'You fought Gaines’s bodyguards.' : 'You took Gaines’s deal.');
    how.push('You earned ' + st.gold + ' gold.');
    var ends = Object.keys(ENDINGS).map(function (k) {
      return '<li class="' + (found[k] ? 'got' : '') + '"><b>' + (found[k] ? '✓ ' : '') + esc(ENDINGS[k][0]) + '</b>' + (found[k] ? esc(ENDINGS[k][1]) : 'Not found yet.') + '</li>';
    }).join('');
    var box = document.createElement('section');
    box.className = 'pass';
    box.innerHTML = '<div class="end-grid"><div class="card"><h3>The end</h3><p style="margin:0">How you played it:</p><ul class="sum">' +
      how.map(function (h) { return '<li>' + esc(h) + '</li>'; }).join('') + '</ul></div>' +
      '<div class="card"><h3>Endings found: ' + done + ' of 3</h3><ul class="ends">' + ends + '</ul></div></div>' +
      '<div class="choices"><button type="button" class="primary" id="again">Play again</button></div>';
    return box;
  }

  // ---- showing it. Nothing here scrolls the page. ----
  function mount(turn) {
    logEl.innerHTML = '';
    logEl.appendChild(turn);
    var ch = turn.querySelector('.pass').offsetHeight, nh = turn.querySelector('.notes').offsetHeight;
    if (ch > cardH + 1 || nh > notesH + 1) setHeights(Math.max(ch, cardH), Math.max(nh, notesH));   // taller than predicted: grow, never shrink
  }

  function focusFirst(turn) {
    var first = turn.querySelector('.choices button:not(.off)');
    if (first && hist.length > 0) first.focus({ preventScroll: true });
  }

  function show(id, said) {
    var p = P[id];
    if (!p) { throw new Error('Missing passage: ' + id); }
    if (id === 'end' && st.answer) found[st.answer] = true;
    if (p.fx) p.fx(st);
    hist.push({ id: id, said: said, st: clone(st) });
    draw();
  }

  function draw() {
    var h = hist[hist.length - 1];
    var turn;
    if (P[h.id].custom) {
      turn = makeTurn(buildEnd(), null, false);
      mount(turn);
      document.getElementById('again').addEventListener('click', showStart);
    } else {
      var b = buildPass(h.id, h.said);
      turn = makeTurn(b.box, b.note, true);
      mount(turn);
    }
    focusFirst(turn);
  }

  function showStart() {
    hist = [];
    st = fresh();
    mount(makeTurn(buildStart(), null, false));
    document.getElementById('go').addEventListener('click', function () {
      st.tree = true;
      st.curse = true;
      show('a1', 'Start the quest');
    });
  }

  function goBack() {
    if (hist.length < 2) return;
    hist.pop();
    st = clone(hist[hist.length - 1].st);
    draw();
  }

  // ---- every card gets the same height, so the page below never moves ----
  var cardH = 0, notesH = 0;
  function setHeights(c, n) {
    cardH = c; notesH = n;
    logEl.style.setProperty('--mr-card-h', c + 'px');
    logEl.style.setProperty('--mr-notes-h', n + 'px');
  }

  function variants() {
    var out = [];
    [false, true].forEach(function (secret) {
      [0, 1, 2].forEach(function (stage) {
        [false, true].forEach(function (cap) {
          [false, true].forEach(function (door) {
            [false, true].forEach(function (heat) {
              [null, 'turnedIn', 'letGo'].forEach(function (g) {
                var s = fresh();
                s.curse = true; s.entry = secret ? 'secret' : 'front';
                s.tents = stage > 0; s.bandit = stage > 1; s.captain = cap;
                s.guardDone = door; s.heat = heat; s.gaines = g; s.gold = 150;
                out.push(s);
              });
            });
          });
        });
      });
    });
    return out;
  }

  function measure() {
    var width = logEl.clientWidth;
    if (!width) return;
    var probe = document.createElement('div');
    probe.setAttribute('aria-hidden', 'true');
    probe.style.cssText = 'position:absolute;left:0;top:0;visibility:hidden;pointer-events:none;width:' + width + 'px';
    mrEl.appendChild(probe);

    var savedSt = st, savedHist = hist, savedFound = found;
    var longest = '';
    var all = variants();
    Object.keys(P).forEach(function (id) {
      var ch = P[id].choices;
      if (!ch) return;
      (typeof ch === 'function' ? all : [all[0]]).forEach(function (s) {
        (typeof ch === 'function' ? ch(s) : ch).forEach(function (c) { if (c.t.length > longest.length) longest = c.t; });
      });
    });
    hist = [{}, {}];                      // so the Back button is counted
    var maxCard = 0, maxNotes = 0;
    function take(turn) {
      probe.appendChild(turn);
      maxCard = Math.max(maxCard, turn.querySelector('.pass').offsetHeight);
      maxNotes = Math.max(maxNotes, turn.querySelector('.notes').offsetHeight);
      probe.removeChild(turn);
    }

    Object.keys(P).forEach(function (id) {
      var p = P[id];
      if (p.custom) return;
      var dynamic = typeof p.lines === 'function' || typeof p.choices === 'function' || typeof p.note === 'function';
      (dynamic ? all : [all[0]]).forEach(function (s) {
        st = s;
        var b = buildPass(id, longest);
        take(makeTurn(b.box, b.note, false));
      });
    });
    found = { turnedIn: true, lie: true, letGo: true };
    st = fresh(); st.entry = 'front'; st.tents = true; st.gaines = 'turnedIn'; st.gold = 150;   // the longest summary
    take(makeTurn(buildEnd(), null, false));
    st = savedSt; hist = savedHist; found = savedFound;
    st = fresh();
    take(makeTurn(buildStart(), null, false));
    st = savedSt;

    mrEl.removeChild(probe);
    setHeights(Math.ceil(maxCard) + 1, Math.ceil(maxNotes) + 1);
  }

  var resizeTimer = 0;
  window.addEventListener('resize', function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(measure, 150);
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

  document.getElementById('mr-restart').addEventListener('click', showStart);

  measure();
  showStart();
}());
