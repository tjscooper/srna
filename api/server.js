const express = require('express');
const path = require('path');

const http = require('http');
var https = require('https');
const fs = require('fs');
var aws = require('aws-sdk');
var s3Proxy = require('s3-proxy');

// serve the API with signed certificate on 443 (SSL/HTTPS) port

const app = express(),
      bodyParser = require("body-parser");
      port = 443;



// serve the API on 80 (HTTP) port
//


function retrieveConfig(){
  fs.readFile(path.resolve(__dirname, './../../config.json'), function (err, data) {
    var fff = JSON.stringify(eval("(" + data + ")"));
    var ffff = JSON.parse(fff);
    console.log("hello\n")
    for (var i in ffff){

      console.log(i)
      

    }
    return ffff
});}


var multer = require('multer')
var multerS3 = require('multer-s3');
var cors = require('cors');
app.use(cors())

// place holder for the data
const users = [];
var outfile = "";
const files = {}
var fileMap = {}
const current_user = "public"
var config2 = retrieveConfig()


for (var i in config2)
  console.log(i)

aws.config.loadFromPath('./../../config.json');
var s3 = new aws.S3();
for (var i in aws.config.credentials)
  console.log(i)

for (var i in config2)
  console.log(i)

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

app.get('/dloading/:file_name',(req,res)=>{
  retrieveFile(req.params.file_name, res);
});
console.log(aws.config.credentials.secretAccessKey.substring(1, 4))

var s4 = express();
s4.get('/*', s3Proxy({
  bucket: 'booshboosh',
  accessKeyId: aws.config.credentials.accessKeyId,
  secretAccessKey: aws.config.credentials.secretAccessKey,
  region: "us-east-1",
  overrideCacheControl: 'max-age=100000'
}));
app.use('/boosh/', s4);

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

//The retrieveFile function
function retrieveFile(filename,res){

  const getParams = {
    Bucket: 'booshboosh/pipelinedata',
    Key: filename
  };

  s3.getObject(getParams, function(err, data) {
    if (err){
      console.log(filename)
      return res.status(400).send({success:false,err:err});
    }
    else{
      console.log(data.Body)
      return res.send(data.Body);
    }
  });
}


var storages3 = multerS3({
      s3: s3,
      bucket: 'booshboosh',
      key: function (req, file, cb) {
          console.log(file);
          cb(null, "pipelinedata/" + Date.now() + '-' +file.originalname ); //use Date.now() for unique file keys
      }
  })
  

//change "storages3" to "storage" if you want to store local. here i am storing with an s3 bucket
var upload = multer({ storage: storages3 }).array('file')
  
app.get('/',function(req,res){
    return res.send('Hello Server')
})


app.post('/upload', function (req, res, next) { 
  upload(req, res, function (err){
     
        if (err instanceof multer.MulterError) {
            return res.status(500).json(err)
          // A Multer error occurred when uploading.
        } else if (err) {
            return res.status(501).json(err)
          // An unknown error occurred when uploading.
        } 
        var filenames = req.files.map(function(file) {
          return file.key; // or file.originalname
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

/*

/// this is if you upload locally instead of to an S3
 

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

        var cmd2 = "bash informatics/store_files.sh "
        for (z = 0; z < filenames.length; z++) {
          fileMap[oldfilenames[z]] = filenames[z]
          cmd2 = cmd2.concat(" " + filenames[z])
        }
        child2 = exec(cmd2,
          function (error, stdout, stderr) {
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            if (error !== null) {
                 console.log('exec error: ' + error);
            }
          });
          try {
            child2();
          } catch (error) {
            console.log("finished upload")
          }
        console.log(fileMap)
        return res.status(200).send(req.file)
        // Everything went fine.
      })

});
*/
var exec = require('child_process').exec;

app.post('/execute',function(req, res) {
  //executes a pipeline on currently uploaded file\
    console.log("you've made it this far")
    console.log(req.body)
    var cmd = "screen -S qqqq -X stuff \"bash informatics/q.sh"
    outfile = Date.now() + "-out.zip"
    cmd = cmd.concat(" " + outfile)
    for (x = 0; x < req.body.length; x++) {
        cmd = cmd.concat(" ")
        cmd = cmd.concat(fileMap[req.body[x]])
        console.log(cmd)

    }
    cmd = cmd.concat("^M\"")
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

-Install cutadapt and samtools and bowtie2:
scp -i 2020DYLANDO.pem Downloads/Miniconda3-latest-Linux-x86_64.sh ec2-user@ec2-52-41-194-224.us-west-2.compute.amazonaws.com:
bash Miniconda3-latest-Linux-x86_64.sh
miniconda3/bin/conda config --add channels bioconda
miniconda3/bin/conda config --add channels conda-forge
miniconda3/bin/conda install bowtie2
miniconda3/bin/conda install cutadapt
rm miniconda3/pkgs/*.bz2
sudo yum group install "Development Tools"
sudo yum install ncurses-devel bzip2-devel xz-devel
cd
wget https://github.com/samtools/samtools/releases/download/1.9/samtools-1.9.tar.bz2
tar xvjf samtools-1.9.tar.bz2
cd samtools-1.9
./configure --prefix=/usr/local
make
sudo make install
cd
sudo yum install emacs
sudo chmod +x srna/api/informatics/reset_jsons.sh

***
CREATING AWS KEY AND SECRET
in the AIM console, go to the the Security credentials of developer1
add a new key and keep track of the key and secret

in the ec2 terminal
cd
aws configure
fill out the info
1. access key
2. secret
3. region -> us-west-2
4. type -> json

then

emacs config.json
{ "accessKeyId": <YOUR_ACCESS_KEY_ID>, "secretAccessKey": <YOUR_SECRET_ACCESS_KEY>, "region": "us-east-1" }
ctrl-x ctrl-s ctrl-x ctrl-c



***
IF YOU EVER NEED TO FIX SSL CERT on AWS LINUX 2
for helmet: https://www.sitepoint.com/how-to-use-ssltls-with-node-js/
https://aws.amazon.com/blogs/compute/extending-amazon-linux-2-with-epel-and-lets-encrypt/
***

-first, update IP on google domains DNS settings
-then, use these commands:
sudo mkdir /var/www/test
sudo openssl dhparam -out /var/www/test/dh-strong.pem 2048
sudo wget -r --no-parent -A 'epel-release-*.rpm' http://dl.fedoraproject.org/pub/epel/7/x86_64/Packages/e/
sudo rpm -Uvh dl.fedoraproject.org/pub/epel/7/x86_64/Packages/e/epel-release-*.rpm
sudo yum-config-manager --enable epel*
sudo yum install -y python-certbot-nginx

sudo certbot certonly --nginx --debug -w /var/www/test -d test.net
cd ~/srna/api
mkdir reports
mkdir public
mkdir public/json
echo '{ "key1": "value1", "key2": "value2", "key3": "value3" }' > public/json/pipeline_status.json
sudo npm run dev
*/

const httpsServer = https.createServer({
  key: fs.readFileSync('/etc/letsencrypt/live/booshboosh.net/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/booshboosh.net/fullchain.pem'),
  dhparam: fs.readFileSync("/var/www/test/dh-strong.pem")
}, app);

httpsServer.listen(443, () => {
    console.log('HTTPS Server running on port 443');
});

/*
const httpServer = http.createServer(app);

httpServer.listen(3080, () => {
    console.log('HTTP Server running on port 3080');
});
*/