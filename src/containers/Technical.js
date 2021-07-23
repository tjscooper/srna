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
        <a href="https://perkinelmer-appliedgenomics.com/home/products/library-preparation-kits/small-rna-library-prep/nextflex-small-rna-seq-kit-v3/" className="App link"> NEXTFLEX<sup>®</sup> Small RNA v3 </a>
        libraries. Currently, it’s compatible with these specific kits in the catalog:
        <br/>
        <br/>
        <table className="App table tab2">
          <tr className="App tr-h">
            <th className="App th">Catalog #</th>
            <th className="App th">Kit Name</th>
          </tr>
          <tr className="App tr">
            <td className="App td">NOVA-5132-05</td>
            <td className="App td">NEXTFLEX<sup>®</sup> Small RNA-Seq Kit v3 (8 barcodes)&nbsp;</td>
          </tr>
          <tr className="App tr">
            <td className="App td">NOVA-5132-06</td>
            <td className="App td">NEXTFLEX<sup>®</sup> Small RNA-Seq Kit v3 (48 barcodes)</td>
          </tr>
          <tr className="App tr">
            <td className="App td">NOVA-5132-08</td>
            <td className="App td">NEXTFLEX<sup>®</sup> Small RNA-Seq Kit v3 for Automation (48 barcodes)</td>
          </tr>
          <tr className="App tr">
            <td className="App td">NOVA-5132-18</td>
            <td className="App td">NEXTFLEX<sup>®</sup> Small RNA-Seq Kit v3 with Unique Dual Index Barcodes  (1–96)&nbsp;&nbsp;&nbsp; for Automation</td>
          </tr>
          <tr className="App tr">
            <td className="App td">NOVA-5132-19</td>
            <td className="App td">NEXTFLEX<sup>®</sup> Small RNA-Seq Kit v3 with Unique Dual Index Barcodes  (97-192)&nbsp; for Automation</td>
          </tr>
          <tr className="App tr">
            <td className="App td">NOVA-5132-20</td>
            <td className="App td">NEXTFLEX<sup>®</sup> Small RNA-Seq Kit v3 with Unique Dual Index Barcodes (193-288) for Automation</td>
          </tr>
          <tr className="App tr">
            <td className="App td">NOVA-5132-21</td>
            <td className="App td">NEXTFLEX<sup>®</sup> Small RNA-Seq Kit v3 with Unique Dual Index Barcodes (289-384) for Automation</td>
          </tr>
          <tr className="App tr">
            <td className="App td">NOVA-5132-22</td>
            <td className="App td">NEXTFLEX<sup>®</sup> Small RNA-Seq Kit v3 with Unique Dual Index Barcodes    (1-48)&nbsp;&nbsp;&nbsp;</td>
          </tr>
          <tr className="App tr">
            <td className="App td">NOVA-5132-23</td>
            <td className="App td">NEXTFLEX<sup>®</sup> Small RNA-Seq Kit v3 with Unique Dual Index Barcodes   (49-96)&nbsp;&nbsp;</td>
          </tr>
          <tr className="App tr">
            <td className="App td">NOVA-5132-24</td>
            <td className="App td">NEXTFLEX<sup>®</sup> Small RNA-Seq Kit v3 with Unique Dual Index Barcodes  (97-144)&nbsp;</td>
          </tr>
          <tr className="App tr">
            <td className="App td">NOVA-5132-25</td>
            <td className="App td">NEXTFLEX<sup>®</sup> Small RNA-Seq Kit v3 with Unique Dual Index Barcodes (145-192)</td>
          </tr>
          <tr className="App tr">
            <td className="App td">NOVA-5132-26</td>
            <td className="App td">NEXTFLEX<sup>®</sup> Small RNA-Seq Kit v3 with Unique Dual Index Barcodes (193-240)</td>
          </tr>
          <tr className="App tr">
            <td className="App td">NOVA-5132-27</td>
            <td className="App td">NEXTFLEX<sup>®</sup> Small RNA-Seq Kit v3 with Unique Dual Index Barcodes (241-288)</td>
          </tr>
          <tr className="App tr">
            <td className="App td">NOVA-5132-28</td>
            <td className="App td">NEXTFLEX<sup>®</sup> Small RNA-Seq Kit v3 with Unique Dual Index Barcodes (289-336)</td>
          </tr>
          <tr className="App tr">
            <td className="App td">NOVA-5132-29</td>
            <td className="App td">NEXTFLEX<sup>®</sup> Small RNA-Seq Kit v3 with Unique Dual Index Barcodes (337-384)</td>
          </tr>
        </table>
        Additionally, this analysis will be updated for compatibility with future NEXTFLEX<sup>®</sup> Small RNA products.
      </p>
      <h3 className="App h3 tab1">Data requirements</h3>
      <p className="App p tab2">
        This analysis requires a single R1 .fastq.gz file per library. 
        These files must be generated from an Illumina<sup>®</sup> sequencing platform. R2 and I1/2 files will not be processed.
        <br/>
        <br/>
        If the files are empty or the files only contain reads that do not align to the reference (like adapter-dimer), 
        then the analysis will only yield trimming and alignment stats. 
        In this scenario the "View Data" button may yield a broken link.
        <br/>
        <br/>
        File names must contain a unique name before the first underscore.
        Files with the same name will allow for analysis execution, 
        but only one file will yield data. 
        If the data is generated from a sequencer with multiple lanes, 
        like an Illumina<sup>®</sup> NovaSeq instrument, 
        consider merging the separated lane .fastq.gz files into one file per library prior to upload. 
        Alternatively, 
        upload the separated lane files and run the analysis multiple times for files only of the same lane.
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
        Uploaded sequencing data is stored for a week before purging. 
        HTML reports and archived data files are stored for up to a month before purging.
        <br/>
        <br/>
        Consider masking the .fastq.gz file names if there is a concern about sample information security.
      </p>
      <h2 className="App h2">Bioinformatics</h2>
      <h3 className="App h3 tab1">Analysis github</h3>
      <p className="App p tab2">
        The analysis pipeline script as imbedded into the API server can be found at this<a href="https://github.com/dfox3/srna_bioinformatics" className="App link"> repo</a>. 
        Feel free to use this analysis locally,
        especially if scale is a concern. 
        As of now, these scripts are not functional outside of the API environment. 
        There will be future efforts strip down the analysis pipeline and package it in an easy-to-install way.
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
        Gathering the insert sizes of reads from a trimmed .fastq.gz is calculated with the custom python 3 script, 
        get_insert_sizes.py. This script only requires default packages to run. 
        Basically, it opens a .fastq.gz file and tallies all the read lengths. The output is saved in a *.inserts.txt file.
      </p>
      <h4 className="App h4 tab2">4. Alignment</h4>
      <p className="App p tab3">
        <a href="http://bowtie-bio.sourceforge.net/bowtie2/index.shtml">Bowtie2</a> version 2.4.4 is used for alignment. 
        This step will likely transition to using the STAR aligner in future versions. 
        <br/>
        <br/>
        Reads are aligned to a human miRNA hairpin reference from 
        <a href="http://mirbase.org/"> miRBase</a>. 
        This reference is used because it allows reads to map to a greater variety of isomiRs and variants. 
        The output is saved in the *.align.txt file. 
      </p>
      <h4 className="App h4 tab2">5. Generating feature counts</h4>
      <p className="App p tab3">
        <a href="http://www.htslib.org/">Samtools</a> version 1.9 is used to convert alignment files into feature counts. 
        This step will likely transition to using Sambamba in future versions.
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
      <h4 className="App h4 tab2">Read profile</h4>
      <p className="App p tab3">
        This is a stacked bar-chart with different read categories plotted as a percentage of total reads y-axis and the sample category on the x-axis. 
        The “trimmed reads” category contain reads removed during the cutadapt step - 
        this can indicate the amount of adapter dimer in the libraries. 
        The “aligned reads” category contain reads that map to the miRNA reference. 
        The “other” category contains reads that are neither trimmed away or aligned - 
        these could be miRNA, other RNA reads, or anything else, but they do not match the reference.
        <br/>
        <br/>
        <img src={require("../assets/sample_profile.jpg")} style={{"min-width": "300px", "width": "100%"}} className="App tech-img"/>
        <br/>
        <br/>
        <br/>
      </p>
      <h4 className="App h4 tab2">Insert sizes</h4>
      <p className="App p tab3">
        This is a grid of histograms for each sample, 
        each displaying the number of reads on the y-axis and the insert sizes on the x-axis. 
        These sizes are of all reads post-trimming and prior to alignment.
        <br/>
        <br/>
        <img src={require("../assets/insert_sizes.jpg")} style={{"min-width": "300px", "width": "100%"}} className="App tech-img"/>
        <br/>
        <br/>
        <br/>
      </p>
      <h4 className="App h4 tab2">Normalized heatmap</h4>
      <p className="App p tab3">
        This is a heatmap where all the reference features are displayed as rows and the samples are displayed as columns. 
        The "heat" is linearly scaled and represents a percentage of total mapped reads.
        <br/>
        <br/>
        <img src={require("../assets/normal_heat.jpg")} style={{"min-width": "300px", "width": "100%"}} className="App tech-img"/>
        <br/>
        <br/>
        <br/>
      </p>
      <h4 className="App h4 tab2">Normalized heatmap with zeroes removed</h4>
      <p className="App p tab3">
        This is a heatmap where the reference features that have at least one count in any of the samples are displayed as rows and the samples are displayed as columns. 
        The "heat" is linearly scaled and represents a percentage of total mapped reads.
        <br/>
        <br/>
        <img src={require("../assets/normal_heat_no_zeroes.jpg")} style={{"min-width": "300px", "width": "100%"}} className="App tech-img"/>
        <br/>
        <br/>
        <br/>
      </p>
      <h3 className="App h3 tab1">Tool installation</h3>
      <p className="App p tab2">
        Almost all tools listed are installed in a Miniconda environment on a Linux OS. 
        Samtools is the only exception, being installed by a series of wget + tar + make commands.
      </p>
      <h1 className="App h1">Support</h1>
      <h3 className="App h3">
      If you need any help with using or interpreting this website, 
      please send an email to 
      <a href="mailto:NGS@perkinelmer.com"> NGS@perkinelmer.com</a>.
      </h3>
      <div className="App short-spacer" />
      <div className="spacer" />
    </div>
  );
}