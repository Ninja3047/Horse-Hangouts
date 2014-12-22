var storage = require('node-persist');
storage.initSync();
var hangoutsBot = require("hangouts-bot");
var bot = new hangoutsBot("example@gmail.com", "password"); //set to google login credentials!
var authpass = "password"; //set to authorize password!
var learnThings = {
  terms: [
    "you",
    "why",
    "what",
    "ok",
    "horse",
    "new",
    "love",
    "wow",
    "teach",
    "this",
    "how",
    "hello",
    "hi",
    "lol",
    "need"
  ],
  definitions: [
    "I am a horse",
    "because horse",
    "a horse",
    "horse",
    "yes",
    "horse is new",
    "<3",
    "such horse",
    "I will learn you!!",
    "me",
    "by horsing",
    "Yo yo, Horsie in the house yeah!!",
    "What's up!",
    "ha ha",
    "nothing is needed, only given by Horse Bot himself!"
  ]
};
var blacklist = [
  "",
  " ",
  "_",
  "learn",
  "a",
  "the",
  "an",
  "or",
  "this",
  "and",
  "but",
  "his",
  "her",
  "he",
  "she",
  "are",
  "delete",
  "authorize",
  "send",
  "give",
  "identify",
  "show"
];
var cmds = {
  commands: [
    "help",
    "admin"
  ],
  results: [
    "Hello my name is horse bot. Type Learn for information on how to teach me new things! Identify yourself! Type identify username. Send messages! Send message to username. Send horse point currency! give 100 to username. Check balance! give check",
    "To authorize as an admin, use authorize password. To delete items, use delete term. To delete users, use delete identify user."
  ]
};

var authlist = [];
var dmsys = {
  ids: [],
  dests: [],
  amts: []
};

bot.on('online', function() {
  console.log('online');
});

