const queries = require('./queries');

class Database {
  constructor(db) {
    this.db = db;
  }

  run(query) {
    return new Promise((resolve, reject) => {
      this.db.run(query, (err) => {
        if (err) {
          reject(err);
        }
        resolve(true);
      });
    });
  }

  all(query) {
    return new Promise((resolve, reject) => {
      this.db.all(query, (err, rows) => {
        if (err) {
          reject(err);
        }
        resolve(rows);
      });
    });
  }

  get(query) {
    return new Promise((resolve, reject) => {
      this.db.get(query, (err, row) => {
        if (err) {
          reject(err);
        }
        resolve(row);
      });
    });
  }

  addPost(data, userId) {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run(queries.addPost(userId, data), (err) => {
          if (err) {
            reject(err);
          }
        });
        this.get(queries.getAllStories())
          .then((row) => resolve(row.id))
          .catch((err) => reject(err));
      });
    });
  }

  updatePost(postId, data) {
    return this.run(queries.updatePost(postId, data));
  }

  publishPost(postId, imageId) {
    return this.run(queries.publishPost(imageId, postId));
  }

  getUsersPosts(userId, postType) {
    return this.all(queries.getUsersPosts(userId, postType));
  }

  getPost(id, postType) {
    return this.get(queries.getPost(id, postType));
  }

  getPostDetails(blogId, imageId) {
    const details = { tags: [] };
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.get(queries.imageQuery(imageId), (err, row) => {
          if (err) {
            reject(err);
          }
          details.imagePath = row.imagePath;
        });

        this.db.all(queries.tagsQuery(blogId), (err, rows) => {
          if (err) {
            reject(err);
          }
          rows.forEach((row) => {
            details.tags.push(row.tag);
          });
          resolve(details);
        });
      });
    });
  }

  getUserById(userId) {
    return this.get(queries.selectUser(userId));
  }

  addUser(userDetails) {
    return this.run(queries.addUser(userDetails));
  }

  getUser(username) {
    return new Promise((resolve, reject) => {
      this.db.get(queries.getUser(username), (err, row) => {
        if (err) {
          reject(err);
        }
        if (row) {
          resolve(row);
        } else {
          resolve(false);
        }
      });
    });
  }

  getComments(blogId) {
    return this.all(queries.getComments(blogId));
  }

  addComment(comment, blogId, userId, date) {
    return this.run(queries.addComment(blogId, userId, date, comment));
  }

  getLatestPosts(count) {
    return this.all(queries.getLatestPosts(count));
  }

  getSearchedPosts(filteringOption, searchedText) {
    const queryString = {
      tag: queries.getPostsByTag(searchedText),
      title: queries.getPostsByTitle(searchedText),
      author: queries.getPostsByAuthor(searchedText),
    };

    return this.all(queryString[filteringOption]);
  }

  addImage(fileName) {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run(queries.insertImage(fileName), (err) => {
          if (err) {
            reject(err);
          }
        });
        this.db.get(queries.selectImages(), (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        });
      });
    });
  }

  addTags(tags, postId) {
    return this.run(queries.addTags(tags, postId));
  }

  deletePost(postId) {
    return this.run(queries.deletePost(postId));
  }

  isClapped(postId, userId) {
    return new Promise((resolve, reject) => {
      this.db.get(queries.selectClaps(postId, userId), (err, row) => {
        if (err) {
          reject(err);
        }
        if (row) {
          resolve(true);
        }
        resolve(false);
      });
    });
  }

  clapOnPost(postId, userId) {
    let queryString = queries.insertClap(postId, userId);
    let status = true;
    return new Promise((resolve, reject) => {
      this.isClapped(postId, userId).then((row) => {
        if (row) {
          queryString = queries.deleteClap(postId, userId);
          status = false;
        }
        this.db.run(queryString, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(status);
          }
        });
      });
    });
  }

  getClapsCount(postId) {
    return this.get(queries.getClapsCount(postId));
  }
}

module.exports = Database;
