import React, { useEffect, useState } from "react";
import { fetchISSCountry } from "../data/fetchCountry"; // Import de la fonction data

const CurrentCountry = ({ lat, lon }) => {
	const [countryName, setCountryName] = useState("Loading...");
	const [countryCode, setCountryCode] = useState(null);
	
	useEffect(() => {
		if (!lat || !lon) return;
		
		const getCountry = async () => {
			// On appelle ton worker Cloudflare via l'utilitaire
			const data = await fetchISSCountry(lat, lon);
			
			setCountryName(data.name);
			setCountryCode(data.code);
		};
		
		getCountry();
	}, [lat, lon]);
	
	return (
		<div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
			<span>{countryName}</span>
			{countryCode && (
				<img
					src={`https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`}
					alt={`Flag of ${countryName}`}
					style={{ width: "24px", height: "16px", objectFit: "cover", borderRadius: "2px" }}
				/>
			)}
		</div>
	);
};

export default CurrentCountry;