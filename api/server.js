const express = require('express');
const path = require('path');

const http = require('http');
var https = require('https');
const fs = require('fs');

// serve the API with signed certificate on 443 (SSL/HTTPS) port

const app = express(),
      bodyParser = require("body-parser");
      port = 3080;


const httpsServer = https.createServer({
  key: fs.readFileSync('/etc/letsencrypt/live/booshboosh.net/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/booshboosh.net/fullchain.pem'),
  dhparam: fs.readFileSync("/var/www/test/dh-strong.pem")
}, app);



// serve the API on 80 (HTTP) port
const httpServer = http.createServer(app);



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


httpsServer.listen(443, () => {
    console.log('HTTPS Server running on port 443');
});


//httpServer.listen(80, () => {
//    console.log('HTTP Server running on port 80');
//});
