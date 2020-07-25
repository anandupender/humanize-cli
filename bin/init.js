#!/usr/bin/env node

// Upon initial installation of the Node package, explain what this is!

const chalk = require("chalk");
const figlet = require("figlet");
const boxen = require("boxen");
const fs = require('fs')
const inquirer = require('inquirer');
const storage = require('node-persist');
const filename = "MEMORIES.md"

console.clear();
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

// inquirer
//     .prompt([
//         {
//         type:'input',
//         name: 'name',
//         message: 'What\'s your name?',
//         },
//         {
//         name: 'intention',
//         message: 'What led you to download this tool?',
//         },
//         {
//         type:'list',
//         name: 'color',
//         message: 'Which color do you like most?',
//         choices: ['red', 'green','yellow','blue','black','white'],
//         },
//     ])
//     .then(answers => {
//        store(answers);

//        //create capsule file and readme with link?
//        fs.writeFile(filename, "",function (err) {
//         if (err) throw err;
//         console.log('File is created successfully.');
//       }); 

//        var greeting = "Thank you " + answers.name +" !" 
//        const boxenOptions = {
//         padding: 3,
//         margin: 1,
//         borderStyle: "round",
//         backgroundColor: answers.color,
//         borderColor: "white"
//        };
//        const msgBox = boxen( greeting, boxenOptions );
       
//        console.log(msgBox);
//     });

//     async function store(answers){
//         await storage.init( /* options ... */ );
//         await storage.setItem('name',answers.name);
//         await storage.setItem('intention',answers.intention);
//         await storage.setItem('color',answers.color);
//         await storage.setItem('initDate',new Date().toDateString);

//     }