let data = lib220.loadJSONFromURL('https://people.cs.umass.edu/~joydeepb/yelp.json');

class FluentRestaurants{
  constructor(jsonData) {
    this.data = jsonData;
  }
  fromState(stateStr){
    return new FluentRestaurants(this.data.filter(function (x){
      if(x.hasOwnProperty('state')){
        return (x.state === stateStr);
      }
      return false;
    }));
  }
  ratingLeq(rating){
    return new FluentRestaurants(this.data.filter(function (x){
         if(x.hasOwnProperty('stars')){
           return (x.stars <= rating);
         }
         return false;  
      }));
  }
  ratingGeq(rating){
      return new FluentRestaurants(this.data.filter(function (x){
         if(x.hasOwnProperty('stars')){
           return (x.stars >= rating);
         }
         return false; 
      }));
  }
  category(categoryStr){
    return new FluentRestaurants(this.data.filter(x => x.categories.includes(categoryStr)));
  }  
  hasAmbience(ambienceStr){
    return new FluentRestaurants(this.data.filter(function (x){
      if(x.hasOwnProperty('attributes')){
      if(x.attributes.hasOwnProperty('Ambience') && x.attributes.Ambience.hasOwnProperty(ambienceStr)){
          return lib220.getProperty(x.attributes.Ambience, ambienceStr).value === true;
        }
      }
      return false;
    }));
  }
  bestPlace(){
    let a = new FluentRestaurants(this.data.filter(x => lib220.getProperty(x,'stars').found));
    return a.data.reduce(function (oldVal,newVal){
        if(lib220.getProperty(newVal,'stars').value > lib220.getProperty(oldVal,'stars').value){
         return newVal;
        }else if(lib220.getProperty(newVal, 'stars').value === lib220.getProperty(oldVal,'stars').value){
          if(lib220.getProperty(newVal,'review_count').found === true && lib220.getProperty(oldVal,'review_count').found === true){
            if(lib220.getProperty(newVal,'review_count').value > lib220.getProperty(oldVal,'review_count').value){
              return newVal;
            }
          }else if(lib220.getProperty(newVal,'review_count').found === true){
            return newVal;
        }
      }
      return oldVal;
    },a.data[0]);
  }
  mostReviews(){
      let a = new FluentRestaurants(this.data.filter(x => lib220.getProperty(x,'review_count').found));
      return a.data.reduce(function (oldVal,newVal){
        if(lib220.getProperty(newVal,'review_count').value > lib220.getProperty(oldVal,'review_count').value){
         return newVal;
        }else if(lib220.getProperty(newVal, 'review_count').value === lib220.getProperty(oldVal,'review_count').value){
          if(lib220.getProperty(newVal,'stars').found === true && lib220.getProperty(oldVal,'stars').found === true){
            if(lib220.getProperty(newVal,'stars').value > lib220.getProperty(oldVal,'stars').value){

              return newVal;
            }
          }else if(lib220.getProperty(newVal,'stars').found === true){
            return newVal;
          }
        }          
      return oldVal;
    },a.data[0]);
  }
}

const testData = [{name: "Applebee's",state: "NC",stars: 4,review_count: 6, attributes:{ Ambience: {romantic: false}}, categories: ["Restaurant", "Chain"]},
  {name: "China Garden",state: "NC",stars: 4,review_count: 10, attributes:{ Ambience: {romantic: true}}, categories: ["Restaurant", "Chinese"]},
  {name: "Beach Ventures Roofing",state: "AZ",stars: 3,review_count: 30, categories: ["Home", "Cleaning"]},
  {name: "Alpaul Automobile Wash",state: "NC",stars: 3,review_count: 30, categories: ["Auto", "Cleaning"]}];

let f = new FluentRestaurants(testData);
test('fromState filters correctly', function() {
  let tObj = new FluentRestaurants(testData);
  let list = tObj.fromState('NC').data;
  assert(list.length === 3);
  assert(list[0].name === "Applebee's");
  assert(list[1].name === "China Garden");
  assert(list[2].name === "Alpaul Automobile Wash");
});
test('bestPlace tie-breaking', function() {
  let tObj = new FluentRestaurants(testData);
  let place = tObj.fromState('NC').bestPlace();
  assert(place.name === 'China Garden');
});
test('Correct lower rating', function(){
  let tObj = new FluentRestaurants(testData);
  let place = tObj.ratingLeq(3).data;
  assert(place[0].name === "Beach Ventures Roofing");
  assert(place[1].name === "Alpaul Automobile Wash");
});
test('Correct greater rating', function(){
  let tObj = new FluentRestaurants(testData);
  let place = tObj.ratingGeq(4).data;
  assert(place[0].name === "Applebee's");
  assert(place[1].name === "China Garden");
});
test('Correct Categories', function(){
  let tObj = new FluentRestaurants(testData);
  let place = tObj.category('Restaurant').data;
  assert(place[0].name === "Applebee's");
  assert(place[1].name === "China Garden");
});
test('Shared categories', function(){
  let tObj = new FluentRestaurants(testData);
  let place = tObj.category('Auto').data;
  assert(place[0].name !== "Beach Ventures Roofing");
});
test('Incorrect Categories', function(){
  let tObj = new FluentRestaurants(testData);
  let place = tObj.category('Autos').data;
  assert(place.length === 0);
});
test('Correct Ambience', function(){
  let tObj = new FluentRestaurants(testData);
  let place = tObj.hasAmbience('romantic');
  assert(place.data[0].name === "China Garden");
});
test('Shared Ambiences', function(){
  let tObj = new FluentRestaurants(testData);
  let place = tObj.hasAmbience('romantic');
  assert(place.data.length === 1);
});
test('Incorrect Ambience', function(){
 let tObj = new FluentRestaurants(testData);
  let place = tObj.hasAmbience('Terrifying');
  assert(place.data.length === 0);
});
