export const CACHE_KEYS = {
  VIDEO: (id) => `video:${id}`,

  VIDEOS: ({ page, limit, query, sortBy, sortType, userId }) =>
    `videos:page=${page}&limit=${limit}&query=${query}&sortBy=${sortBy}&sortType=${sortType}&user=${userId}`,
};