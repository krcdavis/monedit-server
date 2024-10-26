const express = require("express");
const app = express();
const mysql = require("mysql2");//pls
const cors = require("cors");

app.use(cors());
app.use(express.json());

const user = "root" || process.env.BLOOSER;
const host = "localhost" || process.env.KV_URL;
const password = "root" || process.env.KV_REST_API_TOKEN;

const table = "monstars";

const db = mysql.createConnection({//pool?
  user: user,
  host: host,
  password: password,
  database: "monstars",
});



//really only the first value is used here so this could be reduced to a single array
const pattern = ["id","name","type","model","species","descr","ability",
	"hp","atk","def","luck","skill","speed",
	"evoto","evostage","evolevel","evoby"];
const pnatter = pattern.join(', ');
const qs = pattern.map(u => '?').join(', ');
const pq = pattern.slice(1).map(u => u+' = ?').join(', ');

app.get("/", (req,res) => {
 res.send("your momma");
});


app.post("/create", (req, res) => {
const things = [];
const psize = pattern.length;
  for (let i = 0; i < psize; i++) {
    things.push(req.body[pattern[i]]);
}
//also, if id exists in db update, else create
//it does not like 'if exists' as the start of a query. drat


  const id = req.body.id;
  db.query("SELECT COUNT(*) FROM "+table+" WHERE id = \'" + id +"\'",
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result[0]['COUNT(*)']);

	console.log(things);
	if (result[0]['COUNT(*)'] < 1) {
//insert
console.log("e");
const qu = "INSERT INTO " + table + ' (' + pnatter + ") VALUES (" + qs + ')';
  db.query( qu, things,
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send("Values insnerted");
      }
    }
  );
	}// count = 0 PLS
	else {
//update
console.log("u");
const uqu = "UPDATE " +table+ " SET "+ pq +" WHERE (id = \'" +id+"\')";
  db.query( uqu, things.slice(1),
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send("Values updated");
      }
    }
  );
	}//else
      }//else from count query
    }//result of count query
  );//count query

});//create


app.get("/getmon", (req, res) => {
//console.log(req.query);//there it isssss
  const id = req.query.id;
  db.query("SELECT * FROM "+table+" WHERE id = \'" + id +"\'", (err, result) => {
    if (err) {
      console.log(err);
    } else {//there should only be one result, sooooooo
      res.send(result[0]);
    }
  });
});

app.get("/getall", (req, res) => {
  db.query("SELECT * FROM "+table, (err, result) => {
    if (err) {
      console.log(err);
    } else {//
      res.send(result);
    }
  });
});



app.get("/list", (req, res) => {
  db.query("SELECT id, name FROM "+table, (err, result) => {
    if (err) {
      console.log(err);
    } else {//resoolt
      res.send(result);
    }
  });
});

app.get("/avg", (req, res) => {
//console.log(req.query);
  const stat = req.query.stat;
//console.log("SELECT AVG(" + stat + ") from " + table);
  db.query("SELECT AVG(" + stat + ") from " + table, (err, result) => {
    if (err) {
      console.log(err);
    } else {//as one does
//console.log(result);
      res.send(result);
    }
  });
});


app.get("/counts", (req, res) => {
  //const stat = req.query.stat;
  db.query("SELECT type, count(*) AS num FROM "+table+" GROUP BY type", (err, result) => {
    if (err) {
      console.log(err);
    } else {//as one does
console.log(result);
      res.send(result);
    }
  });
});

//select avg stat where type is type
//for wild, will likely check by exp class instead 

app.get("/avgt", (req, res) => {
//console.log(req.query);
  const stat = req.query.stat;
  const type = req.query.type;
  db.query("SELECT AVG(" + stat + ") from " + table +" WHERE type is "+type, (err, result) => {
    if (err) {
      console.log(err);
    } else {//as one does
//console.log(result);
      res.send(result);
    }
  });
});


//////////////////////////////////////////////////////////////////////////////////lol

app.put("/update", (req, res) => {
  const id = req.body.id;
  const wage = req.body.wage;
  db.query(
    "UPDATE employees SET wage = ? WHERE id = ?",
    [wage, id],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});

app.delete("/delete/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM employees WHERE id = ?", id, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});



app.listen(3001, () => {
  console.log("it's alive!!");
});