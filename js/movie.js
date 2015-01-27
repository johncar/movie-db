
var Movie = {};

Movie.render = function ( config, movieItem ) {

    var component = $("<div>");

    component.load( "movie.html", function() {

        theMovieDb.movies.getById({ "id": movieItem.id }, function( resp ){

            var movie = $.parseJSON(resp);
            var coverSize = config["images"]["poster_sizes"][3];
            var imageURL = ( movieItem.poster_path ) ? config["images"]["base_url"] + coverSize + movieItem.poster_path : "img/no_image_available";

            component.find('#img-cover').attr( { 'src': imageURL, 'alt': movie.title } );
            component.find('#movie-title').text( movie.title );
            component.find('#movie-original_title').text( "Original title: "+ movie.original_title );
            component.find('#movie-overview').text( movie.overview );

            var caption = component.find('#img-caption');

            if ( movie.vote_average ) {
                 caption.append( '<br/><span class="label label-success">Vote: ' + movie.vote_average + ' </span><br/>');
            }

            if ( movie.original_title ) {
                caption.append( '<br/><span class="label label-primary">Released: ' + movie.release_date + ' </span><br/>');
            }

            if ( movie.runtime ) {
                caption.append( '<br/><span class="label label-default">Runtime: ' + movie.runtime + 'mins </span><br/>');
            }

            if ( movie.adult ) {
                caption.append( '<br/><span class="label label-danger">Adult</span><br/>');
            }

            if ( movie.genres ) {
                caption.append( '<br/>');
                $.map( movie.genres, function( genre ) {
                    caption.append( '<span class="label label-info">' + genre.name + '</span> ' );
                });
            }

            if ( movie.homepage ) {
                caption.append( '<br/><br/><span class="label label-warning"><a href="' + movie.homepage + '">Homepage</a></span><br/>' );
            }

            // Trailer
            Movie.renderTrailer(config, component.find("#movie-trailer"), movieItem.id);

            // Cast
            Movie.renderCast(config, component.find("#cast"), movieItem.id);


        }, function(){} );

    });

    return component;

}

Movie.renderCast = function (config, castElement, movieID ) {

    theMovieDb.movies.getCredits({"id":movieID}, function(resp){

        var credits = $.parseJSON(resp);

        var sortByOrder = function(a, b) {
            return a.order-b.order;
        }

        credits.cast.sort(sortByOrder);

        $.map( credits.cast, function ( cast ) {

            var size = config["images"]["profile_sizes"][1];
            var imageURL = ( cast.profile_path ) ? config["images"]["base_url"] + size + cast.profile_path : "";

            var item = $(
                '<li class="timeline-inverted">'
                 +'<div class="timeline-badge warning">' + (cast.order+1) + '</div>'
                 +'  <div class="timeline-panel">'
                 +'     <img src="' + imageURL + '" class="img-responsive">'
                 +'     <div class="timeline-heading">'
                 +'        <h5 class="timeline-title">' + cast.name + '</h5>'
                 +'     </div>'
                 +'     <div class="timeline-body"></div>'
                 +'  </div>'
                +'</li>').appendTo(castElement);

            if ( cast.character ) {
                var character = ( cast.character.length > 20 ) ? cast.character.slice(0,20) + "..." : cast.character;
                item.find('.timeline-body').append('<p><span class="label label-default">as '+ character + '</span></p>');
            }

            item.click(function(){
                redirect( "person", cast.id );
            });

        });

    }, function(){});
}

Movie.renderTrailer = function (config, trailerElement, movieID ) {

    theMovieDb.movies.getTrailers({"id":movieID}, function(resp){

        var trailer = $.parseJSON(resp);

        if ( trailer.youtube && trailer.youtube.length > 0 ) {
            if ( trailer.youtube[0].source ) {
                trailerElement.children('iframe').attr( { "src": "//www.youtube.com/embed/" + trailer.youtube[0].source } );
            }
        } else {
            trailerElement.empty();
            trailerElement.css({
                'background' : 'url( img/no_video_available.gif ) no-repeat center center local'
            });
        }

    }, function(){});
}