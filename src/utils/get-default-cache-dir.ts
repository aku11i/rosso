import envPaths from 'env-paths';

export function getDefaultCacheDir() {
  const paths = envPaths('rosso');
  return paths.cache;
}
