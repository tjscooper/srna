const express = require('express');
const path = require('path');

const http = require('http');
var https = require('https');
const fs = require('fs');

// serve the API with signed certificate on 443 (SSL/HTTPS) port

const app = express(),
      bodyParser = require("body-parser");
      port = 3080;






// serve the API on 80 (HTTP) port
//



var multer = require('multer')
var cors = require('cors');
app.use(cors())

// place holder for the data
const users = [];
var outfile = "";
const files = {}
var fileMap = {}
const current_user = "public"

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../my-app/build')));

app.get('/api/users', (req, res) => {
  console.log('api/users called!')
  res.json(users);
});

app.get('/download/:file(*)',(req, res) => {
var file = req.params.file;
var fileLocation = path.join('./reports',file);
console.log(fileLocation);

res.download(fileLocation, file);
});

app.get('/hello',function(req,res){
  res.send("Hello World!");
});

app.get('/status:file(*)',function(req,res){
  var file = req.params.file;
  console.log(file)
  console.log("yoyoyoyoyoy")
  const path = require("path");
  fs.readFile(path.resolve(__dirname, 'public/json/pipeline_status.json'), function (err, data) {
  if (err) throw err;
  console.log("data")
  console.log(data)
  var json2 = JSON.stringify(eval("(" + data + ")"));
  console.log("json2")
  var json1 = JSON.parse(json2);
  console.log("json1")
  console.log(json1)
  Object.keys(json1).forEach(function(k) {
    var value = json1[k];
    console.log(k)
    console.log(value)})
  var key1 = file.substring(1);
  console.log("key1")
  console.log(key1)
  var key = key1.slice(0, key1.indexOf('.'))
  console.log("key")
  console.log(key)
  var retJson = json1[key]
  console.log("retJson")
  console.log(retJson)
  res.json(retJson);
});

});

app.post('/testing', async (req, res) => {
  const user = await User.findOne({email: req.body.email})
})


app.post('/api/user', (req, res) => {
  const user = req.body.user;
  console.log('Adding user:::::', user);
  users.push(user);
  files[user] = []
  res.json("user addedd");
});

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' +file.originalname )
    }
  })
  
var upload = multer({ storage: storage }).array('file')
  
app.get('/',function(req,res){
    return res.send('Hello Server')
})

app.post('/upload',function(req, res) {
  //console.log('Adding user:::::', user);
    console.log(req.body)
    upload(req, res, function (err) {
     
        if (err instanceof multer.MulterError) {
            return res.status(500).json(err)
          // A Multer error occurred when uploading.
        } else if (err) {
            return res.status(501).json(err)
          // An unknown error occurred when uploading.
        } 
        var filenames = req.files.map(function(file) {
          return file.filename; // or file.originalname
        });
        var oldfilenames = req.files.map(function(file) {
          return file.originalname; // or file.originalname
        });
        console.log(filenames)
        console.log(oldfilenames)
        for (z = 0; z < filenames.length; z++) {
          fileMap[oldfilenames[z]] = filenames[z]
          var cmd = "aws s3 cp public/" + filenames[z] + " s3://booshboosh/pipelinedata/" + filenames[z]
          child = exec(cmd,
            function (error, stdout, stderr) {
              console.log('stdout: ' + stdout);
              console.log('stderr: ' + stderr);
              if (error !== null) {
                   console.log('exec error: ' + error);
              }
            });
            try {
              child();
            } catch (error) {
              console.log("finished")
              res.json(outfile)
            }
        }
        console.log(fileMap)
        return res.status(200).send(req.file)
        // Everything went fine.
      })

});

var exec = require('child_process').exec;

app.post('/execute',function(req, res) {
  //executes a pipeline on currently uploaded file\
    console.log("you've made it this far")
    console.log(req.body)
    var cmd = 'bash informatics/run_pipeline.sh'
    outfile = Date.now() + "-out.zip"
    cmd = cmd.concat(" " + outfile)
    for (x = 0; x < req.body.length; x++) {
        cmd = cmd.concat(" ")
        cmd = cmd.concat(fileMap[req.body[x]])
        console.log(cmd)

    }
    child = exec(cmd,
    function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
             console.log('exec error: ' + error);
        }
    });
    try {
      child();
    } catch (error) {
      console.log("finished")
      res.json(outfile)
    }
    
});

/*

IF YOU EVER NEED TO FIX SSL CERT on AWS LINUX 2
https://www.sitepoint.com/how-to-use-ssltls-with-node-js/
https://aws.amazon.com/blogs/compute/extending-amazon-linux-2-with-epel-and-lets-encrypt/

then, use this command:

sudo certbot certonly --nginx --debug -w /var/www/test -d test.net
*/

const httpsServer = https.createServer({
  key: fs.readFileSync('/etc/letsencrypt/live/booshboosh.net/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/booshboosh.net/fullchain.pem'),
  dhparam: fs.readFileSync("/var/www/test/dh-strong.pem")
}, app);

httpsServer.listen(3080, () => {
    console.log('HTTPS Server running on port 3080');
});

/*
const httpServer = http.createServer(app);

httpServer.listen(3080, () => {
    console.log('HTTP Server running on port 3080');
});
*/