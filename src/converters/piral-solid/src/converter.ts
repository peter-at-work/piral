import type { ForeignComponent, BaseComponentProps } from 'piral-core';
import { Component } from 'solid-js';
import { render, createComponent } from 'solid-js/dom';
import { createExtension } from './extension';

export interface SolidConverterOptions {
  /**
   * Defines the name of the root element.
   * @default slot
   */
  rootName?: string;
}

export function createConverter(config: SolidConverterOptions = {}) {
  const { rootName = 'slot' } = config;
  const Extension = createExtension(rootName);
  const convert = <TProps extends BaseComponentProps>(root: Component<TProps>): ForeignComponent<TProps> => ({
    mount(el, props, context) {
      render(() => createComponent(root, { context, ...props }), el);
    },
    unmount(el) {
      render(() => undefined, el);
      el.innerHTML = '';
    },
  });
  convert.Extension = Extension;
  return convert;
}
