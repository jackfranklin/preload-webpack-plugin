/**
 * @license
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint-env jasmine */
'use strict';

const path = require('path');
const MemoryFileSystem = require('memory-fs');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const PreloadPlugin = require('../');
const OUTPUT_DIR = path.join(__dirname, 'dist');

describe('PreloadPlugin preloads or prefetches async chunks', function() {
  it('adds preload tags to async chunks', function(done) {
    const compiler = webpack({
      entry: {
        js: path.join(__dirname, 'fixtures', 'file.js')
      },
      output: {
        path: OUTPUT_DIR,
        filename: 'bundle.js',
        chunkFilename: 'chunk.[chunkhash].js',
        publicPath: '/',
      },
      plugins: [
        new HtmlWebpackPlugin(),
        new PreloadPlugin()
      ]
    }, function(err, result) {
      expect(err).toBeFalsy();
      expect(JSON.stringify(result.compilation.errors)).toBe('[]');
      const html = result.compilation.assets['index.html'].source();
      expect(html).toContain('<link rel="preload" href="chunk.');
      expect(html).not.toContain('<link rel="preload" href="bundle.');
      done();
    });
    compiler.outputFileSystem = new MemoryFileSystem();
  });

  it('adds prefetch tags to async chunks', function(done) {
    const compiler = webpack({
      entry: {
        js: path.join(__dirname, 'fixtures', 'file.js')
      },
      output: {
        path: OUTPUT_DIR,
        filename: 'bundle.js',
        chunkFilename: 'chunk.[chunkhash].js',
        publicPath: '/',
      },
      plugins: [
        new HtmlWebpackPlugin(),
        new PreloadPlugin({
          rel: 'prefetch'
        })
      ]
    }, function(err, result) {
      expect(err).toBeFalsy();
      expect(JSON.stringify(result.compilation.errors)).toBe('[]');
      const html = result.compilation.assets['index.html'].source();
      expect(html).toContain('<link rel="prefetch" href="chunk.');
      done();
    });
    compiler.outputFileSystem = new MemoryFileSystem();
  });
});

describe('PreloadPlugin preloads normal chunks', function() {
  it('adds preload tags', function(done) {
    const compiler = webpack({
      entry: path.join(__dirname, 'fixtures', 'file.js'),
      output: {
        path: OUTPUT_DIR,
        filename: 'bundle.js',
        chunkFilename: 'chunk.[chunkhash].js',
        publicPath: '/',
      },
      plugins: [
        new HtmlWebpackPlugin(),
        new PreloadPlugin({
          rel: 'preload',
          as: 'script',
          include: 'all'
        })
      ]
    }, function(err, result) {
      expect(err).toBeFalsy();
      expect(JSON.stringify(result.compilation.errors)).toBe('[]');
      const html = result.compilation.assets['index.html'].source();
      expect(html).toContain('<link rel="preload" href="chunk');
      expect(html).toContain('<link rel="preload" href="bundle.js"');
      done();
    });
    compiler.outputFileSystem = new MemoryFileSystem();
  });
});

describe('PreloadPlugin prefetches normal chunks', function() {
  it('adds prefetch tags', function(done) {
    const compiler = webpack({
      entry: path.join(__dirname, 'fixtures', 'file.js'),
      output: {
        path: OUTPUT_DIR
      },
      plugins: [
        new HtmlWebpackPlugin(),
        new PreloadPlugin({
          rel: 'prefetch',
          include: 'all'
        })
      ]
    }, function(err, result) {
      expect(err).toBeFalsy();
      expect(JSON.stringify(result.compilation.errors)).toBe('[]');
      const html = result.compilation.assets['index.html'].source();
      expect(html).toContain('<link rel="prefetch" href="0');
      expect(html).toContain('<link rel="prefetch" href="main.js"');
      done();
    });
    compiler.outputFileSystem = new MemoryFileSystem();
  });
});

describe('PreloadPlugin filters chunks', function() {
  it('based on chunkname', function(done) {
    const compiler = webpack({
      entry: path.join(__dirname, 'fixtures', 'file.js'),
      output: {
        path: OUTPUT_DIR,
        filename: 'bundle.js',
        chunkFilename: '[name].[chunkhash].js',
        publicPath: '/',
      },
      plugins: [
        new HtmlWebpackPlugin(),
        new PreloadPlugin({
          rel: 'preload',
          as: 'script',
          include: ['home']
        })
      ]
    }, function(err, result) {
      expect(err).toBeFalsy();
      expect(JSON.stringify(result.compilation.errors)).toBe('[]');
      const html = result.compilation.assets['index.html'].source();
      expect(html).toContain('<link rel="preload" href="home');
      expect(html).not.toContain('<link rel="preload" href="bundle.js"');
      done();
    });
    compiler.outputFileSystem = new MemoryFileSystem();
  });
});

describe('filtering unwanted files', function() {
  it('does not include map files to be preloaded', function(done) {
    const compiler = webpack({
      entry: {
        js: path.join(__dirname, 'fixtures', 'file.js')
      },
      output: {
        path: OUTPUT_DIR,
        filename: 'bundle.js',
        chunkFilename: 'chunk.[chunkhash].js',
        publicPath: '/',
      },
      devtool: 'cheap-source-map',
      plugins: [
        new HtmlWebpackPlugin(),
        new PreloadPlugin()
      ]
    }, function(err, result) {
      expect(err).toBeFalsy();
      expect(JSON.stringify(result.compilation.errors)).toBe('[]');
      const html = result.compilation.assets['index.html'].source();
      expect(html).toContain('<link rel="preload" href="chunk.');
      expect(html).not.toContain('.map"');
      done();
    });
    compiler.outputFileSystem = new MemoryFileSystem();
  });
});
