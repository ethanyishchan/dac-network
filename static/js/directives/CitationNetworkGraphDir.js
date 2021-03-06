app.directive("citationGraph", function(){
	this.height = $(window).height();
	return {
		restrict:"A",
		controller:function($scope, MessageServer, GraphService){
			$scope.messageServer = MessageServer;
			$scope.graphService = GraphService;
			$scope.graphService.setWindowHeight($(window).height());
			$scope.typeGraph = "degreeCentrality";
			$scope.chosenScore = 0;
			$scope.filterScore = 0;
			$scope.loaded = false;
			$scope.highlightPaper = null;
			$scope.jsonFile = "citations.json";
			$scope.chronological = false;
			$scope.citationCheckboxId = "#citationShowClustering";
			$scope.$watch("jsonFile", function(newVal, oldVal){
				if(newVal===oldVal){
					return;
				}
				$scope.$broadcast("NewGraph");
			});
			$scope.$watchCollection('[messageServer.getHighlight(), loaded]', function(newValues, oldValues){
				//if there is a node that should be highlighted, and the graph has loaded
				if(newValues[0] !== null){
					$(newValues[0]).d3Click();
				}
			});
			$scope.$watch("chronological", function(val, oldVal){
				if(val !== oldVal){
					$scope.$broadcast("NewGraph");
				}
			});
			$scope.$watch("typeGraph", function(newVal, oldVal){
				if(newVal !== oldVal){
					$(".node").each(function( index, element ){
						var attr = getAttrCentrality(newVal);
						var centralityScore = $(element).attr(attr);
						var hue = $scope.graphService.getNodeHue(centralityScore, $scope.typeGraph, false);
						if(attr === "group"){
			  				hue = centralityScore * 10;
			  			}
						$(this).css("fill", "hsl(" + hue + ",100% ,50%)");
					});
				}
			});
			$scope.buttonPress = function() {
				if ($scope.filterScore !== $scope.chosenScore) {
					$scope.filterScore = $scope.chosenScore;
					$scope.loaded = false;
					$scope.$broadcast("NewGraph");
				}
			};

			$scope.$on("GraphLoaded", function(){
				$scope.$apply(function(){
					$scope.loaded = true;
				})
			});
		},
		link:function(scope, elem, attrs){
			var fileName = "../../static/json/";
			var dom = "#citation-graph";
			scope.graphService.drawGraph(scope, true, scope.chosenScore,scope.typeGraph,fileName+scope.jsonFile, dom, -100, "CitationNodeClicked", scope.chronological);
			
			scope.$on("NewGraph",function(){
				$("svg").remove();
				scope.loaded = false;
				if (scope.chosenScore === 0) {
					scope.graphService.setCanClusterCitation(true);
					var on = scope.graphService.getCitationClusteringEnabled();
					if (on) {
						scope.messageServer.queryClustersYearUpdate(scope.graphService.getFilterYear());
					}
				} else {
					scope.graphService.setCanClusterCitation(false);
				}
	  			scope.graphService.drawGraph(scope, true, scope.chosenScore, scope.typeGraph,fileName+scope.jsonFile, dom, -100, "CitationNodeClicked", scope.chronological);
	  		});
			
		}//end link
	}
});
