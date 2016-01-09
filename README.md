# lc3js

[![Build Status](http://img.shields.io/travis/strburst/lc3js.svg)](https://travis-ci.org/strburst/lc3js)
[![Dependency Status](https://img.shields.io/david/strongloop/express.svg)](https://david-dm.org/strburst/lc3js)
[![License](https://img.shields.io/github/license/strburst/lc3js.svg)](https://github.com/strburst/lc3js/blob/master/LICENSE)

This is an implementation of LC-3 assembly written in Javascript. It's still under construction.

The [LC-3](https://en.wikipedia.org/wiki/LC-3) is a toy ISA (Instruction Set Architecture) introduced in Yale Patt's excellent *Introduction to Computing Systems*. It's very minimal, having only fifteen instructions!

## Build

First, install dependencies in the typical fashion:

```
$ npm install
```

Install gulp globally, if you haven't done so already:

```
$ npm install -g gulp
```

Using gulp, you can compile the parser (`gulp compile-parser`), run the linter (`gulp lint`), or run the tests (`gulp test` or `mocha`). You can do all three by simply running:

```
$ gulp
```

Consult `gulpfile.js` for more details.
