const http = require("http");
const url = require("url");
const port = 3000;

function pluralize(obj) {
  let forms = obj.forms.split(",");
  let count = Object.prototype.hasOwnProperty.call(obj, "number") ? obj.number : false;
  let lang = Object.prototype.hasOwnProperty.call(obj, "lang") ? obj.number : false;

  if (forms.length === 1 && forms[0] === "") {
    return "406 Incorect input!";
  }

  if (lang === "en" && forms.length <= 2) {
    if (forms.length === 2) {
      return count + " " + (Number(count) > 1 ? forms[1] : forms[0]);
    } else {
      return count + " " + (Number(count) > 1 ? forms[0] + "s" : forms[0]);
    }
  }

  if (lang === "uk" && forms.length === 2) {
    if (count % 10 === 1 && count % 100 !== 11) {
      return count + " " + forms[0];
    }
    return count + " " + forms[1];
  }

  if (count % 10 === 1 && count % 100 !== 11) {
    return count + " " + forms[0];
  } else if ((count % 100 < 10 || count % 100 >= 20) && count % 10 >= 2 && count % 10 <= 4) {
    return count + " " + forms[1];
  } else {
    return count + " " + forms[2];
  }
}

function getFrequency(sentence) {
  let statistics = new Map();
  sentence = sentence.toLowerCase().replace(/[.,]/g, "");

  for (let word of sentence.split(" ")) {
    if (statistics.has(word)) {
      statistics.set(word, statistics.get(word) + 1);
    } else {
      statistics.set(word, 1);
    }
  }
  return statistics;
}
function getMaxNum(map) {
  let frequency = 0;
  let word;

  for (const [key, value] of map) {
    if (value > frequency) {
      frequency = value;
      word = key;
    }
  }
  return word;
}

const server = http.createServer((req, res) => {
  if (req.url === "/headers") {
    if (req.method === "GET") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end(JSON.stringify(req.headers) + "\n");
    } else {
      res.writeHead(404, "Not Found");
      res.end();
    }
  } else if (req.url.includes("/plural")) {
    if (req.method === "GET") {
      const queryObject = url.parse(req.url, true).query;
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end(pluralize(queryObject) + "\n");
    } else {
      res.writeHead(404, "Not Found");
      res.end();
    }
  } else if (req.url.includes("/frequency")) {
    if (req.method === "POST") {
      const data = [];
      req.on("data", (chunk) => data.push(chunk));
      req.on("end", () => {
        const outputString = data.join("");
        const frWord = getMaxNum(getFrequency(outputString));

        res.writeHead(201, {
          "Content-Type": "application/json",
          "UniqueWords": getFrequency(outputString).size,
          "FrequentWord": frWord,
        });
        res.end(JSON.stringify(Object.fromEntries(getFrequency(outputString))) + "\n");
      });
    } else {
      res.writeHead(404, "Not Found");
      res.end();
    }
  } else {
    res.writeHead(404, "Not Found");
    res.end();
  }
});

server.listen(port, () => {
  console.log(`Server started at localhost: ${port}`);
});




// curl localhost:3000/headers

// сurl localhost:3000/plural?number=2\&forms=%D0%B1%D0%B0%D0%BD%D0%B0%D0%BD,%D0%B1%D0%B0%D0%BD%D0%B0%D0%BD%D0%B0,%D0%B1%D0%B0%D0%BD%D0%B0%D0%BD%D1%96%D0%B2
// curl localhost:3000/plural?number=2\&forms
// curl localhost:3000/plural?number=2\&forms=%D0%B1%D0%B0%D0%BD%D0%B0%D0%BD,%D0%B1%D0%B0%D0%BD%D0%B0%D0%BD%D0%B0
// curl localhost:3000/plural?number=2\&forms=fish,fishes\&lang=en
// curl localhost:3000/plural?number=2\&forms=fish,fishes

// curl -X POST  localhost:3000/frequency --data-raw "Little red fox jumps over logs. Fox is red"
// curl -X POST -v localhost:3000/frequency --data-raw "Little red fox jumps over logs. Fox is red"