bot.on('message', function(from, message) {
  try {
    message = message.toLowerCase();
    if (message.split(" ")[0] == "delete") {
      var terms = message.split("delete ");
      if (authlist.indexOf(from) > -1) {
        if (terms[1].split(" ")[0] == "identify") {
          terms = terms[1].split(" ");
          if (dmsys.ids.indexOf(terms[1]) > -1) {
            dmsys.ids.splice(dmsys.ids.indexOf(terms[1]), 1);
            dmsys.dests.splice(dmsys.ids.indexOf(terms[1]), 1);
            dmsys.amts.splice(dmsys.ids.indexOf(terms[1]), 1);
            bot.sendMessage(from, "Deleted the user.");
            storage.setItem("dmsys", dmsys);
          } else {
            bot.sendMessage(from, "Cannot find the user!");
          }
        } else if (terms[1].split(" ")[0] == "show") {
          for (var i = 0; i < learnThings.terms.length; i++) {
            bot.sendMessage(from, learnThings.terms[i] + ": " + learnThings.definitions[i]);
          }
        } else {
          if (learnThings.terms.indexOf(terms[1]) > -1) {
            learnThings.terms.splice(learnThings.terms.indexOf(terms[1]), 1);
            learnThings.definitions.splice(learnThings.terms.indexOf(terms[1]), 1);
            bot.sendMessage(from, "Deleted the learning.");
            storage.setItem("learnThings", learnThings);
          } else {
            bot.sendMessage(from, "Cannot find the learning!");
          }
        }
      } else {
        bot.sendMessage(from, "Unauthorized!!");
      }
    } else if (message.split(" ")[0] == "authorize") {
      var terms = message.split(" ");
      if (terms[1] == authpass) {
        authlist.push(from);
        storage.setItem("authlist", authlist);
        bot.sendMessage(from, "Now authorized!");
      } else {
        bot.sendMessage(from, "Wrong password!");
      }

    } else if (message.split(" ")[0] == "send") {
      var terms = message.split("send ");
      terms = terms[1].split(" to ");
      if (dmsys.ids.indexOf(terms[terms.length - 1]) > -1) {
        bot.sendMessage(dmsys.dests[dmsys.ids.indexOf(terms[1])], terms[0]);
        bot.sendMessage(from, "Successfuly send message to: " + terms[1]);
      } else {
        bot.sendMessage(from, "Invalid id. Make sure the end user has identified themselves!");
      }
    } else if (message.split(" ")[0] == "give") {
      var terms = message.split("give ");
      if (terms[1] == "check" && dmsys.dests.indexOf(from) > -1) {
        bot.sendMessage(from, dmsys.amts[dmsys.dests.indexOf(from)] + " horse points!");
      } else {
        terms = terms[1].split(" to ");
        if (dmsys.ids.indexOf(terms[1]) > -1) {
          if (dmsys.dests.indexOf(from) > -1 && dmsys.amts[dmsys.dests.indexOf(from)] >= Math.abs(terms[0])) {
            dmsys.amts[dmsys.dests.indexOf(from)] -= Math.abs(terms[0]) * 1;
            dmsys.amts[dmsys.ids.indexOf(terms[1])] += Math.abs(terms[0]) * 1;
            bot.sendMessage(dmsys.dests[dmsys.ids.indexOf(terms[1])], "Received " + Math.abs(terms[0]) + " horse points.");
            bot.sendMessage(from, "Successfuly transaction " + Math.abs(terms[0]) + "pts!");
          } else {
            bot.sendMessage(from, "Not enough horse points!");
          }
        } else {
          bot.sendMessage(from, "Invalid id. Make sure the end user has identified themselves!");
        }
      }
      storage.setItem("dmsys", dmsys);
    } else if (message.split(" ")[0] == "identify") {
      if (dmsys.ids.indexOf(message.split(" ")[1]) < 0) {
        if (dmsys.dests.indexOf(from) < 0) {
          dmsys.ids.push(message.split(" ")[1]);
          dmsys.dests.push(from);
          dmsys.amts.push(100);
          bot.sendMessage(from, "Now identified as: " + message.split(" ")[1]);
          storage.setItem("dmsys", dmsys);
        } else {
          dmsys.ids[dmsys.dests.indexOf(from)] = message.split(" ")[1];
          bot.sendMessage(from, "Changed name to: " + dmsys.ids[dmsys.dests.indexOf(from)]);
          storage.setItem("dmsys", dmsys);
        }
      } else {
        bot.sendMessage(from, "username taken! contact an admin to delete identify " + message.split(" ")[1]);
      }
    } else if (cmds.commands.indexOf(message) > -1) {
      bot.sendMessage(from, cmds.results[cmds.commands.indexOf(message)]);
    } else if (message.split(" ").indexOf("learn") === 0) {
      message = message.split("learn ")[1];
      if (message !== undefined) {
        if (message.length > 1) {
          var sections = message.split("|");
          sections[0] = sections[0].replace(/[-\/\\"''^$*+?.()|[\]{}]/g, '\\$&');
          if (sections.length == 2) {
            if (learnThings.terms.indexOf(sections[0]) < 0 && learnThings.indexOf(sections[0].replace(/\s/g, '')) < 0 && cmds.commands.indexOf(sections[0]) < 0 && blacklist.indexOf(sections[0]) < 0 && blacklist.indexOf(sections[0].replace(/\s/g, '')) < 0) {
              learnThings.terms.push(sections[0]);
              learnThings.definitions.push(sections[1]);
              storage.setItem("learnThings", learnThings);
              bot.sendMessage(from, "I have learned to say: " + sections[1] + " when someone says " + sections[0]);
            } else {
              bot.sendMessage(from, "That term has already been taken, sorry chap!");
            }
          } else {
            bot.sendMessage(from, "Usage: Learn Term|Definition");
          }
        }
      } else {
        bot.sendMessage(from, "Usage: Learn Term|Definition");
      }
    } else {
      for (var i = 0; i < learnThings.terms.length; i++) {
        var regex = new RegExp("(\\b|^)" + learnThings.terms[i] + "(\\b|$)");
        if (message.match(regex) !== null) {
          bot.sendMessage(from, learnThings.definitions[i]);
        }
      }
    }
  } catch (err) {
    console.log(err);
    bot.sendMessage(from, "I have encountered an error.");
  }
});

if (storage.getItem("learnThings") === undefined) {
  storage.setItem("learnThings", learnThings);
}

learnThings = storage.getItem("learnThings");

if (storage.getItem("authlist") === undefined) {
  storage.setItem("authlist", authlist);
}

authlist = storage.getItem("authlist");

if (storage.getItem("dmsys") === undefined) {
  storage.setItem("dmsys", dmsys);
}

dmsys = storage.getItem("dmsys");
