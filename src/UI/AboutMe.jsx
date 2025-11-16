// AboutMe.jsx
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './AboutMe.css';
import profileImage from '../assets/profile.png';
import FancyButton from './FancyButton.jsx';

export default function AboutMe({ onClose }) {
	const overlayRef = useRef();
	
	useEffect(() => {
		// Slide up à l'ouverture
		gsap.fromTo(
			overlayRef.current,
			{ y: '100%', opacity: 0 },
			{ y: '0%', opacity: 1, duration: 0.5, ease: 'power3.out' }
		);
		
		return () => {
			// On pourrait ajouter un cleanup ici si nécessaire
		};
	}, []);
	
	const handleClose = () => {
		// Slide down à la fermeture
		gsap.to(overlayRef.current, {
			y: '100%',
			opacity: 0,
			duration: 0.4,
			ease: 'power3.in',
			onComplete: onClose
		});
	};
	
	return (
		<div className="about-me-overlay" ref={overlayRef}>
			<img src={profileImage} alt="Profile" />
			<h1>
				<span>I'm Nicolas Adamczyk</span>, Computer Vision student based in Paris
			</h1>
			<p>
				I'm a student at the University of Paris Cité since 2022. I specialize in computer vision and enjoy exploring the intersection of AI and space technologies. I maintain and experiment with AI and space-related software projects.
			</p>
			
			<div className="about-me-buttons">
				<FancyButton onClick={() => window.open('https://www.linkedin.com/in/nicolasadamczyk/', '_blank')}>
					Connect with me
				</FancyButton>
				<FancyButton onClick={() => window.open('https://www.linkedin.com/in/nicolasadamczyk/', '_blank')}>
					My Resume
				</FancyButton>
				<div className="about-me-close-button">
					<FancyButton onClick={handleClose}>Back</FancyButton>
				</div>
			</div>
		</div>
	);
}
