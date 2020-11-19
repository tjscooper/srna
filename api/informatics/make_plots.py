import os
import sys
import plotly.express as px
import numpy as np
import plotly.graph_objects as go
import argparse
import glob

#-------------------------------------------------------------------------------------------
# arguments for main
parser = argparse.ArgumentParser(description='make plots for srna website')
parser.add_argument('-i',  
    action='store', 
    dest='i',
    required=True,
    type=str,
    help="input directory reports from srna bioinformatics pipeline")
parser.add_argument('-o',  
    action='store', 
    dest='o',
    required=True,
    type=str,
    help="output prefix")
parser.add_argument('-s',  
    action='store', 
    dest='s',
    required=True,
    type=str,
    help="unique identifier")


#-------------------------------------------------------------------------------------------
# global variables for more descriptive code
ALIGN = 0
COUNTS = 1
TRIM = 2
READS_W_ADAPTERS = 0
READS_WRITTEN = 1

#-------------------------------------------------------------------------------------------
# main, serves as pipeline
def main():
	print("Generating plots")
	options = parser.parse_args()
	raw_data = loadData(str(options.i))
	alignPlot(raw_data[ALIGN], str(options.o))
	heatmap(raw_data[COUNTS], str(options.o))
	normalHeatmap(raw_data[COUNTS], str(options.o))
	normalHeatmapNoZeroes(raw_data[COUNTS], str(options.o))
	trimPlot(raw_data[TRIM], str(options.o))
	print("Plots printed")
	print("Conglomerating reports")
	conglomerate(options.o, options.s)
	print("Report Finished")

def conglomerate(directory, code):
	output_name = str(code) + "-report.html"
	html = "<div>\n" + \
				"\t<div style=\"position:fixed; top: 0; z-index:10; font-size:22px; font-family:'Open Sans', verdana, arial, sans-serif; background-color:white\">\n" +\
					"\t\t<a href=\"" + str(output_name) + "#trim\">Trim Stats</a>\n" +\
					"\t\t<a href=\"" + str(output_name) + "#align\">Alignment Rates</a>\n" +\
					"\t\t<a href=\"" + str(output_name) + "#heat\">Heatmaps</a>\n" +\
				"\t</div>\n" + \
				"\t<a id=\"trim\">\n" +\
					"\t\t<div style=\"color:grey; font-size:30px;font-family:'Open Sans', verdana, arial, sans-serif;padding-top: 25px;margin-left: 100px;\">\n" +\
						"\t\t\tTrim Stats\n" +\
					"\t\t</div>\n" +\
				"\t</a>\n"
	html += loadHTMLtoString(str(directory) + "/trim_plot.html")
	html += "\n\t<a id=\"align\">\n" +\
				"\t\t<div style=\"color:grey; font-size:30px;font-family:'Open Sans', verdana, arial, sans-serif;padding-top: 25px;margin-left: 100px;\">\n" +\
					"\t\t\tAlignment Rates\n" +\
				"\t\t</div>\n" +\
			"\t</a>\n"
	html += loadHTMLtoString(str(directory) + "/align_plot.html")
	html += "\n\t<a id=\"heat\">\n" +\
				"\t\t<div style=\"color:grey; font-size:30px;font-family:'Open Sans', verdana, arial, sans-serif;padding-top: 25px;margin-left: 100px;\">\n" +\
					"\t\t\tHeatmaps\n" +\
				"\t\t</div>\n" +\
			"\t</a>\n" +\
			"\t<div style=\"color:darkgreen; font-size:22px;font-family:'Open Sans', verdana, arial, sans-serif;padding-top: 25px;margin-left: 100px;\">\n" +\
				"\t\tRaw Count Heatmap\n" +\
			"\t</div>\n"
	html += loadHTMLtoString(str(directory) + "/heatmap.html")
	html += "\t<div style=\"color:darkgreen; font-size:22px;font-family:'Open Sans', verdana, arial, sans-serif;padding-top: 25px;margin-left: 100px;\">\n" +\
				"\t\tNormalized Heatmap\n" +\
			"\t</div>\n"
	html += loadHTMLtoString(str(directory) + "/normal_heatmap.html")
	html += "\t<div style=\"color:darkgreen; font-size:22px;font-family:'Open Sans', verdana, arial, sans-serif;padding-top: 25px;margin-left: 100px;\">\n" +\
				"\t\tNormalized Heatmap (Zeroes Removed)\n" +\
			"\t</div>\n"
	html += loadHTMLtoString(str(directory) + "/normal_no_zeroes_heatmap.html")
	html += "</div>\n</html>"
	
	with open(str(directory) + "/" + str(output_name), "w") as f:
		f.write(html)

def loadHTMLtoString(i):
	ret_html = ""
	with open(i, 'r') as f:
		for j, line in enumerate(f):
			if j != 0 and line != "</html>":
				ret_html += line
	return ret_html


