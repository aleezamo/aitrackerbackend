const express = require('express')
const pool = require('./db');

const app = express()
const port = 8000

app.set("view engine", "ejs")

app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT ai_source, COUNT(*) AS count from ai_traffic_events GROUP BY ai_source ORDER BY count DESC');
    console.log(result.rows); 
    //res.send("Heloooo")   
    res.render("dashboard", {title: "Dashboard", aiSources: result.rows});
  } catch (err) {
    console.error(err);
    res.status(500).send('DB ERROR');
  }
  
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
