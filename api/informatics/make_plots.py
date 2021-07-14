import os
import sys
import plotly.express as px
import numpy as np
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import plotly.figure_factory as ff
import argparse
import glob
from collections import defaultdict 
from math import sqrt
from math import floor
from math import ceil

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
INSERTS = 3
READS_W_ADAPTERS = 0
READS_WRITTEN = 1
COLORSCALE = [
        [0, 'rgb(7, 0, 77)'],        #0
        [1./10000, 'rgb(76, 0, 112)'], #10
        [1./1000, 'rgb(148, 0, 109)'],  #100
        [1./100, 'rgb(183, 0, 28)'],   #1000
        [1./10, 'rgb(219, 93, 0)'],       #10000
        [1., 'rgb(252, 255, 0)'],             #100000

    ],

#-------------------------------------------------------------------------------------------
# main, serves as pipeline
def main():
	print("Generating plots")
	options = parser.parse_args()
	raw_data = loadData(str(options.i))
	alignPlot(raw_data[ALIGN], str(options.o))
	sizeDistributionBarPlot(raw_data[COUNTS], str(options.o))
	sizeDistributionBarPlot2(raw_data[INSERTS], str(options.o))
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
	report_name   = str(code).split('-')
	html = "<link rel=\"stylesheet\" href=\"App.css\">\n" + \
			"<link href=\"https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Lobster&display=swap\" rel=\"stylesheet\">\n" + \
			"<link rel=\'icon\' type=\'image/png\' href=\"https://booshboosh.net/boosh/pipelinedata/icon_darkgrey.png\">\n" +\
			"<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\"><style id=\"plotly.js-style-global\"></style>\n" +\
			"<style id=\"plotly.js-style-modebar-4e8501\"></style><style id=\"plotly.js-style-modebar-948b1e\"></style><style " +\
			"id=\"plotly.js-style-modebar-948b1e\"></style><style id=\"plotly.js-style-modebar-0cabb2\"></style><style" +\
			" id=\"plotly.js-style-modebar-32981d\"></style><title>NEXTFLEX® Report #" + str(report_name[0]) + "</title></head><body style=\"padding:0px; margin:0px;\"><div>\n" +\
			"<div class=\"navbar-default\">\n" + \
			"\t<div class=\"container-fluid\">\n" +\
			"\t\t<div class=\"navbar-header\">\n" +\
			"\t<span class=\"navbar-brand\">\n" +\
			"\t<a target =\"_blank\" rel =\"noopener noreferrer\" href=\"https://perkinelmer-appliedgenomics.com/\">\n" +\
				"\t\t<div class=\"logo\"></div></a>\n" +\
				"\t<div style=\"width: 50px;\"></div>\n" +\
				"\t<a class=\"h2-b\" href=\"" + str(output_name) + "#trim\">Trim Stats</a>\n" +\
				"\t<div style=\"width: 50px;\"></div>\n" +\
				"\t<a class=\"h2-b\" href=\"" + str(output_name) + "#align\">Alignment Rates</a>\n" +\
				"\t<div style=\"width: 50px;\"></div>\n" +\
				"\t<a class=\"h2-b\" href=\"" + str(output_name) + "#sizes\">Size Distributions</a>\n" +\
				"\t<div style=\"width: 50px;\"></div>\n" +\
				"\t<a class=\"h2-b\" href=\"" + str(output_name) + "#heat\">Heatmaps</a>\n" +\
				"\t</span>\n" +\
				"\t</div>\n" +\
				"\t</div>\n" + \
				"\t</div>\n" +\
				"\t<a id=\"trim\">\n" +\
					"\t\t<div class=\"graph-h1\">\n" +\
						"\t\t\tTrim Stats\n" +\
					"\t\t</div>\n" +\
				"\t</a>\n"
	html += loadHTMLtoString(str(directory) + "/trim_plot.html")
	html += "\n\t<a id=\"align\">\n" +\
				"\t\t<div class=\"graph-h1\">\n" +\
					"\t\t\tAlignment Rates\n" +\
				"\t\t</div>\n" +\
			"\t</a>\n"
	html += loadHTMLtoString(str(directory) + "/align_plot.html")
	html += "\n\t<a id=\"sizes\">\n" +\
				"\t\t<div class=\"graph-h1\">\n" +\
					"\t\t\tSize Distribution\n" +\
				"\t\t</div>\n" +\
			"\t</a>\n"
	html += "\t<div class=\"graph-h2\">\n" +\
				"\t\tSize Distribution Histogram Grid\n" +\
			"\t</div>\n"
	html += loadHTMLtoString(str(directory) + "/size_bar_grid_plot2.html")
	'''
	html += "\t<div style=\"color:darkgreen; font-size:22px;font-family:'Open Sans', verdana, arial, sans-serif;padding-top: 25px;margin-left: 100px;\">\n" +\
				"\t\tSize Distribution Violin Plots\n" +\
			"\t</div>\n"
	
	html += loadHTMLtoString(str(directory) + "/size_violin_plot.html")
	html += "\t<div style=\"color:darkgreen; font-size:22px;font-family:'Open Sans', verdana, arial, sans-serif;padding-top: 25px;margin-left: 100px;\">\n" +\
				"\t\tSize Distribution Line and Rug Plot\n" +\
			"\t</div>\n"
	html += loadHTMLtoString(str(directory) + "/size_dist_plot.html")
	'''
	html += "\n\t<a id=\"heat\">\n" +\
				"\t\t<div class=\"graph-h1\">\n" +\
					"\t\t\tHeatmaps\n" +\
				"\t\t</div>\n" +\
			"\t</a>\n"
	html += "\t<div class=\"graph-h2\">\n" +\
				"\t\tNormalized Heatmap\n" +\
			"\t</div>\n"
	html += loadHTMLtoString(str(directory) + "/normal_heatmap.html")
	html += "\t<div class=\"graph-h2\">\n" +\
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
	fig.add_trace(go.Histogram(histfunc="sum", y=y2, x=k, name="reads written"))
	fig.update_xaxes(title_text='File Name')
	fig.update_yaxes(title_text='Percent Reads Trimmed')

	fig.write_html(str(out_pre) + "/trim_plot.html")

