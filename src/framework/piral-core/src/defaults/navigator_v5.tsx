import * as React from 'react';
import type { History, Location, Action } from 'history';
import { __RouterContext as RouterContext, Redirect, useLocation } from 'react-router';
import { NavigationApi } from '../types';

let _nav: History;
const _noop = () => {};

export function useRouterContext() {
  return React.useContext(RouterContext);
}

export function useCurrentNavigation() {
  const ctx = useRouterContext();
  const location = useLocation();

  React.useEffect(() => {
    if (_nav) {
      window.dispatchEvent(
        new CustomEvent('piral-navigate', {
          detail: {
            location,
          },
        }),
      );
    }
  }, [location]);

  React.useEffect(() => {
    _nav = ctx.history;

    return () => {
      _nav = undefined;
    };
  }, []);
}

export function createRedirect(to: string) {
  return () => <Redirect to={to} />;
}

export function createNavigation(): NavigationApi {
  const enhance = (location: Location, action: Action) => ({
    action,
    location: {
      get href() {
        return _nav.createHref(location);
      },
      ...location,
    },
  });

  return {
    get path() {
      if (_nav) {
        return _nav.location.pathname;
      }

      return location.pathname;
    },
    push(target, state) {
      if (_nav) {
        _nav.push(target, state);
      }
    },
    replace(target, state) {
      if (_nav) {
        _nav.replace(target, state);
      }
    },
    go(n) {
      if (_nav) {
        _nav.go(n);
      }
    },
    block(blocker) {
      if (!_nav) {
        return _noop;
      }

      return _nav.block((location, action) => blocker(enhance(location, action)));
    },
    listen(listener) {
      const handler = (e: CustomEvent) => listener(enhance(e.detail.location, _nav.action));

      window.addEventListener('piral-navigate', handler);

      return () => {
        window.removeEventListener('piral-navigate', handler);
      };
    },
    get router() {
      return {
        history: _nav,
      };
    },
  };
}
