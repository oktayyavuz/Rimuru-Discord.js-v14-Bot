"use strict";

const fs = require("fs");
const functions = require("../functions/yamldb.js");
let YAML;

class YamlDB {
	constructor(options) {
		  this.dbName = options["dbName"];
	    this.dbFolder = options["dbFolder"];

      try {
        YAML = require("yaml");
      } catch (error) {
        throw new TypeError("You must install \"yaml\" module for use this adapter.");
      }

      functions.fetchFiles(this.dbFolder, this.dbName);
	}

	set(db, data) {
    functions.fetchFiles(this.dbFolder, this.dbName);

    if(!db) {
      throw new TypeError(this.message["errors"]["blankName"]);
    }

    if(!data) {
      throw new TypeError(this.message["errors"]["blankData"]);
    }

    var content = YAML.parse(fs.readFileSync(`./${this.dbFolder}/${this.dbName}.yaml`, "utf8"));
    functions.set(db, data, content);
    fs.writeFileSync(`./${this.dbFolder}/${this.dbName}.yaml`, YAML.stringify(content));
    return this.get(db);

    
  }

  get(db) {

    if(!db) {
      throw new TypeError(this.message["errors"]["blankName"]);
    }

    var content = YAML.parse(fs.readFileSync(`./${this.dbFolder}/${this.dbName}.yaml`, "utf8"));

    try {
      return functions.get(content, ...db.split("."));
    } catch(err) {
      return undefined;
    }

  }

  fetch(db) {

    if(!db) {
      throw new TypeError(this.message["errors"]["blankName"]);
    }

    var content = YAML.parse(fs.readFileSync(`./${this.dbFolder}/${this.dbName}.yaml`, "utf8"));

    try {
      return functions.get(content, ...db.split("."));
    } catch(err) {
      return undefined;
    }

  }

  has(db) {

    if(!db) {
      throw new TypeError(this.message["errors"]["blankName"]);
    }

    var content = YAML.parse(fs.readFileSync(`./${this.dbFolder}/${this.dbName}.yaml`, "utf8"));

    try {
      return functions.get(content, ...db.split(".")) ? true : false;
    } catch(err) {
      return false;
    }

  }

  delete(db) {
    functions.fetchFiles(this.dbFolder, this.dbName);

    if(!db) {
      throw new TypeError(this.message["errors"]["blankName"]);
    }

    var content = YAML.parse(fs.readFileSync(`./${this.dbFolder}/${this.dbName}.yaml`, "utf8"));

    if(!this.get(db)) {
      return false;
    }

    functions.remove(content, db);
    
    fs.writeFileSync(`./${this.dbFolder}/${this.dbName}.yaml`, YAML.stringify(content));

    return true;
  }

  add(db, number) {
    
    if(!db) {
      throw new TypeError(this.message["errors"]["blankName"]);
    }

    if(!number) {
      throw new TypeError(this.message["errors"]["blankData"]);
    }

    if(isNaN(number)) {
      throw new TypeError(this.message["errors"]["blankNumber"]);
    }

    this.set(db, Number(this.get(db) ? (isNaN(this.get(db)) ? Number(number) : this.get(db)+Number(number)) : Number(number)));
    
    return this.get(db);

  }

  subtract(db, number) {
    
    if(!db) {
      throw new TypeError(this.message["errors"]["blankName"]);
    }

    if(!number) {
      throw new TypeError(this.message["errors"]["blankData"]);
    }

    if(isNaN(number)) {
      throw new TypeError(this.message["errors"]["blankNumber"]);
    }

    if(this.get(db)-number < 1) {
      this.delete(db);
      return (this.get(db) || 0);
    }

    if(!this.get(db)) {
      this.delete(db);
      return (this.get(db) || 0);
    }

    this.set(db, this.get(db) ? (this.get(db)-Number(number) <= 1 ? 1 : (isNaN(this.get(db)) ? 1 : this.get(db)-Number(number)) || 1) : 1);
    
    return this.get(db);

  }

  push(db, data) {

    if(!db) {
      throw new TypeError(this.message["errors"]["blankName"]);
    }

    if(!data) {
      throw new TypeError(this.message["errors"]["blankData"]);
    }

    var arr = [];

    if(this.get(db)) {
      if(typeof this.get(db) !== "object") {
        arr = [];
      } else {
        arr = this.get(db);
      }
    }

    arr.push(data);

    this.set(db, arr);

    return this.get(db);

  }

  unpush(db, data) {

    if(!db) {
      throw new TypeError(this.message["errors"]["blankName"]);
    }

    if(!data) {
      throw new TypeError(this.message["errors"]["blankData"]);
    }

    var arr = [];

    if(this.get(db)) {
      arr = this.get(db);
    }

    arr = arr.filter((x) => x !== data);

    this.set(db, arr);

    return this.get(db);

  }

  delByPriority(db, number) {

    if(!db) {
      throw new TypeError(this.message["errors"]["blankData"]);
    }

    if(!number) {
      throw new TypeError(this.message["errors"]["blankNumber"]);
    }

    if(isNaN(number)) {
      throw new TypeError(this.message["errors"]["blankNumber"]);
    }

    if(!this.get(db) || this.get(db).length < 1) {
      return false;
    }

    let content = this.get(db);
    let neww = [];

    if (typeof content !== "object") {
      return false;
    }

    for (let a = 0; a < content.length; a++) {
      if (a !== (number-1)) {
        neww.push(content[`${a}`]);
      }
    }

    this.set(db, neww);
    return this.get(db);

  }

  setByPriority(db, data, number) {

    if(!db) {
      throw new TypeError(this.message["errors"]["blankData"]);
    }

    if(!data) {
      throw new TypeError(this.message["errors"]["blankData"]);
    }

    if(!number) {
      throw new TypeError(this.message["errors"]["blankNumber"]);
    }

    if(isNaN(number)) {
      throw new TypeError(this.message["errors"]["blankNumber"]);
    }

    if(!this.get(db) || this.get(db).length < 1) {
      return false;
    }

    let content = this.get(db);
    let neww = [];

    if (typeof content !== "object") {
      return false;
    }

    for (let a = 0; a < content.length; a++) {
      let val = content[`${a}`];

      if(a === (number-1)) {
        neww.push(data);
      } else {
        neww.push(val);
      }
    }

    this.set(db, neww);
    return this.get(db);

  }

  all() {
    var content = YAML.parse(fs.readFileSync(`./${this.dbFolder}/${this.dbName}.yaml`, "utf8"));

    return content;
  }

  deleteAll() {

    fs.writeFileSync(`./${this.dbFolder}/${this.dbName}.yaml`, YAML.stringify({}));

    return true;

  }

}

module.exports = YamlDB;