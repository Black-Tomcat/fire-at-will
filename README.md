# Fire At Will

[![](https://img.shields.io/github/license/Black-Tomcat/fire-at-will.svg)](https://github.com/Black-Tomcat/fire-at-will/blob/master/LICENSE)
[![](https://img.shields.io/github/repo-size/Black-Tomcat/fire-at-will.svg)](https://github.com/Black-Tomcat/fire-at-will/)
[![](https://img.shields.io/github/last-commit/Black-Tomcat/fire-at-will.svg)](https://github.com/Black-Tomcat/fire-at-will/)

Fire At Will is a game around something so taken for granted by science fiction. Firing Patterns. In this game, you can control which bullets to fire, when or where they should detonate, their fire rate, and much more! This is also combined with a ship editor to give you full control over how you and your fleet approach a problem, rather then being binded to a set of ships and guns provided to you by the game.

## Core Mechanics

* **Fully Customisable Fire Patterns**
* **Fully Customisable Ships**
* **Develop Your Own Weapons**
* ***And probably much more to come.***


---

## Task
 - [ ] 
 - [ ] 
 - [ ] Semantic versioning
 - [ ] 
## Contributing
Fire At Will is a game that is open to anyone adding features and contributing to the code. This project is designed to be a playground to let people test and develop their skills towards many different paths.  

### Code of Conduct
In short, do not disrespect, demean, bully, or otherwise threaten or hurt people under any circumstance, whether it be race, sexuality, gender, creed, experience, or any other property of person not specified here. This is a community that involves and embraces all people.

### Open Development
All development for this project goes through the GitHub. All persons working on this project are subject to the same procedures for code contributions.

### Branch Organization
While the master branch has not been in good shape as of recent, master will be soon reserved for builds that pass all tests and are able to be deployed to a working environment.

If you are to send a pull request, please do so against master. Branches for other releases will be maintained seperately, but no pull requests will be accepeed for them. Features will be cherry picked from master and put into the latest stable major version.

### Bugs
Bugs should be submitted to the GitHub Issues. The best way to submit the bug would be to describe what happened and when it broke.

### Proposing a Change
If there is a requested change you wisht to see implemented, the best process would be to submit an issue. Talk with us before you start working on it seriously. 

### Your First Pull Request

### Sending a Pull Request

### Contribution Prerequisites

### Development Workflow

### Style Guide

---

## Getting Started
1. Clone the repository.
2. run `yarn` within the directory it was cloned to.
3. run `yarn run quickstart` to webpack all needed files, and to run the electron shell

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

Cons:
- Constructor needs access to gameCore.
Could also be necessary to be the case for components in the future.
- Can become cumbersome and clunky

---

### Semi 4X vs Ship Creation Game vs Direct Control of Fleet | Resolution: 4X and Creation
Creating the latter section first allows for the game to be polished in such a way that the 4X and story can be provided as a wrapper. Heavier emphasis on player control during battles may remove from the experience of the 4x.
#### Pros/Cons for 4X
Pros:
- Can integrate with either Creation or Direct Control.
- Adds a level of strategy on top
- More easily integrate with story aspects.

Cons: 
- A hella lot more work
- Integrating multiple systems like this may be worthy of another project completely.


#### Pros/Cons for Creation Emphasis 
Pros:
- AI gameplay battles can be pretty cool.
- Keeps the game simple.

Cons: 
- May require fancy graphics tools to ensure it works in a fulfilling manner
- Still lacks my enjoyment for 4X
- Kind of rubbish as a game by itself.

#### Pros/Cons for Direct Control
Pros: 
- Can be more engaging

Cons:
- Can subtract from other experiences
- Some sort of AI substitute will still have to be developed.
- Still not as good just on it's own.


## Technical Notes
This project was created with a mix of React and a few other fancy features, including optional chaining. Below is a list of all syntactic sugars I've used.
- React
- ECMA 2016
- Transforming Decorators with Babel, (IE, using the '@' notation)
- Optional Chaining (the '?.' notation when looking up properties.)
