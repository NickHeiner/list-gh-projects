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

### GitHub API Usage
I used the GitHub v4 GraphQL API. In general, I enjoyed the high degree of flexibility that came with being able to define my own schema for the response type. However, if I controlled the backend and were optimizing for this frontend, I'd structure it differently.

The API implements pagination with an opaque cursor. When the client requests a page, the server provides `next` and `previous` cursors. The move through the result set, the client uses those cursors on subsequent requests. This likely makes sense for GH's internals, but it means that the client can't use a lazy-loading approach where it only requests a subsection of the result set. For instance, imagine that the client only shows a scrolling window of 10 items. To start, it would show items `0 ... 10`. If the user scrolled rapidly, they could come to a stop on the location for items `53 ... 63`. To render those items, the client would want to request that range specifically. However, that's not possible with the opaque cursor approach. Instead, the client needs to download the entire result set, and do the filtering client-side.

My ideal API would be a stream, perhaps delivered over a websocket. The client would request a range of the stream, and could render the results one by one as they're available from the server. If the user changes the scroll window mid-stream, the client could use the websocket to request a different range. Responses that arrived for the original range would be saved client-side for later.

Additionally, the GraphQL structure means that some data is repeated. For instance, every time an author appears on a commit, that author's entire requested data object is returned. To save bandwidth, the API could normalize by returning an `authors` set and then have the commits just contain references to that set.

### CSS-in-JS
I'm still relatively new to CSS-in-JS, but my experience thus far has been overwhelmingly positive. I've been burned before by projects that develop sprawling wastelands of CSS that no engineer feels safe touching. People add new CSS instead of re-using what's there, and dead code persists indefinitely. CSS conventions, like SMACSS, can ameliorate this, but require a fair amount of discipline to maintain. A few key problems with native CSS include:

1. It's a global namespace.
1. Specificity battles introduce cognitive overhead (or a bunch of `!important` hacks).
1. Without a preprocessor, ability to share styles or use logic to generate styles is limited.
1. Styling based on JS logic is painful.
1. It's easy to write over-broad rules and unintentionally impact children. Or, you'll start with a rule like "style all children of `.foo` this way", and then a bunch of exceptions ("unless it's `.bar` or `.odp`") pile up.

CSS-in-JS solve all these. Here's what it looks like:

```js
const styles = css({
  marginTop: '10px'
});
return <div {...styles}><Content /></div>;
```

It solves the pain points:

(1, 2). Styles are applied directly to the relevant components.
(3, 4). Styles can easily be generated and DRY'd out based on JS logic.
(5). Components have more context about what their children will be than a CSS file which can get out of sync with the app structure.

Also, by combining all details necessary to render a component within the component itself, we improve encapsulation. 

## Corners I Cut
### Responsive Design
### Offline

## Things I'd Add If I Had More Time
### Tests
### More Accessibility
### Favicon

