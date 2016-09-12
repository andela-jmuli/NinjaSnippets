"use strict";
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function getSnippet(file) {
  let filePath = path.resolve(`snippets/${file}.snippet`)
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    fs.writeFileSync(path.resolve(filePath), '\'use strict\';');
  }
}

function parseSnippet(snippet, content) {
  const template = `
<snippet>
  <content><![CDATA[
${ content }
  ]]></content>
  <!-- Optional: Set a tabTrigger to define how to trigger the snippet -->
  <tabTrigger>${ snippet.trigger }</tabTrigger>
  <description>${ snippet.description }</description>
  <!-- Optional: Set a scope to limit where the snippet will trigger -->
  <scope>${ snippet.scope }</scope>
</snippet>
`;
  return (template);
}

function parse(snippet) {
  // return ig not snippet has been supplied
  if (!snippet || snippet.ignore) {
    return false;
  }

  let content = getSnippet(snippet.name);
  let parsedSnippet = parseSnippet(snippet, content);
  let folder = 'ninjaSnippet';

  // Check if the folder exist and creare one if not
  if (!fs.readdirSync('./').includes(folder)) {
    fs.mkdirSync(folder);
  }

  // Genereate the path for the file
  let filePath = path.resolve(`${folder}/${snippet.name}.sublime-snippet`)

  // write the built snippet to the snippet folder
  return fs.writeFileSync(filePath, parsedSnippet);

}

// Read config file

function readConfig(file) {
  let buffer;
  try {
    buffer = fs.readFileSync(`config/${file}.yml`);
  } catch (err) {
    return console.log(err.message);
  }
  return yaml.safeLoad(buffer);
}


// Build the  configuraton array
function buildConfigArray(file) {
  let buffer, config = [];

  try {
    buffer = yaml.safeLoad(fs.readFileSync(path.resolve(file)));
  } catch (err) {
    console.log(err.message);
  }

  if (buffer.environment === null) {
    return console.log('No configuraton supplied for a build');
  }
  buffer.environment.forEach((environment) => {
    config = config.concat(readConfig(environment));
  });

  return config;
}

// export snippet buildng function
module.exports.buildSnippets = function buildSnippets(filePath) {
  const config = buildConfigArray(filePath);
  if (config) {
    return config.forEach((snippetConfig) => {
      parse(snippetConfig);
    });
  }
  process.exit(0);
}


module.exports.buildConfigArray = buildConfigArray;