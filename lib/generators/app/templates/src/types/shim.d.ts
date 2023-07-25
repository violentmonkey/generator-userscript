declare namespace JSX {
  /**
   * JSX.Element can be different based on pragma in babel config:
   * - VNode   - when jsxFactory is VM.h
   * - DomNode - when jsxFactory is VM.hm
   */
  type Element = import('@gera2ld/jsx-dom').VNode;
}
