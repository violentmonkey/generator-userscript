import { css, classMap } from './style.module.css';

export function getGreetings() {
  return (
    <>
      <div className={classMap.panel}>
        hello
      </div>
      <style>{css}</style>
    </>
  );
}
