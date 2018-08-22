# Fire At Will
A game about shooting lots of things in space.

---

## Getting Started
1. Clone the repository.
2. run `yarn` within the directory it was cloned to.
3. run `yarn run quickstart` to webpack all needed files, and to run the electron shell

## What This Is
Fire At Will is a game around something so taken for granted by science fiction. Firing Patterns. In this game, you can control which bullets to fire, when or where they should detonate, their fire rate, and much more! This is also combined with a ship editor to give you full control over how you and your fleet approach a problem, rather then being binded to a set of ships and guns provided to you by the game.

## Core Mechanics
### Fully Customisable Fire Patterns 
### Fully Customisable Ships
### Develop Your Own Weapons
And probably much more to come.

## Decisions I've Made
This is a section where I can put things I've thought about, and is probably likely to change. It's probably also a good staging ground for my thoughts, so best to keep that in mind.
### Factories vs Inline creation | Resolution: Inline
While Cohesion will likely suffer, the coupling is inherently decreased a large amount. The usage of inline creation also slightly increases coupling between each class and it's object, but due to the nature of hooking it up via the gameCore, it decreases it in a respective manner between gameCore and the game objects.
##### Pros/Cons for Factories
Pros:
- Delegate the need for things like sprite management within the constructor to the factory
- Separate Game Object from the gameCore.
This may be redundant as PhysicsComponents may need access to the gameCore in order to perform collision detection, etc.
Cons:
- Resource is allocated to the gameCore due to necessity
- Singleton
##### Pros/Cons for Inline
Pros:
- Resource is constructed wherever it needs to be
- Allows for shift to be done other
Cons
- Constructor needs access to gameCore.
Could also be necessary to be the case for components in the future.
- Can become cumbersome and clunky

## Technical Notes
This project was created with a mix of React and a few other fancy features, including optional chaining. Below is a list of all syntactic sugars I've used.
- React
- ECMA 2016
- Transforming Decorators with Babel, (IE, using the '@' notation)
- Optional Chaining
