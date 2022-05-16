// Data retrieved via WorldBank API. All data from the source is used for educational purposes on my part.
// In this project I attempt to build a chart using two-tier bars for two different groups.


// Width and paddingH values correspond to % to make the chart responsive

var height = 600, paddingV = 50, width = 100, paddingH = 10;

var svg = d3.select("#graphContainer")
      .append("svg")
      .style("width", width + "%")
      .style("height", height + paddingV * 2 + "px");

var interval;
var start_date;
var end_date;
var graphDomain;
var redo = false;

function createGraph() {
    var mysvg = document.querySelectorAll("svg")[0];
    mysvg.remove();
    var viewWidth = window.outerWidth;
    var svg = d3.select("#graphContainer")
      .append("svg")
      .style("width", width + "%")
      .style("height", height + paddingV * 2 + "px");
    
    var xScale =  d3.scaleTime()
        .domain(graphDomain)
        .range([paddingH * viewWidth/width, viewWidth * (1 - paddingH/width)]);

    var x = d3.axisBottom(xScale).tickSizeOuter(0);
    svg.append("g")
     .attr("transform", `translate(0, ${height + paddingV})`)
     .attr("id", "x-axis")
     .call(x);

    d3.select("#x-axis").select(".domain")
     .attr("stroke","#853300")
     .attr("stroke-width","2");
    
    var yScale =  d3.scaleLinear()
        .domain([d3.min(dataset.mic.gdp), d3.max(dataset.mic.gdp)])
        .nice()
        .range([height + paddingV, paddingV]);
    
    var y = d3.axisLeft(yScale).tickFormat(d3.format("~e"));
    svg.append("g")
    .attr("transform", `translate(${paddingH * viewWidth/width}, 0)`)
    .attr("id", "y-axis")
    .call(y);

    d3.select("#y-axis").select(".domain")
    .attr("stroke","#853300")
    .attr("stroke-width","2");
    
   svg.append("text")
        .attr("x", viewWidth * paddingH/(1.75*width))
        .attr("y", 32)
        .text("($)");
  
    // Introducing a factor, f1 and f2 (for respective groups), to widen or narrow the bars. Change their values between 1 and 2 to see the effect. Use of width_seleted variable to capture the change in value of window width and translate its effect to the graph.
        var f1 = 1.2, f2 = 1.5, width_selected = viewWidth * (1 - 2 * paddingH/width);
        
    svg.selectAll("rect")
        .data((dataset.hic.gdp).concat(dataset.mic.gdp))
        .join("rect")
        .attr("class", function(d, i) {
        if(i < (dataset.hic.gdp).length) {
            return "hic-bar";
        } else {
            return "mic-bar";
        }
        })
        .attr("x", function(d, i) {
        if(i < (dataset.hic.gdp).length) {
            return xScale(dataset.hic.years[i]) - (width_selected)/(f1 * 2 * dataset.hic.gdp.length);
        } else {
            return xScale(dataset.mic.years[i - (dataset.mic.gdp).length]) - (2*f1 - f2) * (width_selected)/(2 * dataset.mic.gdp.length * f1 * f2);
        }
        })
        .attr("y", function(d, i){return yScale(d)})
        .attr("height", function(d, i) {return height - yScale(d) + paddingV})
        .attr("width", function(d, i) {
        
        if(i < (dataset.hic.gdp).length) {
            return (width_selected)/(f1 * dataset.hic.gdp.length);
        } else {
            return (width_selected)/(f2 * dataset.mic.gdp.length);
        }
        })
        .attr("fill", function(d, i) {
        if(i < (dataset.hic.gdp).length) {
            return "#32a852";
        } else {
            return "#236391";
        }
        })
        .on("mouseover", function(d, i) {
        svg.append("g")
            .attr("id", "info-tooltip")
            .append("path")
            .attr("d", `M${width_selected/6.5} 50 H${width_selected/6.5 + 170} Q ${width_selected/6.5 + 180} 50 ${width_selected/6.5 + 180} 60 V110 Q ${width_selected/6.5 + 180} 120 ${width_selected/6.5 + 170} 120 H${width_selected/6.5 + 10} Q ${width_selected/6.5} 120 ${width_selected/6.5} 110 Z`)
            .attr("stroke", "#eb4034")
            .attr("stoke-width", 3)
            .attr("fill", "beige");

        svg.append("text")
            .attr("x", width_selected/6.5 + 10)
            .attr("y", 78)
            .attr("font-family", 'Verdana, sans-serif')
            .attr("font-size", 10)
            .text("GDP,PPP (Current int.$ - year):")
            .append("tspan")
            .attr("dy", 20)
            .attr("x", width_selected/6.5 + 10)
            .attr("font-family", '"Lucida Console", Monaco, monospace')
            .attr("font-size", 10)
            .text(function() {
            if(i < (dataset.hic.gdp).length) {
                return `~ ${Math.round(d/1000000) + " M"} - ${dataset.hic.years[i].getFullYear()} (HIC)`;
            } else {
                return `~ ${Math.round(d/1000000) + " M"} - ${dataset.hic.years[i - (dataset.mic.gdp).length].getFullYear()} (MIC)`;
            }
            });
    });
    
    svg.append("rect")
        .attr("x", width_selected/4)
        .attr("y", height + paddingV * 1.75)
        .attr("width", width_selected/12)
        .attr("height", 10)
        .attr("fill", "#32a852");
    svg.append("text")
        .attr("x", width_selected/3 + 5)
        .attr("y", height + paddingV * 1.75 + 10)
        .attr("font-family", "Arial")
        .attr("font-size", 12)
        .text("HIC");
    svg.append("rect")
        .attr("x", 3*width_selected/4)
        .attr("y", height + paddingV * 1.75)
        .attr("width", width_selected/12)
        .attr("height", 10)
        .attr("fill", "#236391");
    svg.append("text")
        .attr("x", 10 * width_selected/12 + 5)
        .attr("y", height + paddingV * 1.75 + 10)
        .attr("font-size", 12)
        .attr("font-family", "Arial")
        .text("MIC");
    
}

