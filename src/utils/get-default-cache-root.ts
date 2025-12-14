import envPaths from 'env-paths';

export function getDefaultCacheRoot() {
  const paths = envPaths('rosso');
  return paths.cache;
}
