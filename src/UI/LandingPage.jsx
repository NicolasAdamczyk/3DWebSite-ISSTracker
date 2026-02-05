import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import FancyButton from "./FancyButton.jsx";
import logo2 from '../assets/Logo_2.png';
import screenBg from '../assets/screen.png'; // Ajoute cette ligne

export default function LandingPage({ onStart, isVisible }) {
	const containerRef = useRef(null);
	const titleRef = useRef(null);
	const subtitleRef = useRef(null);
	const buttonRef = useRef(null);

	useEffect(() => {
		if (isVisible) {
			// Timeline pour enchaîner les animations
			const tl = gsap.timeline();

			tl.fromTo(
				titleRef.current,
				{ opacity: 0, x: -50 },
				{ opacity: 1, x: 0, duration: 1, ease: "power3.out" }
			)
				.fromTo(
					subtitleRef.current,
					{ opacity: 0, x: -50 },
					{ opacity: 1, x: 0, duration: 0.8, ease: "power3.out" },
					"-=0.6" // chevauchement avec la précédente
				)
				.fromTo(
					buttonRef.current,
					{ opacity: 0, x: -50 },
					{ opacity: 1, x: 0, duration: 0.8, ease: "power3.out" },
					"-=0.5"
				);
		}
	}, [isVisible]);

	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					key="landing"
					initial={{ opacity: 1 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.8 }}
					className="fixed inset-0 bg-black text-white z-50 pointer-events-auto"
					ref={containerRef}
				>
					{/* Image de fond floutée et assombrie */}
					<div
						className="absolute inset-0 z-[-1] bg-cover bg-center blur-md opacity-40"
						style={{
							backgroundImage: `url(${screenBg})`,
						}}
					/>

					{/* Logo en haut à gauche */}
					<div className="fixed top-10 left-14">
						<img src={logo2} alt="Logo_2" />
					</div>

					{/* Contenu centré */}
					<div className="flex flex-col justify-center h-full px-14 pt-10 pb-16">
						<div className="flex flex-col items-center text-center flex-grow justify-center gap-12">
							{/* Titre principal */}
							<h1
								ref={titleRef}
								className="text-[3.375rem] font-bold leading-snug"
								style={{ fontFamily: 'Foundry Context Bold, sans-serif' }}
							>
								Discover The ISS Like Never Before
							</h1>

							{/* Sous-titre */}
							<p
								ref={subtitleRef}
								className="text-sm tracking-[0.05em] max-w-2xl"
								style={{ fontFamily: 'Foundry Context Medium, sans-serif' }}
							>
								Experience real-time tracking, stunning realism, and space like you’re aboard
							</p>

							{/* Bouton Start Now */}
							<div ref={buttonRef}>
								<FancyButton onClick={onStart}>
									Start Now
								</FancyButton>
							</div>

							{/* Ligne + 4 blocs (ex-"footer") */}
							<div className="flex flex-col items-center gap-6 mt-10">
								<div className="w-full h-px bg-white opacity-20" />

								<div className="flex flex-wrap justify-center gap-8 text-sm max-w-5xl text-center">
									<p className="max-w-[12rem]">Real-time orbital exploration, visualized and analyzed.</p>
									<p className="max-w-[12rem]">Track the ISS path, country flyovers, and environmental conditions</p>
									<p className="max-w-[12rem]">Dive into dynamic stats, solar weather, and live satellite activity</p>
									<p className="max-w-[12rem]">Explore live altitude & velocity changes in real time</p>
								</div>
							</div>
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	)
}
