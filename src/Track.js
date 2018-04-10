export default (...eventArgs) => {
  window.ga('send', 'event', ...eventArgs);
};
