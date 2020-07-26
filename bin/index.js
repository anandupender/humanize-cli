#!/usr/bin/env node

const chalk = require("chalk");
const figlet = require("figlet");
const boxen = require("boxen");
const fs = require('fs')
const yargs = require("yargs");
const inquirer = require('inquirer');
const git = require('simple-git')();
const storage = require('node-persist');
const filename = "MEMORIES.md"
const files = require('./files.js');

// // fill in variables during init command
var openingText = "";

var feelingQuestions = [
    "How do you feel about the people you are working with?",
    "Where's your headspace at today?",
    "How do you feel about the code you just wrote?",
    "What time is it and how does that affect your mood?",
    "What annoyed you today?",
    "How have you been sleeping recently and why?"
];
var worldQuestions = [
    "What's the most pressing issue going on in the world right now?",
    "What did you read about in the news today?",
    "If you could be doing anything with your time, what would it be?",
    "What's one problem you are interested to solve that you are not thinking about enough right now?"
];
var lifeQuestions = [
    "Who inspired you recently?",
    "Where do you want to travel in the world next? 🚀🚘🏝 ",
    "What's the coolest new dev thing you learned about recently?",
    "What are you looking forward to outside work?",
    "Did you or your friends have any big life moments happen recently?",
    "Who do you want to reconnect with soon?",
    "What book are you reading now and who would you recommend it to?"
    ];
var surpriseQuestions = [
    "Have you called your mom recently?",
    "What are you looking forward to this weekend?",
    "Are you doing anything fun tonight?",
    "What new hobby are you curious to pick up?",
    "What was the last dream you remember?",
    "What is your most memorable nightmare?"
    ];
var happyMessages = [
  "You're doing great! Remember to get some air"
];

yargs
.scriptName("gist")
 .usage("Usage: $0")
 .option("a", { alias: "all", describe: "Do all git actions: add, commit, push", type: "string",nargs: 1})
 
 // INIT - SHOULD BE FIRST COMMAND IN ANY REPO
 .command("init","Initialize gist in this repo.",{},function(argv){
  // console.clear();
  console.log(
    chalk.yellow(
      figlet.textSync('GIST', { horizontalLayout: 'full' })
    )
  );
  console.log(
      chalk.yellow(
          "Welcome to Gist. A simple tool to add humanity, context, and reflection to our mechanical and mindless git commands.\n"
      )
    );
  
  inquirer
      .prompt([
          {
          type:'input',
          name: 'name',
          message: 'What\'s your name?',
          },
          {
            name: 'emoji',
            message: 'Choose an emoji avatar for yourself',
          },
          {
          name: 'intention',
          message: 'What led you to download this tool?',
          },
          {
          type:'list',
          name: 'color',
          message: 'Which color do you like most?',
          choices: ['red', 'green','yellow','blue','black','white'],
          },
      ])
      .then(answers => {
         store(answers);
         var date = new Date().toLocaleDateString();
         openingText = "# Time Capsule\n";
         openingText += "#### created by " + answers.name + " on " + date + " to capture the emotional and global context behind this code.\n";
         openingText+= "#### set with the intention: " + answers.intention + "\n";
         openingText+= ".   \n.   \n.   \n"
           
         //create capsule file and add headers
         fs.writeFile(filename, openingText,function (err) {
          if (err) throw err;
        }); 
  
         var greeting = "Thank you " + answers.name +"!" 
         const boxenOptions = {
          padding: 3,
          margin: 1,
          borderStyle: "round",
          backgroundColor: answers.color,
          borderColor: "white"
         };
         const msgBox = boxen( greeting, boxenOptions );
         
         console.log(msgBox);
      });
  
      async function store(answers){
          await storage.init( /* options ... */ );
          await storage.setItem('name',answers.name);
          await storage.setItem('intention',answers.intention);
          await storage.setItem('color',answers.color);
          await storage.setItem('emoji',answers.emoji);
          await storage.setItem('initDate',new Date().toDateString);
  
      }
 })


