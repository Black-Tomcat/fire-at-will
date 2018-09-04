import gameObject from "./gameObject";

export default class Fleet extends gameObject{
    constructor(
        gameCore,
        player=false
    ) {
        super(gameCore);
        this.player = player;

        this.spaceships = []
    }

    addNewSpaceship = (spaceship) => {
        this.spaceships.push(spaceship);
    }

    toString() {
        return 'fleet';
    }
}