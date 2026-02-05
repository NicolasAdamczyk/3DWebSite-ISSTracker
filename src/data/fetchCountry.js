// src/data/fetchCountry.js

// Remplace par l'URL de ton nouveau Worker Cloudflare
const COUNTRY_WORKER_URL = 'https://iss-country-lookup.powertubeee.workers.dev/';

export async function fetchISSCountry(lat, lon) {
	try {
		const res = await fetch(`${COUNTRY_WORKER_URL}?lat=${lat}&lon=${lon}`);
		if (!res.ok) throw new Error("Worker Country Error");
		
		const data = await res.json();
		
		if (data?.address?.country) {
			return {
				name: data.address.country,
				code: data.address.country_code?.toUpperCase()
			};
		}
		return { name: "Ocean", code: null };
	} catch (error) {
		console.error("Error fetching country from worker:", error);
		return { name: "Error", code: null };
	}
}