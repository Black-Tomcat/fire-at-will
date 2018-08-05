export default class Fleet {
    constructor(
        spaceships=[],
        player=false
    ) {
        this.player = player;

        this.spaceships = []
    }

    addNewSpaceship = (spaceship) => {
        this.spaceships.push(spaceship);
    }
}