def trimPlot(data, out_pre):
	k = list(data.keys())
	k.sort()
	y1 = [ data[y][READS_W_ADAPTERS] for y in k ]
	y2 = [ data[y][READS_WRITTEN] for y in k ]
	fig = go.Figure()
	fig.add_trace(go.Histogram(histfunc="sum", y=y1, x=k, name="reads with adapters"))
	fig.add_trace(go.Histogram(histfunc="sum", y=y2, x=k, name="reads written"))

	fig.write_html(str(out_pre) + "/trim_plot.html")

def alignPlot(data, out_pre):
	k = list(data.keys())
	k.sort()
	y = [ data[y] for y in k ]
	fig = go.Figure()
	fig.add_trace(go.Histogram(histfunc="sum", y=y, x=k, name="percent aligned to miR reference"))
	fig.write_html(str(out_pre) + "/align_plot.html")


def heatmap(data, out_pre):
	k = list(data.keys())
	k.sort()
	mir_k = list(data[k[0]].keys())
	mir_k.sort()
	z = [ [ data[y][m]["count"] for y in k ] for m in mir_k ]
	fig = go.Figure(data=go.Heatmap(
	                   z=z,
	                   x=k,
	                   y=mir_k,
	                   hoverongaps = False))
	fig.write_html(str(out_pre) + "/heatmap.html")

def normalHeatmap(data, out_pre):
	k = list(data.keys())
	k.sort()
	mir_k = list(data[k[0]].keys())
	mir_k.sort()
	sums = { y: sum([ data[y][m]["count"] for m in mir_k ]) for y in k }
	z = [ [ (float(data[y][m]["count"]) / float(sums[y]))*100.0 if float(sums[y]) != 0 else 0 for y in k ] for m in mir_k ]
	fig = go.Figure(data=go.Heatmap(
	                   z=z,
	                   x=k,
	                   y=mir_k,
	                   hoverongaps = False))
	fig.write_html(str(out_pre) + "/normal_heatmap.html")

def normalHeatmapNoZeroes(data, out_pre):
	k = list(data.keys())
	k.sort()
	mir_k = list(data[k[0]].keys())
	mir_k.sort()
	sums = { y: sum([ data[y][m]["count"] for m in mir_k ]) for y in k }
	z = [ [ (float(data[y][m]["count"]) / float(sums[y]))*100.0 if float(sums[y]) != 0 else 0 for y in k ] for m in mir_k ]
	zeroed_mir_k = [ m for i, m in enumerate(mir_k) if sum(z[i]) != 0 ]
	zeroed_z = [ [ (float(data[y][m]["count"]) / float(sums[y]))*100.0 if float(sums[y]) != 0 else 0 for y in k ] for m in zeroed_mir_k ]
	fig = go.Figure(data=go.Heatmap(
	                   z=zeroed_z,
	                   x=k,
	                   y=zeroed_mir_k,
	                   hoverongaps = False))
	fig.write_html(str(out_pre) + "/normal_no_zeroes_heatmap.html")

def ScatterPlotReg():
	np.random.seed(1)

	N = 100
	random_x = np.linspace(0, 1, N)
	random_y0 = np.random.randn(N) + 5
	random_y1 = np.random.randn(N)
	random_y2 = np.random.randn(N) - 5

	fig = go.Figure()

	# Add traces
	fig.add_trace(go.Scatter(x=random_x, y=random_y0,
	                    mode='markers',
	                    name='markers'))
	fig.add_trace(go.Scatter(x=random_x, y=random_y1,
	                    mode='lines+markers',
	                    name='lines+markers'))
	fig.add_trace(go.Scatter(x=random_x, y=random_y2,
	                    mode='lines',
	                    name='lines'))

def loadData(directory):
	#load alignment files
	align_data = {}

	for i in glob.glob(str(directory) + "/*.align.txt"):
		sample = i.split("-")[-1].split("_")[0]
		align_data[sample] = 0
		with open(i, 'r') as f:
			for j, line in enumerate(f):
				if j == 5:
					align_data[sample] = float(line.split("%")[0])

	#load counts files
	count_data = {}

	for i in glob.glob(str(directory) + "/*.counts.txt"):
		sample = i.split("-")[-1].split("_")[0]
		count_data[sample] = {}
		with open(i, 'r') as f:
			for line in f:
				if line.split("\t")[0] != "*":
					count_data[sample][line.split("\t")[0]] = { "length": int(line.split("\t")[1]), "count": int(line.split("\t")[2]) }
				else:
					count_data[sample]["unmapped"] = { "length": int(line.split("\t")[1]), "count": int(line.split("\t")[2]) }

	#load trim files
	trim_data = {}

	for i in glob.glob(str(directory) + "/*.trim.txt"):
		sample = i.split("-")[-1].split("_")[0]
		trim_data[sample] = []
		with open(i, 'r') as f:
			for j, line in enumerate(f):
				if j == 8 or j == 9:
					trim_data[sample].append(float(line.split("%")[0].split("(")[-1]))

	return (align_data, count_data, trim_data)



#-------------------------------------------------------------------------------------------
if __name__ == "__main__":
    main()