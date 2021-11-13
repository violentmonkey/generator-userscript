import * as dom from '@violentmonkey/dom';
import * as ui from '@violentmonkey/ui';

declare global {
  const VM: typeof dom & typeof ui;
}
