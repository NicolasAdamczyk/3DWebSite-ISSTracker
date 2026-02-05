// src/data/fetchCountry.js

// Utilise l'URL exacte de ton nouveau Worker
const COUNTRY_WORKER_URL = 'https://iss-country-lookup.powertubeee.workers.dev/';

export async function fetchISSCountry(lat, lon) {
	try {
		if (lat === undefined || lon === undefined) return { name: "Ocean", code: null };
		
		const res = await fetch(`${COUNTRY_WORKER_URL}?lat=${lat}&lon=${lon}`);
		
		if (!res.ok) throw new Error("Worker Error");
		
		const data = await res.json();
		
		// On vérifie si un pays est trouvé
		if (data?.address?.country) {
			return {
				name: data.address.country,
				code: data.address.country_code?.toUpperCase()
			};
		}
		
		// Si c'est l'océan (Nominatim ne renvoie pas d'address.country)
		return { name: "Ocean", code: null };
		
	} catch (error) {
		console.error("Erreur fetchCountry:", error);
		return { name: "Ocean", code: null };
	}
}