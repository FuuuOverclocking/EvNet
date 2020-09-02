#!/usr/bin/env node

function printHelp() {
   const help = `
Build EvNet from sources.

Usage:
   node ./scripts/build.js                Select './src/entry.ts' as the build entry.
   node ./scripts/build.js <name>         Select './src/entry.<name>.ts' as the build entry.
   node ./scripts/build.js --all          Build for each entry file in the './src'
`;
   console.log(help);
}

const { } = require('./utilities');
const { red, yellow, green, blue } = require('chalk');
const fs = require('fs-extra');
const terser = require('terser');
const path = require('path');
const zlib = require('zlib');

// avoid warnings
require('events').EventEmitter.defaultMaxListeners = 100;

main();

async function main() {
   const entries = parseCommandLineArguments();
   if (entries.length === 0) {
      printHelp();
      return;
   }

   if (!fs.existsSync('build')) {
      fs.mkdirSync('build');
   }

   for (const entry of entries) {
      await build(entry);
   }
   console.log(blue('Done'));
}

function parseCommandLineArguments() {
   const argv = process.argv.slice(2);
   if (argv.length === 0) {
      if (!fs.existsSync('src/entry.ts')) {
         throw chalk.red('Entry `src/entry.ts` not exists.');
      }
      return ['default'];
   }

   if (argv[0] === '--all' || argv[0] === '-a') {
      return fs.readdirSync('src')
         .filter(filename =>
            filename.startsWith('entry') && filename.endsWith('.ts')
         ).map(filename =>
            filename === 'entry.ts' ? 'default' :
               filename.slice(6, -3)
         );
   }

   for (const entry of argv) {
      let filenameToCheck = 'src/entry.' + entry + '.ts';

      if (!fs.existsSync(filenameToCheck)) {
         throw chalk.red('Entry `' + filenameToCheck + '` not exists.');
      }
   }
   return argv;
}

async function build(entry) {
   fs.removeSync(`build/${entry}/src`);
   fs.copySync('src', `build/${entry}/src`);
   fs.renameSync(
      `build/${entry}/src/entry${
      entry === 'default' ? '' : '.' + entry
      }.ts`,
      `build/${entry}/src/entry.ts`
   );
   fs.readdirSync(`build/${entry}/src`)
      .filter(
         filename =>
            filename !== 'entry.ts' &&
            filename.startsWith('entry') &&
            filename.endsWith('.ts')
      ).forEach(filename => fs.removeSync(`build/${entry}/src/${filename}`))


}
