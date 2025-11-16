import React from 'react';
import './FancyButton.css'; // make sure this path is correct

export default function FancyButton({ children, className = '', onClick }) {
	return (
		<button onClick={onClick} className={`fancy-btn ${className}`}>
			<span>{children}</span>
		</button>
	);
}
