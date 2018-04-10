import axios from 'axios';

const makeGithubApiRequest = (orgName, cursor = null) => axios.post('https://api.github.com/graphql', {
  // For simplicity, we'll just do one big request.
  // One could imagine making the UI more responsive by doing a smaller
  // and faster request to just fetch repos, and then fetch commits.
  query: `
          query ($org_name: String!, $cursor: String) {
            organization(login: $org_name) {
              repositories(first: 5, orderBy: {direction: DESC, field: STARGAZERS}, after: $cursor) {
                totalCount
                pageInfo {
                  hasNextPage
                  endCursor
                }
                nodes {
                  url
                  name
                  forks {
                    totalCount
                  }
                  stargazers {
                    totalCount
                  }
                  defaultBranchRef {
                    target {
                      ... on Commit {
                        history(first: 5) {
                          nodes {
                            url
                            abbreviatedOid
                            id
                            deletions
                            additions
                            messageHeadline
                            author {
                              avatarUrl
                              date
                              name
                              user {
                                url
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `,
  variables: {
    /* eslint-disable camelcase */
    org_name: orgName,
    /* eslint-enable camelcase */
    cursor
  }
}, {
  headers: {
    // This GH token does not have any permissions on my account,
    // so it's ok to share publicly by deploying it with a client-side app.
    Authorization: 'bearer be0309a58fd1f4c6dff81e1b63ac1eb8e2f99f8f'
  }
});

export default makeGithubApiRequest;
