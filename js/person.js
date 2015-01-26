
var Person = {};

Person.render = function ( config, personItem ) {

    var component = $("<div>");

    component.load( "person.html", function() {


        theMovieDb.people.getById({ "id": personItem.id }, function( resp ){

            var person = $.parseJSON(resp);
            var coverSize = config["images"]["profile_sizes"][1];
            var imageURL = ( person.profile_path !== null ) ? config["images"]["base_url"] + coverSize + person.profile_path : "";

            component.find('#img-cover').attr( { 'src': imageURL, 'alt': person.name } );
            component.find('#person-name').text( person.name );
            component.find('#person-place_of_birth').text( person.place_of_birth );
            component.find('#person-biography').text( person.biography );

            var caption = component.find('#img-caption');

            if ( person.also_known_as[0] ) {
                caption.append( '<br/><span class="label label-primary">known as: ' + person.also_known_as[0] +' </span><br/>');
            }

            if ( person.birthday ) {
                caption.append( '<br/><span class="label label-primary">birthday: ' + person.birthday +' </span><br/>');
            }

            if ( person.popularity ) {
                caption.append( '<br/><span class="label label-success">popularity: ' + person.popularity.toFixed(2) +'</span><br/>');
            }

            if ( person.adult ) {
                caption.append( '<br/><span class="label label-danger">Adult Actor</span><br/>');
            }

            if ( person.homepage ) {
                caption.append( '<br/><br/><span class="label label-warning"><a href="' + person.homepage + '">Homepage</a></span>' );
            }

            theMovieDb.people.getMovieCredits({"id":personItem.id}, function(resp){

                var credits = $.parseJSON(resp);

                // Known For..

                var known_for = component.find('#person-known_for');
                var movies = credits.cast.slice(0,4);

                $.map( movies, function ( movie ) {

                    var posterURL = ( movie.poster_path ) ? config["images"]["base_url"] + config["images"]["poster_sizes"][2] + movie.poster_path : "";

                    item = $(
                        '<div class="col-sm-6 col-md-3">'
                            + '<div class="thumbnail">'
                                + '<img class="shadow" alt="' + movie.title + '" title="' + movie.title + '" src="' + posterURL + '">'
                                + '<div class="caption">'
                                + '   <p>' + movie.title + '</p>'
                            + ' </div></div></div>'
                    ).appendTo(known_for);

                    item.click(function(){
                        showMovie( movie );
                    });

                });


                var filmography = component.find("#filmography");

                var sortByDate = function(a, b) {
                    var aInt = parseInt( (a.release_date) ? a.release_date.slice(0,4) : 0 );
                    var bInt = parseInt( (b.release_date) ? b.release_date.slice(0,4) : 0 );
                    return bInt-aInt;
                }

                credits.cast.sort(sortByDate);

                // Filmography

                $.map( credits.cast, function ( movie ) {

                    var size = config["images"]["poster_sizes"][0];
                    var imageURL = ( movie.poster_path ) ? config["images"]["base_url"] + size + movie.poster_path : "";

                    var item = $(
                        '<li class="timeline-inverted">'
                         +'<div class="timeline-badge warning">' + movie.release_date.slice(0,4) + '</div>'
                         +'  <div class="timeline-panel">'
                         +'     <img src="' + imageURL + '" class="img-responsive">'
                         +'     <div class="timeline-heading">'
                         +'        <h5 class="timeline-title">' + movie.title + '</h5>'
                         +'     </div>'
                         +'     <div class="timeline-body"></div>'
                         +'  </div>'
                        +'</li>').appendTo(filmography);

                    if ( movie.character ) {
                        var character = ( movie.character.length > 20 ) ? movie.character.slice(0,20) + "..." : movie.character;
                        item.find('.timeline-body').append('<p><span class="label label-default">as '+ character + '</span></p>');
                    }

                    item.click(function(){
                        redirect( "movie", movie.id );
                    });

                });



            }, function(){});





        }, function(){} );





    });

    return component;
}