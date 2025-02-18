/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
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

import { test as it, expect } from './pageTest';

it.fixme(({ isAndroid }) => isAndroid, 'Post data  does not work');

it('should return correct postData buffer for utf-8 body', async ({page, server}) => {
  await page.goto(server.EMPTY_PAGE);
  const value = 'baẞ';
  const [request] = await Promise.all([
    page.waitForRequest('**'),
    page.evaluate(({url, value}) => {
      const request = new Request(url, {
        method: 'POST',
        body: JSON.stringify(value),
      });
      request.headers.set('content-type', 'application/json;charset=UTF-8');
      return fetch(request);
    }, {url: server.PREFIX + '/title.html', value})
  ]);
  expect(request.postDataBuffer().equals(Buffer.from(JSON.stringify(value), 'utf-8'))).toBe(true);
  expect(request.postDataJSON()).toBe(value);
});

it('should return post data w/o content-type', async ({page, server}) => {
  await page.goto(server.EMPTY_PAGE);
  const [request] = await Promise.all([
    page.waitForRequest('**'),
    page.evaluate(({url}) => {
      const request = new Request(url, {
        method: 'POST',
        body: JSON.stringify({ value: 42 }),
      });
      request.headers.set('content-type', '');
      return fetch(request);
    }, {url: server.PREFIX + '/title.html'})
  ]);
  expect(request.postDataJSON()).toEqual({ value: 42 });
});

it('should throw on invalid JSON in post data', async ({page, server}) => {
  await page.goto(server.EMPTY_PAGE);
  const [request] = await Promise.all([
    page.waitForRequest('**'),
    page.evaluate(({url}) => {
      const request = new Request(url, {
        method: 'POST',
        body: '<not a json>',
      });
      return fetch(request);
    }, {url: server.PREFIX + '/title.html'})
  ]);
  let error;
  try {
    request.postDataJSON();
  } catch (e) {
    error = e;
  }
  expect(error.message).toContain('POST data is not a valid JSON object: <not a json>');
});

it('should return post data for PUT requests', async ({page, server}) => {
  await page.goto(server.EMPTY_PAGE);
  const [request] = await Promise.all([
    page.waitForRequest('**'),
    page.evaluate(({url}) => {
      const request = new Request(url, {
        method: 'PUT',
        body: JSON.stringify({ value: 42 }),
      });
      return fetch(request);
    }, {url: server.PREFIX + '/title.html'})
  ]);
  expect(request.postDataJSON()).toEqual({ value: 42 });
});
