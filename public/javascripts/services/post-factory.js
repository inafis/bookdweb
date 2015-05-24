angular.module('oddjob.post-factory',[])
.factory('posts', ['$http', 'auth', function($http, auth){
  var o = {
    posts: [],
    myPosts: []
  };

  o.get = function(id) {
    return $http.get('/posts/' + id, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).then(function(res){
      return res.data;
    });
  };

  o.getAll = function() {
    return $http.get('/posts',{
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
      angular.copy(data, o.posts);
    });
  };
  o.getUserPosts = function(id){
    return $http.get('/user/posts/'+ id,{
      headers: {Authorization: 'Bearer'+auth.getToken()}
    }).success(function(data){
      angular.copy(data, o.myPosts)
    })
  }
  o.create = function(post) {
    return $http.post('/posts', post, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
      o.posts.push(data);
    });
  };

  // o.upvote = function(post) {
  //   return $http.put('/posts/' + post._id + '/upvote', {
  //     headers: {Authorization: 'Bearer '+auth.getToken()}
  //   }).success(function(data){
  //     post.upvotes += 1;
  //   });
  // };

  o.addReview = function(id, review) {
    return $http.post('/posts/' + id + '/reviews', review,{
      headers: {Authorization: 'Bearer '+auth.getToken()}
    });
  };

  // o.upvoteComment = function(post, comment) {
  //   return $http.put('/posts/' + post._id + '/comments/'+ comment._id + '/upvote', {
  //     headers: {Authorization: 'Bearer '+auth.getToken()}
  //   }).success(function(data){
  //     comment.upvotes += 1;
  //   });
  // };

  return o;
}])