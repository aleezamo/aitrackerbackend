const express = require('express')
const pool = require('./db');

const app = express()
const port = 8000

app.set("view engine", "ejs")

app.use(express.static("public"));


app.get('/', (req, res) => {
  res.render("test");
})

app.get('/sites/:id/dashboard', async (req, res) => {
  try {
    const site_id = req.params.id;

    if (isNaN(site_id)) {
      return res.status(404).send('Invalid site id');
    }

    const siteResult = await pool.query(`SELECT id, domain FROM ai_traffic_sites WHERE id = '${site_id}'`);
    if (siteResult.rows.length === 0) {
        return res.status(404).send('This domain was not found');
    }


    console.log("URL:", req.url);
    console.log("params:", req.params);

    //console.log(dashboardID);

    const duration = req.query.duration;
    let queryduration = '7 days';

    if (duration=="1d") { queryduration = '1 day'; }
    else if (duration=="14d") { queryduration = '14 days';}
    else if (duration=="1m") {queryduration= '1 month';}
    
  

    const aiSourceResult = await pool.query(`SELECT ai_source as attribute, COUNT(*) AS count from ai_traffic_events WHERE created_at >= CURRENT_DATE - INTERVAL \'${queryduration} \' and site_id = '${site_id}' GROUP BY ai_source ORDER BY count DESC`);
    const titleResult = await pool.query(`SELECT page_title as attribute, COUNT(*) AS count from ai_traffic_events WHERE created_at >= CURRENT_DATE - INTERVAL '${queryduration}' and site_id = '${site_id}' GROUP BY page_title ORDER BY count DESC`);
    const pathnameResult = await pool.query(`SELECT path_name as attribute, COUNT(*) AS count from ai_traffic_events WHERE created_at >= CURRENT_DATE - INTERVAL \'${queryduration} \' and site_id = '${site_id}' GROUP BY path_name ORDER BY count DESC`);
    res.render("dashboard", {
      title: "Dashboard", 
      aiSources: aiSourceResult.rows,
      pageTitles : titleResult.rows,
      pathNames: pathnameResult.rows,
      duration: duration,
      site_id: site_id,
      site_name: siteResult.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('DB ERROR');
  }
  
});


app.get('/sites', async (req, res) => {
  try {
    const domains = await pool.query(`SELECT * from ai_traffic_sites`);
    res.render("sites", {domains:domains.rows});
  } catch (err) {
      console.error(err);
      res.status(500).send('DB ERROR')
  }

});

function isValidDomain(domain) {
  const regex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(domain);
}

app.get('/sites/add', async (req, res) => {
  res.render("addsite", {
    title: "Add a Site", 
    error:null,
    oldValue: null});
});

app.use(express.urlencoded({ extended: true }));
app.post('/sites/add', async (req, res) => {
  const domain = req.body.domain;
  if (!isValidDomain(domain)) {
   return res.status(400).render("addsite", {
      title: "Add a Site",
      error: "Invalid domain format. Example: example.com",
      oldValue: domain
    });
  }
  console.log("Valid domain:", domain);
  try {
    await pool.query("INSERT INTO ai_traffic_sites (domain) VALUES ($1)", [domain])
    res.redirect('/sites');
  } catch (err) {
    if (err.code === '23505') {
        return res.status(400).render("addsite", {
        title: "Add a Site",
        error: "That domain already exists",
        oldValue: null
      });
    }
    console.error(err);
    res.status(500).send("Database Error");
  }
  
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
