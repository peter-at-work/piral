import * as Riot from 'riot';
import type { ForeignComponent, BaseComponentProps } from 'piral-core';
import { createExtension } from './extension';

export interface RiotConverterOptions {
  /**
   * Defines the name of the Riot extension element.
   * @default riot-extension
   */
  extensionName?: string;
}

interface RiotState<TProps> {
  app: Riot.RiotComponent<TProps>;
}

export function createConverter(config: RiotConverterOptions = {}) {
  const { extensionName = 'riot-extension' } = config;
  const Extension = createExtension(extensionName);
  const convert = <TProps extends BaseComponentProps>(
    component: Riot.RiotComponentShell<TProps>,
    captured?: Record<string, any>,
  ): ForeignComponent<TProps> => {
    const mountApp = Riot.component(component);

    return {
      mount(el, props, ctx, locals: RiotState<TProps>) {
        locals.app = mountApp(el, {
          ...captured,
          ...ctx,
          ...props,
        });
      },
      unmount(el, locals: RiotState<TProps>) {
        locals.app.unmount(true);
        el.innerHTML = '';
        locals.app = undefined;
      },
    };
  };
  convert.Extension = Extension;
  return convert;
}
