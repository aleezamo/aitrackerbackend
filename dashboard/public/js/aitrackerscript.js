( () => {   
    const hostName = location.hostname;
    const param = new URLSearchParams(window.location.search);
    const pathName = location.pathname;
    const pageTitle = document.title;
    let aiSource = param.get("utm_source");

    const script = document.currentScript;
    const siteID = script.dataset.siteId;
    const apiUrl = script.dataset.apiUrl;
    console.log(apiUrl);

    if (siteID == null) {
        console.error("Error: data-site-id is missing");
        return
    }

    if (apiUrl == null) {
        console.error("Error: data-api-url is missing");
        return
    }

    if (hostName=="") {
        console.error("Error: no host detected");
        return
    }

    if (aiSource == null) {
        aiSource = document.referrer || "";
    }

    if (aiSource.includes("chatgpt.com")) {
        aiSource = "chatgpt";
    }
    else if (aiSource.includes("claude.ai")) {
        aiSource = "claude";
    }
    else if (aiSource.includes("copilot.com")) {
        aiSource = "copilot";
    }
    else if (aiSource.includes("deepseek.com")) {
        aiSource = "deepseek";
    }
    else if (aiSource.includes("gemini.com")) {
        aiSource = "gemini";
    } 
    else if(aiSource.includes("perplexity.ai")) {
        aiSource = "perplexity";
    }
    else {
        aiSource = null;
    }

    if (aiSource == null) {
        console.log("no ai source detected");
        return;
    }

    const analytics = {
        "hostName" : hostName,
        "aiSource" : aiSource,
        "pathName" : pathName,
        "pageTitle" : pageTitle,
        "siteID" : siteID
    };
    const jsonString = JSON.stringify(analytics);
    console.log(jsonString);
    fetch(apiUrl, {
        method: "POST",
        headers: {"Content-Type" : "application/json"},
        body: jsonString,
        keepalive: true
    })
    .then(response => {
        console.log("Response status:", response.status);
        return response.json();
    })
    .then(data => {
        console.log("Data:", data);
    })
    .catch(error => {
        console.error("Error: ", error);
    });
}) ();