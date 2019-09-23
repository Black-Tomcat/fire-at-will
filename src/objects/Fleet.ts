import GameComponent from "components";
import gameObject, {ObjectName, Spaceship} from "objects";
import GameCore from "core/GameCore";


export default class Fleet extends gameObject{
    private player: boolean;
    public readonly spaceships: Spaceship[];

    constructor(
        gameCore: GameCore,
        player=false
    ) {
        super(gameCore, "Fleet");
        this.player = player;

        this.spaceships = []
    }

    addNewSpaceship = (spaceship: Spaceship) => {
        this.spaceships.push(spaceship);
    };

    get components(): GameComponent[] {
        return [];
    }

    cleanUp(gameCore: GameCore): void {}
}