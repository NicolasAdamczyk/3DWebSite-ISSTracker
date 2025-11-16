// ExpandableIconButton.jsx
import React, { useState, useRef } from 'react';
import './ExpandableInfoButton.css';

export default function ExpandableIconButton({ icon, text }) {
	const [expanded, setExpanded] = useState(false);
	const buttonRef = useRef(null);
	const [rectPos, setRectPos] = useState({ top: 0, left: 0, width: 0, height: 0 });

	const toggleExpand = () => {
		if (buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect();
			setRectPos({
				top: rect.top + window.scrollY,
				left: rect.left + window.scrollX,
				width: rect.width,
				height: rect.height,
			});
		}
		setExpanded(e => !e);
	};

	return (
		<>
			<button
				ref={buttonRef}
				className="expandable-icon-btn"
				onClick={toggleExpand}
				aria-expanded={expanded}
			>
				<div className="icon">{icon}</div>
				<span className="label">{text}</span>
			</button>

			{expanded && (
				<div
					className="expanded-content"
					style={{
						top: rectPos.top,
						left: rectPos.left,
						width: rectPos.width,
						height: rectPos.height,
					}}
				>
					<p>Voici votre contenu dans le rectangle.</p>
				</div>
			)}
		</>
	);
}
