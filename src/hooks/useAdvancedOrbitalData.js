// src/hooks/useAdvancedOrbitalData.js
import { useState, useEffect, useRef } from 'react';
import SunCalc from 'suncalc';
import * as satellite from 'satellite.js';
import { fetchISS_TLE } from '../data/fetchTle';

const TX_FREQUENCY = 145800000; // Hz
const RX_FREQUENCY = 437800000; // Hz

export function useAdvancedOrbitalData(pos) {
	const [data, setData] = useState(null);
	const satrecRef = useRef(null);
	const userLocRef = useRef(null); // Stocke la position pour éviter le spam
	
	// Charger le TLE et la localisation UNE SEULE FOIS au montage
	useEffect(() => {
		async function init() {
			// 1. TLE
			const [line1, line2] = await fetchISS_TLE();
			satrecRef.current = satellite.twoline2satrec(line1, line2);
			
			// 2. Localisation utilisateur (demandée une seule fois)
			try {
				const loc = await getUserLocation();
				userLocRef.current = loc;
			} catch (e) {
				console.warn("Localisation non disponible", e);
			}
		}
		init();
	}, []);
	
	useEffect(() => {
		if (!pos || !satrecRef.current) return;
		
		function computeData() {
			const now = new Date();
			const satrec = satrecRef.current;
			
			const jdayNow = satellite.jday(
				now.getUTCFullYear(),
				now.getUTCMonth() + 1,
				now.getUTCDate(),
				now.getUTCHours(),
				now.getUTCMinutes(),
				now.getUTCSeconds() + now.getUTCMilliseconds() / 1000
			);
			const diffSeconds = (jdayNow - satrec.jdsatepoch) * 86400;
			
			const days = Math.floor(diffSeconds / 86400);
			const remainingSeconds = diffSeconds % 86400;
			const hours = Math.floor(remainingSeconds / 3600);
			const minutes = Math.floor((remainingSeconds % 3600) / 60);
			const seconds = Math.floor(remainingSeconds % 60);
			
			const sunPos = SunCalc.getPosition(now, pos.lat, pos.lon);
			const moonPos = SunCalc.getMoonPosition(now, pos.lat, pos.lon);
			
			const sunNadirLat = -(sunPos.altitude * 180) / Math.PI;
			const sunNadirLon = ((sunPos.azimuth * 180) / Math.PI + 180) % 360 - 180;
			
			const moonDec = (moonPos.altitude * 180) / Math.PI;
			const moonRA = ((moonPos.azimuth * 12) / Math.PI + 24) % 24;
			
			// Calcul de l'azimuth avec la position stockée (si disponible)
			let userAzimuth = null;
			if (userLocRef.current) {
				userAzimuth = calculateAzimuth(
					userLocRef.current.lat,
					userLocRef.current.lon,
					pos.lat,
					pos.lon
				);
			}
			
			setData({
				keplerianAge: { days, hours, minutes, seconds, totalSeconds: diffSeconds },
				sunNadir: { lat: sunNadirLat, lon: sunNadirLon },
				sunAzEl: {
					azimuth: (sunPos.azimuth * 180) / Math.PI + 180,
					elevation: (sunPos.altitude * 180) / Math.PI,
				},
				moonDecRA: { dec: moonDec, ra: moonRA },
				moonAzEl: {
					azimuth: (moonPos.azimuth * 180) / Math.PI + 180,
					elevation: (moonPos.altitude * 180) / Math.PI,
				},
				moonDistance: moonPos.distance,
				txFrequency: TX_FREQUENCY,
				rxFrequency: RX_FREQUENCY,
				issAzimuth: userAzimuth,
			});
		}
		
		computeData();
		const interval = setInterval(computeData, 1000);
		return () => clearInterval(interval);
	}, [pos]);
	
	return data;
}

// Fonction inchangée mais appelée une seule fois désormais
function getUserLocation() {
	return new Promise((resolve, reject) => {
		if (!navigator.geolocation) return reject("Geolocation not supported");
		navigator.geolocation.getCurrentPosition(
			(pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
			(err) => reject(err)
		);
	});
}

function calculateAzimuth(lat1, lon1, lat2, lon2) {
	const toRad = (deg) => (deg * Math.PI) / 180;
	const toDeg = (rad) => (rad * 180) / Math.PI;
	const dLon = toRad(lon2 - lon1);
	const y = Math.sin(dLon) * Math.cos(toRad(lat2));
	const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
		Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
	let brng = Math.atan2(y, x);
	brng = (toDeg(brng) + 360) % 360;
	return brng;
}