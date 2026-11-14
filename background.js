// Background reused from https://michaeljc2605.github.io/script.js
const evolutionHero = document.querySelector('.evolution-hero');
const evolutionBackground = document.querySelector('.evolution-background');
const evolutionCanvas = document.querySelector('.evolution-canvas');

if (evolutionHero && evolutionBackground && evolutionCanvas) {
    let evolutionContext = null;
    try { evolutionContext = evolutionCanvas.getContext('2d'); } catch { /* CSS layers remain available. */ }
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const evolutionStage = evolutionBackground.querySelector('.evolution-progress-stage');
    const evolutionRoot = document.documentElement;
    const particleCount = window.innerWidth < 768 ? 95 : 190;
    const evolutionParticles = Array.from({ length: particleCount }, (_, index) => ({
        x: (index * 0.61803398875) % 1,
        y: (index * 0.38196601125) % 1,
        size: 0.5 + ((index * 17) % 10) / 5,
        speed: 0.08 + ((index * 13) % 10) / 100,
        phase: (index * 2.399963) % (Math.PI * 2),
        depth: 0.35 + ((index * 29) % 65) / 100
    }));

    let evolutionTarget = 0;
    let evolutionDisplay = 0;
    let evolutionFrame;
    let evolutionVisible = document.visibilityState !== 'hidden';
    let evolutionWidth = 0;
    let evolutionHeight = 0;

    const clamp = (value, minimum = 0, maximum = 1) => Math.min(maximum, Math.max(minimum, value));
    const smoothstep = (value) => value * value * (3 - 2 * value);
    const evolutionPalette = [
        ['#33251b', '#8c5f3a', '#c7a574'], // 1.0 steam, coal, paper
        ['#3b2114', '#b7622d', '#f2b45d'], // 2.0 copper, electricity
        ['#1b2a34', '#496b7a', '#a1b5ba'], // 3.0 steel, production lines
        ['#1b2527', '#657879', '#d7e0dd'], // 4.0 automation, clean industry
        ['#17152a', '#48447b', '#887aca'], // 5.0 AI, networks
        ['#071a22', '#12616b', '#70418f']  // 6.0 synthetic, orbital, cosmic
    ];
    const evolutionTextPalette = [
        ['#f5e8cf', '#f4b84a', '#e1c9a2'],
        ['#fff1d0', '#ffb34e', '#e2b786'],
        ['#edf3f1', '#a8c7d1', '#c6d3d5'],
        ['#eff4f0', '#dbe8e2', '#adc0be'],
        ['#f4efff', '#c5bbff', '#c7c1e2'],
        ['#e8fdff', '#7fe9e4', '#c6b9ff']
    ];

    const hexToRgb = (hex) => {
        const value = hex.replace('#', '');
        return {
            r: parseInt(value.slice(0, 2), 16),
            g: parseInt(value.slice(2, 4), 16),
            b: parseInt(value.slice(4, 6), 16)
        };
    };

    const mixHex = (from, to, amount) => {
        const start = hexToRgb(from);
        const end = hexToRgb(to);
        const channel = (key) => Math.round(start[key] + (end[key] - start[key]) * amount);
        return `rgb(${channel('r')}, ${channel('g')}, ${channel('b')})`;
    };

    const getEvolutionProgress = () => {
        const scrollableDistance = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        return clamp(window.scrollY / scrollableDistance);
    };

    const resizeEvolutionCanvas = () => {
        if (!evolutionContext) return;
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
        evolutionWidth = evolutionCanvas.clientWidth;
        evolutionHeight = evolutionCanvas.clientHeight;
        evolutionCanvas.width = Math.floor(evolutionWidth * pixelRatio);
        evolutionCanvas.height = Math.floor(evolutionHeight * pixelRatio);
        evolutionContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const setEvolutionState = (progress) => {
        const warm = 1 - smoothstep(clamp(progress / 0.42));
        const clean = smoothstep(clamp((progress - 0.16) / 0.52));
        const neon = smoothstep(clamp((progress - 0.42) / 0.58));
        const space = smoothstep(clamp((progress - 0.68) / 0.32));
        const stage = Math.min(6, Math.floor(progress * 6) + 1);
        const palettePosition = Math.min(evolutionPalette.length - 1, progress * (evolutionPalette.length - 1));
        const paletteIndex = Math.floor(palettePosition);
        const paletteMix = palettePosition - paletteIndex;
        const currentPalette = evolutionPalette[paletteIndex];
        const nextPalette = evolutionPalette[Math.min(evolutionPalette.length - 1, paletteIndex + 1)];
        const currentTextPalette = evolutionTextPalette[paletteIndex];
        const nextTextPalette = evolutionTextPalette[Math.min(evolutionTextPalette.length - 1, paletteIndex + 1)];

        evolutionBackground.style.setProperty('--evo-progress', progress.toFixed(4));
        evolutionBackground.style.setProperty('--evo-bg-left', mixHex(currentPalette[0], nextPalette[0], paletteMix));
        evolutionBackground.style.setProperty('--evo-bg-mid', mixHex(currentPalette[1], nextPalette[1], paletteMix));
        evolutionBackground.style.setProperty('--evo-bg-right', mixHex(currentPalette[2], nextPalette[2], paletteMix));
        evolutionBackground.style.setProperty('--evo-glow', `rgba(255, 190, 92, ${(0.28 - space * 0.1).toFixed(3)})`);
        evolutionBackground.style.setProperty('--evo-text-main', mixHex(currentTextPalette[0], nextTextPalette[0], paletteMix));
        evolutionBackground.style.setProperty('--evo-text-accent', mixHex(currentTextPalette[1], nextTextPalette[1], paletteMix));
        evolutionBackground.style.setProperty('--evo-text-muted', mixHex(currentTextPalette[2], nextTextPalette[2], paletteMix));
        evolutionRoot.style.setProperty('--evo-text-main', mixHex(currentTextPalette[0], nextTextPalette[0], paletteMix));
        evolutionRoot.style.setProperty('--evo-text-accent', mixHex(currentTextPalette[1], nextTextPalette[1], paletteMix));
        evolutionRoot.style.setProperty('--evo-text-muted', mixHex(currentTextPalette[2], nextTextPalette[2], paletteMix));
        evolutionRoot.style.setProperty('--evo-border', mixHex(currentTextPalette[1], nextTextPalette[1], paletteMix));
        evolutionRoot.style.setProperty('--evo-cursor', mixHex(currentTextPalette[1], nextTextPalette[1], paletteMix));
        evolutionRoot.style.setProperty('--evo-bg-left', mixHex(currentPalette[0], nextPalette[0], paletteMix));
        evolutionRoot.style.setProperty('--evo-bg-mid', mixHex(currentPalette[1], nextPalette[1], paletteMix));
        evolutionRoot.style.setProperty('--evo-bg-right', mixHex(currentPalette[2], nextPalette[2], paletteMix));
        evolutionBackground.style.setProperty('--evo-warm', warm.toFixed(4));
        evolutionBackground.style.setProperty('--evo-clean', clean.toFixed(4));
        evolutionBackground.style.setProperty('--evo-neon', neon.toFixed(4));
        evolutionBackground.style.setProperty('--evo-space', space.toFixed(4));
        evolutionBackground.style.setProperty('--evo-progress-percent', `${(progress * 100).toFixed(2)}%`);
        evolutionStage.textContent = `${stage}.0`;
    };

    const drawEvolutionParticles = (progress, time) => {
        if (!evolutionContext) return;
        evolutionContext.clearRect(0, 0, evolutionWidth, evolutionHeight);

        const warm = 1 - smoothstep(clamp(progress / 0.42));
        const clean = smoothstep(clamp((progress - 0.16) / 0.52));
        const neon = smoothstep(clamp((progress - 0.42) / 0.58));
        const space = smoothstep(clamp((progress - 0.68) / 0.32));

        // Large silhouettes establish industrial scale before the scene becomes digital.
        const industryStrength = Math.max(warm, clean * 0.72);
        if (industryStrength > 0.03) {
            const baseY = evolutionHeight * 0.82;
            evolutionContext.fillStyle = `rgba(8, 9, 15, ${0.64 * industryStrength})`;
            evolutionContext.fillRect(0, baseY, evolutionWidth, evolutionHeight - baseY);

            for (let tower = 0; tower < 7; tower += 1) {
                const x = evolutionWidth * (0.07 + tower * 0.14);
                const width = evolutionWidth * (0.035 + (tower % 2) * 0.014);
                const height = evolutionHeight * (0.12 + (tower % 3) * 0.055);
                evolutionContext.fillRect(x, baseY - height, width, height);
                evolutionContext.fillRect(x + width * 0.35, baseY - height - evolutionHeight * 0.08, width * 0.3, evolutionHeight * 0.08);
            }

            evolutionContext.strokeStyle = `rgba(202, 132, 69, ${0.42 * industryStrength})`;
            evolutionContext.lineWidth = 2;
            evolutionContext.beginPath();
            evolutionContext.moveTo(0, baseY - evolutionHeight * 0.07);
            evolutionContext.lineTo(evolutionWidth, baseY - evolutionHeight * 0.07);
            evolutionContext.stroke();
        }

        // Smoke and dust rise through the first half of the evolution.
        if (warm > 0.02) {
            // Fixed chimney plumes make the smoke readable as industrial smoke, not noise.
            const chimneys = [0.09, 0.23, 0.38, 0.52, 0.68, 0.84];
            chimneys.forEach((chimneyX, chimneyIndex) => {
                const chimneyBase = evolutionHeight * (0.79 - (chimneyIndex % 2) * 0.035);
                for (let puffIndex = 0; puffIndex < 5; puffIndex += 1) {
                    const cycle = (time * 0.000035 * (0.8 + chimneyIndex * 0.04) + puffIndex * 0.19) % 1;
                    const puffX = evolutionWidth * chimneyX + Math.sin(time * 0.0005 + puffIndex + chimneyIndex) * (12 + cycle * 24);
                    const puffY = chimneyBase - cycle * evolutionHeight * 0.48;
                    const puffRadius = 18 + cycle * 38 + (puffIndex % 2) * 12;
                    const plume = evolutionContext.createRadialGradient(puffX, puffY, 0, puffX, puffY, puffRadius);
                    plume.addColorStop(0, `rgba(224, 207, 178, ${0.24 * warm * (1 - cycle * 0.35)})`);
                    plume.addColorStop(0.58, `rgba(100, 82, 68, ${0.17 * warm * (1 - cycle * 0.25)})`);
                    plume.addColorStop(1, 'rgba(35, 27, 22, 0)');
                    evolutionContext.fillStyle = plume;
                    evolutionContext.beginPath();
                    evolutionContext.arc(puffX, puffY, puffRadius, 0, Math.PI * 2);
                    evolutionContext.fill();
                }
            });

            evolutionParticles.forEach((particle, index) => {
                const drift = Math.sin(time * 0.00016 * particle.speed + particle.phase) * 0.025;
                const x = (particle.x + drift + 1) % 1;
                const y = (particle.y - time * 0.000018 * particle.speed + 1) % 1;
                const radius = particle.size * (2 + warm * 7) * particle.depth;
                const smoke = evolutionContext.createRadialGradient(
                    x * evolutionWidth, y * evolutionHeight, 0,
                    x * evolutionWidth, y * evolutionHeight, radius * 8
                );
                smoke.addColorStop(0, `rgba(35, 27, 22, ${0.16 * warm})`);
                smoke.addColorStop(1, 'rgba(35, 27, 22, 0)');
                evolutionContext.fillStyle = smoke;
                evolutionContext.beginPath();
                evolutionContext.arc(x * evolutionWidth, y * evolutionHeight, radius * 8, 0, Math.PI * 2);
                evolutionContext.fill();

                if (index % 7 === 0) {
                    evolutionContext.fillStyle = `rgba(244, 184, 74, ${0.16 * warm})`;
                    evolutionContext.beginPath();
                    evolutionContext.arc(x * evolutionWidth, y * evolutionHeight, particle.size, 0, Math.PI * 2);
                    evolutionContext.fill();
                }
            });
        }

        // Sparks become the first visible hint of electrical and digital systems.
        if (warm > 0.02 && progress < 0.45) {
            const sparkStrength = Math.min(1, warm + clean * 0.6);
            evolutionParticles.slice(0, Math.floor(particleCount * 0.35)).forEach((particle, index) => {
                const x = ((particle.x + time * 0.00002 * particle.speed) % 1) * evolutionWidth;
                const y = (particle.y * 0.72 + 0.2) * evolutionHeight;
                const length = 3 + particle.size * 6;
                evolutionContext.strokeStyle = `rgba(255, 210, 119, ${0.55 * sparkStrength})`;
                evolutionContext.lineWidth = 1;
                evolutionContext.beginPath();
                evolutionContext.moveTo(x, y);
                evolutionContext.lineTo(x + Math.sin(particle.phase + time * 0.002) * 3, y - length);
                evolutionContext.stroke();
            });
        }

        // Circuit nodes and connecting traces emerge through stages 3.0–5.0.
        if (clean > 0.05) {
            const nodes = evolutionParticles.slice(0, Math.floor(particleCount * 0.52));
            nodes.forEach((particle, index) => {
                const x = (particle.x + Math.sin(time * 0.00025 + particle.phase) * 0.018) * evolutionWidth;
                const y = (particle.y + Math.cos(time * 0.0002 + particle.phase) * 0.025) * evolutionHeight;
                const next = nodes[(index + 7) % nodes.length];
                const nextX = next.x * evolutionWidth;
                const nextY = next.y * evolutionHeight;
                evolutionContext.strokeStyle = `rgba(69, 232, 229, ${0.2 * clean * (1 - space * 0.35)})`;
                evolutionContext.lineWidth = 0.7;
                evolutionContext.beginPath();
                evolutionContext.moveTo(x, y);
                evolutionContext.lineTo(nextX, nextY);
                evolutionContext.stroke();
                evolutionContext.fillStyle = `rgba(132, 207, 255, ${0.28 * clean})`;
                evolutionContext.beginPath();
                evolutionContext.arc(x, y, 1.3 + particle.size * 0.35, 0, Math.PI * 2);
                evolutionContext.fill();
            });
        }

        // At 6.0 the network becomes a moving star field and orbital system.
        if (space > 0.02) {
            evolutionParticles.forEach((particle, index) => {
                const orbit = (particle.x - 0.72) * evolutionWidth;
                const x = 0.72 * evolutionWidth + Math.cos(time * 0.00016 * particle.depth + particle.phase) * (Math.abs(orbit) + 70);
                const y = 0.47 * evolutionHeight + Math.sin(time * 0.0002 * particle.depth + particle.phase) * (particle.y * evolutionHeight * 0.65);
                const starAlpha = 0.2 + space * 0.62;
                evolutionContext.fillStyle = `rgba(${index % 3 === 0 ? '211, 132, 255' : '112, 238, 255'}, ${starAlpha})`;
                evolutionContext.beginPath();
                evolutionContext.arc(x, y, particle.size * (0.6 + space), 0, Math.PI * 2);
                evolutionContext.fill();
            });

            // A restrained robotic silhouette emerges as the final industrial form.
            const robotX = evolutionWidth * 0.78;
            const robotY = evolutionHeight * 0.52;
            const robotScale = Math.min(evolutionWidth, evolutionHeight) * 0.0011;
            evolutionContext.strokeStyle = `rgba(112, 238, 255, ${0.6 * space})`;
            evolutionContext.fillStyle = `rgba(18, 34, 62, ${0.42 * space})`;
            evolutionContext.lineWidth = Math.max(1.2, robotScale * 3);
            evolutionContext.beginPath();
            evolutionContext.arc(robotX, robotY - 112 * robotScale, 25 * robotScale, 0, Math.PI * 2);
            evolutionContext.fill();
            evolutionContext.stroke();
            evolutionContext.beginPath();
            evolutionContext.moveTo(robotX - 32 * robotScale, robotY - 82 * robotScale);
            evolutionContext.lineTo(robotX - 42 * robotScale, robotY - 10 * robotScale);
            evolutionContext.lineTo(robotX - 22 * robotScale, robotY + 66 * robotScale);
            evolutionContext.moveTo(robotX + 32 * robotScale, robotY - 82 * robotScale);
            evolutionContext.lineTo(robotX + 42 * robotScale, robotY - 10 * robotScale);
            evolutionContext.lineTo(robotX + 22 * robotScale, robotY + 66 * robotScale);
            evolutionContext.moveTo(robotX - 18 * robotScale, robotY - 12 * robotScale);
            evolutionContext.lineTo(robotX - 58 * robotScale, robotY + 42 * robotScale);
            evolutionContext.moveTo(robotX + 18 * robotScale, robotY - 12 * robotScale);
            evolutionContext.lineTo(robotX + 58 * robotScale, robotY + 42 * robotScale);
            evolutionContext.stroke();
        }
    };

    const renderEvolution = (timestamp = performance.now()) => {
        evolutionDisplay += (evolutionTarget - evolutionDisplay) * (reducedMotion.matches ? 1 : 0.075);
        if (Math.abs(evolutionTarget - evolutionDisplay) < 0.0005) evolutionDisplay = evolutionTarget;
        setEvolutionState(evolutionDisplay);
        drawEvolutionParticles(evolutionDisplay, timestamp);

        if (evolutionVisible && !reducedMotion.matches) {
            evolutionFrame = requestAnimationFrame(renderEvolution);
        } else {
            evolutionFrame = null;
        }
    };

    const requestEvolutionRender = () => {
        evolutionTarget = getEvolutionProgress();
        if (!evolutionFrame && evolutionVisible && !reducedMotion.matches) {
            evolutionFrame = requestAnimationFrame(renderEvolution);
        } else if (reducedMotion.matches) {
            renderEvolution();
        }
    };

    resizeEvolutionCanvas();
    requestEvolutionRender();
    window.addEventListener('scroll', requestEvolutionRender, { passive: true });
    document.addEventListener('visibilitychange', () => {
        evolutionVisible = document.visibilityState !== 'hidden';
        if (evolutionVisible) requestEvolutionRender();
        else if (evolutionFrame) cancelAnimationFrame(evolutionFrame);
        evolutionFrame = null;
    });
    window.addEventListener('resize', () => {
        resizeEvolutionCanvas();
        requestEvolutionRender();
    }, { passive: true });
    window.addEventListener('mousemove', (event) => {
        if (reducedMotion.matches) return;
        const offsetX = (event.clientX / window.innerWidth - 0.5) * -12;
        const offsetY = (event.clientY / window.innerHeight - 0.5) * -8;
        evolutionBackground.style.setProperty('--evo-pointer-x', `${offsetX.toFixed(2)}px`);
        evolutionBackground.style.setProperty('--evo-pointer-y', `${offsetY.toFixed(2)}px`);
    }, { passive: true });
    reducedMotion.addEventListener?.('change', () => {
        evolutionTarget = getEvolutionProgress();
        evolutionDisplay = evolutionTarget;
        requestEvolutionRender();
    });
}

