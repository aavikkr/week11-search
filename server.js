const express = require("express");
const axios = require("axios");

const app = express(); //loome äpi
app.set("view engine", "ejs");
app.use(express.static("public")); //et kasutaks css faili
app.use(express.urlencoded({ extended: true })); // kuidas andmeid lahti lugeda

app.get("/search", (req, res)=> {
    res.render("search", {movieDetails:"" }); //tahan saata search.ejs faili; võtab movieDetails andmed
});

app.post("/search", (req, res)=> {
    let userMovieTitle = req.body.movieTitle; //kasutaja sisestatud pealkiri
    console.log(userMovieTitle);

    //siit tuleb kogu filmi info,aga žanrid on kodeeritud
    let movieUrl= `https://api.themoviedb.org/3/search/movie?api_key=6a6c8ee1cff0ffdd4d8f2e87490dfa98&query=${userMovieTitle}`;
    //siin on api võtmed žanri koodidele
    let genresUrl = "https://api.themoviedb.org/3/genre/movie/list?api_key=6a6c8ee1cff0ffdd4d8f2e87490dfa98&language=en-US";

    //pakime lingid ühte massiivi kokku
    let endpoints = [movieUrl, genresUrl];

    axios.all(endpoints.map((endpoint) => axios.get(endpoint))) //oskab kasutada kõiki endpointe, map teeb midagi andmetega
    .then(axios.spread((movie, genres) => {
        const [movieRaw] = movie.data.results;
        //console.log(movie.data.results);

        let movieGenreIds = movieRaw.genre_ids; //konkreetsele filmile kuuluvad žanrid
        let movieGenres = genres.data.genres; //kõik žanrid TMDB andmebaasis
        let movieGenresArray = []; //peame võrdlema kahte eelmist ja salvestame ainult selle filmi žanrid, mis tal on
        
        for (let i = 0; i < movieGenreIds.length; i++) { //loop'ib läbi selle filmi žanrid
            for(let j = 0; j < movieGenres.length; j++) {//loop'ib läbi kõik TMDB žanrid
                if(movieGenreIds[i] === movieGenres[j].id){ 
                    movieGenresArray.push(movieGenres[j].name);
                }
            }
        }

        let genresToDisplay = "";
        movieGenresArray.forEach(genre => { //genres on jsonist, peame läbi loop'ima, genre on elemendi nimi, mille ise panime
            genresToDisplay = genresToDisplay + `${genre}, `; //koma lisab loetelu vahele koma ja järel on tühik
            //console.log(genresToDisplay);
        });

        genresToDisplay = genresToDisplay.slice(0, -2) + ".";

        let movieData = {
            title: movieRaw.title, 
            year: new Date(movieRaw.release_date).getFullYear(), 
            genres: genresToDisplay,
            overview: movieRaw.overview,
            posterUrl: `https://images.tmdb.org/t/p/w500${movieRaw.poster_path}`
        };

    res.render("search", {movieDetails: movieData}); //movie details objekti salvestame kõik movieData andmed
}));

});

app.listen(process.env.PORT || 5000, () => { //äpp ootab päringuid
    console.log("Server is running");

});