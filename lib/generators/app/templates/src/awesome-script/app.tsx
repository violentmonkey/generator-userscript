import { createSignal } from 'solid-js';
import { render } from 'solid-js/web';
import { getPanel, showToast } from '@violentmonkey/ui';
// global CSS
import globalCss from './style.css';
// CSS modules
import styles, { stylesheet } from './style.module.css';

function Counter() {
  const [getCount, setCount] = createSignal(0);
  const handleAmazing = () => {
    setCount((count) => count + 1);
    showToast('Amazing + 1', { theme: 'dark' });
  };
  return (
    <div>
      <button class={styles.plus1} onClick={handleAmazing}>
        Amazing+1
      </button>
      <p>Drag me</p>
      <p>
        <span class={styles.count}>{getCount()}</span> people think this is
        amazing.
      </p>
    </div>
  );
}

// Inject CSS
GM_addStyle(globalCss);

// Let's create a movable panel using @violentmonkey/ui
const panel = getPanel({
  theme: 'dark',
  // If shadowDOM is enabled for `getPanel` (by default), `style` will be injected to the shadow root.
  // Otherwise, it is roughly the same as `GM_addStyle(stylesheet)`.
  style: stylesheet,
});
Object.assign(panel.wrapper.style, {
  top: '10vh',
  left: '10vw',
});
panel.setMovable(true);
panel.show();
render(Counter, panel.body);
