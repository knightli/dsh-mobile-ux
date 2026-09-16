export function createTextRenderer({ host, onCancel = () => {} }) {
  const element = host.ownerDocument.createElement('div');
  element.setAttribute('data-dsh-mobile-refresh-indicator', '');
  element.setAttribute('role', 'status');
  element.setAttribute('aria-live', 'polite');
  element.style.cssText = 'position:fixed;bottom:calc(env(safe-area-inset-bottom,0px) + 12px);left:50%;z-index:50;pointer-events:none;white-space:nowrap;font:12px system-ui;color:var(--dsw-alias-label-secondary,#aab7cb)';
  let pending = false;
  element.onclick = () => { if (pending) onCancel(); };
  element.onkeydown = event => {
    if (pending && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); onCancel(); }
  };
  host.appendChild(element);
  return {
    update(state) {
      element.dataset.state = state.phase;
      element.hidden = state.phase === 'hidden' || state.reversing;
      element.textContent = state.phase === 'pending' ? `${state.remainingSeconds ?? 3} 秒内将刷新页面，点击此处可取消` : state.phase === 'refreshing' ? '正在刷新…' : state.phase === 'armed' ? '松开手后刷新页面' : '继续上拉';
      pending = state.phase === 'pending';
      element.style.pointerEvents = pending ? 'auto' : 'none';
      element.setAttribute('role', pending ? 'button' : 'status');
      element.tabIndex = pending ? 0 : -1;
      element.style.transform = `translate(-50%, ${Math.max(0, 1 - state.progress) * 40}px)`;
    },
    destroy() { element.remove(); },
  };
}