def alignPlot(data, out_pre):
	k = list(data.keys())
	k.sort()
	y = [ data[y] for y in k ]
	fig = go.Figure()
	fig.add_trace(go.Histogram(histfunc="sum", y=y, x=k, name="percent aligned to miR reference"))
	fig.update_xaxes(title_text='File Name')
	fig.update_yaxes(title_text='Percent Reads Aligned')
	fig.write_html(str(out_pre) + "/align_plot.html")

def sizeDistributionBarPlot(data, out_pre):
	all_sizes = []
	dist_data = []
	k = list(data.keys())
	k.sort()
	fig = go.Figure()
	fig3 = go.Figure()
	for sample in k:
		sizes = defaultdict(int)
		for d in data[sample]:
			sizes[data[sample][d]["length"]] += data[sample][d]["count"]
		s = list(sizes.keys())
		all_sizes = all_sizes + s
		s.sort()
		c = [ sizes[size] for size in s ]

		s2 = []
		k2 = []
		for i, s1 in enumerate(s):
			for n in range(c[i]):
				s2.append(s1)
				k2.append(sample)
		dist_data.append(s2)
		fig.add_trace(go.Histogram(histfunc="sum", y=c, x=s, name=sample, xbins=dict(start=min(s), end=max(s), size=1)))
		fig.update_xaxes(title_text='Insert Size')
		fig.update_yaxes(title_text='Number of Counts')
		fig3.add_trace(go.Violin(y=s2, x=k2, name=sample, box_visible=True, meanline_visible=True))

	fig.update_layout(
	    bargap=0.01, # gap between bars of adjacent location coordinates
	    bargroupgap=0.0 # gap between bars of the same location coordinates
	)
	fig.write_html(str(out_pre) + "/size_bar_plot.html")
	
	'''
	fig3.write_html(str(out_pre) + "/size_violin_plot.html")
	
	fig4 = ff.create_distplot(dist_data, k, show_hist=False)
	fig5 = ff.create_distplot(dist_data, k)
	fig4.write_html(str(out_pre) + "/size_dist_plot.html")
	fig5.write_html(str(out_pre) + "/size_distbars_plot.html")
	'''
	min_size = min(all_sizes)
	max_size = max(all_sizes)
	grid = getGrid(len(k))
	fig2 = make_subplots(rows=grid[0], cols=grid[1])
	count = 0
	for g in range(grid[0]):
		for r in range(grid[1]): 
			for d in data[k[count]]:
				sizes[data[k[count]][d]["length"]] += data[k[count]][d]["count"]
			s = list(sizes.keys())
			s.sort()
			c = [ sizes[size] for size in s ]
			fig2.append_trace(go.Histogram(histfunc="sum", y=c, x=s, name=sample, xbins=dict(start=min_size, end=max_size, size=1)), g+1, r+1)
			fig2.update_xaxes(title_text='Insert Size')
			fig2.update_yaxes(title_text='Number of Counts')
			count+=1
	fig2.write_html(str(out_pre) + "/size_bar_grid_plot.html")

