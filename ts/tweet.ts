class Tweet {
	private text:string;
	time:Date;

	constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text;
		this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
	}

	//returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source():string {
    const text = this.text.toLowerCase();

    if (text.startsWith("just completed") ||
        text.startsWith("just posted")) {
        return "completed_event";
    }

    if (text.includes("watch my") &&
        text.includes("right now")) {
        return "live_event";
    }

    if (text.includes("achievement") ||
        text.includes("goal") ||
        text.includes("personal best") ||
        text.includes("record")) {
        return "achievement";
    }

    return "miscellaneous";
}

    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written():boolean {
    return this.writtenText.length > 0;
}

get writtenText():string {
    // Remove URL and hashtag
    let text = this.text
        .replace(/https?:\/\/\S+/gi, "")
        .replace(/#RunKeeper\b/gi, "")
        .trim();

    // Only extract comments after " - "
    const separator = text.indexOf(" - ");

    if (separator === -1) {
        return "";
    }

    text = text.substring(separator + 3).trim();

    // Remove default RunKeeper messages
    text = text.replace(/Check it out!/gi, "").trim();

    const defaults = [
        "TomTom MySports Watch",
        "Fat Burner (level 9)",
        "Treadmill Walking"
    ];

    if (defaults.some(value =>
        text.toLowerCase() === value.toLowerCase()
    )) {
        return "";
    }

    return text;
}

    get activityType():string {
    if (this.source !== "completed_event") {
        return "unknown";
    }

    const match = this.text.match(
        /^Just (?:completed|posted) an? [\d.]+ (?:km|mi) ([a-zA-Z]+)/i
    );

    if (match) {
        return match[1].toLowerCase();
    }

    return "unknown";
}

    get distance():number {
    if (this.source !== "completed_event") {
        return 0;
    }

    const match = this.text.match(
        /^Just (?:completed|posted) an? ([\d.]+) (km|mi)\b/i
    );

    if (!match) {
        return 0;
    }

    const distance = parseFloat(match[1]);
    const unit = match[2].toLowerCase();

    // Convert kilometers to miles
    if (unit === "km") {
        return distance / 1.609;
    }

    return distance;
}

    
getHTMLTableRow(rowNumber: number): string {
    const activity = this.activityType;
    const tweetText = this.text;

    // Find the link in the tweet
    const urlMatch = tweetText.match(/https?:\/\/[^\s]+/);
    const url = urlMatch ? urlMatch[0] : "";

    // Escape HTML to display tweet text safely
    const escapeHTML = (text: string): string => {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    };

    const safeText = escapeHTML(tweetText);

    let displayText = safeText;

    if (url) {
        displayText = safeText.replace(
            escapeHTML(url),
            `<a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(url)}</a>`
        );
    }

    return `<tr>
        <td>${rowNumber}</td>
        <td>${escapeHTML(activity)}</td>
        <td>${displayText}</td>
    </tr>`;
}

}