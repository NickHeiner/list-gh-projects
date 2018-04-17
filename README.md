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

### Functionality
This app allows job seekers to assess companies via a broad overview of an organization's activity on GitHub. (I did the user research for this by consulting myself :smile:.) The goal is to give a high-level summary, with links to dig in deeper to interesting repos and commits. In support of this goal:

1. The org summary view provides high-level summary statistics about how popular an org's repos are on GitHub, and how much active development is occurring. 
  1. The "recent authors" display allows the job seeker to reach out to people who are currently involved with the company.
  1. The "unique committers" data point gives the job seeker a sense of the company's scale and commitment to open source.
  1. The "total forks" data point is an indicator of the broader OSS community's involvement in the company's projects.
1. The repo list, sorted by popularity, allows the user to quickly identify the org's most well-known projects.
1. The filter textbox allows the user to find repos that are of particular interest. For instance, searching for `react` on Facebook's org will show all react-related projects.
  1. To make it easier to find projects with known names, the search supports interpolated matching. For instance, `c-r-a` will match `create-react-app`.
1. Each repo displays the most recent five commits. The goal is not to provide a comprehensive overview of recent commits for a project; that would be better accomplished on the relevant GitHub page itself. Instead, I just wanted to give a quick summary, so the job seeker could get a feel for the style of development on each project. How meaningful are the commit messages? Does the project follow a convention around tagging issues or PRs for each commit? How big are the commits? To give a quick overview, and allow multiple projects to be displayed on the page at once, it's better to display fewer commits. 
1. The repo is determined by the pathname. The job seeker can save a list of links in their notes (such as https://nickheiner.github.io/list-gh-projects/#/department-of-veterans-affairs and https://nickheiner.github.io/list-gh-projects/#/facebook). This allows for easy side-by-side comparison, and for quickly revisiting previously viewed orgs to see what has changed. It also makes it easy to share interesting results.
1. react-virtualized keeps the UI fluid, so users are not frustrated.
1. Offline access enables users to keep working even when the network is unreliable.

I consider myself to be an "information architecture" designer, but not a visual designer. I believe that the layout of the app is a reasonable way to communicate and enable a user to accomplish the intended goals. However, I would not consider it to be particularly visually compelling. :smile:

Because the using the app is primarily an exercise in vertical scrolling, I tried to be economical with vertical spacing.

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

This, as it turns out, also does not work well. I'm pretty sure we're not supposed to have side-effects in the `setState` callback. Instead, I considered using the `setState` updater:

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

At this point, I felt that I was "going against the grain" of the framework by trying to have side-effects that fed into setting state as part of the component lifecycle. I switched to Redux, and was very quickly able to get things working. I also felt that the final code had much better separation of concerns.

### GitHub API Usage
I used the GitHub v4 GraphQL API. In general, I enjoyed the high degree of flexibility that came with being able to define my own schema for the response type. However, if I controlled the backend and were optimizing for this frontend, I'd structure it differently.

The API implements pagination with an opaque cursor. When the client requests a page, the server provides `next` and `previous` cursors. The move through the result set, the client uses those cursors on subsequent requests. This likely makes sense for GH's internals, but it means that the client can't use a lazy-loading approach where it only requests a subsection of the result set. For instance, imagine that the client only shows a scrolling window of 10 items. To start, it would show items `0 ... 10`. If the user scrolled rapidly, they could come to a stop on the location for items `53 ... 63`. To render those items, the client would want to request that range specifically. However, that's not possible with the opaque cursor approach. Instead, the client needs to download the entire result set, and do the filtering client-side.

My ideal API would be a stream, perhaps delivered over a websocket. The client would request a range of the stream, and could render the results one by one as they're available from the server. If the user changes the scroll window mid-stream, the client could use the websocket to request a different range. Responses that arrived for the original range would be saved client-side for later.

Additionally, the GraphQL structure means that some data is repeated. For instance, every time an author appears on a commit, that author's entire requested data object is returned. To save bandwidth, the API could normalize by returning an `authors` set and then have the commits just contain references to that set.

### CSS-in-JS
I'm still relatively new to CSS-in-JS, but my experience thus far has been overwhelmingly positive. I've been burned before by projects that develop sprawling wastelands of CSS that no engineer feels safe touching. People add new CSS instead of reusing what's there, and dead code persists indefinitely. CSS conventions, like SMACSS, can ameliorate this, but require a fair amount of discipline to maintain. A few key problems with native CSS include:

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
### Visual Design
As noted above, I'm not a visual designer. I stole the color scheme from GitHub. I took a few components from Google Material UI.

There are a few small visual bugs. For instance, it may not be desirable that the scroll bar overlaps with the content of the results list.  

### Responsive Design
A proper responsive design starts with the smallest supported screen size, and adds content progressively. In contrast, I designed for my 15" Macbook screen, and put in a few patches to make it marginally less appalling on mobile.

### Hash-based URL
This app uses (e.g. `#/netflix`) instead of HTML5 `pushState` URLs (e.g. `/facebook`). Typically, one would want to use HTML5, and degrade to hash-based URLs for older browsers. However, GitHub pages does server-side routing based on the request pathname. If the user visited the home page of the app, then searched for `facebook`, their browser would be on `{hostname}/facebook`. When they hit refresh, GitHub pages would look for `facebook.html` in this project, not find it, and return the `404` page instead.

You can work around this by having the `404` page also be part of the single page app, and do client-side routing. However, by just using a hash URL, I can bypass the issue entirely. The hash is not sent to the server, the GitHub pages will return `index.html`, and the client can handle routing. 

### Offline
create-react-app adds uses a plugin to cache static assets with a service worker. I could have also used this to cache GH API requests, but that would have required ejecting create-react-app, which would have made the project much more complicated. Instead, I just used `localStorage`. This basically works, although is fairly coarse-grained as a caching mechanism. In particular, we're caching entire org data sets, which are composed of many API request responses. This may lead to some annoying edge cases that we would not experience if we were caching on a per-request level. Doing the caching in the service worker also has the benefit of being completely encapsulated from the rest of the app.

Additionally, if I had used the service worker, I could have kept images from GitHub avatars working offline as well.

To try this out, visit the app, and search for a few orgs. Once they're done loading, disconnect from the internet (Chrome's dev tools will let you do this for just a single tab) and see that the app still functions for the previously-loaded data!

