window.onresize = function(){ location.reload(); }

var map;



	  
queue()
    .defer(d3.json, "/api/data")
    .await(makeGraphs);

function makeGraphs(error, apiData) {
	
//Start Transformations
	var dataSet = apiData;
	var dateFormat = d3.time.format("%m/%d/%Y");
	dataSet.forEach(function(d) {
		d.date_posted = dateFormat.parse(d.date_posted);
				d.date_posted.setDate(1);
		d.total_donations = +d.total_donations;
	});

	//Create a Crossfilter instance
	var ndx = crossfilter(dataSet);

	//Define Dimensions
	var datePosted = ndx.dimension(function(d) { return d.date_posted; });
	var gradeLevel = ndx.dimension(function(d) { return d.grade_level; });
	var resourceType = ndx.dimension(function(d) { return d.resource_type; });
	var fundingStatus = ndx.dimension(function(d) { return d.funding_status; });
	var povertyLevel = ndx.dimension(function(d) { return d.poverty_level; });
	var state = ndx.dimension(function(d) { return d.school_state; });
	var totalDonations  = ndx.dimension(function(d) { return d.total_donations; });


	//Calculate metrics
	var projectsByDate = datePosted.group(); 
	var projectsByGrade = gradeLevel.group(); 
	var projectsByResourceType = resourceType.group();
	var projectsByFundingStatus = fundingStatus.group();
	var projectsByPovertyLevel = povertyLevel.group();
	var stateGroup = state.group();

	var all = ndx.groupAll();

	//Calculate Groups
	var totalDonationsState = state.group().reduceSum(function(d) {
		return d.total_donations;
	});

	var totalDonationsGrade = gradeLevel.group().reduceSum(function(d) {
		return d.grade_level;
	});

	var totalDonationsFundingStatus = fundingStatus.group().reduceSum(function(d) {
		return d.funding_status;
	});

	var netTotalDonations = ndx.groupAll().reduceSum(function(d) {return d.total_donations;});

	//Define threshold values for data
	var minDate = datePosted.bottom(1)[0].date_posted;
	var maxDate = datePosted.top(1)[0].date_posted;

	$(document).ready(function () {

		// Store currentRegion
		var currentRegion = 'ca';
	  
		// List of Regions we'll let clicks through for
		var enabledRegions = ['ca', 'il', 'nc', 'ny', 'sc', 'tx'];
	  
		map = $('#vmap').vectorMap({
		  map: 'usa_en',
		  enableZoom: true,
		  backgroundColor: null,
		  showTooltip: true,
		  selectedColor: '#304d7a',
		  selectedRegions: null,
		  hoverColor: null,
		  color: '#ffffff',
		  colors: {
			  ca: '#3182bd',
			  il: '#3182bd',
			  nc: '#3182bd',
			  ny: '#3182bd',
			  sc: '#3182bd',
			  tx: '#3182bd'
		  },
		  onRegionClick: function(event, code, region){
			// Check if this is an Enabled Region, and not the current selected on
			if(enabledRegions.indexOf(code) === -1 || currentRegion === code){
			  // Not an Enabled Region
			  event.preventDefault();
			} else {
			  // Enabled Region. Update Newly Selected Region.
			  currentRegion = code;
			}
		  },
		  onRegionSelect: function(event, code, region){
			console.log(map.selectedRegions);
			  },
		  onLabelShow: function(event, label, code){
			if(enabledRegions.indexOf(code) === -1){
			  event.preventDefault();
			}
		  }
		});
	  });
    //Charts
	var dateChart = dc.lineChart("#date-chart");
	var gradeLevelChart = dc.rowChart("#grade-chart");
	var resourceTypeChart = dc.rowChart("#resource-chart");
	var fundingStatusChart = dc.pieChart("#funding-chart");
	var povertyLevelChart = dc.rowChart("#poverty-chart");
	var totalProjects = dc.numberDisplay("#total-projects");
	var netDonations = dc.numberDisplay("#net-donations");
	var stateDonations = dc.barChart("#state-donations");


	selectField = dc.selectMenu('#menuselect')
        .dimension(state)
        .group(stateGroup); 

       dc.dataCount("#row-selection")
        .dimension(ndx)
        .group(all);


	totalProjects
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(all);

	netDonations
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(netTotalDonations)
		.formatNumber(d3.format(".3s"));

	dateChart 
		//.width(600)
		.height(220)
		.margins({top: 10, right: 50, bottom: 30, left: 50})
		.dimension(datePosted)
		.group(projectsByDate)
		.renderArea(true)
		.transitionDuration(500)
		.x(d3.time.scale().domain([minDate, maxDate]))
		.elasticY(true)
		.renderHorizontalGridLines(true)
    	.renderVerticalGridLines(true)
		.xAxisLabel("Year")
		.yAxis().ticks(6);
		

	resourceTypeChart
		//.width(300)
        .height(220)
        .dimension(resourceType)
        .group(projectsByResourceType)
        .elasticX(true)
		.xAxis().ticks(5);
		

	povertyLevelChart
		//.width(300)
		.height(220)
        .dimension(povertyLevel)
        .group(projectsByPovertyLevel)
        .xAxis().ticks(4);

	gradeLevelChart
		//.width(300)
		.height(220)
        .dimension(gradeLevel)
        .group(projectsByGrade)
        .xAxis().ticks(4);

  
	fundingStatusChart
	.height(220)
	//.width(350)
	.radius(90)
	.innerRadius(40)
	.transitionDuration(1000)
	.dimension(fundingStatus)
	.group(projectsByFundingStatus);


    stateDonations
    	//.width(800)
        .height(499)
        .transitionDuration(1000)
        .dimension(state)
        .group(totalDonationsState)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .centerBar(false)
        .gap(5)
        .elasticY(true)
        .x(d3.scale.ordinal().domain(state))
        .xUnits(dc.units.ordinal)
        .renderHorizontalGridLines(true)
        .group(totalDonationsState)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .centerBar(false)
        .gap(5)
        .elasticY(true)
        .x(d3.scale.ordinal().domain(state))
        .xUnits(dc.units.ordinal)
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .ordering(function(d){return d.value;})
        .yAxis().tickFormat(d3.format("s"));

    dc.renderAll();

};