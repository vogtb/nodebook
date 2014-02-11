# Nodebook

![alt tag](https://raw.github.com/vogtb/nodebook/master/ui/img/demo_img.png)

Nodebook is a visually intuitive way to collect your thoughts, and organize your ideas.

The overarching idea behind Nodebook is that it's simply not enough to write your thoughts down, or collect them in a note taking application. Even if you write them down, in order to review them you have to look them up. Nodebook solves this by showing you in a highly visual way exactly which pieces of text are related. This increases the serendipity between you're ideas, hopefully generating even more fruitful projects.

## Deployment

Make sure you have mongo running, and then start the server.

`mongod&`

`node app.js`

The .env file indicates that the server will run at [http://localhost:3000/](http://localhost:3000/).

NOTE: The .env file also indicates the application's session secret, which you should change if you plan on actually using the application globally.

## About

Each note is a node in your graph, with the connections representing the words those nodes have in common. The denser the line, the more words in common.

As you add node after node to your graph you can see how certain ideas are related to others.

Each node can be as short as a tweet or as long as several paragraphs, but the more words in your node, the more connections it will have to other nodes.

When you add a piece of text to Nodebook, we immediately strip away any common, or unimportant words - it, and, the, what, no, not, are, because - so we are left with a more accurate sense of the text. This text is further broken down into keywords that can be easily matched to other keywords in other nodes.

To see what keywords two nodes have in common, click on one node and then hold the Shift key while clicking on another.


##Usage

###Terms

**Node:** A node is a piece of text that can be as short as a tweet or as long as several pages. It is represented on the graph as a dot.

**Connection:** A connection represents the words that two nodes have in common. The heavier, darker, or thicker the connection, the more words those nodes have in common.


###Node Actions

**Viewing a Node:** If you click a node on the graph, the sidebar on the left will automaticall scroll to that node. Inversely, if you click on a node's text, the node will be highlighted on the graph.

**Adding a Node:** To add a node click the button "New Node" in the top bar.

**Editing a Node:** Find the node in the sidebar and click "Edit Node." Note: Editing a node will cause it's connections to change.

**Deleting a Node:** Find the node in the sidebar and click "Edit Node." On the pop-up you will see a button to delete the node. Node: deleting a node will delete its connections, because you can't have a connection to a node that does not exist anymore.

**Compare Two Nodes:** Select one node on the graph by clicking it. Then hold the 'shift' key and select another one.