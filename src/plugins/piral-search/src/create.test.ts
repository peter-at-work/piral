import { Atom, swap } from '@dbeining/react-atom';
import { createSearchApi } from './create';

function createMockContainer() {
  const state = Atom.of({
    registry: {
      extensions: {},
    },
  });
  return {
    context: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
      defineActions() {},
      state,
      readState: jest.fn(),
      dispatch(update) {
        swap(state, update);
      },
    } as any,
    api: {
      meta: {},
    } as any,
  };
}

const moduleMetadata = {
  name: 'my-module',
  version: '1.0.0',
  link: undefined,
  custom: undefined,
  hash: '123',
};

describe('Create Search API Extensions', () => {
  it('createCoreApi can register and unregister a search provider', () => {
    const container = createMockContainer();
    container.context.registerSearchProvider = jest.fn();
    container.context.unregisterSearchProvider = jest.fn();
    const api = (createSearchApi()(container.context) as any)(container.api, moduleMetadata);
    api.registerSearchProvider('my-sp', () => Promise.resolve([]));
    expect(container.context.registerSearchProvider).toHaveBeenCalledTimes(1);
    expect(container.context.unregisterSearchProvider).toHaveBeenCalledTimes(0);
    api.unregisterSearchProvider('my-sp');
    expect(container.context.registerSearchProvider).toHaveBeenCalledTimes(1);
    expect(container.context.unregisterSearchProvider.mock.calls[0][0]).toBe(
      container.context.registerSearchProvider.mock.calls[0][0],
    );
  });

  it('createCoreApi registration of a search provider wraps it', () => {
    const container = createMockContainer();
    container.context.registerSearchProvider = jest.fn();
    container.context.unregisterSearchProvider = jest.fn();
    const api = (createSearchApi()(container.context) as any)(container.api, moduleMetadata);
    const search = jest.fn();
    api.registerSearchProvider('my-sp', search);
    container.context.registerSearchProvider.mock.calls[0][1].search('foo');
    expect(search).toHaveBeenCalledWith('foo', container.api);
  });
});