Another problem: the API response cache sometimes needs to be invalidated when a new version of the app is deployed, and the client is now expecting the cached data to have a different shape. The client currently does not do this.

### Request Robustness
Loading all the repos for an org takes multiple requests. If any of those requests fail, the entire loading process stops. Sometimes, the GitHub API will randomly fail. The client does not handle this robustly by retrying, potentially with exponential back-off.

### Google Analytics
The event tracking is not actually firing network requests. I'm not sure why this is.

### React Virtualized Row Sizing
I use react-virtualized to avoid rendering the entire data set into the DOM at once. This keeps the UI smooth, even as the user is typing to filter by repo name. To make this work, I had to give all row elements a fixed height. There are more sophisticated approaches that handle dynamic row heights.

Additionally, if the screen size gets too narrow, then the rows get taller, and the layout is broken.

### "Recent" Activity in Org Summary
Although I think that the org summary is a useful high-level indicator, the stats are measured somewhat oddly. The stats are generated from commits that are both within the most recent 10 commits to a repo and and within the past week. I would rather just measure all commits that are within a week. To improve this, I would use the `since:` parameter in the GH API.

Additionally, my goal with the "Recent Contributors" view was to highlight people who are recently active in the organization. However, any quantitative metric of developer impact is problematic. I chose to rank people by how many commits they've pushed, but that metric can be misleading.

## Potential Improvements That User Testing May Reveal
### Loading Indicator Subtlety 
The org summary view is incomplete while the org repos load. The numbers update as new data is fetched. This may be confusing to users, since the loading indicator may not be obvious enough. This would be a point to test in user research.

### Icon Sizes
The icons for forks and stars may be a bit too small for most people to comfortably read.

### Filter Input Location
The "filter repo" input is located above the org summary. I did this so the org summary can scroll out of view as the user looks through the repo list. However, this could create confusion where users think that the stats in the org summary only reflect the filtered set of repos.

Additionally, it may be nice to clear the "filter repos" input value when the user switches to a new org. If you view Facebook and filter for "react", for instance, and then view Rails, you'd still have the "react" filter in place. You may not realize this, and then be confused when Rails does not appear to have very many repos. Or maybe this is desirable, because you're moving between orgs and looking for the same thing. 

### Org Summary Banded Rows
In the org summary, it may improve readability to use banded rows for the statistics tables. I chose not to, because I thought that it was readable as-is, and adding banding would just add visual weight to the page. But users may feel differently.

## Things I'd Add If I Had More Time
### Tests
If I had time to add tests, I'd favor Selenium-driven browser integration tests. Ideally, they would run using a tool like SauceLabs or BrowserStack to test multiple browser / OS combos. 

Selenium tests are undeniably slower, and without a lot of supporting code, can be fairly brittle. However, I find that they have the most value, because they test the "external contract" of the app. Unit tests, although also valuable for code that's highly unit-testable (well-factored with few side-effects), ultimately do not test what the user cares about, and are thus only a secondary indicator of correctness.

### Cancelling Unnecessary Requests
If you search for an org, like "department-of-veterans-affairs", the client will download all repos for that org, even if you navigate away to a different org. These requests could be wasted if the user is never going to go back to the original org. This is particularly problematic when an org name is a prefix of another, since a search is fired for every keystroke.

For example, if you type out a search for `my-org-name`, and `my-org` is another valid org that has 400 repos, then the client will download those 400 repos, even though you aren't going to look at them.

### More Accessibility
I added a few `aria` attributes to promote accessibility. However, there is more I could have done:

1. Screenreader testing
1. Add `aria` attributes to the `table`s for the recent commits view, so assistive technologies could easily navigate them.
1. Use ARIA roles to show assistive technology where the search and filter fields are.
1. Ensure that colors have sufficient contrast.
