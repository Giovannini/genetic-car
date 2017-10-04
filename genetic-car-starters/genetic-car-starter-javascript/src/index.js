/* eslint-disable no-console */

import fetch from 'node-fetch';
import { randomCar, toView, fromView } from './car';

// const host = 'http://genetic-car.herokuapp.com';
const host = 'http://localhost:9000';
const team = 'ORANGE'; // RED, YELLOW, BLUE, GREEN, ORANGE, PURPLE
const url = `${host}/simulation/evaluate/${team}`;

async function evaluate(cars) {
  const options = {
    method: 'POST',
    body: JSON.stringify(cars),
    headers: { 'Content-Type': 'application/json' },
  };

  try {
    const response = await fetch(url, options);
    if (response.ok) {
      const data = await response.json();
      // eslint-disable-next-line no-confusing-arrow
      const champion = data.reduce((a, b) => a.score >= b.score ? a : b);
      console.log('Mon champion est ', champion);
      return data;
    } else {
      console.error('request failed: ', response.status, response.statusText);
    }
  } catch (e) {
    console.error(e);
  }
}


async function run() {
  let currentGeneration = [];
  for (let i = 0; i < 20; i += 1) {
    currentGeneration.push(randomCar())
  }

  await loop(currentGeneration, 0);
}

async function loop(currentGeneration, n) {
  if (n > 1000) {
    console.log("End of the algorithm")
    return;
  } else {
    const carsWithScore = await evaluate(currentGeneration.map(toView));
    const selectedCars = rankedSelect(carsWithScore); // 16
    const crossedCars = cross(selectedCars.map(fromView));
    console.log("CROSSEDCARS", crossedCars)
    const mutatedCars = mutateN(crossedCars);
    console.log('Mutated cars ', mutatedCars);
    console.log('CURRENT', currentGeneration);
    const newGeneration = addBest(mutatedCars, carsWithScore);
    console.log('Next generation is: ', newGeneration);
    return loop(newGeneration, n+1);
  }
}

function select(carsWithScore) {
  // console.log('Selecting cars', carsWithScore);
  const arrayLength = carsWithScore.length
  const sortedScoredCars = carsWithScore.sort((a, b) => a.score - b.score)
  return sortedScoredCars.slice(0, arrayLength * 0.8)
}

function rankedSelect(carsWithScore) {
  const arrayLength = carsWithScore.length;
  const sortedScoredCars = carsWithScore.sort((a, b) => a.score - b.score);
  const rankedCars = sortedScoredCars
    .map((car, index) => Array.fillr, index / sum1To(arrayLength))
  return sortedScoredCars.slice(0, arrayLength * 0.8)
}

function sum1To(n) {
  if(n>0) return n + sum1To(n-1);
  else return 0
}

function cross(cars) {
  // console.log('Crossing cars', cars);
  var arrays = [], size = 2;

  while (cars.length > 0)
    arrays.push(cars.splice(0, size));

  console.log("arrays", arrays);

  return arrays.map((pair) => {
    return crossCars(pair);
  }).reduce((a, b) => [...a, ...b]);
}

function crossCars(cars) {
  let car1 = toView(cars[0])
  let car2 = toView(cars[1])

  car1.chassis = car2.chassis
  car2.wheel1 = car1.wheel1
  car1.wheel2 = car2.wheel2

  return [fromView({car: car1}), fromView({car: car2})];
}

function mutateN(cars) {
  // console.log('Mutating cars', cars);
  const randomIndex = Math.floor(Math.random()*16);
  return cars.map((car, i) => {
    if (i === randomIndex){
      const mutatedCar = mutate(car);

      return mutatedCar;
    }
    else{
      return car;
    }
  });
}

function mutate(car) {
  const random = randomCar();
  console.log('random car', random);
  console.log(car);
  return car.map(function (num, idx) {
    const result = (num + random[idx]) / 2;
    return result;
  })
}

function addBest(newGeneration, oldGenerationWithScore) {
  console.log('Adding bests cars', newGeneration);
  const sortedOldGeneration = oldGenerationWithScore.sort((a, b) => a.score - b.score);
  console.log('sortedOldGeneration', sortedOldGeneration);
  return [
    ...newGeneration,
    fromView(sortedOldGeneration[0]),
    fromView(sortedOldGeneration[1]),
    fromView(sortedOldGeneration[18]),
    fromView(sortedOldGeneration[19])
  ];
}

run();













