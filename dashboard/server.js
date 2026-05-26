const express = require('express')
const pool = require('./db');
const bcrypt = require('bcrypt');

const app = express()
const port = 8000

app.set("view engine", "ejs")

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));


function isValidEmail(email) {
  const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return regex.test(email);
}

function isValidPassword(password) {
  if (password.length<4) {
    return false;
  }
  else return true;
}

app.get('/', (req, res) => {
  res.render("test", {error: null});
})

app.get('/users/register', async (req, res) => {
  res.render("register", {
    error:null});
});
app.post('/users/register', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = await bcrypt.hash(password,10);
  
  if (!isValidEmail(email)) {
   return res.status(400).render("register", {error: "Invalid email format. Example: abc@test.com"});
  }

  if (!isValidPassword(password)) {
    return res.status(400).render("register", {error: "Password must be at least 4 characters"});
  }

  
  try {
    const result = await pool.query("INSERT INTO users (email, password) VALUES ($1,$2) RETURNING id", [email,hashedPassword]);
    res.redirect("/sites")
  } catch (err) {
    console.log(err);
  }
});


app.get('/users/login', async (req, res) => {
  res.render("login", {
    error:null});
});

app.post('/users/login', async (req, res) => {
  res.render("login", {
    error:null});
});


app.use(express.urlencoded({ extended: true }));
app.post('/login', async (req, res) => {
  const email = req.body.email;
  const pwrod = req.body.password;
  res.send(email)

  // try {
  //   const result = await pool.query("INSERT INTO users (username, pword) VALUES ($1, $2) RETURNING id", [domain])
  //   const siteID = result.rows[0].id
  //   res.redirect(`/sites/${siteID}/snippet`);
  // } catch (err) {
  //   if (err.code === '23505') {
  //       return res.status(400).render("addsite", {
  //       title: "Add a Site",
  //       error: "That domain already exists",
  //       oldValue: null
  //     });
  //   }
  //   console.error(err);
  //   res.status(500).send("Database Error");
  // }
  
});


app.get('/sites/:id/dashboard', async (req, res) => {
  try {
    const site_id = req.params.id;


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
    const result = await pool.query("INSERT INTO ai_traffic_sites (domain) VALUES ($1) RETURNING id", [domain])
    const siteID = result.rows[0].id
    res.redirect(`/sites/${siteID}/snippet`);
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

app.get('/sites/:id/snippet', async (req, res) => {
  try {
    const site_id = req.params.id;
    const siteResult = await pool.query(`SELECT id, domain FROM ai_traffic_sites WHERE id = '${site_id}'`);
    if (siteResult.rows.length === 0) {
        return res.status(404).send('Invalid Site ID');
    }

    const apiUrl = `${req.protocol}://${req.get("host")}/track`;
    res.render("snippet", {
      site_id : site_id,
      api_url: apiUrl

    });
  } catch(err) {
    console.log(err);
    res.status(500).send("Database Error");
  }

});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
