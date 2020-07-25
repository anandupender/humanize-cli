#!/usr/bin/env node

const chalk = require("chalk");
const figlet = require("figlet");
const boxen = require("boxen");
const fs = require('fs')
const yargs = require("yargs");
const inquirer = require('inquirer');
const git = require('simple-git')();
const storage = require('node-persist');

const files = require('./files.js');

// fill in variables during init command
var openingMarkdown = ["# Time Capsule"];

// TODO: this is janky, do this only once when we initialize
async function addUserValues(){
  await storage.init( /* options ... */ );
  openingMarkdown.push("### created by " + await storage.getItem('name') + " on " + await storage.getItem('initDate') + " to capture the emotional and global context behind this code.");
  openingMarkdown.push("### set with the intention: " + await storage.getItem('intention'));
}
addUserValues();

var globeContextQuestions = [
"What's the most pressing issue going on in the world right now?",
"What did you read about in the news today?",
"If you could be doing anything with your time, what would it be?",
"What's one problem you are interested to solve that you are not thinking about enough right now?"
];
var personalLifeQuestions = [
"How do you feel about the people you are working with?",
"Where's your headspace at today?",
"What's the coolest new dev thing you learned about recently?",
"What inspired you to make this commit?",
"How do you feel about the code you just wrote?",
"What time is it and how does that affect your mood?",
"Where do you want to travel in the world next? 🚀🚘🏝"
];

yargs
.scriptName("gist")
 .usage("Usage: $0")
 .option("m", { alias: "message", describe: "Your message", type: "string",nargs: 1})


// SIMPLE COMMAND TO WRITE TO TIME CAPSULE FILE
 .command("write <message>", "Add to your time capsule",{}, function(argv){
    var timestamp = new Date().toUTCString();

    fs.readFile('capsule.md', 'utf8', function(err, data) {
        if (err) throw err;

        // var toAppend1 = "\n\n### On " + timestamp + " you said:\n> " + argv.message + "\n\n" + "____";
        var timestampInput = "##### On " + timestamp + " you said:\n" 
        var message = "> " + argv.message + "\n" + "____";

        var lines = data.split('\n');

        // if file is empty, add opening markdown
        if(lines.length <= 1){
            lines.push(openingMarkdown[0]);
            lines.push(openingMarkdown[1]);
            lines.push(openingMarkdown[2]);
            lines.push(".   ");
            lines.push(".   ");
            lines.push(".   ");
        }

        lines.splice(7,0,timestampInput, message);
        var newData = lines.join('\n');
        fs.writeFile('capsule.md', newData, function (err) {
            if (err) return console.log(err);
            console.log('done');
          });
        //
    });  
 })

// MORE COMPLEX COMMAND TO WRITE TO TIME CAPSULE FILE AFTER COMMITING CODE TO GITHUB
 .command("commit <message>", "Commit message to github",{}, function(argv){

    // git.commit(argv.message);
    var randomQuestion = personalLifeQuestions[Math.floor(Math.random() * personalLifeQuestions.length)];

    inquirer
    .prompt([{
        type: 'input',
        name:'reflection',
        message: randomQuestion
    }
    ])
    .then(answers => {

      //write reflection to file
      if(answers.reflection){
        var timestamp = new Date().toUTCString();
        var timestampInput = "##### On " + timestamp + " you said:\n" 
        var message = "> " + answers.reflection + "\n";
        var question = "##### in response to the question: " + randomQuestion  + "\n____";

        //capsule.md already exists so write to it!
        var newData;
        if (files.directoryExists('capsule.md')) {
          fs.readFile('capsule.md', 'utf8', function(err, data) {
              if (err) throw err;
      
              var lines = data.split('\n');
      
              // if file is empty, add opening markdown
              if(lines.length <= 1){
                  lines.push(openingMarkdown[0]);
                  lines.push(openingMarkdown[1]);
                  lines.push(openingMarkdown[2]);
                  lines.push(".   ");
                  lines.push(".   ");
                  lines.push(".   ");
              }
              lines.splice(7,0,timestampInput, message, question);
              newData = lines.join('\n');

              //write to file
              fs.writeFile('capsule.md', newData, function (err) {
                if (err) return console.log(err);
                console.log('Memory saved!');
              });

          });  
        }else{  //capsule.md does not exist...
          var lines = [];
          lines.push(openingMarkdown[0]);
          lines.push(openingMarkdown[1]);
          lines.push(openingMarkdown[2]);
          lines.push(".   ");
          lines.push(".   ");
          lines.push(".   ");
          lines.splice(7,0,timestampInput, message, question);
          newData = lines.join('\n');
          //write to file
          fs.writeFile('capsule.md', newData, function (err) {
            if (err) return console.log(err);
            console.log('Memory saved!');
          });
        }
      }
    })
    .catch(error => {
      if(error.isTtyError) {} else {}
    });

    return yargs.demandOption(['m']);
 })


// SIMPLE COMMAND TO GET A REFLECTIVE PROMPT

 .command("prompt", "Prompt with a question", function(argv){
    const greeting = chalk.white.bold(`How did you feel today?`);

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
    inquirer
    .prompt([{
        type: 'confirm',
        name:'deleteAuth',
        message:"Are you sure you want to delete all previous capsule entries?"
    }
    ])
    .then(answers => {
      if(answers.deleteAuth){
        fs.writeFile('capsule.md', '', function(){console.log('Capsule cleared')})
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

// console.clear();
// console.log(
//   chalk.yellow(
//     figlet.textSync('HUMAN', { horizontalLayout: 'full' })
//   )
// );
