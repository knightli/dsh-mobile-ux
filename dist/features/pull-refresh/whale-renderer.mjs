// Visual reference: docs/prototypes/whale-refresh-demo.html (archived snapshot).
// No DSH selectors, gesture listeners, settings storage, or reload ownership.
export function createWhaleRenderer({ host, onCancel = () => {} }) {
  const document = host.ownerDocument;
  const element = document.createElement('div');
  element.setAttribute('data-dsh-mobile-refresh-indicator', '');
  const root = element.attachShadow({ mode: 'open' });
  root.innerHTML = `<style>    .drag-hint {
      position: absolute;
      inset-inline: 0;
      inset-block-start: 5px;
      z-index: 3;
      text-align: center;
      color: #8291a8;
      font-size: 12px;
      pointer-events: none;
      opacity: 0;
      transform-origin: center center;
      transition: opacity 140ms ease-out;
    }

    .drag-hint strong { color: #c5d5ef; }

    .refresh-stage {
      position: absolute;
      inset-inline: 0;
      inset-block-end: 0;
      height: 126px;
      /* The prompt may travel above the stage after 138%; the preview itself
         remains the clipping boundary. */
      overflow: visible;
      pointer-events: none;
    }

    .refresh-stage.surface-visible .drag-hint { opacity: 1; }

    .whale-layer {
      position: absolute;
      inset-inline: 0;
      inset-block-end: 0;
      height: 126px;
      display: grid;
      place-items: end center;
      pointer-events: none;
    }

    #whale-svg {
      width: min(270px, 78vw);
      height: 126px;
      overflow: visible;
    }

    .refresh-stage:not(.whale-visible) #whale-svg { opacity: 0; }

    .sea {
      position: absolute;
      inset-inline: 0;
      inset-block-end: 0;
      z-index: 2;
      height: var(--surface-height);
      background: #56cde2;
      transform: translateY(var(--sea-offset, 100%));
      overflow: hidden;
    }

    .refresh-stage.surface-visible .sea { transform: translateY(var(--sea-offset, 0%)); }

    .sea::before {
      display: none;
    }

    .sea-wave {
      position: absolute;
      inset-inline: 0;
      inset-block-start: -1px;
      width: 100%;
      height: 10px;
      overflow: visible;
    }


:host { position:fixed; inset:0; z-index:50; pointer-events:none; overflow:hidden; --surface-height:28px; font:12px system-ui; }
.refresh-stage { bottom:0; }
.drag-hint { transition:none; color:var(--dsw-alias-label-secondary,#aab7cb); }
.drag-hint strong { color:inherit; }
.refresh-stage.refreshing .drag-hint strong::after {
  content: ''; display: inline-block; width: 9px; height: 9px; margin-left: 7px;
  border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%;
  vertical-align: -1px; animation: refresh-spin 800ms linear infinite;
}
.cancel-whale { position:absolute; bottom:0; left:0;
  width:100%; height:160px; padding:0; border:0; background:transparent;
  pointer-events:auto; touch-action:manipulation; cursor:pointer; z-index:4; }
@keyframes refresh-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) {
  .refresh-stage.refreshing .drag-hint strong::after { animation: none; }
}
</style>      <div class="refresh-stage" id="refresh-stage">
        <div class="drag-hint" role="status" aria-live="polite"><strong id="prompt">上拉试试</strong></div>
        <div class="whale-layer">
          <svg id="whale-svg" viewBox="0 0 240 126" role="img" aria-label="蓝色卡通鲸鱼">
            <defs>
              <clipPath id="above-water">
                <rect x="0" y="0" width="240" height="92"></rect>
              </clipPath>
            </defs>

            <g id="whale" clip-path="url(#above-water)">
            <g id="spout" opacity="0" fill="none" stroke="#54b9ff" stroke-linecap="round" stroke-linejoin="round">
              <path id="spout-center-drop" d="M0 -10 C-7 -5 -6 5 0 10 C6 5 7 -5 0 -10Z" fill="#54b9ff"></path>
              <path id="spout-left-drop" d="M0 -10 C-7 -5 -6 5 0 10 C6 5 7 -5 0 -10Z" fill="#54b9ff"></path>
              <path id="spout-right-drop" d="M0 -10 C-7 -5 -6 5 0 10 C6 5 7 -5 0 -10Z" fill="#54b9ff"></path>
              <path id="spout-main" d="M120 45 C118 38 118 30 120 24" stroke-width="7" opacity="0"></path>
              <path id="spout-upper-left" d="M120 25 C116 18 108 18 102 25" stroke-width="3.5" opacity="0"></path>
              <path id="spout-upper-right" d="M120 25 C124 18 132 18 138 25" stroke-width="3.5" opacity="0"></path>
              <path id="spout-lower-left" d="M120 33 C112 23 100 25 92 35 C88 40 88 46 88 52" stroke-width="3.5" opacity="0"></path>
              <path id="spout-lower-right" d="M120 33 C128 23 140 25 148 35 C152 40 152 46 152 52" stroke-width="3.5" opacity="0"></path>
            </g>
              <path d="M69 98 C69 64 93 38 120 38 C145 38 163 55 170 79 C180 75 187 66 196 65 C192 73 198 79 209 77 C202 88 186 93 170 87 C168 94 169 98 171 101 C145 107 97 107 69 98Z" fill="#2293e6" stroke="#0e4d8a" stroke-width="3"></path>
              <ellipse cx="120" cy="46" rx="6" ry="3" fill="#0e4d8a"></ellipse>

              <g id="eyes-closed" fill="none" stroke="#0e4d8a" stroke-width="3" stroke-linecap="round">
                <path d="M94 66 Q103 73 112 66"></path>
                <path d="M128 66 Q137 73 146 66"></path>
              </g>
              <g id="eyes-half" opacity="0">
                <path d="M94 67 Q103 63 112 67 L112 71 L94 71Z" fill="#fff"></path>
                <path d="M128 67 Q137 63 146 67 L146 71 L128 71Z" fill="#fff"></path>
                <circle cx="103" cy="68" r="4" fill="#0e4d8a"></circle>
                <circle cx="137" cy="68" r="4" fill="#0e4d8a"></circle>
              </g>
              <g id="eyes-open" opacity="0">
                <circle cx="103" cy="67" r="9" fill="#fff"></circle>
                <circle cx="137" cy="67" r="9" fill="#fff"></circle>
                <circle cx="103" cy="67" r="4" fill="#0e4d8a"></circle>
                <circle cx="137" cy="67" r="4" fill="#0e4d8a"></circle>
              </g>
            </g>
          </svg>
        </div>
        <div class="sea" aria-hidden="true">
          <svg class="sea-wave" viewBox="0 0 240 10" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 5 C15 0 25 0 40 5 S65 10 80 5 S105 0 120 5 S145 10 160 5 S185 0 200 5 S225 10 240 5" fill="none" stroke="#9bf3fb" stroke-width="3" stroke-linecap="round"></path>
          </svg>
        </div>
      </div>`;
  host.appendChild(element);
    const refreshStage = root.querySelector('#refresh-stage');
    const whale = root.querySelector('#whale');
    const eyesClosed = root.querySelector('#eyes-closed');
    const eyesHalf = root.querySelector('#eyes-half');
    const eyesOpen = root.querySelector('#eyes-open');
    const spout = root.querySelector('#spout');
    const spoutMain = root.querySelector('#spout-main');
    const spoutUpperLeft = root.querySelector('#spout-upper-left');
    const spoutUpperRight = root.querySelector('#spout-upper-right');
    const spoutLowerLeft = root.querySelector('#spout-lower-left');
    const spoutLowerRight = root.querySelector('#spout-lower-right');
    const spoutCenterDrop = root.querySelector('#spout-center-drop');
    const spoutLeftDrop = root.querySelector('#spout-left-drop');
    const spoutRightDrop = root.querySelector('#spout-right-drop');
    const dragHint = root.querySelector('.drag-hint');
    const prompt = root.querySelector('#prompt');
    const threshold = 108;
    const finalProgress = 1.6;
    const surfaceReveal = 30;
    const surfaceStart = surfaceReveal / threshold;
    const promptLiftStart = 1.38;
    const promptFadeStart = 2;
    const promptFadeDuration = 0.8;
    const promptLiftRate = 70;

  const whaleButton = document.createElement('button');
  whaleButton.type = 'button';
  whaleButton.className = 'cancel-whale';
  whaleButton.setAttribute('aria-label', '取消刷新');
  whaleButton.hidden = true;
  whaleButton.onpointerdown = event => {
    if (whaleButton.hidden || event.isPrimary === false || event.button !== 0) return;
    // Cancel on contact: do not wait for a synthesized click near the deadline.
    event.preventDefault();
    event.stopPropagation();
    onCancel();
  };
  whaleButton.ontouchstart = event => {
    if (whaleButton.hidden || event.touches.length !== 1) return;
    // Safari can suppress synthetic clicks while a scroll is settling.
    if (event.cancelable) event.preventDefault();
    event.stopPropagation();
    onCancel();
  };
  whaleButton.onclick = event => {
    event?.preventDefault();
    event?.stopPropagation();
    if (!whaleButton.hidden) onCancel();
  };
  refreshStage.appendChild(whaleButton);
  const view = document.defaultView;
  let frame = null;
  let pendingState = null;
  let epoch = null;
  let destroyed = false;
  const stopAnimation = () => {
    if (frame !== null) view.cancelAnimationFrame(frame);
    frame = null; pendingState = null; epoch = null;
  };
  function tick(time) {
    frame = null;
    if (!pendingState || destroyed) return;
    epoch ??= time;
    draw(pendingState, 0.97 + 0.03 * Math.cos((time - epoch) * Math.PI * 2 / 900));
    frame = view.requestAnimationFrame(tick);
  }
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  function draw(state, pendingProgress = 1) {
      element.hidden = state.phase === 'hidden';
      const refreshing = state.phase === 'refreshing';
      const pending = state.phase === 'pending';
      whaleButton.hidden = !pending;
      refreshStage.classList.toggle('refreshing', refreshing);
      // Restore a visible, settled frame even after a long pull faded the prompt away.
      const p = refreshing || pending ? 1.6 : state.progress;
      const isReversing = !refreshing && !pending && state.direction < 0;
      const surfaceProgress = clamp(p / surfaceStart, 0, 1);
      const whaleProgress = clamp((p - surfaceStart) / (1 - surfaceStart), 0, 1);
      const fountainProgress = clamp((p - 1) / (finalProgress - 1), 0, 1);
      const overdrag = Math.max(0, p - finalProgress);
      const finalFrameProgress = pending ? pendingProgress : p > finalProgress
        ? 0.97 + 0.03 * Math.cos(overdrag * Math.PI * 2 / 0.22)
        : fountainProgress;
      // Once the pull passes the final frame, replay the complete 94%–100%
      // fountain segment. Every fountain element must use this same progress
      // value; otherwise only the center jet moves while the side streams
      // remain frozen at 100%.
      const fountainFrameProgress = pending || p > finalProgress ? finalFrameProgress : fountainProgress;
      const y = 62 - whaleProgress * 50;
      const eyeScale = 0.62 + whaleProgress * 0.38;
      const eyeTransform = `translate(120 68) scale(${eyeScale}) translate(-120 -68)`;
      const arcProgress = clamp((fountainFrameProgress - 0.72) / 0.28, 0, 1);
      const launchProgress = clamp(fountainFrameProgress / 0.9, 0, 1);
      const riseProgress = clamp(fountainFrameProgress / 0.3, 0, 1);
      const fallingDropFade = clamp((launchProgress - 0.68) / 0.32, 0, 1);
      const jetRiseProgress = fountainFrameProgress < 0.72
        ? fountainFrameProgress / 0.72
        : 1;
      const mainTop = pending || p > finalProgress
        ? 8 + (1 - finalFrameProgress) * 70
        : 28 - jetRiseProgress * 20;
      const splashJetProgress = clamp(fountainFrameProgress / 0.72, 0, 1);
      const splashTop = 28 - splashJetProgress * 20;
      const dropY = 43 - 100 * launchProgress + 132 * launchProgress * launchProgress;
      const dropSpread = 3 + launchProgress * 42;
      const centerDropY = 43 - riseProgress * 21;
      const velocityY = -100 + 264 * launchProgress;
      const leftVelocityAngle = Math.atan2(velocityY, -42) * 180 / Math.PI;
      const rightVelocityAngle = Math.atan2(velocityY, 42) * 180 / Math.PI;
      const upperSpan = 4 + arcProgress * 22;
      const upperPeakY = splashTop - arcProgress * 9;
      const upperLeftPath = `M120 ${splashTop + 2} C${120 - upperSpan * 0.2} ${upperPeakY} ${120 - upperSpan * 0.8} ${upperPeakY} ${120 - upperSpan} ${splashTop + 2}`;
      const upperRightPath = `M120 ${splashTop + 2} C${120 + upperSpan * 0.2} ${upperPeakY} ${120 + upperSpan * 0.8} ${upperPeakY} ${120 + upperSpan} ${splashTop + 2}`;
      const lowerStartY = splashTop + 21;
      const lowerSpan = 8 + arcProgress * 29;
      const lowerEndY = lowerStartY + 21 + arcProgress * 18;
      const lowerPeakY = lowerStartY - arcProgress * 10;
      const lowerLeftPath = `M120 ${lowerStartY} C${120 - lowerSpan * 0.25} ${lowerPeakY} ${120 - lowerSpan * 0.78} ${lowerPeakY} ${120 - lowerSpan} ${lowerEndY} C${120 - lowerSpan - 2} ${lowerEndY + 5} ${120 - lowerSpan - 1} ${lowerEndY + 8} ${120 - lowerSpan} ${lowerEndY + 12}`;
      const lowerRightPath = `M120 ${lowerStartY} C${120 + lowerSpan * 0.25} ${lowerPeakY} ${120 + lowerSpan * 0.78} ${lowerPeakY} ${120 + lowerSpan} ${lowerEndY} C${120 + lowerSpan + 2} ${lowerEndY + 5} ${120 + lowerSpan + 1} ${lowerEndY + 8} ${120 + lowerSpan} ${lowerEndY + 12}`;

      refreshStage.style.setProperty('--sea-offset', `${100 - surfaceProgress * 100}%`);
      refreshStage.classList.toggle('surface-visible', p > 0);
      refreshStage.classList.toggle('whale-visible', p >= surfaceStart);
      whale.setAttribute('transform', `translate(0 ${y})`);
      eyesClosed.setAttribute('transform', eyeTransform);
      eyesHalf.setAttribute('transform', eyeTransform);
      eyesOpen.setAttribute('transform', eyeTransform);
      spoutMain.setAttribute('d', `M120 45 C118 38 118 ${mainTop + 8} 120 ${mainTop}`);
      spoutMain.setAttribute('stroke-width', `${4 + jetRiseProgress * 5}`);
      spoutMain.style.opacity = String(clamp(fountainFrameProgress / 0.28, 0, 1));
      spoutUpperLeft.setAttribute('d', upperLeftPath);
      spoutUpperRight.setAttribute('d', upperRightPath);
      spoutLowerLeft.setAttribute('d', lowerLeftPath);
      spoutLowerRight.setAttribute('d', lowerRightPath);
      spoutUpperLeft.style.opacity = String(arcProgress);
      spoutUpperRight.style.opacity = String(arcProgress);
      spoutLowerLeft.style.opacity = String(arcProgress);
      spoutLowerRight.style.opacity = String(arcProgress);
      spoutCenterDrop.setAttribute('transform', `translate(120 ${centerDropY})`);
      const centerDropOpacity = 1 - clamp((fountainFrameProgress - 0.25) / 0.5, 0, 1);
      spoutCenterDrop.style.opacity = isReversing ? '0' : String(centerDropOpacity);
      spoutLeftDrop.setAttribute('transform', `translate(${120 - dropSpread} ${dropY}) rotate(${leftVelocityAngle + 90})`);
      spoutRightDrop.setAttribute('transform', `translate(${120 + dropSpread} ${dropY}) rotate(${rightVelocityAngle + 90})`);
      const sideDropOpacity = 1 - fallingDropFade;
      spoutLeftDrop.style.opacity = isReversing ? '0' : String(sideDropOpacity);
      spoutRightDrop.style.opacity = isReversing ? '0' : String(sideDropOpacity);
      eyesClosed.style.opacity = whaleProgress < 0.28 ? '1' : '0';
      eyesHalf.style.opacity = whaleProgress >= 0.28 && whaleProgress < 0.58 ? '1' : '0';
      eyesOpen.style.opacity = whaleProgress >= 0.58 ? '1' : '0';
      spout.style.opacity = p >= 1 ? '1' : '0';
      const promptLift = Math.max(0, p - promptLiftStart) * promptLiftRate;
      const promptOpacity = 1 - clamp((p - promptFadeStart) / promptFadeDuration, 0, 1);
      const promptScale = 1 + clamp(
        (p - promptLiftStart) / (promptFadeStart + promptFadeDuration - promptLiftStart),
        0,
        1,
      ) * 0.35;
      dragHint.style.transform = `translateY(${-promptLift}px) scale(${promptScale})`;
      dragHint.style.opacity = isReversing || p <= 0 ? '0' : String(promptOpacity);
      prompt.textContent = pending ? `${state.remainingSeconds ?? 3} 秒内将刷新页面，点击此处可取消` : refreshing ? '正在刷新…' : isReversing
        ? ''
        : p >= 1 ? '喷水中，松手刷新' : p >= surfaceStart ? '继续上拉' : '上拉试试';

  }
  return {
    update(state) {
      if (destroyed) return;
      if (state.phase === 'pending') {
        if (!pendingState) draw(state);
        else prompt.textContent = `${state.remainingSeconds ?? 3} 秒内将刷新页面，点击此处可取消`;
        pendingState = state;
        if (frame === null && view?.requestAnimationFrame) frame = view.requestAnimationFrame(tick);
      } else {
        stopAnimation();
        draw(state);
      }
    },
    retreat(onComplete) {
      if (destroyed) return;
      stopAnimation();
      const reduced = view?.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      const retreatState = progress => ({ phase: progress > 0 ? 'cancelling' : 'hidden', progress, direction: -1 });
      if (!view?.requestAnimationFrame || reduced) {
        draw(retreatState(0)); onComplete(); return;
      }
      draw(retreatState(1.6));
      let started = null;
      const retreatTick = time => {
        frame = null;
        if (destroyed) return;
        started ??= time;
        const t = Math.min(1, (time - started) / 500);
        const eased = t * t * (3 - 2 * t);
        draw(retreatState(1.6 * (1 - eased)));
        if (t === 1) onComplete();
        else frame = view.requestAnimationFrame(retreatTick);
      };
      frame = view.requestAnimationFrame(retreatTick);
    },
    destroy() { destroyed = true; stopAnimation(); element.remove(); },
  };
}
