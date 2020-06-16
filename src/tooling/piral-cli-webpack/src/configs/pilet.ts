import * as webpack from 'webpack';
import * as TerserPlugin from 'terser-webpack-plugin';
import { PiletSchemaVersion } from 'piral-cli';
import { PiletWebpackPlugin } from 'pilet-webpack-plugin';
import { join } from 'path';
import { getRules, getPlugins, extensions, getVariables } from './common';

export async function getPiletConfig(
  baseDir: string,
  template: string,
  dist: string,
  filename: string,
  externals: Array<string>,
  piral: string,
  schema: PiletSchemaVersion,
  develop = false,
  sourceMaps = true,
  contentHash = true,
  minimize = true,
  publicPath = '/',
  progress = false,
): Promise<webpack.Configuration> {
  const production = !develop;
  const name = process.env.BUILD_PCKG_NAME;
  const version = process.env.BUILD_PCKG_VERSION;

  return {
    devtool: sourceMaps ? (develop ? 'cheap-module-source-map' : 'source-map') : false,

    mode: develop ? 'development' : 'production',

    entry: {
      main: [join(__dirname, '..', 'set-path'), template],
    },

    output: {
      publicPath,
      path: dist,
      filename,
      chunkFilename: contentHash ? '[chunkhash:8].js' : undefined,
    },

    resolve: {
      extensions,
    },

    module: {
      rules: getRules(baseDir),
    },

    optimization: {
      minimize,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            warnings: false,
            ie8: true,
            output: {
              comments: /^@pilet/,
            },
          },
        }),
      ],
    },

    plugins: getPlugins(
      [
        new PiletWebpackPlugin({
          name,
          piral,
          version,
          externals,
          schema,
          variables: getVariables(),
        }),
      ],
      progress,
      production,
    ),
  };
}