// MORE COMPLEX COMMAND TO WRITE TO TIME CAPSULE FILE AFTER COMMITING CODE TO GITHUB
 .command("commit <message>", "Add to your time capsule AND commit to git",{}, function(argv){
    if (!files.directoryExists(filename)) {
      console.log("Gist is not yet initialized on this repo. Please run gist init");
      return;
    }

    var currChoices = ['❤️  feelings', '🌍 da world','🧐 life plans','🎁 surprise me'];

    const greeting = chalk.white.bold("Time for a breather...");
    const boxenOptions = {padding: 1,margin: 1,borderStyle: "round",borderColor: "green",backgroundColor: "#555555"
    };
    const msgBox = boxen( greeting, boxenOptions );
    console.log(msgBox);

    inquirer
    .prompt([
        {
            type:'list',
            name: 'type',
            message: 'What do you want to reflect about?',
            choices: currChoices,
        }
        
    ])
    .then(answer => {
        var randomQuestion;
        if(answer.type == currChoices[0]){
            randomQuestion = feelingQuestions[Math.floor(Math.random() * feelingQuestions.length)];
        }else if(answer.type == currChoices[1]){
            randomQuestion = worldQuestions[Math.floor(Math.random() * feelingQuestions.length)];
        }else if(answer.type == currChoices[2]){
            randomQuestion = lifeQuestions[Math.floor(Math.random() * feelingQuestions.length)];
        }else if(answer.type == currChoices[3]){
            //randomize list we select from
            randomQuestion = surpriseQuestions[Math.floor(Math.random() * surpriseQuestions.length)];
        }
        inquirer.prompt([
        {
            type: 'input',
            name:'reflection',
            message: randomQuestion
        }]).then(answers => {

            var question = randomQuestion  + "\n";
            var message = "> " + answers.reflection + "\n\n";
            var timestamp = new Date().toUTCString();
            var timestampInput = "📅" + timestamp + "\n" 
            var type = answer.type +  "\n\n____";

            //CAPSULE.md already exists so write to it!
            var newData;
            if (files.directoryExists(filename)) {
            fs.readFile(filename, 'utf8', function(err, data) {
                if (err) throw err;
        
                var lines = data.split('\n');
        
                lines.splice(7,0,question, message, timestampInput, type);
                newData = lines.join('\n');

                //write to file
                fs.writeFile(filename, newData, function (err) {
                    if (err) return console.log(err);
                    console.log('\nMemory saved to ' + filename +"!\n");
                    git.add(filename).commit(argv.message);
                });

            });  
            }else{  //CAPSULE.md does not exist...
                var temp = openingText;
                var lines = temp.split('\n');
                lines.splice(7,0,question, message, timestampInput, type);
                newData = lines.join('\n');
                //write to file
                fs.writeFile(filename, newData, function (err) {
                    if (err) return console.log(err);
                        console.log('Memory saved!');
                        git.add(filename).commit(argv.message);
                    });
            }
      

        })
        .catch(error => {
          if(error.isTtyError) {} else {}
        });
        

    })
    .catch(error => {
      if(error.isTtyError) {} else {}
    });

    return yargs.demandOption(['m']);
 })


    // SIMPLE COMMAND TO DO ALL GIT ACTIONS I NORMALLY DO
    .command("gitall <message>", "Do all git actions: add, commit, push",{}, function(argv){
        git.add('./*').commit(argv.message).push('origin', 'master')
        .then(() => { console.log("All files added, committed, and pushed")})
        .catch(err => {console.log(eror)});;
    })

    // SIMPLE COMMAND TO RUN GIT STATUS
    .command("status", "Git status",{}, function(argv){

        git
        .status(['--short'])
        .then(status => { console.log(status)})
        .catch(err => {console.log(eror)});
    })




 // SIMPLE COMMAND TO WRITE TO TIME CAPSULE FILE
 .command("write <message>", "Add to your time capsule",{}, function(argv){
    if (!files.directoryExists(filename)) {
      console.log("Gist is not yet initialized on this repo. Please run gist init");
      return;
    }
    var timestamp = new Date().toUTCString();

    fs.readFile(filename, 'utf8', function(err, data) {
        if (err) throw err;

        var timestampInput = "##### On " + timestamp + " you said:\n" 
        var message = "> " + argv.message + "\n" + "____";

        var lines = data.split('\n');

        lines.splice(7,0,timestampInput, message);
        var newData = lines.join('\n');
        fs.writeFile(filename, newData, function (err) {
            if (err) return console.log(err);
            console.log('done');
          });
        //
    });  
 })


 // SIMPLE COMMAND TO  ADD CAPSULE TO README
 .command("readme", "Link your capsule in your README", function(argv){

   var link = "-----\n\n[Check out my capsule here](../blob/master/CAPSULE.md)";
    fs.appendFile('README.md', link, function (err) {
      if (err) return console.log(err);
      if (files.directoryExists('README.md')) {
        console.log('Added a link to your capsule in your README.md file');
      }else{
        console.log('No README found in the root directory so we created one for you and added the link.');
      }
    });  
})


// SIMPLE COMMAND TO GET A REFLECTIVE PROMPT
 .command("happy", "A small moment of delight", function(argv){
    var randomMessage = happyMessages[Math.floor(Math.random() * happyMessages.length)];
    const greeting = chalk.white.bold(randomMessage);

    const boxenOptions = {
     padding: 1,
     margin: 1,
     borderStyle: "round",
     borderColor: "green",
     backgroundColor: "#555555"
    };
    const msgBox = boxen( greeting, boxenOptions );
    
    console.log(msgBox);
 })

// SIMPLE COMMAND TO CLEAR ALL CAPSULE INFO WITH A WARNING
 .command("clear", "Clear all capsule text", function(argv){
    if (!files.directoryExists(filename)) {
      console.log("Gist is not yet initialized on this repo. Please run gist init");
      return;
    }
    
    inquirer
    .prompt([{
        type: 'confirm',
        name:'deleteAuth',
        message:"Are you sure you want to delete all previous capsule entries?"
    }
    ])
    .then(answers => {
      if(answers.deleteAuth){
        fs.writeFile(filename, '', function(){console.log('Capsule cleared')})
      }else{
          console.log("Capsule clear canceled...");
      }
    })
    .catch(error => {
      if(error.isTtyError) {} else {}
    });
   })
 .demandCommand()
 .argv;