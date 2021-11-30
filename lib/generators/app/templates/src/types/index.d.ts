import * as dom from '@violentmonkey/dom';
import * as ui from '@violentmonkey/ui';
import { VChildren, DomNode } from '@gera2ld/jsx-dom';

declare global {
  const VM: typeof dom & typeof ui;

  namespace JSX {
    type Element = VChildren; // Change to DomNode if jsxFactory is set to VM.hm
  }
}
