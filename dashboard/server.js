const express = require('express')
const pool = require('./db');

const app = express()
const port = 8000

app.set("view engine", "ejs")

app.get('/', async (req, res) => {
  try {
      const duration = req.query.duration;
      let queryduration = '7 days';

      if (duration=="1d") { queryduration = '1 day'; }
      else if (duration=="14d") { queryduration = '14 days';}
      else if (duration=="1m") {queryduration= '1 month';}
      

    const aiSourceResult = await pool.query(`SELECT ai_source as attribute, COUNT(*) AS count from ai_traffic_events WHERE created_at >= CURRENT_DATE - INTERVAL \'${queryduration} \' GROUP BY ai_source ORDER BY count DESC`);
    const titleResult = await pool.query(`SELECT page_title as attribute, COUNT(*) AS count from ai_traffic_events WHERE created_at >= CURRENT_DATE - INTERVAL '${queryduration}' GROUP BY page_title ORDER BY count DESC`);
    const pathnameResult = await pool.query(`SELECT path_name as attribute, COUNT(*) AS count from ai_traffic_events WHERE created_at >= CURRENT_DATE - INTERVAL \'${queryduration} \' GROUP BY path_name ORDER BY count DESC`);
    res.render("dashboard", {
      title: "Dashboard", 
      aiSources: aiSourceResult.rows,
      pageTitles : titleResult.rows,
      pathNames: pathnameResult.rows,
      duration: duration
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('DB ERROR');
  }
  
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
