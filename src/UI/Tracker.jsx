import FancyButton from "./FancyButton.jsx";
import ExpandableIconButton from './ExpandableIconButton.jsx';
import { useEffect, useState } from "react";
import LeftPanel from "./LeftPanel.jsx";
import { useSceneControls } from '../SceneControlsContext'
import CenterPanel from "./CenterPanel.jsx";
import { fetchWeatherAtTime } from "../utils/fetchWeather.js";
import { toggleFullscreen } from "../utils/fullScreen.js";
import IconFullScreen from "../assets/IconFullScreen.jsx";
import IconLiveStream from "../assets/IconLiveStream.jsx";
import IconPlus from "../assets/IconPlus.jsx";
import IconMinus from "../assets/IconMinus.jsx";
import IconImaginaryLines from "../assets/IconImaginaryLines.jsx";
import IconRadar from "../assets/IconRadar.jsx";
import IconShare from "../assets/IconShare.jsx";
import IconExitFullScreen from "../assets/IconExitFullScreen.jsx";
import AboutMe from './AboutMe.jsx';

import IconIss from "../assets/IconIss.jsx";
import './PassPredictionPanel.css'
import './ExpandableInfoButton.css'
import './FancyButton.css'
import IconArrowUp from '../assets/IconArrowUp.jsx'
import ExpandableSearchBar from './ExpandableSearchBar.jsx'

