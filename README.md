# List GH Projects

## Usage
[View the production site.](https://nickheiner.github.io/list-gh-projects/#/department-of-veterans-affairs)

This is a standard Node.js project. To run it locally:

```
npm install
npm start
```

## Overview & Design Rationale
I did this entirely as a client-side app, because there is no need for server-side logic. GitHub's API supports CORS, so we can have the ease of deploying to GitHub pages.

I implemented the app using React. I like React's core abstraction of a function from state to UI elements – it's much easier to reason about than the `$scope.$watch`-soup that my Angular.JS 1.x apps have become. I used to think that Angular.JS 1.x and React were a generational advance over jQuery. However, after using React extensively, I think that React is actually a generational advance from Angular.JS itself. (The full explanation of my reasoning beyond the scope of this document, but I'm happy to elaborate elsewhere.)

### Redux vs. `setState`
Most of my apps end up using Redux, but I started this one on `setState` because Redux felt like overkill. However, when I started doing paged queries to fetch all repos, `setState` actually became much more challenging to use.

In the beginning, my GH API call had a `first: 10` term, which limited the result set size. This worked great with `setState`. However, when I updated it to `first: 100`, the query started timing out. Thus, I needed to use the pagination API. At first, my basic logic looked like:

```js
while (hasNextPage) {
  const nextResults = await getNextPage(this.state);
  this.setState(getNextState(this.state, nextResults));
  hasNextPage = doesNextPageExist(nextResults);
}
```

However, this didn't work, because `setState` is not a synchronous operation. My updates were clobbering each other, because there was no way to know when React would commit the update. Well, that's easy enough to fix with the `setState` callback:

```js
const fetchPage = async (cursor = null) => {
  const nextResults = await getNextPage(this.state);
  const nextState = getNextState(this.state, nextResults);
  this.setState(nextState, () => {
    const hasNextPage = doesNextPageExist(nextResults);
    if (hasNextPage) {
      fetchPage(getNextCursor(nextResults));
    }
  });
};
```

This, as it turns out, also does not work well. I'm pretty sure we're not supposed to have side-effects in the `setState` callback. Instead, I used considered the `setState` updater:

```js
this.setState(async (prevState, props) => {
  const hasNextPage = doesNextPageExist(nextResults);
  if (!hasNextPage) {
    return prevState;
  }
  const nextResults = await getNextPage(this.state);
  return getNextState(this.state, nextResults);
});
```

This doesn't work because the `setState` updater may be called multiple times, so it's supposed to be idempotent. (This constraint allows React to optimize rendering performance.)

At this point, I felt that I was "going against the grain" of the framework by trying to have side-effects that fed into setting state as part of the component lifecycle. I pulled out Redux, and was very quickly able to get things working. And I felt that the final code had much better separation of concerns.

## Corners I Cut

## Things I'd Add If I Had More Time
### Tests
### More Accessibility
### Favicon

