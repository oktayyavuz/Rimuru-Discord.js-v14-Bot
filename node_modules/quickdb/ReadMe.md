# quickdb

## QuickDB is an easy to use JSON file database

    QuickDB is an easy to use fake database
    that saves items inside JSON files.

    Instead of setting up a database, you
    can use QuickDB to save information.

    Store any type of object.

## Installation

    npm install quickdb --save

## quickdb database folder location

    quickdb will save its documents in a folder called dbdata,
    inside the root of your application


## Usage


```js

var quickdb = require('quickdb');

var basicCallback = (response)=>{
  console.log(response);
};

```

```js

var item_to_insert = { name: "Woopty woop!" };
quickdb.doc.insert("newSetName", "newDocName", item_to_insert, basicCallback);

```

```js

var searchFunc = (val)=>{
  return val.item.name = "Woopty woop!";
};

quickdb.doc.find("newSetName", "newDocName", searchFunc, basicCallback);

```

```js

quickdb.doc.getdoc("newSetName", "newDocName", basicCallback);

```

```js

quickdb.doc.docset("newSetName", basicCallback);

```

```js

//update will replace the whole item set
quickdb.doc.update(setName, docName, [], basicCallback);

```

```js

quickdb.doc.remove(setName, docName, searchFunc, basicCallback);

```