export default function Tracker() {
	const { setFocusTarget } = useSceneControls();
	const { zoomIn, zoomOut } = useSceneControls();
	const { toggleGridLines } = useSceneControls(); 
	const { recenterCamera } = useSceneControls();
	const { setThermalView } = useSceneControls();
	const { centerPanelCity, closeCenterPanel } = useSceneControls();

	const [passPrediction, setPassPrediction] = useState(null);
	const [weatherDataMap, setWeatherDataMap] = useState({});
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [showLeftPanel, setShowLeftPanel] = useState(true);
	const [showAboutMe, setShowAboutMe] = useState(false);
	const [activePanel, setActivePanel] = useState(null);
	const [prevLeftPanelState, setPrevLeftPanelState] = useState(true);
	const [now, setNow] = useState(new Date());
	
	useEffect(() => {
		const interval = setInterval(() => {
			setNow(new Date());
		}, 1000);
		
		return () => clearInterval(interval); // cleanup on unmount
	}, []);

	// Écoute de l'événement pour recevoir les prédictions
	useEffect(() => {
		const handler = (e) => setPassPrediction(e.detail);
		window.addEventListener('iss-pass-prediction', handler);
		return () => window.removeEventListener('iss-pass-prediction', handler);
	}, []);
	
	useEffect(() => {
		if (centerPanelCity) {
			setPrevLeftPanelState(showLeftPanel); // save current state
			setShowLeftPanel(false);             // hide panel
		} else {
			setShowLeftPanel(prevLeftPanelState); // restore previous state
		}
	}, [centerPanelCity]);

	// Plein écran
	useEffect(() => {
		const handleChange = () => {
			setIsFullscreen(!!document.fullscreenElement);
		};
		document.addEventListener('fullscreenchange', handleChange);
		return () => document.removeEventListener('fullscreenchange', handleChange);
	}, []);

	const toggleLeftPanel = () => setShowLeftPanel(!showLeftPanel);
	const closePanel = () => setActivePanel(null);

	// Charger la météo pour chaque passage si nécessaire
	useEffect(() => {
		if (!Array.isArray(passPrediction)) return;
		
		passPrediction.forEach((pass) => {
			if (!pass?.start || isNaN(new Date(pass.start))) return;
			
			const startDate = new Date(pass.start);
			const key = startDate.getTime();
			
			if (weatherDataMap[key]) return;
			
			fetchWeatherAtTime(pass.lat, pass.lon, startDate).then((data) => {
				setWeatherDataMap(prev => ({
					...prev,
					[key]: data
				}));
			});
		});
	}, [passPrediction]);


	return (
		
		<div className="absolute inset-0 text-white pointer-events-none">
			
			<img className="absolute top-10 left-14 pointer-events-auto" src="/src/assets/Logo_2.png" alt="Logo_2" />
			
			<div className="font-f1 absolute top-13.5 right-14 pointer-events-auto">
				<p>
					<span className="date-part">
						{new Intl.DateTimeFormat('en-GB', {
							timeZone: 'UTC',
							weekday: 'short',
							year: 'numeric',
							month: 'short',
							day: '2-digit',
						}).format(now)}
					</span>{' '}
						<span className="time-part">
						{new Intl.DateTimeFormat('en-GB', {
							timeZone: 'UTC',
							hour: '2-digit',
							minute: '2-digit',
							second: '2-digit',
							hour12: false,
						}).format(now)}
					</span>{' '}
					UTC
				</p>
			</div>
			
			<LeftPanel isVisible={showLeftPanel} />

			<div className="pointer-events-auto">
				{centerPanelCity && (
					<CenterPanel isVisible={true} onClose={closeCenterPanel}>
						{Array.isArray(passPrediction) && passPrediction.length > 0 ? (
							passPrediction[0].found ? (
								passPrediction.map((pass, index) => {
									const weather = weatherDataMap[pass.start.getTime()];
									const options = { timeZone: pass.timezone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
									const dateOptions = { timeZone: pass.timezone, weekday: 'short', year: 'numeric', month: 'short', day: '2-digit' };

									// Probabilité d'observation basée sur couverture nuageuse
									let visibilityProbabilityLabel = 'Very High';

									if (weather?.clouds > 90) {
										visibilityProbabilityLabel = 'Very Low';
									} else if (weather?.clouds > 70) {
										visibilityProbabilityLabel = 'Low';
									} else if (weather?.clouds > 50) {
										visibilityProbabilityLabel = 'Moderate';
									} else if (weather?.clouds > 30) {
										visibilityProbabilityLabel = 'High';
									} else {
										visibilityProbabilityLabel = 'Very High';
									}

									const getUserCity = () => {
										const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
										const city = tz.split('/')[1] || tz;
										return city.replace(/_/g, ' ');
									};

									return (
										<div key={index} className="pass-section">
											<h2 className="pass-section-title">
												ISS Overpass #{index + 1} above {pass.city}
											</h2>

											<div className="pass-content-row">
												{/* Colonne 1 : Données du passage */}
												<div className="pass-info-block">
													<div className="pass-row"><strong>📅 Date:</strong> {pass.start.toLocaleDateString('en-US', dateOptions)}</div>
													<div className="pass-row"><strong>🕒 Start Time:</strong> {pass.start.toLocaleTimeString('en-US', options)} (Your Local time : {getUserCity()})</div>
													<div className="pass-row"><strong>🛑 End Time:</strong> {pass.end.toLocaleTimeString('en-US', options)} (Your Local time : {getUserCity()})</div>
													<div className="pass-row"><strong>⏱ Duration:</strong> {pass.duration.toFixed(1)} minutes</div>
													<div className="pass-row"><strong>📡 Visibility Radius:</strong> {pass.radius} km</div>
												</div>

												{/* Séparateur vertical */}
												<div className="pass-vertical-separator" />

												{/* Colonne 2 : Météo */}
												<div className="pass-info-block">
													{weather ? (
														<>
															<div className="pass-row"><strong>🌥️ Condition: </strong> {weather.condition}</div>
															<div className="pass-row"><strong>☁️ Cloud cover: </strong> {weather.clouds}%</div>
															{/*<div className="pass-row"><strong>👁️ Visibility: </strong> {(weather.visibility / 1000).toFixed(1)} km</div>*/}
															{/*<div className="pass-row"><strong>🔭 Estimated chance to see the ISS: </strong> <strong>{visibilityProbabilityLabel}</strong></div>*/}
														</>
													) : (
														<div className="pass-row">Loading weather data...</div>
													)}
												</div>

												<div className="pass-horizontal-separator" />
											</div>
										</div>
									);
								})
							) : (
								<div className="pass-section pass-no-prediction">
									❌ No ISS passes predicted over {passPrediction[0].city} in the next few days
								</div>
							)
						) : (
							<div className="pass-section pass-no-selection">
								Select a city to view upcoming ISS passes
							</div>
						)}
					</CenterPanel>
				)}

				{activePanel === 'video' && (
					<CenterPanel isVisible={true} onClose={() => closePanel(false)}>
						<iframe
							width="100%"
							height="100%"
							src="https://www.youtube-nocookie.com/embed/H999s0P1Er0"
							title="NASA Live Stream"
							frameBorder="0"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
							allowFullScreen
						/>
					</CenterPanel>
				)}
			</div>


			<div className="focus-buttons">
				<FancyButton onClick={() => setFocusTarget('earth')}>Focus Earth</FancyButton>
				<FancyButton onClick={() => setFocusTarget('iss')}>Focus ISS</FancyButton>
			</div>

			<div className="right-buttons">
				<ExpandableIconButton
					icon={<IconIss style={{ width: '24px', height: '24px' }} />}
					text="Orbital Data"
					onClick={toggleLeftPanel}
				/>
				<ExpandableIconButton
					icon={<IconRadar style={{ width: '20px', height: '20px' }} />}
					text="Recenter"
					onClick={recenterCamera}
				/>
				<ExpandableIconButton
					icon={<IconShare style={{ width: '20px', height: '20px' }} />}
					text="Share"
					onClick={toggleLeftPanel}
				/>
				<ExpandableIconButton
					icon={<IconImaginaryLines style={{ width: '24px', height: '24px' }} />}
					text="Toggle Imaginary Lines"
					onClick={toggleGridLines}
				/>
				<ExpandableIconButton
					icon={<IconPlus style={{ width: '20px', height: '20px' }} />}
					text="Zoom In"
					onClick={zoomIn}
				/>
				<ExpandableIconButton
					icon={<IconMinus style={{ width: '28px', height: '28px' }} />}
					text="Zoom Out"
					onClick={zoomOut}
				/>
				<ExpandableIconButton
					icon={<IconLiveStream style={{ width: '24px', height: '24px' }} />}
					text="Watch Live Stream"
					onClick={() => setActivePanel('video')}
				/>
				<ExpandableIconButton
					icon={<IconRadar style={{ width: '24px', height: '24px' }} />}
					text="Thermal View"
					onClick={() => {
						setFocusTarget('iss');
						setThermalView(v => !v);
					}}
				/>
				<ExpandableIconButton
					icon={isFullscreen ? <IconExitFullScreen style={{ width: '20px', height: '20px' }} /> : <IconFullScreen style={{ width: '20px', height: '20px' }} />}
					text="Fullscreen"
					onClick={toggleFullscreen}
				/>
			</div>
			
			<div className="see-more-button pointer-events-auto">
				<ExpandableIconButton
					icon={<IconArrowUp style={{ width: '24px', height: '24px' }} />}
					text="About Me"
					onClick={() => setShowAboutMe(true)}
				/>
			</div>
			
			{showAboutMe && <AboutMe onClose={() => setShowAboutMe(false)} />}
		</div>
	);
}
