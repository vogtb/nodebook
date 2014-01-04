# Nodebook

Nodebook is a visually intuitive way to collect your thoughts, and organize your ideas.

The overarching idea behind Nodebook is that it's simply not enough to write your thoughts down, or collect them in a note taking application. Even if you write them down, in order to review them you have to look them up. Nodebook solves this by showing you in a highly visual way exactly which pieces of text are related. This increases the serendipity between you're ideas, hopefully generating even more fruitful projects.

## Installation

Make sure you have mongo running, and then start the server.

`mongod&`
`node app.js`

The .env file indicates that the server will run at [http://localhost:3000/](http://localhost:3000/).

## Usage

Each note is a node in your graph, with the connections representing the words those nodes have in common. The denser the line, the more words in common.

As you add node after node to your graph you can see how certain ideas are related to others.

Each node can be as short as a tweet or as long as several paragraphs, but the more words in your node, the more connections it will have to other nodes.

When you add a piece of text to Nodebook, we immediately strip away any common, or unimportant words - it, and, the, what, no, not, are, because - so we are left with a more accurate sense of the text. This text is further broken down into keywords that can be easily matched to other keywords in other nodes.

To see what keywords two nodes have in common, click on one node and then hold the Shift key while clicking on another.
