import React, { useState, useRef, useEffect } from 'react';
import './ExpandableSearchBar.css';

export default function ExpandableSearchBar({ placeholder = "Search...", searchableItems = [], onSelectCity }) {
	const [expanded, setExpanded] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [filteredItems, setFilteredItems] = useState([]);
	const searchContainerRef = useRef(null);
	const inputRef = useRef(null);
	
	const toggleExpand = () => {
		if (!expanded) setExpanded(true);
	};
	
	useEffect(() => {
		if (expanded && inputRef.current) inputRef.current.focus();
	}, [expanded]);
	
	const handleSearch = (e) => {
		e.preventDefault();
		
		if (!searchTerm) {
			setFilteredItems([]);
			return;
		}
		
		// Filtrer par nom de ville
		const results = searchableItems.filter(item =>
			item.name.toLowerCase().includes(searchTerm.toLowerCase())
		);
		
		setFilteredItems(results);
	};
	
	const handleClickOutside = (e) => {
		if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
			setExpanded(false);
			setSearchTerm("");
			setFilteredItems([]);
		}
	};
	
	const handleEscapeKey = (e) => {
		if (e.key === 'Escape') {
			setExpanded(false);
			setSearchTerm("");
			setFilteredItems([]);
		}
	};
	
	useEffect(() => {
		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleEscapeKey);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleEscapeKey);
		};
	}, []);
	
	return (
		<div ref={searchContainerRef} className="search-bar-container">
			<div className={`search-bar ${expanded ? 'expanded' : ''}`} onClick={toggleExpand}>
				<div className="search-bar-icon">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
						<path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
					</svg>
				</div>
				<form onSubmit={handleSearch} className="search-bar-form">
					<input
						ref={inputRef}
						type="text"
						className="search-bar-input"
						placeholder={placeholder}
						value={searchTerm}
						onChange={(e) => {
							const value = e.target.value;
							setSearchTerm(value);
							
							// Filtrer les résultats en temps réel
							if (value) {
								const results = searchableItems.filter(item =>
									item.name.toLowerCase().includes(value.toLowerCase())
								);
								setFilteredItems(results);
							} else {
								setFilteredItems([]);
							}
						}}
					/>

				</form>
				{expanded && (
					<button
						type="button"
						className="search-bar-close"
						onClick={() => {
							setExpanded(false);
							setSearchTerm("");
							setFilteredItems([]);
						}}
						aria-label="Close search"
					>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
							<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
						</svg>
					</button>
				)}
			</div>
			
			{expanded && filteredItems.length > 0 && (
				<div className="search-bar-results">
					{filteredItems.map((city, index) => (
						<div
							key={index}
							className="search-bar-result-item"
							onClick={() => {
								setSearchTerm(city.name);
								setFilteredItems([]);
								if (onSelectCity) onSelectCity(city); // renvoie l'objet city complet
							}}
						>
							<img src={city.flagUrl} alt={city.flag} className="search-bar-flag" />
							<span className="search-bar-city-name">{city.name}</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
