import React from 'react';
import {css} from 'glamor';

const imageSideLength = '20px';
const imageStyles = css({
  width: imageSideLength,
  height: imageSideLength,
  borderRadius: '2px',
  marginRight: '5px'
});

const Author = ({author}) => (<React.Fragment>
  <img src={author.avatarUrl} alt="" {...imageStyles} />
  {author.user 
    ? <a href={author.user.url}>{author.name}</a>
    : author.name}
</React.Fragment>);

export default Author;
