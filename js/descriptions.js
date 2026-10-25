let writtenTweets = [];
function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	// Convert raw tweets into Tweet objects
const tweet_array = runkeeper_tweets.map(function(tweet) {
    return new Tweet(tweet.text, tweet.created_at);
});

// Filter tweets containing user-written text
writtenTweets = tweet_array.filter(function(tweet) {
    return tweet.written;
});

console.log("Written tweets count:", writtenTweets.length);
console.log("Written tweet examples:", writtenTweets.slice(0, 5));
}


function addEventHandlerForSearch() {
    const searchInput = document.getElementById("textFilter");
    const searchCount = document.getElementById("searchCount");
    const searchText = document.getElementById("searchText");

    searchInput.addEventListener("input", function() {
        const keyword = searchInput.value.trim().toLowerCase();

        // Show the search keyword
        searchText.innerText = searchInput.value;

        // Clear results if the search box is empty
        if (keyword === "") {
    		searchCount.innerText = "0";
    		document.getElementById("tweetTable").innerHTML = "";
   			return;
	}

        // Filter tweets by keyword
        const results = writtenTweets.filter(tweet =>
            tweet.writtenText.toLowerCase().includes(keyword)
        );

        // Update result count
        searchCount.innerText = results.length;

        // Update result count
		searchCount.innerText = results.length;

		// Display matching tweets in the table
		const tweetTable = document.getElementById("tweetTable");

		tweetTable.innerHTML = results
			.map((tweet, index) => tweet.getHTMLTableRow(index + 1))
			.join("");

		console.log("Search results:", results.slice(0, 5));
			});
}


//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});