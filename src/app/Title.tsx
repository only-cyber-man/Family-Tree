"use client";

import { LinearTextGradient } from "react-text-gradients-and-animations";

export const Title = () => {
	return (
		<>
			<h1 className="title">
				<b>
					<LinearTextGradient
						angle={45}
						// rainbow
						colors={[
							// "red, orange, yellow, green, blue, indigo, violet, red
							"red",
							"orange",
							"yellow",
							"green",
							"blue",
							"indigo",
							"violet",
						]}
						animate
						animateDuration={10}
						animateDirection={"horizontal"}>
						Example App Name
					</LinearTextGradient>
				</b>
			</h1>
		</>
	);
};
