import React, { useState } from "react";
import { Button, FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import "./../App.css";

export default function Technical() {

  return (
    <div className="App container">
      <h1 className="App h1">Technical information</h1>
      <h2 className="App h2">Kits and data</h2>
      <h3 className="App h3 tab1">Kits compatible</h3>
      <p className="App p tab2">
        This analysis is compatible with 
        <a href="https://perkinelmer-appliedgenomics.com/home/products/library-preparation-kits/small-rna-library-prep/nextflex-small-rna-seq-kit-v3/" className="App link"> NEXTFLEX Small RNA v3 </a>
        libraries. This analysis will be updated to be compatible with future NEXTFLEX Small RNA products.
      </p>
      <h3 className="App h3 tab1">Data requirements</h3>
      <p className="App p tab2">
        This analysis requires a single R1.fastq.gz file per library. 
        These files must be generated from an Illumina sequencing platform. R2 and I1/2 files will not be processed.
        <br/>
        <br/>
        If the files are empty, 
        or the files contain only reads that do not align to the reference (like adapter-dimer), 
        then the analysis will only yield trimming and alignment stats. In this scenario the "View Data" button will yield a broken link.
        <br/>
        <br/>
        File names must contain a unique name before the first underscore.
        Files with the same name will allow for analysis execution, 
        but only one file will yield data. 
        If the data is generated from a sequencer with multiple lanes, 
        like a NovaSeq, 
        consider merging the separated lane fastq.gz files into one file per library prior to upload. 
        Alternatively, 
        upload the separated lane files and run the analysis multiple time for files only of the same lane.
        <br/>
        <br/>
        The maximum file upload size is 2gb. 
        This tool will not work for files larger than 2gb. 
        If no files are larger than 2gb, 
        but the set of files being uploaded is greater than 2gb,
        upload the files in smaller sets.
      </p>
      <h3 className="App h3 tab1">Data storage</h3>
      <p className="App p tab2">
        Because there isn't any account information required to use this website, 
        data will be deleted after a set period of time. 
        Uploaded sequence data is stored for a week before purging. 
        HTML reports and archived data files are stored for 2 weeks before purging.
        <br/>
        <br/>
        Consider masking the .fastq.gz file names if there is a concern about sample information security.
      </p>
      <h2 className="App h2">Bioinformatics</h2>
      <h3 className="App h3 tab1">Analysis github</h3>
      <p className="App p tab2">
        Script as imbedded into the API server can be found at this<a href="https://github.com/dfox3/srna_bioinformatics" className="App link"> repo</a>. 
        Feel free to use this analysis locally,
        especially if scale is a concern.
      </p>

      <h3 className="App h3 tab1">Pipeline steps</h3>
      <h4 className="App h4 tab2">1. Adding to queue</h4>
      <p className="App p tab3">
        Although,
        the website and API are asynchronous,
        the pipeline is synchronous,
        which means there needs to be a queue for the analysis. 
        The queue is first-in-first-out and is handled in bash with "screen" commands.
      </p>
      <h4 className="App h4 tab2">2. Trimming</h4>
      <p className="App p tab3">
        Trimming is done with <a href="https://cutadapt.readthedocs.io/en/stable/" className="App link"> Cutadapt </a> (version 3.0).
        <br/>
        <br/>
        The cutadapt command is configured with -a, 
        -u, 
        -m, 
             
      </p>

      <h3 className="App h3 tab1">Tool installation</h3>
      <p className="App p tab2">
        Almost all tools listed are installed with a Miniconda environment in a Linux OS. 
        Samtools is the only exception,
        being installed by a series of wget + tar + make commands.
      </p>




    </div>
  );
}