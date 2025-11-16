// src/components/PostProcessingEffects.jsx

import {
    EffectComposer,
    Bloom,
    DepthOfField,
    Noise,
    ToneMapping,
    Vignette,
} from '@react-three/postprocessing'

export default function PostProcessingEffects() {
    return (
        <EffectComposer multisampling={8}>
            {/*<DepthOfField*/}
            {/*focusDistance={focusDistance}  // distance nette dynamique*/}
            {/*focalLength={0.02}*/}
            {/*bokehScale={3}*/}
            {/*height={480}*/}
            {/*/>*/}
            <Bloom luminanceThreshold={0.1} luminanceSmoothing={3} intensity={2} radius={0.1} />
            <Noise opacity={0.3} premultiply />
            {/*<ChromaticAberration offset={[0.0001, 0.0001]} radialModulation />*/}
            <ToneMapping mode={ToneMapping.ACESFilmicToneMapping} />
            <Vignette eskil={false} offset={0.2} darkness={0.5} />
        </EffectComposer>
    )
}
