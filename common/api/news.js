import utils from "../js/utils.js";

/**
 * 学习动态相关接口
 */
module.exports = {
  /**
   * 获取列表
   * @returns {Promise<*>}
   */
  getNewsList(handler, data = {}) {
    return utils.http(handler, "news/index", data);
  },

  /**
   * 获取详情
   * @returns {Promise<*>}
   */
  getNewsDetail(handler, data = {}) {
    return utils.http(handler, "news/detail", data);
  },

  /**
   * 获取评论列表
   * @returns {Promise<*>}
   */
  getNewsComments(handler, data = {}) {
    return utils.http(handler, "news/comments", data, "get");
  },

  /**
   * 发布评论
   * @returns {Promise<*>}
   */
  addNewsComment(handler, data = {}) {
    return utils.http(handler, "news/comment", data);
  },

  /**
   * 获取分类列表
   * @returns {Promise<*>}
   */
  getNewsCates(handler, data = {}) {
    return utils.http(handler, "news_cate/index", data, "get");
  },

  /**
   * 点赞
   * @returns {Promise<*>}
   */
  likeNews(handler, data = {}) {
    return utils.http(handler, "news/like", data);
  },

  /**
   * 取消点赞
   * @returns {Promise<*>}
   */
  unlikeNews(handler, data = {}) {
    return utils.http(handler, "news/unlike", data);
  },

  /**
   * 上报观看时长
   * @param handler
   * @param data { news_id, duration_delta, channel }
   */
  reportWatchTime(handler, data = {}) {
    return utils.http(handler, "news/watch", data);
  },

  /**
   * 获取当前用户在指定栏目下的观看时长汇总
   * @param handler
   * @param data { channel }
   */
  getWatchSummary(handler, data = {}) {
    return utils.http(handler, "news/watchSummary", data, "get");
  },
};
