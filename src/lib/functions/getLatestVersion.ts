import type {LatestVersion} from "../interfaces/LatestVersion";

export default async function getLatestVersion() : Promise<LatestVersion> {
    const url = `https://api.github.com/repos/Pazzann/project-timer/releases/latest`;

    try {
        const response = await fetch(url, {
            headers: {
                // 'Authorization': 'Bearer YOUR_GITHUB_TOKEN', // Optional: Add if you hit rate limits
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("No releases found for this repository.");
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Latest release data:", data);
        // The tag_name usually holds the version number (e.g., "v1.0.0" or "16.14.0")
        return data;

    } catch (error: any) {
        console.error("Failed to fetch latest release:", error?.message);
        return {name: "unknown", html_url: "about:blank"};
    }
}