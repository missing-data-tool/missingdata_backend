var circles;

d3.select("#gene_search_box").on("change paste keyup", function() {
// d3.select("#txtName").on("change paste keyup", function() {
    highLight();

});

function highLight() {
    // var txtName = document.getElementById("txtName");
    var txtName = document.getElementById("gene_search_box");

    // circles = svg.selectAll("circle");
    circles = svg.selectAll("circle");
    circles.style("fill", function(d) {
        if (d.Brand == txtName.value) {
            return "red"
        }else if(d[select_x] ===1 || d[select_y] === 1){
            return "url(#diagonal-stripes)";}
        else{
            return "steelblue";}
    });


}
// Global functions called when select elements changed
function onXScaleChanged() {
    if(typeof points === 'undefined'){ // this part removes the zoomed redrawn objects
    }else{
        points.remove().exit();
    }

    var select = d3.select('#xScaleSelect').node();
    // Get current value of select element, save to global chartScales
    chartScales.x = select.options[select.selectedIndex].value;

    // Update chart
    updateChart();
}

function onYScaleChanged() {
    if(typeof points === 'undefined'){ // this part removes the zoomed redrawn objects
    }else{
        points.remove().exit();
    }

    var select = d3.select('#yScaleSelect').node();
    // Get current value of select element, save to global chartScales
    chartScales.y = select.options[select.selectedIndex].value;

    // Update chart
    updateChart();
}

function textProcess(temp_x,temp_y) {
    if(temp_x === "Age"){
        temp_x ="age";
    }else if(temp_x === "Rating"){
        temp_x="rate"
    }else if(temp_x === "Price"){
        temp_x="price"
    }else if(temp_x === "ABV"){
        temp_x="abv"
    }
    if(temp_y === "Age"){
        temp_y ="age";
    }else if(temp_y === "Rating"){
        temp_y="rate"
    }else if(temp_y === "Price"){
        temp_y="price"
    }else if(temp_y === "ABV"){
        temp_y="abv"
    }

    let select_x = temp_x.concat("_impute");
    let select_y = temp_y.concat("_impute");


    return {
        select_x,
        select_y
    }
}


// Also, declare global variables for missing amount, total amount, and percentage
impute_flag = false;
no_impute_flag = false;
both_flag = false;

var svg = d3.select('svg');

// Get layout parameters
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

var padding = {t: 40, r: 40, b: 40, l: 40};

// Compute chart dimensions
var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = svgHeight - padding.t - padding.b;

// Create a group element for appending chart elements
var chartG = svg.append('g')
    .attr('transform', 'translate('+[padding.l, padding.t]+')');

// **zoom**create a clipping region
// svg.append("defs").append("clipPath")
chartG.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", chartWidth)
    .attr("height", chartHeight);
/**/

var xAxisG = chartG.append('g')
    //this was changed to remove the ticks
    // .attr('class', 'x axis')
    .attr('class', 'x-axis')
    .attr('transform', 'translate('+[0, chartHeight]+')');

var yAxisG = chartG.append('g')
// .attr('class', 'y axis');
    .attr('class', 'y-axis'); //there was a overlap in class name for bar


var transitionScale = d3.transition()
    .duration(600)
    .ease(d3.easeLinear);

