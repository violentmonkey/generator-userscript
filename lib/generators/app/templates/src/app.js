// global CSS
import globalCss from './style.css';
// CSS modules
import styles, { stylesheet } from './style.module.css';

function Greetings() {
  return (
    <>
      <div className={styles.title}>hello</div>
      <p className={styles.desc}>This is a panel. You can drag to move it.</p>
    </>
  );
}

// Let's create a movable panel using @violentmonkey/ui
const panel = VM.getPanel({
  content: <Greetings />,
  theme: 'dark',
  style: [globalCss, stylesheet].join('\n'),
});
panel.wrapper.style.top = '100px';
panel.setMovable(true);
panel.show();

