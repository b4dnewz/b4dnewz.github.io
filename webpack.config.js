const path = require('path')
const webpack = require('webpack')
const pkg = require('./package.json')
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const CopyWebpackPlugin = require('copy-webpack-plugin')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const extractSass = new ExtractTextPlugin({
  filename: `css/bundle.css`,
  disable: process.env.NODE_ENV === "development"
})

const src = path.resolve(__dirname, 'src')
const dist = path.resolve(__dirname, 'dist')

module.exports = (env = {}) => {

  return {
    context: src,
    entry: './index.js',
    output: {
      path: dist,
      filename: `js/bundle.js`
    },
    devtool: env.development ? 'source-map' : false,
    devServer: {
      contentBase: src
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['es2015']
            }
          }
        },
        {
          test: /\.(scss|sass)$/,
          exclude: /node_modules/,
          use: extractSass.extract({
            fallback: "style-loader",
            use: [
              {
                loader: "css-loader",
                options: {
                  sourceMap: env.development
                }
              },
              {
                loader: 'postcss-loader',
                options: {
                  sourceMap: env.development,
                  config: {
                    ctx: {
                      autoprefixer: {}
                    }
                  }
                }
              },
              {
                loader: "sass-loader",
                options: {
                  sourceMap: env.development,
                  outputStyle: env.development ? 'expanded' : 'compressed'
                }
              },
            ]
          })
        },
        {
          test: /\.(png|jpg|jpeg|gif)$/,
          use: [ {
            loader: 'url-loader'
          }]
        },
        {
          test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
          use: {
            loader: "url-loader?limit=10000",
            options: {
              outputPath: 'css/'
            }
          }
        },
        {
          test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/,
          use: {
            loader: 'file-loader',
            options: {
              outputPath: 'css/'
            }
          }
        }
      ]
    },
    plugins: [

      // Recursive clean all files in dist directory
      new CleanWebpackPlugin(['dist/**/*']),

      // Uglify all the script files
      new UglifyJSPlugin({
        sourceMap: env.development
      }),

      // Extract the compiled css into separate file
      extractSass,

      // Add build banner
      new webpack.BannerPlugin({
        banner: `
          Package: ${pkg.name} - v${pkg.version}
          Description: ${pkg.description}
          @author ${pkg.author}
          @license ${pkg.license}
        `,
        entryOnly: true
      }),

      // Start browser sync server with proxy
      new BrowserSyncPlugin({
          host: 'localhost',
          port: 8088,
          proxy: 'http://localhost:8080/'
        },
        {
          // prevent BrowserSync from reloading the page
          // and let Webpack Dev Server take care of this
          reload: false
        }
      ),

      // Minify the main html entry
      new HtmlWebpackPlugin({
        inject: 'head',
        template: './index.html',
        minify: !env.development ? {
          html5: true,
          removeComments: true,
          collapseWhitespace: true,
          minifyCSS: true,
          minifyJS: true,
          removeEmptyElements: false,
          cache: false
        } : false
      }),

      // Copy source files into distribution folder
      new CopyWebpackPlugin([
        { from: './**/*' }
      ], {
        ignore: [
          '*.js',
          '*.scss'
        ]
      })

    ]
  }

};
