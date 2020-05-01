// global CSS
import globalCss from './style.css';
// CSS modules
import styles, { stylesheet } from './style.module.css';

export function getGreetings() {
  return (
    <>
      <div className={styles.panel}>
        hello
      </div>
      <style>{globalCss}</style>
      <style>{stylesheet}</style>
    </>
  );
}
