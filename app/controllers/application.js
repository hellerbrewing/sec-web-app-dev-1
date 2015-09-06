import Ember from 'ember';

//var Photo = Ember.Object.extend({
//	title: '',
//	username: '',
	//flickr extra data
//	owner: '',
	//flickr url data
//	id: '',
//	farm: 0,
//	secret: '',
//	server: '',
//	url: function(){
//		return "https://farm"+this.get('farm')+
//		".staticflickr.com/"+this.get('server')+
//		"/"+this.get('id')+"_"+this.get('secret')+"_b.jpg";
//	}.property('farm','server','id','secret'),
//});

var PhotoCollection = Ember.ArrayProxy.extend(Ember.SortableMixin, {
	sortProperties: ['title'],
	sortAscending: true,
	content: [],
});

export default Ember.Controller.extend({
	photos: PhotoCollection.create(),
		searchField: '',
		tagSearchfield: '',
		tagList: ['hi','cheese'],
	filteredPhotos: function () {
		var filter = this.get('searhcField');
		var rx = new RegExp(filter, 'gi');
		var photos = this.get('photos');

		return photos.filter(function(photo){
			return photo.get('title').match(rx) || photo.get('username').match(rx);
		});
	}.property('photos.@each','searchField'),
	actions: {
		search: function () {
			this.get('photos').content.clear();
			this.store.unloadAll('photo');
			this.send('getPhotos',this.get('tagSearchField'));
		},
		getPhotos: function(tag){
			var apiKey = '17e007fe58b70f25cfe08295d6dbcedc';
			var host = 'https://api.flickr.com/services/rest/';
			var method = "flickr.tags.getClusterPhotos";
			var requestURL = host + "?method="+method + "&api_key="+apiKey+"&tag="+tag+"&format=json&nojsoncallback=1";
			var photos = this.get('photos');
			var t = this;
			Ember.$.getJSON(requestURL, function(data){//callback for successfully completed requests
				console.log(data);
				data.photos.photo.map(function(photo) {
					var newPhotoItem = t.store.createRecord('photo',{
						title: photo.title,
						username: photo.username,
						//flickr extra data
						owner: photo.owner,
						//flickr url data
						id: photo.id,
						farm: photo.farm,
						secret: photo.secret,
						server: photo.server,
					});
					photos.pushObject(newPhotoItem);
				});
			});
		},
		clicktag: function(tag){
			this.set('tagSearchField', tag);
			this.get('photos').content.clear();
			this.store.unloadAll('photo');
			this.send('getPhotos',tag);
		},
		init: function(){
			this._super.apply(this, arguments);
			var apiKey = '17e007fe58b70f25cfe08295d6dbcedc';
			var host = 'https://api.flickr.com/services/rest/';
			var method = "flickr.tags.getHotlist";
			var requestURL = host + "?method="+method + "&api_key="+apiKey+"&count=75&format=json&nojsoncallback=1";
			var t = this;
			Ember.$.getJSON(requestURL, function(data){
				//callback for successfully completed requests
				console.log(data);
				data.hottags.tag.map(function(tag) {
					t.get('taglist').pushObject(tag._content);
				});
			});
		}
	}
});