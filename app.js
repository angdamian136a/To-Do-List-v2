//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const { lowerFirst } = require("lodash");
const port = process.env.PORT || 3000;

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://new-user-angdamian:angdamian_136a@angdamiancluster.rpsa8p0.mongodb.net/?retryWrites=true&w=majority/todolistDB");

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<--- Check this checkbox to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);




app.get("/", function(req, res) {
  Item.find()
  .then(function(foundItems){
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems)
      .then(function(){
        console.log("Successfully saved all the default items");
      }).catch(function(err){
        console.log(err);
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  }).catch(function(err){
    console.log(err);
  });
});

app.post("/", function(req, res){
  const newItemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name: newItemName
  });

  if(listName==="Today") {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName})
    .then(function(foundList){
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId)
    .then(function(){
      console.log("Successfully deleted");
    }).catch(function(err){
      console.log(err);
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate({name: listName},
      {$pull: {items: {_id: checkedItemId}}})
    .then(function(foundList){
      res.redirect("/" + listName);
    }).catch(function(err){
      console.log(err);
    });
  };
})

app.get("/:customListName", function(req, res){
  const customListName = _.startCase(req.params.customListName);
  List.findOne({name: customListName})
  .then(function(foundList){
    console.log("No error.");
    if (!foundList){
      console.log("New list added!");
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + customListName);
    } else {
      console.log("List already exists!");
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  }).catch(function(err){
    console.log(err);
  })
})

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(port, function() {
  console.log("Server started on port 0.0.0.0");
});
