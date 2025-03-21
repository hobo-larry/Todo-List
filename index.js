import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "yourdatabase",
  password: "yourpassword",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));



async function getItems() {
  let items = [ ];
  const result = await db.query("SELECT * FROM items");
  result.rows.forEach((item) => {
    items.unshift(item);
  });
  return items;
  
}
async function addItem(item) {
  const result = await db.query("INSERT INTO items (title) VALUES ($1)", [item]);
}

async function editItem(item, id) {
  const result = await db.query("UPDATE items SET title = $1 WHERE id = $2", 
  [item,id]);
}

async function deleteItem(id) {
  const result = await db.query("DELETE FROM items WHERE id = $1", [id]);
}



app.get("/", async (req, res)  => {
  try {
    const result = await db.query("SELECT * FROM items ORDER BY id ASC");
    let items = result.rows;

    res.render("index.ejs", {
      listTitle: "Today",
      listItems: items,
    });
  } catch (err) {
    console.log(err);
  }
  
});

app.post("/add", (req, res) => {
  const item = req.body.newItem;
  addItem(item);
  
  res.redirect("/");
});

app.post("/edit",async (req, res) => {
  let items = await getItems();
  console.log(items);
  const id = req.body.updatedItemId;
  const item = req.body.updatedItemTitle;
  editItem(item, id);
  
  
  
  res.redirect("/");

});

app.post("/delete", (req, res) => {
  const id = req.body.deleteItemId;
  
  deleteItem(id);
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
