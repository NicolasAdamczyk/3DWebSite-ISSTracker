// src/components/LeftPanel.jsx
import React, { useEffect, useState } from 'react';
import './LeftPanel.css';
import { useISSPosition } from '../hooks/useISSPosition';
import { useISSTleData } from '../hooks/useISSTleData';
import CurrentCountry from './CurrentCountry';
import { useAdvancedOrbitalData } from '../hooks/useAdvancedOrbitalData';

export default function LeftPanel({ isVisible }) {
	const [shouldRender, setShouldRender] = useState(isVisible);
	const [animationClass, setAnimationClass] = useState(isVisible ? 'visible' : '');

	const pos = useISSPosition();
	const { inclination, orbitPeriodSec, percent, orbitNumberToday } = useISSTleData();
	const advanced = useAdvancedOrbitalData(pos);

	useEffect(() => {
		if (isVisible) {
			setShouldRender(true);
			setAnimationClass('visible');
		} else if (shouldRender) {
			setAnimationClass('exiting');
			const timer = setTimeout(() => setShouldRender(false), 600);
			return () => clearTimeout(timer);
		}
	}, [isVisible]);

	if (!shouldRender) return null;

	return (
		<div className={`${animationClass} left-panel`}>
			<div className="left-panel-content">
				<h2>Orbital Data</h2>

				{pos ? (
					<>
						{/* Latitude / Longitude */}
						<div className="left-panel-section">
							<div className="left-panel-section-title">Position</div>
							<div className="left-panel-row">
								<span>{pos.lat.toFixed(4)}</span>
								<span className="left-panel-unit-small">N°</span>
								<div className="left-panel-unit-separator" />
								<span>{pos.lon.toFixed(4)}</span>
								<span className="left-panel-unit-small">E°</span>
							</div>
						</div>


						{/* Altitude */}
						<div className="left-panel-section">
							<div className="left-panel-section-title">Altitude</div>
							<div className="left-panel-row">
								<span>{pos.alt.toFixed(4)} km</span>
								<span className="left-panel-unit-separator" />
								<span>{(pos.alt * 0.621371).toFixed(4)} miles</span>
								<span className="left-panel-unit-separator" />
								<span>{(pos.alt * 3280.84).toFixed(0)} feet</span>
							</div>
						</div>


						{/* Speed */}
						<div className="left-panel-section">
							<div className="left-panel-section-title">Speed</div>
							<div className="left-panel-row">
								<span>{pos.vel.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })} km/h</span>
								<span className="left-panel-unit-separator" />
								<span>{(pos.vel * 0.621371).toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })} mph</span>
							</div>
						</div>

						{/* Country */}
						<div className="left-panel-section">
							<div className="left-panel-section-title">Current country</div>
							<div className="left-panel-row">
								<span><CurrentCountry lat={pos.lat} lon={pos.lon} /></span>
							</div>
						</div>

						{/* Inclination */}
						<div className="left-panel-section">
							<div className="left-panel-section-title">Orbital inclination</div>
							<div className="left-panel-row">
								<span>{inclination.toFixed(2)}°</span>
							</div>
						</div>

						{/* Period */}
						<div className="left-panel-section">
							<div className="left-panel-section-title">Orbital period</div>
							<div className="left-panel-row">
								<span>{(orbitPeriodSec / 60).toFixed(1)} min</span>
							</div>
						</div>

						{/* Progress */}
						<div className="left-panel-section">
							<div className="left-panel-section-title">Progress</div>
							<div className="left-panel-row">
								<span>{percent.toFixed(1)}% of orbit completed</span>
							</div>
						</div>

						{/* Orbit number */}
						<div className="left-panel-section">
							<div className="left-panel-section-title">Orbit number today (since 00:00 UTC)</div>
							<div className="left-panel-row">
								<span>{orbitNumberToday}</span>
							</div>
						</div>

						{/* ISS Visibility */}
						<div className="left-panel-section">
							<div className="left-panel-section-title">ISS Visibility</div>
							<div className="left-panel-row">
								{pos.visibility === 'daylight' ? (
									<>
										<span role="img" aria-label="sun">☀️</span>{' '}
										<span>{pos.visibility.charAt(0).toUpperCase() + pos.visibility.slice(1)}</span>
									</>
								) : (
									<>
										<span role="img" aria-label="moon" style={{ color: 'gray' }}>🌘</span>{' '}
										<span>{pos.visibility.charAt(0).toUpperCase() + pos.visibility.slice(1)}</span>
									</>
								)}
							</div>
						</div>
					</>
				) : (
					<div className="left-panel-row">
						<span>Loading ISS Data...</span>
					</div>
				)}
				
				{/* Keplerian Age */}
				{advanced && (
					<div className="left-panel-section">
						<div className="left-panel-section-title">Keplerian Age</div>
						<div className="left-panel-row">
							<span>
								{advanced.keplerianAge.days}d {advanced.keplerianAge.hours}h{' '}
								{advanced.keplerianAge.minutes}m {advanced.keplerianAge.seconds}s
							</span>
						</div>
						<div className="left-panel-row">
							<small>
								Since TLE epoch ({advanced.keplerianAge.totalSeconds.toFixed(0)} seconds)
							</small>
						</div>
					</div>
				)}
				
				{/* ISS Azimuth */}
				{advanced?.issAzimuth && (
					<div className="left-panel-section">
						<div className="left-panel-section-title">Azimuth (from your location)</div>
						<div className="left-panel-row">
							<span>{advanced.issAzimuth.toFixed(1)}°</span>
						</div>
					</div>
				)}
				
				{/* Sun data */}
				{advanced && (
					<div className="left-panel-section">
						<div className="left-panel-section-title">Sun (Az/El)</div>
						<div className="left-panel-row">
							<span>{advanced.sunAzEl.azimuth.toFixed(1)}° / {advanced.sunAzEl.elevation.toFixed(1)}°</span>
						</div>
					</div>
				)}
				
				{/* Moon data */}
				{advanced && (
					<div className="left-panel-section">
						<div className="left-panel-section-title">Moon</div>
						<div className="left-panel-row">
							<span>Dec: {advanced.moonDecRA.dec.toFixed(1)}° / RA: {advanced.moonDecRA.ra.toFixed(1)}h</span>
						</div>
						<div className="left-panel-row">
							<span>Az: {advanced.moonAzEl.azimuth.toFixed(1)}° / El: {advanced.moonAzEl.elevation.toFixed(1)}°</span>
						</div>
						<div className="left-panel-row">
							<span>Distance: {advanced.moonDistance.toLocaleString()} km</span>
						</div>
					</div>
				)}
				
				{/* Frequencies */}
				{advanced && (
					<div className="left-panel-section">
						<div className="left-panel-section-title">Radio Frequencies</div>
						<div className="left-panel-row">
							<span>TX: {advanced.txFrequency / 1e6} MHz</span>
							<span className="left-panel-unit-separator" />
							<span>RX: {advanced.rxFrequency / 1e6} MHz</span>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
