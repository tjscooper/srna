const express = require('express');
const path = require('path');
const http = require('http');
var https = require('https');
const fs = require('fs');
const { spawn } = require('child_process');

var cors = require('cors');


// serve the API with signed certificate on 443 (SSL/HTTPS) port

const app = express(),
      bodyParser = require("body-parser");
      port = 443;

app.use(cors())
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../my-app/build')));


// serve the API on 80 (HTTP) port
//





app.get('/hello',function(req,res){
  res.send("Hello World!");
});

var exec = require('child_process').exec;

app.post('/add',function(req, res) {
  //add a barcode to dibs\
    console.log("you've made it this far")
    console.log(req.body)
    console.log(req)
    var cmd = "python3 dibs/dib3.py"
    cmd = cmd.concat(" add " + req.body[0] + " " + req.body[1] + " -n " + req.body[2] + ' -r 1 -s 110')
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
      res.send("goodjob")
    } catch (error) {
      console.log("finished")
      res.json(outfile)
    }
    
});


app.post('/delete',function(req, res) {
  //add a barcode to dibs\
    console.log("you've made it this far")
    console.log(req.body)
    console.log(req)
    var cmd = "python3 dibs/dib3.py"
    cmd = cmd.concat(" delete " + req.body[0] + " " + req.body[1] + " -n " + req.body[2] + ' -r 1 -s 110')
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
      res.send("goodjob")
    } catch (error) {
      console.log("finished")
      res.json(outfile)
    }
    
});

app.get('/fullview',function(req,res) {
  //executes a pipeline on currently uploaded file\

    var cmd = "python3 dibs/dib3.py full_view"
    child = spawn('python3', ['dibs/dib3.py', 'full_view']
    function (error, stdout, stderr) {
        python.stdout.on('data', (data) => {
        console.log('pattern: ', data.toString());
        });

        python.stderr.on('data', (data) => {
        console.error('err: ', data.toString());
        });

        python.on('error', (error) => {
        console.error('error: ', error.message);
        });

        python.on('close', (code) => {
        console.log('child process exited with code ', code);
        });
    });
    try {
      child();
      res.send("goodjob")
    } catch (error) {
      console.log("finished")
    }
    
});
/*

app.get('/fullview',function(req,res) {
  //executes a pipeline on currently uploaded file\

    var cmd = "python3 dibs/dib3.py full_view"
    child = spawn('python3', ['dibs/dib3.py
    function (error, stdout, stderr) {
        if (error) {
          console.log('exec error: ' + error.message);
          return;
        }
        if(stderr) {
          console.log('stderr:' + stderr);
          return;
        }
        console.log('stdout: ' + stdout);
        return stdout
    });
    try {
      child();
      res.send("goodjob")
    } catch (error) {
      console.log("finished")
    }
    
});

-Install cutadapt and samtools and bowtie2:
scp -i 2020DYLANDO.pem Downloads/Miniconda3-latest-Linux-x86_64.sh ec2-user@ec2-52-41-194-224.us-west-2.compute.amazonaws.com:
bash Miniconda3-latest-Linux-x86_64.sh
miniconda3/bin/conda config --add channels bioconda
miniconda3/bin/conda config --add channels conda-forge
miniconda3/bin/conda install bowtie2
miniconda3/bin/conda install cutadapt
miniconda3/bin/conda install plotly
sudo miniconda3/bin/conda install plotly
miniconda3/bin/conda install pandas
sudo miniconda3/bin/conda install pandas
miniconda3/bin/conda install scipy
sudo miniconda3/bin/conda install scipy
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
  key: fs.readFileSync('/etc/letsencrypt/live/dibsbase.net/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/dibsbase.net/fullchain.pem'),
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