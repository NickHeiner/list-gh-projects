export default (...eventArgs) => {
  window.gtag('send', 'event', ...eventArgs);
};