def sizeDistributionBarPlot2(data, out_pre):
	all_sizes = []
	samples = list(data.keys())
	samples.sort()

	for s in samples:
		all_sizes += [int(x) for x in data[s]]

	min_size = min(all_sizes)
	max_size = max(all_sizes)
	grid = getGrid(len(samples))
	fig2 = make_subplots(rows=grid[0], cols=grid[1])
	count = 0
	for g in range(grid[0]):
		for r in range(grid[1]): 
			s = list(data[samples[count]].keys())
			s.sort()
			c = [ int(data[samples[count]][size]) for size in s ]
			s = [int(x) for x in s]
			fig2.append_trace(go.Histogram(histfunc="sum", y=c, x=s, name=samples[count], xbins=dict(start=min_size, end=max_size, size=1)), g+1, r+1)
			fig2.update_xaxes(title_text='Insert Size')
			fig2.update_yaxes(title_text='Number of Counts')
			count+=1
	fig2.write_html(str(out_pre) + "/size_bar_grid_plot2.html")



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
	                   hoverongaps = False,
	                   colorscale=COLORSCALE[0],
	                   ))
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
	                   hoverongaps = False,
	                   colorscale=COLORSCALE[0],
	                   ))
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
	                   hoverongaps = False,
	                   colorscale=COLORSCALE[0],
	                   ))
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
		sample = "-".join(i.split("-")[1:]).split("_")[0]
		align_data[sample] = 0
		with open(i, 'r') as f:
			for j, line in enumerate(f):
				if j == 5:
					align_data[sample] = float(line.split("%")[0])

	#load counts files
	count_data = {}

	for i in glob.glob(str(directory) + "/*.counts.txt"):
		sample = "-".join(i.split("-")[1:]).split("_")[0]
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
		sample = "-".join(i.split("-")[1:]).split("_")[0]
		trim_data[sample] = []
		with open(i, 'r') as f:
			for j, line in enumerate(f):
				if j == 8:
					trim_data[sample].append(float(line.split("%")[0].split("(")[-1]))

	insert_data = {}
	for i in glob.glob(str(directory) + "/*.inserts.txt"):
		sample = "-".join(i.split("-")[1:]).split("_")[0]
		insert_data[sample] = {}
		with open(i, 'r') as f:
			for j, line in enumerate(f):
				fields = line.split("\t")
				if len(fields) != 0:
					insert_data[sample][fields[0]] = fields[1]

	return (align_data, count_data, trim_data, insert_data)

def getGrid(k):
	rows = floor(sqrt(k))
	columns = ceil(k / rows)
	return (int(rows), int(columns))

#-------------------------------------------------------------------------------------------
if __name__ == "__main__":
    main()