
function parseTweets(runkeeper_tweets) {
    // Do not proceed if no tweets loaded
    if (runkeeper_tweets === undefined) {
        window.alert('No tweets returned');
        return;
    }

    // Convert raw data into Tweet objects
    const tweet_array = runkeeper_tweets.map(function(tweet) {
        return new Tweet(tweet.text, tweet.created_at);
    });

    // Total number of tweets
    const totalTweets = tweet_array.length;
    document.getElementById('numberTweets').innerText = totalTweets;

    // ===== 1. Earliest and latest dates =====
    const dates = tweet_array.map(tweet => tweet.time.getTime());

    const earliestDate = new Date(Math.min(...dates));
    const latestDate = new Date(Math.max(...dates));

    const dateOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };

    document.getElementById('firstDate').innerText =
        earliestDate.toLocaleDateString('en-US', dateOptions);

    document.getElementById('lastDate').innerText =
        latestDate.toLocaleDateString('en-US', dateOptions);

    // ===== 2. Tweet categories =====
    const categories = {
        completed_event: 0,
        live_event: 0,
        achievement: 0,
        miscellaneous: 0
    };

    tweet_array.forEach(tweet => {
        if (Object.prototype.hasOwnProperty.call(categories, tweet.source)) {
            categories[tweet.source]++;
        }
    });

    function updateCategory(className, pctClassName, count) {
        document.querySelectorAll("." + className).forEach(element => {
            element.innerText = count;
        });

        document.querySelectorAll("." + pctClassName).forEach(element => {
            element.innerText =
                totalTweets > 0
                    ? (count / totalTweets * 100).toFixed(2) + "%"
                    : "0.00%";
        });
    }

    updateCategory(
        "completedEvents",
        "completedEventsPct",
        categories.completed_event
    );

    updateCategory(
        "liveEvents",
        "liveEventsPct",
        categories.live_event
    );

    updateCategory(
        "achievements",
        "achievementsPct",
        categories.achievement
    );

    updateCategory(
        "miscellaneous",
        "miscellaneousPct",
        categories.miscellaneous
    );

    // ===== 3. User-written tweets =====
    const completedTweets = tweet_array.filter(
        tweet => tweet.source === "completed_event"
    );

    const writtenTweets = completedTweets.filter(
        tweet => tweet.written
    );

    const writtenCount = writtenTweets.length;

    const writtenPercentage = completedTweets.length > 0
        ? (writtenCount / completedTweets.length * 100).toFixed(2) + "%"
        : "0.00%";

    document.querySelector(".written").innerText = writtenCount;
    document.querySelector(".writtenPct").innerText = writtenPercentage;

    console.log("Tweet categories:", categories);
    console.log("User-written completed tweets:", writtenCount);
}

// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function(event) {
    loadSavedRunkeeperTweets().then(parseTweets);
});
