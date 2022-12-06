//packages
const express = require("express"); //Stringeract with html file
const bodyParser=require("body-parser"); //to get data from user
const mongoose=require("mongoose"); //package to connect to db
const multer = require('multer');//package to upload and fetch images
const fs=require("fs");//package to read files given by the user
const hbs=require("express-handlebars");//used for hbs file soo as to use js componenets for displaying images

mongoose.connect("mongodb+srv://jevil2002:aaron2002@jevil257.lipykl5.mongodb.net/Foodism",{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    //useCreateIndex:true
}).then(()=>{
    console.log("connection sucessfull");
}).catch((e)=>{
    console.log(e);
});


// db declaration
const foodcountrySchema=new mongoose.Schema({
    continent_id:{
        type:Number,
        required:true,
        unique:true
    },
    continent_name:{
        type:String,
        required:true,
        unique:true
    }
});

const recipesSchema=new mongoose.Schema({
    recipe_name:{
        type:String
    },
    recipe_pic:{
        type:String
    },
    recipe_description:{
        type:String
    },
    recipe_id:{
        type:Number,
        unique:true,
        required:true
    },
    tag_id:{
        type:Array
    },
    continent_id:{
        type:Number,
        required:true,
        unique:true
    },
    preptime:{
        type:Number,
        required:true
    },
    cooktime:{
        type:Number,
        required:true
    },
    servings:{
        type:Number
    },
    recipe_ingredients:{
        type:Array,
        required:true
    },
    recipe_steps:{
        type:Array,
        required:true
    },
    nutrition_id:{
        type:Number
    }
})

const foodtagSchema=new mongoose.Schema({
    tag_id:{
        type:Number,
        required:true,
        unique:true
    },
    tag_name:{
        type:String,
        required:true,
        unique:true
    }
});

const nutritionSchema=new mongoose.Schema({
    nutrition_id:{
        type:Number,
        required:true,
        unique:true
    },
    calories:{
        type:Number
    },
    fat:{
        type:Number
    },
    Carbs:{
        type:Number
    },
    protein:{
        type:Number
    }
});

const Continents = new mongoose.model("Continents", foodcountrySchema);
const Recipe=new mongoose.model("Recipes",recipesSchema);
const Tags=new mongoose.model("Tags",foodtagSchema);
const nutrition=new mongoose.model("Nutrition",nutritionSchema);



module.exports={Continents,Recipe,Tags,nutrition}; //sends data to database


const app=express();
app.use(express.static(__dirname));
const path=__dirname+"/views";
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());


app.listen(3000,function(){
    console.log("server is live on 3000")
});

app.get('/',function(req,res){ //used to identify user sessions
    res.sendFile(path+"/index.html");
});

app.post("/index",function(req,res){
    res.sendFile(path+"/index.html");
    // global_id=null;
});

app.post("/recipes",async function(req,res){
    app.set('view engine','hbs');
    console.log(req.body.continent);
    let recipes= await Recipe.aggregate([
        {
            '$lookup': {
                'form': 'continents',
                'localField':'continent_id',
                'foreignField': 'continent_id',
                'as': 'continentDetails'
            }
        }
    ])
})


app.post("/singlerecipe",async function(req,res){
    app.set('view engine', 'hbs') //view engine for handlebars page
    let recipes=await Recipe.aggregate( [
        {
          '$lookup': {
            'from': 'Nutrition', 
            'localField': 'nutrition_id', 
            'foreignField': 'nutrition_id', 
            'as': 'nutriton_details'
          }
        }, {
          '$addFields': {
            'calories': {
              '$arrayElemAt': [
                '$nutriton_details.calories', 0
              ]
            }, 
            'fat': {
              '$arrayElemAt': [
                '$nutriton_details.fat', 0
              ]
            }, 
            'carbs': {
              '$arrayElemAt': [
                '$nutriton_details.carbs', 0
              ]
            }, 
            'protein': {
              '$arrayElemAt': [
                '$nutriton_details.protein', 0
              ]
            }
          }
        }, {
          '$unset': [
            'nutrition_id', '_id', 'recipe_id', 'nutriton_details', '__v'
          ]
        }, {
          '$lookup': {
            'from': 'tags', 
            'localField': 'tag_id', 
            'foreignField': 'tag_id', 
            'as': 'tagResult'
          }
        }, {
          '$addFields': {
            'tags': [
              {
                '$arrayElemAt': [
                  '$tagResult.tag_name', 0
                ]
              }, {
                '$arrayElemAt': [
                  '$tagResult.tag_name', 1
                ]
              }, {
                '$arrayElemAt': [
                  '$tagResult.tag_name', 2
                ]
              }, {
                '$arrayElemAt': [
                  '$tagResult.tag_name', 3
                ]
              }
            ]
          }
        }, {
          '$unset': [
            'tag_id', 'tagResult','continent_id'
          ]
        }
      ] )
      console.log(recipes)
    res.render(path+"/single-recipe.hbs",{recipe:recipes},);
})