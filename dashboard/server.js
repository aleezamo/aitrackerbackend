const express = require('express')
const pool = require('./db');
const bcrypt = require('bcrypt');
const session = require("express-session");
const expressLayouts = require("express-ejs-layouts");

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express()
const port = 8000

app.set("view engine", "ejs")

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(expressLayouts);
app.set("layout","layouts/main")

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
  if (process.env.SELF_HOSTED == 1) {
    return res.redirect("/users/login");
  }

  res.render("register", {
    error:null});
});


app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized:false, 
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1000*60*60*24*7
    }
  })
)

app.post('/users/register', async (req, res) => {

  if (process.env.SELF_HOSTED == 1) {
    return res.redirect("/users/login");
  }

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
    req.session.userId = result.rows[0].id

    res.redirect("/sites")
  } catch (err) {
    console.log(err);
    if (err.code="23505") {
      return res.status(400).render("register", {error: "An account with this email already exists"});
    }
    else {
      res.status(500).send("ERROR")
    }

  }
});


app.get('/users/login', async (req, res) => {
  res.render("login", {error:null});
});

app.post('/users/login', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (process.env.SELF_HOSTED == 1) {
    if (email!==process.env.LOGIN_EMAIL || password!==process.env.LOGIN_PASSWORD) {
      return res.status(400).render("login", {error: "Please use email and password defined in .env file!!"});
  }
  

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const result = await pool.query("INSERT INTO users (email, password) VALUES ($1, $2) ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email RETURNING id;", [email, hashedPassword]);
      req.session.userId = result.rows[0].id;
      return res.redirect("/sites");
    } catch (err) {
      console.log(err);
      return res.status(500).send("DB ERROR");
    }

  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(400).render("login", {error: "Invalid Credentials"});
    }
    const user = result.rows[0];

    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(400).render("login", {error: "Invalid Credentials"});
    }

    req.session.userId = user.id;
    res.redirect("/sites");
  } catch (err) {
    console.log(err);
    res.status(500).send("DB ERROR");
  }
});

app.post('/users/logout', async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Could not log out");
    }

    res.clearCookie("connect.sid"); // removes cookie from browser
    res.redirect("/users/login");
  });
});

app.get('/sites/:id/dashboard', async (req, res) => {
  const userId = req.session.userId;
    if (!userId) {
      return res.redirect("/users/login")
    }
  
  try {
    const site_id = req.params.id;
    const userId = req.session.userId;


    const siteResult = await pool.query(`SELECT s.id, domain FROM ai_traffic_sites s INNER JOIN users u ON u.id=s.user_id WHERE u.id= $1 and s.id = $2` ,[userId, site_id]);
    if (siteResult.rows.length === 0) {
        return res.redirect("/sites");
    }
      console.log("URL:", req.url);
      console.log("params:", req.params);

      //console.log(dashboardID);

      const duration = req.query.duration;
      let queryduration = '7 days';
      if (duration=="24h") { queryduration = '24 hours'; }
      else if (duration=="30d") {queryduration= '30 days';}

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
    const userId = req.session.userId;
    if (!userId) {
      return res.redirect("/users/login")
    }
    const domains = await pool.query(`SELECT * from ai_traffic_sites WHERE user_id=($1)`, [userId]);
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
    const userId = req.session.userId;
    if (!userId) {
      return res.redirect("/users/login")
    }

    res.render("addsite", {
    title: "Add a Site", 
    error:null,
    oldValue: null});

});

app.get('/charts/:id', async(req, res) => {
  try {
  const site_id = req.params.id;
  const userId = req.session.userId;
  if (!userId) {
    return res.send({"error": "User Session Not Found"})
  }
  const siteResult = await pool.query(`SELECT s.id, domain FROM ai_traffic_sites s INNER JOIN users u ON u.id=s.user_id WHERE u.id= $1 and s.id = $2` ,[userId, site_id]);
  if (siteResult.rows.length === 0) {
    return res.send({"error": "Site Not Found"})
  }

  const duration = req.query.duration;
  let chartData = ""
  if (duration==="24h") {
    chartData = await pool.query(`SELECT d.hour, COUNT(a.*) AS event_count
        FROM generate_series(
        date_trunc('hour', NOW() - INTERVAL '24 hours'),
        date_trunc('hour', NOW()),
        INTERVAL '1 hour'
        ) AS d(hour)
        LEFT JOIN ai_traffic_events a
        ON date_trunc('hour', a.created_at) = d.hour
        AND a.site_id = $1
        GROUP BY d.hour
        ORDER BY d.hour;`, [site_id]);
  }
  else {
    let days = "6 days"
    if (duration==="30d") {
      days = "29 days"
    }
    
    chartData = await pool.query(`SELECT d.day::date AS date, COUNT(a.*) AS event_count
    FROM generate_series(
    CURRENT_DATE - INTERVAL '${days}',
    CURRENT_DATE,
    INTERVAL '1 day'
    ) AS d(day)
    LEFT JOIN ai_traffic_events a
    ON a.created_at::date = d.day
    WHERE a.site_id=$1 OR a.site_id IS NULL
    GROUP BY d.day
    ORDER BY d.day`, [site_id]);
  }

    

    res.json(chartData.rows);
  } catch (err) {
      console.error(err);
      res.status(500).send('DB ERROR')
  }
});

app.post('/sites/add', async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
      return res.redirect("/users/login")
  }
  const domain = req.body.domain;
  const userID = req.session.userId
  if (!isValidDomain(domain)) {
   return res.status(400).render("addsite", {
      title: "Add a Site",
      error: "Invalid domain format. Example: example.com",
      oldValue: domain
    });
  }
  console.log("Valid domain:", domain);
  try {
    const result = await pool.query("INSERT INTO ai_traffic_sites (domain, user_id) VALUES ($1, $2) RETURNING id", [domain, userID])
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
  const userId = req.session.userId;
  if (!userId) {
    return res.redirect("/users/login")
  }
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