var dataset = {
hic: {
    years: [],
  gdp: []
    },
mic: {
    years: [],
  gdp: []
    }
}
const url = "https://api.worldbank.org/v2/country/MIC;HIC/indicator/NY.GDP.MKTP.PP.CD?date=1998:2018&format=json";

//Create a Promise to fetch json url
function get(url) {
  // Return a new promise.
  return new Promise(function(resolve, reject) {
    // Do the usual XHR stuff
    var req = new XMLHttpRequest();
    req.open('GET', url);

    req.onload = function() {
      if (req.status == 200) {
        // Resolve the promise with the response text
        resolve(req.responseText);
      }
      else {
        // Otherwise reject with the status text
        reject(Error(req.statusText));
      }
    };

    // Handle network errors
    req.onerror = function() {
      reject(Error("Network Error"));
    };

    // Make the request
    req.send();
  });
}

//Use promise to fetch json and parse it, retrieve data, and build graph
get(url).then(JSON.parse).then(function(response) {
  response[1].forEach(function(obj) {
        if(obj.value) {
        	if(obj.country.value === "High income") {
          	dataset.hic.years.push(d3.utcParse("%Y")(obj.date));
            dataset.hic.gdp.push(obj.value);
          } else {
          	dataset.mic.years.push(d3.utcParse("%Y")(obj.date));
            dataset.mic.gdp.push(obj.value);
          }
        }
      });
    return dataset;
    
}).then(function(response) {
    interval = d3.extent(response.hic.years);
    start_date = new Date(interval[0].getFullYear() - 1, interval[0].getMonth() + 6);
    end_date = new Date(interval[1].getFullYear(), interval[1].getMonth() + 6);
    graphDomain = [start_date, end_date];
    
       createGraph(); 
    
})

// Capture resize events of the window object to redo the graph (to rescale the bar charts to fit into screen viewport width)

window.onresize = createGraph;