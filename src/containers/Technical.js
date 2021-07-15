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
        libraries. The analysis is current compatible with these SKUs:
        <p className="App p tab2">
        <br/>
        NOVA-5132-05
        <br/>
        NOVA-5132-06
        <br/>
        5132-18
        <br/>
        5132-19
        <br/>
        </p>
        Additionally, this analysis will be updated for compatibility with future NEXTFLEX Small RNA products.
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
        HTML reports and archived data files are stored for up to a month before purging.
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
        At the moment, these script are not functional outside of the API environment. 
        There will be future efforts strip down this analysis and package it in an easy-to-install way.
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
        Trimming is done with <a href="https://cutadapt.readthedocs.io/en/stable/" className="App link"> Cutadapt </a> (version 3.4).
        <br/>
        <br/>
        The cutadapt commands are configured with -a, -u, and -m in order to remove adapter sequences, random bases added during library prep, and reads that are too short to align. 
        Two cutadapt commands are used because the -u commands always goes first, but it isn't meaningful for this analysis until after the adapters are trimmed away with the -a command. 
        <br/>
        <br/>
        The first cutadapt command uses "-a TGGAATTCTCGGGTGCCAAGG", which will remove any matches to this adapter sequence and any NTs following the match. 
        The output from the first round of cutadapt is saved in the *.trim.txt file. 
        <br/>
        <br/>
        The second cutadapt command uses "-u 4 -u -4 -m 15" which will first remove the first four and last four bases of the adapter-trimmed reads which contain random bases added during library prep. 
        It will then remove all remaining sequences that have fewer than 15 bases. 
        The output from the second round of cutadapt is saved in the *.trim2.txt file.          
      </p>
      <h4 className="App h4 tab2">3. Calculating insert sizes</h4>
      <p className="App p tab3">
        Gathering the insert sizes of reads from a trimmed fastq.gz is calculated with the custom python 3 script, get_insert_sizes.py. 
        This script only requires default packages to run. 
        It basically opens up a fastq.gz file and tallies all the read lengths. 
        Output is saved in a *.inserts.txt file.
      </p>
      <h4 className="App h4 tab2">4. Alignment</h4>
      <p className="App p tab3">
        <a href="http://bowtie-bio.sourceforge.net/bowtie2/index.shtml">Bowtie2</a> version 2.4.4 is used for alignment. 
        This analysis will likely transition to the STAR aligner in future version. 
        <br/>
        <br/>
        Reads are aligned to a human miRNA hairpin reference from 
        <a href="http://mirbase.org/">miRBase</a>. 
        This reference is used because it allows reads to map to a greater variety of isomirs and variants. 
        The output is saved in the *.align.txt file. 
      </p>
      <h4 className="App h4 tab2">5. Generating feature counts</h4>
      <p className="App p tab3">
        <a href="http://www.htslib.org/">Samtools</a> version 1.9 is used to convert alignment files into feature counts. 
        This step will likely stransition to Sambamba in future versions.
        <br/>
        <br/>
        First, the human-readable alignment file (.sam) file is converted to a binary alignment file (.bam) by using's Samtools' view command. 
        Then the .bam file is sorted by the Samtools' sort command. 
        Next, the sorted .bam is indexed by the Samtools' index command. This also creates an index file (.bai). 
        Lastly, feature counts (number of reads mapping to each reference feature) are generated with Samtools' idxstats command. 
        The counts data is saved in the *.counts.txt file. 
      </p>
      <h4 className="App h4 tab2">5. Generating plots</h4>
      <p className="App p tab3">
        Plots are made with the custom python 3 script, make_plots.py, which uses the plot.ly package. 
        All plots are printed as html, and a wrapping html is also generated.
      </p>
      <h3 className="App h3 tab1">Plots</h3>
      <h4 className="App h4 tab2">Trim stats</h4>
      <p className="App p tab3">
        Histogram with the percentage of reads that had adapters trimmed plotted on the y-axis and the sample category on the x-axis.
        <br/>
        <img src={require("../assets/trim_stats.jpg")} style={{"min-width": "300px", "width": "100%"}}/>
      </p>
      <h4 className="App h4 tab2">Alignment stats</h4>
      <p className="App p tab3">
        Histogram with the percentage of reads that map to the reference on the y-axis and the sample category on the x-axis.
        <br/>
        <img src={require("../assets/align_stats.jpg")} style={{"min-width": "300px", "width": "100%"}}/>
      </p>
      <h4 className="App h4 tab2">Insert sizes</h4>
      <p className="App p tab3">
        A grid with histograms for each sample with the number of reads is on the y-axis and the insert sized is on the x-axis.
        These are sizes of all reads post-trimming and prior to alignment. 
        <br/>
        <img src={require("../assets/insert_sizes.jpg")} style={{"min-width": "300px", "width": "100%"}}/>
      </p>
      <h4 className="App h4 tab2">Normalized heatmap</h4>
      <p className="App p tab3">
        A heatmap where all the reference features are displayed as rows and the samples are displayed as columns. 
        The "heat" is linearly scaled and represents a percentage of reads mapped.
        <br/>
        <img src={require("../assets/normal_heat.jpg")} style={{"min-width": "300px", "width": "100%"}}/>
      </p>
      <h4 className="App h4 tab2">Normalized heatmap with zeroes removed</h4>
      <p className="App p tab3">
        A heatmap where the reference features that have at least one count in any of the samples are displayed as rows and the samples are displayed as columns. 
        The "heat" is linearly scaled and represents a percentage of reads mapped.
        <br/>
        <img src={require("../assets/normal_heat_no_zeroes.jpg")} style={{"min-width": "300px", "width": "100%"}}/>
      </p>
      <h3 className="App h3 tab1">Tool installation</h3>
      <p className="App p tab2">
        Almost all tools listed are installed with a Miniconda environment in a Linux OS. 
        Samtools is the only exception,
        being installed by a series of wget + tar + make commands.
      </p>
      <h1 className="App h1">Support</h1>
      <h3 className="App h3">
      If you need any help with using or interpreting this website, 
      please send and email to 
      <a href="mailto:NGS@perkinelmer.com"> NGS@perkinelmer.com</a>.
      </h3>
      <div className="App short-spacer" />
      <div className="spacer" />
    </div>
  );
}