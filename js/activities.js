
function parseTweets(runkeeper_tweets) {
    // Do not proceed if no tweets loaded
    if (runkeeper_tweets === undefined) {
        window.alert('No tweets returned');
        return;
    }

    // Convert raw tweets into Tweet objects
    const tweet_array = runkeeper_tweets.map(function(tweet) {
        return new Tweet(tweet.text, tweet.created_at);
    });

    // ===== Count activity types =====

    // Get completed activities
    const completedTweets = tweet_array.filter(
        tweet => tweet.source === "completed_event"
    );

    // Count each activity type
    const activityCounts = {};

    completedTweets.forEach(tweet => {
        const type = tweet.activityType;

        if (type !== "unknown") {
            activityCounts[type] = (activityCounts[type] || 0) + 1;
        }
    });

    // Sort activities from most to least common
    const sortedActivities = Object.entries(activityCounts)
        .sort((a, b) => b[1] - a[1]);

    console.log("Number of activity types:", sortedActivities.length);
    console.log("Top 3 activities:", sortedActivities.slice(0, 3));
    console.log("All activity types:", sortedActivities);
	// Update the activity summary
const topThree = sortedActivities.slice(0, 3);
// Get the names of the three most common activities
const topThreeNames = topThree.map(item => item[0]);

// Prepare distance data for the three activities
const distanceData = completedTweets
    .filter(tweet =>
        topThreeNames.includes(tweet.activityType) &&
        tweet.distance > 0
    )
    .map(tweet => ({
        activity: tweet.activityType,
        distance: tweet.distance,
        day: tweet.time.toLocaleDateString("en-US", {
            weekday: "long"
        })
    }));

console.log("Distance data count:", distanceData.length);
console.log("Distance data examples:", distanceData.slice(0, 10));
// ===== Distance by day of the week =====

const dayOrder = [
    "Monday", "Tuesday", "Wednesday", "Thursday",
    "Friday", "Saturday", "Sunday"
];

const distance_vis_spec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "description": "Distances for the three most common activities by weekday",
    "data": {
        "values": distanceData
    },
    "mark": {
        "type": "tick",
        "thickness": 2
    },
    "encoding": {
        "x": {
            "field": "day",
            "type": "ordinal",
            "sort": dayOrder,
            "title": "Day of the Week"
        },
        "y": {
            "field": "distance",
            "type": "quantitative",
            "title": "Distance (miles)"
        },
        "color": {
            "field": "activity",
            "type": "nominal",
            "title": "Activity Type"
        }
    },
    "width": 500,
    "height": 300
};

// ===== Mean distance by weekday =====

const mean_distance_vis_spec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "description": "Average distance by activity and weekday",
    "data": {
        "values": distanceData
    },
    "mark": "bar",
    "encoding": {
        "x": {
            "field": "day",
            "type": "ordinal",
            "sort": dayOrder,
            "title": "Day of the Week"
        },
        "y": {
            "aggregate": "mean",
            "field": "distance",
            "type": "quantitative",
            "title": "Average Distance (miles)"
        },
        "color": {
            "field": "activity",
            "type": "nominal",
            "title": "Activity Type"
        },
        "xOffset": {
            "field": "activity"
        }
    },
    "width": 500,
    "height": 300
	
};

console.log("Mean distance chart prepared");

    // Calculate average distance for each of the top 3 activities
    const activityAverages = topThreeNames.map(type => {
        const records = distanceData.filter(
            item => item.activity === type
        );

        const total = records.reduce(
            (sum, item) => sum + item.distance, 0
        );

        return {
            activity: type,
            average: total / records.length
        };
    });

    // Sort from longest to shortest average distance
    activityAverages.sort((a, b) => b.average - a.average);

    document.getElementById("longestActivityType").innerText =
        activityAverages[0].activity;

    document.getElementById("shortestActivityType").innerText =
        activityAverages[activityAverages.length - 1].activity;

    // Compare weekday and weekend average distances
    const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    const weekdayDistances = distanceData.filter(
        item => weekdays.includes(item.day)
    );

    const weekendDistances = distanceData.filter(
        item => !weekdays.includes(item.day)
    );

    const averageDistance = records =>
        records.length > 0
            ? records.reduce((sum, item) => sum + item.distance, 0) / records.length
            : 0;

    const weekdayAverage = averageDistance(weekdayDistances);
    const weekendAverage = averageDistance(weekendDistances);

    document.getElementById("weekdayOrWeekendLonger").innerText =
        weekendAverage > weekdayAverage ? "weekends" : "weekdays";

    console.log("Activity averages:", activityAverages);
    console.log("Weekday average:", weekdayAverage);
    console.log("Weekend average:", weekendAverage);


document.getElementById("numberActivities").innerText =
    sortedActivities.length;

document.getElementById("firstMost").innerText =
    topThree[0][0];

document.getElementById("secondMost").innerText =
    topThree[1][0];

document.getElementById("thirdMost").innerText =
    topThree[2][0];

    // ===== Activity visualization =====

    // TODO: Create a graph showing the number of tweets
    // containing each type of activity.

    const activity_vis_spec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "description": "Number of tweets for each activity type",
    "data": {
        "values": sortedActivities.map(item => ({
            activity: item[0],
            count: item[1]
        }))
    },
    "mark": "bar",
	"params": [
		{
			"name": "selectedActivity",
			"select": {
				"type": "point",
				"fields": ["activity"],
				"on": "click",
				"clear": "dblclick",
				"toggle": false
			}
		}
	],
	"encoding": {
        "x": {
            "field": "activity",
            "type": "nominal",
            "sort": "-y",
            "title": "Activity Type"
        },
        "y": {
            "field": "count",
            "type": "quantitative",
            "title": "Number of Tweets"
        }
    }
};

vegaEmbed('#activityVis', activity_vis_spec, {actions: false});



    // ===== Toggle between raw and mean distances =====
    
    // ===== Bonus: Interactive activity filtering =====

    const aggregateButton = document.getElementById("aggregate");

    let showingMeans = false;
    let selectedActivity = null;

    // Update the second chart based on the selected activity
    function updateDistanceChart() {
        const originalSpec = showingMeans
            ? mean_distance_vis_spec
            : distance_vis_spec;

        const filteredData = selectedActivity
            ? distanceData.filter(item => item.activity === selectedActivity)
            : distanceData;

        const updatedSpec = {
            ...originalSpec,
            data: {
                values: filteredData
            }
        };

        vegaEmbed("#distanceVis", updatedSpec, {
            actions: false
        });
    }

    // First chart: click a bar to filter the second chart
    vegaEmbed("#activityVis", activity_vis_spec, {
        actions: false
    }).then(result => {
        result.view.addSignalListener("selectedActivity", function(name, value) {
            const selection = value.activity;

            if (selection && selection.length > 0) {
                selectedActivity = selection[0];
            } else {
                selectedActivity = null;
            }

            updateDistanceChart();
        });
    });

    // Display the second chart initially
    updateDistanceChart();

    // Keep the Show means / Show all button
    aggregateButton.addEventListener("click", function() {
        showingMeans = !showingMeans;

        aggregateButton.innerText = showingMeans
            ? "Show all"
            : "Show means";

        updateDistanceChart();
    });
}

// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function(event) {
    loadSavedRunkeeperTweets().then(parseTweets);
});
