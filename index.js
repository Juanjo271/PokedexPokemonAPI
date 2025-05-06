import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

//https://pokeapi.co/api/v2/pokemon?limit=151%27

const app = express();
const port = 3000;
const API_URL = "https://pokeapi.co/api/v2/pokemon?limit=151%27";
const IMAGE_URL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/";
const POKEMONDATA_URL = "https://pokeapi.co/api/v2/pokemon/";
const POKEMONPOKEDEX_URL = "https://pokeapi.co/api/v2/pokemon-species/";
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req, res) => {  
  
    try {
        const result = await axios.get(`${API_URL}`);
        var pokemonList = addData(result.data.results);
        console
        res.render("index.ejs", { pokemons: pokemonList});
    } catch (error) {
        res.render("index.ejs", { secret: JSON.stringify(error.response.data), user: JSON.stringify(error.response.data)});
    }

});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

  app.get("/pokemon/:id", async (req, res) => {
    const pokeID = parseInt(req.params.id);
    try {
        const result = await axios.get(`${POKEMONDATA_URL}${pokeID}`);
        const resultDex = await axios.get(`${POKEMONPOKEDEX_URL}${pokeID}/`);
        const flavor = resultDex.data.flavor_text_entries.find(entry => entry.language.name === "en");
        var pokemonList = result.data;  
        pokemonList.dexEntry = flavor ? flavor.flavor_text.replace(/\f/g, ' ') : "No description available";
        res.render("cardInfo.ejs", { pokemon: pokemonList });  
    } catch (error) {
        res.render("cardInfo.ejs", { secret: JSON.stringify(error.response), user: JSON.stringify(error.response) });
    }
});

function addData(pokemonsList){

    for(let i =0; i<pokemonsList.length; i++){
        pokemonsList[i].img = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${i + 1}.png`;
        pokemonsList[i].id=i+1;
    }

    return pokemonsList;
}


app.post("/pokemon/search", async (req, res) => {
    const forSearch = req.body.search.toLowerCase();
    try {
        const response = await axios.get(API_URL);
        const fullList = addData(response.data.results);
        const filtered = fullList.filter(p => p.name.includes(forSearch));
        res.render("index.ejs", { pokemons: filtered });
    } catch (error) {
        res.render("index.ejs", { pokemons: [], error: "Error al buscar Pokémon" });
    }
});
