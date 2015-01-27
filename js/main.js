	var config = {};

	function getUrlVars() {
		var vars = {};
		var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
			vars[key] = value;
		});
		return vars;
	}

	function suggest(text, cb) {

		var suggestions = [];

		theMovieDb.search.getMulti({"query":text}, function (resp) {

			var max = 7;
			var r = $.parseJSON(resp);

			if ( r.total_results > 0 ) {

				var mediaTypes = ["person","movie"];
				var labelColor = {"person":"warning", "movie":"success"};
				suggestions = $.map( r.results, function ( obj ) { if ( mediaTypes.indexOf(obj.media_type) != -1 ) return obj } );
				suggestions = suggestions.slice(0, max);
				suggestions = $.map ( suggestions, renderSuggestionItem );
			}
			cb(suggestions);
		},
		function () {});
	}

	function renderSuggestionItem ( item, i ) {
		var knownFor = "";
		var image = "";
		var name = "";
		var callback = function(){};

		if ( item.media_type == "person" ) {

			if ( item.profile_path ) {
				image = config["images"]["base_url"] + config["images"]["profile_sizes"][0] + item.profile_path;
				image = '<img src="' + image + '" alt="' + item.name + '" class="img-responsive" />';
			}

			name = item.name;
			knownFor = "known for: " + $.map( item.known_for, function (obj) {  return obj.original_title } ).join(", ");
			callback = function() { showPerson( item ) };

		} else if ( item.media_type == "movie" ) {

			if ( item.poster_path ) {
				image = config["images"]["base_url"] + config["images"]["poster_sizes"][0] + item.poster_path;
				image = '<img src="' + image + '" alt="' + item.title + '" class="img-responsive" style="width: 45px; height: auto" />';
			}
			name = item.title;
			callback = function() { showMovie( item ) };
		}

		var itemHTML = '<div class="col-xs-12 col-sm-3">' + image + '</div>' +
					'<div class="col-xs-12 col-sm-9">' +
					'	<span class="name">' + name + '</span><br/>' +
					'   <span class="label label-' + labelColor[ item.media_type ] + '">' + item.media_type + '</span>' +
					'	<span class="" data-toggle="tooltip" title="">' + knownFor +  '</span>' +
					'</div>' +
					'<div class="clearfix"></div>';

		return $('<li class="list-group-item"/>').html( itemHTML ).click( callback );

	}

	function showPerson( personItem ) {
		$('#workspace').empty();
		$('#person-list').hide();
		$('#person-list-search').val(personItem.name)
		$('#workspace').append( Person.render( config, personItem ) );
	}

	function showMovie( movieItem ) {
		$('#workspace').empty();
		$('#person-list').hide();
		$('#person-list-search').val(movieItem.title)
		$('#workspace').append( Movie.render( config, movieItem ) );
	}

	//
	function redirect( media_type, id ) {
		window.location.href = "index.html?media_type=" + media_type + "&id=" + id;
	}

	function loadRequestedMedia(urlVars) {
		var id = urlVars['id'];

		if ( urlVars['media_type'] == "person" ) {
			theMovieDb.people.getById({ "id": id }, function( resp ){
				showPerson( $.parseJSON(resp) );
			}, function(){} );

		} else if ( urlVars['media_type'] == "movie" ) {
			theMovieDb.movies.getById({ "id": id }, function( resp ){
				showMovie( $.parseJSON(resp) );
			}, function(){} );
		}

	}

	function loadPopularMovies() {

		theMovieDb.movies.getPopular({}, function(resp){

			var popular = $('#popular');
			var movies = $.parseJSON(resp);
			var counter = 0;
			var row, random;

			random = Math.floor( (Math.random() * 10 ) + 1 );

			movies = movies.results.slice( random, random + 12 );

			$.map( movies, function ( movie ) {

				if ( counter++ % 4 == 0 ) {
					row = $('<div></div>').appendTo(popular);
					row.addClass('container');
				}

				var posterURL = ( movie.poster_path ) ? config["images"]["base_url"] + config["images"]["poster_sizes"][3] + movie.poster_path : "";

				item = $(
					'<div class="col-sm-6 col-md-3">'
						+ '<div class="thumbnail">'
							+ '<img class="shadow" alt="' + movie.title + '" title="' + movie.title + '" src="' + posterURL + '">'
							+ '<div class="caption">'
							+ '   <h4>' + movie.title + '</h4>'
						+ ' </div></div></div>'
				).appendTo(row);

				item.click(function(){
					redirect( "movie", movie.id );
				});

			});

		}, function(){});
	}

	function initEvents () {
		$('[data-toggle="tooltip"]').tooltip();

		$('#fullscreen').on('click', function(event) {
			event.preventDefault();
			window.parent.location = "http://bootsnipp.com/iframe/4l0k2";
		});

		$('#person-list-search').keyup(function() {

			$('#workspace').empty();
			$('#person-list').empty();

			if ( $('#person-list-search').val().length > 0 ) {

				suggest( $('#person-list-search').val(), function (results) {
					$('#person-list').empty();

					$.map( results, function( suggestion )  {
						$('#person-list').append( suggestion );
					});
				});

				$('#person-list').show();

			} else {
				$('#person-list').hide();
			}

		});

		$('#person-list').hide();

		$('#person-list').searchable({
			searchField: '#person-list-search',
			selector: 'li',
			childSelector: '.col-xs-12',
			show: function( elem ) {
				elem.slideDown(100);
			},
			hide: function( elem ) {
				elem.slideUp( 100 );
			}
		})

	}

	// Main function executed once everything is loaded
	$(function () {

		// config init
		theMovieDb.configurations.getConfiguration(
			function(resp) {
				// load config
				config = $.parseJSON(resp);

				// Process GET vars
				var urlVars = getUrlVars();

				if ( urlVars['media_type'] ) {
					loadRequestedMedia(urlVars);

				} else {
					loadPopularMovies();
				}

		}, function(){} );

		initEvents();

	});