//****scatter plot
function updateChart() {
    // **** Draw and Update your chart here ****
    // Update the scales based on new data attributes
    yScale.domain(domainMap[chartScales.y]).nice();
    xScale.domain(domainMap[chartScales.x]).nice();

    // Update the axes here first
    xAxisG.transition()
        .duration(750) // Add transition
        .call(d3.axisBottom(xScale));
    yAxisG.transition()
        .duration(750) // Add transition
        .call(d3.axisLeft(yScale));

    // these were declared as local initially
    const select = textProcess(chartScales.x,chartScales.y);

    select_x = select.select_x;
    select_y = select.select_y;

    filtered_x = whiskey
        .filter(function(d){
            return d[select_x] ===1});

    console.log("filtered_x",filtered_x);
    filtered_y = whiskey
        .filter(function(d){
            return d[select_y] ===1});
    console.log("filtered_y",filtered_y);



    // Create and position scatterplot circles
    // User Enter, Update (don't need exit)
    dots = chartG
        .append("g") //zoom, this helps it stay in the region
        .attr("clip-path", "url(#clip)") //zoom
        .selectAll('.dot')
        .data(whiskey);
    // .data(noimpute_data);

    // Define the div for the tooltip
    var div = d3.select("body").append("div")
        .attr("class", "tooltip");

    // filter it
    dotsEnter = dots.enter()
        .append('g')
        .attr('class', 'dot')
        .on('mouseover', function(d){ // Add hover start event binding
            var hovered = d3.select(this);
            // // Show the text, otherwise hidden
            // hovered.select('text')
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html(function(){
                if(d[select_x]===1 && d[select_y]===0){
                    return  "Brand: "+d.Brand + "<br>" +chartScales.x + ": "+ "<span style='color: #FF0000;'>" + d[chartScales.x]+ " (Est.)"+ "</span>"+"<br>" + chartScales.y + ": " + d[chartScales.y]
                }else if(d[select_y] === 1 && d[select_x] === 0){
                    return  "Brand: "+d.Brand + "<br>" + chartScales.x + ": " + d[chartScales.x]+ "<br>" + chartScales.y + ": " + "<span style='color: #FF0000;'>"+ d[chartScales.y] + " (Est.)"+"</span>"
                }else if(d[select_x] ===0 && d[select_y] === 0){
                    return  "Brand: "+d.Brand + "<br>" + chartScales.x + ": " + d[chartScales.x]+ "<br>" + chartScales.y + ": " + d[chartScales.y]
                }else if(d[select_x] ===1  && d[select_y] === 1){
                    return  "Brand: "+d.Brand + "<br>" + chartScales.x + ": " + "<span style='color: #FF0000;'>"+d[chartScales.x]+ " (Est.)"+"</span>"+ "<br>" + chartScales.y + ": " + "<span style='color: #FF0000;'>"+ d[chartScales.y] + " (Est.)"+"</span>"
                }
            })
                .style("left", "1050px")
                .style("top", "100px");
            hovered.select('circle')
                        .style('stroke-width', 2)
                        .style('stroke', '#333');
        })
        .on('mouseout', function(d){ // Add hover end event binding
            // Select the hovered g.dot
            var hovered = d3.select(this);
            // Remove the highlighting we did in mouseover
            // hovered.select('text')
            //     .style('visibility', 'hidden');
            hovered.select('circle')
                .style('stroke-width', 0)
                .style('stroke', 'none');
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // Append a circle to the ENTER selection
    // dotsEnter.append('circle')
    dotsEnter.append('circle')
        .attr("class","no_impute")
        .style("fill",function(d){
            if(d[select_x] ===1 || d[select_y] === 1){return "url(#diagonal-stripes)";}
            else{return "steelblue";}
        })
        .attr('r', 5);


    std_x = d3.deviation(whiskey, function(d) { return d[chartScales.x]; });
    std_y = d3.deviation(whiskey, function(d) { return d[chartScales.y]; });

    d3.selectAll(("input[value='ticks_on']")).on("change", function() {
        console.log('ticks_on');
        redraw_ticks_on();
    });

    d3.selectAll(("input[value='impute']")).on("change", function() {
        filter_impute();
    });

    d3.selectAll(("input[value='no_impute']")).on("change", function() {
        filter_no_impute();
    });

    d3.selectAll(("input[value='both']")).on("change", function() {
        filter_both();
    });

    // ENTER + UPDATE selections - bindings that happen on all updateChart calls
    dots.merge(dotsEnter)
        .transition() // Add transition - this will interpolate the translate() on any changes
        // .duration(750)
        .duration(300)
        .attr('transform', function(d) {
            console.log('this gets called merge');
            // Transform the group based on x and y property
            var tx = xScale(d[chartScales.x]);
            var ty = yScale(d[chartScales.y]);
            return 'translate('+[tx, ty]+')';
        });


    d3.selectAll("circle")
        .filter(function(d){return d[select_x] ===1 || d[select_y] ===1})
        .style("fill","url(#diagonal-stripes)");

    d3.selectAll("circle")
        .filter(function(d){return d[select_x] ===0 && d[select_y] === 0})
        .style("fill","steelblue");

    redraw_ticks_on();

    // var txtName = document.getElementById("txtName");
    var txtName = document.getElementById("gene_search_box");


    if(txtName.value){
        highLight();
    }

    if(impute_flag === true){
        filter_impute();
    }else if(no_impute_flag === true){
        filter_no_impute();
    }else if(both_flag === true){
        filter_both();
    }

    function redraw_ticks_on() {

        if(typeof dots_line_x === 'undefined'){ // bars
        }else{
            dots_line_x.remove().exit();
        }if(typeof dots_line_y === 'undefined'){ // bars
            console.log('dotschart undefined');
        }else {
            dots_line_y.remove().exit();
            // dots_remove.remove().exit();
        }
        // where it is missing, so if the value is imputed than it will show little lines next to it
        dots_line_x = chartG.append("g")
            .selectAll("line")
            .data(filtered_x)
            .enter()
            .append("line")
            .attr("opacity",1)
            .attr("class", "normal-line")
            .attr("x1", function (d) {
                return xScale(d[chartScales.x]);
            })
            .attr("y1", function (d) {
                // return yScale(d[chartScales.y]+1);
                return 520;
            })
            .attr("x2", function (d) {
                return xScale(d[chartScales.x]);
            })
            .attr("y2", function (d) {
                // return yScale(d[chartScales.y]-1);
                return 520+10;
            });

        dots_line_y = chartG.append("g")
            .selectAll("line")
            .data(filtered_y)
            .enter()
            .append("line")
            .attr("opacity",1)
            .attr("class", "normal-line")
            .attr("x1", function (d) {
                return -10;
            })
            .attr("y1", function (d) {
                // return yScale(d[chartScales.y]+1);
                return yScale(d[chartScales.y]);
            })
            .attr("x2", function (d) {
                return 0;
            })
            .attr("y2", function (d) {
                // return yScale(d[chartScales.y]-1);
                return yScale(d[chartScales.y]);
            });

    }// end of ticks

    function redraw_ticks_zoom() {
        if(typeof dots_line_x === 'undefined'){ // bars
        }else{
            dots_line_x.remove().exit();
        }if(typeof dots_line_y === 'undefined'){ // bars
            console.log('dotschart undefined');
        }else {
            dots_line_y.remove().exit();
            // dots_remove.remove().exit();
        }
        // where it is missing, so if the value is imputed than it will show little lines next to it
        dots_line_x = chartG
            .append("g")
            // .attr("clip-path", "url(#clip)") //zoom
            .selectAll("line")
            .data(whiskey)
            // .data(filtered_x)
            .enter()
            .filter(function(d){
                return d[select_x] ===1})
            .append("line")
            .attr("opacity",1)
            .attr("class", "normal-line")
            .attr("x1", function (d) {
                return new_xScale(d[chartScales.x]);
            })
            .attr("y1", function (d) {
                // return yScale(d[chartScales.y]+1);
                return 520;
            })
            .attr("x2", function (d) {
                return new_xScale(d[chartScales.x]);
            })
            .attr("y2", function (d) {
                // return yScale(d[chartScales.y]-1);
                return 520+10;
            });

        dots_line_y = chartG.append("g")
            // .attr("clip-path", "url(#clip)") //zoom
            .selectAll("line")
            // .data(filtered_y)
            .data(whiskey)
            .enter()
            .filter(function(d){
                return d[select_y] ===1})
            .append("line")
            .attr("opacity",1)
            .attr("class", "normal-line")
            .attr("x1", function (d) {
                return -10;
            })
            .attr("y1", function (d) {
                // return yScale(d[chartScales.y]+1);
                return new_yScale(d[chartScales.y]);
            })
            .attr("x2", function (d) {
                return  0;
            })
            .attr("y2", function (d) {
                // return yScale(d[chartScales.y]-1);
                return new_yScale(d[chartScales.y]);
            });

    }// end of ticks


    function filter_impute() {

        d3.selectAll("circle")
            .style("fill",function(d){
                if(d[select_x] ===1 || d[select_y] === 1){return "url(#diagonal-stripes)";}
                else{return "steelblue";}
            })
            .style("opacity",function(d){
                if(d[select_x] ===1 || d[select_y] === 1){return 0.8;}
                else{return 0;}
            });

        impute_flag = true;
        no_impute_flag = false;
        both_flag = false;

        redraw_ticks_on();

        // var txtName = document.getElementById("txtName");
        var txtName = document.getElementById("gene_search_box");

        if(txtName.value){
            highLight();
        }

    }// end of imputed filter

    function filter_no_impute() {

        if(typeof dots_line_x === 'undefined'){ // bars
        }else{
            dots_line_x.remove().exit();
        }if(typeof dots_line_y === 'undefined'){ // bars
            console.log('dotschart undefined');
        }else {
            dots_line_y.remove().exit();
            // dots_remove.remove().exit();
        }

        d3.selectAll("circle")
            .style("fill",function(d){
                if(d[select_x] ===0 && d[select_y] === 0){return "steelblue";}
                else{return "steelblue";}
            })
            .style("opacity",function(d){
                if(d[select_x] ===0 && d[select_y] === 0){return 0.8;}
                else{return 0;}
            });

        impute_flag = false;
        no_impute_flag = true;
        both_flag = false;

        // var txtName = document.getElementById("txtName");
        var txtName = document.getElementById("gene_search_box");


        if(txtName.value){
            highLight();
        }


    }// end of no filter

    function filter_both() {

        d3.selectAll("circle")
            .filter(function(d){return d[select_x] ===1 || d[select_y] ===1})
            .style("fill","url(#diagonal-stripes)")
            .style("opacity",0.8);

        d3.selectAll("circle")
            .filter(function(d){return d[select_x] ===0 && d[select_y] ===0})
            .style("fill","steelblue")
            .style("opacity",0.8);


        impute_flag = false;
        no_impute_flag = false;
        both_flag = true;

        redraw_ticks_on();

        // var txtName = document.getElementById("txtName");
        var txtName = document.getElementById("gene_search_box");


        if(txtName.value){
            highLight();
        }

    }// end of imputed filter

    //**zoom
    // Pan and zoom
    var zoom = d3.zoom()
    // .scaleExtent([.5, 20]) // default setting will be .scaleExtent([0, infinity])
        .extent([[0, 0], [chartWidth, chartHeight]])
        .on("zoom", zoomed);

    // svg.append("rect")
    chartG.append("rect")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .style("fill", "none")
        .style("pointer-events", "all")
        .call(zoom);

    function zoomed() {


        // create new scale ojects based on event
        new_xScale = d3.event.transform.rescaleX(xScale);
        new_yScale = d3.event.transform.rescaleY(yScale);

        // console.log('new_xScale',new_xScale);
        var xAxis = d3.axisBottom(xScale);
        var yAxis = d3.axisLeft(yScale);

// update axes
        xAxisG.call( xAxis.scale(new_xScale));
        yAxisG.call(yAxis.scale(new_yScale));
        // dots.data(dotsEnter)
        //dotsenter when have a subject it does update but weird
        // dotsEnter.data(dots)
        //     // .attr('cx', function(d) {return new_xScale(0)})
        //     // .attr('cy', function(d) {return new_yScale(0)});
        //     .attr('cx', function(d) {return new_xScale(d[chartScales.x])})
        //     .attr('cy', function(d) {return new_yScale(d[chartScales.y])});

        // it does update now
        points = dots.merge(dotsEnter)
        // dots.merge(dotsEnter)
        //     .transition() // Add transition - this will interpolate the translate() on any changes
        // .duration(750)
            .attr('transform', function(d) {
                console.log('this gets called merge');
                // Transform the group based on x and y property
                var tx = new_xScale(d[chartScales.x]);
                var ty = new_yScale(d[chartScales.y]);
                return 'translate('+[tx, ty]+')';
            });

        redraw_ticks_zoom();

        // restart_animation()


    }
    //**zoom

}// end of updatechart for Scatterplots